# WireHead - Product Requirements Document

**Version:** 1.1  
**Last Updated:** 2026-04-18  
**Author:** Dave Dichoson  
**Status:** Active Development / Playable MVP

---

## Purpose

This document is the current source of truth for WireHead v1.0. It serves two jobs:

- Define the intended product for launch
- Record the implementation status already present in the repository

The previous draft PRD described a future target. This revision aligns the plan with the codebase as it exists today.

---

## Overview

WireHead is a casual offline puzzle game for iOS and Android where players rotate tiles on a grid to complete an electrical circuit. The goal is to connect a central power source to every bulb on the board. Levels are procedurally generated, which gives the game effectively endless content without any online dependency.

The product is designed to be:

- Offline-first
- Fast to learn
- Satisfying to interact with
- Simple to maintain as a solo-developer project

---

## Product Goals

- Ship a polished, fully offline puzzle game on iOS and Android
- Deliver a reliable procedural generation loop so players never run out of levels
- Make moment-to-moment interaction feel tactile through animation, haptics, and feedback
- Preserve progress locally with zero account or backend requirements
- Reach an app-store-ready v1.0 without expanding into backend-heavy features

---

## Target Audience

- Primary: Casual mobile players aged 15-45 who enjoy short puzzle sessions
- Secondary: Logic puzzle fans who enjoy games like Flow Free, Pipe Mania, and similar connection puzzles
- Platform focus: iOS and Android first, with web available mainly for development/testing

---

## Constraints And Non-Negotiables

| Constraint | Details |
|---|---|
| Offline-first | The app must remain fully playable with no internet connection |
| No backend | All state is stored locally using AsyncStorage |
| No external APIs | No cloud sync, REST APIs, analytics SDKs, or third-party services |
| No ads | The game remains ad-free |
| No accounts | Players do not sign in or create profiles |
| Single codebase | Core gameplay should behave the same on iOS and Android |
| Solo-dev maintainability | Systems should stay straightforward and easy to reason about |

---

## Current Build Snapshot

Legend:

- `[x]` Implemented
- `[~]` Implemented but still needs polish, validation, or final assets
- `[ ]` Not started

### Core Player Experience

- [x] Procedurally generated grid-based puzzle boards
- [x] Difficulty scaling across `4x4`, `5x5`, and `6x6` grids
- [x] Bulb-count scaling from 1 to 3 based on level range
- [x] Tile types: straight, elbow, t-junction, cross, dead-end, power source, bulb
- [x] Tap-to-rotate tile interaction
- [x] Rotation animation on non-locked tiles
- [x] Real-time connectivity check after each move
- [x] Connected/unconnected visual state for wires and bulbs
- [x] Win detection when all bulbs are powered
- [x] Level-complete screen with a next-level CTA
- [x] Level progression tracking
- [x] Save/resume for the current in-progress board
- [x] Local stats for completed levels and highest level reached
- [x] Settings toggles for sound and haptics
- [x] First-run tutorial overlay with replay support
- [x] Splash, home, game, complete, and settings screens
- [x] Dark/light theme toggle
- [~] Audio feedback is wired in, but final sound polish still needs review
- [~] Tablet-aware layouts are present, but hardware validation is still needed

### Engineering And Release Readiness

- [x] Expo Router application shell and route structure
- [x] AsyncStorage persistence for game state, settings, and stats
- [x] Seeded level generation using deterministic level-derived seeds
- [x] Haptics integration
- [x] App icons and splash configuration in Expo config
- [ ] Automated tests for level generation and connectivity
- [ ] EAS build configuration and release pipeline
- [ ] Full physical-device QA on iOS and Android
- [ ] Final store screenshots, metadata, and submission assets
- [ ] Final balancing pass for long-session procedural difficulty

---

## Tech Stack

