# WireHead — Product Requirements Document

**Version:** 1.0  
**Last Updated:** 2026-04-08  
**Author:** Dave Dichoson  
**Status:** Draft

---

## Table of Contents

1. [Overview](#overview)
2. [Goals & Objectives](#goals--objectives)
3. [Target Audience](#target-audience)
4. [Constraints & Non-Negotiables](#constraints--non-negotiables)
5. [Tech Stack](#tech-stack)
6. [In Scope](#in-scope)
7. [Out of Scope](#out-of-scope)
8. [Core Mechanics](#core-mechanics)
9. [Procedural Level Generation Algorithm](#procedural-level-generation-algorithm)
10. [Data Model](#data-model)
11. [Screens & Navigation](#screens--navigation)
12. [UI Design Spec](#ui-design-spec)
13. [Development Phases](#development-phases)
14. [Future Roadmap](#future-roadmap)

---

## Overview

**WireHead** is a casual offline puzzle game for iOS and Android where players rotate tiles on a grid to complete an electrical circuit — connecting a power source to all light bulbs on the board. Every level is procedurally generated, meaning no two sessions are identical and the game never runs out of content.

The game is free, ad-free, and requires no internet connection or account to play.

---

## Goals & Objectives

- Ship a polished, fully offline casual puzzle game playable on both iOS and Android
- Implement a procedural level generation system so levels never repeat and scale in difficulty automatically
- Deliver a satisfying tactile experience through smooth animations and haptic feedback
- Keep the codebase simple and maintainable for a solo developer
- Achieve a shippable MVP within 5 weeks

---

## Target Audience

- **Primary:** Casual mobile gamers aged 15–45 who enjoy short-session puzzle games (commute, waiting, breaks)
- **Secondary:** Logic puzzle fans who enjoy games like Flow Free, Unblock Me, or similar
- **Platform split:** iOS and Android equally

---

## Constraints & Non-Negotiables

| Constraint | Details |
|---|---|
| **Offline-first** | The app must be fully functional without any internet connection at all times |
| **No backend / database** | All data is stored locally on the device using AsyncStorage only |
| **No external web APIs** | No REST calls, no analytics SDKs, no third-party cloud services |
| **No ads** | The game is completely free with no advertisements of any kind |
| **No account / login** | Users do not create accounts or sign in |
| **Cross-platform** | Must run identically on iOS and Android from a single codebase |
| **No in-app purchases (MVP)** | Monetization is out of scope for v1.0 |

---

## Tech Stack

### Core

| Layer | Technology | Reason |
|---|---|---|
| Framework | React Native + Expo (SDK 51+) | Cross-platform, fast iteration, TypeScript support |
| Language | TypeScript | Type safety, pairs well with developer's C#/Angular background |
| Navigation | Expo Router | File-based routing, simple screen management |
| Local Storage | AsyncStorage (`@react-native-async-storage/async-storage`) | Persist game progress, settings, and level seeds locally |
| Animations | React Native Reanimated 3 | Smooth 60fps tile rotation and circuit glow animations |
| Haptics | `expo-haptics` | Tactile feedback on tile tap and level completion |
| Gestures | React Native Gesture Handler | Reliable tap detection on grid tiles |
| Audio | `expo-av` | Play sound effects for tile rotation and level completion |

### Development Tools

| Tool | Purpose |
|---|---|
| VS Code | Primary IDE |
| Claude Code | AI-assisted development |
| Expo Go | Live testing on physical devices during development |
| EAS Build | Production builds for App Store and Google Play |
| Git | Version control |

### No Dependencies Needed For

- Maps, GPS, camera — not used
- Authentication — not used
- Push notifications — not used
- Analytics — not used
- Streaming audio / music — not used (short one-shot sound effects only)

---

## In Scope

### MVP (v1.0)

- [ ] Procedurally generated grid-based puzzle levels
- [ ] 3 grid sizes: 4×4, 5×5, 6×6
- [ ] Tile types: straight, elbow (turn), T-junction, cross, dead-end
- [ ] Tap to rotate tiles 90° clockwise with animation
- [ ] Real-time circuit connectivity check (win condition detection)
- [ ] Victory animation when all bulbs are lit
- [ ] Haptic feedback on tap and win
- [ ] Difficulty progression (grid size and bulb count scales with level number)
- [ ] Level counter (tracks how many levels completed)
- [ ] Local persistence of current level progress and total levels completed
- [ ] Settings screen: toggle sound and haptics
- [ ] Sound effects: subtle click on tile rotate, power-up chime on level complete
- [ ] Sound respects the sound toggle in settings (muted when disabled)
- [ ] Splash screen and home screen
- [ ] Level complete screen with "Next Level" CTA

---

## Out of Scope

These are explicitly excluded from v1.0 to keep the scope tight:

- User accounts or cloud sync
- Multiplayer or leaderboards
- Timed / speedrun modes
- Hint system
- Undo button
- Daily challenge levels
- Custom level editor
- Monetization (ads, IAP)
- Analytics or crash reporting
- Social sharing
- Onboarding tutorial (nice to have but deferred)

---

## Core Mechanics

### Tile Types

Every cell in the grid contains one of the following tile types. Each tile has wire segments on specific edges:

| Tile | Symbol | Open Edges | Description |
|---|---|---|---|
| Straight | `━━` | Left, Right (or Top, Bottom) | Wire passes through |
| Elbow | `┗━` | Two adjacent edges | Wire makes a 90° turn |
| T-Junction | `┣━` | Three edges | Wire branches into two directions |
| Cross | `╋` | All four edges | Wire passes through in both directions |
| Dead End | `╸` | One edge only | Wire terminates |
| Power Source | `⚡` | All four edges (fixed) | Origin of the circuit, never rotated |
| Bulb | `💡` | One edge | Destination, lit when connected to source |

### Rotation

- Tapping a tile rotates it **90° clockwise**
- Power source tile is **locked** — cannot be rotated
- Bulb tile is **locked** — cannot be rotated (its connection direction is fixed at generation time)
- All other tiles are freely rotatable

### Win Condition

After every tap, the app runs a **graph traversal (BFS/DFS)** starting from the power source:

1. From the power source, check which of its edges have a tile with a matching open edge
2. Recursively traverse connected tiles
3. Track which bulbs are reachable
4. If **all bulbs** are reached → trigger win state

### Circuit State

- **Disconnected wire** — dim gray color
- **Connected wire** — glowing amber/yellow color, animates with a pulse
- **Lit bulb** — bright glow effect
- **Unlit bulb** — dim, dark icon

---

## Procedural Level Generation Algorithm

> **Core principle: generate the solution first, then scramble it. This guarantees 100% solvability.**

```
FUNCTION generateLevel(gridSize, bulbCount, seed):

  1. INITIALIZE
     └─ Create empty gridSize × gridSize grid
     └─ Place power source at center cell (or fixed position)
     └─ Place bulbCount bulbs at random non-overlapping cells

  2. CONNECT (Randomized DFS spanning path)
     └─ For each bulb:
         └─ Run randomized DFS from power source → bulb
         └─ For each cell visited along the path:
             └─ Record which edges are used (entry + exit direction)
             └─ Assign tile type based on connection count:
                 - 1 connection  → Dead End
                 - 2 connections, opposite sides → Straight
                 - 2 connections, adjacent sides → Elbow
                 - 3 connections → T-Junction
                 - 4 connections → Cross

  3. FILL REMAINING CELLS
     └─ Assign random tile types to all unvisited cells
     └─ These are decoys with no valid circuit path

  4. RECORD SOLUTION STATE
     └─ Save each tile's correct rotation as the "solution"

  5. SCRAMBLE
     └─ For every non-locked tile (not power source, not bulb):
         └─ Apply random rotation: 0°, 90°, 180°, or 270°
         └─ Ensure at least 50% of tiles are not in solution position
            (prevents trivially easy starts)

  6. RETURN
     └─ Grid with scrambled tile rotations
     └─ Solution state (for potential hint system in future)
     └─ Seed used (for reproducibility if needed)
```

### Difficulty Scaling

| Level Range | Grid Size | Bulb Count | Notes |
|---|---|---|---|
| 1 – 10 | 4×4 | 1 | Tutorial feel, easy to grasp |
| 11 – 25 | 5×5 | 2 | Medium challenge |
| 26 – 50 | 6×6 | 2 | Larger board, more decoys |
| 51+ | 6×6 | 3 | Maximum complexity |

---

## Data Model

All data stored locally via **AsyncStorage** as JSON strings.

### `game_state`

```json
{
  "currentLevel": 14,
  "totalCompleted": 13,
  "currentGrid": [
    {
      "id": "0_0",
      "row": 0,
      "col": 0,
      "tileType": "elbow",
      "rotation": 90,
      "isLocked": false,
      "isPowerSource": false,
      "isBulb": false
    }
  ],
  "seed": 839201,
  "gridSize": 5,
  "bulbCount": 2,
  "isComplete": false
}
```

### `settings`

```json
{
  "hapticsEnabled": true,
  "soundEnabled": true
}
```

### `stats`

```json
{
  "totalLevelsCompleted": 13,
  "highestLevelReached": 14
}
```

---

## Screens & Navigation

```
app/
├── index.tsx           → Splash Screen (auto-redirects to home)
├── home.tsx            → Home Screen
├── game.tsx            → Game Board Screen
├── complete.tsx        → Level Complete Screen
└── settings.tsx        → Settings Screen
```

### Screen Descriptions

**Splash Screen**
- App logo + name centered
- Brief fade-in animation
- Auto-navigates to Home after 1.5s

**Home Screen**
- App logo/title
- "Play" button (resumes current level or starts level 1)
- "Settings" button
- Display: current level number and total completed

**Game Board Screen**
- Grid of tiles rendered as a square (fills screen width)
- Power source cell with lock icon
- Bulb cells (lit/unlit state)
- Level number displayed at top
- Tap any non-locked tile to rotate it
- Circuit glow animates in real time

**Level Complete Screen**
- Victory animation (power surge / all tiles light up)
- "Level X Complete!" message
- Haptic burst on arrival
- "Next Level →" button
- No score, no timer — pure progression

**Settings Screen**
- Toggle: Haptics (on/off)
- Toggle: Sound (on/off)
- App version number

---

## UI Design Spec

### Color Palette

| Element | Color | Hex |
|---|---|---|
| Background | Near black | `#0D0D0D` |
| Grid cell background | Dark slate | `#1A1A2E` |
| Cell border | Subtle gray | `#2A2A3E` |
| Wire — disconnected | Dim gray | `#3A3A4A` |
| Wire — connected | Amber glow | `#F5A623` |
| Power source | Electric blue | `#00B4FF` |
| Bulb — unlit | Dark amber | `#5C4A1E` |
| Bulb — lit | Bright yellow | `#FFD700` |
| Text primary | White | `#FFFFFF` |
| Text secondary | Light gray | `#A0A0B0` |
| CTA button | Electric blue | `#00B4FF` |

### Typography

- **Title:** Bold, 28–32px
- **Body / Labels:** Regular, 14–16px
- **Level counter:** Medium, 18px
- Font: System default (San Francisco on iOS, Roboto on Android)

### Tile Rendering

- Each tile is a square `TouchableOpacity`
- Wire segments drawn using `react-native-svg` or styled `View` borders
- Rotation applied via `Animated.Value` or Reanimated `useSharedValue`
- Rotation animation duration: **150ms ease-in-out**
- Glow effect: soft shadow / opacity pulse via Reanimated when connected

---

## Development Phases

### Phase 1 — Foundation (Week 1)
**Goal: Render a static grid with working tile rotation**

- [ ] Initialize Expo project with TypeScript
- [ ] Set up Expo Router with basic screen structure
- [ ] Build `TileComponent` — renders a single tile with correct wire segments per type
- [ ] Build `GridComponent` — renders N×N grid of tiles
- [ ] Implement tap-to-rotate with Reanimated animation (150ms)
- [ ] Lock power source and bulb tiles from rotation
- [ ] Hard-code a sample grid to validate rendering

### Phase 2 — Procedural Generation (Week 2)
**Goal: Generate valid, solvable levels from scratch**

- [ ] Implement `generateLevel(gridSize, bulbCount, seed)` function
- [ ] Implement randomized DFS path-finding from source → each bulb
- [ ] Assign correct tile types based on connection count
- [ ] Fill remaining cells with random decoy tiles
- [ ] Apply scramble pass (randomize non-locked tile rotations)
- [ ] Write unit tests for generation (verify all bulbs reachable in solution state)

### Phase 3 — Win Condition & Connectivity (Week 3)
**Goal: Real-time circuit detection and win state**

- [ ] Implement BFS/DFS `checkConnectivity(grid)` function
- [ ] Run check after every tile rotation
- [ ] Track which bulbs are lit vs unlit
- [ ] Update tile visual state (connected = glowing, disconnected = dim)
- [ ] Trigger win state when all bulbs are connected
- [ ] Build Level Complete screen with next level logic
- [ ] Wire up difficulty scaling (level number → grid size + bulb count)

### Phase 4 — Persistence & Settings (Week 4)
**Goal: Progress survives app close; settings work**

- [ ] Implement AsyncStorage read/write for `game_state`
- [ ] Save grid state after every tile rotation (auto-save)
- [ ] Load saved state on app open (resume mid-level)
- [ ] Implement `settings` storage (haptics, sound toggles)
- [ ] Add `expo-haptics` feedback: tap (light), win (heavy burst)
- [ ] Integrate `expo-av` for sound playback (preload assets on app start)
- [ ] Implement sound: short click on tile rotate, chime on level complete
- [ ] Respect sound toggle — check setting before playing any sound
- [ ] Build Settings screen with functional toggles

### Phase 5 — Polish & Ship (Week 5)
**Goal: App Store ready**

- [ ] Splash screen with logo animation
- [ ] Home screen with level counter
- [ ] Final UI pass — colors, spacing, glow effects
- [ ] Test on physical iOS and Android devices
- [ ] Fix edge cases (tiny grids, all-cross grids, etc.)
- [ ] EAS Build setup for production
- [ ] App icon and splash image assets
- [ ] App Store and Google Play metadata (description, screenshots)
- [ ] Submit for review

---

## Future Roadmap

These are ideas considered but intentionally deferred post-launch:

| Feature | Notes |
|---|---|
| **Daily Challenge** | One curated level per day, same seed for all users (still offline — seed is date-based) |
| **Hint System** | Highlight one incorrectly rotated tile (costs a "hint token") |
| **Undo Button** | Step back one rotation |
| **Timed Mode** | Optional race-the-clock mode for challenge seekers |
| **Themes** | Alternate color schemes (neon, retro, minimal) |
| **Level Packs** | Hand-crafted levels bundled in app updates |
| **Achievements** | Local milestones (complete 50 levels, complete in under 60s, etc.) |
| **Tutorial / Onboarding** | Interactive first-time walkthrough for new players |
| ~~**Sound Effects**~~ | ~~Subtle click on rotate, power-up sound on win~~ — pulled into v1.0 |
| **iPad / Tablet Support** | Larger grid sizes for bigger screens |

---

*This document is intended to be the single source of truth for WireHead v1.0 development. Any scope changes should be reflected here before implementation begins.*