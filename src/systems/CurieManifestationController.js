// src/systems/CurieManifestationController.js

import { EVENTS } from '../core/EventBus.js';
import { CurieVoiceEngine } from '../dialogue/CurieVoiceEngine.js';

/**
 * CURIE MANIFESTATION CONTROLLER
 *
 * Decides WHEN Curie speaks and WHAT triggers her.
 * Routes to CurieVoiceEngine for the actual words.
 */

export class CurieManifestationController {
  constructor(gameStateManager) {
    this.gsm = gameStateManager;
    this.voice = new CurieVoiceEngine(gameStateManager);

    // Cooldowns to prevent spam
    this.lastManifestation = 0;
    this.minCooldown = 30000; // 30 seconds minimum between manifestations

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Location triggers
    this.gsm.events.on(EVENTS.PLAYER_LOCATION_CHANGE, (e) => {
      if (e.data?.to === 'sealed_shaft') {
        this.tryManifest('shaft_proximity');
      }
    });

    // Tremor triggers
    this.gsm.events.on(EVENTS.TREMOR, (e) => {
      if (e.data?.intensity !== 'light') {
        this.tryManifest('tremor');
      }
    });

    // NPC stress triggers
    this.gsm.events.on(EVENTS.NPC_STRESS_CRITICAL, (e) => {
      this.tryManifest('npc_stress', { npc: e.data?.npc });
    });

    // Dialogue echoes - capture NPC phrases
    this.gsm.events.on('dialogue:line', (e) => {
      if (e.data?.speaker !== 'player' && e.data?.emotionalWeight > 0.5) {
        this.voice.addEcho(e.data.speaker, e.data.text, e.data.emotionalWeight);
      }
    });

    // Gate unlock triggers
    this.gsm.events.on(EVENTS.NPC_GATE_UNLOCK, (e) => {
      this.tryManifest('gate_unlock', { npc: e.data?.npc, gate: e.data?.newGate });
    });

    // Night whispers
    this.gsm.events.on(EVENTS.TIME_ADVANCE, () => {
      const timeOfDay = this.gsm.get('time.timeOfDay');
      const activity = this.gsm.get('curie.activity') || 0;

      if (timeOfDay === 'night' && activity > 0.3 && Math.random() < 0.3) {
        this.tryManifest('night_whisper');
      }
    });

    // Kale resonance
    this.gsm.events.on(EVENTS.DIALOGUE_END, (e) => {
      if (e.data?.npc === 'kale') {
        const resonance = this.gsm.get('curie.resonance.kale') || 0;
        if (resonance > 0.4 && Math.random() < resonance) {
          this.tryManifest('kale_resonance');
        }
      }
    });
  }

  /**
   * Attempt a manifestation (respects cooldowns)
   */
  async tryManifest(trigger, context = {}) {
    const now = Date.now();

    // Check cooldown
    if (now - this.lastManifestation < this.minCooldown) {
      return null;
    }

    // Check if Curie is active enough
    const activity = this.gsm.get('curie.activity') || 0;
    const threshold = this.getActivityThreshold(trigger);

    if (activity < threshold) {
      return null;
    }

    // Generate manifestation
    this.lastManifestation = now;

    const result = await this.voice.speak({
      trigger,
      ...context
    });

    if (result.success || result.text) {
      // Update Curie state
      if (!this.gsm.state.curie) {
        this.gsm.state.curie = { activity: 0, coherence: 0, manifestations: 0 };
      }
      this.gsm.state.curie.manifestations = (this.gsm.state.curie.manifestations || 0) + 1;
      this.gsm.adjustCurieActivity(0.05);

      // Emit for UI
      this.gsm.events.emit('curie:speaks', {
        text: result.text,
        state: result.state,
        trigger: trigger
      });

      // Increase tension slightly
      this.gsm.adjustTension(3, 'curie_manifestation');
    }

    return result;
  }

  /**
   * Get activity threshold for different triggers
   */
  getActivityThreshold(trigger) {
    const thresholds = {
      shaft_proximity: 0.2,    // Easy to trigger at shaft
      tremor: 0.3,
      npc_stress: 0.4,
      night_whisper: 0.3,
      kale_resonance: 0.3,
      gate_unlock: 0.2,
      memory_echo: 0.4,
      direct_contact: 0.5
    };

    return thresholds[trigger] || 0.4;
  }

  /**
   * Player attempts direct contact with Curie
   */
  async directContact(playerQuestion) {
    // Direct contact requires higher activity
    const activity = this.gsm.get('curie.activity') || 0;

    if (activity < 0.5) {
      return {
        success: false,
        text: null,
        reason: 'The hum persists, but does not answer.'
      };
    }

    // Increase attunement
    if (!this.gsm.state.curie) {
      this.gsm.state.curie = { activity: 0, coherence: 0, playerAttunement: 0 };
    }
    this.gsm.state.curie.playerAttunement = (this.gsm.state.curie.playerAttunement || 0) + 0.05;

    const result = await this.voice.speak({
      trigger: 'direct_contact',
      question: playerQuestion
    });

    if (result.success || result.text) {
      this.gsm.events.emit('curie:speaks', {
        text: result.text,
        state: result.state,
        trigger: 'direct_contact',
        playerQuestion: playerQuestion
      });
    }

    return result;
  }

  /**
   * Force a manifestation (for scripted events)
   */
  async forceManifestation(trigger, context = {}) {
    this.lastManifestation = 0; // Reset cooldown
    return this.tryManifest(trigger, context);
  }

  /**
   * Get the voice engine (for echo management)
   */
  getVoiceEngine() {
    return this.voice;
  }
}
