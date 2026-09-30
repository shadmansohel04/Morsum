import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  Dimensions,
  RefreshControl,
  useColorScheme
} from 'react-native';
import Constants from "expo-constants";
import AsyncStorage from '@react-native-async-storage/async-storage';

import AnimatedHeroJar from './(comp)/spotlightJar';
import CompletedJarCard from './(comp)/pastJar';
import { format } from '../../../constants/dateHelper';

const backendURI = Constants.expoConfig.extra.backendURI;
const { width } = Dimensions.get('window');
import {DARKTHEME, LIGHTTHEME} from "../../../constants/Colors"

const RADII = {
  sm: 8,
  md: 16,
  lg: 24,
  hero: 32,
  pill: 100,
};

const MONTHS_PER_LOAD = 12;

export default function MyPantryScreen() {
  const [jars, setJars] = useState([]);
  const [heroJar, setHeroJar] = useState({ month: '...', year: '', days: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [monthsOffset, setMonthsOffset] = useState(0);
  const [databaseOffset, setDatabaseOffset] = useState(0);
  const [availableJars, setAvailableJars] = useState({});
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [canPull, setCanPull] = useState(true);
  const [JOIN_DATE, set_JOIN_DATE] = useState(null);
  const [morsels, setMorsels] = useState(null);
  const isdark = useColorScheme() === "dark";
  const THEME = isdark ? DARKTHEME : LIGHTTHEME;
  const styles = createStyles(THEME, isdark);

  const loadMoreMonths = async (isRefresh = false) => {
    if ((isLoading && !isRefresh) || (hasReachedEnd && !isRefresh)) return;

    let joinDate = JOIN_DATE;

    if (!joinDate) {
      const date = await AsyncStorage.getItem("createdat");
      if (date) {
        const parsed = new Date(date);
        set_JOIN_DATE(parsed);
        joinDate = parsed;
      } else {
        joinDate = new Date("2025-01-01");
      }
    }

    const boundedJoinDate = new Date(joinDate);
    boundedJoinDate.setMonth(boundedJoinDate.getMonth() - 2);
    boundedJoinDate.setDate(1);

    setIsLoading(true);

    try {
      let currentAvailableJars = isRefresh ? {} : { ...availableJars };
      let currentDatabaseOffset = isRefresh ? 0 : databaseOffset;
      let currentMonthsOffset = isRefresh ? 0 : monthsOffset;
      let currentCanPull = isRefresh ? true : canPull;

      if (Object.keys(currentAvailableJars).length < 3 && currentCanPull) {
        const jwt = await AsyncStorage.getItem("jwt");
        const response = await fetch(
          `${backendURI}/Post/getJars?offsetParam=${currentDatabaseOffset}&total=${isRefresh ? true : morsels === null}`,
          {
            headers: { Authorization: jwt },
          }
        );

        if (response.ok) {
          const responseJSON = await response.json();
          const fetchedJars = responseJSON.jars;
          
          if (isRefresh || !morsels) {
            setMorsels(responseJSON.total);
          }

          if (Object.keys(fetchedJars).length === 0) {
            setCanPull(false);
            currentCanPull = false;
          } else {
            currentAvailableJars = { ...currentAvailableJars, ...fetchedJars };
            setDatabaseOffset(currentDatabaseOffset + 1);
          }
        } else {
          setCanPull(false);
          currentCanPull = false;
        }
      }

      const newItems = [];
      let hitJoinDate = false;
      const currentDate = new Date();

      if (currentMonthsOffset === 0) {
        const currentMonthName = currentDate.toLocaleString("en-US", {
          month: "long",
        });
        const currentYear = currentDate.getFullYear();
        const currentKey = `${currentMonthName} ${currentYear}`;

        let currentDays = 0;
        if (currentAvailableJars[currentKey] !== undefined) {
          currentDays = currentAvailableJars[currentKey];
          delete currentAvailableJars[currentKey];
        }

        setHeroJar({
          month: currentDate
            .toLocaleString("en-US", { month: "short" })
            .toUpperCase(),
          year: currentYear.toString(),
          days: currentDays,
        });
      }

      for (let i = 0; i < MONTHS_PER_LOAD; i++) {
        const targetDate = new Date();
        targetDate.setMonth(
          targetDate.getMonth() - (currentMonthsOffset + i + 1)
        );

        if (targetDate < boundedJoinDate) {
          hitJoinDate = true;
          break;
        }

        const monthName = targetDate.toLocaleString("en-US", {
          month: "long",
        });
        const year = targetDate.getFullYear();
        const dateKey = `${monthName} ${year}`;
        const shortMonth = targetDate
          .toLocaleString("en-US", { month: "short" })
          .toUpperCase();

        let daysFilled = 0;
        if (currentAvailableJars[dateKey] !== undefined) {
          daysFilled = currentAvailableJars[dateKey];
          delete currentAvailableJars[dateKey];
        }

        newItems.push({
          id: dateKey,
          month: shortMonth,
          year: year,
          days: daysFilled,
        });
      }

      setAvailableJars(currentAvailableJars);
      setJars(isRefresh ? newItems : (prev) => [...prev, ...newItems]);
      setMonthsOffset(currentMonthsOffset + newItems.length);

      if (hitJoinDate) {
        setHasReachedEnd(true);
      } else if (isRefresh) {
        setHasReachedEnd(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMoreMonths(true);
  }, [JOIN_DATE]);

  const renderHeader = () => (
    <View>
      <View style={styles.heroSection}>
        <View style={styles.heroJarContainer}>
          {heroJar.year !== "" ? (
            <AnimatedHeroJar month={heroJar.month} year={heroJar.year} filled={heroJar.days} />
          ) : null}
        </View>

        <Text style={styles.heroTitle}>This Month's Jar</Text>
        <Text style={styles.heroSub}>{format(heroJar.month, heroJar.year, heroJar.days)}</Text>
        <Text style={styles.heroDesc}>
          Keep the streak alive.
        </Text>
      </View>

      <View style={styles.completedSectionHeader}>
        <Text style={styles.sectionTitle}>Past Jars</Text>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      {isLoading && !hasReachedEnd && !refreshing ? (
        <ActivityIndicator size="small" color={THEME.accent} style={{ marginVertical: 20 }} />
      ) : null}
      
      <View style={styles.statsCard}>
        <View>
          <Text style={styles.statsLabel}>PANTRY LIFETIME</Text>
          <Text style={styles.statsValue}>{morsels} Morsels</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={jars}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => <CompletedJarCard jar={item} />}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        columnWrapperStyle={styles.rowWrapper}
        onEndReached={() => loadMoreMonths(false)}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.accent}
            colors={[THEME.accent]}
          />
        }
      />
    </View>
  );
}

function createStyles(THEME){
 return(
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: THEME.bg,
      },
      scrollContent: {
        paddingBottom: 40,
      },
      heroSection: {
        marginTop: 32,
        alignItems: 'center',
      },
      heroJarContainer: {
        width: 240,
        height: 280,
        alignItems: 'center',
        justifyContent: 'center',
      },
      heroTitle: {
        fontFamily: 'PlusJakartaSans-Bold',
        fontWeight: '700',
        fontSize: 22,
        color: THEME.text,
        marginTop: 24,
      },
      heroSub: {
        fontFamily: 'Inter-ExtraBold',
        fontWeight: '800',
        fontSize: 11,
        color: THEME.accent,
        letterSpacing: 1.65,
        marginTop: 8,
        textTransform: 'uppercase'
      },
      heroDesc: {
        fontFamily: 'BeVietnamPro-Regular',
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 20,
        color: THEME.textSoft,
        opacity: 0.7,
        marginTop: 12,
        textAlign: 'center',
        paddingHorizontal: 48,
      },
      completedSectionHeader: {
        marginTop: 48,
        marginBottom: 20,
        paddingHorizontal: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      },
      sectionTitle: {
        fontFamily: 'PlusJakartaSans-Bold',
        fontWeight: '700',
        fontSize: 18,
        color: THEME.text,
      },
      rowWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 16,
      },
      footerContainer: {
        paddingBottom: 20,
      },
      statsCard: {
        marginTop: 20,
        marginHorizontal: 24,
        backgroundColor: THEME.surfaceElevated,
        borderRadius: RADII.md,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      statsLabel: {
        fontFamily: 'Inter-Bold',
        fontWeight: '700',
        fontSize: 10,
        color: THEME.textSoft,
        opacity: 0.5,
        letterSpacing: 1.0,
        textTransform: 'uppercase',
      },
      statsValue: {
        fontFamily: 'PlusJakartaSans-ExtraBold',
        fontWeight: '800',
        fontSize: 28,
        color: THEME.text,
        marginTop: 4,
      },
    })
 ) 
}