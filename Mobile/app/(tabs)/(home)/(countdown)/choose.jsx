import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";
import { Image, ImageBackground } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';
import { DARKTHEME, LIGHTTHEME } from "../../../../constants/Colors";

const backendURI = Constants.expoConfig.extra.backendURI;
const { width } = Dimensions.get('window');

export default function ChangeSpotlightScreen() {
  const router = useRouter();
  const isdark = useColorScheme() === "dark";
  const THEME = isdark ? DARKTHEME : LIGHTTHEME;
  const styles = createStyles(THEME, isdark);

  const [selected, setSelected] = useState(0);
  const [todaysImages, setTodaysImages] = useState([]);
  const [original, setOriginal] = useState(null);

  const handleUpdate = async () => {
    if (todaysImages[selected]?.userpostid !== original) {
      try {
        const jwt = await AsyncStorage.getItem("jwt");

        await fetch(`${backendURI}/Post/changeSpotlight`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': jwt
          },
          body: JSON.stringify({
            postID: todaysImages[selected].userpostid
          })
        });

        router.back();
      } catch (error) {
        console.error(error);
        router.back();
      }
    }
  };

  const refresh = async () => {
    try {
      const jwt = await AsyncStorage.getItem("jwt");

      const raw = await fetch(`${backendURI}/Post/getChoosePosts`, {
        method: "GET",
        headers: { Authorization: jwt }
      });

      const response = await raw.json();

      if (response.specialPost >= 0) {
        setSelected(response.specialPost);
        setOriginal(response.allPosts[response.specialPost].userpostid);
      }

      setTodaysImages(response.allPosts);
    } catch (error) {
      console.log(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [])
  );

  const renderShot = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.shotContainer,
        index === selected && styles.selectedShot
      ]}
      onPress={() => setSelected(index)}
    >
      <Image
        source={{ uri: item.imgurl }}
        style={styles.shotImage}
        cachePolicy="memory-disk"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={THEME.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Change Spotlight</Text>

        <TouchableOpacity onPress={handleUpdate}>
          <Ionicons name="checkmark" size={24} color={THEME.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={todaysImages}
        keyExtractor={(_, index) => index.toString()}
        numColumns={3}
        ListHeaderComponent={() => (
          <View style={{ paddingHorizontal: 20, alignItems: "center" }}>
            <ImageBackground
              source={{
                uri: todaysImages.length > 0
                  ? todaysImages[selected].imgurl
                  : null
              }}
              style={styles.spotlightCard}
              imageStyle={{ borderRadius: 20 }}
            >
              {/* subtle overlay for readability */}
              <View style={styles.overlay} />

              <View style={styles.currentBadge}>
                <Ionicons name="star" size={14} color={THEME.bg} />
                <Text style={styles.currentBadgeText}>CURRENT SPOTLIGHT</Text>
              </View>

              <View style={styles.spotlightTextContainer}>
                <Text style={styles.spotlightTitle}>
                  {todaysImages.length > 0
                    ? todaysImages[selected].caption
                    : ""}
                </Text>
              </View>
            </ImageBackground>

            <View style={styles.shotsHeader}>
              <Text style={styles.shotsTitle}>TODAY'S SHOTS</Text>
            </View>
          </View>
        )}
        renderItem={renderShot}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={() => (
          <View style={styles.footerInfo}>
            <Text style={styles.footerText}>
              Choose your best shot to highlight for your friends. Your spotlight resets at the end of the day.
            </Text>

            <TouchableOpacity
              style={styles.floatingCamera}
              onPress={() => router.push("newupload")}
            >
              <MaterialCommunityIcons
                name="camera-plus"
                size={24}
                color={THEME.bg}
              />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

function createStyles(THEME, isdark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: THEME.bg,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: "space-between",
      padding: 20,
      marginTop: 10,
    },

    headerTitle: {
      color: THEME.text,
      fontSize: 20,
      fontWeight: '700',
    },

    spotlightCard: {
      height: 380,
      width: '100%',
      marginTop: 10,
      overflow: "hidden",
      borderRadius: 20,
      justifyContent: "flex-end",
    },

    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isdark
        ? "rgba(0,0,0,0.35)"
        : "rgba(0,0,0,0.15)",
    },

    currentBadge: {
      backgroundColor: THEME.accent,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginTop: 10,
      marginLeft: 10,
    },

    currentBadgeText: {
      color: THEME.bg,
      fontSize: 12,
      fontWeight: '800',
      marginLeft: 5,
    },

    spotlightTextContainer: {
      padding: 10,
    },

    spotlightTitle: {
      color: "#fff",
      fontSize: 28,
      fontWeight: '800',
    },

    shotsHeader: {
      marginTop: 40,
      marginBottom: 20,
    },

    shotsTitle: {
      color: THEME.text,
      fontSize: 18,
      fontWeight: '700',
    },

    listContent: {
      paddingBottom: 30,
    },

    shotContainer: {
      width: (width - 60) / 3,
      height: (width - 60) / 3,
      marginHorizontal: 10,
      marginBottom: 10,
      borderRadius: 15,
      overflow: 'hidden',
      backgroundColor: THEME.surface,
    },

    selectedShot: {
      borderWidth: 4,
      borderColor: THEME.accent,
    },

    shotImage: {
      width: '100%',
      height: '100%',
    },

    footerInfo: {
      paddingHorizontal: 20,
      marginTop: 30,
      alignItems: 'center',
    },

    footerText: {
      color: THEME.textSoft,
      textAlign: 'center',
      lineHeight: 20,
      opacity: 0.7,
      marginBottom: 30,
    },

    floatingCamera: {
      backgroundColor: THEME.accent,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: "flex-end",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isdark ? 0.3 : 0.15,
      shadowRadius: 5,
    },
  });
}