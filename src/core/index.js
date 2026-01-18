// src/core/index.js

/**
 * ASHFALL Core Module
 *
 * The central nervous system that connects all game systems.
 */

export {
  createInitialState,
  NPC_IDS,
  LOCATION_IDS,
  VOICES,
  TIME_PERIODS,
  WEATHER_TYPES,
  ENDING_PATHS
} from './GameState.js';

export { EventBus, EVENTS, createEventType } from './EventBus.js';

export { GameStateManager } from './GameStateManager.js';

export { GameManager, getGame, resetGame } from './GameManager.js';
