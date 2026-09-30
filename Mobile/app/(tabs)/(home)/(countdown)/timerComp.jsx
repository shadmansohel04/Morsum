import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { Skeleton } from "moti/skeleton";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
const backendURI = Constants.expoConfig.extra.backendURI
import { Dimensions } from 'react-native';
import { DARKTHEME, LIGHTTHEME } from "../../../../constants/Colors";
const { width, height } = Dimensions.get('window');

const RADII = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 100,
};

function getNextUtcMidnightMs() {
  const from = new Date();
  const y = from.getUTCFullYear();
  const m = from.getUTCMonth();
  const d = from.getUTCDate();
  return Date.UTC(y, m, d + 1, 0, 0, 0, 0);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}


function formatRemaining(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad2(hours)} : ${pad2(minutes)} : ${pad2(seconds)}`;
}

export default function TimerComponent({flag, optional}) {
  const router = useRouter();
  const [targetMs, setTargetMs] = useState(getNextUtcMidnightMs());
  const [remainingMs, setRemainingMs] = useState(targetMs - Date.now());
  const [completed, setCompleted] = useState(optional === "true"? true: null);
  const isdark = useColorScheme() === "dark"
  const THEME = isdark? DARKTHEME: LIGHTTHEME
  const styles = createStyles(THEME)

  const GRADIENTORANGE = isdark
    ? ["#2A1710", "#1A120E", "#1A120E", "#1A120E"]
    : ["#FFD6C7", "#FFE4DA", "#FFF1EB", "#FFFFFF"];

  const GRADIENTGREEN = isdark
    ? ["#182e21", "#111b16", "#0E1411", "#080a09"]
    : ["#CDEED8", "#E0F6E8", "#F2FBF5", "#FFFFFF"];

  const refresh = async (force = false) => {
    try {
      if (!force && optional === "true") return;

      const jwt = await AsyncStorage.getItem("jwt");
      const raw = await fetch(`${backendURI}/Post/getTodayStatus`, {
        method: "GET",
        headers: {
          Authorization: jwt
        }
      });

      const response = await raw.json();
      setCompleted(response.success);
    } catch (error) {
      console.log("Error fetching status:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [completed])
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = targetMs - now;

      if (diff <= 0) {
        const newTarget = getNextUtcMidnightMs();
        setTargetMs(newTarget);
        setRemainingMs(newTarget - now);
        
        setCompleted(null); 
        refresh(true);
      } else {
        setRemainingMs(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetMs]);

  const handlePress = () => {
    if (completed === true) {
      return router.push("/choose");
    }
    return router.push("newupload");
  };

  const timeText = formatRemaining(remainingMs);

  if (completed === null) {
    return (
      <View style={styles.spotlight}>
        <Skeleton
          colorMode="dark"
          width={"100%"}
          height={140}
          style={{ alignSelf: "center", borderRadius: RADII.lg }}
        />
      </View>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.spotlight, { paddingVertical: 20, paddingHorizontal: 16, height: flag === null? 140: flag === true? height/2.5: height* 0.8 }]}
    >
      <LinearGradient
        colors={completed === true ? GRADIENTGREEN : GRADIENTORANGE}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Text style={styles.spotlightLabel}>DAILY SPOTLIGHT WINDOW</Text>
      <Text
        style={[
          styles.timer,
          { color: completed === true ? THEME.accentGreen : THEME.accent },
        ]}
      >
        {timeText}
      </Text>
      <Text style={styles.spotlightHint}>
        {completed
          ? "Until your Morsel is locked"
          : "Remaining to share your latest bite"}
      </Text>
    </Pressable>
  );
}

function createStyles(THEME){
  return(
    StyleSheet.create({
      spotlight: {
        marginTop: 16,
        marginHorizontal: 16,
        borderRadius: RADII.lg,
        overflow: "hidden",
        justifyContent: 'center'
      },
      spotlightLabel: {
        textAlign: "center",
        color: THEME.textSoft,
        opacity: 0.5,
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1.5,
      },
      timer: {
        marginTop: 12,
        textAlign: "center",
        fontSize: 44,
        fontWeight: "800",
        letterSpacing: 1,
      },
      spotlightHint: {
        marginTop: 8,
        textAlign: "center",
        color: THEME.textSoft,
        opacity: 0.7,
        fontSize: 14,
      },
    })
  )
}