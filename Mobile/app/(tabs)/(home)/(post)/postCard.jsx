import { StyleSheet, View, Text, Pressable, useColorScheme } from "react-native";
import { Image } from "expo-image";
import {hoursFromNow} from "../../../../constants/func"
import Entypo from '@expo/vector-icons/Entypo';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { useState } from "react";
import Badge from "./badge";
import { useRouter } from "expo-router";
import { DARKTHEME, LIGHTTHEME } from "../../../../constants/Colors";

const RADII = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 100,
};

export default function PostCard({ post }) {
  const timeago = hoursFromNow(post.createdAt)
  const [liked, setLiked] = useState(post.liked? true: false)
  const router = useRouter()
  const isdark = useColorScheme() === "dark"
  const THEME = isdark? DARKTHEME: LIGHTTHEME
  const styles = createStyles(THEME)

  const postData = {
    meta: `${timeago} hours ago`,
    heroImage: post.imgurl,
    caption: post.caption,
    individualData: {
      flavor: post.flavor,
      rating: post.stars,
      time: post.time,
      quantity: post.quant
    },
    badges: post.badges,
    avatar: post.avatarurl,
    name: post.username,
    homemade: post.homemade,
    liked: liked
  }

  const toggleLike = async() => {
    const flag = !liked
    setLiked((prev)=> !prev)
  }

  return (
    <Pressable 
      style={styles.postWrap}
      onPress={()=>{router.push({
        pathname: "./individualPost",
        params:{
          data: JSON.stringify(postData)
        }
      })}}
    >
      <View style={styles.postHeader}>
        {post.avatarurl? <Image 
          source={{ uri: post.avatarurl }} 
          style={styles.avatar}
          cachePolicy={"memory"}
        />: (
          <View style={[styles.avatar, {backgroundColor: "rgba(255, 135, 98, 0.5)"}]}>
            <Text style={{color: "white", fontSize: 18}}>{post.username[0].toUpperCase()}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{post.username}</Text>
          <Text style={styles.meta}>{timeago} hours ago</Text>
        </View>
      </View>


      <View style={styles.imageOuter}>
        <Image source={{ uri: post.imgurl }} style={styles.postImage} cachePolicy={"disk"}/>
        <View style={styles.badgesRow}>
          {post.badges?.map((b, idx) => (
            <Badge key={idx} label={b} textColor="#FF8762" bg="rgba(255, 135, 98, 0.2)" scale={2} />
          ))}
        </View>
      </View>

      <Text style={styles.caption}>{post.caption}</Text>

      <View style={styles.interactions}>
        <View style={styles.interactionsLeft}>
          <Pressable
            style={[styles.iconStat, {marginRight: 10}]}
            onPress={toggleLike}
          >
            <Entypo name={liked? "heart": "heart-outlined"} size={24} color={THEME.textSoft}/>
          </Pressable>

          <Pressable style={styles.iconStat}>
            <EvilIcons name="share-google" size={32} color={THEME.textSoft}/>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function createStyles(THEME){
  return(
    StyleSheet.create({
      postWrap: {
      },
      postHeader: {
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
      },
      avatar: {
        width: 40,
        height: 40,
        borderRadius: 100,
        marginRight: 12,
        backgroundColor: THEME.surface,
        justifyContent: "center",
        alignItems: "center"
      },
      userName: {
        color: THEME.text,
        fontSize: 16,
        fontWeight: "700",
        fontFamily: "PlusJakartaSans-Bold",
      },
      meta: {
        marginTop: 2,
        color: THEME.textSoft,
        opacity: 0.5,
        fontSize: 10,
        fontWeight: "600",
        fontFamily: "Inter-SemiBold",
        letterSpacing: 10 * 0.05,
      },

      imageOuter: {
        marginTop: 16,
        marginHorizontal: 16,
        borderRadius: RADII.lg,
        overflow: "hidden",
        backgroundColor: THEME.surface,
      },
      postImage: {
        width: "100%",
        aspectRatio: 4 / 5,
        backgroundColor: THEME.bg,
      },
      badgesRow: {
        position: "absolute",
        left: 12,
        bottom: 12,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
      },

      caption: {
        marginTop: 16,
        paddingHorizontal: 20,
        color: THEME.text,
        fontSize: 18,
        fontWeight: "500",
        fontFamily: "PlusJakartaSans-Medium",
        lineHeight: 26,
        width: "80%",
      },

      interactions: {
        marginTop: 20,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      },
      interactionsLeft: {
        flexDirection: "row",
        alignItems: "center",
      },
      iconStat: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 5
      },
    })
  )
}