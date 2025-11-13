/**
 * Onboarding Screen
 * Purpose: Welcome new users with value proposition and basic info
 * Extension: Add more slides, animations, or preference collection
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/Button';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleGetStarted = () => {
    router.replace('/home');
  };

  return (
    <LinearGradient colors={['#0EA5E9', '#06B6D4', '#67E8F9']} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.emoji}>🎣</Text>
            <Text style={styles.title}>Relax. Cast. Catch.</Text>
            <Text style={styles.subtitle}>A mini fishing game for quick breaks.</Text>
          </View>

          <View style={styles.features}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🌊</Text>
              <Text style={styles.featureText}>Peaceful oceanic experience</Text>
            </View>

            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🐟</Text>
              <Text style={styles.featureText}>Collect 16 unique fish species</Text>
            </View>

            <View style={styles.feature}>
              <Text style={styles.featureIcon}>⏱️</Text>
              <Text style={styles.featureText}>Quick 1-3 minute sessions</Text>
            </View>
          </View>

          <View style={styles.note}>
            <Text style={styles.noteText}>
              You have <Text style={styles.noteBold}>3 tries per day</Text>
            </Text>
            <Text style={styles.noteText}>Resets at 00:00</Text>
          </View>

          <Button
            title="Get Started"
            onPress={handleGetStarted}
            style={styles.button}
          />

          <Text style={styles.privacy}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
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
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#F0F9FF',
    textAlign: 'center',
  },
  features: {
    marginBottom: 48,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },
  note: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  noteText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  noteBold: {
    fontWeight: 'bold',
  },
  button: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  privacy: {
    fontSize: 12,
    color: '#F0F9FF',
    textAlign: 'center',
    opacity: 0.8,
  },
});
