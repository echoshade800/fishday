/**
 * Fish Encyclopedia Screen
 * Purpose: Browse and search all fish species with filters
 * Extension: Add favorites, sorting options, collection progress
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, FlatList } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FISH_DATA } from '../constants/fishData';
import FishCard from '../components/FishCard';

export default function EncyclopediaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('all');

  // Filter fish based on search and rarity
  const filteredFish = FISH_DATA.filter((fish) => {
    const matchesSearch = fish.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRarity = selectedRarity === 'all' || fish.rarity === parseInt(selectedRarity);
    return matchesSearch && matchesRarity;
  });

  const rarityFilters = [
    { label: 'All', value: 'all' },
    { label: '★★', value: '2' },
    { label: '★★★', value: '3' },
    { label: '★★★★', value: '4' },
    { label: '★★★★★', value: '5' },
  ];

  const handleFishPress = (fishId) => {
    router.push(`/details/${fishId}`);
  };

  return (
    <LinearGradient colors={['#E0F2FE', '#BAE6FD', '#7DD3FC']} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title}>Fish Encyclopedia</Text>
          <Text style={styles.subtitle}>{filteredFish.length} species</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search fish..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {rarityFilters.map((filter) => (
            <Text
              key={filter.value}
              style={[
                styles.filterChip,
                selectedRarity === filter.value && styles.filterChipActive,
              ]}
              onPress={() => setSelectedRarity(filter.value)}
            >
              {filter.label}
            </Text>
          ))}
        </ScrollView>

        {filteredFish.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No fish found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          <FlatList
            data={filteredFish}
            renderItem={({ item }) => (
              <FishCard fish={item} onPress={() => handleFishPress(item.id)} />
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
            showsVerticalScrollIndicator={false}
            numColumns={2}
            columnWrapperStyle={styles.row}
          />
        )}
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
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    color: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  filterScroll: {
    marginBottom: 12,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    overflow: 'hidden',
  },
  filterChipActive: {
    backgroundColor: '#0891B2',
    color: '#FFFFFF',
  },
  list: {
    padding: 20,
    paddingTop: 8,
  },
  row: {
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
