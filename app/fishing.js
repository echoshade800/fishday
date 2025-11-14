/**
 * Fishing Session Screen
 * Purpose: Main gameplay - Cast → Wait → Hook → Result flow
 * Extension: Add animations, sound effects, advanced mini-games
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image, PanResponder, Easing } from 'react-native';
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
  const { addCatch } = useGameStore();

  const [gamePhase, setGamePhase] = useState('ready');
  const [isDragging, setIsDragging] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showFailDialog, setShowFailDialog] = useState(false);
  const [missedCount, setMissedCount] = useState(0);
  const [castPosition, setCastPosition] = useState({
    x: SCREEN_WIDTH / 2,
    y: SEA_AREA_TOP + (SEA_AREA_BOTTOM - SEA_AREA_TOP) / 2,
  });

  const [reelingSuccessCount, setReelingSuccessCount] = useState(0);
  const [reelingFailCount, setReelingFailCount] = useState(0);
  const [targetZoneStart, setTargetZoneStart] = useState(0);
  const [targetZoneEnd, setTargetZoneEnd] = useState(60);
  const [caughtFish, setCaughtFish] = useState(null);

  const bitingTimeoutRef = useRef(null);
  const waitingTimeoutRef = useRef(null);

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
  const hookBounce = useRef(new Animated.Value(0)).current;
  const reelGlowScale = useRef(new Animated.Value(1)).current;
  const reelGlowOpacity = useRef(new Animated.Value(0)).current;
  const exclamationScale = useRef(new Animated.Value(0)).current;
  const exclamationOpacity = useRef(new Animated.Value(0)).current;

  const pointerRotation = useRef(new Animated.Value(0)).current;
  const currentRotationRef = useRef(0);
  const fishDropY = useRef(new Animated.Value(-200)).current;
  const fishFloatY = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    if (gamePhase === 'waiting') {
      const randomDelay = 2000 + Math.random() * 3000;
      waitingTimeoutRef.current = setTimeout(() => {
        setGamePhase('biting');
      }, randomDelay);
    }

    return () => {
      if (waitingTimeoutRef.current) {
        clearTimeout(waitingTimeoutRef.current);
        waitingTimeoutRef.current = null;
      }
    };
  }, [gamePhase]);

  useEffect(() => {
    if (gamePhase === 'biting') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(hookBounce, {
            toValue: -15,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(hookBounce, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(reelGlowScale, {
              toValue: 1.3,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(reelGlowOpacity, {
              toValue: 0.8,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(reelGlowScale, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(reelGlowOpacity, {
              toValue: 0.3,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();

      Animated.sequence([
        Animated.parallel([
          Animated.spring(exclamationScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 5,
          }),
          Animated.timing(exclamationOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      bitingTimeoutRef.current = setTimeout(() => {
        setMissedCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            setShowFailDialog(true);
            setGamePhase('ready');
            return newCount;
          }
          setGamePhase('waiting');
          return newCount;
        });
      }, 2000);
    } else {
      if (bitingTimeoutRef.current) {
        clearTimeout(bitingTimeoutRef.current);
        bitingTimeoutRef.current = null;
      }
      hookBounce.setValue(0);
      reelGlowScale.setValue(1);
      reelGlowOpacity.setValue(0);
      exclamationScale.setValue(0);
      exclamationOpacity.setValue(0);
    }
  }, [gamePhase]);

  useEffect(() => {
    return () => {
      pointerRotation.removeAllListeners();
    };
  }, []);

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

  const startReelingGame = () => {
    setGamePhase('reeling');
    setReelingSuccessCount(0);
    setReelingFailCount(0);
    generateNewTargetZone();
    startPointerRotation();
  };

  const generateNewTargetZone = () => {
    const zoneSize = 40 + Math.random() * 40;
    const start = Math.random() * (360 - zoneSize);
    setTargetZoneStart(start);
    setTargetZoneEnd(start + zoneSize);
  };

  const startPointerRotation = () => {
    console.log('Starting pointer rotation...');
    pointerRotation.setValue(0);
    currentRotationRef.current = 0;

    const rotationAnimation = Animated.loop(
      Animated.timing(pointerRotation, {
        toValue: 360,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );

    pointerRotation.addListener(({ value }) => {
      currentRotationRef.current = value % 360;
      if (Math.floor(value) % 90 === 0) {
        console.log('Rotation value:', value);
      }
    });

    rotationAnimation.start();
    console.log('Rotation animation started');
    return rotationAnimation;
  };

  const handleReelingTap = async () => {
    const currentRotation = currentRotationRef.current;
    const isInTarget = currentRotation >= targetZoneStart && currentRotation <= targetZoneEnd;

    if (isInTarget) {
      const newSuccessCount = reelingSuccessCount + 1;
      setReelingSuccessCount(newSuccessCount);

      if (newSuccessCount >= 3) {
        const fish = getRandomFish();
        setCaughtFish(fish);
        setGamePhase('success');
        pointerRotation.stopAnimation();
        pointerRotation.removeAllListeners();
        await addCatch(fish);
        startFishDropAnimation();
      } else {
        generateNewTargetZone();
      }
    } else {
      const newFailCount = reelingFailCount + 1;
      setReelingFailCount(newFailCount);

      if (newFailCount >= 2) {
        setGamePhase('fail');
        pointerRotation.stopAnimation();
        pointerRotation.removeAllListeners();
      }
    }
  };

  const startFishFloatAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fishFloatY, {
          toValue: -15,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(fishFloatY, {
          toValue: 15,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(fishFloatY, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const startFishDropAnimation = () => {
    fishDropY.setValue(-200);
    fishFloatY.setValue(0);
    Animated.spring(fishDropY, {
      toValue: SCREEN_HEIGHT * 0.3,
      tension: 20,
      friction: 7,
      useNativeDriver: false,
    }).start(() => {
      startFishFloatAnimation();
    });
  };

  const handleRestart = () => {
    pointerRotation.stopAnimation();
    pointerRotation.removeAllListeners();
    fishDropY.stopAnimation();
    fishFloatY.stopAnimation();
    fishDropY.setValue(-200);
    fishFloatY.setValue(0);
    setGamePhase('ready');
    setReelingSuccessCount(0);
    setReelingFailCount(0);
    setMissedCount(0);
    setCaughtFish(null);
    hookX.setValue(CHARACTER_X + 6);
    hookY.setValue(CHARACTER_Y);
  };

  const handleHome = () => {
    router.push('/home');
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={{ uri: 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/gamebackground.jpg' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Glowing Arc Line */}
      {isDragging && (
        <Svg
          style={styles.arcSvg}
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          pointerEvents="none"
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
          pointerEvents="none"
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
      {(gamePhase === 'casting' || gamePhase === 'waiting' || gamePhase === 'biting' || gamePhase === 'reeling') && (
        <Svg
          style={styles.arcSvg}
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          pointerEvents="none"
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
      {(gamePhase === 'casting' || gamePhase === 'waiting' || gamePhase === 'biting' || gamePhase === 'reeling') && (
        <Animated.View
          style={[
            styles.hook,
            {
              transform: [
                { translateX: Animated.subtract(hookX, 20) },
                { translateY: Animated.add(Animated.subtract(hookY, 20), gamePhase === 'biting' ? hookBounce : 0) },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <Image
            source={{ uri: 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/hook.png' }}
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
          pointerEvents="none"
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
          source={{ uri: 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/smallfish.png' }}
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
          pointerEvents="none"
        />
      ))}

      {/* Character Image */}
      <Image
        source={{ uri: 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/fishpeople1.png' }}
        style={styles.characterImage}
        resizeMode="contain"
        pointerEvents="none"
      />

      {/* Exclamation Mark */}
      {(gamePhase === 'biting') && (
        <Animated.Image
          source={{ uri: 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/20251114145010.png' }}
          style={[
            styles.exclamationMark,
            {
              transform: [
                { scale: exclamationScale },
                { rotate: '15deg' },
                { translateY: hookBounce },
              ],
              opacity: exclamationOpacity,
            },
          ]}
          resizeMode="contain"
          pointerEvents="none"
        />
      )}

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowExitDialog(true)}
          activeOpacity={0.7}
          pointerEvents="auto"
        >
          <View style={styles.backButtonCircle}>
            <ArrowLeft size={24} color="#334155" />
          </View>
        </TouchableOpacity>

        {/* Top Instruction Text */}
        {gamePhase === 'ready' && (
          <View style={styles.instructionContainer} pointerEvents="none">
            <FishIcon size={24} color="#78350F" strokeWidth={2.5} />
            <Text style={styles.instructionText}>Drag button to cast</Text>
          </View>
        )}

        {gamePhase === 'waiting' && (
          <View style={styles.instructionContainer} pointerEvents="none">
            <FishIcon size={24} color="#78350F" strokeWidth={2.5} />
            <Text style={styles.instructionText}>Waiting for fish...</Text>
          </View>
        )}

        {gamePhase === 'biting' && (
          <View style={styles.instructionContainer} pointerEvents="none">
            <FishIcon size={24} color="#78350F" strokeWidth={2.5} />
            <Text style={styles.instructionText}>Tap to reel in!</Text>
          </View>
        )}

        {gamePhase === 'reeling' && (
          <View style={styles.instructionContainer} pointerEvents="none">
            <FishIcon size={24} color="#78350F" strokeWidth={2.5} />
            <Text style={styles.instructionText}>Tap when pointer hits target!</Text>
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
              source={{ uri: 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/fishbutton1.jpg' }}
              style={styles.dragButton}
              resizeMode="contain"
            />
          </Animated.View>
        )}

      </SafeAreaView>

      {/* Pull Rod button - Outside SafeAreaView for better touch handling */}
      {(gamePhase === 'waiting' || gamePhase === 'biting') && (
        <TouchableOpacity
          style={[styles.dragButtonContainer, gamePhase === 'waiting' && styles.buttonDisabled]}
          onPress={() => {
            console.log('Button pressed, gamePhase:', gamePhase);
            if (gamePhase === 'biting') {
              console.log('Starting reeling game...');
              if (bitingTimeoutRef.current) {
                clearTimeout(bitingTimeoutRef.current);
                bitingTimeoutRef.current = null;
              }
              setMissedCount(0);
              startReelingGame();
            }
          }}
          activeOpacity={gamePhase === 'biting' ? 0.7 : 1}
          disabled={gamePhase !== 'biting'}
          pointerEvents="auto"
        >
          {gamePhase === 'biting' && (
            <Animated.View
              style={[
                styles.reelGlowRing,
                {
                  transform: [{ scale: reelGlowScale }],
                  opacity: reelGlowOpacity,
                },
              ]}
              pointerEvents="none"
            />
          )}
          <Image
            source={{ uri: 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/fishbutton2.jpg' }}
            style={styles.dragButton}
            resizeMode="contain"
            pointerEvents="none"
          />
        </TouchableOpacity>
      )}

      {/* Reeling Mini-game */}
      {gamePhase === 'reeling' && (
        <View style={styles.reelingOverlay}>
          <View style={styles.reelingContainer}>
            <View style={styles.circleContainer}>
              <Svg width={200} height={200}>
                <Defs>
                  <LinearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#3B82F6" stopOpacity="1" />
                    <Stop offset="100%" stopColor="#1D4ED8" stopOpacity="1" />
                  </LinearGradient>
                </Defs>

                {/* Main Circle */}
                <Path
                  d="M 100 20 A 80 80 0 1 1 99.99 20"
                  stroke="url(#circleGradient)"
                  strokeWidth="15"
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Target Zone (Yellow) */}
                <Path
                  d={`M 100 100 L ${100 + 80 * Math.cos((targetZoneStart - 90) * Math.PI / 180)} ${100 + 80 * Math.sin((targetZoneStart - 90) * Math.PI / 180)} A 80 80 0 ${(targetZoneEnd - targetZoneStart) > 180 ? 1 : 0} 1 ${100 + 80 * Math.cos((targetZoneEnd - 90) * Math.PI / 180)} ${100 + 80 * Math.sin((targetZoneEnd - 90) * Math.PI / 180)} Z`}
                  fill="#FCD34D"
                  opacity="0.9"
                />
              </Svg>

              <Animated.View
                style={[
                  styles.pointer,
                  {
                    transform: [
                      {
                        rotate: pointerRotation.interpolate({
                          inputRange: [0, 360],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                      { translateY: -80 },
                    ],
                  },
                ]}
              >
                <View style={styles.pointerTriangle} />
              </Animated.View>

              <TouchableOpacity
                style={styles.reelingButton}
                onPress={handleReelingTap}
                activeOpacity={0.8}
              >
                <Text style={styles.reelingButtonText}>PULL!</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.reelingProgressContainer}>
              <Text style={styles.reelingProgress}>
                Success: {reelingSuccessCount}/3  Fails: {reelingFailCount}/2
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Success Dialog */}
      {gamePhase === 'success' && caughtFish && (
        <View style={styles.successScreen}>
          <Image
            source={{ uri: 'https://dzdbhsix5ppsc.cloudfront.net/monster/fishgame/successbackground.jpg' }}
            style={styles.successBackground}
            resizeMode="cover"
            onLoad={() => console.log('Success background loaded')}
            onError={(e) => console.log('Background error:', e.nativeEvent.error)}
          />
          <Animated.View
            style={[
              styles.droppingFish,
              {
                top: Animated.add(fishDropY, fishFloatY),
              },
            ]}
          >
            <Image
              source={{ uri: caughtFish.image }}
              style={styles.droppingFishImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Fish Info Card */}
          <View style={styles.fishInfoCard}>
            <View style={styles.fishImageCircle}>
              <Image
                source={{ uri: caughtFish.image }}
                style={styles.fishCardImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.fishInfoContent}>
              <Text style={styles.fishCardName}>{caughtFish.name}</Text>
              <View style={styles.rarityStars}>
                {[...Array(caughtFish.rarity)].map((_, index) => (
                  <Text key={index} style={styles.star}>⭐</Text>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Fail Dialog */}
      {gamePhase === 'fail' && (
        <View style={styles.dialogOverlay}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>😢 Oops!</Text>
            <Text style={styles.resultMessage}>The fish got away!</Text>
            <Text style={styles.resultSubMessage}>Try again to improve your timing</Text>
            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={[styles.dialogButton, styles.cancelButton]}
                onPress={handleRestart}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Restart</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogButton, styles.confirmButton]}
                onPress={handleHome}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

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

      {/* Game Failed Dialog */}
      {showFailDialog && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>Game Over!</Text>
            <Text style={styles.dialogMessage}>
              You missed the fish 3 times. Better luck next time!
            </Text>
            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={[styles.dialogButton, styles.cancelButton]}
                onPress={() => {
                  setShowFailDialog(false);
                  router.push('/home');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Back to Home</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogButton, styles.confirmButton]}
                onPress={() => {
                  router.replace('/fishing');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>Restart</Text>
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
  exclamationMark: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.15 + SCREEN_HEIGHT * 0.25,
    left: SCREEN_WIDTH * 0.35 + SCREEN_WIDTH * 0.15 - 50,
    width: 100,
    height: 100,
    zIndex: 11,
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
    zIndex: 500,
    elevation: 500,
  },
  buttonDisabled: {
    opacity: 0.5,
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
  reelGlowRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderWidth: 4,
    borderColor: '#FBBF24',
    top: -20,
    left: -20,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
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
    left: 0,
    top: 0,
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
  reelingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: SCREEN_HEIGHT * 0.05,
    alignItems: 'center',
    zIndex: 600,
  },
  reelingContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  reelingProgressContainer: {
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  reelingProgress: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  circleContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pointer: {
    position: 'absolute',
    width: 20,
    height: 20,
    top: '50%',
    left: '50%',
    marginLeft: -10,
    marginTop: -10,
    zIndex: 10,
  },
  pointerTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#EF4444',
    marginLeft: -10,
  },
  reelingButton: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  reelingButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultFishImage: {
    width: 180,
    height: 180,
    borderRadius: 16,
    marginBottom: 16,
  },
  resultFishName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0891B2',
    marginBottom: 8,
    textAlign: 'center',
  },
  resultMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 24,
    textAlign: 'center',
  },
  resultSubMessage: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
  },
  successScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  successBackground: {
    width: '100%',
    height: '100%',
  },
  droppingFish: {
    position: 'absolute',
    left: '50%',
    marginLeft: -75,
    width: 150,
    height: 150,
    zIndex: 1001,
  },
  droppingFishImage: {
    width: '100%',
    height: '100%',
  },
  fishInfoCard: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: '#FFD93D',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1002,
  },
  fishImageCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fishCardImage: {
    width: 70,
    height: 70,
  },
  fishInfoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  fishCardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  rarityStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 20,
    marginRight: 4,
  },
  debugText: {
    position: 'absolute',
    top: 50,
    left: 20,
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    zIndex: 2000,
  },
});
