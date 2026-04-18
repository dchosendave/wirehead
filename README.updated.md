# WireHead

WireHead is an offline circuit-routing puzzle game built with Expo and React Native. Players rotate wire tiles to connect a central power source to every bulb on the board. Levels are procedurally generated, progress is stored locally, and the game is designed for short, satisfying mobile play sessions.

## What The Project Offers

- Fully offline puzzle gameplay with no backend, login, ads, or cloud dependency
- Procedurally generated boards with seeded level generation
- Difficulty scaling across `4x4`, `5x5`, and `6x6` grids
- Tile rotation interactions with Reanimated-powered transitions
- Real-time connectivity checks and win-state detection
- Local persistence for current run, settings, and progression stats
- Haptics and audio hooks for tile rotation and level completion
- Splash, home, game, level-complete, and settings screens
- First-run tutorial overlay and replayable onboarding
- Dark and light theme support
- Tablet-aware layouts have been started in the current UI

## Current Status

WireHead is in a playable MVP-plus state. Core gameplay, progression, persistence, and the main user flow are implemented. The biggest remaining gaps are release readiness, automated tests, final asset polish, and production build configuration.

## How To Play

1. Start a run from the home screen.
2. Tap any unlocked tile to rotate it 90 degrees clockwise.
3. Connect the power source to every bulb.
4. Complete the board to unlock the next level.
5. Close and reopen the app at any time to resume saved progress.

## Tech Stack

- Expo SDK 54
- React 19 + React Native 0.81
- TypeScript
- Expo Router
- AsyncStorage
- React Native Reanimated 4
- React Native Gesture Handler
- React Native SVG
- `expo-haptics`
- `expo-audio`

## Project Structure

```text
app/         File-based routes and screens
components/  Reusable UI pieces such as tiles, grids, and tutorial overlay
constants/   Theme colors and level difficulty configuration
lib/         Game logic, storage, audio, connectivity, and theming
assets/      Icons, splash assets, and sound files
types/       Shared TypeScript models
```

## Key Gameplay Systems

- `lib/levelGenerator.ts`: Seeded procedural board generation
- `lib/connectivity.ts`: Graph traversal used to detect powered tiles and lit bulbs
- `lib/storage.ts`: Local save/load helpers for game state, settings, and stats
- `components/TileComponent.tsx`: Tile rendering, rotation animation, and connection glow
- `app/game.tsx`: Main gameplay loop, progression, persistence, and win routing

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the Expo dev server:

   ```bash
   npm run start
   ```

3. Run on a target platform:

   ```bash
   npm run android
   npm run ios
   npm run web
   ```

## Available Scripts

- `npm run start` - Start the Expo dev server
- `npm run android` - Launch the Android target from Expo
- `npm run ios` - Launch the iOS target from Expo
- `npm run web` - Launch the web build in development
- `npm run lint` - Run Expo ESLint checks

## Current Priorities

- Add automated tests for level generation and connectivity rules
- Finish release configuration and production build setup
- Validate layouts and input feel on real iOS and Android devices
- Replace placeholder-quality assets with final audio and store-ready visuals
- Continue balancing puzzle generation difficulty over longer play sessions

## Roadmap Highlights

- Daily challenge mode using date-based seeds
- Undo and hint systems built on top of saved board state and solution rotations
- Local achievements, streak tracking, and richer player stats
- Additional visual themes and accessibility options
- Optional hand-crafted level packs alongside procedural play

## Documentation

- Product requirements and implementation status: [product-requirement-document.md](product-requirement-document.md)
