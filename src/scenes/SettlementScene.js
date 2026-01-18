// src/scenes/SettlementScene.js

import Phaser from 'phaser';
import { getGame } from '../core/GameManager.js';
import { UIManager } from '../ui/UIManager.js';
import { DialogueController } from '../ui/DialogueController.js';
import { Transitions } from '../ui/Transitions.js';
import { SaveLoadMenu } from '../ui/SaveLoadMenu.js';
import { QuestNotification } from '../ui/QuestNotification.js';
import { CurieWhisperPanel } from '../ui/CurieWhisperPanel.js';
import { CurieGlimpse } from '../ui/CurieGlimpse.js';
import { CurieManifestationController } from '../systems/CurieManifestationController.js';
import { Settlement } from '../world/Settlement.js';
import { PlayerController } from '../world/PlayerController.js';
import { EVENTS } from '../core/EventBus.js';
import { DialogueEngine } from '../dialogue/DialogueEngine.js';

/**
 * SETTLEMENT SCENE
 *
 * The main gameplay scene.
 * Player explores, talks to NPCs, uncovers the mystery.
 */

export class SettlementScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettlementScene' });
  }

  init(data) {
    this.entryData = data || {};
  }

  create() {
    this.cameras.main.fadeIn(500, 26, 23, 20);

    // Get game manager
    this.game = getGame();

    // Initialize dialogue engine if not already done
    if (!this.game.dialogue) {
      console.log('[SettlementScene] Initializing DialogueEngine...');
      const dialogueEngine = new DialogueEngine();
      this.game.initialize({ dialogue: dialogueEngine });
    }

    // ═══════════════════════════════════════
    // WORLD SETUP
    // ═══════════════════════════════════════

    // Create settlement map
    this.settlement = new Settlement(this);

    // Create player controller
    this.player = new PlayerController(this, this.settlement);

    // ═══════════════════════════════════════
    // UI SETUP
    // ═══════════════════════════════════════

    this.ui = new UIManager(this);
    this.dialogue = new DialogueController(this, this.game);
    this.transitions = new Transitions(this);

    // Save/Load menu
    this.saveLoadMenu = new SaveLoadMenu(this, this.game.save);

    // Quest notification
    this.questNotification = new QuestNotification(this);

    // Curie manifestation system
    this.curieController = new CurieManifestationController(this.game.gsm);
    this.curieWhisper = new CurieWhisperPanel(this);
    this.curieGlimpse = new CurieGlimpse(this);

    // Setup save/load keyboard shortcuts
    this.setupSaveLoadShortcuts();

    // ═══════════════════════════════════════
    // ATMOSPHERE
    // ═══════════════════════════════════════

    this.createAshfall();
    this.createHumEffect();

    // ═══════════════════════════════════════
    // EVENT LISTENERS
    // ═══════════════════════════════════════

    this.setupEventListeners();

    // ═══════════════════════════════════════
    // INITIAL STATE
    // ═══════════════════════════════════════

    // Update UI with current state
    this.updateUI();

    // Show initial location
    this.onLocationChange({ to: this.game.gsm.get('player.location') });

    // If first entry, show glimpses
    if (this.entryData.firstEntry && !this.game.gsm.hasFlag('settlement_glimpses_shown')) {
      this.showSettlementGlimpses();
    }
  }

  setupEventListeners() {
    const events = this.game.gsm.events;

    // Location changes
    events.on(EVENTS.PLAYER_LOCATION_CHANGE, (e) => this.onLocationChange(e.data));

    // Tremors
    events.on(EVENTS.TREMOR, (e) => this.onTremor(e.data));

    // Curie manifestations
    events.on(EVENTS.CURIE_MANIFESTATION, () => this.onCurieManifestation());

    // Act transitions
    events.on(EVENTS.ACT_TRANSITION, (e) => this.onActTransition(e.data));

    // Conversation end
    this.events.on('conversation:end', () => this.onConversationEnd());

    // Dialogue advance (player clicks to continue)
    this.events.on('dialogue:advance', () => this.onDialogueAdvance());

    // Quest events
    events.on(EVENTS.QUEST_START, (e) => this.onQuestStart(e.data));
    events.on(EVENTS.QUEST_COMPLETE, (e) => this.onQuestComplete(e.data));

    // NPC seeking player
    events.on('npc:seeks_player', (e) => this.onNpcSeeksPlayer(e.data));

    // Narrative events (time-based story beats)
    events.on('narrative:event', (e) => this.onNarrativeEvent(e.data));

    // NPC location updates (after rest or time change)
    events.on('npcs:locations_updated', () => this.onNpcLocationsUpdated());

    // Curie manifestations
    events.on('curie:speaks', (e) => this.onCurieSpeaks(e.data));

    // Direct contact with Curie at shaft (C key)
    this.input.keyboard.on('keydown-C', async () => {
      if (this.game.gsm.get('player.location') === 'sealed_shaft') {
        const result = await this.curieController.directContact('I want to understand.');
        if (!result.success && result.reason) {
          this.showNarrativeText(result.reason);
        }
      }
    });
  }

  // ═══════════════════════════════════════
  // ATMOSPHERE
  // ═══════════════════════════════════════

  createAshfall() {
    const { width } = this.cameras.main;

    this.ashEmitter = this.add.particles(0, -10, 'ash-particle', {
      x: { min: 0, max: width },
      lifespan: 8000,
      speedY: { min: 15, max: 35 },
      speedX: { min: -10, max: 10 },
      scale: { start: 0.8, end: 0.3 },
      alpha: { start: 0.5, end: 0 },
      quantity: 1,
      frequency: 300
    });
  }

  createHumEffect() {
    const { width, height } = this.cameras.main;

    // Vignette overlay for hum visualization
    this.humOverlay = this.add.graphics();
    this.humOverlay.setDepth(999);
    this.updateHumVisual();
  }

  updateHumVisual() {
    const { width, height } = this.cameras.main;
    const intensity = this.game.gsm.get('environment.humIntensity');

    this.humOverlay.clear();

    // Draw vignette
    const alpha = intensity * 0.3;
    this.humOverlay.fillStyle(0x1a1714, alpha);
    this.humOverlay.fillRect(0, 0, 100, height);
    this.humOverlay.fillRect(width - 100, 0, 100, height);
    this.humOverlay.fillRect(0, 0, width, 80);
    this.humOverlay.fillRect(0, height - 80, width, 80);

    // Subtle color shift near edges
    if (intensity > 0.5) {
      this.humOverlay.fillStyle(0x442222, (intensity - 0.5) * 0.2);
      this.humOverlay.fillRect(0, 0, width, height);
    }
  }

  // ═══════════════════════════════════════
  // SETTLEMENT GLIMPSES (First Entry)
  // ═══════════════════════════════════════

  async showSettlementGlimpses() {
    const glimpses = [
      {
        npc: 'mara',
        text: "On the watchtower: a woman. Her posture says 'control.' Her grip on the railing says something else."
      },
      {
        npc: 'jonas',
        text: 'By a shuttered building: a man with healer\'s hands. They\'re still. Too still.'
      },
      {
        npc: 'kale',
        text: 'Near the market stalls: a young man. He mirrors your posture before catching himself.'
      },
      {
        npc: 'edda',
        text: "At the settlement's edge: an old woman. She's looking at you like she expected you."
      }
    ];

    for (const glimpse of glimpses) {
      await this.showGlimpse(glimpse);
    }

    // First tremor
    await this.delay(2000);
    await this.triggerFirstTremor();

    this.game.gsm.setFlag('settlement_glimpses_shown');
  }

  async showGlimpse(glimpse) {
    const { width, height } = this.cameras.main;

    const text = this.add.text(width / 2, height / 2, glimpse.text, {
      fontFamily: 'Lora, serif',
      fontSize: '18px',
      color: '#a89a85',
      fontStyle: 'italic',
      wordWrap: { width: 600 },
      align: 'center'
    });
    text.setOrigin(0.5);
    text.setAlpha(0);
    text.setDepth(1500);

    await this.fadeElement(text, 1, 600);
    await this.delay(3000);
    await this.fadeElement(text, 0, 400);

    text.destroy();
  }

  async triggerFirstTremor() {
    // Environmental text
    const { width, height } = this.cameras.main;

    const text = this.add.text(
      width / 2,
      height / 2,
      "A subtle tremor. The well's stones shift softly.",
      {
        fontFamily: 'Lora, serif',
        fontSize: '18px',
        color: '#a89a85',
        fontStyle: 'italic'
      }
    );
    text.setOrigin(0.5);
    text.setAlpha(0);
    text.setDepth(1500);

    await this.fadeElement(text, 1, 400);

    // Tremor effect
    this.game.gsm.triggerTremor('light');
    await this.transitions.tremor('light');

    await this.delay(1500);

    // GHOST whisper
    await this.ui.voicePanel.showSingleVoice(
      'GHOST',
      'It remembers you. Or mistakes you. Both are dangerous.'
    );

    await this.fadeElement(text, 0, 400);
    text.destroy();
  }

  // ═══════════════════════════════════════
  // EVENT HANDLERS
  // ═══════════════════════════════════════

  onLocationChange(data) {
    const location = data.to;
    const locationData = this.settlement.getLocationData(location);
    const npcsHere = this.settlement.getNpcsAtLocation(location);

    // Update location panel
    this.ui.updateLocation(location, locationData, npcsHere);

    // Update hum visual based on proximity to shaft
    this.updateHumVisual();

    // Special location effects
    if (location === 'sealed_shaft') {
      this.onNearShaft();
    }
  }

  onNearShaft() {
    // Intensify atmosphere
    this.transitions.ghostEffect(1500);

    // GHOST speaks
    this.ui.voicePanel.showSingleVoice('GHOST', 'Here. It\'s here. Beneath. Reaching.');
  }

  onTremor(data) {
    this.transitions.tremor(data.intensity);
    this.updateHumVisual();
  }

  onCurieManifestation() {
    this.transitions.ghostEffect(2000);

    // Random manifestation text
    const manifestations = [
      'The air thickens. Something presses against the edges of perception.',
      'For a moment, the hum sounds almost like words.',
      'The ground sighs. Or you imagine it does.'
    ];

    const text = manifestations[Math.floor(Math.random() * manifestations.length)];
    // Could show as environmental text
  }

  onActTransition(data) {
    // Show act transition
    const actNames = {
      2: 'ACT II: The Settlement Frays',
      3: 'ACT III: The Unburying'
    };

    if (actNames[data.to]) {
      this.transitions.locationTransition(
        actNames[data.to],
        'Something has changed. Everything has changed.'
      );
    }
  }

  onConversationEnd() {
    // Re-enable player movement
    this.player.enable();

    // Update UI
    this.updateUI();
  }

  onDialogueAdvance() {
    // Handle in dialogue controller
  }

  // ═══════════════════════════════════════
  // QUEST & NARRATIVE EVENT HANDLERS
  // ═══════════════════════════════════════

  onQuestStart(data) {
    // Show quest notification
    this.questNotification.showQuestStarted(data);
  }

  onQuestComplete(data) {
    // Show completion notification
    this.questNotification.showQuestCompleted(data, data.outcome);
  }

  onNpcSeeksPlayer(data) {
    // Show indicator that an NPC wants to talk
    const npcName = data.npc.charAt(0).toUpperCase() + data.npc.slice(1);
    this.showNarrativeText(`${npcName} is looking for you.`);
  }

  onNarrativeEvent(data) {
    // Show narrative text
    this.showNarrativeText(data.text);
  }

  onNpcLocationsUpdated() {
    // Update the settlement view with new NPC positions
    if (this.settlement) {
      this.settlement.updateNpcPositions();
    }
    // Update current location panel
    const location = this.game.gsm.get('player.location');
    this.onLocationChange({ to: location });
  }

  async onCurieSpeaks(data) {
    // Determine duration based on text length and state
    const baseDuration = 4000;
    const lengthBonus = (data.text?.length || 0) * 20;
    const stateBonus = data.state === 'emergent' ? 2000 : 0;
    const duration = Math.min(baseDuration + lengthBonus + stateBonus, 8000);

    // Try to show subliminal portrait glimpse (40% chance)
    this.curieGlimpse.tryGlimpse(data.state);

    await this.curieWhisper.show(data.text, data.state, duration);
  }

  /**
   * Show narrative text in center of screen
   */
  async showNarrativeText(text) {
    const { width, height } = this.cameras.main;

    const narrativeText = this.add.text(width / 2, height / 2 - 50, text, {
      fontFamily: 'Lora, serif',
      fontSize: '18px',
      color: '#a89a85',
      fontStyle: 'italic',
      wordWrap: { width: 600 },
      align: 'center'
    });
    narrativeText.setOrigin(0.5);
    narrativeText.setAlpha(0);
    narrativeText.setDepth(1500);

    await this.fadeElement(narrativeText, 1, 500);
    await this.delay(3000);
    await this.fadeElement(narrativeText, 0, 400);

    narrativeText.destroy();
  }

  // ═══════════════════════════════════════
  // NPC INTERACTION
  // ═══════════════════════════════════════

  async interactWithNpc(npcId) {
    // Disable player movement
    this.player.disable();

    // Start conversation
    await this.dialogue.startConversation(npcId);
  }

  // ═══════════════════════════════════════
  // UPDATE LOOP
  // ═══════════════════════════════════════

  update(time, delta) {
    // Update player
    if (this.player) {
      this.player.update(time, delta);
    }

    // Update HUD periodically
    if (time % 1000 < delta) {
      this.updateUI();
    }

    // Check for random events
    this.checkRandomEvents(time);
  }

  updateUI() {
    this.ui.updateHUD(this.game.getUIState());
  }

  checkRandomEvents(time) {
    // Random tremor chance (increases with Curie activity)
    const curieActivity = this.game.gsm.get('curie.activity');
    const lastTremor = this.game.gsm.get('environment.lastTremor') || 0;
    const timeSinceTremor = time - lastTremor;

    if (timeSinceTremor > 60000 && Math.random() < curieActivity * 0.001) {
      this.game.gsm.triggerTremor('light');
    }
  }

  // ═══════════════════════════════════════
  // SAVE/LOAD SHORTCUTS
  // ═══════════════════════════════════════

  setupSaveLoadShortcuts() {
    // F5 - Quick Save
    this.input.keyboard.on('keydown-F5', () => {
      const result = this.game.quickSave();
      if (result.success) {
        this.showNotification('Quick Saved');
      } else {
        this.showNotification('Save Failed', true);
      }
    });

    // F9 - Quick Load
    this.input.keyboard.on('keydown-F9', () => {
      const result = this.game.quickLoad();
      if (result.success) {
        this.scene.restart();
      } else {
        this.showNotification('No Quick Save Found', true);
      }
    });

    // ESC - Open Save/Load Menu (when not in dialogue)
    this.input.keyboard.on('keydown-ESC', () => {
      if (!this.saveLoadMenu.isVisible && !this.game.gsm.get('ui.dialogueOpen')) {
        this.saveLoadMenu.show('save');
      }
    });

    // Handle load event (restarts scene with new state)
    this.events.on('game:loaded', () => {
      this.scene.restart();
    });

    // Start auto-save
    this.game.startAutoSave();
  }

  /**
   * Show a notification message
   */
  showNotification(text, isError = false) {
    const { width } = this.cameras.main;

    const notification = this.add.text(width / 2, 50, text, {
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: '14px',
      color: isError ? '#ff6666' : '#88ff88',
      backgroundColor: '#1a1714',
      padding: { x: 16, y: 8 }
    });
    notification.setOrigin(0.5);
    notification.setDepth(3000);
    notification.setAlpha(0);

    this.tweens.add({
      targets: notification,
      alpha: 1,
      duration: 200
    });

    this.tweens.add({
      targets: notification,
      alpha: 0,
      y: 30,
      duration: 500,
      delay: 1500,
      onComplete: () => notification.destroy()
    });
  }

  // ═══════════════════════════════════════
  // UTILITY
  // ═══════════════════════════════════════

  fadeElement(element, targetAlpha, duration) {
    return new Promise((resolve) => {
      this.tweens.add({
        targets: element,
        alpha: targetAlpha,
        duration: duration,
        onComplete: resolve
      });
    });
  }

  delay(ms) {
    return new Promise((resolve) => {
      this.time.delayedCall(ms, resolve);
    });
  }
}
