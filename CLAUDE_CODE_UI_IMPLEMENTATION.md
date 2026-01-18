# ASHFALL: UI Implementation
## The Face of the Game

### Overview

This document implements the complete UI system for Ashfall using Phaser 3. Every interface element the player interacts with: dialogue, choices, internal voices, HUD, navigation.

**Design Philosophy:** Minimal, atmospheric, unobtrusive. The UI should feel like part of the world, not a layer on top of it.

---

## 1. UI Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           GAME SCREEN                               │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │                      SCENE LAYER                              │  │
│  │                   (map, sprites, fx)                          │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  HUD LAYER (top)                              [Day 3 - Dusk]  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │                    VOICE PANEL (when active)                  │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │                    DIALOGUE BOX (when active)                 │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Color & Style Constants

```javascript
// src/ui/UIConstants.js

export const UI_COLORS = {
  // Backgrounds
  bgDarkest: 0x1a1714,
  bgDark: 0x2d2a26,
  bgMedium: 0x3d3832,
  
  // Text
  textPrimary: '#e8dcc8',
  textSecondary: '#a89a85',
  textMuted: '#6b6358',
  
  // Accents
  accentRust: 0x8b4513,
  accentBlood: 0x6b3030,
  accentAsh: 0x9b9085,
  
  // Voice colors
  voiceLogic: '#88ccff',
  voiceInstinct: '#ff8844',
  voiceEmpathy: '#88ff88',
  voiceGhost: '#cc88ff',
  
  // States
  selected: '#e8dcc8',
  unselected: '#6b6358',
  hover: '#a89a85'
};

export const UI_FONTS = {
  dialogue: {
    fontFamily: 'Lora, Georgia, serif',
    fontSize: '18px',
    color: UI_COLORS.textPrimary
  },
  speaker: {
    fontFamily: 'Oswald, Impact, sans-serif',
    fontSize: '14px',
    color: UI_COLORS.textSecondary,
    letterSpacing: 2
  },
  voice: {
    fontFamily: '"IBM Plex Mono", "Courier New", monospace',
    fontSize: '14px',
    fontStyle: 'italic'
  },
  choice: {
    fontFamily: 'Lora, Georgia, serif',
    fontSize: '16px'
  },
  hud: {
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: '12px',
    color: UI_COLORS.textMuted
  }
};

export const UI_DIMENSIONS = {
  dialogueBox: {
    width: 700,
    height: 200,
    padding: 20,
    portraitSize: 150
  },
  voicePanel: {
    width: 600,
    lineHeight: 28
  },
  choicePanel: {
    width: 500,
    optionHeight: 36
  }
};

export const UI_TIMING = {
  textSpeed: 30,          // ms per character
  fadeIn: 300,
  fadeOut: 200,
  voiceDelay: 500,        // delay between voice lines
  voiceDuration: 3000,    // how long each voice shows
  choiceDelay: 200        // delay before choices appear
};
```

---

## 3. UI Manager

```javascript
// src/ui/UIManager.js

import Phaser from 'phaser';
import { DialogueBox } from './DialogueBox.js';
import { VoicePanel } from './VoicePanel.js';
import { ChoicePanel } from './ChoicePanel.js';
import { HUD } from './HUD.js';
import { LocationPanel } from './LocationPanel.js';
import { UI_COLORS } from './UIConstants.js';

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
      y: height - 120,
      width: 700,
      height: 200
    });
    this.container.add(this.dialogueBox.container);

    // Voice panel (above dialogue box)
    this.voicePanel = new VoicePanel(this.scene, {
      x: width / 2,
      y: height - 280
    });
    this.container.add(this.voicePanel.container);

    // Choice panel (inside dialogue box area)
    this.choicePanel = new ChoicePanel(this.scene, {
      x: width / 2,
      y: height - 80
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
    this.scene.cameras.main.flash(duration, 
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
```

---

## 4. Dialogue Box

