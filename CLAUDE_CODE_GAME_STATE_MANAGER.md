# ASHFALL: Game State Manager
## The Central Nervous System

### Overview

This document implements the **Game State Manager** — the central controller that connects all Ashfall systems. Every piece we've built (NPCs, dialogue, Curie, relationships, narrative, tone) flows through this hub.

**Core principle:** One source of truth. All systems read from and write to GameState. Events propagate through the EventBus.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GAME STATE MANAGER                           │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │  GameState  │  │  EventBus   │  │  GameLoop   │  │  Systems   │ │
│  │  (data)     │←→│  (signals)  │←→│  (tick)     │←→│  (logic)   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ↑ ↓
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Dialogue   │    │   Narrative  │    │    Curie     │
│   Engine     │    │   Engine     │    │    Entity    │
└──────────────┘    └──────────────┘    └──────────────┘
        ↓                     ↓                     ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Relationship │    │     Tone     │    │     Hum      │
│   Manager    │    │   Validator  │    │    System    │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## 2. Core Game State

```javascript
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
    playTime: 0,           // Total seconds played
    startedAt: Date.now()
  },

  // ═══════════════════════════════════════
  // TIME & PROGRESSION
  // ═══════════════════════════════════════
  
  time: {
    day: 1,
    timeOfDay: 'morning',  // morning, afternoon, dusk, night
    hour: 8                // 0-23
  },

  // ═══════════════════════════════════════
  // NARRATIVE
  // ═══════════════════════════════════════
  
  narrative: {
    currentAct: 1,         // 1, 2, or 3
    actProgress: 0,        // 0-100 within current act
    tension: 20,           // Global tension 0-100
    
    // Act transition triggers
    actTriggers: {
      act1to2: false,      // First major tremor event
      act2to3: false       // Shaft becomes accessible
    },
    
    // Ending trajectory
    endingPath: null,      // stability, escalation, humanized, transcendence, balanced
    endingLocked: false,
    
    // Point of no return flags
    pointOfNoReturn: false
  },

  // ═══════════════════════════════════════
  // PLAYER
  // ═══════════════════════════════════════
  
  player: {
    location: 'gate',      // Current location ID
    previousLocation: null,
    
    // Internal voice alignment
    voiceScores: {
      LOGIC: 0,
      INSTINCT: 0,
      EMPATHY: 0,
      GHOST: 0
    },
    
    // First impression from opening scene
    initialTone: null,     // confident, humble, curious, silent
    
    // Inventory (minimal for prototype)
    inventory: []
  },

  // ═══════════════════════════════════════
  // NPCs
  // ═══════════════════════════════════════
  
  npcs: {
    mara: {
      location: 'watchtower',
      relationship: 50,    // 0-100, player relationship
      stress: 40,          // 0-100, internal stress
      currentGate: 0,      // Arc gate level (0-4)
      outcome: null,       // End state when determined
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
      met: true,           // Met during opening
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
      // Kale-specific
      mirroringTarget: null,
      identityStability: 50  // 0-100, higher = more stable sense of self
    }
  },

  // ═══════════════════════════════════════
  // CURIE-Δ
  // ═══════════════════════════════════════
  
  curie: {
    coherence: 0.3,        // 0-1, how "together" Curie is
    activity: 0.2,         // 0-1, how active/reaching
    playerAttunement: 0,   // How connected player is to Curie
    
    // Resonance with each NPC (0-1)
    resonance: {
      mara: 0.1,
      jonas: 0.2,
      rask: 0.15,
      edda: 0.3,
      kale: 0.4            // Kale has strongest natural resonance
    },
    
    lastPatternSeek: null, // Timestamp of last Curie "reaching" event
    manifestations: 0      // Count of visible Curie events
  },

  // ═══════════════════════════════════════
  // ENVIRONMENT
  // ═══════════════════════════════════════
  
  environment: {
    weather: 'still',      // still, wind, fog, ashfall_heavy
    humIntensity: 0.2,     // 0-1, how loud the hum is
    lastTremor: null,      // Timestamp of last tremor
    tremorCount: 0
  },

  // ═══════════════════════════════════════
  // FLAGS & EVENTS
  // ═══════════════════════════════════════
  
  flags: new Set([
    // Populated as player progresses
    // Examples: 'opening_complete', 'first_tremor_felt', 'shaft_mentioned'
  ]),
  
  // Event log for debugging and narrative tracking
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
    currentScene: 'opening',  // opening, settlement, dialogue, ending
    dialogueOpen: false,
    currentNpc: null,
    voicePanelVisible: false,
    menuOpen: false
  }
});
```

