/**
 * Fishing Session Screen
 * Purpose: Main gameplay - Cast → Wait → Hook → Result flow
 * Extension: Add animations, sound effects, advanced mini-games
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image, PanResponder } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Fish as FishIcon } from 'lucide-react-native';
import { useGameStore } from '../store/gameStore';
import { GAME_CONFIG } from '../constants/gameConfig';
import { getRandomFish } from '../constants/fishData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SEA_AREA_TOP = SCREEN_HEIGHT * 0.1;
const SEA_AREA_BOTTOM = SCREEN_HEIGHT * 0.55;

export default function FishingScreen() {
  const router = useRouter();

  const [isDragging, setIsDragging] = useState(false);
  const [castPosition, setCastPosition] = useState({
    x: SCREEN_WIDTH / 2,
    y: SEA_AREA_TOP + (SEA_AREA_BOTTOM - SEA_AREA_TOP) / 2,
  });

  const dragButtonScale = useRef(new Animated.Value(1)).current;
  const dragButtonY = useRef(new Animated.Value(0)).current;
  const outerRingScale = useRef(new Animated.Value(0)).current;
  const outerRingOpacity = useRef(new Animated.Value(0)).current;
  const highlightScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
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
    );

    if (!isDragging) {
      pulseAnimation.start();
    } else {
      pulseAnimation.stop();
    }

    return () => pulseAnimation.stop();
  }, [isDragging]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(highlightScale, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(highlightScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
        Animated.parallel([
          Animated.spring(outerRingScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }),
          Animated.timing(outerRingOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      },
      onPanResponderMove: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        const sensitivity = 2;

        let newX = SCREEN_WIDTH / 2 + dx * sensitivity;
        let newY = (SEA_AREA_TOP + (SEA_AREA_BOTTOM - SEA_AREA_TOP) / 2) + dy * sensitivity;

        newX = Math.max(60, Math.min(SCREEN_WIDTH - 60, newX));
        newY = Math.max(SEA_AREA_TOP + 60, Math.min(SEA_AREA_BOTTOM - 60, newY));

        setCastPosition({ x: newX, y: newY });
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
        Animated.parallel([
          Animated.spring(outerRingScale, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }),
          Animated.timing(outerRingOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();

        console.log('Cast at position:', castPosition);
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={{ uri: 'https://osopsbsfioallukblucj.supabase.co/storage/v1/object/public/fishy/gamebackground.jpg' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Cast Position Highlight */}
      {isDragging && (
        <Animated.Image
          source={{ uri: 'https://osopsbsfioallukblucj.supabase.co/storage/v1/object/public/fishy/circlelight.png' }}
          style={[
            styles.castHighlight,
            {
              left: castPosition.x - 60,
              top: castPosition.y - 60,
              transform: [{ scale: highlightScale }],
            },
          ]}
          resizeMode="contain"
        />
      )}

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

        {/* Top Instruction Text */}
        <View style={styles.instructionContainer}>
          <FishIcon size={24} color="#78350F" strokeWidth={2.5} />
          <Text style={styles.instructionText}>Drag button to cast</Text>
        </View>

        {/* Drag to Cast button */}
        <Animated.View
          style={[
            styles.dragButtonContainer,
            {
              transform: [
                { scale: isDragging ? 1 : dragButtonScale },
                { translateY: isDragging ? 0 : dragButtonY },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Outer Ring */}
          <Animated.View
            style={[
              styles.outerRing,
              {
                transform: [{ scale: outerRingScale }],
                opacity: outerRingOpacity,
              },
            ]}
          />

          <Image
            source={{ uri: 'https://osopsbsfioallukblucj.supabase.co/storage/v1/object/public/fishy/fishbutton.png' }}
            style={styles.dragButton}
            resizeMode="contain"
          />
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
  castHighlight: {
    position: 'absolute',
    width: 120,
    height: 120,
    zIndex: 10,
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
  instructionContainer: {
    position: 'absolute',
    top: 60,
    left: SCREEN_WIDTH / 2 - 100,
    width: 200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBBF24',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#F59E0B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 50,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#78350F',
    marginLeft: 6,
  },
  dragButtonContainer: {
    position: 'absolute',
    bottom: 80,
    right: 40,
    alignItems: 'center',
    zIndex: 100,
  },
  outerRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 3,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    borderStyle: 'dashed',
    top: -30,
    left: -30,
  },
  dragButton: {
    width: 100,
    height: 100,
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