```javascript
// src/ui/DialogueBox.js

import Phaser from 'phaser';
import { UI_COLORS, UI_FONTS, UI_DIMENSIONS, UI_TIMING } from './UIConstants.js';

/**
 * DIALOGUE BOX
 * 
 * The main conversation interface.
 * Shows NPC portrait, name, and typewriter text.
 */

export class DialogueBox {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.isTyping = false;
    this.currentText = '';
    this.displayedText = '';
    this.typeTimer = null;

    this.create();
  }

  create() {
    const { x, y, width, height } = this.config;
    const dim = UI_DIMENSIONS.dialogueBox;

    // Main container
    this.container = this.scene.add.container(x, y);
    this.container.setAlpha(0);

    // Background
    this.background = this.scene.add.graphics();
    this.background.fillStyle(UI_COLORS.bgDark, 0.95);
    this.background.fillRoundedRect(-width/2, -height/2, width, height, 8);
    this.background.lineStyle(1, UI_COLORS.accentRust, 0.8);
    this.background.strokeRoundedRect(-width/2, -height/2, width, height, 8);
    this.container.add(this.background);

    // Portrait frame
    const portraitX = -width/2 + dim.padding + dim.portraitSize/2;
    const portraitY = -height/2 + dim.padding + dim.portraitSize/2;
    
    this.portraitFrame = this.scene.add.graphics();
    this.portraitFrame.lineStyle(2, UI_COLORS.bgDarkest, 1);
    this.portraitFrame.strokeRect(
      portraitX - dim.portraitSize/2 - 2,
      portraitY - dim.portraitSize/2 - 2,
      dim.portraitSize + 4,
      dim.portraitSize + 4
    );
    this.container.add(this.portraitFrame);

    // Portrait image (placeholder - will be replaced by actual portraits)
    this.portrait = this.scene.add.rectangle(
      portraitX, portraitY,
      dim.portraitSize, dim.portraitSize,
      UI_COLORS.bgMedium
    );
    this.container.add(this.portrait);

    // Speaker name
    const textX = -width/2 + dim.padding * 2 + dim.portraitSize;
    
    this.speakerName = this.scene.add.text(
      textX,
      -height/2 + dim.padding,
      '',
      {
        ...UI_FONTS.speaker,
        color: UI_COLORS.textSecondary
      }
    );
    this.container.add(this.speakerName);

    // Dialogue text
    this.dialogueText = this.scene.add.text(
      textX,
      -height/2 + dim.padding + 28,
      '',
      {
        ...UI_FONTS.dialogue,
        wordWrap: { width: width - dim.portraitSize - dim.padding * 4 }
      }
    );
    this.container.add(this.dialogueText);

    // Continue indicator
    this.continueIndicator = this.scene.add.text(
      width/2 - dim.padding - 20,
      height/2 - dim.padding - 10,
      '▼',
      {
        fontSize: '14px',
        color: UI_COLORS.textMuted
      }
    );
    this.continueIndicator.setAlpha(0);
    this.container.add(this.continueIndicator);

    // Pulse animation for continue indicator
    this.scene.tweens.add({
      targets: this.continueIndicator,
      alpha: { from: 0.3, to: 0.8 },
      duration: 800,
      yoyo: true,
      repeat: -1
    });
  }

  /**
   * Show the dialogue box
   */
  async show(options = {}) {
    if (options.speaker) {
      this.speakerName.setText(options.speaker.toUpperCase());
    }

    if (options.portrait) {
      this.setPortrait(options.portrait);
    }

    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.container,
        alpha: 1,
        y: this.config.y,
        duration: UI_TIMING.fadeIn,
        ease: 'Power2',
        onComplete: resolve
      });
    });
  }

  /**
   * Hide the dialogue box
   */
  async hide() {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.container,
        alpha: 0,
        duration: UI_TIMING.fadeOut,
        ease: 'Power2',
        onComplete: () => {
          this.dialogueText.setText('');
          this.continueIndicator.setAlpha(0);
          resolve();
        }
      });
    });
  }

  /**
   * Set the portrait image
   */
  setPortrait(portraitKey) {
    // If actual portrait textures are loaded
    if (this.scene.textures.exists(portraitKey)) {
      // Remove placeholder rectangle if exists
      if (this.portrait.type === 'Rectangle') {
        this.portrait.destroy();
        
        const dim = UI_DIMENSIONS.dialogueBox;
        const portraitX = -this.config.width/2 + dim.padding + dim.portraitSize/2;
        const portraitY = -this.config.height/2 + dim.padding + dim.portraitSize/2;
        
        this.portrait = this.scene.add.image(portraitX, portraitY, portraitKey);
        this.portrait.setDisplaySize(dim.portraitSize, dim.portraitSize);
        this.container.add(this.portrait);
      } else {
        this.portrait.setTexture(portraitKey);
      }
    }
    // Otherwise keep placeholder
  }

  /**
   * Type out text with typewriter effect
   */
  async typeText(text) {
    this.currentText = text;
    this.displayedText = '';
    this.isTyping = true;
    this.continueIndicator.setAlpha(0);

    return new Promise((resolve) => {
      let charIndex = 0;

      this.typeTimer = this.scene.time.addEvent({
        delay: UI_TIMING.textSpeed,
        callback: () => {
          // Handle action text (in asterisks) - display faster
          const char = text[charIndex];
          const isAction = text[charIndex - 1] === '*' || 
                          (this.displayedText.match(/\*/g)?.length || 0) % 2 === 1;

          this.displayedText += char;
          this.dialogueText.setText(this.displayedText);

          charIndex++;

          // Speed up for action text
          if (isAction) {
            this.typeTimer.delay = UI_TIMING.textSpeed / 2;
          } else {
            this.typeTimer.delay = UI_TIMING.textSpeed;
          }

          // Pause slightly on punctuation
          if (['.', '!', '?', '—'].includes(char)) {
            this.typeTimer.delay = UI_TIMING.textSpeed * 4;
          } else if ([',', ';', ':'].includes(char)) {
            this.typeTimer.delay = UI_TIMING.textSpeed * 2;
          }

          if (charIndex >= text.length) {
            this.typeTimer.destroy();
            this.isTyping = false;
            this.showContinueIndicator();
            resolve();
          }
        },
        loop: true
      });
    });
  }

  /**
   * Skip typing animation
   */
  completeTyping() {
    if (this.typeTimer) {
      this.typeTimer.destroy();
    }
    this.displayedText = this.currentText;
    this.dialogueText.setText(this.displayedText);
    this.isTyping = false;
    this.showContinueIndicator();
  }

  showContinueIndicator() {
    this.scene.tweens.add({
      targets: this.continueIndicator,
      alpha: 0.8,
      duration: 200
    });
  }

  hideContinueIndicator() {
    this.continueIndicator.setAlpha(0);
  }
}
```

