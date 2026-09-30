import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
  Pressable,
  useColorScheme
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Badge from "../(home)/(post)/badge";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image, ImageBackground } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import ReactionsGrid from "../(home)/(post)/mycomments";
import { DARKTHEME, LIGHTTHEME } from "../../../constants/Colors";

const { height: H } = Dimensions.get("window");

export default function SpotlightScreen() {
  const isdark = useColorScheme() === "dark";
  const THEME = isdark ? DARKTHEME : LIGHTTHEME;
  const styles = createStyles(THEME, isdark);

  const router = useRouter();
  const params = useLocalSearchParams();

  let data = null;

  try {
    if (params?.data && params.data !== "undefined") {
      data = JSON.parse(params.data);
    }
  } catch (e) {
    console.log("Parse error:", e);
  }

  if (!data) {
    return (
      <View style={[styles.safe, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: THEME.text || (isdark ? "white" : "black") }}>Loading...</Text>
      </View>
    );
  }

  const {
    heroImage,
    caption,
    badges = [],
    avatar,
    name,
    meta,
    homemade,
    individualData = {},
    title
  } = data;

  let quantityLabel = "PRICE";
  let timeLabel = "WAIT TIME";

  if (homemade) {
    quantityLabel = "SERVINGS";
    timeLabel = "PREP TIME";
  }

  return (
    <View style={styles.safe}>
      <ScrollView>
        <View style={styles.heroWrap}>
          <ImageBackground
            cachePolicy={"disk"}
            source={{ uri: heroImage }}
            style={styles.hero}
          >
            <LinearGradient
              style={styles.heroBottomFade}
              colors={["transparent", THEME.bg || (isdark ? "#0d0f0c" : "#FFFFFF")]}
              locations={[0, 0.5]}
            />

            <View style={styles.header}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.headerIconBtn}
                onPress={() => router.back()}
              >
                <Text style={[styles.headerIcon, { color: THEME.accent || "#ff7a5c" }]}>←</Text>
              </TouchableOpacity>

              <Text style={styles.headerTitle}>{title ? title : ""}</Text>

              <TouchableOpacity
                onPress={() => {
                  if (!data?.heroImage) return;
                  router.push({
                    pathname: "/imageFullScreen",
                    params: { imageUri: data.heroImage },
                  });
                }}
                style={styles.headerIconBtn}
              >
                <Text style={styles.headerIcon}>⤴</Text>
              </TouchableOpacity>

            </View>

            <View style={styles.chipsRow}>
              {badges.map((b, index) => (
                <Badge
                  key={index}
                  label={b}
                  textColor={THEME.accent || "#FF8762"}
                  bg={isdark ? "rgba(255, 135, 98, 0.2)" : "rgba(255, 135, 98, 0.15)"}
                  scale={2.5}
                />
              ))}
            </View>
          </ImageBackground>
        </View>

        <View style={styles.content}>
          <View style={styles.authorRow}>
            <View style={styles.authorLeft}>
              <View style={styles.avatarRing}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatar} />
                ) : (
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: isdark ? "rgba(255, 135, 98, 0.5)" : "rgba(255, 135, 98, 0.3)" }
                    ]}
                  >
                    <Text style={{ color: isdark ? "white" : "#1A1A1A", fontSize: 25 }}>
                      {name ? name[0].toUpperCase() : ""}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.authorText}>
                <Text style={styles.authorName}>{name}</Text>
                <Text style={styles.authorMeta}>{meta}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.caption}>{caption}</Text>

          <View style={styles.grid}>
            {individualData?.flavor && (
              <View style={styles.grid}>
                <View style={styles.card}>
                  <Text style={styles.cardKicker}>FLAVOR</Text>
                  <Text style={styles.cardMainOrange}>{individualData?.flavor}</Text>
                </View>
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.cardKicker}>RATING</Text>
              <View style={styles.levelRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <MaterialIcons
                    key={i}
                    name="star"
                    size={26}
                    color={
                      i < (individualData?.rating || 0)
                        ? (THEME.accent || "#FF8762")
                        : (isdark ? "#333" : "#E0E0E0")
                    }
                  />
                ))}
              </View>
            </View>

            {individualData.time && individualData.time > 0 ? (
              <View style={[styles.card, {width: !individualData.quantity || individualData.quantity <= 0 ? "100%" : "48%"}]}>
                <Text style={styles.cardKicker}>{timeLabel}</Text>
                <Text style={styles.cardMain}>
                  {individualData.time}
                </Text>
              </View>
            ) : null}
            
            {individualData.quantity && individualData.quantity > 0 ? (
              <View style={[styles.card, {width: !individualData.time || individualData.time <= 0 ? "100%" : "48%"}]}>
                <Text style={styles.cardKicker}>{quantityLabel}</Text>
                <Text style={styles.cardMainGreen}>
                  {individualData.quantity}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {title ? <ReactionsGrid date={data?.date}/> : null}
      </ScrollView>
    </View>
  );
}

