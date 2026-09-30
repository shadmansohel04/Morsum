import { Image } from "expo-image";
import * as FileSystem from "expo-file-system/legacy"; // Updated to legacy API to clear the warning
import * as MediaLibrary from "expo-media-library";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { DARKTHEME, LIGHTTHEME } from "../../../../constants/Colors";

const backendURI = Constants.expoConfig.extra.backendURI;

export default function ImageFullscreenScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const imageUri =
    typeof params.imageUri === "string" ? params.imageUri : params.imageUri?.[0] || "";
  const postIDValue =
    typeof params.postID === "string" ? params.postID : params.postID?.[0] || "";
  const postID = Number(postIDValue);
  const normalizedPostID = Number.isNaN(postID) ? postIDValue : postID;

  const isDark = useColorScheme() === "dark";
  const THEME = isDark ? DARKTHEME : LIGHTTHEME;
  const styles = createStyles(THEME, isDark);

  const handleSave = async () => {
    if (!imageUri) return;

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow access to save images.");
        return;
      }

      const fileName = `good-eats-${Date.now()}.jpg`;
      const localUri = `${FileSystem.cacheDirectory}${fileName}`;

      let sourceUri = imageUri;

      if (!imageUri.startsWith("file://")) {
        const downloaded = await FileSystem.downloadAsync(imageUri, localUri);
        sourceUri = downloaded.uri;
      }

      await MediaLibrary.saveToLibraryAsync(sourceUri);
      Alert.alert("Saved", "Image saved to your camera roll.");
    } catch (error) {
      Alert.alert("Error", "Could not save the image.");
    }
  };

  const handleMessage = async () => {
    const url = `sms:?body=${encodeURIComponent("Check out this photo from GoodEats")}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Error", "Could not open Messages.");
    }
  };

  const handleEmail = async () => {
    const url = `mailto:?subject=${encodeURIComponent("GoodEats photo")}&body=${encodeURIComponent("Check out this photo from GoodEats")}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Error", "Could not open Email.");
    }
  };

  const handleDelete = async () => {
    if (!normalizedPostID) {
      Alert.alert("Error", "Could not find this post to delete.");
      return;
    }

    try {
      const jwt = await AsyncStorage.getItem("jwt");
      await fetch(`${backendURI}/Post/deletePost`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: jwt,
        },
        body: JSON.stringify({ postID: normalizedPostID }),
      });
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not delete this post.");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.75)"]}
        style={styles.overlay}
      />

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Text style={styles.closeText}>←</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
        activeOpacity={0.8}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>

      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={handleSave}>
          <Text style={styles.actionText}>Save to camera roll</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(THEME, isDark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#000",
    },
    image: {
      flex: 1,
      width: "100%",
      height: "100%",
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
    },
    closeButton: {
      position: "absolute",
      top: Platform.OS === "android" ? 28 : 40,
      left: 18,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      alignItems: "center",
    },
    closeText: {
      color: "#fff",
      fontSize: 22,
      fontWeight: "700",
    },
    deleteButton: {
      position: "absolute",
      top: Platform.OS === "android" ? 28 : 40,
      right: 18,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: "rgba(220, 38, 38, 0.9)",
      justifyContent: "center",
      alignItems: "center",
    },
    deleteText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    actions: {
      position: "absolute",
      bottom: 28,
      left: 18,
      right: 18,
      gap: 12,
    },
    actionButton: {
      backgroundColor: "rgba(255,255,255,0.16)",
      borderColor: "rgba(255,255,255,0.24)",
      borderWidth: 1,
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: "center",
    },
    actionText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
  });
}