import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  Pressable,
  useColorScheme,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DARKTHEME, LIGHTTHEME } from "../../../../constants/Colors";

export default function CravingsScreen() {
  const router = useRouter();
  let { data } = useLocalSearchParams();

  const isdark = useColorScheme() === "dark";
  const THEME = isdark ? DARKTHEME : LIGHTTHEME;
  const styles = createStyles(THEME, isdark);

  if (data) {
    try {
      data = JSON.parse(data);
    } catch {
      data = [];
    }
  } else {
    data = [];
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.avatarContainer}>
        {item.avatarurl ? (
          <Image source={{ uri: item.avatarurl }} style={styles.avatar} />
        ) : (
          <View style={styles.initialsAvatar}>
            <Text style={styles.initialsText}>
              {item.username ? item.username[0].toUpperCase() : ""}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.username}</Text>
      </View>

      <View style={styles.ratingBadge}>
        <MaterialCommunityIcons
          name="silverware-fork-knife"
          size={12}
          color={THEME.accent}
        />
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
    </View>
  );

  const ListHeader = () => (
    <View style={styles.headerContent}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>←</Text>
      </Pressable>

      <View style={styles.totalBadge}>
        <Text style={styles.totalText}>{data.length} TOTAL</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isdark ? "light-content" : "dark-content"}
        backgroundColor={THEME.bg}
      />

      <FlatList
        data={data}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function createStyles(THEME, isdark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: THEME.bg,
    },

    listContainer: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },

    headerContent: {
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 32,
    },

    backButton: {
      position: "absolute",
      top: 10,
      left: 10,
      zIndex: 5,
    },

    backText: {
      fontSize: 20,
      color: THEME.text,
    },

    totalBadge: {
      backgroundColor: `${THEME.accent}22`,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
    },

    totalText: {
      color: THEME.accent,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1,
    },

    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: THEME.surface,
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: isdark ? 0 : 1,
      borderColor: isdark ? "transparent" : "rgba(0,0,0,0.06)",
    },

    avatarContainer: {
      marginRight: 16,
    },

    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },

    initialsAvatar: {
      backgroundColor: `${THEME.accent}66`,
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
    },

    initialsText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 18,
    },

    userInfo: {
      flex: 1,
    },

    userName: {
      color: THEME.text,
      fontSize: 16,
      fontWeight: '700',
    },

    ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: `${THEME.accent}44`,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 4,
    },

    ratingText: {
      color: THEME.accent,
      fontWeight: '700',
      fontSize: 14,
    },
  });
}