---

## 5. Voice Panel

```javascript
// src/ui/VoicePanel.js

import Phaser from 'phaser';
import { UI_COLORS, UI_FONTS, UI_TIMING } from './UIConstants.js';

/**
 * VOICE PANEL
 * 
 * Displays internal voice reactions.
 * LOGIC, INSTINCT, EMPATHY, GHOST.
 */

export class VoicePanel {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.voiceTexts = [];

    this.create();
  }

  create() {
    const { x, y } = this.config;

    this.container = this.scene.add.container(x, y);
    this.container.setAlpha(0);

    // Semi-transparent background
    this.background = this.scene.add.graphics();
    this.container.add(this.background);
  }

  /**
   * Show voice reactions with staggered timing
   */
  async showVoices(voices) {
    // voices = { LOGIC: "text", INSTINCT: "text", ... }
    
    this.clear();
    this.container.setAlpha(1);

    const voiceOrder = ['LOGIC', 'INSTINCT', 'EMPATHY', 'GHOST'];
    const voiceColors = {
      LOGIC: UI_COLORS.voiceLogic,
      INSTINCT: UI_COLORS.voiceInstinct,
      EMPATHY: UI_COLORS.voiceEmpathy,
      GHOST: UI_COLORS.voiceGhost
    };

    let yOffset = 0;
    const lineHeight = 32;
    const promises = [];

    for (const voice of voiceOrder) {
      if (!voices[voice]) continue;

      const promise = new Promise((resolve) => {
        this.scene.time.delayedCall(yOffset * 150, () => {
          const text = this.createVoiceLine(voice, voices[voice], voiceColors[voice], yOffset * lineHeight);
          this.voiceTexts.push(text);

          // Fade in
          this.scene.tweens.add({
            targets: text,
            alpha: 1,
            duration: 200
          });

          // Auto-fade out after duration
          this.scene.time.delayedCall(UI_TIMING.voiceDuration, () => {
            this.scene.tweens.add({
              targets: text,
              alpha: 0,
              duration: 300,
              onComplete: resolve
            });
          });
        });
      });

      promises.push(promise);
      yOffset++;
    }

    // Update background size
    this.updateBackground(yOffset * lineHeight);

    // Wait for all voices to fade out
    await Promise.all(promises);
    this.container.setAlpha(0);
  }

  createVoiceLine(voice, text, color, yPos) {
    const formattedText = `[${voice}] ${text}`;
    
    const textObj = this.scene.add.text(
      -280, // Centered around container x
      yPos - 50,
      formattedText,
      {
        ...UI_FONTS.voice,
        color: color,
        wordWrap: { width: 560 }
      }
    );
    textObj.setAlpha(0);
    this.container.add(textObj);

    return textObj;
  }

  updateBackground(height) {
    this.background.clear();
    this.background.fillStyle(UI_COLORS.bgDarkest, 0.7);
    this.background.fillRoundedRect(-300, -60, 600, height + 20, 4);
  }

  /**
   * Show a single voice reaction (for real-time triggers)
   */
  async showSingleVoice(voice, text) {
    const voiceColors = {
      LOGIC: UI_COLORS.voiceLogic,
      INSTINCT: UI_COLORS.voiceInstinct,
      EMPATHY: UI_COLORS.voiceEmpathy,
      GHOST: UI_COLORS.voiceGhost
    };

    this.clear();
    this.container.setAlpha(1);
    this.updateBackground(32);

    const textObj = this.createVoiceLine(voice, text, voiceColors[voice], 0);
    this.voiceTexts.push(textObj);

    // Fade in
    await new Promise((resolve) => {
      this.scene.tweens.add({
        targets: textObj,
        alpha: 1,
        duration: 200,
        onComplete: resolve
      });
    });

    // Hold
    await new Promise((resolve) => {
      this.scene.time.delayedCall(UI_TIMING.voiceDuration, resolve);
    });

    // Fade out
    await new Promise((resolve) => {
      this.scene.tweens.add({
        targets: textObj,
        alpha: 0,
        duration: 300,
        onComplete: resolve
      });
    });

    this.container.setAlpha(0);
  }

  clear() {
    for (const text of this.voiceTexts) {
      text.destroy();
    }
    this.voiceTexts = [];
  }

  hide() {
    this.container.setAlpha(0);
    this.clear();
  }
}
```

---

## 6. Choice Panel

