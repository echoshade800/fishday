/**
 * Fishing Session Screen
 * Purpose: Main gameplay - Cast → Wait → Hook → Result flow
 * Extension: Add animations, sound effects, advanced mini-games
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
const CHARACTER_X = SCREEN_WIDTH * 0.5;
const CHARACTER_Y = SCREEN_HEIGHT * 0.65;
const NUM_FISH = 10;

const createSwimmingFish = (index) => {
  const padding = 40;
  const startX = padding + Math.random() * (SCREEN_WIDTH - padding * 2);
  const startY = SEA_AREA_TOP + padding + Math.random() * (SEA_AREA_BOTTOM - SEA_AREA_TOP - padding * 2);
  const speed = 2.5 + Math.random() * 3;
  const direction = Math.random() > 0.5 ? 1 : -1;
  const size = 20 + Math.random() * 20;

  return {
    id: index,
    startX,
    startY,
    speed,
    direction,
    size,
    animX: new Animated.Value(startX),
    animY: new Animated.Value(startY),
  };
};

export default function FishingScreen() {
  const router = useRouter();

  const [gamePhase, setGamePhase] = useState('ready');
  const [isDragging, setIsDragging] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
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
  const hookX = useRef(new Animated.Value(CHARACTER_X + 6)).current;
  const hookY = useRef(new Animated.Value(CHARACTER_Y)).current;
  const splashScale = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(0)).current;

  const swimmingFish = useMemo(() => {
    return Array.from({ length: NUM_FISH }, (_, i) => createSwimmingFish(i));
  }, []);

  const [fishDirections, setFishDirections] = useState(
    swimmingFish.map(fish => fish.direction)
  );

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

  useEffect(() => {
    const animations = swimmingFish.map((fish, index) => {
      const animateFish = () => {
        const padding = 40;
        const currentX = fish.animX._value;
        const currentY = fish.animY._value;

        let targetX, targetY;
        let attempts = 0;
        const maxAttempts = 10;

        do {
          const angle = Math.random() * Math.PI * 2;
          const distance = 50 + Math.random() * 150;

          targetX = currentX + Math.cos(angle) * distance;
          targetY = currentY + Math.sin(angle) * distance;

          targetX = Math.max(padding, Math.min(SCREEN_WIDTH - padding, targetX));
          targetY = Math.max(SEA_AREA_TOP + padding, Math.min(SEA_AREA_BOTTOM - padding, targetY));

          attempts++;
        } while (Math.abs(targetX - currentX) < 20 && attempts < maxAttempts);

        const newDirection = targetX > currentX ? 1 : -1;
        setFishDirections(prev => {
          const updated = [...prev];
          updated[index] = newDirection;
          return updated;
        });

        const actualDistance = Math.sqrt(
          Math.pow(targetX - currentX, 2) +
          Math.pow(targetY - currentY, 2)
        );
        const duration = (actualDistance / fish.speed) * 100;

        return Animated.parallel([
          Animated.timing(fish.animX, {
            toValue: targetX,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(fish.animY, {
            toValue: targetY,
            duration: duration,
            useNativeDriver: true,
          }),
        ]);
      };

      const loopAnimation = () => {
        const animate = () => {
          animateFish().start(() => {
            setTimeout(() => {
              animate();
            }, Math.random() * 1000 + 500);
          });
        };
        animate();
      };

      loopAnimation();
    });
  }, [swimmingFish]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
        setCastPosition({
          x: SCREEN_WIDTH / 2,
          y: SEA_AREA_TOP + (SEA_AREA_BOTTOM - SEA_AREA_TOP) / 2,
        });
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

        const centerX = SCREEN_WIDTH / 2;
        const centerY = SEA_AREA_TOP + (SEA_AREA_BOTTOM - SEA_AREA_TOP) / 2;

        let newX = centerX + dx * sensitivity;
        let newY = centerY + dy * sensitivity;

        newX = Math.max(60, Math.min(SCREEN_WIDTH - 60, newX));
        newY = Math.max(SEA_AREA_TOP + 60, Math.min(SEA_AREA_BOTTOM - 60, newY));

        setCastPosition({ x: newX, y: newY });
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        const sensitivity = 2;

        const centerX = SCREEN_WIDTH / 2;
        const centerY = SEA_AREA_TOP + (SEA_AREA_BOTTOM - SEA_AREA_TOP) / 2;

        let finalX = centerX + dx * sensitivity;
        let finalY = centerY + dy * sensitivity;

        finalX = Math.max(60, Math.min(SCREEN_WIDTH - 60, finalX));
        finalY = Math.max(SEA_AREA_TOP + 60, Math.min(SEA_AREA_BOTTOM - 60, finalY));

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

        performCast(finalX, finalY);
      },
    })
  ).current;

  const performCast = (targetX, targetY) => {
    setGamePhase('casting');

    const startX = CHARACTER_X + 6;
    const startY = CHARACTER_Y;
    const endX = targetX;
    const endY = targetY;

    Animated.parallel([
      Animated.timing(hookX, {
        toValue: endX,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(hookY, {
        toValue: endY,
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start(() => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(splashScale, {
            toValue: 1.5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(splashOpacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(splashScale, {
            toValue: 2,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(splashOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setGamePhase('waiting');
      });
    });
  };

  const generateArcPath = () => {
    const startX = CHARACTER_X + 6;
    const startY = CHARACTER_Y;
    const endX = castPosition.x;
    const endY = castPosition.y;

    const midX = (startX + endX) / 2;
    const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    const curveHeight = distance * 0.4;
    const controlY = Math.min(startY, endY) - curveHeight;

    return `M ${startX} ${startY} Q ${midX} ${controlY} ${endX} ${endY}`;
  };

  const generateHookPath = () => {
    const startX = CHARACTER_X + 6;
    const startY = CHARACTER_Y;
    const endX = hookX._value;
    const endY = hookY._value;

    const midX = (startX + endX) / 2;
    const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    const curveHeight = distance * 0.4;
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

      {/* Fishing Line and Hook */}
      {(gamePhase === 'casting' || gamePhase === 'waiting') && (
        <Svg
          style={styles.arcSvg}
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
        >
          <Defs>
            <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#334155" stopOpacity="0.6" />
              <Stop offset="50%" stopColor="#475569" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#64748b" stopOpacity="0.6" />
            </LinearGradient>
          </Defs>
          <Path
            d={generateHookPath()}
            stroke="url(#lineGradient)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      )}

      {/* Hook */}
      {(gamePhase === 'casting' || gamePhase === 'waiting') && (
        <Animated.View
          style={[
            styles.hook,
            {
              left: Animated.subtract(hookX, 20),
              top: Animated.subtract(hookY, 20),
            },
          ]}
        >
          <Image
            source={{ uri: 'https://osopsbsfioallukblucj.supabase.co/storage/v1/object/public/fishy/hook.png' }}
            style={styles.hookImage}
            resizeMode="contain"
          />
        </Animated.View>
      )}

      {/* Splash Effect */}
      {gamePhase === 'casting' && (
        <Animated.View
          style={[
            styles.splash,
            {
              left: castPosition.x - 30,
              top: castPosition.y - 30,
              transform: [{ scale: splashScale }],
              opacity: splashOpacity,
            },
          ]}
        >
          <View style={styles.splashRing1} />
          <View style={styles.splashRing2} />
          <View style={styles.splashRing3} />
        </Animated.View>
      )}

      {/* Swimming Fish */}
      {swimmingFish.map((fish, index) => (
        <Animated.Image
          key={fish.id}
          source={{ uri: 'https://osopsbsfioallukblucj.supabase.co/storage/v1/object/public/fishy/smallfish.png' }}
          style={[
            styles.swimmingFish,
            {
              width: fish.size * 2,
              height: fish.size * 2,
              transform: [
                { translateX: fish.animX },
                { translateY: fish.animY },
                { scaleX: fishDirections[index] },
              ],
            },
          ]}
          resizeMode="contain"
        />
      ))}

      {/* Character Image */}
      <Image
        source={{ uri: 'https://osopsbsfioallukblucj.supabase.co/storage/v1/object/public/fishy/fishpeople1.png' }}
        style={styles.characterImage}
        resizeMode="contain"
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']} pointerEvents="box-none">
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowExitDialog(true)}
          activeOpacity={0.7}
        >
          <View style={styles.backButtonCircle}>
            <ArrowLeft size={24} color="#334155" />
          </View>
        </TouchableOpacity>

        {/* Top Instruction Text */}
        {gamePhase === 'ready' && (
          <View style={styles.instructionContainer}>
            <FishIcon size={24} color="#78350F" strokeWidth={2.5} />
            <Text style={styles.instructionText}>Drag button to cast</Text>
          </View>
        )}

        {gamePhase === 'waiting' && (
          <View style={styles.instructionContainer}>
            <FishIcon size={24} color="#78350F" strokeWidth={2.5} />
            <Text style={styles.instructionText}>Waiting for fish...</Text>
          </View>
        )}

        {/* Drag to Cast button */}
        {gamePhase === 'ready' && (
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
              source={{ uri: 'https://osopsbsfioallukblucj.supabase.co/storage/v1/object/public/fishy/fishbutton1.jpg' }}
              style={styles.dragButton}
              resizeMode="contain"
            />
          </Animated.View>
        )}

        {/* Pull Rod button */}
        {gamePhase === 'waiting' && (
          <View style={styles.dragButtonContainer}>
            <Image
              source={{ uri: 'https://osopsbsfioallukblucj.supabase.co/storage/v1/object/public/fishy/fishbutton2.jpg' }}
              style={styles.dragButton}
              resizeMode="contain"
            />
          </View>
        )}
      </SafeAreaView>

      {/* Exit Confirmation Dialog */}
      {showExitDialog && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>Leave Game?</Text>
            <Text style={styles.dialogMessage}>
              Are you sure you want to leave the fishing session?
            </Text>
            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={[styles.dialogButton, styles.cancelButton]}
                onPress={() => setShowExitDialog(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogButton, styles.confirmButton]}
                onPress={() => {
                  setShowExitDialog(false);
                  router.push('/home');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    zIndex: 10,
  },
  safeArea: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 200,
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
  swimmingFish: {
    position: 'absolute',
    zIndex: 3,
    opacity: 0.35,
  },
  hook: {
    position: 'absolute',
    width: 40,
    height: 40,
    zIndex: 15,
  },
  hookImage: {
    width: 40,
    height: 40,
  },
  splash: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 12,
  },
  splashRing1: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(147, 197, 253, 0.3)',
  },
  splashRing2: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(147, 197, 253, 0.2)',
  },
  splashRing3: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(147, 197, 253, 0.15)',
  },
  dialogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  dialogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: SCREEN_WIDTH * 0.8,
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dialogTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  dialogMessage: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  dialogButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  dialogButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  confirmButton: {
    backgroundColor: '#EF4444',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
