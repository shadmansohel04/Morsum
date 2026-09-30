import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  useColorScheme
} from 'react-native';

import {
  Ionicons,
  MaterialIcons,
  Feather,
} from '@expo/vector-icons';

import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";

import { DARKTHEME, LIGHTTHEME } from "../../../../constants/Colors";

const backendURI = Constants.expoConfig.extra.backendURI;

export default function PostMealScreen() {
  const isDark = useColorScheme() === "dark";
  const THEME = isDark ? DARKTHEME : LIGHTTHEME;
  const styles = createStyles(THEME, isDark);

  const [description, setDescription] = useState('');
  const [flavor, setFlavor] = useState('');
  const [rating, setRating] = useState(4);
  const [prepTime, setPrepTime] = useState('');
  const [servings, setServings] = useState('');
  const [isHomemade, setIsHomemade] = useState(true);
  const [imageURI, setImageUri] = useState(null);

  const [badges, setBadges] = useState([]);
  const [currentBadge, setCurrentBadge] = useState('');

  const router = useRouter();

  const handleAddBadge = () => {
    const trimmed = currentBadge.trim();
    if (trimmed.length > 0 && trimmed.length <= 15 && !badges.includes(trimmed)) {
      setBadges([...badges, trimmed]);
      setCurrentBadge('');
    }
  };

  const removeBadge = (index) => {
    setBadges(badges.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    try {
      const jwt = await AsyncStorage.getItem("jwt");

      const form = new FormData();
      form.append("frame", {
        uri: imageURI,
        name: "image.jpg",
        type: "image/jpeg"
      });

      form.append("homemade", isHomemade);
      form.append("stars", rating);
      form.append("caption", description);
      form.append("flavor", flavor);

      if (servings) form.append("quant", servings);
      if (prepTime) form.append("time", prepTime);

      badges.forEach(b => form.append("badges", b));

      await fetch(`${backendURI}/Post/uploadPost`, {
        method: "POST",
        headers: { Authorization: jwt },
        body: form
      });

      router.replace("../../");
    } catch (e) {
      console.log("Post error:", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const photoUri = await AsyncStorage.getItem("currentImage");
        setImageUri(photoUri);
      };
      load();
    }, [])
  );

  return (
    <KeyboardAvoidingView
      style={styles.safeArea}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={THEME.accent} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post Meal</Text>
        </View>

        <TouchableOpacity style={styles.postButton} onPress={handlePost}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.imageCard}>
          {imageURI && (
            <Image
              source={{ uri: imageURI }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          )}
        </View>

        <Text style={styles.sectionTitle}>Describe your morsel</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            multiline
            textAlignVertical="top"
            placeholder="What's the story behind this dish?"
            placeholderTextColor={THEME.textSoft}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.inputContainerSmall}>
          <TextInput
            style={styles.textInputSingle}
            placeholder="Flavor profile (e.g. Sweet & Sour)"
            maxLength={30}
            placeholderTextColor={THEME.textSoft}
            value={flavor}
            onChangeText={setFlavor}
          />
        </View>

        <View style={styles.cardRow}>
          <View style={styles.ratingInfo}>
            <Text style={styles.cardTitle}>Taste Rating</Text>
            <Text style={styles.cardSubtitle}>How appetizing was it?</Text>
          </View>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map(s => (
              <TouchableOpacity key={s} onPress={() => setRating(s)}>
                <MaterialIcons
                  name="star"
                  size={26}
                  color={s <= rating ? THEME.accent : (isDark ? "#333" : "#E0E0E0")}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <MaterialIcons name={isHomemade ? "kitchen" : "access-time"} size={16} color={THEME.accent} />
              <Text style={styles.statTitle}>{isHomemade ? "PREP TIME" : "WAIT TIME"}</Text>
            </View>
            <TextInput
              style={styles.statInput}
              keyboardType="numeric"
              maxLength={3}
              placeholder="15 mins"
              placeholderTextColor="rgba(122, 115, 115, 0.7)"
              onChangeText={setPrepTime}
            />
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Feather name={isHomemade ? "users" : "dollar-sign"} size={16} color={THEME.accent} />
              <Text style={styles.statTitle}>{isHomemade ? "SERVINGS" : "PRICE"}</Text>
            </View>
            <TextInput
              style={styles.statInput}
              keyboardType="numeric"
              maxLength={2}
              placeholder={isHomemade ? "3 servings" : "$12"}
              placeholderTextColor="rgba(122, 115, 115, 0.7)"
              onChangeText={setServings}
            />
          </View>
        </View>

        <View style={styles.toggleCard}>
          <View style={styles.toggleLeft}>
            <View style={styles.homeIconContainer}>
              <Ionicons name="home" size={20} color="#6dbd5b" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Homemade Dish</Text>
              <Text style={styles.cardSubtitle}>Toggle for home-cooked recipes</Text>
            </View>
          </View>

          <Switch
            value={isHomemade}
            onValueChange={setIsHomemade}
            trackColor={{ false: isDark ? "#333" : "#E0E0E0", true: THEME.accent }}
            thumbColor="#FFF"
          />
        </View>

        <Text style={styles.sectionTitle}>Badges</Text>

        <View style={styles.badgeInputContainer}>
          <TextInput
            style={styles.badgeTextInput}
            placeholder="Add badge (e.g. cook time)"
            maxLength={15}
            placeholderTextColor={THEME.textSoft}
            value={currentBadge}
            onChangeText={setCurrentBadge}
            onSubmitEditing={handleAddBadge}
          />

          <TouchableOpacity style={styles.addBadgeButton} onPress={handleAddBadge}>
            <Ionicons name="add" size={24} color={isDark ? "#000" : "#FFF"} />
          </TouchableOpacity>
        </View>

        <View style={styles.badgesWrapper}>
          {badges.map((b, i) => (
            <View key={i} style={styles.badgeTag}>
              <Text style={styles.badgeText}>{b}</Text>
              <TouchableOpacity onPress={() => removeBadge(i)}>
                <Ionicons name="close-circle" size={18} color={isDark ? "#000" : "#FFF"} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(THEME, isDark) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: THEME.bg || (isDark ? "#0d0f0c" : "#FFFFFF"),
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 120,
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
    },

    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    headerTitle: {
      color: THEME.text || (isDark ? "#FFFFFF" : "#1A1A1A"),
      fontSize: 20,
      fontWeight: '700',
      marginLeft: 15,
    },

    postButton: {
      backgroundColor: THEME.accent || "#FF8762",
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
    },

    postButtonText: {
      color: isDark ? '#000' : '#FFF',
      fontWeight: '700',
      fontSize: 14,
    },

    imageCard: {
      alignSelf: "center",
      overflow: "hidden",
      borderRadius: 24,
      marginTop: 10,
      marginBottom: 30,
      height: 300,
      width: "60%",
      backgroundColor: THEME.surface || (isDark ? '#141612' : '#F0F0F0'),
    },

    sectionTitle: {
      color: THEME.text || (isDark ? "#FFFFFF" : "#1A1A1A"),
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 15,
    },

    inputContainer: {
      backgroundColor: THEME.surface || (isDark ? "#141612" : "#F5F5F5"),
      borderRadius: 20,
      height: 160,
      padding: 20,
      marginBottom: 15,
    },

    inputContainerSmall: {
      backgroundColor: THEME.surface || (isDark ? "#141612" : "#F5F5F5"),
      borderRadius: 20,
      height: 60,
      paddingHorizontal: 20,
      justifyContent: 'center',
      marginBottom: 15,
    },

    textInput: {
      color: THEME.text || (isDark ? "#FFFFFF" : "#1A1A1A"),
      fontSize: 16,
      height: '100%',
    },

    textInputSingle: {
      color: THEME.text || (isDark ? "#FFFFFF" : "#1A1A1A"),
      fontSize: 16,
    },

    cardRow: {
      backgroundColor: THEME.surface || (isDark ? "#141612" : "#F5F5F5"),
      borderRadius: 20,
      padding: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },

    ratingInfo: {
      flex: 1,
    },

    cardTitle: {
      color: THEME.text || (isDark ? "#FFFFFF" : "#1A1A1A"),
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },

    cardSubtitle: {
      color: THEME.textSoft || (isDark ? "#666" : "#8E8E8E"),
      fontSize: 13,
    },

    starsContainer: {
      flexDirection: 'row',
      gap: 4,
    },

    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
    },

    statCard: {
      backgroundColor: THEME.surface || (isDark ? "#141612" : "#F5F5F5"),
      borderRadius: 20,
      padding: 20,
      width: '48%',
    },

    statHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },

    statTitle: {
      color: THEME.accent || "#FF8762",
      fontSize: 12,
      fontWeight: '700',
      marginLeft: 8,
      letterSpacing: 0.5,
    },

    statInput: {
      color: THEME.text || (isDark ? "#FFFFFF" : "#1A1A1A"),
      fontSize: 18,
      fontWeight: '600',
    },

    toggleCard: {
      backgroundColor: THEME.surface || (isDark ? "#141612" : "#F5F5F5"),
      borderRadius: 20,
      padding: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },

    toggleLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    homeIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? '#0A2610' : 'rgba(109, 189, 91, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
    },

    badgeInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },

    badgeTextInput: {
      flex: 1,
      backgroundColor: THEME.surface || (isDark ? "#141612" : "#F5F5F5"),
      borderRadius: 20,
      height: 55,
      paddingHorizontal: 20,
      color: THEME.text || (isDark ? "#FFFFFF" : "#1A1A1A"),
      fontSize: 16,
    },

    addBadgeButton: {
      backgroundColor: THEME.accent || "#FF8762",
      height: 55,
      width: 55,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 10,
    },

    badgesWrapper: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },

    badgeTag: {
      backgroundColor: THEME.accent || "#FF8762",
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 15,
    },

    badgeText: {
      color: isDark ? '#000' : '#FFF',
      fontWeight: '700',
      fontSize: 14,
    },
  });
}