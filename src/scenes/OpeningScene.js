// src/scenes/OpeningScene.js
// ASHFALL - Opening Scene: "The Quiet Arrival"

import Phaser from 'phaser';
import { OPENING_SCENE_DATA } from '../data/openingScene.js';

/**
 * OPENING SCENE: "The Quiet Arrival"
 *
 * Structure:
 * 1. Environmental establishing shot
 * 2. First internal voice activation
 * 3. Rask gatekeeper moment
 * 4. Entering the settlement (NPC glimpses)
 * 5. Optional first tremor
 * 6. Free movement begins
 */

export class OpeningScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OpeningScene' });

    this.state = {
      phase: 'establishing',  // establishing → voices → gate → enter → tremor → free
      voicesActivated: false,
      raskEncounterComplete: false,
      firstTremorTriggered: false,
      playerChoices: [],
      dominantFirstImpression: null
    };

    this.currentDialogue = null;
    this.choiceButtons = [];
  }

  create() {
    console.log('[OpeningScene] create() called');

    // Initialize game systems
    this.initializeSystems();
    console.log('[OpeningScene] Systems initialized');

    // Create UI containers
    this.createUIContainers();
    console.log('[OpeningScene] UI containers created');

    // Create skip intro hint and listener
    this.createSkipIntro();

    // Start the sequence
    this.beginEstablishingShot();
    console.log('[OpeningScene] beginEstablishingShot() started');
  }

  createSkipIntro() {
    // Skip intro hint text
    this.skipHint = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height - 30,
      'Press SPACE to skip intro',
      {
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: '14px',
        color: '#6b6358'
      }
    ).setOrigin(0.5).setAlpha(0.6);

    // Pulse animation
    this.tweens.add({
      targets: this.skipHint,
      alpha: { from: 0.3, to: 0.7 },
      duration: 1500,
      yoyo: true,
      repeat: -1
    });

    // Space key listener
    this.input.keyboard.once('keydown-SPACE', () => {
      this.skipIntro();
    });
  }

  skipIntro() {
    console.log('[OpeningScene] Skipping intro...');

    // Set default state for skipped intro
    this.state.voicesActivated = true;
    this.state.raskEncounterComplete = true;
    this.state.dominantFirstImpression = 'silent'; // Default tone

    // Set flags as if intro was completed
    window.ASHFALL.setFlag('rask_met');
    window.ASHFALL.setFlag('gate_passed');
    window.ASHFALL.setFlag('first_impression_silent');
    window.ASHFALL.setFlag('intro_skipped');

    // Give small balanced voice scores
    window.ASHFALL.voiceScores = {
      LOGIC: 1,
      INSTINCT: 1,
      EMPATHY: 1,
      GHOST: 1
    };

    // Fade to settlement
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(400, () => {
      window.ASHFALL.setFlag('opening_complete');
      window.ASHFALL.setFlag('voices_activated');

      this.scene.start('SettlementScene', {
        firstEntry: true,
        playerTone: 'silent',
        voiceScores: window.ASHFALL.voiceScores,
        choices: [],
        skipped: true
      });
    });
  }

  initializeSystems() {
    // Ensure global state exists
    window.ASHFALL = window.ASHFALL || {};
    window.ASHFALL.flags = window.ASHFALL.flags || new Set();
    window.ASHFALL.relationships = window.ASHFALL.relationships || new Map([
      ['mara', 50],
      ['jonas', 50],
      ['rask', 50],
      ['edda', 50],
      ['kale', 50]
    ]);
    window.ASHFALL.voiceScores = {
      LOGIC: 0,
      INSTINCT: 0,
      EMPATHY: 0,
      GHOST: 0
    };

    // Helper functions
    window.ASHFALL.setFlag = window.ASHFALL.setFlag || ((flag) => {
      window.ASHFALL.flags.add(flag);
    });

    window.ASHFALL.adjustRelationship = window.ASHFALL.adjustRelationship || ((npcId, delta) => {
      const current = window.ASHFALL.relationships.get(npcId) || 50;
      window.ASHFALL.relationships.set(npcId, Math.max(0, Math.min(100, current + delta)));
    });
  }

  createUIContainers() {
    // Dialogue box container
    this.dialogueContainer = this.add.container(0, 0).setVisible(false);

    // Create dialogue box background
    const boxHeight = 180;
    const boxY = this.cameras.main.height - boxHeight - 20;

    const dialogueBg = this.add.rectangle(
      this.cameras.main.width / 2,
      boxY + boxHeight / 2,
      this.cameras.main.width - 40,
      boxHeight,
      0x1a1a1a,
      0.9
    ).setStrokeStyle(1, 0x444444);

    this.dialogueContainer.add(dialogueBg);

    // Speaker name
    this.speakerText = this.add.text(
      40,
      boxY + 15,
      '',
      {
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        color: '#d4c4a8',
        fontStyle: 'bold'
      }
    );
    this.dialogueContainer.add(this.speakerText);

    // Dialogue text
    this.dialogueText = this.add.text(
      40,
      boxY + 45,
      '',
      {
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        color: '#a89a85',
        wordWrap: { width: this.cameras.main.width - 100 }
      }
    );
    this.dialogueContainer.add(this.dialogueText);

    // Choice container
    this.choiceContainer = this.add.container(0, 0).setVisible(false);
  }

  // ═══════════════════════════════════════
  // PHASE 1: ESTABLISHING SHOT
  // ═══════════════════════════════════════

  beginEstablishingShot() {
    console.log('[OpeningScene] beginEstablishingShot - setting phase to establishing');
    this.state.phase = 'establishing';

    // Black background
    this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x0a0a0a
    );

    // Fade in from black
    this.cameras.main.fadeIn(2000, 0, 0, 0);

    // Environmental text sequence
    const data = OPENING_SCENE_DATA.establishing;
    const texts = data.lines.map((text, i) => ({
      text,
      delay: data.timing[i]
    }));

    console.log('[OpeningScene] Starting environmental sequence with', texts.length, 'texts');
    this.displayEnvironmentalSequence(texts, () => {
      console.log('[OpeningScene] Environmental sequence complete');
      this.time.delayedCall(2000, () => {
        this.triggerFirstVoices();
      });
    });
  }

  displayEnvironmentalSequence(texts, onComplete) {
    const style = {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: '#a89a85',
      align: 'center',
      wordWrap: { width: 600 }
    };

    let currentText = null;

    texts.forEach((item, index) => {
      this.time.delayedCall(item.delay, () => {
        // Fade out previous text
        if (currentText) {
          this.tweens.add({
            targets: currentText,
            alpha: 0,
            duration: 500
          });
        }

        // Create new text
        currentText = this.add.text(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2,
          item.text,
          style
        ).setOrigin(0.5).setAlpha(0);

        // Fade in
        this.tweens.add({
          targets: currentText,
          alpha: 1,
          duration: 800
        });

        // If last text, trigger callback
        if (index === texts.length - 1) {
          this.time.delayedCall(2500, () => {
            this.tweens.add({
              targets: currentText,
              alpha: 0,
              duration: 1000,
              onComplete: onComplete
            });
          });
        }
      });
    });
  }

  // ═══════════════════════════════════════
  // PHASE 2: FIRST INTERNAL VOICES
  // ═══════════════════════════════════════

  triggerFirstVoices() {
    console.log('[OpeningScene] triggerFirstVoices - starting voice phase');
    this.state.phase = 'voices';
    this.state.voicesActivated = true;

    const data = OPENING_SCENE_DATA.firstVoices;
    const colors = {
      LOGIC: '#88ccff',
      INSTINCT: '#ff8844',
      EMPATHY: '#88ff88',
      GHOST: '#cc88ff'
    };

    const voiceSequence = Object.entries(data).map(([voice, info]) => ({
      voice,
      text: info.text,
      color: colors[voice],
      delay: info.delay
    }));

    this.displayVoiceSequence(voiceSequence, () => {
      this.time.delayedCall(2000, () => {
        this.beginRaskEncounter();
      });
    });
  }

  displayVoiceSequence(voices, onComplete) {
    const baseY = this.cameras.main.height - 150;

    voices.forEach((voice, index) => {
      this.time.delayedCall(voice.delay, () => {
        const voiceText = this.add.text(
          50,
          baseY,
          `[${voice.voice}] ${voice.text}`,
          {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: voice.color,
            fontStyle: 'italic',
            wordWrap: { width: this.cameras.main.width - 100 }
          }
        ).setAlpha(0);

        // Fade in
        this.tweens.add({
          targets: voiceText,
          alpha: 1,
          duration: 500
        });

        // Fade out after delay
        this.time.delayedCall(2500, () => {
          this.tweens.add({
            targets: voiceText,
            alpha: 0,
            duration: 500,
            onComplete: () => voiceText.destroy()
          });
        });

        // Trigger completion after last voice
        if (index === voices.length - 1) {
          this.time.delayedCall(3500, onComplete);
        }
      });
    });
  }

  // ═══════════════════════════════════════
  // PHASE 3: RASK GATEKEEPER
  // ═══════════════════════════════════════

  beginRaskEncounter() {
    this.state.phase = 'gate';

    const data = OPENING_SCENE_DATA.raskEncounter;

    // Show Rask's introduction action
    this.showDialogueBox({
      speaker: 'RASK',
      text: data.introduction.action,
      isAction: true
    });

    this.time.delayedCall(2000, () => {
      this.showDialogueBox({
        speaker: 'RASK',
        text: data.introduction.dialogue
      });

      this.time.delayedCall(1500, () => {
        this.showRaskChoices();
      });
    });
  }

  showDialogueBox(options) {
    this.dialogueContainer.setVisible(true);

    this.speakerText.setText(options.speaker || '');

    if (options.isAction) {
      this.dialogueText.setStyle({ fontStyle: 'italic', color: '#888888' });
    } else {
      this.dialogueText.setStyle({ fontStyle: 'normal', color: '#a89a85' });
    }

    this.dialogueText.setText(options.text || '');
  }

  hideDialogueBox() {
    this.dialogueContainer.setVisible(false);
  }

  showRaskChoices() {
    const data = OPENING_SCENE_DATA.raskEncounter;
    const choices = data.playerChoices;

    this.displayChoices(choices, (choice) => {
      this.handleRaskResponse(choice);
    });
  }

  displayChoices(choices, onSelect) {
    // Clear existing choice buttons
    this.choiceButtons.forEach(btn => btn.destroy());
    this.choiceButtons = [];

    this.choiceContainer.setVisible(true);

    const startY = this.cameras.main.height - 300;
    const buttonHeight = 40;
    const spacing = 10;

    choices.forEach((choice, index) => {
      const y = startY + (buttonHeight + spacing) * index;

      // Button background
      const bg = this.add.rectangle(
        this.cameras.main.width / 2,
        y,
        this.cameras.main.width - 100,
        buttonHeight,
        0x2a2a2a,
        0.9
      ).setStrokeStyle(1, 0x444444)
        .setInteractive({ useHandCursor: true });

      // Button text
      const text = this.add.text(
        60,
        y,
        choice.text,
        {
          fontFamily: 'Georgia, serif',
          fontSize: '14px',
          color: '#c4b49a'
        }
      ).setOrigin(0, 0.5);

      // Hover effects
      bg.on('pointerover', () => {
        bg.setFillStyle(0x3a3a3a);
        text.setColor('#e4d4ba');
      });

      bg.on('pointerout', () => {
        bg.setFillStyle(0x2a2a2a);
        text.setColor('#c4b49a');
      });

      bg.on('pointerdown', () => {
        this.hideChoices();
        onSelect(choice);
      });

      this.choiceButtons.push(bg, text);
      this.choiceContainer.add([bg, text]);
    });
  }

  hideChoices() {
    this.choiceContainer.setVisible(false);
    this.choiceButtons.forEach(btn => btn.destroy());
    this.choiceButtons = [];
  }

  handleRaskResponse(choice) {
    // Record choice
    this.state.playerChoices.push({
      moment: 'rask_gate',
      choice: choice.id,
      tone: choice.tone
    });

    // Apply voice bonus
    for (const [voice, bonus] of Object.entries(choice.voiceBonus)) {
      window.ASHFALL.voiceScores[voice] += bonus;
    }

    // Update relationship
    const currentRel = window.ASHFALL.relationships.get('rask');
    window.ASHFALL.relationships.set('rask', currentRel + choice.relationshipDelta);

    // Display Rask's response
    this.showDialogueBox({
      speaker: 'RASK',
      text: choice.raskResponse
    });

    // Display voice reactions
    this.time.delayedCall(2500, () => {
      this.displayVoiceReactions(choice.voiceReactions, () => {
        this.completeRaskEncounter(choice.tone);
      });
    });
  }

  displayVoiceReactions(reactions, onComplete) {
    const colors = {
      LOGIC: '#88ccff',
      INSTINCT: '#ff8844',
      EMPATHY: '#88ff88',
      GHOST: '#cc88ff'
    };

    reactions.forEach((reaction, index) => {
      this.time.delayedCall(index * 2000, () => {
        const text = this.add.text(
          50,
          this.cameras.main.height - 100,
          `[${reaction.voice}] ${reaction.text}`,
          {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: colors[reaction.voice],
            fontStyle: 'italic'
          }
        ).setAlpha(0);

        this.tweens.add({
          targets: text,
          alpha: 1,
          duration: 300
        });

        this.time.delayedCall(1800, () => {
          this.tweens.add({
            targets: text,
            alpha: 0,
            duration: 300,
            onComplete: () => {
              text.destroy();
              if (index === reactions.length - 1) {
                onComplete();
              }
            }
          });
        });
      });
    });
  }

  completeRaskEncounter(playerTone) {
    this.state.raskEncounterComplete = true;
    this.state.dominantFirstImpression = playerTone;

    const data = OPENING_SCENE_DATA.raskEncounter;

    // Rask lets player enter
    this.showDialogueBox({
      speaker: 'RASK',
      text: data.exitLines[playerTone]
    });

    // Set flags
    window.ASHFALL.setFlag('rask_met');
    window.ASHFALL.setFlag('gate_passed');
    window.ASHFALL.setFlag(`first_impression_${playerTone}`);

    this.time.delayedCall(2500, () => {
      this.hideDialogueBox();
      this.beginSettlementEntry();
    });
  }

  // ═══════════════════════════════════════
  // PHASE 4: ENTERING THE SETTLEMENT
  // ═══════════════════════════════════════

  beginSettlementEntry() {
    console.log('[OpeningScene] beginSettlementEntry - transitioning to SettlementScene');
    this.state.phase = 'enter';

    // Transition to settlement view
    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.time.delayedCall(600, () => {
      console.log('[OpeningScene] Fade complete, starting SettlementScene');
      // Set completion flags
      window.ASHFALL.setFlag('opening_complete');
      window.ASHFALL.setFlag('voices_activated');

      // Load settlement scene with entry data
      this.scene.start('SettlementScene', {
        firstEntry: true,
        playerTone: this.state.dominantFirstImpression,
        voiceScores: window.ASHFALL.voiceScores,
        choices: this.state.playerChoices
      });
    });
  }
}