### Runtime Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | React Native + Expo SDK 54 | Cross-platform mobile app foundation |
| Language | TypeScript | Shared types for gameplay, storage, and UI |
| Navigation | Expo Router | File-based routing |
| Storage | AsyncStorage | Local-only persistence |
| Animation | React Native Reanimated 4 | Tile rotation and screen motion |
| Gestures | React Native Gesture Handler | Reliable tile input handling |
| Haptics | `expo-haptics` | Tap and completion feedback |
| Audio | `expo-audio` | Rotate/win sound playback |
| Vector Rendering | `react-native-svg` | Tile wires and decorative UI visuals |

### Tooling

| Tool | Purpose |
|---|---|
| Expo Dev Client / Expo Go | Local testing during development |
| ESLint | Static analysis |
| TypeScript compiler | Type safety |
| Git | Version control |

### Important Implementation Note

The original PRD referenced `expo-av`. The current implementation uses `expo-audio`, and this document now reflects the repository rather than the older plan.

---

## Core Mechanics

### Tile Types

| Tile | Open Edges | Behavior |
|---|---|---|
| Straight | Two opposite edges | Carries power in a straight line |
| Elbow | Two adjacent edges | Turns power 90 degrees |
| T-junction | Three edges | Branches power |
| Cross | Four edges | Connects in every direction |
| Dead-end | One edge | Terminates a path |
| Power source | Four edges, locked | Starting point of traversal |
| Bulb | One edge, locked | Lights up when connected |

### Rotation Rules

- Tapping a non-locked tile rotates it 90 degrees clockwise
- Power source tiles are locked
- Bulb tiles are locked
- Rotation animation is short and immediate to keep the interaction snappy

### Win Condition

After every tile rotation, the app runs a breadth-first traversal from the power source:

1. Read the current open edges for the active tile
2. Check neighboring tiles in each open direction
3. Only traverse when both tiles expose matching edges toward each other
4. Track all connected tiles and all powered bulbs
5. Trigger completion when every bulb is powered

### Visual Feedback

- Disconnected wires use a dimmer color
- Connected wires switch to an energized amber glow
- Lit bulbs brighten
- Power source tiles use a dedicated blue accent

---

## Procedural Generation

### Current Algorithm

WireHead follows the principle of generating a valid solution first, then scrambling it.

1. Create an empty `gridSize x gridSize` board
2. Place the power source at the center cell
3. Place `bulbCount` bulbs at random non-overlapping positions
4. For each bulb, run a randomized DFS path from the power source to that bulb
5. Record which edges are used by the valid path network
6. Convert connection sets into tile types and solution rotations
7. Fill unused cells with decoy tiles
8. Scramble all non-locked tiles
9. Enforce a minimum scramble threshold so at least 50% of non-locked tiles begin off-solution

### Current Implementation Notes

- Level seeds are currently derived from level number using `level * 7919`
- Power source position is fixed at board center
- Filler tiles currently come from `straight`, `elbow`, `t-junction`, and `dead-end`
- Cross tiles still exist as a supported type and can appear when path intersections require them
- Solution rotations are generated and retained in memory during board creation, which makes hint/assist features easier to add later

### Difficulty Scaling

| Level Range | Grid Size | Bulb Count | Design Intent |
|---|---|---|---|
| 1-10 | `4x4` | 1 | Gentle onboarding |
| 11-25 | `5x5` | 2 | Medium complexity |
| 26-50 | `6x6` | 2 | Larger search space |
| 51+ | `6x6` | 3 | Highest current complexity |

---

## Data Model

