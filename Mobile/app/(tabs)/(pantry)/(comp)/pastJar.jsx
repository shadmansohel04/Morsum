import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { DARKTHEME, LIGHTTHEME } from '../../../../constants/Colors';

const { width } = Dimensions.get('window');

const RADII = {
  lg: 24,
};

function handler(days, month){
  const perc = Math.round((days / 31) * 100)
  const completed = perc >= 100
  return [perc, completed]
}

export default function CompletedJarCard({ jar }) {
  const isdark = useColorScheme() === "dark";
  const THEME = isdark ? DARKTHEME : LIGHTTHEME;
  const styles = createStyles(THEME, isdark);
  
  const [perc, completed] = handler(jar.days, jar.month);
  const colors = completed ? ['#4a5c39', '#2d3a1f'] : ['#5c3a2a', '#3a2015'];
  const router = useRouter();

  return (
    <Pressable
      onPress={()=>{router.push({
        pathname: "oneMonth",
        params: {
          data: JSON.stringify({
            month: jar.month,
            year: jar.year
          })
        }
      })}}
      style={({ pressed }) => [
        styles.gridItem, 
        pressed && { transform: [{ scale: 0.98 }] }
      ]}
    >
      <View style={styles.miniJarContainer}>
        <View style={styles.miniJarRim} />
        
        <LinearGradient 
          colors={colors}
          style={[styles.miniLiquid, { height: `${perc}%` }]} 
        />
        
        <View style={styles.miniLabel}>
          <Text style={styles.miniLabelText}>{jar.month}</Text>
        </View>
      </View>

      <View style={styles.jarMeta}>
        <Text style={styles.jarMonthText}>{jar.month} {jar.year}</Text>
        <Text style={[
          styles.jarDaysText, 
          jar.isComplete ? styles.textSuccess : styles.textMuted
        ]}>
          {jar.days} Days
        </Text>
      </View>
    </Pressable>
  );
}

function createStyles(THEME, isdark) {
  return StyleSheet.create({
    gridItem: {
      width: (width - 48 - 16) / 2, 
      marginBottom: 24,
    },
    miniJarContainer: {
      height: 160,
      backgroundColor: THEME.surface || (isdark ? '#1d201c' : '#FFFFFF'),
      borderRadius: RADII.lg,
      borderTopLeftRadius: 36,
      borderTopRightRadius: 36,
      overflow: 'hidden',
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isdark ? '#252822' : '#E3E7DE',
    },
    miniJarRim: {
      width: 80,
      height: 8,
      backgroundColor: isdark ? '#252822' : '#E3E7DE',
      borderBottomLeftRadius: 6,
      borderBottomRightRadius: 6,
      position: 'absolute',
      top: 0,
      zIndex: 10,
    },
    miniLiquid: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    },
    miniLabel: {
      backgroundColor: THEME.tertiary || (isdark ? '#f7f3ed' : '#FFFFFF'),
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isdark ? 0.3 : 0.1,
      shadowRadius: 6,
      elevation: 5,
    },
    miniLabelText: {
      fontFamily: 'PlusJakartaSans-ExtraBold',
      fontWeight: '800',
      fontSize: 14,
      color: isdark ? '#1d201c' : THEME.text,
    },
    jarMeta: {
      marginTop: 12,
      alignItems: 'center',
    },
    jarMonthText: {
      fontFamily: 'PlusJakartaSans-Bold',
      fontWeight: '700',
      fontSize: 12,
      color: THEME.text,
    },
    jarDaysText: {
      fontFamily: 'Inter-SemiBold',
      fontWeight: '600',
      fontSize: 10,
      marginTop: 4,
    },
    textSuccess: {
      color: THEME.success || '#4CAF50',
    },
    textMuted: {
      color: THEME.textSoft,
      opacity: isdark ? 0.4 : 0.8,
    },
  });
}