---

## 3. Event Bus

```javascript
// src/core/EventBus.js

/**
 * EVENT BUS
 * 
 * Decoupled communication between systems.
 * Systems emit events, other systems listen.
 * GameStateManager coordinates.
 */

export class EventBus {
  constructor() {
    this.listeners = new Map();
    this.history = [];
    this.maxHistory = 100;
  }

  /**
   * Subscribe to an event
   */
  on(eventType, callback, context = null) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    this.listeners.get(eventType).push({
      callback,
      context
    });

    // Return unsubscribe function
    return () => this.off(eventType, callback);
  }

  /**
   * Unsubscribe from an event
   */
  off(eventType, callback) {
    if (!this.listeners.has(eventType)) return;
    
    const listeners = this.listeners.get(eventType);
    const index = listeners.findIndex(l => l.callback === callback);
    
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Emit an event
   */
  emit(eventType, data = {}) {
    const event = {
      type: eventType,
      data,
      timestamp: Date.now()
    };

    // Log to history
    this.history.push(event);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Notify listeners
    if (this.listeners.has(eventType)) {
      for (const { callback, context } of this.listeners.get(eventType)) {
        try {
          callback.call(context, event);
        } catch (error) {
          console.error(`Event handler error for ${eventType}:`, error);
        }
      }
    }

    // Also emit to wildcard listeners
    if (this.listeners.has('*')) {
      for (const { callback, context } of this.listeners.get('*')) {
        callback.call(context, event);
      }
    }

    return event;
  }

  /**
   * Get recent events of a type
   */
  getRecent(eventType, count = 10) {
    return this.history
      .filter(e => e.type === eventType)
      .slice(-count);
  }
}

// ═══════════════════════════════════════
// EVENT TYPES
// ═══════════════════════════════════════

export const EVENTS = {
  // Game flow
  GAME_START: 'game:start',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  GAME_SAVE: 'game:save',
  GAME_LOAD: 'game:load',

  // Time
  TIME_ADVANCE: 'time:advance',
  DAY_START: 'time:day_start',
  DAY_END: 'time:day_end',

  // Player
  PLAYER_MOVE: 'player:move',
  PLAYER_LOCATION_CHANGE: 'player:location_change',
  VOICE_SCORE_CHANGE: 'player:voice_score_change',

  // Dialogue
  DIALOGUE_START: 'dialogue:start',
  DIALOGUE_END: 'dialogue:end',
  DIALOGUE_CHOICE: 'dialogue:choice',
  NPC_RESPONSE: 'dialogue:npc_response',

  // NPCs
  NPC_RELATIONSHIP_CHANGE: 'npc:relationship_change',
  NPC_STRESS_CHANGE: 'npc:stress_change',
  NPC_GATE_UNLOCK: 'npc:gate_unlock',
  NPC_OUTCOME_SET: 'npc:outcome_set',

  // Narrative
  TENSION_CHANGE: 'narrative:tension_change',
  ACT_TRANSITION: 'narrative:act_transition',
  FLAG_SET: 'narrative:flag_set',
  ENDING_LOCKED: 'narrative:ending_locked',

  // Curie
  CURIE_ACTIVITY_CHANGE: 'curie:activity_change',
  CURIE_COHERENCE_CHANGE: 'curie:coherence_change',
  CURIE_MANIFESTATION: 'curie:manifestation',
  CURIE_RESONANCE: 'curie:resonance',

  // Environment
  WEATHER_CHANGE: 'environment:weather_change',
  TREMOR: 'environment:tremor',
  HUM_INTENSITY_CHANGE: 'environment:hum_change',

  // Quests
  QUEST_START: 'quest:start',
  QUEST_COMPLETE: 'quest:complete',
  QUEST_FAIL: 'quest:fail',

  // UI
  SCENE_CHANGE: 'ui:scene_change',
  MENU_OPEN: 'ui:menu_open',
  MENU_CLOSE: 'ui:menu_close'
};
```

---

## 4. Game State Manager

