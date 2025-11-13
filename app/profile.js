/**
 * Profile & Settings Screen
 * Purpose: User profile, settings, and preferences
 * Extension: Add avatar upload, theme customization, data export
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import Card from '../components/Card';
import { renderStars } from '../constants/fishData';

export default function ProfileScreen() {
  const router = useRouter();
  const { settings, updateSettings, maxScore, maxLevel, bestTime } = useGameStore();

  const [localSettings, setLocalSettings] = useState(settings);

  const handleToggleSetting = async (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    await updateSettings(newSettings);
  };

  return (
    <LinearGradient colors={['#E0F2FE', '#BAE6FD', '#7DD3FC']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Card style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>🎣</Text>
              </View>
              <Text style={styles.username}>Angler</Text>
            </Card>

            <Card style={styles.statsCard}>
              <Text style={styles.sectionTitle}>Statistics</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Species Collected</Text>
                <Text style={styles.statValue}>{maxScore}/16</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Best Rarity</Text>
                <Text style={styles.statValue}>
                  {maxLevel > 0 ? renderStars(maxLevel) : 'None yet'}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Best Hook Time</Text>
                <Text style={styles.statValue}>
                  {bestTime !== Infinity ? `${(bestTime / 1000).toFixed(2)}s` : 'N/A'}
                </Text>
              </View>
            </Card>

            <Card style={styles.settingsCard}>
              <Text style={styles.sectionTitle}>Settings</Text>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Sound Effects</Text>
                <Switch
                  value={localSettings.soundEnabled}
                  onValueChange={(value) => handleToggleSetting('soundEnabled', value)}
                  trackColor={{ false: '#CBD5E1', true: '#0891B2' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Vibration</Text>
                <Switch
                  value={localSettings.vibrationEnabled}
                  onValueChange={(value) => handleToggleSetting('vibrationEnabled', value)}
                  trackColor={{ false: '#CBD5E1', true: '#0891B2' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Left-Hand Mode</Text>
                <Switch
                  value={localSettings.leftHandMode}
                  onValueChange={(value) => handleToggleSetting('leftHandMode', value)}
                  trackColor={{ false: '#CBD5E1', true: '#0891B2' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </Card>

            <View style={styles.links}>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => router.push('/encyclopedia')}
                activeOpacity={0.7}
              >
                <Text style={styles.linkText}>📚 View Encyclopedia</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => router.push('/about')}
                activeOpacity={0.7}
              >
                <Text style={styles.linkText}>ℹ️ About & Help</Text>
              </TouchableOpacity>
            </View>

            <Card style={styles.debugCard}>
              <Text style={styles.debugTitle}>Debug Info (Dev Only)</Text>
              <Text style={styles.debugText}>maxLevel: {maxLevel}</Text>
              <Text style={styles.debugText}>maxScore: {maxScore}</Text>
              <Text style={styles.debugText}>
                bestTime: {bestTime !== Infinity ? bestTime : 'N/A'}
              </Text>
            </Card>
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
  backButton: {
    padding: 20,
    paddingBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#0891B2',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 40,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  statsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0891B2',
  },
  settingsCard: {
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingLabel: {
    fontSize: 16,
    color: '#0F172A',
  },
  links: {
    gap: 8,
    marginBottom: 16,
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
  debugCard: {
    backgroundColor: '#F1F5F9',
    marginBottom: 20,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
});
