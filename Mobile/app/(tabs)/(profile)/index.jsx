import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { DARKTHEME, LIGHTTHEME } from "../../../constants/Colors";
import { hoursFromNow } from '../../../constants/func';

const backendURI = Constants.expoConfig.extra.backendURI;
const { width } = Dimensions.get('window');
const GRID_SPACING = 16;
const HORIZONTAL_PADDING = 24;
const COLUMN_WIDTH = (width - (HORIZONTAL_PADDING * 2) - GRID_SPACING) / 2;
const DAYS_PER_LOAD = 14;

const formatDateLabel = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

export default function MorsumProfile() {
  const isdark = useColorScheme() === "dark";
  const THEME = isdark ? DARKTHEME : LIGHTTHEME;
  const styles = createStyles(THEME, isdark);

  const router = useRouter();
  const [calendarItems, setCalendarItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [daysOffset, setDaysOffset] = useState(0);
  const [databaseOffset, setDatabaseOffset] = useState(0);
  const [availableSpotlights, setAvailableSpotlights] = useState({});
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [avatarImage, setAvatar] = useState(null);
  const [username, setUsername] = useState(null);
  const [canPull, setCanPull] = useState(true);
  const [JOIN_DATE, set_JOIN_DATE] = useState(null);
  const [startData, setStart] = useState(null);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access your photo library is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const selectedUri = result.assets[0].uri;
        setAvatar(selectedUri);
        await AsyncStorage.setItem('avatarUrl', selectedUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  }

  const handleLogout = async()=>{
    try {
      await AsyncStorage.clear()
      router.replace("/(uauth)")
    } 
    catch (error) {
      router.reload("/(uauth)")
    }
  }

  const getURL = async () => {
    try {
      const url = await AsyncStorage.getItem("avatarUrl");
      const user = await AsyncStorage.getItem("username");
      setAvatar(url);
      if (user) {
        setUsername(user);
      }
    } catch (error) {
      return null;
    }
  };

  useFocusEffect(
    useCallback(() => {
      getURL();
    }, [])
  );

  const loadMoreDays = async (isRefresh = false) => {
    if ((isLoading && !isRefresh) || (hasReachedEnd && !isRefresh)) return;
    console.log("Loading more days...");

    let joinDate = JOIN_DATE;

    if (!joinDate) {
      const date = await AsyncStorage.getItem("createdat");
      if (date) {
        const parsed = new Date(date);
        set_JOIN_DATE(parsed);
        joinDate = parsed;
      } else {
        joinDate = new Date("2025-01-01");
      }
    }

    const boundedJoinDate = new Date(joinDate);
    boundedJoinDate.setDate(boundedJoinDate.getDate() - 2);

    const boundedJoinDateString = boundedJoinDate
      .toISOString()
      .split("T")[0];

    setIsLoading(true);

    try {
      let updatedSpotlights = isRefresh ? {} : { ...availableSpotlights };
      let currentCanPull = isRefresh ? true : canPull;
      let currentDatabaseOffset = isRefresh ? 0 : databaseOffset;
      let currentDaysOffset = isRefresh ? 0 : daysOffset;

      if (Object.keys(updatedSpotlights).length < 5 && currentCanPull) {
        const jwt = await AsyncStorage.getItem("jwt");
        const response = await fetch(
          `${backendURI}/Post/getAllSpotLights?offsetParam=${currentDatabaseOffset}&firstPull=${startData === null}`,
          {
            headers: { Authorization: jwt },
          }
        );

        if (response.ok) {
          const rawJSON = await response.json();
          const fetchedSpotlights = rawJSON.spotlightData
          if (startData === null){
            setStart({
              total: rawJSON.totalSpotlight,
              streak: rawJSON.totalStreak,
              friends: rawJSON.friendCount
            })
          }
          if (Object.keys(fetchedSpotlights).length === 0) {
            setCanPull(false);
            currentCanPull = false;
          } else {
            updatedSpotlights = {
              ...updatedSpotlights,
              ...fetchedSpotlights,
            };
            setDatabaseOffset(currentDatabaseOffset + 1);
          }
        } else {
          setCanPull(false);
          currentCanPull = false;
        }
      }

      const newItems = [];
      let hitJoinDate = false;

      for (let i = 0; i < DAYS_PER_LOAD; i++) {
        const targetDate = new Date(
          (Date.now() + 86400000) - (currentDaysOffset + i) * 86400000
        );
        const dateKey = targetDate.toISOString().split("T")[0];

        if (dateKey < boundedJoinDateString) {
          hitJoinDate = true;
          break;
        }

        let imageUri = null;
        let postData = null;

        if (updatedSpotlights[dateKey]) {
          // FIX: Access the first post in the list for this date (index [0]), 
          // then access the image string ([0]) and post object ([2])
          const dailyPosts = updatedSpotlights[dateKey];
          const firstPost = dailyPosts[0];

          imageUri = firstPost[0];
          const temp = firstPost[2];
          
          const timeago = hoursFromNow(temp.createdAt);
          postData = {
            meta: `${timeago} hours ago`,
            heroImage: temp.imgurl,
            caption: temp.caption,
            individualData: {
              flavor: temp.flavor,
              rating: temp.stars,
              time: temp.time,
              quantity: temp.quant,
            },
            badges: temp.badges,
            homemade: temp.homemade,
            date: temp.date
          };

          delete updatedSpotlights[dateKey];
        }

        newItems.push({
          id: dateKey,
          date: dateKey,
          displayDate: formatDateLabel(dateKey),
          imageUri,
          postData,
        });
      }

      setAvailableSpotlights(updatedSpotlights);
      setCalendarItems(isRefresh ? newItems : (prev) => [...prev, ...newItems]);
      setDaysOffset(currentDaysOffset + newItems.length);

      if (hitJoinDate) {
        setHasReachedEnd(true);
      } else if (isRefresh) {
        setHasReachedEnd(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getURL();
    loadMoreDays(true);
  }, [JOIN_DATE]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Pressable 
        onPress={handleLogout}
        style={{
          width: 55,
          height: 30,
          position: "absolute",
          right: 10,
          top: 10,
          backgroundColor: isdark ? "rgba(255, 135, 98, 0.8)" : "rgba(255, 135, 98, 0.9)",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 50
        }}>
        <Text style={{fontSize: 10, fontWeight: "700", color: isdark ? "#FFF" : "#000"}}>Logout</Text>
      </Pressable>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarBorder}>
            <Pressable
              onPress={handlePickImage}
              style={styles.innerPadding}
            >
              {avatarImage ? <Image
                cachePolicy={"disk"}
                source={{ uri: avatarImage }}
                style={styles.profileImage}
              /> : (
                <View
                  style={{
                    backgroundColor: isdark ? "rgba(255, 135, 98, 0.5)" : "rgba(255, 135, 98, 0.3)",
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Text
                    style={{ color: isdark ? "white" : "#1A1A1A", fontSize: 45 }}
                  >
                    {username ? username[0].toUpperCase() : ""}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        <Text style={styles.userName}>{username}</Text>

        {/* --- NEW FRIENDS PART --- */}
        <Pressable
          onPress={()=>{router.push("friendPage")}}
          style={styles.friendsContainer}
        >
          <MaterialIcons name="people-alt" size={16} color={THEME.textSoft || "#E3E7DE"} />
          <Text style={styles.friendsText}>{startData?.friends} friends</Text>
        </Pressable>

      </View>

      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: THEME.accent || "#FF8762" }]}>{startData?.total}</Text>
          <Text style={styles.statLabel}>TOTAL SPOTLIGHTS</Text>
        </View>

        <View style={styles.statCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.statNumber, { color: THEME.success || "#a0d68c" }]}>{startData?.streak}</Text>
            <MaterialIcons name="whatshot" size={24} color={THEME.success || "#a0d68c"} />
          </View>
          <Text style={styles.statLabel}>DAILY STREAK</Text>
        </View>
      </View>

      <View style={[styles.tab, styles.activeTab]}>
        <Text style={styles.activeTabText}>My Spotlights</Text>
      </View>
    </View>
  );

  const renderGridItem = ({ item }) => {
    if (item.imageUri) {
      return (
        <TouchableOpacity
          onPress={() => {
            let temp = item.postData;
            temp.name = username;
            temp.avatar = avatarImage;
            temp.title = "SPOTLIGHT";
            router.push({
              pathname: "individualPost",
              params: {
                data: JSON.stringify(temp)
              }
            });
          }}
          style={styles.gridItem}
        >
          <Image source={{ uri: item.imageUri }} style={styles.gridImage} />
          <View style={styles.dateOverlay}>
            <Text style={styles.dateText}>{item.displayDate}</Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <View style={[styles.gridItem, styles.emptyGridItem]}>
          <Text style={styles.emptyDateText}>{item.displayDate}</Text>
          <MaterialIcons name="photo-camera" size={24} color={isdark ? "#3a3d38" : "#A0A0A0"} style={{ marginTop: 8 }} />
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={calendarItems}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderGridItem}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        columnWrapperStyle={styles.rowWrapper}
        onEndReached={() => loadMoreDays(false)}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.accent || "#FF8762"}
            colors={[THEME.accent || "#FF8762"]}
          />
        }
        ListFooterComponent={
          isLoading && !hasReachedEnd && !refreshing ? (
            <ActivityIndicator size="small" color={THEME.accent || "#FF8762"} style={{ marginVertical: 20 }} />
          ) : null
        }
      />
    </View>
  );
}

function createStyles(THEME, isdark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: THEME.bg || (isdark ? '#0d0f0c' : '#FFFFFF'),
    },
    headerContainer: {
      paddingBottom: 24,
    },
    profileHeader: {
      alignItems: 'center',
      marginTop: 32,
    },
    avatarContainer: {
      position: 'relative',
      width: 120,
      height: 120,
    },
    avatarBorder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: THEME.accent || '#FF8762',
      justifyContent: 'center',
      alignItems: 'center',
    },
    innerPadding: {
      width: 110,
      height: 110,
      borderRadius: 55,
      overflow: 'hidden',
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },
    userName: {
      marginTop: 24,
      fontSize: 28,
      fontWeight: '800',
      color: THEME.text || (isdark ? '#FFFFFF' : '#1A1A1A'),
    },
    friendsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: THEME.surface || (isdark ? '#141612' : '#F5F5F5'), 
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginTop: 8,
    },
    friendsText: {
      color: THEME.textSoft || (isdark ? '#E3E7DE' : '#666666'),
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6,
      opacity: 0.8,
    },
    statsSection: {
      marginTop: 32,
      flexDirection: 'row',
      paddingHorizontal: HORIZONTAL_PADDING,
      justifyContent: 'space-between',
    },
    statCard: {
      width: COLUMN_WIDTH,
      height: 100,
      backgroundColor: THEME.surface || (isdark ? '#141612' : '#F5F5F5'),
      borderRadius: 16,
      padding: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 32,
      fontWeight: '800'
    },
    statLabel: {
      marginTop: 4,
      fontSize: 11,
      fontWeight: '700',
      color: THEME.textSoft || (isdark ? '#E3E7DE' : '#8E8E8E'),
      opacity: 0.5,
      letterSpacing: 1.1,
    },
    tab: {
      flex: 1,
      justifyContent: 'center',
      borderRadius: 100,
      alignItems: 'center',
      backgroundColor: THEME.accent || 'rgb(255, 135, 98)',
      marginTop: 25,
      marginHorizontal: HORIZONTAL_PADDING,
      height: 48,
    },
    activeTabText: {
      fontSize: 14,
      fontWeight: '700',
      color: isdark ? '#0d0f0c' : '#FFFFFF',
    },
    rowWrapper: {
      justifyContent: 'space-between',
      paddingHorizontal: HORIZONTAL_PADDING,
      marginBottom: GRID_SPACING,
    },
    gridItem: {
      width: COLUMN_WIDTH,
      height: COLUMN_WIDTH,
      borderRadius: 16,
      backgroundColor: THEME.surface || (isdark ? '#1d201c' : '#EAEAEA'),
      overflow: 'hidden',
    },
    gridImage: {
      width: '100%',
      height: '100%',
    },
    dateOverlay: {
      position: 'absolute',
      bottom: 8,
      left: 8,
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    dateText: {
      color: '#FFF',
      fontSize: 12,
      fontWeight: '600',
    },
    emptyGridItem: {
      borderWidth: 2,
      borderColor: isdark ? '#1d201c' : '#E0E0E0',
      backgroundColor: 'transparent',
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyDateText: {
      color: THEME.textSoft || (isdark ? '#3a3d38' : '#A0A0A0'),
      fontSize: 14,
      fontWeight: '700',
    }
  });
}