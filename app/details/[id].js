/**
 * Fish Detail Screen
 * Purpose: Display full information about a selected fish
 * Extension: Add stats tracking, collection status, share functionality
 */

import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FISH_DATA, renderStars } from '../../constants/fishData';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function FishDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const fish = FISH_DATA.find((f) => f.id === parseInt(id));

  if (!fish) {
    return (
      <LinearGradient colors={['#E0F2FE', '#BAE6FD', '#7DD3FC']} style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Fish not found</Text>
            <Button title="Go Back" onPress={() => router.back()} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this fish I found in FishyDay: ${fish.name} ${renderStars(fish.rarity)}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <LinearGradient colors={['#E0F2FE', '#BAE6FD', '#7DD3FC']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <Card style={styles.card}>
            <Image
              source={{ uri: fish.imagePlaceholderUrl }}
              style={styles.image}
              resizeMode="cover"
            />

            <View style={styles.infoContainer}>
              <Text style={styles.name}>{fish.name}</Text>
              <Text style={styles.rarity}>{renderStars(fish.rarity)}</Text>

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Species ID</Text>
                  <Text style={styles.detailValue}>#{fish.id}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Rarity Level</Text>
                  <Text style={styles.detailValue}>{fish.rarity}/5</Text>
                </View>
              </View>

              <View style={styles.description}>
                <Text style={styles.descriptionTitle}>About</Text>
                <Text style={styles.descriptionText}>
                  This beautiful {fish.name} is a {fish.rarity === 5 ? 'legendary' : fish.rarity === 4 ? 'rare' : fish.rarity === 3 ? 'uncommon' : 'common'} species found in the ocean waters. Keep fishing to complete your collection!
                </Text>
              </View>

              <View style={styles.actions}>
                <Button
                  title="Share"
                  onPress={handleShare}
                  variant="outline"
                  style={styles.actionButton}
                />
              </View>
            </View>
          </Card>
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
  backButton: {
    padding: 20,
    paddingBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#0891B2',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 20,
  },
  card: {
    margin: 20,
    marginTop: 0,
    padding: 0,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#E0F2FE',
  },
  infoContainer: {
    padding: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  rarity: {
    fontSize: 24,
    color: '#FCD34D',
    marginBottom: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  detailItem: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 16,
    borderRadius: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0891B2',
  },
  description: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
