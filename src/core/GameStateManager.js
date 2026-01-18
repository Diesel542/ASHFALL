// src/core/GameStateManager.js

import { createInitialState, NPC_IDS } from './GameState.js';
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

  /**
   * Check if a system is registered
   */
  hasSystem(name) {
    return this.systems.has(name);
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
   * Get specific state slice by path
   */
  get(path) {
    const parts = path.split('.');
    let value = this.state;

    for (const part of parts) {
      if (value === undefined || value === null) return undefined;
      value = value[part];
    }

    return value;
  }

  /**
   * Set a value at a path (internal use)
   */
  _set(path, value) {
    const parts = path.split('.');
    const last = parts.pop();
    let target = this.state;

    for (const part of parts) {
      if (target[part] === undefined) {
        target[part] = {};
      }
      target = target[part];
    }

    target[last] = value;
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
    for (const npcId of NPC_IDS) {
      this.adjustNpcStress(npcId, -1);
    }

    // Curie activity fluctuates
    const curieSystem = this.getSystem('curie');
    if (curieSystem && curieSystem.onTimeAdvance) {
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
    const sorted = entries.sort(([, a], [, b]) => b - a);

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

  /**
   * Set player's initial tone from opening
   */
  setInitialTone(tone) {
    this.state.player.initialTone = tone;
    this.setFlag(`opening_tone_${tone}`);
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
    this.setFlag(`${npcId}_gate_${npc.currentGate}`);

    return true;
  }

  /**
   * Check if NPC gate should unlock
   */
  checkGateUnlock(npcId) {
    const narrativeSystem = this.getSystem('narrative');

    if (narrativeSystem && narrativeSystem.checkGateUnlock) {
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

    this.events.emit(EVENTS.NPC_MET, { npc: npcId });

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

  /**
   * Get NPC by ID
   */
  getNpc(npcId) {
    return this.state.npcs[npcId] || null;
  }

  /**
   * Set NPC outcome
   */
  setNpcOutcome(npcId, outcome) {
    const npc = this.state.npcs[npcId];
    if (npc) {
      npc.outcome = outcome;
      this.events.emit(EVENTS.NPC_OUTCOME_SET, { npc: npcId, outcome });
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
    if (oldAct === newAct) return;

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
      this.adjustTension(15, 'act_transition');
    }

    if (newAct === 3) {
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

  /**
   * Trigger act transition flag
   */
  triggerActTransition(fromTo) {
    if (fromTo === '1to2') {
      this.state.narrative.actTriggers.act1to2 = true;
    } else if (fromTo === '2to3') {
      this.state.narrative.actTriggers.act2to3 = true;
    }
    this.checkActTransition();
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

  /**
   * Adjust player attunement to Curie
   */
  adjustPlayerAttunement(delta) {
    this.state.curie.playerAttunement = Math.max(0, Math.min(1,
      this.state.curie.playerAttunement + delta
    ));
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
    const activityDelta = { light: 0.05, medium: 0.1, heavy: 0.2 }[intensity] || 0.05;
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
    if (Math.random() > 0.2) return;

    const weathers = ['still', 'wind', 'fog', 'ashfall_heavy'];
    const current = this.state.environment.weather;
    const newWeather = weathers[Math.floor(Math.random() * weathers.length)];

    if (newWeather !== current) {
      this.state.environment.weather = newWeather;
      this.events.emit(EVENTS.WEATHER_CHANGE, { weather: newWeather });
    }
  }

  /**
   * Set weather directly
   */
  setWeather(weather) {
    this.state.environment.weather = weather;
    this.events.emit(EVENTS.WEATHER_CHANGE, { weather });
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
   * Remove a flag
   */
  removeFlag(flag) {
    this.state.flags.delete(flag);
  }

  /**
   * Get all flags as array
   */
  getFlags() {
    return Array.from(this.state.flags);
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

  /**
   * Get recent events from log
   */
  getRecentEvents(count = 20) {
    return this.state.eventLog.slice(-count);
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

    // Clinic triggers
    if (locationId === 'clinic') {
      this.setFlag('visited_clinic');
    }
  }

  /**
   * Check stress-triggered events
   */
  checkStressTriggers(npcId) {
    const npc = this.state.npcs[npcId];

    if (npc.stress > 90) {
      this.events.emit(EVENTS.NPC_STRESS_CRITICAL, { npc: npcId });
      this.setFlag(`${npcId}_stress_critical`);
    }
  }

  // ═══════════════════════════════════════
  // DIALOGUE INTEGRATION
  // ═══════════════════════════════════════

  /**
   * Get context for NPC dialogue
   */
  getDialogueContext(npcId) {
    const npc = this.state.npcs[npcId];
    if (!npc) return null;

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
      npcStress: this.getAllNpcStress(),
      npcGates: this.getAllNpcGates(),
      relationships: this.getAllRelationships(),

      // Player state
      playerLocation: this.state.player.location,
      dominantVoice: this.getDominantVoice().voice,
      voiceScores: { ...this.state.player.voiceScores },

      // Curie
      curieActivity: this.state.curie.activity,
      curieResonance: this.state.curie.resonance[npcId],

      // Flags
      flags: this.state.flags
    };
  }

  /**
   * Get all NPC stress levels
   */
  getAllNpcStress() {
    const stress = {};
    for (const [id, npc] of Object.entries(this.state.npcs)) {
      stress[id] = npc.stress;
    }
    return stress;
  }

  /**
   * Get all NPC gates
   */
  getAllNpcGates() {
    const gates = {};
    for (const [id, npc] of Object.entries(this.state.npcs)) {
      gates[id] = npc.currentGate;
    }
    return gates;
  }

  /**
   * Get all NPC relationships
   */
  getAllRelationships() {
    const relationships = {};
    for (const [id, npc] of Object.entries(this.state.npcs)) {
      relationships[id] = npc.relationship;
    }
    return relationships;
  }

  /**
   * Process dialogue result
   */
  processDialogueResult(npcId, result) {
    this.incrementConversation(npcId);

    if (result.triggers) {
      for (const trigger of result.triggers) {
        this.handleDialogueTrigger(trigger, npcId);
      }
    }

    this.meetNpc(npcId);
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

      case 'hum_mentioned':
        this.setFlag('hum_mentioned_by_' + npcId);
        this.adjustCurieActivity(0.02);
        break;

      case 'emotional_spike':
        this.adjustNpcStress(npcId, 5);
        this.adjustTension(2, 'emotional_dialogue');
        break;

      case 'confession_adjacent':
        this.adjustRelationship(npcId, 5);
        this.checkGateUnlock(npcId);
        break;
    }
  }

  // ═══════════════════════════════════════
  // QUESTS
  // ═══════════════════════════════════════

  /**
   * Start a quest
   */
  startQuest(quest) {
    this.state.quests.active.push(quest);
    this.events.emit(EVENTS.QUEST_START, { quest });
  }

  /**
   * Complete a quest
   */
  completeQuest(questId) {
    const index = this.state.quests.active.findIndex(q => q.id === questId);
    if (index > -1) {
      const quest = this.state.quests.active.splice(index, 1)[0];
      quest.completedAt = Date.now();
      this.state.quests.completed.push(quest);
      this.events.emit(EVENTS.QUEST_COMPLETE, { quest });
    }
  }

  /**
   * Fail a quest
   */
  failQuest(questId) {
    const index = this.state.quests.active.findIndex(q => q.id === questId);
    if (index > -1) {
      const quest = this.state.quests.active.splice(index, 1)[0];
      quest.failedAt = Date.now();
      this.state.quests.failed.push(quest);
      this.events.emit(EVENTS.QUEST_FAIL, { quest });
    }
  }

  // ═══════════════════════════════════════
  // UI STATE
  // ═══════════════════════════════════════

  /**
   * Set current scene
   */
  setScene(scene) {
    const oldScene = this.state.ui.currentScene;
    this.state.ui.currentScene = scene;
    this.events.emit(EVENTS.SCENE_CHANGE, { from: oldScene, to: scene });
  }

  /**
   * Set dialogue state
   */
  setDialogueOpen(open, npcId = null) {
    this.state.ui.dialogueOpen = open;
    this.state.ui.currentNpc = npcId;

    if (open) {
      this.events.emit(EVENTS.DIALOGUE_START, { npc: npcId });
    } else {
      this.events.emit(EVENTS.DIALOGUE_END, { npc: npcId });
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
      flags: Array.from(this.state.flags),
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
      flags: new Set(savedState.flags),
      meta: {
        ...savedState.meta,
        startedAt: Date.now()
      }
    };

    this.events.emit(EVENTS.GAME_LOAD, { day: this.state.time.day });
  }

  /**
   * Reset to initial state
   */
  reset() {
    this.state = createInitialState();
    this.events.clearHistory();
  }

  // ═══════════════════════════════════════
  // EVENT HANDLERS SETUP
  // ═══════════════════════════════════════

  setupEventHandlers() {
    // Debug logging in development
    if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
      this.events.on('*', (event) => {
        console.log(`[Event] ${event.type}`, event.data);
      });
    }
  }
}
