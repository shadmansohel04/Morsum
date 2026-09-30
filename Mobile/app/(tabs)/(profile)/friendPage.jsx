import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme
} from 'react-native';
import { DARKTHEME, LIGHTTHEME } from "../../../constants/Colors";

const backendURI = Constants.expoConfig.extra.backendURI;

export default function FriendsPage() {
  const isdark = useColorScheme() === "dark";
  const THEME = isdark ? DARKTHEME : LIGHTTHEME;
  const styles = createStyles(THEME, isdark);

  const router = useRouter();
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState([]);

  const start = async () => {
    try {
      const jwt = await AsyncStorage.getItem("jwt");
      const raw = await fetch(`${backendURI}/account/getFriends`, {
        headers: {
          "Authorization": jwt
        }
      });
      if (!raw.ok) {
        return;
      }
      const response = await raw.json();
      setFriends(response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    start();
  }, []);

  const handleRequest = async (username) => {
    try {
      const jwt = await AsyncStorage.getItem("jwt");
      const raw = await fetch(`${backendURI}/account/friendRequest`, {
        method: "POST",
        headers: {
          "Authorization": jwt,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username
        })
      });
      if (!raw.ok) {
        return;
      }
      const response = await raw.json();
      setSearch((prev) => {
        return prev.filter((each) => each.username !== username);
      });
      start();

    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (friendID) => {
    try {
      const jwt = await AsyncStorage.getItem("jwt");
      const raw = await fetch(`${backendURI}/account/deleteFriend`, {
        method: "DELETE",
        headers: {
          "Authorization": jwt,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          friendID: friendID.toString()
        })
      });
      if (!raw.ok) {
        return;
      }
      const response = await raw.json();
      console.log(response);
      setFriends((prev) => {
        return prev.filter((friend) => friend.userid !== friendID);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleApprove = async (friendID) => {
    try {
      const jwt = await AsyncStorage.getItem("jwt");
      const raw = await fetch(`${backendURI}/account/acceptFriend`, {
        method: "POST",
        headers: {
          "Authorization": jwt,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          friendID
        })
      });
      if (!raw.ok) {
        return;
      }
      const response = await raw.json();
      console.log(response);
      
      setFriends((prev) =>
        prev.map((friend) =>
          friend.userid === friendID ? { ...friend, accepted: true } : friend
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const searchPeople = async () => {
    try {
      const jwt = await AsyncStorage.getItem("jwt");
      const raw = await fetch(`${backendURI}/account/findPeople`, {
        method: "POST",
        headers: {
          "Authorization": jwt,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          search: searchQuery
        })
      });
      if (!raw.ok) {
        return;
      }
      const response = await raw.json();
      setSearch(response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        searchPeople();
      } else {
        setSearch([]);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const renderActionButtons = (item) => {
    if (activeTab === 'search') {
      return (
        <Pressable 
          onPress={() => handleRequest(item.username)}
          style={styles.actionButton}
        >
          <MaterialIcons name="person-add" size={20} color={THEME.textSoft || (isdark ? "#E3E7DE" : "#666666")} />
        </Pressable>
      );
    }

    if (item.accepted) {
      return (
        <Pressable 
          onPress={() => handleDelete(item.userid)}
          style={styles.actionButton}
        >
          <MaterialIcons name="person-remove" size={20} color={THEME.textSoft || (isdark ? "#E3E7DE" : "#666666")} />
        </Pressable>
      );
    }

    if (item.requested === item.userid) {
      return (
        <View style={styles.actionButtonRow}>
          <Pressable 
            onPress={() => handleApprove(item.userid)}
            style={[styles.actionButton, styles.approveButton]}
          >
            <MaterialIcons name="check" size={20} color={THEME.accent || "#FF8762"} />
          </Pressable>
          <Pressable 
            onPress={() => handleDelete(item.userid)}
            style={styles.actionButton}
          >
            <MaterialIcons name="close" size={20} color={THEME.textSoft || (isdark ? "#E3E7DE" : "#666666")} />
          </Pressable>
        </View>
      );
    }

    return (
      <Pressable 
        onPress={() => handleDelete(item.userid)}
        style={styles.actionButton}
      >
        <MaterialIcons name="cancel-schedule-send" size={20} color={THEME.textSoft || (isdark ? "#E3E7DE" : "#666666")} />
      </Pressable>
    );
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userRow}>
      <View style={styles.userInfo}>
        {item.avatarurl ? 
        <Image 
          source={{ uri: item.avatarurl }} 
          style={styles.avatarImage} 
          cachePolicy="disk"
        /> : 
        (
        <View
          style={{
            backgroundColor: isdark ? "rgba(255, 135, 98, 0.5)" : "rgba(255, 135, 98, 0.3)",
            width: 45,
            height: 45,
            borderRadius: 22.5,
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Text
            style={{ color: isdark ? "white" : "#1A1A1A", fontSize: 20 }}
          >
            {item.username ? item.username[0].toUpperCase() : ""}
          </Text>
        </View>
        )}
        <Text style={styles.usernameText}>{item.username}</Text>
      </View>
      
      {/* Call the new render function here */}
      {renderActionButtons(item)}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={20} color={THEME.text || "#FFFFFF"} />
        </Pressable>
        <Text style={styles.headerTitle}>Friends</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <View style={styles.tabContainer}>
        <Pressable 
          onPress={() => setActiveTab('friends')} 
          style={[styles.tabButton, activeTab === 'friends' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            My Friends
          </Text>
        </Pressable>
        <Pressable 
          onPress={() => setActiveTab('search')} 
          style={[styles.tabButton, activeTab === 'search' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
            Search
          </Text>
        </Pressable>
      </View>

      {activeTab === 'search' && (
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={THEME.textSoft || "#888"} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Find new friends..."
            placeholderTextColor={THEME.textSoft || "#888"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
      )}

      <FlatList
        data={activeTab === 'friends' ? friends : search}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderUserItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

function createStyles(THEME, isdark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: THEME.bg || (isdark ? '#0d0f0c' : '#FFFFFF'),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 20,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: THEME.text || (isdark ? '#FFFFFF' : '#1A1A1A'),
    },
    headerRightPlaceholder: {
      width: 40,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: THEME.surface || (isdark ? '#141612' : '#F5F5F5'),
      marginHorizontal: 24,
      borderRadius: 100,
      padding: 4,
      marginBottom: 20,
    },
    tabButton: {
      flex: 1,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 100,
    },
    activeTab: {
      backgroundColor: isdark ? 'rgba(255, 135, 98, 0.15)' : 'rgba(255, 135, 98, 0.2)',
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: THEME.textSoft || (isdark ? '#E3E7DE' : '#666666'),
      opacity: 0.6,
    },
    activeTabText: {
      color: THEME.accent || '#FF8762',
      opacity: 1,
      fontWeight: '700',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isdark ? '#1d201c' : '#EAEAEA',
      marginHorizontal: 24,
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 48,
      marginBottom: 16,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      color: THEME.text || (isdark ? '#FFFFFF' : '#1A1A1A'),
      fontSize: 15,
      fontWeight: '500',
    },
    listContent: {
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    userRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: THEME.surface || (isdark ? '#141612' : '#F5F5F5'),
      padding: 12,
      borderRadius: 16,
      marginBottom: 12,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarImage: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isdark ? '#1d201c' : '#EAEAEA',
    },
    usernameText: {
      marginLeft: 16,
      fontSize: 16,
      fontWeight: '700',
      color: THEME.text || (isdark ? '#FFFFFF' : '#1A1A1A'),
    },
    actionButtonRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isdark ? '#1d201c' : '#EAEAEA',
      justifyContent: 'center',
      alignItems: 'center',
    },
    approveButton: {
      backgroundColor: isdark ? 'rgba(255, 135, 98, 0.15)' : 'rgba(255, 135, 98, 0.2)',
      marginRight: 8,
    }
  });
}