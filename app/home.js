/**
 * Home/Dashboard Screen
 * Purpose: Overview of game state, quick actions, recent catches
 * Extension: Add statistics, achievements, daily rewards
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import Card from '../components/Card';
import Button from '../components/Button';
import { renderStars } from '../constants/fishData';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    initialize,
    isLoading,
    getRemainingTries,
    getRecentCatches,
    maxScore
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
  const recentCatches = getRecentCatches();
  const canFish = remainingTries > 0;

  const handleStartFishing = () => {
    if (canFish) {
      router.push('/fishing');
    }
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#E0F2FE', '#BAE6FD', '#7DD3FC']} style={styles.gradient}>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0EA5E9', '#06B6D4', '#67E8F9']} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.welcomeSection}>
            <Text style={styles.emoji}>🎣</Text>
            <Text style={styles.title}>Relax. Cast. Catch.</Text>
            <Text style={styles.subtitle}>Quick fishing breaks · 3 tries per day</Text>
          </View>

          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statLabel}>Tries Today</Text>
              <Text style={styles.statValue}>{remainingTries}/3</Text>
              {!canFish && (
                <Text style={styles.resetText}>Resets at 00:00</Text>
              )}
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statLabel}>Collected</Text>
              <Text style={styles.statValue}>{maxScore}/16</Text>
            </Card>
          </View>

          <Button
            title={canFish ? 'Start Fishing' : 'Out of Tries'}
            onPress={handleStartFishing}
            disabled={!canFish}
            style={styles.fishButton}
          />

          {recentCatches.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Catches</Text>
              {recentCatches.slice(0, 2).map((catchItem) => (
                <TouchableOpacity
                  key={catchItem.id}
                  onPress={() => router.push(`/details/${catchItem.fishId}`)}
                  activeOpacity={0.7}
                >
                  <Card style={styles.catchCard}>
                    <View style={styles.catchInfo}>
                      <Text style={styles.catchName}>{catchItem.fishName}</Text>
                      <Text style={styles.catchRarity}>{renderStars(catchItem.rarity)}</Text>
                    </View>
                    <Text style={styles.catchTime}>
                      {new Date(catchItem.timestamp).toLocaleTimeString()}
                    </Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.quickLinks}>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/encyclopedia')}
              activeOpacity={0.7}
            >
              <Text style={styles.linkIcon}>📚</Text>
              <Text style={styles.linkText}>Encyclopedia</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/profile')}
              activeOpacity={0.7}
            >
              <Text style={styles.linkIcon}>👤</Text>
              <Text style={styles.linkText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/about')}
              activeOpacity={0.7}
            >
              <Text style={styles.linkIcon}>ℹ️</Text>
              <Text style={styles.linkText}>About</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#F0F9FF',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0891B2',
  },
  resetText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
  },
  fishButton: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  catchCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  catchInfo: {
    flex: 1,
  },
  catchName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  catchRarity: {
    fontSize: 12,
    color: '#FCD34D',
  },
  catchTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  quickLinks: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  linkButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  linkIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  linkText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0891B2',
  },
});
