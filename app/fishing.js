/**
 * Fishing Session Screen
 * Purpose: Main gameplay - Cast → Wait → Hook → Result flow
 * Extension: Add animations, sound effects, advanced mini-games
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { GAME_CONFIG } from '../constants/gameConfig';
import { getRandomFish } from '../constants/fishData';
import Button from '../components/Button';
import Card from '../components/Card';

const PHASES = {
  IDLE: 'idle',
  CASTING: 'casting',
  WAITING: 'waiting',
  BITING: 'biting',
  HOOKING: 'hooking',
  RESULT: 'result',
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

  const remainingTries = getRemainingTries();

  useEffect(() => {
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

    await useTry();

    if (success) {
      const fish = getRandomFish();
      setCaughtFish(fish);
      await addCatch(fish, hookTime);
    } else {
      setCaughtFish(null);
    }
  };

  const handleFishAgain = () => {
    if (getRemainingTries() > 0) {
      resetFishing();
    } else {
      router.back();
    }
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
            <Text style={styles.phaseText}>Tries remaining: {remainingTries}/3</Text>
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
              title={getRemainingTries() > 0 ? 'Fish Again' : 'Out of Tries'}
              onPress={handleFishAgain}
              disabled={getRemainingTries() === 0}
              style={styles.actionButton}
            />
            {getRemainingTries() === 0 && (
              <Text style={styles.resetText}>Resets at 00:00</Text>
            )}
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

  return (
    <LinearGradient colors={['#0EA5E9', '#06B6D4', '#67E8F9']} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
          {renderPhaseContent()}
        </View>
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
  backButton: {
    padding: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
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
