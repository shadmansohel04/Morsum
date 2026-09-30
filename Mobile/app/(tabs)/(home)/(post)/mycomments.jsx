import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";
import { useRouter } from 'expo-router';
import { DARKTHEME, LIGHTTHEME } from "../../../../constants/Colors";

const backendURI = Constants.expoConfig.extra.backendURI;

export default function ReactionTile({ date }) {
  const [allData, setAll] = useState([]);
  const [first, setFirst] = useState([]);
  const router = useRouter();

  const isdark = useColorScheme() === "dark";
  const THEME = isdark ? DARKTHEME : LIGHTTHEME;
  const styles = createStyles(THEME, isdark);

  useEffect(() => {
    const refresh = async () => {
      try {
        const jwt = await AsyncStorage.getItem("jwt");
        const raw = await fetch(`${backendURI}/Post/getPostReactions`, {
          method: "POST",
          headers: {
            "Authorization": jwt,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ showdate: date })
        });

        if (!raw.ok) return;

        const response = await raw.json();
        if (response?.allreactions && response?.first) {
          setAll(response.allreactions);
          setFirst(response.first);
        }
      } catch (error) {
        console.log(error);
      }
    };
    refresh();
  }, []);

  const extraCount = allData.length - first.length;

  return (
    <Pressable
      onPress={() => {
        router.push({
          pathname: "allComments",
          params: { data: JSON.stringify(allData) }
        });
      }}
      style={styles.reactionsSection}
    >
      <Text style={styles.sectionHeader}>REACTIONS</Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={20} color={THEME.accent} />
            </View>

            <View>
              <Text style={styles.mainTitle}>Cravings</Text>
              <Text style={styles.subTitle}>Community Response</Text>
            </View>
          </View>

          <View style={styles.badgeWrapper}>
            <Text style={styles.badgeText}>{allData.length} TOTAL</Text>
          </View>
        </View>

        <View style={styles.cardBottom}>
          <View style={styles.avatarsRow}>
            {first.map((each, index) => (
              <Image
                key={index}
                source={{ uri: each.avatarurl }}
                style={[
                  styles.avatar,
                  index > 0 && { marginLeft: -12 }
                ]}
              />
            ))}

            <View style={[styles.plusBubble, { marginLeft: -12 }]}>
              <Text style={styles.plusText}>+</Text>
            </View>
          </View>

          <Text style={styles.summaryText}>
            <Text style={styles.boldText}>+{extraCount} others</Text> are{"\n"}craving this
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function createStyles(THEME, isdark) {
  return StyleSheet.create({
    reactionsSection: {
      paddingHorizontal: 18,
      paddingBottom: 40,
      marginTop: 10,
    },

    sectionHeader: {
      color: THEME.textSoft,
      opacity: isdark ? 0.35 : 0.6,
      fontSize: 12,
      fontWeight: "900",
      letterSpacing: 2.6,
      marginBottom: 16,
    },

    card: {
      backgroundColor: THEME.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: isdark
        ? "rgba(255,255,255,0.05)"
        : "rgba(0,0,0,0.06)",
    },

    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    iconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${THEME.accent}22`,
      justifyContent: "center",
      alignItems: "center",
    },

    mainTitle: {
      color: THEME.text,
      fontSize: 16,
      fontWeight: "700",
    },

    subTitle: {
      color: THEME.textSoft,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.5,
    },

    badgeWrapper: {
      backgroundColor: `${THEME.accent}26`,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 12,
    },

    badgeText: {
      color: THEME.accent,
      fontSize: 11,
      fontWeight: "800",
    },

    cardBottom: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 20,
    },

    avatarsRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    avatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: THEME.surface,
    },

    plusBubble: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: isdark ? "#2A2A2A" : "#E6E6E6",
      borderWidth: 2,
      borderColor: THEME.surface,
      justifyContent: "center",
      alignItems: "center",
    },

    plusText: {
      color: THEME.textSoft,
      fontSize: 12,
      fontWeight: "800",
    },

    summaryText: {
      color: THEME.textSoft,
      fontSize: 13,
      marginLeft: 12,
      lineHeight: 18,
    },

    boldText: {
      color: THEME.text,
      fontWeight: "700",
    },
  });
}