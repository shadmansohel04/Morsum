import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, useColorScheme, View } from 'react-native';
import {validateToken} from "@/constants/func"
import { Colors } from '@/constants/Colors';

export default function RootLayout() {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;
  
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const styles = createStyles(colors);

  const extracted = async()=>{
    const profile = await validateToken()
    return profile? router.replace('/(tabs)'): router.replace("/(uauth)")
  }

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    const fetcher = async () => {
      try {
        setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            extracted()
          });
        }, 1000);
      } catch (error) {
        router.replace('(uauth)');
      }
    };
    fetcher();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.text, { opacity, color: colors.textColor }]}>
        Morsum
      </Animated.Text>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      backgroundColor: colors.background,
    },
    text: {
      fontSize: 50,
      fontWeight: '600'
    },
  });
}
