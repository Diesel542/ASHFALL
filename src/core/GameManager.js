// src/core/GameManager.js

import { GameStateManager } from './GameStateManager.js';
import { EVENTS } from './EventBus.js';
import { SaveManager } from '../systems/SaveManager.js';
import { TimeSystem } from '../systems/TimeSystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';
import { QuestTriggerSystem } from '../systems/QuestTriggerSystem.js';

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

    // Create save manager
    this.save = new SaveManager(this.gsm);

    // Systems will be registered dynamically
    this.dialogue = null;
    this.narrative = null;
    this.curie = null;
    this.relationships = null;

    // Initialize time and quest systems
    this.questSystem = new QuestSystem();
    this.time = new TimeSystem(this.gsm);
    this.questTriggers = new QuestTriggerSystem(this.gsm, this.questSystem);

    // Register time and quest systems
    this.gsm.registerSystem('time', this.time);
    this.gsm.registerSystem('questTriggers', this.questTriggers);

    // Track initialization state
    this.initialized = false;
  }

  /**
   * Initialize with systems
   * Call this after importing the systems you need
   */
  async initialize(systems = {}) {
    // Register provided systems
    if (systems.dialogue) {
      this.dialogue = systems.dialogue;
      this.gsm.registerSystem('dialogue', this.dialogue);
    }

    if (systems.narrative) {
      this.narrative = systems.narrative;
      this.gsm.registerSystem('narrative', this.narrative);
    }

    if (systems.curie) {
      this.curie = systems.curie;
      this.gsm.registerSystem('curie', this.curie);
    }

    if (systems.relationships) {
      this.relationships = systems.relationships;
      this.gsm.registerSystem('relationships', this.relationships);
    }

    // Setup cross-system event handlers
    this.setupIntegration();

    this.initialized = true;
    console.log('GameManager initialized');

    return this;
  }

  /**
   * Setup cross-system event handlers
   */
  setupIntegration() {
    const events = this.gsm.events;

    // When player talks to NPC, update Curie resonance
    events.on(EVENTS.DIALOGUE_END, (event) => {
      const { npc } = event.data;
      if (npc) {
        this.gsm.updateCurieResonance(npc, 0.02);
      }
    });

    // When tension changes significantly, update Curie activity
    events.on(EVENTS.TENSION_CHANGE, (event) => {
      if (event.data.delta > 5) {
        this.gsm.adjustCurieActivity(event.data.delta * 0.01);
      }
    });

    // When Curie manifests, affect nearby NPC
    events.on(EVENTS.CURIE_MANIFESTATION, () => {
      const location = this.gsm.get('player.location');
      const nearbyNpc = this.findNpcAtLocation(location);
      if (nearbyNpc) {
        this.gsm.adjustNpcStress(nearbyNpc, 10);
      }
    });

    // When act transitions, update all systems
    events.on(EVENTS.ACT_TRANSITION, (event) => {
      if (event.data.to === 3) {
        // Act 3: Everything intensifies
        this.gsm.adjustCurieActivity(0.3);

        // All NPCs stressed
        for (const npcId of Object.keys(this.gsm.get('npcs'))) {
          this.gsm.adjustNpcStress(npcId, 15);
        }
      }
    });

    // When tremor occurs, check for NPC reactions
    events.on(EVENTS.TREMOR, (event) => {
      const intensity = event.data.intensity;

      // Edda reacts strongly to tremors
      if (intensity === 'heavy') {
        this.gsm.adjustNpcStress('edda', 15);
        this.gsm.updateCurieResonance('edda', 0.1);
      }

      // Kale is drawn to the shaft during tremors
      this.gsm.updateCurieResonance('kale', 0.05);
    });

    // When NPC gate unlocks, log it
    events.on(EVENTS.NPC_GATE_UNLOCK, (event) => {
      console.log(`${event.data.npc} advanced to gate ${event.data.newGate}`);
    });
  }

  /**
   * Find NPC at a location
   */
  findNpcAtLocation(locationId) {
    const npcs = this.gsm.get('npcs');
    for (const [npcId, npc] of Object.entries(npcs)) {
      if (npc.location === locationId) return npcId;
    }
    return null;
  }

  /**
   * Get all NPCs at a location
   */
  findAllNpcsAtLocation(locationId) {
    const npcs = this.gsm.get('npcs');
    const result = [];
    for (const [npcId, npc] of Object.entries(npcs)) {
      if (npc.location === locationId) {
        result.push(npcId);
      }
    }
    return result;
  }

  // ═══════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════

  /**
   * Start a new game
   */
  startNewGame() {
    this.gsm.reset();
    this.gsm.events.emit(EVENTS.GAME_START, { timestamp: Date.now() });
    this.gsm.setFlag('game_started');
    return this;
  }

  /**
   * Move player to location
   */
  moveTo(locationId) {
    this.gsm.movePlayer(locationId);
    return this;
  }

  /**
   * Get current player location
   */
  getLocation() {
    return this.gsm.get('player.location');
  }

  /**
   * Talk to an NPC (initiate dialogue)
   */
  async talkTo(npcId, playerMessage) {
    if (!this.dialogue) {
      console.warn('Dialogue system not initialized');
      return null;
    }

    const context = this.gsm.getDialogueContext(npcId);

    this.gsm.setDialogueOpen(true, npcId);

    const result = await this.dialogue.chat(npcId, playerMessage, context);

    this.gsm.processDialogueResult(npcId, result);

    return result;
  }

  /**
   * Get opening dialogue from an NPC
   */
  async getOpening(npcId) {
    if (!this.dialogue) {
      console.warn('Dialogue system not initialized');
      return null;
    }

    const context = this.gsm.getDialogueContext(npcId);

    this.gsm.setDialogueOpen(true, npcId);

    const result = await this.dialogue.getOpening(npcId, context);

    this.gsm.processDialogueResult(npcId, result);

    return result;
  }

  /**
   * End current dialogue
   */
  endDialogue() {
    const npcId = this.gsm.get('ui.currentNpc');
    this.gsm.setDialogueOpen(false, null);
    return npcId;
  }

  /**
   * Make a dialogue choice
   */
  makeChoice(choiceId, voiceTag = null) {
    // Apply voice bonus if choice is voice-tagged
    if (voiceTag) {
      this.gsm.adjustVoiceScore(voiceTag, 1);
    }

    this.gsm.events.emit(EVENTS.DIALOGUE_CHOICE, { choiceId, voiceTag });
    return this;
  }

  /**
   * Advance time
   */
  passTime(hours = 1) {
    this.gsm.advanceTime(hours);
    return this;
  }

  // ═══════════════════════════════════════
  // TIME API
  // ═══════════════════════════════════════

  /**
   * Rest at player quarters
   */
  rest() {
    return this.time.rest();
  }

  /**
   * Get current time info
   */
  getTimeInfo() {
    return this.time.getTimeDescription();
  }

  // ═══════════════════════════════════════
  // QUEST API
  // ═══════════════════════════════════════

  /**
   * Get active quests
   */
  getActiveQuests() {
    return this.questTriggers.getActiveQuests();
  }

  /**
   * Complete a quest
   */
  completeQuest(questId, outcome) {
    return this.questTriggers.completeQuest(questId, outcome);
  }

  /**
   * Check for available quests
   */
  checkForQuests() {
    this.questTriggers.checkAllTriggers();
  }

  /**
   * Trigger a tremor
   */
  triggerTremor(intensity = 'light') {
    this.gsm.triggerTremor(intensity);
    return this;
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
      ui: this.gsm.get('ui'),
      curie: this.gsm.get('curie')
    };
  }

  /**
   * Get NPC state
   */
  getNpcState(npcId) {
    return this.gsm.getNpc(npcId);
  }

  /**
   * Get all NPC states
   */
  getAllNpcs() {
    return this.gsm.get('npcs');
  }

  /**
   * Check if player has met an NPC
   */
  hasMetNpc(npcId) {
    const npc = this.gsm.getNpc(npcId);
    return npc ? npc.met : false;
  }

  /**
   * Get dominant voice
   */
  getDominantVoice() {
    return this.gsm.getDominantVoice();
  }

  /**
   * Get current ending path
   */
  getEndingPath() {
    return this.gsm.get('narrative.endingPath');
  }

  /**
   * Check if a flag is set
   */
  hasFlag(flag) {
    return this.gsm.hasFlag(flag);
  }

  /**
   * Set a flag
   */
  setFlag(flag) {
    this.gsm.setFlag(flag);
    return this;
  }

  /**
   * Adjust relationship with NPC
   */
  adjustRelationship(npcId, delta) {
    this.gsm.adjustRelationship(npcId, delta);
    return this;
  }

  /**
   * Adjust NPC stress
   */
  adjustStress(npcId, delta) {
    this.gsm.adjustNpcStress(npcId, delta);
    return this;
  }

  /**
   * Adjust global tension
   */
  adjustTension(delta, source = 'manual') {
    this.gsm.adjustTension(delta, source);
    return this;
  }

  /**
   * Get event bus for custom subscriptions
   */
  getEvents() {
    return this.gsm.events;
  }

  /**
   * Subscribe to an event
   */
  on(eventType, callback) {
    return this.gsm.events.on(eventType, callback);
  }

  /**
   * Save game to slot
   */
  saveGame(slot = 'manual_1') {
    return this.save.save(slot);
  }

  /**
   * Load game from slot
   */
  loadGame(slot) {
    const result = this.save.load(slot);
    if (result.success) {
      // Reinitialize systems with loaded state
      this.reinitializeSystems();
      this.gsm.events.emit(EVENTS.GAME_LOAD, { slot });
    }
    return result;
  }

  /**
   * Quick save (F5)
   */
  quickSave() {
    return this.save.quickSave();
  }

  /**
   * Quick load (F9)
   */
  quickLoad() {
    const result = this.save.quickLoad();
    if (result.success) {
      this.reinitializeSystems();
      this.gsm.events.emit(EVENTS.GAME_LOAD, { slot: 'quicksave' });
    }
    return result;
  }

  /**
   * Start auto-save timer
   */
  startAutoSave() {
    this.save.startAutoSave();
  }

  /**
   * Stop auto-save timer
   */
  stopAutoSave() {
    this.save.stopAutoSave();
  }

  /**
   * Reinitialize systems after load
   */
  reinitializeSystems() {
    // Reset dialogue histories if dialogue system exists
    if (this.dialogue && this.dialogue.clearAllHistories) {
      this.dialogue.clearAllHistories();
    }

    // Notify systems of state change
    this.gsm.events.emit('game:loaded');
  }

  /**
   * Check if save exists
   */
  hasSave(slot) {
    return this.save.hasSave(slot);
  }

  /**
   * Check if any save exists
   */
  hasAnySave() {
    return this.save.hasAnySave();
  }

  /**
   * Delete a save
   */
  deleteSave(slot) {
    return this.save.deleteSave(slot);
  }

  /**
   * Get most recent save slot (for Continue button)
   */
  getMostRecentSave() {
    return this.save.getMostRecentSave();
  }

  /**
   * Get the underlying GameStateManager
   */
  getGSM() {
    return this.gsm;
  }
}

// ═══════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════

let gameInstance = null;

/**
 * Get or create the singleton game instance
 */
export function getGame() {
  if (!gameInstance) {
    gameInstance = new GameManager();
  }
  return gameInstance;
}

/**
 * Reset the singleton (mainly for testing)
 */
export function resetGame() {
  if (gameInstance) {
    gameInstance.gsm.reset();
  }
  gameInstance = null;
}

// Default export for convenience
export default getGame;
