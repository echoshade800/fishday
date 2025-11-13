/**
 * About & Help Screen
 * Purpose: App information, FAQs, support
 * Extension: Add tutorial videos, feedback form, version history
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../components/Card';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#E0F2FE', '#BAE6FD', '#7DD3FC']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.emoji}>🎣</Text>
              <Text style={styles.appName}>FishyDay</Text>
              <Text style={styles.version}>Version 1.0.0</Text>
              <Text style={styles.tagline}>
                Relaxing mini fishing game: cast, wait, and hook—collect fish stickers in minutes.
              </Text>
            </View>

            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>How to Play</Text>

              <View style={styles.step}>
                <Text style={styles.stepNumber}>1</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Cast Your Line</Text>
                  <Text style={styles.stepText}>
                    Tap "Start Fishing" and drag to cast your line into the water
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <Text style={styles.stepNumber}>2</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Wait for a Bite</Text>
                  <Text style={styles.stepText}>
                    Watch the float and wait patiently. When you see the "!" prompt, tap "REEL" quickly!
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <Text style={styles.stepNumber}>3</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Hook the Fish</Text>
                  <Text style={styles.stepText}>
                    Tap "HOOK!" when the rotating pointer aligns with the yellow target. Get 3 successful hits to catch the fish!
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <Text style={styles.stepNumber}>4</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Collect Your Catch</Text>
                  <Text style={styles.stepText}>
                    Build your fish encyclopedia by catching all 16 unique species!
                  </Text>
                </View>
              </View>
            </Card>

            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Daily Limit</Text>
              <Text style={styles.text}>
                You have <Text style={styles.bold}>3 tries per day</Text>. Each fishing session (success or fail) uses one try.
              </Text>
              <Text style={styles.text}>
                Your tries reset at <Text style={styles.bold}>00:00 (midnight)</Text> each day, so check back tomorrow for more fishing!
              </Text>
            </Card>

            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Fish Rarity</Text>
              <Text style={styles.text}>
                Fish are rated from <Text style={styles.stars}>★★</Text> (common) to <Text style={styles.stars}>★★★★★</Text> (legendary).
              </Text>
              <Text style={styles.text}>
                Rarer fish are harder to find, so keep trying to catch them all!
              </Text>
            </Card>

            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>FAQ</Text>

              <View style={styles.faq}>
                <Text style={styles.question}>Q: What happens if I exit during fishing?</Text>
                <Text style={styles.answer}>
                  A: If you exit after casting, that try will be consumed and counted as escaped.
                </Text>
              </View>

              <View style={styles.faq}>
                <Text style={styles.question}>Q: Can I get more tries?</Text>
                <Text style={styles.answer}>
                  A: Currently, the limit is 3 tries per day. This helps keep the game relaxing and prevents burnout!
                </Text>
              </View>

              <View style={styles.faq}>
                <Text style={styles.question}>Q: How do I see my collection?</Text>
                <Text style={styles.answer}>
                  A: Visit the Encyclopedia from the home screen to browse all fish species.
                </Text>
              </View>
            </Card>

            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Support</Text>
              <Text style={styles.text}>
                Need help or have feedback? We'd love to hear from you!
              </Text>
              <Text style={styles.contactText}>📧 support@fishyday.com</Text>
              <Text style={styles.contactText}>🌐 www.fishyday.com</Text>
            </Card>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Made with 💙 for relaxation</Text>
              <Text style={styles.footerText}>© 2025 FishyDay</Text>
            </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0891B2',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  text: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 12,
  },
  bold: {
    fontWeight: 'bold',
    color: '#0891B2',
  },
  stars: {
    color: '#FCD34D',
    fontWeight: 'bold',
  },
  faq: {
    marginBottom: 16,
  },
  question: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 6,
  },
  answer: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  contactText: {
    fontSize: 15,
    color: '#0891B2',
    marginBottom: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
});
