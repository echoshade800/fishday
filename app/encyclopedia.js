/**
 * Fish Encyclopedia Screen
 * Purpose: Browse and search all fish species with filters
 * Extension: Add favorites, sorting options, collection progress
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { FISH_DATA } from '../constants/fishData';
import { useGameStore } from '../store/gameStore';

const PLACEHOLDER_IMAGE = 'https://osopsbsfioallukblucj.supabase.co/storage/v1/object/public/fishy/wenhaofish.png';

export default function EncyclopediaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const catches = useGameStore((state) => state.catches);

  const caughtFishIds = new Set(catches.map((c) => c.fishId));

  const handleFishPress = (fishId) => {
    router.push(`/details/${fishId}`);
  };

  const renderFishItem = ({ item }) => {
    const isCaught = caughtFishIds.has(item.id);
    const imageUrl = isCaught ? item.imagePlaceholderUrl : PLACEHOLDER_IMAGE;

    return (
      <TouchableOpacity
        style={styles.fishItem}
        onPress={() => handleFishPress(item.id)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.fishImage}
          resizeMode="contain"
        />
        <Text style={styles.fishName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.starContainer}>
          {Array.from({ length: item.rarity }).map((_, index) => (
            <Star
              key={index}
              size={14}
              color="#FCD34D"
              fill="#FCD34D"
              strokeWidth={1.5}
            />
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={{ uri: 'https://osopsbsfioallukblucj.supabase.co/storage/v1/object/public/fishy/bookbackground.png' }}
      style={styles.background}
      resizeMode="cover"
    >
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
        </View>

        <FlatList
          data={FISH_DATA}
          renderItem={renderFishItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
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
  },
  list: {
    padding: 20,
    paddingTop: 8,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  fishItem: {
    width: '45%',
    alignItems: 'center',
  },
  fishImage: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  fishName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 2,
  },
});
