/**
 * Fishing Session Screen
 * Purpose: Main gameplay - Cast → Wait → Hook → Result flow
 * Extension: Add animations, sound effects, advanced mini-games
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Fish as FishIcon } from 'lucide-react-native';
import { useGameStore } from '../store/gameStore';
import { GAME_CONFIG } from '../constants/gameConfig';
import { getRandomFish } from '../constants/fishData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function FishingScreen() {
  const router = useRouter();

  // Drag button animation
  const dragButtonScale = useRef(new Animated.Value(1)).current;
  const dragButtonY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Drag button pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(dragButtonScale, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(dragButtonY, {
            toValue: -5,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(dragButtonScale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(dragButtonY, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  const handleDragStart = () => {
    console.log('Drag started');
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={{ uri: 'https://osopsbsfioallukblucj.supabase.co/storage/v1/object/public/fishy/gamebackground.jpg' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Character Image */}
      <Image
        source={{ uri: 'https://osopsbsfioallukblucj.supabase.co/storage/v1/object/public/fishy/fishpeople1.png' }}
        style={styles.characterImage}
        resizeMode="contain"
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <View style={styles.backButtonCircle}>
            <ArrowLeft size={24} color="#334155" />
          </View>
        </TouchableOpacity>

        {/* Drag to Cast button */}
        <Animated.View
          style={[
            styles.dragButtonContainer,
            {
              transform: [
                { scale: dragButtonScale },
                { translateY: dragButtonY },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.dragButton}
            onPress={handleDragStart}
            activeOpacity={0.8}
          >
            <FishIcon size={40} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.dragHint}>
            <Text style={styles.dragHintText}>Drag to Cast</Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  characterImage: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.15,
    left: SCREEN_WIDTH * 0.35,
    width: SCREEN_WIDTH * 0.3,
    height: SCREEN_HEIGHT * 0.4,
  },
  safeArea: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 100,
  },
  backButtonCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dragButtonContainer: {
    position: 'absolute',
    bottom: 80,
    right: 40,
    alignItems: 'center',
    zIndex: 100,
  },
  dragButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 3,
    borderColor: '#2563EB',
  },
  dragHint: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FBBF24',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  dragHintText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#78350F',
  },
});
