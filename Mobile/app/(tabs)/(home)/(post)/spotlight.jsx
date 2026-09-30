import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Skeleton } from 'moti/skeleton';
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARKTHEME, LIGHTTHEME } from '../../../../constants/Colors';

const RADII = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 100,
};

export default function YesterdaysSpotlight({
  imageUri, 
  isActive, 
  caption, 
  likes, 
  comments,
  badges,
  flavor,
  rating,
  time,
  quantity,  
  homemade,
  date
}) {
  const [username, setUsername] = useState("")
  const [avatar, setAvatar] = useState("")
  const router = useRouter()
  const isdark = useColorScheme() === "dark"
  const THEME = isdark? DARKTHEME: LIGHTTHEME
  const styles = createStyles(THEME)

  let postData = {
    title: "SPOTLIGHT",
    heroImage: imageUri,
    caption,
    likes,
    comments,
    individualData:{
      flavor,
      rating,
      time,
      quantity
    },
    badges,
    homemade,
    name: username,
    avatar: avatar,
    date
  }

  useFocusEffect(
    useCallback(() => {
      const uName = async () => {
        const name = await AsyncStorage.getItem("username");
        const avatarURL = await AsyncStorage.getItem("avatarUrl");

        if (name) {
          setUsername(name);
        }
        if (avatarURL) {
          setAvatar(avatarURL);
        }
      };

      uName();
    }, [])
  );

  if (imageUri == null) {
    return (
      <View style={styles.yWrap}>
        <View style={styles.yHeaderRow}>
          <Text style={styles.yHeaderText}>YOUR LAST SPOTLIGHT</Text>
        </View>
        <View style={styles.yCard}>
            <Skeleton
              colorMode="dark"
              width={"100%"}
              height={240}
              style={{ alignSelf: "center", borderRadius: 4}}
            />
        </View>
      </View>
    );
  }

  if (imageUri == "nothing") {
    return null
  }

  return (
    <Pressable
      onPress={()=>{router.push({
        pathname: "./individualPost",
        params:{
          data: JSON.stringify(postData)
        }
      })}}
      style={styles.yWrap}
    >
      <View style={styles.yHeaderRow}>
        <Text style={styles.yHeaderText}>YOUR LAST SPOTLIGHT</Text>
      </View>

      <View style={styles.yCard}>
        <Image 
          source={{ uri: imageUri }}
          cachePolicy={"memory"} 
          style={styles.yImage} 
        />

        <View style={{position: "absolute", backgroundColor: "rgba(0, 0, 0, 0.4)", zIndex: 0, width:"100%", height: "100%"}}/>

        <LinearGradient 
          style={styles.yScrim}
          colors={[
            'transparent',
            THEME.bottom,
          ]}
          locations={[0, 0.5]}
        />

        <View style={styles.yOverlay}>
          <View style={styles.yPillsRow}>
            {isActive ? (
              <View style={styles.yActivePill}>
                <Text style={styles.yActivePillText}>ACTIVE</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.yCaption} numberOfLines={2}>{caption}</Text>

        </View>
      </View>
    </Pressable>
  );
}

function createStyles(THEME){
  return(
    StyleSheet.create({
      yWrap: {
        marginTop: 18,
      },
      yHeaderRow: {
        marginHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      },
      yHeaderText: {
        color: THEME.textSoft,
        opacity: 0.5,
        fontSize: 11,
        fontWeight: "700",
        fontFamily: "Inter-Bold",
        letterSpacing: 11 * 0.15,
      },
      yCard: {
        marginTop: 14,
        marginHorizontal: 16,
        borderRadius: RADII.lg,
        overflow: "hidden",
        backgroundColor: THEME.surface,
        position: "relative"
      },
      yImage: {
        width: "100%",
        aspectRatio: 4 / 3,
        backgroundColor: "#2A2D26",
      },
      yScrim: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "35%",
      },
      yOverlay: {
        position: "absolute",
        left: 14,
        right: 14,
        bottom: 14,
      },
      yPillsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      },
      yActivePill: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: RADII.pill,
        backgroundColor: THEME.accent,
      },
      yActivePillText: {
        color: "#1A120F",
        fontSize: 10,
        fontWeight: "900",
        fontFamily: "Inter-ExtraBold",
        letterSpacing: 0.6,
      },
      yCaption: {
        marginTop: 10,
        color: THEME.text,
        fontSize: 20,
        fontWeight: "700",
        fontFamily: "PlusJakartaSans-Bold",
        lineHeight: 26,
        width: "92%",
      },
    })
  )
}