```javascript
// src/ui/ChoicePanel.js

import Phaser from 'phaser';
import { UI_COLORS, UI_FONTS, UI_DIMENSIONS, UI_TIMING } from './UIConstants.js';

/**
 * CHOICE PANEL
 * 
 * Player dialogue choices.
 * Supports voice-tagged options and keyboard navigation.
 */

export class ChoicePanel {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    
    this.choices = [];
    this.choiceTexts = [];
    this.selectedIndex = 0;
    this.onSelect = null;

    this.create();
  }

  create() {
    const { x, y } = this.config;

    this.container = this.scene.add.container(x, y);
    this.container.setAlpha(0);

    // Background
    this.background = this.scene.add.graphics();
    this.container.add(this.background);

    // Selection indicator
    this.selector = this.scene.add.text(0, 0, '>', {
      fontSize: '16px',
      color: UI_COLORS.textPrimary
    });
    this.selector.setAlpha(0);
    this.container.add(this.selector);
  }

  /**
   * Show choices
   */
  show(choices, onSelect) {
    this.choices = choices;
    this.onSelect = onSelect;
    this.selectedIndex = 0;

    this.clear();

    const dim = UI_DIMENSIONS.choicePanel;
    const startY = -((choices.length - 1) * dim.optionHeight) / 2;

    // Create choice texts
    choices.forEach((choice, index) => {
      const y = startY + index * dim.optionHeight;
      
      // Voice tag if present
      let displayText = choice.text;
      if (choice.voiceTag) {
        const tagColors = {
          LOGIC: '[L]',
          INSTINCT: '[I]',
          EMPATHY: '[E]',
          GHOST: '[G]'
        };
        displayText = `${tagColors[choice.voiceTag]} ${choice.text}`;
      }

      const text = this.scene.add.text(
        -dim.width/2 + 30,
        y,
        displayText,
        {
          ...UI_FONTS.choice,
          color: index === 0 ? UI_COLORS.selected : UI_COLORS.unselected
        }
      );

      // Make interactive
      text.setInteractive({ useHandCursor: true });
      text.on('pointerover', () => this.selectIndex(index));
      text.on('pointerdown', () => {
        this.selectIndex(index);
        this.confirmSelection();
      });

      this.choiceTexts.push(text);
      this.container.add(text);
    });

    // Update background
    this.background.clear();
    this.background.fillStyle(UI_COLORS.bgDark, 0.9);
    this.background.fillRoundedRect(
      -dim.width/2,
      startY - 15,
      dim.width,
      choices.length * dim.optionHeight + 20,
      4
    );

    // Position selector
    this.updateSelector();

    // Fade in
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: UI_TIMING.fadeIn
    });
  }

  /**
   * Select a choice by index
   */
  selectIndex(index) {
    if (index < 0 || index >= this.choices.length) return;

    // Update previous selection
    if (this.choiceTexts[this.selectedIndex]) {
      this.choiceTexts[this.selectedIndex].setColor(UI_COLORS.unselected);
    }

    this.selectedIndex = index;

    // Update new selection
    if (this.choiceTexts[this.selectedIndex]) {
      this.choiceTexts[this.selectedIndex].setColor(UI_COLORS.selected);
    }

    this.updateSelector();
  }

  selectPrevious() {
    this.selectIndex(Math.max(0, this.selectedIndex - 1));
  }

  selectNext() {
    this.selectIndex(Math.min(this.choices.length - 1, this.selectedIndex + 1));
  }

  updateSelector() {
    if (this.choiceTexts[this.selectedIndex]) {
      const target = this.choiceTexts[this.selectedIndex];
      
      this.scene.tweens.add({
        targets: this.selector,
        x: target.x - 20,
        y: target.y,
        alpha: 1,
        duration: 100
      });
    }
  }

  /**
   * Confirm current selection
   */
  confirmSelection() {
    const choice = this.choices[this.selectedIndex];
    
    if (this.onSelect) {
      // Brief highlight effect
      this.scene.tweens.add({
        targets: this.choiceTexts[this.selectedIndex],
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          this.onSelect(choice);
        }
      });
    }
  }

  clear() {
    for (const text of this.choiceTexts) {
      text.destroy();
    }
    this.choiceTexts = [];
    this.selector.setAlpha(0);
  }

  hide() {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: UI_TIMING.fadeOut,
      onComplete: () => this.clear()
    });
  }
}
```

---

## 7. HUD

```javascript
// src/ui/HUD.js

import Phaser from 'phaser';
import { UI_COLORS, UI_FONTS } from './UIConstants.js';

/**
 * HUD
 * 
 * Minimal top-bar showing time, day, and ambient info.
 */

export class HUD {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;

    this.create();
  }

  create() {
    const { x, y, width } = this.config;

    this.container = this.scene.add.container(x, y);

    // Background bar
    this.background = this.scene.add.graphics();
    this.background.fillStyle(UI_COLORS.bgDarkest, 0.6);
    this.background.fillRect(0, 0, width, 30);
    this.container.add(this.background);

    // Game title (left)
    this.title = this.scene.add.text(15, 7, 'ASHFALL', {
      ...UI_FONTS.hud,
      fontSize: '14px',
      color: UI_COLORS.textMuted,
      letterSpacing: 3
    });
    this.container.add(this.title);

    // Time display (right)
    this.timeText = this.scene.add.text(width - 15, 7, '', {
      ...UI_FONTS.hud,
      color: UI_COLORS.textMuted
    });
    this.timeText.setOrigin(1, 0);
    this.container.add(this.timeText);

    // Hum indicator (center-right, subtle)
    this.humIndicator = this.scene.add.text(width - 200, 7, '', {
      ...UI_FONTS.hud,
      fontSize: '11px',
      color: UI_COLORS.textMuted,
      fontStyle: 'italic'
    });
    this.humIndicator.setOrigin(1, 0);
    this.container.add(this.humIndicator);

    // Tension bar (hidden by default, shows in Act 2+)
    this.tensionBar = this.scene.add.graphics();
    this.tensionBar.setAlpha(0);
    this.container.add(this.tensionBar);
  }

  update(state) {
    // Update time
    const timeStr = `Day ${state.day} — ${this.formatTimeOfDay(state.timeOfDay)}`;
    this.timeText.setText(timeStr);

    // Update hum indicator
    const humDesc = this.getHumDescription(state.humIntensity);
    this.humIndicator.setText(humDesc);
    this.humIndicator.setAlpha(state.humIntensity > 0.3 ? 0.8 : 0.4);

    // Update tension bar (only visible in later game)
    if (state.tension > 40) {
      this.updateTensionBar(state.tension);
      this.tensionBar.setAlpha(0.6);
    }
  }

  formatTimeOfDay(tod) {
    const formatted = {
      morning: 'Morning',
      afternoon: 'Afternoon',
      dusk: 'Dusk',
      night: 'Night'
    };
    return formatted[tod] || tod;
  }

  getHumDescription(intensity) {
    if (intensity < 0.2) return '';
    if (intensity < 0.4) return 'The hum is faint.';
    if (intensity < 0.6) return 'The hum persists.';
    if (intensity < 0.8) return 'The hum grows louder.';
    return 'The hum is deafening.';
  }

  updateTensionBar(tension) {
    this.tensionBar.clear();
    
    const barWidth = 100;
    const barHeight = 4;
    const x = this.config.width / 2 - barWidth / 2;
    const y = 20;

    // Background
    this.tensionBar.fillStyle(UI_COLORS.bgMedium, 0.5);
    this.tensionBar.fillRect(x, y, barWidth, barHeight);

    // Fill
    const fillColor = tension > 70 ? UI_COLORS.accentBlood : UI_COLORS.accentRust;
    this.tensionBar.fillStyle(fillColor, 0.8);
    this.tensionBar.fillRect(x, y, barWidth * (tension / 100), barHeight);
  }
}
```

