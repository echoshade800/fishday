/**
 * Home/Dashboard Screen
 * Purpose: Overview of game state, quick actions, recent catches
 * Extension: Add statistics, achievements, daily rewards
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGameStore } from '../store/gameStore';
import { BookOpen, User } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    initialize,
    isLoading,
    getRemainingTries,
    maxScore,
    maxLevel
  } = useGameStore();

  useEffect(() => {
    initialize();
  }, []);

  const remainingTries = getRemainingTries();
  const canFish = remainingTries > 0;

  const handleStartFishing = () => {
    if (canFish) {
      router.push('/fishing');
    }
  };

  if (isLoading) {
    return (
      <ImageBackground
        source={{ uri: 'https://osopsbsfioallukblucj.supabase.co/storage/v1/object/public/fishy/homebackground.png' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={{ uri: 'https://osopsbsfioallukblucj.supabase.co/storage/v1/object/public/fishy/homebackground.png' }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.content}>
          {/* Main title */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>🎣 FishyDay</Text>
            <Text style={styles.mainSubtitle}>Relax. Cast. Catch.</Text>
          </View>

          {/* Center content with button and cards */}
          <View style={styles.centerContent}>
            {/* Main action button */}
            <TouchableOpacity
              style={[styles.mainButton, !canFish && styles.mainButtonDisabled]}
              onPress={handleStartFishing}
              disabled={!canFish}
              activeOpacity={0.8}
            >
              <Text style={styles.mainButtonText}>
                {canFish ? '▶ Go to Fish' : 'Out of Tries'}
              </Text>
            </TouchableOpacity>

            {/* Navigation buttons */}
            <View style={styles.navButtonRow}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => router.push('/encyclopedia')}
                activeOpacity={0.8}
              >
                <BookOpen size={32} color="#0891B2" strokeWidth={2.5} />
                <Text style={styles.navButtonText}>Fish Book</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navButton}
                onPress={() => router.push('/profile')}
                activeOpacity={0.8}
              >
                <User size={32} color="#0891B2" strokeWidth={2.5} />
                <Text style={styles.navButtonText}>Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats dashboard */}
          <View style={styles.statsDashboard}>
            <View style={styles.statsDivider} />
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Tries Today</Text>
                <Text style={styles.statValue}>{remainingTries}/3</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Collected</Text>
                <Text style={styles.statValue}>{maxScore}/16</Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  mainTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1E3A5F',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  mainSubtitle: {
    fontSize: 18,
    color: '#1E3A5F',
    textAlign: 'center',
    opacity: 0.8,
    fontStyle: 'italic',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  mainButton: {
    width: '65%',
    backgroundColor: '#0891B2',
    paddingVertical: 20,
    borderRadius: 30,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mainButtonDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  mainButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
  },
  navButtonRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  navButton: {
    width: 100,
    height: 100,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    gap: 8,
  },
  navButtonText: {
    fontSize: 13,
    color: '#1E3A5F',
    fontWeight: '600',
  },
  statsDashboard: {
    width: '100%',
    marginTop: 16,
  },
  statsDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