```javascript
// src/core/GameStateManager.js

import { createInitialState } from './GameState.js';
import { EventBus, EVENTS } from './EventBus.js';

/**
 * GAME STATE MANAGER
 * 
 * The central controller for all game state.
 * All mutations go through here.
 * Coordinates between systems.
 */

export class GameStateManager {
  constructor() {
    this.state = createInitialState();
    this.events = new EventBus();
    this.systems = new Map();
    
    // Bind methods
    this.setupEventHandlers();
  }

  // ═══════════════════════════════════════
  // SYSTEM REGISTRATION
  // ═══════════════════════════════════════

  /**
   * Register a system (dialogue, narrative, curie, etc.)
   */
  registerSystem(name, system) {
    this.systems.set(name, system);
    
    // Give system access to state and events
    if (system.initialize) {
      system.initialize(this.state, this.events);
    }
    
    console.log(`System registered: ${name}`);
  }

  /**
   * Get a registered system
   */
  getSystem(name) {
    return this.systems.get(name);
  }

  // ═══════════════════════════════════════
  // STATE ACCESS
  // ═══════════════════════════════════════

  /**
   * Get current state (read-only snapshot)
   */
  getState() {
    return this.state;
  }

  /**
   * Get specific state slice
   */
  get(path) {
    const parts = path.split('.');
    let value = this.state;
    
    for (const part of parts) {
      if (value === undefined) return undefined;
      value = value[part];
    }
    
    return value;
  }

  // ═══════════════════════════════════════
  // TIME MANAGEMENT
  // ═══════════════════════════════════════

  /**
   * Advance time by hours
   */
  advanceTime(hours = 1) {
    const time = this.state.time;
    time.hour += hours;
    
    // Handle day rollover
    if (time.hour >= 24) {
      time.hour -= 24;
      time.day += 1;
      this.events.emit(EVENTS.DAY_END, { day: time.day - 1 });
      this.events.emit(EVENTS.DAY_START, { day: time.day });
    }
    
    // Update time of day
    time.timeOfDay = this.calculateTimeOfDay(time.hour);
    
    this.events.emit(EVENTS.TIME_ADVANCE, { 
      day: time.day, 
      hour: time.hour, 
      timeOfDay: time.timeOfDay 
    });

    // Trigger time-based updates
    this.onTimeAdvance();
  }

  calculateTimeOfDay(hour) {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'dusk';
    return 'night';
  }

  onTimeAdvance() {
    // NPC stress naturally decreases over time (slightly)
    for (const npcId of Object.keys(this.state.npcs)) {
      this.adjustNpcStress(npcId, -1);
    }

    // Curie activity fluctuates
    const curieSystem = this.getSystem('curie');
    if (curieSystem) {
      curieSystem.onTimeAdvance(this.state);
    }

    // Weather might change
    this.maybeChangeWeather();
  }

  // ═══════════════════════════════════════
  // PLAYER ACTIONS
  // ═══════════════════════════════════════

  /**
   * Move player to a new location
   */
  movePlayer(locationId) {
    const oldLocation = this.state.player.location;
    
    this.state.player.previousLocation = oldLocation;
    this.state.player.location = locationId;
    
    this.events.emit(EVENTS.PLAYER_LOCATION_CHANGE, {
      from: oldLocation,
      to: locationId
    });

    // Update hum intensity based on proximity to shaft
    this.updateHumByLocation(locationId);

    // Check for location-based triggers
    this.checkLocationTriggers(locationId);
  }

  /**
   * Adjust a voice score
   */
  adjustVoiceScore(voice, delta) {
    if (this.state.player.voiceScores.hasOwnProperty(voice)) {
      this.state.player.voiceScores[voice] += delta;
      
      this.events.emit(EVENTS.VOICE_SCORE_CHANGE, {
        voice,
        delta,
        newValue: this.state.player.voiceScores[voice]
      });

      // Recalculate ending path
      this.recalculateEndingPath();
    }
  }

  /**
   * Get dominant voice
   */
  getDominantVoice() {
    const scores = this.state.player.voiceScores;
    const entries = Object.entries(scores);
    const sorted = entries.sort(([,a], [,b]) => b - a);
    
    const [topVoice, topScore] = sorted[0];
    const [, secondScore] = sorted[1];

    if (topScore - secondScore < 5) {
      return { voice: 'BALANCED', confidence: 'low' };
    }

    return {
      voice: topVoice,
      confidence: topScore - secondScore > 15 ? 'high' : 'medium'
    };
  }

  // ═══════════════════════════════════════
  // NPC MANAGEMENT
  // ═══════════════════════════════════════

  /**
   * Adjust NPC relationship
   */
  adjustRelationship(npcId, delta) {
    const npc = this.state.npcs[npcId];
    if (!npc) return;

    const oldValue = npc.relationship;
    npc.relationship = Math.max(0, Math.min(100, npc.relationship + delta));
    
    this.events.emit(EVENTS.NPC_RELATIONSHIP_CHANGE, {
      npc: npcId,
      delta,
      oldValue,
      newValue: npc.relationship
    });

    // Check for gate unlocks
    this.checkGateUnlock(npcId);
  }

  /**
   * Adjust NPC stress
   */
  adjustNpcStress(npcId, delta) {
    const npc = this.state.npcs[npcId];
    if (!npc) return;

    const oldValue = npc.stress;
    npc.stress = Math.max(0, Math.min(100, npc.stress + delta));
    
    if (Math.abs(delta) > 5) {
      this.events.emit(EVENTS.NPC_STRESS_CHANGE, {
        npc: npcId,
        delta,
        oldValue,
        newValue: npc.stress
      });
    }

    // High stress can trigger events
    if (npc.stress > 80) {
      this.checkStressTriggers(npcId);
    }
  }

  /**
   * Unlock an NPC's arc gate
   */
  unlockGate(npcId) {
    const npc = this.state.npcs[npcId];
    if (!npc || npc.currentGate >= 4) return false;

    npc.currentGate += 1;
    
    this.events.emit(EVENTS.NPC_GATE_UNLOCK, {
      npc: npcId,
      newGate: npc.currentGate
    });

    this.logEvent('gate_unlock', { npc: npcId, gate: npc.currentGate });
    
    return true;
  }

  /**
   * Check if NPC gate should unlock
   */
  checkGateUnlock(npcId) {
    const npc = this.state.npcs[npcId];
    const narrativeSystem = this.getSystem('narrative');
    
    if (narrativeSystem) {
      const canUnlock = narrativeSystem.checkGateUnlock(npcId, this.state);
      if (canUnlock) {
        this.unlockGate(npcId);
      }
    }
  }

  /**
   * Record NPC meeting
   */
  meetNpc(npcId) {
    const npc = this.state.npcs[npcId];
    if (!npc || npc.met) return;

    npc.met = true;
    this.setFlag(`met_${npcId}`);
    
    // Check if all NPCs met
    const allMet = Object.values(this.state.npcs).every(n => n.met);
    if (allMet) {
      this.setFlag('met_all_npcs');
    }
  }

  /**
   * Increment conversation count
   */
  incrementConversation(npcId) {
    const npc = this.state.npcs[npcId];
    if (npc) {
      npc.conversationCount += 1;
    }
  }

  // ═══════════════════════════════════════
  // NARRATIVE MANAGEMENT
  // ═══════════════════════════════════════

  /**
   * Adjust global tension
   */
  adjustTension(delta, source = 'unknown') {
    const narrative = this.state.narrative;
    const oldValue = narrative.tension;
    
    narrative.tension = Math.max(0, Math.min(100, narrative.tension + delta));
    
    if (Math.abs(delta) > 3) {
      this.events.emit(EVENTS.TENSION_CHANGE, {
        delta,
        oldValue,
        newValue: narrative.tension,
        source
      });
    }

    // Check for act transitions
    this.checkActTransition();
  }

  /**
   * Check and trigger act transitions
   */
  checkActTransition() {
    const { currentAct, tension, actTriggers } = this.state.narrative;

    // Act 1 → 2: Triggered by first major tremor AND tension > 35
    if (currentAct === 1 && actTriggers.act1to2 && tension > 35) {
      this.transitionToAct(2);
    }

    // Act 2 → 3: Triggered by shaft access AND tension > 70
    if (currentAct === 2 && actTriggers.act2to3 && tension > 70) {
      this.transitionToAct(3);
    }
  }

  /**
   * Transition to a new act
   */
  transitionToAct(newAct) {
    const oldAct = this.state.narrative.currentAct;
    this.state.narrative.currentAct = newAct;
    this.state.narrative.actProgress = 0;

    this.events.emit(EVENTS.ACT_TRANSITION, {
      from: oldAct,
      to: newAct
    });

    this.logEvent('act_transition', { from: oldAct, to: newAct });
    this.setFlag(`act_${newAct}_begun`);

    // Act-specific effects
    if (newAct === 2) {
      // NPCs can no longer pretend
      this.adjustTension(15, 'act_transition');
    }
    
    if (newAct === 3) {
      // Point of no return
      this.state.narrative.pointOfNoReturn = true;
      this.adjustTension(20, 'act_transition');
    }
  }

  /**
   * Recalculate ending path based on voice scores
   */
  recalculateEndingPath() {
    if (this.state.narrative.endingLocked) return;

    const dominant = this.getDominantVoice();
    
    const pathMap = {
      LOGIC: 'stability',
      INSTINCT: 'escalation',
      EMPATHY: 'humanized',
      GHOST: 'transcendence',
      BALANCED: 'balanced'
    };

    this.state.narrative.endingPath = pathMap[dominant.voice];
  }

  /**
   * Lock in the ending
   */
  lockEnding() {
    this.state.narrative.endingLocked = true;
    
    this.events.emit(EVENTS.ENDING_LOCKED, {
      path: this.state.narrative.endingPath,
      voiceScores: { ...this.state.player.voiceScores }
    });

    this.logEvent('ending_locked', { path: this.state.narrative.endingPath });
  }

  // ═══════════════════════════════════════
  // CURIE MANAGEMENT
  // ═══════════════════════════════════════

  /**
   * Adjust Curie activity
   */
  adjustCurieActivity(delta) {
    const curie = this.state.curie;
    const oldValue = curie.activity;
    
    curie.activity = Math.max(0, Math.min(1, curie.activity + delta));
    
    this.events.emit(EVENTS.CURIE_ACTIVITY_CHANGE, {
      delta,
      oldValue,
      newValue: curie.activity
    });

    // Update hum intensity
    this.state.environment.humIntensity = 0.1 + (curie.activity * 0.6);
    
    // High activity might trigger manifestation
    if (curie.activity > 0.7 && Math.random() < 0.3) {
      this.triggerCurieManifestation();
    }
  }

  /**
   * Adjust Curie coherence
   */
  adjustCurieCoherence(delta) {
    const curie = this.state.curie;
    curie.coherence = Math.max(0, Math.min(1, curie.coherence + delta));
    
    this.events.emit(EVENTS.CURIE_COHERENCE_CHANGE, {
      delta,
      newValue: curie.coherence
    });
  }

  /**
   * Trigger a Curie manifestation
   */
  triggerCurieManifestation() {
    this.state.curie.manifestations += 1;
    this.state.curie.lastPatternSeek = Date.now();
    
    this.events.emit(EVENTS.CURIE_MANIFESTATION, {
      count: this.state.curie.manifestations,
      activity: this.state.curie.activity
    });

    this.setFlag('curie_manifested');
    this.adjustTension(5, 'curie_manifestation');
  }

  /**
   * Update Curie resonance with an NPC
   */
  updateCurieResonance(npcId, delta) {
    if (this.state.curie.resonance.hasOwnProperty(npcId)) {
      this.state.curie.resonance[npcId] = Math.max(0, Math.min(1,
        this.state.curie.resonance[npcId] + delta
      ));

      this.events.emit(EVENTS.CURIE_RESONANCE, {
        npc: npcId,
        newValue: this.state.curie.resonance[npcId]
      });
    }
  }

  // ═══════════════════════════════════════
  // ENVIRONMENT
  // ═══════════════════════════════════════

  /**
   * Trigger a tremor
   */
  triggerTremor(intensity = 'light') {
    this.state.environment.lastTremor = Date.now();
    this.state.environment.tremorCount += 1;

    this.events.emit(EVENTS.TREMOR, {
      intensity,
      count: this.state.environment.tremorCount
    });

    // First tremor is significant
    if (this.state.environment.tremorCount === 1) {
      this.setFlag('first_tremor_felt');
    }

    // Tremors increase Curie activity
    const activityDelta = { light: 0.05, medium: 0.1, heavy: 0.2 }[intensity];
    this.adjustCurieActivity(activityDelta);

    // Tremors increase tension
    this.adjustTension(5, 'tremor');

    // Major tremor can trigger Act 1→2
    if (intensity === 'heavy' && this.state.narrative.currentAct === 1) {
      this.state.narrative.actTriggers.act1to2 = true;
      this.checkActTransition();
    }
  }

  /**
   * Update hum based on player location
   */
  updateHumByLocation(locationId) {
    const shaftProximity = {
      sealed_shaft: 1.0,
      well: 0.6,
      market_square: 0.4,
      clinic: 0.3,
      storehouse: 0.3,
      watchtower: 0.2,
      perimeter_path: 0.2,
      gate: 0.1,
      player_quarters: 0.3
    };

    const proximity = shaftProximity[locationId] || 0.2;
    const baseHum = 0.1 + (this.state.curie.activity * 0.5);
    
    this.state.environment.humIntensity = baseHum + (proximity * 0.3);

    this.events.emit(EVENTS.HUM_INTENSITY_CHANGE, {
      location: locationId,
      intensity: this.state.environment.humIntensity
    });
  }

  /**
   * Maybe change weather (called on time advance)
   */
  maybeChangeWeather() {
    if (Math.random() > 0.2) return; // 20% chance per time advance

    const weathers = ['still', 'wind', 'fog', 'ashfall_heavy'];
    const current = this.state.environment.weather;
    const newWeather = weathers[Math.floor(Math.random() * weathers.length)];

    if (newWeather !== current) {
      this.state.environment.weather = newWeather;
      this.events.emit(EVENTS.WEATHER_CHANGE, { weather: newWeather });
    }
  }

  // ═══════════════════════════════════════
  // FLAGS & LOGGING
  // ═══════════════════════════════════════

  /**
   * Set a flag
   */
  setFlag(flag) {
    if (!this.state.flags.has(flag)) {
      this.state.flags.add(flag);
      this.events.emit(EVENTS.FLAG_SET, { flag });
    }
  }

  /**
   * Check if a flag is set
   */
  hasFlag(flag) {
    return this.state.flags.has(flag);
  }

  /**
   * Log a narrative event
   */
  logEvent(type, data) {
    this.state.eventLog.push({
      type,
      data,
      timestamp: Date.now(),
      day: this.state.time.day,
      act: this.state.narrative.currentAct
    });

    // Keep log manageable
    if (this.state.eventLog.length > 500) {
      this.state.eventLog.shift();
    }
  }

  // ═══════════════════════════════════════
  // TRIGGERS & CHECKS
  // ═══════════════════════════════════════

  /**
   * Check location-based triggers
   */
  checkLocationTriggers(locationId) {
    // Near shaft triggers
    if (locationId === 'sealed_shaft') {
      this.setFlag('visited_shaft');
      this.adjustCurieActivity(0.1);
      
      // Kale's resonance spikes near shaft
      this.updateCurieResonance('kale', 0.1);
    }

    // Well triggers
    if (locationId === 'well') {
      this.setFlag('visited_well');
    }
  }

  /**
   * Check stress-triggered events
   */
  checkStressTriggers(npcId) {
    const npc = this.state.npcs[npcId];
    
    if (npc.stress > 90) {
      // NPC might have a breakdown
      this.events.emit('npc:stress_critical', { npc: npcId });
    }
  }

  // ═══════════════════════════════════════
  // DIALOGUE INTEGRATION
  // ═══════════════════════════════════════

  /**
   * Get context for NPC dialogue
   * This is passed to the DialogueEngine
   */
  getDialogueContext(npcId) {
    const npc = this.state.npcs[npcId];
    
    return {
      // Time
      day: this.state.time.day,
      timeOfDay: this.state.time.timeOfDay,
      
      // Environment
      weather: this.state.environment.weather,
      humIntensity: this.state.environment.humIntensity,
      
      // Narrative
      currentAct: this.state.narrative.currentAct,
      tension: this.state.narrative.tension,
      
      // NPC state
      relationship: npc.relationship,
      stress: npc.stress,
      currentGate: npc.currentGate,
      conversationCount: npc.conversationCount,
      
      // Player state
      playerLocation: this.state.player.location,
      dominantVoice: this.getDominantVoice().voice,
      
      // Curie
      curieActivity: this.state.curie.activity,
      curieResonance: this.state.curie.resonance[npcId],
      
      // Flags (relevant subset)
      flags: Array.from(this.state.flags)
    };
  }

  /**
   * Process dialogue result
   * Called after NPC responds
   */
  processDialogueResult(npcId, result) {
    // Increment conversation count
    this.incrementConversation(npcId);

    // Process triggers from the dialogue
    if (result.triggers) {
      for (const trigger of result.triggers) {
        this.handleDialogueTrigger(trigger, npcId);
      }
    }

    // Mark NPC as met
    this.meetNpc(npcId);

    // Slight relationship boost for having a conversation
    this.adjustRelationship(npcId, 1);
  }

  /**
   * Handle triggers extracted from dialogue
   */
  handleDialogueTrigger(trigger, npcId) {
    switch (trigger.type) {
      case 'shaft_mentioned':
        this.setFlag('shaft_mentioned_by_' + npcId);
        this.adjustCurieActivity(0.03);
        break;

      case '23_mentioned':
        this.setFlag('23_mentioned');
        this.adjustTension(3, 'dialogue');
        break;

      case 'emotional_spike':
        this.adjustNpcStress(npcId, 5);
        this.adjustTension(2, 'emotional_dialogue');
        break;

      case 'confession':
        this.adjustRelationship(npcId, 10);
        this.checkGateUnlock(npcId);
        break;
    }
  }

  // ═══════════════════════════════════════
  // SAVE / LOAD
  // ═══════════════════════════════════════

  /**
   * Export state for saving
   */
  exportState() {
    return {
      ...this.state,
      flags: Array.from(this.state.flags), // Convert Set to Array
      meta: {
        ...this.state.meta,
        savedAt: Date.now(),
        playTime: this.state.meta.playTime + (Date.now() - this.state.meta.startedAt)
      }
    };
  }

  /**
   * Import state from save
   */
  importState(savedState) {
    this.state = {
      ...savedState,
      flags: new Set(savedState.flags), // Convert Array back to Set
      meta: {
        ...savedState.meta,
        startedAt: Date.now()
      }
    };

    this.events.emit(EVENTS.GAME_LOAD, { day: this.state.time.day });
  }

  // ═══════════════════════════════════════
  // EVENT HANDLERS SETUP
  // ═══════════════════════════════════════

  setupEventHandlers() {
    // Log all events in development
    this.events.on('*', (event) => {
      console.log(`[Event] ${event.type}`, event.data);
    });
  }
}
```

