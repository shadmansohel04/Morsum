import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  useColorScheme
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";
import { DARKTHEME, LIGHTTHEME } from "../../../../constants/Colors";

const backendURI = Constants.expoConfig.extra.backendURI;

const SLIDER_HEIGHT = 350;
const THUMB_SIZE = 56;
const BUBBLE_HEIGHT = 44;

export default function CraveMeterScreen() {
  let { passIn } = useLocalSearchParams();
  passIn = passIn ? JSON.parse(passIn) : null;

  const [craveValue, setCraveValue] = useState(8);
  const router = useRouter();

  const isdark = useColorScheme() === "dark";
  const THEME = isdark ? DARKTHEME : LIGHTTHEME;
  const styles = createStyles(THEME, isdark);

  const handleTouch = (y) => {
    let val = Math.round(10 - (y / SLIDER_HEIGHT) * 10);
    val = Math.max(0, Math.min(10, val));
    setCraveValue(val);
  };

  const getFaceIcon = () => {
    if (craveValue <= 2) return 'emoticon-sad';
    if (craveValue <= 5) return 'emoticon-neutral';
    if (craveValue <= 8) return 'emoticon-happy';
    return 'emoticon-excited';
  };

  const handleDismiss = () => {
    if (router.canGoBack()) router.back();
  };

  const handleAccept = async () => {
    try {
      const jwt = await AsyncStorage.getItem("jwt");
      if (!passIn?.username) return;

      await fetch(`${backendURI}/Post/makeReaction`, {
        method: "PUT",
        headers: {
          "Authorization": jwt,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: passIn.username,
          rating: craveValue
        })
      });

      router.back();
    } catch (error) {
      console.log(error);
      router.back();
    }
  };

  const thumbPosition = SLIDER_HEIGHT - (craveValue / 10) * SLIDER_HEIGHT;

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: passIn?.heroImage }}
        style={StyleSheet.absoluteFillObject}
        blurRadius={60}
        imageStyle={{ opacity: isdark ? 0.3 : 0.2 }}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Crave Meter</Text>
      </View>

      <View style={styles.sliderSection}>
        <View style={styles.trackContainer}>
          <View style={styles.trackBackground} />

          <View
            style={[
              styles.trackFill,
              { height: (craveValue / 10) * SLIDER_HEIGHT }
            ]}
          />

          <View style={[styles.thumbContainer, { top: thumbPosition }]}>
            <View style={styles.bubbleWrapper}>
              <View style={styles.bubble}>
                <Text style={styles.bubbleText}>{craveValue}</Text>
              </View>
              <View style={styles.bubbleTriangle} />
            </View>

            <View style={styles.thumb}>
              <MaterialCommunityIcons
                name={getFaceIcon()}
                size={28}
                color={THEME.accent}
              />
            </View>
          </View>

          <View
            style={styles.touchOverlay}
            onStartShouldSetResponder={() => true}
            onResponderGrant={(e) => handleTouch(e.nativeEvent.locationY)}
            onResponderMove={(e) => handleTouch(e.nativeEvent.locationY)}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.primaryButton} onPress={handleAccept}>
          <Text style={styles.primaryButtonText}>Send Reaction</Text>
        </Pressable>

        <Pressable style={styles.dismissButton} onPress={handleDismiss}>
          <Text style={styles.dismissButtonText}>Dismiss</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(THEME, isdark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: THEME.bg,
      paddingHorizontal: 20,
      justifyContent: 'space-between',
      paddingTop: 60,
      paddingBottom: 40,
    },

    header: {
      alignItems: 'center',
      marginBottom: 40,
    },

    title: {
      color: THEME.accent,
      fontSize: 28,
      fontWeight: '800',
    },

    sliderSection: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    trackContainer: {
      height: SLIDER_HEIGHT,
      width: 80,
      alignItems: 'center',
      position: 'relative',
    },

    trackBackground: {
      position: 'absolute',
      width: 16,
      height: '100%',
      backgroundColor: isdark ? "#3A2924" : "#E5D3CC",
      borderRadius: 8,
    },

    trackFill: {
      position: 'absolute',
      bottom: 0,
      width: 16,
      backgroundColor: THEME.accentMuted || THEME.accent,
      borderRadius: 8,
    },

    thumbContainer: {
      position: 'absolute',
      alignItems: 'center',
      marginTop: -THUMB_SIZE / 2,
      zIndex: 10,
    },

    thumb: {
      width: THUMB_SIZE,
      height: THUMB_SIZE,
      borderRadius: THUMB_SIZE / 2,
      backgroundColor: THEME.surface,
      borderWidth: 2,
      borderColor: isdark ? "#4A3229" : "#E0C2B8",
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isdark ? 0.5 : 0.15,
      shadowRadius: 5,
      elevation: 8,
    },

    bubbleWrapper: {
      position: 'absolute',
      top: -(BUBBLE_HEIGHT + 14),
      alignItems: 'center',
    },

    bubble: {
      backgroundColor: THEME.accent,
      paddingHorizontal: 16,
      paddingVertical: 8,
      width: 60,
      borderRadius: 12,
      alignItems: 'center',
    },

    bubbleText: {
      color: isdark ? "#000" : "#111",
      fontSize: 22,
      fontWeight: '900',
    },

    bubbleTriangle: {
      width: 0,
      height: 0,
      borderLeftWidth: 8,
      borderRightWidth: 8,
      borderTopWidth: 8,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderTopColor: THEME.accent,
      marginTop: -1,
    },

    touchOverlay: {
      position: 'absolute',
      width: 120,
      height: SLIDER_HEIGHT + THUMB_SIZE,
      top: -THUMB_SIZE / 2,
      zIndex: 20,
    },

    footer: {
      alignItems: 'center',
      gap: 20,
    },

    primaryButton: {
      backgroundColor: THEME.accent,
      width: '100%',
      paddingVertical: 18,
      borderRadius: 30,
      alignItems: 'center',
    },

    primaryButtonText: {
      color: isdark ? "#000" : "#111",
      fontSize: 16,
      fontWeight: '700',
    },

    dismissButton: {
      paddingVertical: 10,
    },

    dismissButtonText: {
      color: THEME.textSoft,
      fontSize: 14,
      fontWeight: '700',
    },
  });
}