function createStyles(THEME, isdark) {
  return StyleSheet.create({
    safe: { 
      flex: 1, 
      backgroundColor: THEME.bg || (isdark ? "#0b0d0c" : "#FFFFFF") 
    },
    heroWrap: {
      width: "100%",
      height: Math.min(H * 0.52, 530),
      backgroundColor: isdark ? "#111" : "#EBEBEB",
    },
    hero: { 
      flex: 1, 
      justifyContent: "flex-end" 
    },
    heroBottomFade: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 220,
    },
    header: {
      position: "absolute",
      top: Platform.OS === "android" ? 28 : 8,
      left: 14,
      right: 14,
      height: 54,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerIconBtn: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    headerIcon: {
      fontSize: 22,
      color: THEME.text || (isdark ? "rgba(255,255,255,0.92)" : "#1A1A1A"),
      fontWeight: "700",
    },
    headerTitle: {
      color: THEME.text || (isdark ? "rgba(255,255,255,0.92)" : "#1A1A1A"),
      fontSize: 20,
      letterSpacing: 3.8,
      fontWeight: "700",
    },
    chipsRow: {
      position: "absolute",
      left: 20,
      right: 20,
      bottom: 18,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    content: {
      paddingHorizontal: 18,
      paddingTop: 14,
      paddingBottom: 20,
    },
    authorRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    authorLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    avatarRing: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 2,
      borderColor: THEME.accent || "#ff7a5c",
      padding: 3,
      marginRight: 12,
    },
    avatar: {
      width: "100%",
      height: "100%",
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
    },
    authorText: { 
      gap: 4 
    },
    authorName: {
      color: THEME.text || (isdark ? "rgba(255,255,255,0.92)" : "#1A1A1A"),
      fontSize: 22,
      fontWeight: "800",
    },
    authorMeta: {
      color: THEME.textSoft || (isdark ? "rgba(255,255,255,0.35)" : "#8E8E8E"),
      fontSize: 12,
      fontWeight: "700",
    },
    caption: {
      marginTop: 18,
      color: THEME.text || (isdark ? "rgba(255,255,255,0.92)" : "#1A1A1A"),
      fontSize: 30,
      fontWeight: "800",
    },
    grid: {
      marginTop: 22,
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    card: {
      width: "48%",
      backgroundColor: THEME.surface || (isdark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"),
      borderRadius: 18,
      padding: 16,
      justifyContent: "space-between",
      marginBottom: 14,
    },
    cardKicker: {
      color: THEME.textSoft || (isdark ? "rgba(255,255,255,0.35)" : "#8E8E8E"),
      fontSize: 12,
      fontWeight: "900",
    },
    cardMain: {
      color: THEME.text || (isdark ? "rgba(255,255,255,0.92)" : "#1A1A1A"),
      fontSize: 22,
      fontWeight: "900",
    },
    cardMainOrange: {
      color: THEME.accent || "#ff7a5c",
      fontSize: 22,
      fontWeight: "900",
    },
    cardMainGreen: {
      color: THEME.success || "#62d27c",
      fontSize: 22,
      fontWeight: "900",
    },
    levelRow: {
      flexDirection: "row",
      gap: 6,
      marginTop: 10,
    },
  });
}