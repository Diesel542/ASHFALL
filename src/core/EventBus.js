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
   * Subscribe to an event (fires only once)
   */
  once(eventType, callback, context = null) {
    const wrapper = (event) => {
      this.off(eventType, wrapper);
      callback.call(context, event);
    };

    return this.on(eventType, wrapper, context);
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
   * Remove all listeners for an event type
   */
  offAll(eventType) {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
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
        try {
          callback.call(context, event);
        } catch (error) {
          console.error(`Wildcard event handler error:`, error);
        }
      }
    }

    return event;
  }

  /**
   * Get recent events of a type
   */
  getRecent(eventType, count = 10) {
    if (eventType) {
      return this.history
        .filter(e => e.type === eventType)
        .slice(-count);
    }
    return this.history.slice(-count);
  }

  /**
   * Get all events since a timestamp
   */
  getSince(timestamp) {
    return this.history.filter(e => e.timestamp > timestamp);
  }

  /**
   * Check if event type has listeners
   */
  hasListeners(eventType) {
    return this.listeners.has(eventType) && this.listeners.get(eventType).length > 0;
  }

  /**
   * Get listener count for event type
   */
  listenerCount(eventType) {
    if (!this.listeners.has(eventType)) return 0;
    return this.listeners.get(eventType).length;
  }

  /**
   * Clear event history
   */
  clearHistory() {
    this.history = [];
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
  NPC_MET: 'npc:met',
  NPC_STRESS_CRITICAL: 'npc:stress_critical',

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
  QUEST_UPDATE: 'quest:update',

  // UI
  SCENE_CHANGE: 'ui:scene_change',
  MENU_OPEN: 'ui:menu_open',
  MENU_CLOSE: 'ui:menu_close',
  VOICE_PANEL_TOGGLE: 'ui:voice_panel_toggle'
};

/**
 * Create a namespaced event type
 */
export function createEventType(namespace, name) {
  return `${namespace}:${name}`;
}
