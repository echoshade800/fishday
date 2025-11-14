/**
 * Game Configuration Constants
 * All gameplay parameters and settings
 */

export const GAME_CONFIG = {
  // Daily tries system
  DAILY_TRIES_LIMIT: 5,

  // Fishing gameplay timing (in milliseconds)
  BITE_DELAY_MIN: 2500,
  BITE_DELAY_MAX: 5000,
  HIT_WINDOW: 1000,
  MAX_BITE_CYCLES: 3,

  // Hook mini-game parameters
  REEL_ROUNDS: 3,
  FAIL_LIMIT: 2,
  TARGET_ARC_START: 90, // degrees
  TARGET_ARC_MIN: 40, // degrees
  ROTATION_SPEED_START: 180, // degrees per second
  ROTATION_SPEED_GAIN: 60, // degrees per second per round
  CLICK_TOLERANCE: 6, // degrees

  // Animation durations
  THROW_ANIM_DURATION: 800,

  // Storage keys
  STORAGE_KEY_TRIES: 'triesUsedToday',
  STORAGE_KEY_LAST_RESET: 'lastResetDate',
  STORAGE_KEY_CATCHES: 'catches',
  STORAGE_KEY_MAX_LEVEL: 'maxLevel',
  STORAGE_KEY_MAX_SCORE: 'maxScore',
  STORAGE_KEY_BEST_TIME: 'bestTime',
  STORAGE_KEY_SETTINGS: 'settings',
};

// Default settings
export const DEFAULT_SETTINGS = {
  soundEnabled: true,
  vibrationEnabled: true,
  leftHandMode: false,
};

// Helper function to check if daily tries should reset
export const shouldResetDailyTries = (lastResetDate) => {
  if (!lastResetDate) return true;

  const lastReset = new Date(lastResetDate);
  const now = new Date();

  // Reset if it's a new day (00:00)
  return (
    now.getDate() !== lastReset.getDate() ||
    now.getMonth() !== lastReset.getMonth() ||
    now.getFullYear() !== lastReset.getFullYear()
  );
};

// Get remaining tries
export const getRemainingTries = (triesUsed) => {
  return Math.max(0, GAME_CONFIG.DAILY_TRIES_LIMIT - triesUsed);
};