---

## 8. Location Panel

```javascript
// src/ui/LocationPanel.js

import Phaser from 'phaser';
import { UI_COLORS, UI_FONTS, UI_TIMING } from './UIConstants.js';

/**
 * LOCATION PANEL
 * 
 * Shows current location and available destinations.
 * Visible when not in dialogue.
 */

export class LocationPanel {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.destinations = [];
    this.npcsHere = [];

    this.create();
  }

  create() {
    const { x, y } = this.config;

    this.container = this.scene.add.container(x, y);

    // Location name
    this.locationName = this.scene.add.text(0, 0, '', {
      fontFamily: UI_FONTS.speaker.fontFamily,
      fontSize: '16px',
      color: UI_COLORS.textPrimary,
      letterSpacing: 1
    });
    this.container.add(this.locationName);

    // NPCs present
    this.npcsText = this.scene.add.text(0, 24, '', {
      ...UI_FONTS.hud,
      color: UI_COLORS.textSecondary
    });
    this.container.add(this.npcsText);

    // Destination hints
    this.destinationsText = this.scene.add.text(0, 48, '', {
      ...UI_FONTS.hud,
      fontSize: '11px',
      color: UI_COLORS.textMuted
    });
    this.container.add(this.destinationsText);
  }

  update(locationId, locationData, npcsHere = []) {
    // Update location name
    this.locationName.setText(locationData.name || locationId.toUpperCase());

    // Update NPCs present
    if (npcsHere.length > 0) {
      const npcNames = npcsHere.map(n => n.charAt(0).toUpperCase() + n.slice(1));
      this.npcsText.setText(`Here: ${npcNames.join(', ')}`);
    } else {
      this.npcsText.setText('No one here.');
    }

    // Update destinations
    if (locationData.connections && locationData.connections.length > 0) {
      const destText = locationData.connections.map(d => `[${d}]`).join(' ');
      this.destinationsText.setText(`Go: ${destText}`);
    } else {
      this.destinationsText.setText('');
    }
  }

  show() {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: UI_TIMING.fadeIn
    });
  }

  hide() {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: UI_TIMING.fadeOut
    });
  }
}
```

---

## 9. Transition Effects

