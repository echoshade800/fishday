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
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useGameStore } from '../store/gameStore';
import { GAME_CONFIG } from '../constants/gameConfig';
import { getRandomFish } from '../constants/fishData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SEA_AREA_TOP = SCREEN_HEIGHT * 0.1;
const SEA_AREA_BOTTOM = SCREEN_HEIGHT * 0.55;
const ROD_TIP_X = SCREEN_WIDTH * 0.58;
const ROD_TIP_Y = SCREEN_HEIGHT * 0.48;

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
  const arcGlowAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

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
    if (isDragging) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(arcGlowAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(arcGlowAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(rippleAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(rippleAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      arcGlowAnim.setValue(0);
      rippleAnim.setValue(0);
    }
  }, [isDragging]);

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

  const generateArcPath = () => {
    const startX = ROD_TIP_X;
    const startY = ROD_TIP_Y;
    const endX = castPosition.x;
    const endY = castPosition.y;

    const midX = (startX + endX) / 2;
    const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    const curveHeight = distance * 0.35;
    const controlY = Math.min(startY, endY) - curveHeight;

    return `M ${startX} ${startY} Q ${midX} ${controlY} ${endX} ${endY}`;
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={{ uri: 'https://osopsbsfioallukblucj.supabase.co/storage/v1/object/public/fishy/gamebackground.jpg' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Glowing Arc Line */}
      {isDragging && (
        <Svg
          style={styles.arcSvg}
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
        >
          <Defs>
            <LinearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#60A5FA" stopOpacity="0.3" />
              <Stop offset="50%" stopColor="#3B82F6" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#2563EB" stopOpacity="0.3" />
            </LinearGradient>
          </Defs>
          <Path
            d={generateArcPath()}
            stroke="url(#arcGradient)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            opacity={0.9}
          />
          <Path
            d={generateArcPath()}
            stroke="#93C5FD"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            opacity={0.3}
          />
          <Path
            d={generateArcPath()}
            stroke="#DBEAFE"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            opacity={0.15}
          />
        </Svg>
      )}

      {/* Cast Position Highlight */}
      {isDragging && (
        <View
          style={[
            styles.castHighlight,
            {
              left: castPosition.x - 70,
              top: castPosition.y - 70,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.rippleOuter,
              {
                transform: [{ scale: rippleAnim }],
                opacity: rippleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.6, 0],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.rippleMiddle,
              {
                transform: [
                  {
                    scale: rippleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.3],
                    }),
                  },
                ],
                opacity: rippleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 0],
                }),
              },
            ]}
          />
          <View style={styles.targetCircleOuter} />
          <View style={styles.targetCircleMiddle} />
          <View style={styles.targetCircleInner} />
          <View style={styles.targetCrosshair}>
            <View style={styles.crosshairH} />
            <View style={styles.crosshairV} />
          </View>
        </View>
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
  arcSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 5,
  },
  castHighlight: {
    position: 'absolute',
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  rippleOuter: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 3,
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  rippleMiddle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  targetCircleOuter: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: 'rgba(59, 130, 246, 0.8)',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  targetCircleMiddle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(96, 165, 250, 0.9)',
    backgroundColor: 'rgba(96, 165, 250, 0.12)',
  },
  targetCircleInner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(147, 197, 253, 0.6)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 10,
  },
  targetCrosshair: {
    position: 'absolute',
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairH: {
    position: 'absolute',
    width: 24,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  crosshairV: {
    position: 'absolute',
    width: 2,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
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
