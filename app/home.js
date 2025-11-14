/**
 * Home/Dashboard Screen
 * Purpose: Overview of game state, quick actions, recent catches
 * Extension: Add statistics, achievements, daily rewards
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ImageBackground } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGameStore } from '../store/gameStore';

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

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    initialize();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await initialize();
    setRefreshing(false);
  };

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
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Top decoration */}
          <View style={styles.topDecoration}>
            <Text style={styles.decorationEmoji}>🎣</Text>
          </View>

          {/* Main title */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>FishyDay</Text>
            <Text style={styles.mainSubtitle}>Relax. Cast. Catch.</Text>
          </View>

          {/* Feature cards */}
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🌊</Text>
            <Text style={styles.featureText}>Peaceful oceanic experience</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🐠</Text>
            <Text style={styles.featureText}>Collect 16 unique fish species</Text>
          </View>

          {/* Main action button */}
          <TouchableOpacity
            style={[styles.mainButton, !canFish && styles.mainButtonDisabled]}
            onPress={handleStartFishing}
            disabled={!canFish}
            activeOpacity={0.8}
          >
            <Text style={styles.mainButtonText}>
              {canFish ? 'Start Fishing' : 'Out of Tries'}
            </Text>
          </TouchableOpacity>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Tries Today</Text>
              <Text style={styles.statValue}>{remainingTries}/3</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Best Rarity</Text>
              <Text style={styles.statValue}>{maxLevel}/5</Text>
            </View>
          </View>

          {/* Navigation buttons */}
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/encyclopedia')}
            activeOpacity={0.8}
          >
            <Text style={styles.navButtonIcon}>📚</Text>
            <Text style={styles.navButtonText}>Encyclopedia</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.navButtonIcon}>👤</Text>
            <Text style={styles.navButtonText}>Profile</Text>
          </TouchableOpacity>

          {/* Footer text */}
          <Text style={styles.footerText}>
            Collected: {maxScore}/16 species
          </Text>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    alignItems: 'center',
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
  topDecoration: {
    marginTop: 20,
    marginBottom: 20,
  },
  decorationEmoji: {
    fontSize: 60,
    textAlign: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1E3A5F',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  mainSubtitle: {
    fontSize: 16,
    color: '#1E3A5F',
    textAlign: 'center',
    opacity: 0.8,
    fontStyle: 'italic',
  },
  featureCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#1E3A5F',
    fontWeight: '500',
    flex: 1,
  },
  mainButton: {
    width: '100%',
    backgroundColor: '#0891B2',
    paddingVertical: 20,
    borderRadius: 20,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
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
    letterSpacing: 0.5,
  },
  statsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(186, 230, 253, 0.7)',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0C4A6E',
  },
  navButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(224, 242, 254, 0.85)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  navButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  navButtonText: {
    fontSize: 18,
    color: '#1E3A5F',
    fontWeight: '600',
  },
  footerText: {
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.9,
  },
});
