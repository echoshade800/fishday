/**
 * Fish Encyclopedia Screen
 * Purpose: Browse and search all fish species with filters
 * Extension: Add favorites, sorting options, collection progress
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { FISH_DATA } from '../constants/fishData';
import FishCard from '../components/FishCard';

export default function EncyclopediaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleFishPress = (fishId) => {
    router.push(`/details/${fishId}`);
  };

  return (
    <LinearGradient colors={['#E0F2FE', '#BAE6FD', '#7DD3FC']} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/home')}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#0F172A" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.title}>Fish Book</Text>
          <Text style={styles.subtitle}>{FISH_DATA.length} species</Text>
        </View>

        <FlatList
            data={FISH_DATA}
            renderItem={({ item }) => (
              <FishCard fish={item} onPress={() => handleFishPress(item.id)} />
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
            showsVerticalScrollIndicator={false}
            numColumns={2}
            columnWrapperStyle={styles.row}
          />
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
  backButton: {
    marginBottom: 12,
    alignSelf: 'flex-start',
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
  list: {
    padding: 20,
    paddingTop: 8,
  },
  row: {
    gap: 12,
  },
});