All persistent data is stored locally through AsyncStorage JSON payloads.

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
  "seed": 110866,
  "gridSize": 5,
  "bulbCount": 2,
  "isComplete": false
}
```

### `settings`

```json
{
  "hapticsEnabled": true,
  "soundEnabled": true,
  "tutorialCompleted": false,
  "themeMode": "dark"
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

## Screens And Navigation

```text
app/
|- index.tsx      -> Splash screen
|- home.tsx       -> Home screen
|- game.tsx       -> Active board screen
|- complete.tsx   -> Level complete screen
|- settings.tsx   -> Settings screen
```

### Screen Descriptions

**Splash screen**

- Animated logo and title treatment
- Auto-navigates into the main flow after a short delay

**Home screen**

- Presents the game as a telemetry/control panel
- Shows progression stats and current state
- Starts a new run or resumes progress
- Links to settings

**Game screen**

- Displays the current level and active board
- Renders the tile grid responsively
- Handles tile rotation, connectivity evaluation, persistence, and win transition
- Launches the tutorial overlay for first-time users

**Tutorial overlay**

- Three-step onboarding for rotation, goal, and connection rules
- Can be replayed from settings

**Complete screen**

- Displays a success state after the board is solved
- Routes players into the next level or back home

**Settings screen**

- Toggle haptics
- Toggle sound
- Toggle dark/light theme
- Replay tutorial

---

## UI And UX Direction

The current implementation leans into a sci-fi control-panel presentation instead of a minimalist casual look.

### Visual Direction

- Dark mode uses deep navy surfaces, amber wire highlights, and electric blue power accents
- Light mode uses cool pale surfaces with stronger contrast for active signals
- UI copy uses uppercase control-panel language such as "FIELD SYSTEM ONLINE" and "SECTOR CLEAR"
- Decorative SVG lines and glows reinforce the electrical theme

### Interaction Direction

- The board is the focal point of the game screen
- Motion is fast and lightweight rather than cinematic
- Success screens reinforce momentum and encourage immediate progression

---

## Development Phase Status

| Phase | Status | Notes |
|---|---|---|
| Phase 1 - Foundation | Complete | Grid, tiles, routing, and input are in place |
| Phase 2 - Procedural Generation | Mostly complete | Generation works; automated test coverage is still missing |
| Phase 3 - Connectivity And Win State | Complete | Traversal, bulb lighting, and completion flow are implemented |
| Phase 4 - Persistence And Settings | Mostly complete | Save/resume and settings work; audio polish still needs review |
| Phase 5 - Polish And Ship | In progress | Release config, QA, store assets, and final balancing remain |

---

## Remaining Work For V1.0

- Add automated tests for generation correctness and connectivity behavior
- Validate puzzle quality across longer play sessions and high levels
- Finalize sound assets and confirm mix/volume on mobile hardware
- Test on physical iOS and Android devices, including tablet layouts
- Add EAS build setup and production release configuration
- Prepare store copy, screenshots, icons, and submission checklists

---

## Future Roadmap And Feature Suggestions

The following ideas fit the current architecture well and stay aligned with the offline-first design.

| Priority | Feature | Why It Fits |
|---|---|---|
| High | Undo stack | Rotation actions are discrete and easy to record locally |
| High | Hint system | Solution rotations already exist during generation, making targeted hints straightforward |
| High | Daily challenge | Date-based seeds can create a fresh offline challenge every day without backend work |
| High | Local achievements and streaks | Builds retention while staying fully offline |
| Medium | Accessibility options | Colorblind palettes, reduced motion, and larger tile scaling improve usability |
| Medium | Shareable seed codes | Players can challenge friends by sharing a level seed without adding accounts |
| Medium | Alternate game modes | Timed, move-limit, or zen variants can reuse the same board logic |
| Medium | Theme packs | The app already has a theme system and can extend it with more visual identities |
| Low | Hand-crafted level packs | Useful for curation, but higher content-production effort |
| Low | Level editor | Strong long-term feature, but significantly bigger scope than the current architecture |

### Recommended Next Features After V1.0

1. Undo stack
2. Hint system
3. Daily challenge
4. Local achievements
5. Accessibility improvements

These five offer the best mix of player value, technical leverage, and low/no-backend complexity.

---

*This document should be updated whenever shipped behavior meaningfully changes so the repo, roadmap, and implementation remain aligned.*