---

## 5. System Integration Example

```javascript
// src/core/GameManager.js

import { GameStateManager } from './GameStateManager.js';
import { DialogueEngine } from '../dialogue/DialogueEngine.js';
import { NarrativeEngine } from '../systems/NarrativeEngine.js';
import { CurieEntity } from '../systems/CurieEntity.js';
import { RelationshipManager } from '../systems/RelationshipManager.js';

/**
 * GAME MANAGER
 * 
 * Top-level coordinator that initializes everything
 * and provides the main game interface.
 */

export class GameManager {
  constructor() {
    // Create core manager
    this.gsm = new GameStateManager();
    
    // Create systems
    this.dialogue = new DialogueEngine();
    this.narrative = new NarrativeEngine();
    this.curie = new CurieEntity();
    this.relationships = new RelationshipManager();
    
    // Register systems
    this.gsm.registerSystem('dialogue', this.dialogue);
    this.gsm.registerSystem('narrative', this.narrative);
    this.gsm.registerSystem('curie', this.curie);
    this.gsm.registerSystem('relationships', this.relationships);
    
    // Setup cross-system event handlers
    this.setupIntegration();
  }

  setupIntegration() {
    const events = this.gsm.events;

    // When player talks to NPC, update Curie resonance
    events.on('dialogue:end', (event) => {
      const { npc } = event.data;
      this.gsm.updateCurieResonance(npc, 0.02);
    });

    // When tension changes, update Curie activity
    events.on('narrative:tension_change', (event) => {
      if (event.data.delta > 5) {
        this.gsm.adjustCurieActivity(event.data.delta * 0.01);
      }
    });

    // When Curie manifests, affect nearby NPC
    events.on('curie:manifestation', () => {
      const location = this.gsm.get('player.location');
      const nearbyNpc = this.findNpcAtLocation(location);
      if (nearbyNpc) {
        this.gsm.adjustNpcStress(nearbyNpc, 10);
      }
    });

    // When act transitions, update all systems
    events.on('narrative:act_transition', (event) => {
      if (event.data.to === 3) {
        // Act 3: Everything intensifies
        this.gsm.adjustCurieActivity(0.3);
        
        // All NPCs stressed
        for (const npcId of Object.keys(this.gsm.get('npcs'))) {
          this.gsm.adjustNpcStress(npcId, 15);
        }
      }
    });
  }

  findNpcAtLocation(locationId) {
    const npcs = this.gsm.get('npcs');
    for (const [npcId, npc] of Object.entries(npcs)) {
      if (npc.location === locationId) return npcId;
    }
    return null;
  }

  // ═══════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════

  /**
   * Start a new game
   */
  startNewGame() {
    this.gsm.events.emit('game:start');
    this.gsm.setFlag('game_started');
  }

  /**
   * Move player to location
   */
  moveTo(locationId) {
    this.gsm.movePlayer(locationId);
  }

  /**
   * Talk to an NPC
   */
  async talkTo(npcId, playerMessage) {
    const context = this.gsm.getDialogueContext(npcId);
    
    this.gsm.events.emit('dialogue:start', { npc: npcId });
    
    const result = await this.dialogue.chat(npcId, playerMessage, context);
    
    this.gsm.processDialogueResult(npcId, result);
    
    this.gsm.events.emit('dialogue:end', { npc: npcId, result });
    
    return result;
  }

  /**
   * Make a dialogue choice
   */
  async makeChoice(choiceId, voiceTag = null) {
    // Apply voice bonus if choice is voice-tagged
    if (voiceTag) {
      this.gsm.adjustVoiceScore(voiceTag, 1);
    }
    
    this.gsm.events.emit('dialogue:choice', { choiceId, voiceTag });
  }

  /**
   * Advance time
   */
  passTime(hours = 1) {
    this.gsm.advanceTime(hours);
  }

  /**
   * Get current game state for UI
   */
  getUIState() {
    return {
      time: this.gsm.get('time'),
      player: this.gsm.get('player'),
      narrative: this.gsm.get('narrative'),
      environment: this.gsm.get('environment'),
      ui: this.gsm.get('ui')
    };
  }

  /**
   * Save game
   */
  saveGame(slot = 'auto') {
    const saveData = this.gsm.exportState();
    localStorage.setItem(`ashfall_save_${slot}`, JSON.stringify(saveData));
    this.gsm.events.emit('game:save', { slot });
  }

  /**
   * Load game
   */
  loadGame(slot = 'auto') {
    const saveData = localStorage.getItem(`ashfall_save_${slot}`);
    if (saveData) {
      this.gsm.importState(JSON.parse(saveData));
      return true;
    }
    return false;
  }
}

// ═══════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════

export const Game = new GameManager();
```