```javascript
// src/ui/Transitions.js

import { UI_COLORS, UI_TIMING } from './UIConstants.js';

/**
 * TRANSITION EFFECTS
 * 
 * Scene and location transitions.
 */

export class Transitions {
  constructor(scene) {
    this.scene = scene;
    this.overlay = null;
    
    this.create();
  }

  create() {
    const { width, height } = this.scene.cameras.main;
    
    // Full-screen overlay for fades
    this.overlay = this.scene.add.rectangle(
      width / 2, height / 2,
      width, height,
      UI_COLORS.bgDarkest
    );
    this.overlay.setDepth(2000);
    this.overlay.setAlpha(0);
  }

  /**
   * Fade to black
   */
  async fadeOut(duration = 500) {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.overlay,
        alpha: 1,
        duration: duration,
        onComplete: resolve
      });
    });
  }

  /**
   * Fade from black
   */
  async fadeIn(duration = 500) {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.overlay,
        alpha: 0,
        duration: duration,
        onComplete: resolve
      });
    });
  }

  /**
   * Location transition with text
   */
  async locationTransition(locationName, description = '') {
    await this.fadeOut(300);

    // Show location name
    const nameText = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2 - 20,
      locationName.toUpperCase(),
      {
        fontFamily: 'Oswald, sans-serif',
        fontSize: '28px',
        color: UI_COLORS.textPrimary,
        letterSpacing: 4
      }
    );
    nameText.setOrigin(0.5);
    nameText.setDepth(2001);
    nameText.setAlpha(0);

    const descText = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2 + 20,
      description,
      {
        fontFamily: 'Lora, serif',
        fontSize: '16px',
        color: UI_COLORS.textSecondary,
        fontStyle: 'italic'
      }
    );
    descText.setOrigin(0.5);
    descText.setDepth(2001);
    descText.setAlpha(0);

    // Fade in text
    await new Promise((resolve) => {
      this.scene.tweens.add({
        targets: [nameText, descText],
        alpha: 1,
        duration: 400,
        onComplete: resolve
      });
    });

    // Hold
    await new Promise((resolve) => {
      this.scene.time.delayedCall(1500, resolve);
    });

    // Fade out text
    await new Promise((resolve) => {
      this.scene.tweens.add({
        targets: [nameText, descText],
        alpha: 0,
        duration: 300,
        onComplete: () => {
          nameText.destroy();
          descText.destroy();
          resolve();
        }
      });
    });

    await this.fadeIn(300);
  }

  /**
   * Tremor effect
   */
  async tremor(intensity = 'light') {
    const settings = {
      light: { shake: 0.003, duration: 500 },
      medium: { shake: 0.006, duration: 800 },
      heavy: { shake: 0.012, duration: 1200 }
    };

    const config = settings[intensity];
    
    // Screen shake
    this.scene.cameras.main.shake(config.duration, config.shake);

    // Slight color flash
    const flashOverlay = this.scene.add.rectangle(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0x442222
    );
    flashOverlay.setDepth(1999);
    flashOverlay.setAlpha(0);

    this.scene.tweens.add({
      targets: flashOverlay,
      alpha: 0.15,
      duration: 100,
      yoyo: true,
      repeat: 2,
      onComplete: () => flashOverlay.destroy()
    });

    // Wait for shake to complete
    await new Promise((resolve) => {
      this.scene.time.delayedCall(config.duration, resolve);
    });
  }

  /**
   * Ghost voice effect (screen distortion)
   */
  async ghostEffect(duration = 1000) {
    // Purple tint
    const ghostOverlay = this.scene.add.rectangle(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0x6622aa
    );
    ghostOverlay.setDepth(1998);
    ghostOverlay.setAlpha(0);

    await new Promise((resolve) => {
      this.scene.tweens.add({
        targets: ghostOverlay,
        alpha: 0.1,
        duration: 200
      });

      this.scene.time.delayedCall(duration, () => {
        this.scene.tweens.add({
          targets: ghostOverlay,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            ghostOverlay.destroy();
            resolve();
          }
        });
      });
    });
  }
}
```

---

## 10. Complete Dialogue Flow Example

