import { MaterialIcons } from "@expo/vector-icons";
import { Image, ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { DARKTHEME, LIGHTTHEME } from "../../../../constants/Colors";
import Badge from "./badge";
import ReactionsGrid from "./mycomments";

const { height: H } = Dimensions.get("window");

export default function SpotlightScreen() {
  const router = useRouter();
  let { data } = useLocalSearchParams();
  data = data ? JSON.parse(data) : null;

  const isdark = useColorScheme() === "dark";
  const THEME = isdark ? DARKTHEME : LIGHTTHEME;
  const styles = createStyles(THEME, isdark);

  let quantityLabel = data?.homemade ? "SERVINGS" : "PRICE";
  let timeLabel = data?.homemade ? "PREP TIME" : "WAIT TIME";

  return (
    <View style={styles.safe}>
      <ScrollView>
        <View style={styles.heroWrap}>
          <ImageBackground
            cachePolicy="disk"
            source={{ uri: data.heroImage }}
            style={styles.hero}
          >
            <LinearGradient
              style={styles.heroBottomFade}
              colors={["transparent", THEME.bg]}
              locations={[0, 0.6]}
            />

            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.headerIconBtn}
               >
                <Text style={[styles.headerIcon, { color: THEME.accent }]}>←</Text>
              </TouchableOpacity>

              <Text style={styles.headerTitle}>{data.title || ""}</Text>

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
              {data.badges?.map((b, i) => (
                <Badge
                  key={i}
                  label={b}
                  textColor={THEME.accent}
                  bg={`${THEME.accent}22`}
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
                {data.avatar ? (
                  <Image source={{ uri: data.avatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: `${THEME.accent}66` }]}>
                    <Text style={{ color: "#fff", fontSize: 25 }}>
                      {data.name[0].toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              <View>
                <Text style={styles.authorName}>{data.name}</Text>
                <Text style={styles.authorMeta}>{data.meta}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.caption}>{data.caption}</Text>

          <View style={styles.metricsRow}>
            <Pressable
              style={styles.reactButtonFull}
              onPress={() =>
                router.push({
                  pathname: "commentsPage",
                  params: {
                    passIn: JSON.stringify({
                      heroImage: data.heroImage,
                      username: data.name,
                    }),
                  },
                })
              }
            >
              <View style={styles.metricCircle}>
                <Text style={[styles.metricIcon, { color: THEME.accent }]}>⚡︎</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.metricValue}>React</Text>
                <Text style={styles.metricLabel}>DISH YOUR THOUGHTS</Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.grid}>
            {data.individualData.flavor && (
              <View style={styles.grid}>
                <View style={styles.card}>
                  <Text style={styles.cardKicker}>FLAVOR</Text>
                  <Text style={styles.cardMainOrange}>{data.individualData.flavor}</Text>
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
                    color={i < data.individualData.rating ? THEME.accent : THEME.textSoft}
                  />
                ))}
              </View>
            </View>

            {data.individualData.time > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardKicker}>{timeLabel}</Text>
                <Text style={styles.cardMain}>{data.individualData.time}</Text>
              </View>
            )}

            {data.individualData.quantity > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardKicker}>{quantityLabel}</Text>
                <Text style={styles.cardMainGreen}>{data.individualData.quantity}</Text>
              </View>
            )}
          </View>
        </View>

        {data.title && <ReactionsGrid date={data.date} />}
      </ScrollView>
    </View>
  );
}

function createStyles(THEME, isdark) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: THEME.bg,
    },

    heroWrap: {
      height: Math.min(H * 0.52, 530),
      backgroundColor: THEME.surface,
    },

    hero: {
      flex: 1,
      justifyContent: "flex-end",
    },

    heroBottomFade: {
      position: "absolute",
      bottom: 0,
      height: 220,
      width: "100%",
    },

    header: {
      position: "absolute",
      top: Platform.OS === "android" ? 28 : 8,
      left: 14,
      right: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    headerIconBtn: {
      width: 44,
      height: 44,
      justifyContent: "center",
      alignItems: "center",
    },

    headerIcon: {
      fontSize: 22,
      color: THEME.text,
      fontWeight: "700",
    },

    headerTitle: {
      color: THEME.text,
      fontSize: 20,
      fontWeight: "700",
      letterSpacing: 3,
    },

    chipsRow: {
      position: "absolute",
      bottom: 18,
      left: 20,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },

    content: {
      padding: 18,
      backgroundColor: THEME.bg,
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
      borderColor: THEME.accent,
      padding: 3,
      marginRight: 12,
    },

    avatar: {
      width: "100%",
      height: "100%",
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
    },

    authorName: {
      color: THEME.text,
      fontSize: 22,
      fontWeight: "800",
    },

    authorMeta: {
      color: THEME.textSoft,
      fontSize: 12,
      letterSpacing: 2,
    },

    caption: {
      marginTop: 18,
      color: THEME.text,
      fontSize: 28,
      fontWeight: "800",
      lineHeight: 36,
    },

    metricsRow: {
      marginTop: 20,
    },

    reactButtonFull: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: THEME.surface,
      borderRadius: 18,
      padding: 12,
      gap: 16,
    },

    metricCircle: {
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor: isdark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
      justifyContent: "center",
      alignItems: "center",
    },

    metricIcon: {
      fontSize: 30,
      fontWeight: "800",
    },

    metricValue: {
      color: THEME.text,
      fontSize: 22,
      fontWeight: "900",
    },

    metricLabel: {
      color: THEME.textSoft,
      fontSize: 12,
      letterSpacing: 2,
    },

    grid: {
      marginTop: 22,
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },

    card: {
      width: "48%",
      backgroundColor: THEME.surface,
      borderRadius: 18,
      padding: 16,
      marginBottom: 14,
    },

    cardKicker: {
      color: THEME.textSoft,
      fontSize: 12,
      letterSpacing: 2,
    },

    cardMain: {
      color: THEME.text,
      fontSize: 22,
      fontWeight: "900",
    },

    cardMainOrange: {
      color: THEME.accent,
      fontSize: 22,
      fontWeight: "900",
    },

    cardMainGreen: {
      color: isdark ? "#62d27c" : "#2e7d32",
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