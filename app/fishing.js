/**
 * Fishing Session Screen
 * Purpose: Main gameplay - Cast → Wait → Hook → Result flow
 * Extension: Add animations, sound effects, advanced mini-games
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Fish as FishIcon } from 'lucide-react-native';
import { useGameStore } from '../store/gameStore';
import { GAME_CONFIG } from '../constants/gameConfig';
import { getRandomFish } from '../constants/fishData';
import Button from '../components/Button';
import Card from '../components/Card';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PHASES = {
  IDLE: 'idle',
  CASTING: 'casting',
  WAITING: 'waiting',
  BITING: 'biting',
  HOOKING: 'hooking',
  RESULT: 'result',
};

// Fish swimming animation component
const SwimmingFish = ({ delay = 0 }) => {
  const position = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const randomY = Math.random() * 100 - 50;
    const duration = 8000 + Math.random() * 4000;

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(position, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      position.setValue(0);
      opacity.setValue(0);
    });
  }, []);

  const translateX = position.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, SCREEN_WIDTH + 50],
  });

  return (
    <Animated.View
      style={[
        styles.fish,
        {
          transform: [{ translateX }],
          opacity,
        },
      ]}
    >
      <FishIcon size={20 + Math.random() * 15} color="#38BDF8" />
    </Animated.View>
  );
};

export default function FishingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { useTry, addCatch, getRemainingTries } = useGameStore();

  const [phase, setPhase] = useState(PHASES.IDLE);
  const [castPosition, setCastPosition] = useState({ x: 0, y: 0 });
  const [biteCount, setBiteCount] = useState(0);
  const [hookSuccess, setHookSuccess] = useState(0);
  const [hookFails, setHookFails] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [caughtFish, setCaughtFish] = useState(null);
  const [gameMessage, setGameMessage] = useState('');
  const [hookStartTime, setHookStartTime] = useState(null);

  const floatAnim = useRef(new Animated.Value(0)).current;
  const biteTimer = useRef(null);
  const hookTimer = useRef(null);
  const rotationInterval = useRef(null);

  // Water wave animation
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;

  // Drag button animation
  const dragButtonScale = useRef(new Animated.Value(1)).current;
  const dragButtonY = useRef(new Animated.Value(0)).current;

  const remainingTries = getRemainingTries();

  useEffect(() => {
    // Start water wave animation
    Animated.loop(
      Animated.parallel([
        Animated.timing(waveAnim1, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim2, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

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

    return () => {
      clearTimers();
    };
  }, []);

  const clearTimers = () => {
    if (biteTimer.current) clearTimeout(biteTimer.current);
    if (hookTimer.current) clearTimeout(hookTimer.current);
    if (rotationInterval.current) clearInterval(rotationInterval.current);
  };

  const startCasting = () => {
    setPhase(PHASES.CASTING);
    setGameMessage('Drag and release to cast!');
  };

  const handleCastRelease = (event) => {
    if (phase !== PHASES.CASTING) return;

    const { locationX, locationY } = event.nativeEvent;
    setCastPosition({ x: locationX, y: locationY });

    setTimeout(() => {
      setPhase(PHASES.WAITING);
      setGameMessage('Waiting for a bite...');
      startFloatAnimation();
      scheduleNextBite();
    }, GAME_CONFIG.THROW_ANIM_DURATION);
  };

  const startFloatAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const scheduleNextBite = () => {
    const delay = Math.random() * (GAME_CONFIG.BITE_DELAY_MAX - GAME_CONFIG.BITE_DELAY_MIN) + GAME_CONFIG.BITE_DELAY_MIN;

    biteTimer.current = setTimeout(() => {
      triggerBite();
    }, delay);
  };

  const triggerBite = () => {
    setPhase(PHASES.BITING);
    setGameMessage('🎣 BITE! Quick, tap REEL!');

    hookTimer.current = setTimeout(() => {
      const newBiteCount = biteCount + 1;
      setBiteCount(newBiteCount);

      if (newBiteCount >= GAME_CONFIG.MAX_BITE_CYCLES) {
        endFishing(false, 'Fish got away after too many missed bites');
      } else {
        setPhase(PHASES.WAITING);
        setGameMessage('Missed the bite! Waiting again...');
        scheduleNextBite();
      }
    }, GAME_CONFIG.HIT_WINDOW);
  };

  const handleReel = () => {
    if (phase !== PHASES.BITING) return;

    clearTimers();
    setPhase(PHASES.HOOKING);
    setGameMessage('Match the target when it aligns!');
    setHookSuccess(0);
    setHookFails(0);
    setHookStartTime(Date.now());
    startHookMiniGame();
  };

  const startHookMiniGame = () => {
    const speed = GAME_CONFIG.ROTATION_SPEED_START + (hookSuccess * GAME_CONFIG.ROTATION_SPEED_GAIN);

    rotationInterval.current = setInterval(() => {
      setRotation((prev) => (prev + speed / 60) % 360);
    }, 1000 / 60);
  };

  const handleHook = () => {
    if (phase !== PHASES.HOOKING) return;

    const targetStart = GAME_CONFIG.TARGET_ARC_START;
    const targetEnd = targetStart + GAME_CONFIG.TARGET_ARC_MIN;

    const isHit = rotation >= targetStart - GAME_CONFIG.CLICK_TOLERANCE && rotation <= targetEnd + GAME_CONFIG.CLICK_TOLERANCE;

    if (isHit) {
      const newSuccess = hookSuccess + 1;
      setHookSuccess(newSuccess);
      setGameMessage(`Great! ${newSuccess}/${GAME_CONFIG.REEL_ROUNDS}`);

      if (newSuccess >= GAME_CONFIG.REEL_ROUNDS) {
        clearInterval(rotationInterval.current);
        const hookTime = Date.now() - hookStartTime;
        endFishing(true, 'Success! You caught a fish!', hookTime);
      }
    } else {
      const newFails = hookFails + 1;
      setHookFails(newFails);
      setGameMessage(`Miss! ${newFails}/${GAME_CONFIG.FAIL_LIMIT} fails`);

      if (newFails >= GAME_CONFIG.FAIL_LIMIT) {
        clearInterval(rotationInterval.current);
        endFishing(false, 'Too many misses! Fish escaped');
      }
    }
  };

  const endFishing = async (success, message, hookTime = null) => {
    clearTimers();
    floatAnim.stopAnimation();

    setPhase(PHASES.RESULT);
    setGameMessage(message);

    // Testing mode: Don't consume tries
    // await useTry();

    if (success) {
      const fish = getRandomFish();
      setCaughtFish(fish);
      await addCatch(fish, hookTime);
    } else {
      setCaughtFish(null);
    }
  };

  const handleFishAgain = () => {
    // Testing mode: Always allow fishing again
    resetFishing();
    // if (getRemainingTries() > 0) {
    //   resetFishing();
    // } else {
    //   router.back();
    // }
  };

  const resetFishing = () => {
    clearTimers();
    setPhase(PHASES.IDLE);
    setCastPosition({ x: 0, y: 0 });
    setBiteCount(0);
    setHookSuccess(0);
    setHookFails(0);
    setRotation(0);
    setCaughtFish(null);
    setGameMessage('');
    setHookStartTime(null);
  };

  const renderPhaseContent = () => {
    switch (phase) {
      case PHASES.IDLE:
        return (
          <View style={styles.phaseContainer}>
            <Text style={styles.phaseTitle}>Ready to Fish?</Text>
            <Text style={styles.phaseText}>Testing Mode - Unlimited Tries</Text>
            <Button title="Cast Line" onPress={startCasting} style={styles.actionButton} />
          </View>
        );

      case PHASES.CASTING:
        return (
          <TouchableOpacity
            style={styles.castArea}
            onPressOut={handleCastRelease}
            activeOpacity={1}
          >
            <View style={styles.castIndicator}>
              <Text style={styles.castText}>Release to cast!</Text>
            </View>
          </TouchableOpacity>
        );

      case PHASES.WAITING:
        return (
          <View style={styles.phaseContainer}>
            <Animated.View style={[styles.float, { transform: [{ translateY: floatAnim }] }]}>
              <Text style={styles.floatEmoji}>🎣</Text>
            </Animated.View>
            <Text style={styles.phaseText}>{gameMessage}</Text>
          </View>
        );

      case PHASES.BITING:
        return (
          <View style={styles.phaseContainer}>
            <Text style={styles.biteEmoji}>❗</Text>
            <Text style={styles.phaseTitle}>{gameMessage}</Text>
            <Button title="REEL" onPress={handleReel} style={styles.reelButton} />
          </View>
        );

      case PHASES.HOOKING:
        return (
          <View style={styles.phaseContainer}>
            <Text style={styles.phaseText}>{gameMessage}</Text>
            <View style={styles.hookCircle}>
              <View
                style={[
                  styles.targetArc,
                  {
                    transform: [
                      { rotate: `${GAME_CONFIG.TARGET_ARC_START}deg` }
                    ],
                  },
                ]}
              />
              <View
                style={[
                  styles.pointer,
                  {
                    transform: [{ rotate: `${rotation}deg` }],
                  },
                ]}
              />
            </View>
            <Button title="HOOK!" onPress={handleHook} style={styles.hookButton} />
            <Text style={styles.hookStats}>
              Success: {hookSuccess}/{GAME_CONFIG.REEL_ROUNDS} | Fails: {hookFails}/{GAME_CONFIG.FAIL_LIMIT}
            </Text>
          </View>
        );

      case PHASES.RESULT:
        return (
          <View style={styles.phaseContainer}>
            <Card style={styles.resultCard}>
              {caughtFish ? (
                <>
                  <Text style={styles.resultTitle}>🎉 Success!</Text>
                  <Text style={styles.fishName}>{caughtFish.name}</Text>
                  <Text style={styles.fishRarity}>{'★'.repeat(caughtFish.rarity)}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.resultTitle}>😔 {gameMessage}</Text>
                </>
              )}
            </Card>
            <Button
              title="Fish Again"
              onPress={handleFishAgain}
              style={styles.actionButton}
            />
            <Button
              title="Back to Home"
              onPress={() => router.back()}
              variant="outline"
              style={styles.actionButton}
            />
          </View>
        );

      default:
        return null;
    }
  };

  const waveTranslate1 = waveAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -100],
  });

  const waveTranslate2 = waveAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -150],
  });

  return (
    <View style={styles.gradient}>
      {/* Sky Background */}
      <LinearGradient
        colors={['#87CEEB', '#B0E2FF', '#E0F6FF']}
        style={styles.skyGradient}
      />

      {/* Clouds */}
      <View style={styles.cloudContainer}>
        <View style={[styles.cloud, { top: 60, left: 50 }]} />
        <View style={[styles.cloud, { top: 100, right: 80 }]} />
        <View style={[styles.cloud, { top: 150, left: 150 }]} />
      </View>

      {/* Ocean with waves */}
      <View style={styles.oceanContainer}>
        <LinearGradient
          colors={['#0EA5E9', '#06B6D4', '#38BDF8']}
          style={styles.oceanGradient}
        />

        {/* Animated water waves */}
        <Animated.View
          style={[
            styles.wave,
            { transform: [{ translateY: waveTranslate1 }] },
          ]}
        />
        <Animated.View
          style={[
            styles.wave,
            styles.wave2,
            { transform: [{ translateY: waveTranslate2 }] },
          ]}
        />

        {/* Swimming fish */}
        {[...Array(5)].map((_, index) => (
          <SwimmingFish key={index} delay={index * 1500} />
        ))}
      </View>

      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <View style={styles.backButtonCircle}>
            <ArrowLeft size={24} color="#334155" />
          </View>
        </TouchableOpacity>

        {/* Wooden dock */}
        <View style={styles.dockContainer}>
          <View style={styles.dock}>
            {/* Dock planks */}
            {[...Array(8)].map((_, index) => (
              <View key={index} style={styles.plank} />
            ))}

            {/* Orange IP character placeholder */}
            <View style={styles.characterContainer}>
              <View style={styles.character}>
                <Text style={styles.characterText}>🎣</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Drag button */}
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
            onPress={startCasting}
            activeOpacity={0.8}
          >
            <FishIcon size={40} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.dragHint}>
            <Text style={styles.dragHintText}>Drag to Cast</Text>
          </View>
        </Animated.View>

        {/* Game phase overlay */}
        {phase !== PHASES.IDLE && (
          <View style={styles.phaseOverlay}>
            <View style={styles.phaseCard}>
              {renderPhaseContent()}
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    backgroundColor: '#87CEEB',
  },
  skyGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.45,
  },
  cloudContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.45,
  },
  cloud: {
    position: 'absolute',
    width: 80,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
  },
  oceanContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.6,
    overflow: 'hidden',
  },
  oceanGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  wave: {
    position: 'absolute',
    top: 0,
    left: -50,
    right: -50,
    height: 200,
    backgroundColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 100,
  },
  wave2: {
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
    height: 250,
  },
  fish: {
    position: 'absolute',
    top: '50%',
  },
  container: {
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
  dockContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.4,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  dock: {
    width: '90%',
    height: 220,
    backgroundColor: '#B8860B',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#8B6914',
    padding: 10,
    marginBottom: 40,
  },
  plank: {
    width: '100%',
    height: 20,
    backgroundColor: '#CD853F',
    borderRadius: 2,
    marginBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: '#8B6914',
  },
  characterContainer: {
    position: 'absolute',
    top: -80,
    left: '35%',
    alignItems: 'center',
  },
  character: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FF6347',
  },
  characterText: {
    fontSize: 40,
  },
  dragButtonContainer: {
    position: 'absolute',
    bottom: 80,
    right: 40,
    alignItems: 'center',
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
  phaseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  phaseCard: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  phaseContainer: {
    alignItems: 'center',
    width: '100%',
  },
  phaseTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  phaseText: {
    fontSize: 18,
    color: '#F0F9FF',
    marginBottom: 24,
    textAlign: 'center',
  },
  actionButton: {
    marginBottom: 12,
    minWidth: 200,
  },
  castArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  castIndicator: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  castText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  float: {
    marginBottom: 24,
  },
  floatEmoji: {
    fontSize: 64,
  },
  biteEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  reelButton: {
    backgroundColor: '#FCD34D',
    minWidth: 200,
    paddingVertical: 20,
  },
  hookCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: '#FFFFFF',
    marginVertical: 24,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetArc: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 20,
    borderColor: '#FCD34D',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  pointer: {
    position: 'absolute',
    width: 4,
    height: 100,
    backgroundColor: '#EF4444',
    top: 0,
  },
  hookButton: {
    backgroundColor: '#22C55E',
    minWidth: 200,
    paddingVertical: 20,
  },
  hookStats: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
  },
  resultCard: {
    alignItems: 'center',
    marginBottom: 24,
    minWidth: '80%',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  fishName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#0891B2',
    marginBottom: 8,
    textAlign: 'center',
  },
  fishRarity: {
    fontSize: 24,
    color: '#FCD34D',
  },
  resetText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 12,
  },
});
