# WireHead Future Feature Roadmap

This document captures the most promising feature enhancements for WireHead after the current playable MVP. The focus is on features that fit the existing offline-first architecture and can build on the systems already in the repository.

## Guiding Principles

- Stay fully offline by default
- Reuse the current procedural generation and local storage systems
- Improve replayability without adding backend complexity
- Prioritize features that make the core puzzle loop stronger before expanding scope

## Priority Tiers

### High Priority

#### Undo Stack [Done]

Allow the player to reverse recent tile rotations.

Current status:

- Implemented in the active game flow
- Undo history is persisted in saved game state
- Players can reverse recent moves while a board is still in progress

Why it matters:

- Reduces frustration
- Encourages experimentation
- Fits the existing move model well because each action changes a single tile

High-level approach:

- Record each tile rotation as a move
- Push the move onto an `undoStack`
- Revert the most recent move when the player taps Undo
- Re-run connectivity checks after each undo
- Optionally persist undo history in saved game state

Suggested MVP behavior:

- Single-step undo with no limit at first
- Disable Undo after level completion or cancel the completion transition if Undo is pressed during the brief completion window
- Clear the stack when starting a new level

#### Hint System

Give players a small amount of assistance without solving the whole puzzle for them.

Why it matters:

- Helps players recover from frustration spikes
- Makes harder levels more approachable
- Leverages the solution-state information already produced during level generation

Possible hint types:

- Highlight one incorrectly rotated tile
- Highlight one correct next move
- Briefly pulse the route to one unlit bulb

Suggested MVP behavior:

- One hint reveals one incorrect tile
- Optional cooldown or per-level limit

#### Daily Challenge

Offer one special board each day using a date-based seed.

Why it matters:

- Adds repeatable daily engagement
- Requires no backend if the seed is derived locally from the device date
- Encourages players to return without changing the main progression loop

Suggested MVP behavior:

- One unique daily level
- Separate from main progression
- Track local completion streaks

#### Local Achievements And Streaks

Reward consistency and mastery through local-only milestones.

Why it matters:

- Increases retention
- Creates long-term goals without online services
- Works well with existing level completion and stats systems

Possible achievements:

- Complete 10 levels
- Complete 50 levels
- Finish 3 levels in a row without hints
- Maintain a 7-day daily challenge streak

#### Accessibility Improvements

Improve usability across a wider range of players.

Why it matters:

- Expands who can comfortably play the game
- Strengthens overall product quality
- Many improvements can be handled locally through settings

Possible additions:

- Colorblind-friendly palettes
- Higher contrast mode
- Reduced motion toggle
- Larger tile sizing option
- Stronger non-color indicators for powered vs unpowered states

### Medium Priority

#### Shareable Seed Codes

Let players share a seed so other people can play the same board.

Why it matters:

- Adds social play without needing accounts or servers
- Reuses the existing seeded-generation model

Possible behavior:

- Show a seed code on the complete screen or pause area
- Allow manual seed entry for a custom challenge board

#### Alternate Game Modes

Expand the core puzzle loop with optional variants.

Possible modes:

- Timed mode
- Move-limit mode
- Zen mode
- No-hints hardcore mode

Why it matters:

- Increases replayability
- Reuses the same board generation and connectivity logic

#### Theme Packs

Add more visual identities without changing gameplay.

Possible themes:

- Neon lab
- Retro terminal
- Industrial amber
- Blueprint minimal

Why it matters:

- Freshens the experience
- Builds on the existing theme system

#### Expanded Stats

Track richer player progress and performance.

Possible stats:

- Fastest solve
- Fewest moves
- Average solve time
- Longest streak
- Most-played board size

Why it matters:

- Gives long-term players more goals
- Pairs well with achievements and daily challenge play

### Lower Priority

#### Hand-Crafted Level Packs

Curated puzzle sets designed around specific learning or challenge arcs.

Why it matters:

- Allows more intentional difficulty design
- Gives the game authored content alongside procedural replayability

Tradeoff:

- Requires more content production than systems work

#### Adaptive Difficulty

Tune board generation based on recent player performance.

Why it matters:

- Can smooth difficulty spikes
- Helps different player skill levels stay engaged

Tradeoff:

- Requires more balancing and telemetry-style local logic

#### Weekly Challenge Or Challenge Ladder

Offer rotating challenge sequences using bundled or date-based content.

Why it matters:

- Extends retention loops
- Still possible without backend infrastructure

#### Solution Playback Or Ghost Replay

Show how a solved board came together after completion.

Why it matters:

- Great for learning and polish
- Makes victories feel more rewarding

#### Level Editor

Allow players or the developer to create custom boards.

Why it matters:

- Very strong long-term feature
- Opens the door to curated content workflows

Tradeoff:

- Significantly larger scope than the other ideas

## Recommended Development Order

1. Hint system
2. Daily challenge
3. Local achievements and streaks
4. Accessibility improvements
5. Shareable seed codes
6. Alternate game modes
7. Theme packs
8. Expanded stats

## Completed Recently

### Undo Stack

Undo was prioritized first because it improved the moment-to-moment experience of every puzzle without changing the rules of the game.

It is also one of the best technical fits for the current codebase:

- Moves are discrete tile rotations
- The game already recalculates connectivity after every move
- Progress is already saved locally
- Undo was introduced without changing level generation

## Notes For The Next Planning Pass

When implementation begins, the next planning step should define:

- Whether hints are unlimited, cooldown-based, or capped per level
- Whether daily challenge progress has its own stats model
- Which accessibility options belong in v1.0.x versus later releases
