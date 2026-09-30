import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing, Pressable, useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { DARKTHEME, LIGHTTHEME } from '../../../../constants/Colors';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export default function AnimatedHeroJar({
  month = "JAN",
  year = "2026",
  filled = 2,
  total = 31,
}) {
  const isdark = useColorScheme() === "dark";
  const THEME = isdark ? DARKTHEME : LIGHTTHEME;
  const styles = createStyles(THEME, isdark);

  const [boxH, setBoxH] = useState(0);
  const normalized = clamp(filled, 0, total) / total;
  const waterH = boxH * normalized;
  const isComplete = filled >= total;
  const router = useRouter();

  const particles = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const leftPct = [18, 35, 55, 72, 28, 62, 44][i];
      const size = [10, 6, 8, 5, 7, 6, 9][i];
      const bottomPct = [20, 45, 30, 60, 15, 52, 38][i];

      const floatPx = [8, 5, 7, 4, 6, 5, 7][i];
      const driftPx = [4, 2, 3, 2, 3, 2, 4][i];
      const duration = [2600, 3100, 2800, 3400, 3000, 3600, 2900][i];
      const delay = [0, 250, 500, 150, 700, 350, 900][i];

      return { key: `p-${i}`, leftPct, bottomPct, size, floatPx, driftPx, duration, delay };
    });
  }, []);

  const anim = useRef(
    particles.map(() => ({
      y: new Animated.Value(0),
      x: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    const loops = particles.map((p, idx) => {
      const yLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim[idx].y, {
            toValue: -p.floatPx,
            duration: p.duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
            delay: p.delay,
          }),
          Animated.timing(anim[idx].y, {
            toValue: 0,
            duration: p.duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      const xLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim[idx].x, {
            toValue: p.driftPx,
            duration: Math.round(p.duration * 0.9),
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
            delay: Math.round(p.delay / 2),
          }),
          Animated.timing(anim[idx].x, {
            toValue: -p.driftPx,
            duration: Math.round(p.duration * 0.9),
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim[idx].x, {
            toValue: 0,
            duration: Math.round(p.duration * 0.9),
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      yLoop.start();
      xLoop.start();

      return { yLoop, xLoop };
    });

    return () => {
      anim.forEach((a) => {
        a.x.stopAnimation();
        a.y.stopAnimation();
      });
    };
  }, [particles, anim]);

  return (
    <Pressable 
      style={styles.heroJarContainer}
      onPress={()=>{router.push({
        pathname:"oneMonth",
        params: {
          data: JSON.stringify({
            month,
            year
          })
        }
      })}}
    >
      <View
        style={styles.heroJar}
        onLayout={(e) => setBoxH(e.nativeEvent.layout.height)}
      >
        <View style={styles.jarRim} />

        <LinearGradient
          colors={isComplete ? ['#4CAF50', '#2E7D32'] : ['#e86a43', '#bd4522']}
          style={[styles.water, { height: waterH }]}
        >
          {particles.map((p, idx) => (
            <Animated.View
              key={p.key}
              style={[
                styles.particle,
                {
                  width: p.size,
                  height: p.size,
                  borderRadius: p.size / 2,
                  left: `${p.leftPct}%`,
                  bottom: `${p.bottomPct}%`,
                  transform: [
                    { translateY: anim[idx].y },
                    { translateX: anim[idx].x },
                  ],
                },
              ]}
            />
          ))}
        </LinearGradient>

        <View pointerEvents="none" style={styles.topShade} />

        <View style={styles.heroLabel}>
          <Text style={styles.heroLabelMonth}>{month}</Text>
          <View style={styles.heroLabelDivider} />
          <Text style={styles.heroLabelYear}>{year}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function createStyles(THEME, isdark) {
  return StyleSheet.create({
    heroJarContainer: {
      width: 240,
      height: 280,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroJar: {
      width: '100%',
      height: '100%',
      backgroundColor: THEME.surface || (isdark ? '#171915' : '#FFFFFF'),
      borderRadius: 40,
      borderTopLeftRadius: 50,
      borderTopRightRadius: 50,
      overflow: 'hidden',
      position: 'relative',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isdark ? '#252822' : '#E3E7DE',
    },
    jarRim: {
      width: 140,
      height: 12,
      backgroundColor: isdark ? '#252822' : '#E3E7DE',
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      position: 'absolute',
      top: 0,
      zIndex: 10,
    },
    water: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    },
    particle: {
      position: 'absolute',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      opacity: 0.35,
      shadowColor: '#fff',
      shadowOpacity: 0.35,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 0 },
    },
    topShade: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height: '55%',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    heroLabel: {
      position: 'absolute',
      top: '35%',
      width: 115,
      height: 70,
      backgroundColor: THEME.tertiary || (isdark ? '#f7f3ed' : '#FFFFFF'),
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isdark ? 0.25 : 0.1,
      shadowRadius: 10,
      elevation: 6,
      transform: [
        { rotate: '-3deg' },
        { translateY: -2 },
        { translateX: 2 },
      ],
    },
    heroLabelMonth: {
      fontFamily: 'PlusJakartaSans-ExtraBold',
      fontWeight: '800',
      fontSize: 26,
      color: isdark ? '#2d3329' : '#1d201c', 
      letterSpacing: 1,
      marginTop: 2,
    },
    heroLabelDivider: {
      width: 46,
      height: 2,
      backgroundColor: 'rgba(0,0,0,0.15)',
      marginVertical: 4,
      borderRadius: 2,
    },
    heroLabelYear: {
      fontFamily: 'PlusJakartaSans-Bold',
      fontWeight: '800',
      fontSize: 10,
      color: '#6e6a64',
      letterSpacing: 2,
    },
  });
}