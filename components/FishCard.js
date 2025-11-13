/**
 * Fish Card Component
 * Displays a fish with image, name, and rarity stars
 */

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { renderStars } from '../constants/fishData';

export default function FishCard({ fish, onPress }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <Image
        source={{ uri: fish.imagePlaceholderUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {fish.name}
        </Text>
        <Text style={styles.rarity}>{renderStars(fish.rarity)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: '#E0F2FE',
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  rarity: {
    fontSize: 14,
    color: '#FCD34D',
  },
});
