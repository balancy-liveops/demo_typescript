# Level Progression API

## Overview

Balancy provides a built-in level progression system that tracks a player's journey through game levels. The system is driven by three API methods and exposes several profile parameters that update automatically. These parameters can be used in Balancy's segmentation conditions, Game Events, A/B tests, and any other feature that reads from the system profile.

## API Methods

All methods are available on `Balancy.API.General`.

### `levelStarted()`

Call this when the player begins a level attempt. This signals that a new attempt is in progress.

**Effects on profile:**

- Increments `levelAttempts` by 1
- Records `levelStartTime` (timestamp of when the attempt began)

```typescript
Balancy.API.General.levelStarted();
```

### `levelCompleted()`

Call this when the player successfully completes the current level.

**Effects on profile:**

- Increments `level` by 1
- Increments `winStreak` by 1
- Resets `loseStreak` to 0
- Resets `levelAttempts` to 0
- Updates `lastWinTime` to the current timestamp
- Increments `levelsCompletedThisSession` by 1

```typescript
Balancy.API.General.levelCompleted();
```

### `levelFailed()`

Call this when the player fails the current level.

**Effects on profile:**

- Increments `loseStreak` by 1
- Resets `winStreak` to 0
- Updates `lastLoseTime` to the current timestamp
- Increments `levelsFailedThisSession` by 1

```typescript
Balancy.API.General.levelFailed();
```

## Profile Parameters

All parameters are available on `Balancy.Profiles.system.generalInfo` and are read-only (managed by the API methods above).

| Parameter | Type | Description |
|-----------|------|-------------|
| `level` | `number` | The player's current level. Incremented on each `levelCompleted()` call. |
| `winStreak` | `number` | Consecutive level completions. Resets to 0 when `levelFailed()` is called. |
| `loseStreak` | `number` | Consecutive level failures. Resets to 0 when `levelCompleted()` is called. |
| `levelAttempts` | `number` | Number of times `levelStarted()` was called for the current level. Resets to 0 when `levelCompleted()` is called. |
| `levelStartTime` | `number` | Timestamp (epoch) of the most recent `levelStarted()` call. Useful for measuring time spent on a level. |
| `lastWinTime` | `number` | Timestamp of the most recent `levelCompleted()` call. |
| `lastLoseTime` | `number` | Timestamp of the most recent `levelFailed()` call. |
| `levelsCompletedThisSession` | `number` | Number of levels completed in the current session. Resets each session. |
| `levelsFailedThisSession` | `number` | Number of levels failed in the current session. Resets each session. |

## Expected Call Flow

The correct sequence for a single level attempt:

```
levelStarted() -> player plays -> levelCompleted() or levelFailed()
```

For a full gameplay loop with retries:

```
levelStarted()   -- attempt 1, levelAttempts = 1
levelFailed()    -- player fails, loseStreak = 1

levelStarted()   -- attempt 2, levelAttempts = 2
levelFailed()    -- player fails again, loseStreak = 2

levelStarted()   -- attempt 3, levelAttempts = 3
levelCompleted() -- player wins, level increments, levelAttempts resets to 0, loseStreak resets to 0
```

## Practical Use Cases

### Difficulty-based segmentation

Use `loseStreak` or `levelAttempts` in segmentation conditions to identify struggling players:

- **Show a hint offer** when `levelAttempts >= 3` for the same level
- **Reduce difficulty** when `loseStreak >= 5`
- **Offer a power-up** when `levelAttempts >= 2` AND `level <= 5` (early-game struggling players)

### Engagement-based segmentation

Use `winStreak` and session-level stats to identify engaged players:

- **Reward streak bonuses** when `winStreak >= 3`
- **Trigger a "take a break" event** when `levelsCompletedThisSession >= 20`
- **Show a "you're on fire" banner** when `winStreak >= 5`

### Time-based conditions

Use `levelStartTime`, `lastWinTime`, and `lastLoseTime` for time-aware logic:

- **Detect AFK players** by comparing current time with `levelStartTime`
- **Show a "welcome back" offer** based on time elapsed since `lastWinTime`

## Integration Example

```typescript
// When player taps "Play" on a level
const onPlayLevel = () => {
    Balancy.API.General.levelStarted();
    startGameplay();
};

// When gameplay ends
const onGameplayEnd = (won: boolean) => {
    if (won) {
        Balancy.API.General.levelCompleted();
    } else {
        Balancy.API.General.levelFailed();
    }

    // Read updated stats from the profile
    const info = Balancy.Profiles.system.generalInfo;
    console.log(`Level: ${info.level}`);
    console.log(`Win Streak: ${info.winStreak}`);
    console.log(`Lose Streak: ${info.loseStreak}`);
    console.log(`Level Attempts: ${info.levelAttempts}`);
};
```

## Best Practices

1. **Always call `levelStarted()` before `levelCompleted()` or `levelFailed()`.** The system uses `levelStarted()` to track attempt counts and timing. Skipping it means `levelAttempts` and `levelStartTime` won't update.

2. **Call exactly one outcome per attempt.** Each `levelStarted()` should be followed by exactly one `levelCompleted()` or `levelFailed()`. Calling both, or calling neither, will produce incorrect streak and attempt counts.

3. **Don't call `levelCompleted()` or `levelFailed()` without a preceding `levelStarted()`.** While the API won't throw an error, the `levelAttempts` counter won't reflect reality and `levelStartTime` will be stale.

4. **Use `levelAttempts` for per-level difficulty tuning, use `loseStreak` for overall frustration detection.** `levelAttempts` resets when the player advances, so it reflects struggle on a specific level. `loseStreak` persists across levels, so it reflects a broader pattern of failure.

5. **Prefer these built-in parameters over custom properties.** Since these are first-class profile fields, they work out of the box with Balancy segmentation, Game Events, and A/B testing without any additional configuration.

6. **Session-scoped counters (`levelsCompletedThisSession`, `levelsFailedThisSession`) reset automatically.** Don't manually reset them. Use them for within-session pacing logic only.