```javascript
// src/ui/DialogueController.js

import { UIManager } from './UIManager.js';
import { Transitions } from './Transitions.js';

/**
 * DIALOGUE CONTROLLER
 * 
 * High-level dialogue flow management.
 * Coordinates UI, game state, and OpenAI calls.
 */

export class DialogueController {
  constructor(scene, gameManager) {
    this.scene = scene;
    this.game = gameManager;
    this.ui = new UIManager(scene);
    this.transitions = new Transitions(scene);
    
    this.currentConversation = null;
  }

  /**
   * Start talking to an NPC
   */
  async startConversation(npcId) {
    const npcData = NPC_DATA[npcId];
    
    this.currentConversation = {
      npc: npcId,
      turnCount: 0
    };

    // Start dialogue UI
    await this.ui.startDialogue(npcId, npcData);

    // Get initial greeting based on relationship
    const context = this.game.gsm.getDialogueContext(npcId);
    const greeting = await this.getGreeting(npcId, context);

    // Show greeting
    await this.ui.showDialogue(greeting.text, greeting.emotion);

    // Show voice reactions if any
    if (greeting.voices) {
      await this.ui.showVoices(greeting.voices);
    }

    // Show initial choices
    await this.showPlayerChoices(npcId);
  }

  /**
   * Handle player choice
   */
  async handleChoice(choice) {
    // Apply voice bonus if tagged
    if (choice.voiceTag) {
      this.game.gsm.adjustVoiceScore(choice.voiceTag, 1);
    }

    // Get NPC response from OpenAI
    const npcId = this.currentConversation.npc;
    const result = await this.game.talkTo(npcId, choice.text);

    if (result.success) {
      // Determine emotion from response
      const emotion = this.detectEmotion(result.response);
      
      // Show NPC response
      await this.ui.showDialogue(result.response, emotion);

      // Generate and show voice reactions
      const voices = await this.generateVoiceReactions(npcId, result.response);
      if (voices && Object.keys(voices).length > 0) {
        await this.ui.showVoices(voices);
      }

      // Check for special triggers
      await this.handleTriggers(result.triggers);

      // Continue conversation or end
      this.currentConversation.turnCount++;
      
      if (this.shouldEndConversation(result)) {
        await this.endConversation();
      } else {
        await this.showPlayerChoices(npcId);
      }
    } else {
      // Fallback on error
      await this.ui.showDialogue(result.fallback);
      await this.showPlayerChoices(npcId);
    }
  }

  /**
   * Show player choices
   */
  async showPlayerChoices(npcId) {
    const context = this.game.gsm.getDialogueContext(npcId);
    const choices = await this.generateChoices(npcId, context);
    
    const selected = await this.ui.showChoices(choices);
    
    if (selected.id === 'leave') {
      await this.endConversation();
    } else {
      await this.handleChoice(selected);
    }
  }

  /**
   * Generate contextual choices
   */
  async generateChoices(npcId, context) {
    // Base choices always available
    const choices = [];

    // Context-specific choices based on NPC and situation
    const npcChoices = this.getNpcSpecificChoices(npcId, context);
    choices.push(...npcChoices);

    // Voice-tagged choices based on dominant voice
    const voiceChoices = this.getVoiceChoices(context);
    choices.push(...voiceChoices);

    // Always add leave option
    choices.push({
      id: 'leave',
      text: '[Leave]',
      voiceTag: null
    });

    return choices;
  }

  getNpcSpecificChoices(npcId, context) {
    // Simplified - in full implementation, these would be more dynamic
    const choices = {
      mara: [
        { id: 'resources', text: "How are the supplies holding up?", voiceTag: 'LOGIC' },
        { id: 'settlement', text: "Tell me about Ashfall.", voiceTag: null },
        { id: 'others', text: "What do you think of the others?", voiceTag: 'EMPATHY' }
      ],
      jonas: [
        { id: 'clinic', text: "Why is the clinic closed?", voiceTag: 'EMPATHY' },
        { id: 'help', text: "Can you help with injuries?", voiceTag: 'LOGIC' },
        { id: 'past', text: "You seem troubled.", voiceTag: 'EMPATHY' }
      ],
      rask: [
        { id: 'watch', text: "What are you watching for?", voiceTag: 'LOGIC' },
        { id: 'children', text: "You keep an eye on the children.", voiceTag: 'EMPATHY' },
        { id: 'danger', text: "Is it dangerous here?", voiceTag: 'INSTINCT' }
      ],
      edda: [
        { id: 'hum', text: "Do you hear that hum?", voiceTag: 'GHOST' },
        { id: 'history', text: "How long have you been here?", voiceTag: null },
        { id: 'shaft', text: "What's that sealed place?", voiceTag: 'GHOST' }
      ],
      kale: [
        { id: 'self', text: "Tell me about yourself.", voiceTag: 'EMPATHY' },
        { id: 'others', text: "What do you think of the others?", voiceTag: null },
        { id: 'strange', text: "Do you ever feel... strange here?", voiceTag: 'GHOST' }
      ]
    };

    return choices[npcId] || [];
  }

  getVoiceChoices(context) {
    const dominant = this.game.gsm.getDominantVoice();
    
    // Add a voice-specific choice based on dominant voice
    const voiceChoices = {
      LOGIC: { id: 'analyze', text: "Let me think about this logically.", voiceTag: 'LOGIC' },
      INSTINCT: { id: 'gut', text: "Something feels wrong here.", voiceTag: 'INSTINCT' },
      EMPATHY: { id: 'feel', text: "How are you really feeling?", voiceTag: 'EMPATHY' },
      GHOST: { id: 'memory', text: "This reminds me of something...", voiceTag: 'GHOST' }
    };

    if (dominant.confidence !== 'low' && voiceChoices[dominant.voice]) {
      return [voiceChoices[dominant.voice]];
    }

    return [];
  }

  async generateVoiceReactions(npcId, npcResponse) {
    // Use VoiceSystem to generate reactions
    const voiceSystem = this.game.gsm.getSystem('voices');
    if (voiceSystem) {
      return await voiceSystem.getVoiceReactions({
        npc: npcId,
        npcDialogue: npcResponse,
        location: this.game.gsm.get('player.location')
      });
    }
    return null;
  }

  detectEmotion(response) {
    const lower = response.toLowerCase();
    
    if (lower.includes('*tightens*') || lower.includes('*hardens*')) return 'guarded';
    if (lower.includes('*softens*') || lower.includes('*quiet*')) return 'vulnerable';
    if (lower.includes('*looks away*') || lower.includes('*distant*')) return 'distant';
    if (lower.includes('*fear*') || lower.includes('*trembl*')) return 'frightened';
    
    return 'neutral';
  }

  async handleTriggers(triggers) {
    if (!triggers) return;

    for (const trigger of triggers) {
      if (trigger.type === 'shaft_mentioned') {
        // Subtle tremor when shaft is mentioned
        await this.transitions.tremor('light');
      }
      
      if (trigger.type === 'emotional_spike') {
        // Brief ghost effect
        await this.transitions.ghostEffect(500);
      }
    }
  }

  shouldEndConversation(result) {
    // End after certain triggers or turn count
    if (this.currentConversation.turnCount > 6) return true;
    if (result.triggers?.some(t => t.type === 'conversation_end')) return true;
    return false;
  }

  async endConversation() {
    await this.ui.endDialogue();
    this.currentConversation = null;
    
    // Emit event for game to handle
    this.scene.events.emit('conversation:end');
  }

  /**
   * Get initial greeting based on relationship and context
   */
  async getGreeting(npcId, context) {
    const relationship = context.relationship;
    
    // Simple greeting variations based on relationship
    const greetings = {
      mara: {
        low: { text: "*She barely acknowledges you.* What.", emotion: 'guarded' },
        medium: { text: "*She looks up from her work.* You need something?", emotion: 'neutral' },
        high: { text: "*She nods.* Good. I was hoping you'd come by.", emotion: 'neutral' }
      },
      jonas: {
        low: { text: "*He doesn't look up.* I'm... busy.", emotion: 'distant' },
        medium: { text: "*He pauses.* Oh. Hello.", emotion: 'distant' },
        high: { text: "*He almost smiles.* It's good to see you.", emotion: 'warmth' }
      },
      rask: {
        low: { text: "*He watches. Says nothing.*", emotion: 'watching' },
        medium: { text: "*A slight nod.*", emotion: 'neutral' },
        high: { text: "*He shifts to make room.* Stay a while.", emotion: 'softness' }
      },
      edda: {
        low: { text: "*She hums softly, not quite looking at you.*", emotion: 'cryptic' },
        medium: { text: "*She turns.* The wind brought you. Or something did.", emotion: 'cryptic' },
        high: { text: "*She takes your hand briefly.* You came back. That means something.", emotion: 'prophetic' }
      },
      kale: {
        low: { text: "*He shifts nervously.* Oh. Hi. I wasn't—did you need me?", emotion: 'eager' },
        medium: { text: "*He brightens.* Hey! I was hoping I'd run into you.", emotion: 'eager' },
        high: { text: "*He relaxes.* It's... it's nice when you're around.", emotion: 'eager' }
      }
    };

    const level = relationship < 40 ? 'low' : relationship < 70 ? 'medium' : 'high';
    const greeting = greetings[npcId]?.[level] || { text: "*They look at you.*", emotion: 'neutral' };

    // Add voice reactions for first meeting
    if (!context.flags.includes(`met_${npcId}`)) {
      greeting.voices = this.getFirstMeetingVoices(npcId);
    }

    return greeting;
  }

  getFirstMeetingVoices(npcId) {
    const voices = {
      mara: {
        LOGIC: "Leader. But stretched thin.",
        INSTINCT: "She could cut you with a look.",
        EMPATHY: "So much weight on those shoulders."
      },
      jonas: {
        LOGIC: "Medical training evident. Why isn't he practicing?",
        EMPATHY: "He's drowning in something.",
        GHOST: "His hands remember what his heart forgot."
      },
      rask: {
        INSTINCT: "Dangerous. Very dangerous.",
        EMPATHY: "He's tired. Of everything.",
        LOGIC: "Controlled violence. Strategic stillness."
      },
      edda: {
        GHOST: "She knows things. Old things.",
        EMPATHY: "Such sadness in those eyes.",
        INSTINCT: "Careful. She sees too much."
      },
      kale: {
        EMPATHY: "He's looking for himself in everyone else.",
        INSTINCT: "Unstable. But not a threat.",
        GHOST: "Something flickers in him. Familiar."
      }
    };

    return voices[npcId] || {};
  }
}

// NPC display data
const NPC_DATA = {
  mara: { name: 'Mara', portrait: 'mara_guarded' },
  jonas: { name: 'Jonas', portrait: 'jonas_distant' },
  rask: { name: 'Rask', portrait: 'rask_watching' },
  edda: { name: 'Edda', portrait: 'edda_cryptic' },
  kale: { name: 'Kale', portrait: 'kale_eager' }
};
```

