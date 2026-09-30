import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Constants from "expo-constants";
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View
} from 'react-native';
import { DARKTHEME, LIGHTTHEME } from "../../../../constants/Colors";
import { oneMonthFormat } from '../../../../constants/dateHelper';

const backendURI = Constants.expoConfig.extra.backendURI;

const { width } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const GAP = 10;
const ITEM_WIDTH = (width - (HORIZONTAL_PADDING * 2) - (GAP * 2)) / 3;

function getMonthInt(month) {
  const months = {
    JAN: "01",
    FEB: "02",
    MAR: "03",
    APR: "04",
    MAY: "05",
    JUN: "06",
    JUL: "07",
    AUG: "08",
    SEP: "09",
    OCT: 10,
    NOV: 11,
    DEC: 12
  };

  return months[month.toUpperCase()] || null;
}

export default function HistoryScreen() {
  const isdark = useColorScheme() === "dark";
  const THEME = isdark ? DARKTHEME : LIGHTTHEME;
  const styles = createStyles(THEME, isdark);

  const router = useRouter();
  const {data} = useLocalSearchParams();
  const parsedData = JSON.parse(data);
  const year = parsedData.year;
  const month = parsedData.month;
  
  const [DUMMY_DATA, set_DUMMY_DATA] = useState([]);
  const [avatarImage, setAvatar] = useState(null);
  const [username, setUsername] = useState(null);
  
  const pull = async()=>{
    try {
      const m = getMonthInt(month)
      const jwt = await AsyncStorage.getItem("jwt")
      const raw = await fetch(`${backendURI}/Post/getPostsMonth?monthYear=${year}-${m}`, {
        headers: {
          "Authorization": jwt
        }
      })
      if(!raw.ok){
        return
      }
      const response = await raw.json()
      set_DUMMY_DATA(response)

    } catch (error) {
      console.log(error)
    }
  }

  const getURL = async()=>{
    try {
      const url = await AsyncStorage.getItem("avatarUrl")
      const user = await AsyncStorage.getItem("username")
      setAvatar(url)
      if (user){
        setUsername(user)
      }
    } catch (error) {
      return null
    }
  }

  useFocusEffect(
    useCallback(() => {
      getURL();
      pull();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable hitSlop={10} onPress={()=>{router.back()}}>
          <Feather name="arrow-left" size={24} color={THEME.accent || '#FF7B54'} />
        </Pressable>
        <Text style={styles.headerTitle}>{oneMonthFormat(month, year)}</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitleText}>SEE YOUR CAPTURES</Text>
          <View style={styles.subtitleUnderline} />
        </View>

        <View style={styles.gridContainer}>
          {DUMMY_DATA.map((item, index) => (
            <Pressable key={index} style={styles.gridItem} onPress={()=>{
              const formattedData = {
                heroImage: item.imgurl,
                caption: item.caption,
                badges: item.badges,
                avatar: item.avatarurl,
                postID: item.userpostid ?? item.postID ?? item.postid ?? item.id,
                name: username || "Guest",
                meta: item.date,
                homemade: item.homemade,
                title: item.createdAt.slice(0, 10),
                individualData: {
                  flavor: item.flavor,
                  rating: item.stars,
                  time: item.time,
                  quantity: item.quant 
                }
              };
              router.push({
                pathname: "individualPost",
                params: {
                  data: JSON.stringify(formattedData)
                }
              })
            }}>
              <Image 
                cachePolicy="memory-disk"
                source={{ uri: item.imgurl }} 
                style={styles.image} 
              />
              {item.date != null && (
                <View style={styles.badgeContainer}>
                  <MaterialCommunityIcons 
                    name="star" 
                    size={14} 
                    color={isdark ? "#1A1A1A" : "#FFFFFF"} 
                  />
                </View>
              )}
            </Pressable>
          ))}
        </View>

        <View style={styles.endMarkerContainer}>
          <Feather name="calendar" size={28} color={THEME.textSoft || '#8E8E8E'} style={styles.endIcon} />
          <Text style={styles.endText}>END OF HISTORY</Text>
        </View>
      </ScrollView>

    </View>
  );
}

function createStyles(THEME, isdark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: THEME.bg || (isdark ? '#111211' : '#FFFFFF'),
    },
    scrollContent: {
      paddingBottom: 40,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: HORIZONTAL_PADDING,
      paddingTop: 16,
      paddingBottom: 24,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: THEME.text,
      marginLeft: 16,
      letterSpacing: -0.5,
    },
    subtitleContainer: {
      paddingHorizontal: HORIZONTAL_PADDING,
      marginBottom: 24,
    },
    subtitleText: {
      color: THEME.textSoft || '#8E8E8E',
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 2,
      marginBottom: 8,
    },
    subtitleUnderline: {
      width: 45,
      height: 2,
      backgroundColor: THEME.accent || '#FF7B54',
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: HORIZONTAL_PADDING,
      gap: GAP,
    },
    gridItem: {
      width: ITEM_WIDTH,
      height: ITEM_WIDTH,
      marginBottom: GAP,
      borderRadius: 16,
      backgroundColor: THEME.surface || (isdark ? '#222' : '#F0F0F0'),
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: 14,
    },
    badgeContainer: {
      position: 'absolute',
      top: 6,
      right: 6,
      backgroundColor: THEME.accent || '#FF7B54',
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    endMarkerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 40,
    },
    endIcon: {
      marginBottom: 12,
      opacity: 0.6,
    },
    endText: {
      color: THEME.textSoft || '#8E8E8E',
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 1.5,
      opacity: 0.6,
    },
  });
}