---

## 6. Usage Example

```javascript
// Example: Playing through the opening

import { Game } from './core/GameManager.js';

// Start a new game
Game.startNewGame();

// Player is at gate, talks to Rask
const raskResponse = await Game.talkTo('rask', "Just passing through.");

console.log(`RASK: ${raskResponse.response}`);

// Move into settlement
Game.moveTo('market_square');

// Pass some time
Game.passTime(2);

// Talk to Kale
const kaleResponse = await Game.talkTo('kale', "What's this place like?");

console.log(`KALE: ${kaleResponse.response}`);

// Check state
const state = Game.getUIState();
console.log(`Day ${state.time.day}, ${state.time.timeOfDay}`);
console.log(`Tension: ${state.narrative.tension}`);
console.log(`Dominant voice: ${Game.gsm.getDominantVoice().voice}`);
```

---

## 7. File Structure

```
src/
├── core/
│   ├── GameState.js         # Initial state definition
│   ├── EventBus.js          # Event system
│   ├── GameStateManager.js  # State mutations & coordination
│   └── GameManager.js       # Top-level API
├── dialogue/
│   ├── DialogueEngine.js    # OpenAI integration
│   └── ...
├── systems/
│   ├── NarrativeEngine.js   # Act/gate/ending logic
│   ├── CurieEntity.js       # Curie state & behavior
│   ├── RelationshipManager.js
│   └── ...
└── main.js                  # Entry point
```

---

## Summary

The Game State Manager provides:

| Component | Purpose |
|-----------|---------|
| **GameState** | Single source of truth for all data |
| **EventBus** | Decoupled communication between systems |
| **GameStateManager** | All state mutations, coordination |
| **GameManager** | Top-level API for game actions |

**Data Flow:**

```
Player Action (move, talk, choose)
        ↓
GameManager (public API)
        ↓
GameStateManager (mutation + events)
        ↓
EventBus (notify all systems)
        ↓
Systems update (Curie, Narrative, etc.)
        ↓
UI reflects new state
```

**Key Principles:**

1. **Single source of truth** — All state in GameState
2. **Mutations through manager** — Never mutate state directly
3. **Events for communication** — Systems don't call each other directly
4. **Context for dialogue** — GSM builds context for every NPC conversation
5. **Triggers propagate** — Dialogue results update state automatically

---

*"Small lives. Heavy truths. The earth remembers."*

*— Now connected*
