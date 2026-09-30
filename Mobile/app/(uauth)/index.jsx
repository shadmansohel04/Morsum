import { Pressable, KeyboardAvoidingView, ScrollView, useColorScheme, StyleSheet, View, Image, Text, Platform, useWindowDimensions, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from "../../constants/Colors";
import newLogo from "../../assets/images/newLogo.png";
import pantryImg from "../../assets/images/Pantry.png";
import Constants from "expo-constants";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';

const backendURI = Constants.expoConfig.extra.backendURI;

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isdark = colorScheme === 'dark';
  const THEME = isdark ? theme.dark : theme.light;
  const fonts = theme.font;
  const { width: screenWidth } = useWindowDimensions();
  const router = useRouter();
  const styles = createStyles(THEME, isdark, fonts, screenWidth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async()=>{
    try {
      const raw = await fetch(`${backendURI}/account/login`,{
        method: "POST",
        body: JSON.stringify({
          email,
          password
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });
      if(!raw.ok){
        throw Error("login failed");
      }
      const response = await raw.json();
      if (response && response.token){
        await AsyncStorage.setItem("jwt", response.token);
        await AsyncStorage.setItem("username", response.username);
        await AsyncStorage.setItem("avatarUrl", response.avatarUrl);
        await AsyncStorage.setItem("createdat", response.createdAt);
      }
      router.replace("../(tabs)");
    } 
    catch (error) {
      console.log(error);
      alert("Login failed, please try again");
    }
  }

  return(
    <KeyboardAvoidingView
      style={styles.safeArea}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoRow}>
          <View style={styles.logoContainer}>
            <Image source={newLogo} style={styles.logoImage}/>
          </View>
          <Text style={styles.morsumTitle}>Morsum</Text>
        </View>
        <Text style={styles.subtitle}>Your plate, your story</Text>
        <Text style={styles.descriptionText}>Capture the warmth of every meal. Share your daily morsels with those who matter.</Text>
        
        <View style={styles.heroImageContainer}>
          <Image 
            style={styles.heroImage} 
            resizeMode='cover' 
            source={pantryImg}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.labelText}>EMAIL</Text>
          <TextInput 
            onChangeText={setEmail} 
            style={styles.input} 
            placeholder='johnSmith@morsum.com' 
            placeholderTextColor={isdark ? "rgba(227, 231, 222, 0.3)" : "rgba(0,0,0,0.3)"}
            autoCapitalize="none"
          />
          
          <Text style={styles.labelText}>PASSWORD</Text>
          <TextInput 
            onChangeText={setPassword} 
            style={styles.input} 
            placeholder='********' 
            placeholderTextColor={isdark ? "rgba(227, 231, 222, 0.3)" : "rgba(0,0,0,0.3)"} 
            secureTextEntry={true}
          />
          
          <Pressable
            onPress={handleLogin}
            style={styles.buttonShadow}
          >
            <LinearGradient
              colors={['#FF8762', '#FE6F42']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBackground}
            >
              <Text style={styles.buttonText}>Login</Text>
            </LinearGradient>
          </Pressable>
          <Pressable
            onPress={()=>{router.push("signup")}}
            style={styles.signupPressable}
          >
            <Text style={styles.signupTextAccent}>
              <Text style={styles.signupTextNormal}>
                Don't have an account?{" "}
              </Text>
              Get started
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function createStyles(THEME, isdark, fonts, width) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      width: '100%',
      backgroundColor: THEME?.background || (isdark ? '#0d0f0c' : '#FFFFFF'),
    },
    scrollContent: {
      alignItems: "center",
      flexGrow: 1,
      marginTop: 20
    },
    logoRow: {
      flexDirection: "row",
      height: 80,
      width: "65%",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 15
    },
    logoContainer: {
      width: 35,
      height: 35,
      marginRight: 15
    },
    logoImage: {
      width: "100%",
      height: "100%"
    },
    morsumTitle: {
      fontFamily: fonts?.title,
      fontWeight: '900',
      fontSize: 58,
      color: THEME?.titleText || (isdark ? '#FFFFFF' : '#1A1A1A')
    },
    subtitle: {
      marginBottom: 15,
      color: THEME?.boldText || (isdark ? '#FFFFFF' : '#1A1A1A'),
      fontWeight: '700',
      fontSize: 22,
      fontFamily: fonts?.title
    },
    descriptionText: {
      textAlign: "center",
      width: 280,
      color: THEME?.subtleText || (isdark ? '#E3E7DE' : '#666666'),
      fontWeight: '400',
      fontSize: 17,
      fontFamily: fonts?.subText
    },
    heroImageContainer: {
      width: width - 48,
      height: 240,
      borderRadius: 24,
      marginTop: 40
    },
    heroImage: {
      width: "100%",
      height: "100%",
      borderRadius: 24
    },
    inputContainer: {
      width: width - 68,
      marginTop: 10,
    },
    labelText: {
      width: "100%",
      fontFamily: fonts?.capLabel,
      fontSize: 12,
      color: THEME?.subtleText || (isdark ? "#E3E7DE" : "#666666"),
      marginBottom: 8,
    },
    input: {
      width: "100%",
      height: 56,
      backgroundColor: THEME?.surface || (isdark ? "#1d201c" : "#F5F5F5"),
      borderRadius: 12,
      fontFamily: fonts?.title,
      fontSize: 16,
      color: THEME?.titleText || (isdark ? "#E3E7DE" : "#1A1A1A"),
      paddingHorizontal: 16,
      marginBottom: 10
    },
    buttonShadow: {
      height: 54,
      marginTop: 20,
      borderRadius: 16,
      ...Platform.select({
        ios: {
          shadowColor: '#FF8762',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 24,
        },
        android: {
          elevation: 8,
          shadowColor: '#FF8762',
        },
      }),
    },
    gradientBackground: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 16,
    },
    buttonText: {
      fontFamily: 'PlusJakartaSans-Bold', 
      fontSize: 18,
      fontWeight: '700',
      color: isdark ? '#0d0f0c' : '#FFFFFF',
    },
    signupPressable: {
      marginTop: 15,
      alignItems: "center"
    },
    signupTextAccent: {
      color: THEME?.accent || "#FF8762"
    },
    signupTextNormal: {
      color: THEME?.titleText || (isdark ? "#FFFFFF" : "#1A1A1A")
    }
  });
}