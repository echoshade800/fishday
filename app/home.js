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
    <LinearGradient colors={['#E0F2FE', '#BAE6FD', '#7DD3FC']} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>🎣 FishyDay</Text>

          <Card style={styles.triesCard}>
            <Text style={styles.triesLabel}>Tries Today</Text>
            <Text style={styles.triesValue}>{remainingTries}/3</Text>
            {!canFish && (
              <Text style={styles.resetText}>Resets at 00:00</Text>
            )}
          </Card>

          <Button
            title={canFish ? 'Start Fishing' : 'Out of Tries'}
            onPress={handleStartFishing}
            disabled={!canFish}
            style={styles.fishButton}
          />

          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statLabel}>Collected</Text>
              <Text style={styles.statValue}>{maxScore}/16</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statLabel}>Best Rarity</Text>
              <Text style={styles.statValue}>{maxLevel > 0 ? renderStars(maxLevel) : '-'}</Text>
            </Card>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Catches</Text>
            {recentCatches.length === 0 ? (
              <Card>
                <Text style={styles.emptyText}>No catches yet. Try your luck!</Text>
              </Card>
            ) : (
              recentCatches.map((catchItem) => (
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
              ))
            )}
          </View>

          <View style={styles.quickLinks}>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/encyclopedia')}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>📚 Encyclopedia</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/profile')}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>👤 Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/about')}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>ℹ️ About & Help</Text>
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
    color: '#0891B2',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 20,
    textAlign: 'center',
  },
  triesCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  triesLabel: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  triesValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0891B2',
  },
  resetText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
  },
  fishButton: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0891B2',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  catchCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catchInfo: {
    flex: 1,
  },
  catchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  catchRarity: {
    fontSize: 14,
    color: '#FCD34D',
  },
  catchTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  quickLinks: {
    gap: 8,
  },
  linkButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0891B2',
  },
});
