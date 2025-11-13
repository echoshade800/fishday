# FishyDay 🎣

> Relaxing mini fishing game: cast, wait, and hook—collect fish stickers in minutes.

A casual mobile fishing game built with React Native (Expo) where players can enjoy quick 1-3 minute fishing sessions. Catch fish, complete your encyclopedia, and relax with oceanic vibes!

## Features

- **Daily Tries System**: 3 tries per day, resets at midnight
- **16 Unique Fish Species**: Collect them all, from common to legendary
- **Engaging Gameplay**: Cast → Wait → Hook mini-game → Collect
- **Fish Encyclopedia**: Browse and search all species with rarity filters
- **Statistics Tracking**: Monitor your collection progress and best catches
- **Settings**: Sound, vibration, and left-hand mode options

## Tech Stack

- **Framework**: Expo SDK 54
- **Language**: JavaScript
- **State Management**: Zustand
- **Navigation**: expo-router
- **Storage**: AsyncStorage
- **Styling**: React Native StyleSheet

## Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for web
npm run build:web

# Type checking
npm run typecheck
```

## Project Structure

```
FishyDay/
├── app/                      # All screens (expo-router file-based routing)
│   ├── _layout.tsx          # Root navigation layout
│   ├── index.js             # Entry point (redirects to onboarding)
│   ├── onboarding.js        # Welcome screen
│   ├── home.js              # Dashboard/main screen
│   ├── encyclopedia.js      # Fish list with search/filters
│   ├── fishing.js           # Main gameplay screen
│   ├── profile.js           # User profile and settings
│   ├── about.js             # Help and information
│   └── details/
│       └── [id].js          # Fish detail screen (dynamic route)
├── components/              # Reusable UI components
│   ├── Button.js           # Custom button component
│   ├── Card.js             # Card container component
│   └── FishCard.js         # Fish display card
├── constants/              # App constants and data
│   ├── fishData.js        # All fish species data
│   └── gameConfig.js      # Game configuration and parameters
├── store/                 # State management
│   └── gameStore.js       # Zustand store for game state
├── utils/                 # Utility functions
│   └── StorageUtils.js    # AsyncStorage helper class
└── hooks/                 # Custom React hooks
    └── useFrameworkReady.ts # Framework initialization hook
```

## Gameplay Flow

### 1. Onboarding
Welcome screen with value proposition and daily tries explanation.

### 2. Home Dashboard
- View tries remaining (X/3)
- See recent catches
- Quick access to encyclopedia and profile
- Primary "Start Fishing" CTA

### 3. Fishing Session (Cast → Wait → Hook → Result)

**Phase 1: Cast**
- Tap and drag to aim
- Release to cast line into water

**Phase 2: Wait**
- Watch the float bobbing
- Random bite delay (2.5-5s)
- Up to 3 bite cycles if missed

**Phase 3: Hook Mini-Game**
- Circular ring with rotating pointer
- Tap when pointer aligns with yellow target
- Need 3 successful hits
- Max 2 misses allowed

**Phase 4: Result**
- Success: Fish card with species and rarity
- Fail: "Fish escaped" message
- Try is consumed regardless of outcome

### 4. Fish Encyclopedia
- Browse all 16 fish species
- Search by name
- Filter by rarity (★★ to ★★★★★)
- Tap for detailed view

### 5. Profile & Settings
- View statistics (collected species, best rarity, fastest time)
- Toggle sound effects
- Toggle vibration
- Enable left-hand mode
- Debug info (dev only)

## Game Configuration

All gameplay parameters are defined in `constants/gameConfig.js`:

```javascript
DAILY_TRIES_LIMIT: 3
BITE_DELAY_MIN: 2500ms
BITE_DELAY_MAX: 5000ms
HIT_WINDOW: 1000ms
MAX_BITE_CYCLES: 3
REEL_ROUNDS: 3
FAIL_LIMIT: 2
THROW_ANIM_DURATION: 800ms
```

## Data Storage

The app uses AsyncStorage for local persistence:

- **User Data**: Basic user profile (if available)
- **Game Data**: Tries, catches, stats, settings
- **Auto-reset**: Daily tries reset at 00:00

### Storage Keys
- `userData`: User profile information
- `FishyDayinfo`: Game state and statistics

### Stats Mapping
- `maxLevel`: Highest rarity ever caught (1-5)
- `maxScore`: Total unique species collected
- `bestTime`: Fastest hook mini-game completion (ms)

## Adding New Screens

1. Create a new file in `app/` directory
2. Export default React component
3. Add route to `app/_layout.tsx` if needed
4. Use `useRouter()` for navigation

Example:
```javascript
// app/new-screen.js
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function NewScreen() {
  const router = useRouter();

  return (
    <View>
      <Text>New Screen</Text>
    </View>
  );
}
```

## Adding New Features

### Add a New Fish Species
Edit `constants/fishData.js`:
```javascript
{
  id: 17,
  name: 'New Fish',
  rarity: 3,
  imagePlaceholderUrl: 'https://...'
}
```

### Modify Gameplay Parameters
Edit `constants/gameConfig.js` and adjust timing/difficulty values.

### Add New Settings
1. Update `DEFAULT_SETTINGS` in `constants/gameConfig.js`
2. Add UI controls in `app/profile.js`
3. Use `updateSettings()` from game store

## Next Steps

Here are concrete follow-up tasks to enhance FishyDay:

1. **Replace Placeholder Images**: Add real fish artwork/photos to replace placeholder URLs
2. **Add Sound Effects**: Integrate audio for casting, bites, hooks, and success/fail
3. **Implement Haptic Feedback**: Add vibration on key events (bite, hook, catch)
4. **API Integration**: Connect to backend for leaderboards and social features
5. **Advanced Animations**: Improve casting physics and fish reveal animations
6. **User Authentication**: Add Supabase auth for cloud saves and profiles
7. **Achievement System**: Add badges and milestones for collection progress
8. **Social Sharing**: Enhanced sharing with fish images and stats
9. **In-App Tutorials**: Interactive guides for first-time players
10. **Analytics**: Track user engagement and gameplay metrics
11. **Theme Customization**: Add day/night modes and color schemes
12. **Seasonal Events**: Limited-time fish and special challenges

## Development Notes

- **No TypeScript**: Project uses JavaScript only as specified
- **No Bottom Tabs**: Simple stack navigation as requested
- **Oceanic Theme**: Blue gradients, rounded corners, soft shadows throughout
- **Placeholder Images**: Use provided URLs; update later with actual assets
- **Daily Reset Logic**: Implemented but not tested across midnight boundary

## Troubleshooting

### App won't start
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start -c
```

### AsyncStorage errors
Make sure `@react-native-async-storage/async-storage` is properly installed:
```bash
npm install @react-native-async-storage/async-storage
```

### Navigation issues
Verify all screen files are in the `app/` directory and properly exported.

## License

© 2025 FishyDay - All rights reserved

---

**Have fun fishing! 🐟**