---

## 11. File Structure

```
src/
├── ui/
│   ├── UIConstants.js      # Colors, fonts, dimensions, timing
│   ├── UIManager.js        # Main coordinator
│   ├── DialogueBox.js      # NPC dialogue display
│   ├── VoicePanel.js       # Internal voices
│   ├── ChoicePanel.js      # Player choices
│   ├── HUD.js              # Top bar info
│   ├── LocationPanel.js    # Current location info
│   ├── Transitions.js      # Fade, tremor, effects
│   └── DialogueController.js # High-level flow
└── ...
```

---

## 12. Usage Example

```javascript
// In your main game scene

import { DialogueController } from './ui/DialogueController.js';
import { Game } from './core/GameManager.js';

class GameScene extends Phaser.Scene {
  create() {
    // Initialize dialogue controller
    this.dialogue = new DialogueController(this, Game);

    // Update HUD with initial state
    this.dialogue.ui.updateHUD(Game.getUIState());

    // Example: Talk to Edda when clicking her
    this.eddaSprite.on('pointerdown', async () => {
      await this.dialogue.startConversation('edda');
    });

    // Listen for conversation end
    this.events.on('conversation:end', () => {
      // Re-enable player movement, etc.
      this.enablePlayerControls();
    });
  }

  update() {
    // Update HUD each frame
    this.dialogue.ui.updateHUD(Game.getUIState());
  }
}
```

---

## Summary

The UI Implementation provides:

| Component | Purpose |
|-----------|---------|
| **UIManager** | Coordinates all UI elements |
| **DialogueBox** | Portrait + speaker + typewriter text |
| **VoicePanel** | LOGIC/INSTINCT/EMPATHY/GHOST reactions |
| **ChoicePanel** | Player options with keyboard/mouse |
| **HUD** | Day, time, hum status |
| **LocationPanel** | Where am I, who's here |
| **Transitions** | Fades, tremors, ghost effects |
| **DialogueController** | Full conversation flow |

**Key Features:**

- Typewriter text effect with punctuation pauses
- Voice-tagged choices that boost alignment
- Staggered voice reactions
- Keyboard AND mouse navigation
- Smooth transitions between states
- Tremor and ghost visual effects
- Automatic emotion detection from responses

---

*"Small lives. Heavy truths. The earth remembers."*

*— Now with a face*
