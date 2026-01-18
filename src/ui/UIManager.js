// src/ui/UIManager.js

import { DialogueBox } from './DialogueBox.js';
import { VoicePanel } from './VoicePanel.js';
import { ChoicePanel } from './ChoicePanel.js';
import { HUD } from './HUD.js';
import { LocationPanel } from './LocationPanel.js';

/**
 * UI MANAGER
 *
 * Coordinates all UI components.
 * Handles layering, focus, and transitions.
 */

export class UIManager {
  constructor(scene) {
    this.scene = scene;

    // UI state
    this.state = {
      dialogueOpen: false,
      choicesVisible: false,
      voicesActive: false,
      menuOpen: false,
      currentNpc: null
    };

    // Create UI container (renders above game scene)
    this.container = scene.add.container(0, 0);
    this.container.setDepth(1000);

    // Create components
    this.createComponents();

    // Input handling
    this.setupInput();
  }

  createComponents() {
    const { width, height } = this.scene.cameras.main;

    // Dialogue box (bottom center)
    this.dialogueBox = new DialogueBox(this.scene, {
      x: width / 2,
      y: height - 140,
      width: 700,
      height: 180
    });
    this.container.add(this.dialogueBox.container);

    // Voice panel (well above dialogue box to avoid overlap)
    this.voicePanel = new VoicePanel(this.scene, {
      x: width / 2,
      y: height - 320
    });
    this.container.add(this.voicePanel.container);

    // Choice panel (below dialogue box, near bottom of screen)
    this.choicePanel = new ChoicePanel(this.scene, {
      x: width / 2,
      y: height - 30
    });
    this.container.add(this.choicePanel.container);

    // HUD (top of screen)
    this.hud = new HUD(this.scene, {
      x: 0,
      y: 0,
      width: width
    });
    this.container.add(this.hud.container);

    // Location panel (bottom left when not in dialogue)
    this.locationPanel = new LocationPanel(this.scene, {
      x: 20,
      y: height - 100
    });
    this.container.add(this.locationPanel.container);

    // Initially hide dialogue elements
    this.dialogueBox.hide();
    this.voicePanel.hide();
    this.choicePanel.hide();
  }

  setupInput() {
    // Keyboard input for choices
    this.scene.input.keyboard.on('keydown-UP', () => {
      if (this.state.choicesVisible) {
        this.choicePanel.selectPrevious();
      }
    });

    this.scene.input.keyboard.on('keydown-DOWN', () => {
      if (this.state.choicesVisible) {
        this.choicePanel.selectNext();
      }
    });

    this.scene.input.keyboard.on('keydown-ENTER', () => {
      if (this.state.choicesVisible) {
        this.choicePanel.confirmSelection();
      } else if (this.state.dialogueOpen && !this.dialogueBox.isTyping) {
        // Advance dialogue or show choices
        this.onDialogueAdvance();
      }
    });

    this.scene.input.keyboard.on('keydown-SPACE', () => {
      if (this.state.dialogueOpen && this.dialogueBox.isTyping) {
        // Skip typing animation
        this.dialogueBox.completeTyping();
      } else if (this.state.dialogueOpen && !this.state.choicesVisible) {
        this.onDialogueAdvance();
      }
    });

    // ESC to close menu or skip
    this.scene.input.keyboard.on('keydown-ESC', () => {
      if (this.state.menuOpen) {
        this.closeMenu();
      }
    });
  }

  // ═══════════════════════════════════════
  // DIALOGUE FLOW
  // ═══════════════════════════════════════

  /**
   * Start a dialogue with an NPC
   */
  async startDialogue(npcId, npcData) {
    this.state.dialogueOpen = true;
    this.state.currentNpc = npcId;

    // Hide location panel
    this.locationPanel.hide();

    // Show dialogue box with NPC info
    await this.dialogueBox.show({
      speaker: npcData.name,
      portrait: npcData.portrait || `${npcId}_neutral`
    });

    return this;
  }

  /**
   * Display NPC dialogue line
   */
  async showDialogue(text, emotion = 'neutral') {
    // Update portrait if emotion changed
    if (emotion !== 'neutral') {
      this.dialogueBox.setPortrait(`${this.state.currentNpc}_${emotion}`);
    }

    // Type out the text
    await this.dialogueBox.typeText(text);

    return this;
  }

  /**
   * Show internal voice reactions
   */
  async showVoices(voices) {
    this.state.voicesActive = true;
    await this.voicePanel.showVoices(voices);
    this.state.voicesActive = false;

    return this;
  }

  /**
   * Show player choices
   */
  async showChoices(choices) {
    this.state.choicesVisible = true;

    return new Promise((resolve) => {
      this.choicePanel.show(choices, (selectedChoice) => {
        this.state.choicesVisible = false;
        this.choicePanel.hide();
        resolve(selectedChoice);
      });
    });
  }

  /**
   * End dialogue
   */
  async endDialogue() {
    this.state.dialogueOpen = false;
    this.state.currentNpc = null;

    await this.dialogueBox.hide();
    this.voicePanel.hide();
    this.choicePanel.hide();

    // Show location panel again
    this.locationPanel.show();

    return this;
  }

  onDialogueAdvance() {
    // Emit event for game to handle
    this.scene.events.emit('dialogue:advance');
  }

  /**
   * Close menu
   */
  closeMenu() {
    this.state.menuOpen = false;
    this.scene.events.emit('menu:close');
  }

  // ═══════════════════════════════════════
  // HUD UPDATES
  // ═══════════════════════════════════════

  updateHUD(state) {
    this.hud.update({
      day: state.time.day,
      timeOfDay: state.time.timeOfDay,
      tension: state.narrative.tension,
      humIntensity: state.environment.humIntensity
    });
  }

  updateLocation(locationId, locationData, npcsHere) {
    this.locationPanel.update(locationId, locationData, npcsHere);
  }

  // ═══════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════

  /**
   * Screen shake for tremors
   */
  shake(intensity = 0.005, duration = 500) {
    this.scene.cameras.main.shake(duration, intensity);

    // Also shake UI slightly
    this.scene.tweens.add({
      targets: this.container,
      x: { from: -3, to: 3 },
      duration: 50,
      yoyo: true,
      repeat: duration / 100
    });
  }

  /**
   * Flash effect for dramatic moments
   */
  flash(color = 0xffffff, duration = 200) {
    this.scene.cameras.main.flash(
      duration,
      (color >> 16) & 0xff,
      (color >> 8) & 0xff,
      color & 0xff
    );
  }

  /**
   * Vignette pulse for hum intensity
   */
  pulseVignette(intensity = 0.3) {
    // Handled by separate effect system
    this.scene.events.emit('ui:vignette_pulse', { intensity });
  }
}
