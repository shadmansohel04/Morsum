import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  StatusBar,
  useColorScheme
} from "react-native";
import TimerStack from "./(countdown)/timerComp";
import PostCard from "./(post)/postCard";
import YesterdaysSpotlight from "./(post)/spotlight";
import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useLocalSearchParams } from "expo-router";
import {DARKTHEME, LIGHTTHEME} from "../../../constants/Colors"

const backendURI = Constants.expoConfig.extra.backendURI;

export default function MorsumHomeFeed() {
  const { optional } = useLocalSearchParams();
  const [spotlight, setSpotlight] = useState({});
  const [friendData, setFriendData] = useState([]);
  const [flag, setFlag] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const isdark = useColorScheme() === "dark"
  const THEME = isdark? DARKTHEME: LIGHTTHEME
  const styles = createStyles(THEME)

  const refresh = async () => {
    try {
      const jwt = await AsyncStorage.getItem("jwt");
      const raw = await fetch(`${backendURI}/dash/getDashboardData`, {
        headers: {
          "Authorization": jwt
        }
      });
      if (!raw.ok) {
        return;
      }
      let response = await raw.json();
      if (response.spotlight) {
        setSpotlight(response.spotlight);
      } else {
        setSpotlight({
          imgurl: "nothing"
        });
      }

      if (!response.spotlight && response.friends.length == 0) {
        setFlag(false);
      } else if (!response.spotlight || response.friends.length == 0) {
        setFlag(true);
      }

      setFriendData(response.friends);

    } catch (error) {
      console.log(error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    refresh();
  }, []);

  return (
    <View style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.accent}
            colors={[THEME.accent]}
          />
        }
      >
        <TimerStack flag={flag} optional={optional} />

        <YesterdaysSpotlight
          imageUri={spotlight.imgurl}
          isActive={spotlight.active}
          caption={spotlight.caption}
          likes={0}
          comments={0}
          badges={spotlight.badges}
          flavor={spotlight.flavor}
          rating={spotlight.stars}
          time={spotlight.time}
          quantity={spotlight.quant}
          homemade={spotlight.homeMade}
          date={spotlight.date}
        />

        {friendData.length > 0 ? (
          <>
            <Text style={[styles.yHeaderText, { width: "92%", alignSelf: "center", marginTop: 30, marginBottom: 16 }]}>FRIEND ACTIVITY</Text>
            {friendData.map((p, idx) => (
              <View key={p.userid} style={{ marginBottom: idx === 0 ? 32 : 32 }}>
                <PostCard post={p} />
              </View>
            ))}
          </>
        ) : null}
        
      </ScrollView>
    </View>
  );
}

function createStyles(THEME){
  return(
    StyleSheet.create({
      safe: {
        flex: 1,
        backgroundColor: THEME.bg,
      },
      scrollContent: {
        paddingBottom: 0,
      },
      yHeaderText: {
        color: THEME.textSoft,
        opacity: 0.5,
        fontSize: 11,
        fontWeight: "700",
        fontFamily: "Inter-Bold",
        letterSpacing: 11 * 0.15,
      }
    })
  )
}