/**
 * Settings Screen
 * Purpose: User preferences for sound and vibration
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import Card from '../components/Card';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useGameStore();

  const handleToggleSetting = async (key, value) => {
    await updateSettings({ [key]: value });
  };

  return (
    <LinearGradient colors={['#E0F2FE', '#BAE6FD', '#7DD3FC']} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Card style={styles.settingsCard}>
              <Text style={styles.sectionTitle}>Settings</Text>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Sound Effects</Text>
                <Switch
                  value={settings.soundEnabled}
                  onValueChange={(value) => handleToggleSetting('soundEnabled', value)}
                  trackColor={{ false: '#CBD5E1', true: '#0891B2' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Vibration</Text>
                <Switch
                  value={settings.vibrationEnabled}
                  onValueChange={(value) => handleToggleSetting('vibrationEnabled', value)}
                  trackColor={{ false: '#CBD5E1', true: '#0891B2' }}
                  thumbColor="#FFFFFF"
                />
              </View>
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
    marginTop: 20,
    zIndex: 100,
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
    paddingTop: 20,
  },
  settingsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
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
});
