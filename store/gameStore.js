/**
 * Game State Store using Zustand
 * Manages global game state including tries, catches, and settings
 */

import { create } from 'zustand';
import StorageUtils from '../utils/StorageUtils';
import { GAME_CONFIG, DEFAULT_SETTINGS, shouldResetDailyTries } from '../constants/gameConfig';

export const useGameStore = create((set, get) => ({
  // User data
  userData: null,

  // Game state
  triesUsedToday: 0,
  lastResetDate: null,
  catches: [],

  // Stats (mapped to template requirements)
  maxLevel: 0, // Highest rarity caught (1-5)
  maxScore: 0, // Total collected species count
  bestTime: Infinity, // Fastest hook mini-game time

  // Settings
  settings: DEFAULT_SETTINGS,

  // Loading states
  isLoading: true,

  // Initialize store from AsyncStorage
  initialize: async () => {
    try {
      set({ isLoading: true });

      // Load user data
      const userData = await StorageUtils.getUserData();

      // Load game data
      const gameData = await StorageUtils.getData();

      if (gameData) {
        const { triesUsedToday = 0, lastResetDate = null, catches = [], maxLevel = 0, maxScore = 0, bestTime = Infinity, settings = DEFAULT_SETTINGS } = gameData;

        // Check if we need to reset daily tries
        if (shouldResetDailyTries(lastResetDate)) {
          set({
            userData,
            triesUsedToday: 0,
            lastResetDate: new Date().toISOString(),
            catches,
            maxLevel,
            maxScore,
            bestTime,
            settings,
            isLoading: false,
          });

          // Save reset
          await StorageUtils.setData({
            triesUsedToday: 0,
            lastResetDate: new Date().toISOString(),
          });
        } else {
          set({
            userData,
            triesUsedToday,
            lastResetDate,
            catches,
            maxLevel,
            maxScore,
            bestTime,
            settings,
            isLoading: false,
          });
        }
      } else {
        // First launch
        const now = new Date().toISOString();
        set({
          userData,
          triesUsedToday: 0,
          lastResetDate: now,
          catches: [],
          maxLevel: 0,
          maxScore: 0,
          bestTime: Infinity,
          settings: DEFAULT_SETTINGS,
          isLoading: false,
        });

        await StorageUtils.setData({
          triesUsedToday: 0,
          lastResetDate: now,
          catches: [],
          maxLevel: 0,
          maxScore: 0,
          bestTime: Infinity,
          settings: DEFAULT_SETTINGS,
        });
      }
    } catch (error) {
      console.error('Failed to initialize game store:', error);
      set({ isLoading: false });
    }
  },

  // Use a try (when starting fishing)
  useTry: async () => {
    const { triesUsedToday } = get();
    const newTries = triesUsedToday + 1;

    set({ triesUsedToday: newTries });
    await StorageUtils.setData({ triesUsedToday: newTries });
  },

  // Add a catch
  addCatch: async (fish, hookTime = null) => {
    const { catches, maxLevel, maxScore, bestTime } = get();

    const newCatch = {
      id: Date.now(),
      fishId: fish.id,
      fishName: fish.name,
      rarity: fish.rarity,
      imagePlaceholderUrl: fish.imagePlaceholderUrl,
      timestamp: new Date().toISOString(),
      hookTime,
    };

    const newCatches = [newCatch, ...catches];

    // Update stats
    const newMaxLevel = Math.max(maxLevel, fish.rarity);

    // Calculate unique species caught
    const uniqueSpecies = new Set(newCatches.map(c => c.fishId));
    const newMaxScore = uniqueSpecies.size;

    // Update best time if applicable
    const newBestTime = hookTime && hookTime < bestTime ? hookTime : bestTime;

    set({
      catches: newCatches,
      maxLevel: newMaxLevel,
      maxScore: newMaxScore,
      bestTime: newBestTime,
    });

    await StorageUtils.setData({
      catches: newCatches,
      maxLevel: newMaxLevel,
      maxScore: newMaxScore,
      bestTime: newBestTime,
    });
  },

  // Get remaining tries
  getRemainingTries: () => {
    const { triesUsedToday } = get();
    return Math.max(0, GAME_CONFIG.DAILY_TRIES_LIMIT - triesUsedToday);
  },

  // Update settings
  updateSettings: async (newSettings) => {
    const { settings } = get();
    const updatedSettings = { ...settings, ...newSettings };

    set({ settings: updatedSettings });
    await StorageUtils.setData({ settings: updatedSettings });
  },

  // Get recent catches (last 3)
  getRecentCatches: () => {
    const { catches } = get();
    return catches.slice(0, 3);
  },
}));
