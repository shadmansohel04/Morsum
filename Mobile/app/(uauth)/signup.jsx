import { 
  Pressable, 
  KeyboardAvoidingView, 
  ScrollView,
  useColorScheme,
  StyleSheet,
  View,
  Image,
  Text,
  Platform,
  useWindowDimensions,
  TextInput,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { theme } from "../../constants/Colors";
import newLogo from "../../assets/images/newLogo.png";
import Constants from "expo-constants";

const backendURI = Constants.expoConfig.extra.backendURI;

export default function SignUpScreen() {
  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const colorScheme = useColorScheme();
  const isdark = colorScheme === 'dark';
  const THEME = isdark ? theme.dark : theme.light;
  const fonts = theme.font;
  const { width: screenWidth } = useWindowDimensions();
  const router = useRouter();
  const styles = createStyles(THEME, isdark, fonts, screenWidth);

  const isValidEmail = (v) => /\S+@\S+\.\S+/.test(v);
  
  const validate = () => {
    if (!username.trim()) return 'Please enter a username';
    if (!email.trim() || !isValidEmail(email)) return 'Please enter a valid email';
    if (!password) return 'Please enter a password';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return null;
  };

  const handleSignUp = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Invalid Input', error);
      return;
    }

    try {
      setLoading(true);
      const raw = await fetch(`${backendURI}/account/createAccount`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          username: username.trim()
        }),
      });

      const res = await raw.json();
      if (res && res.success) {
        return router.back();
      }
      throw new Error('Signup failed');
    } catch (e) {
      console.log(e);
      Alert.alert('Sign Up Failed', 'Please try again.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return(
    <KeyboardAvoidingView
      style={styles.safeArea}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
          <Text style={styles.subtitle}>Join the table</Text>
          <Text style={styles.descriptionText}>
            Create an account to start sharing your daily morsels with those who matter.
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.labelText}>USERNAME</Text>
            <TextInput 
              style={styles.input} 
              placeholder='johnsmith' 
              placeholderTextColor={isdark ? "rgba(227, 231, 222, 0.3)" : "rgba(0,0,0,0.3)"}
              value={username}
              onChangeText={setUserName}
              autoCapitalize="none"
            />

            <Text style={styles.labelText}>EMAIL</Text>
            <TextInput 
              style={styles.input} 
              placeholder='johnSmith@morsum.com' 
              placeholderTextColor={isdark ? "rgba(227, 231, 222, 0.3)" : "rgba(0,0,0,0.3)"}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <Text style={styles.labelText}>PASSWORD</Text>
            <TextInput 
              style={styles.input} 
              placeholder='********' 
              placeholderTextColor={isdark ? "rgba(227, 231, 222, 0.3)" : "rgba(0,0,0,0.3)"} 
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
            />
            
            <Pressable style={styles.buttonShadow} onPress={handleSignUp} disabled={loading}>
              <LinearGradient
                colors={['#FF8762', '#FE6F42']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBackground}
              >
                {loading ? (
                  <ActivityIndicator color={isdark ? "#0d0f0c" : "#FFFFFF"} />
                ) : (
                  <Text style={styles.buttonText}>Sign Up</Text>
                )}
              </LinearGradient>
            </Pressable>
            
            <Pressable
              onPress={()=>{router.back()}}
              style={styles.loginPressable}
            >
              <Text style={styles.loginTextAccent}>
                <Text style={styles.loginTextNormal}>
                  Already have an account?{" "}
                </Text>
                Log in
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
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
      marginTop: 20,
      paddingBottom: 40
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
    inputContainer: {
      width: width - 68,
      marginTop: 40,
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
      marginBottom: 20
    },
    buttonShadow: {
      height: 54,
      marginTop: 10,
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
    loginPressable: {
      marginTop: 15,
      alignItems: "center"
    },
    loginTextAccent: {
      color: THEME?.accent || "#FF8762"
    },
    loginTextNormal: {
      color: THEME?.titleText || (isdark ? "#FFFFFF" : "#1A1A1A")
    }
  });
}