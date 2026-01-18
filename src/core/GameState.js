// src/core/GameState.js

/**
 * GAME STATE
 *
 * The single source of truth for all game data.
 * All systems read from and write to this object.
 * Never mutate directly — use GameStateManager methods.
 */

export const createInitialState = () => ({

  // ═══════════════════════════════════════
  // META
  // ═══════════════════════════════════════

  meta: {
    version: '0.1.0',
    saveSlot: null,
    playTime: 0,
    startedAt: Date.now()
  },

  // ═══════════════════════════════════════
  // TIME & PROGRESSION
  // ═══════════════════════════════════════

  time: {
    day: 1,
    timeOfDay: 'morning',
    hour: 8
  },

  // ═══════════════════════════════════════
  // NARRATIVE
  // ═══════════════════════════════════════

  narrative: {
    currentAct: 1,
    actProgress: 0,
    tension: 20,

    actTriggers: {
      act1to2: false,
      act2to3: false
    },

    endingPath: null,
    endingLocked: false,
    pointOfNoReturn: false
  },

  // ═══════════════════════════════════════
  // PLAYER
  // ═══════════════════════════════════════

  player: {
    location: 'gate',
    previousLocation: null,

    voiceScores: {
      LOGIC: 0,
      INSTINCT: 0,
      EMPATHY: 0,
      GHOST: 0
    },

    initialTone: null,
    inventory: []
  },

  // ═══════════════════════════════════════
  // NPCs
  // ═══════════════════════════════════════

  npcs: {
    mara: {
      location: 'watchtower',
      relationship: 50,
      stress: 40,
      currentGate: 0,
      outcome: null,
      met: false,
      conversationCount: 0
    },
    jonas: {
      location: 'clinic',
      relationship: 50,
      stress: 55,
      currentGate: 0,
      outcome: null,
      met: false,
      conversationCount: 0
    },
    rask: {
      location: 'gate',
      relationship: 50,
      stress: 30,
      currentGate: 0,
      outcome: null,
      met: true,
      conversationCount: 1
    },
    edda: {
      location: 'perimeter_path',
      relationship: 50,
      stress: 50,
      currentGate: 0,
      outcome: null,
      met: false,
      conversationCount: 0
    },
    kale: {
      location: 'market_square',
      relationship: 50,
      stress: 35,
      currentGate: 0,
      outcome: null,
      met: false,
      conversationCount: 0,
      mirroringTarget: null,
      identityStability: 50
    }
  },

  // ═══════════════════════════════════════
  // CURIE-Δ
  // ═══════════════════════════════════════

  curie: {
    coherence: 0.3,
    activity: 0.2,
    playerAttunement: 0,

    resonance: {
      mara: 0.1,
      jonas: 0.2,
      rask: 0.15,
      edda: 0.3,
      kale: 0.4
    },

    lastPatternSeek: null,
    manifestations: 0
  },

  // ═══════════════════════════════════════
  // ENVIRONMENT
  // ═══════════════════════════════════════

  environment: {
    weather: 'still',
    humIntensity: 0.2,
    lastTremor: null,
    tremorCount: 0
  },

  // ═══════════════════════════════════════
  // FLAGS & EVENTS
  // ═══════════════════════════════════════

  flags: new Set(),
  eventLog: [],

  // ═══════════════════════════════════════
  // QUESTS
  // ═══════════════════════════════════════

  quests: {
    active: [],
    completed: [],
    failed: []
  },

  // ═══════════════════════════════════════
  // UI STATE
  // ═══════════════════════════════════════

  ui: {
    currentScene: 'opening',
    dialogueOpen: false,
    currentNpc: null,
    voicePanelVisible: false,
    menuOpen: false
  }
});

/**
 * NPC IDs for iteration
 */
export const NPC_IDS = ['mara', 'jonas', 'rask', 'edda', 'kale'];

/**
 * Location IDs
 */
export const LOCATION_IDS = [
  'gate',
  'market_square',
  'clinic',
  'watchtower',
  'storehouse',
  'well',
  'sealed_shaft',
  'perimeter_path',
  'player_quarters'
];

/**
 * Voice types
 */
export const VOICES = ['LOGIC', 'INSTINCT', 'EMPATHY', 'GHOST'];

/**
 * Time of day periods
 */
export const TIME_PERIODS = ['morning', 'afternoon', 'dusk', 'night'];

/**
 * Weather types
 */
export const WEATHER_TYPES = ['still', 'wind', 'fog', 'ashfall_heavy'];

/**
 * Ending paths
 */
export const ENDING_PATHS = ['stability', 'escalation', 'humanized', 'transcendence', 'balanced'];
