// src/ui/VoicePanel.js

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
    this.isShowing = false;

    this.create();
  }

  create() {
    const { x, y } = this.config;

    this.container = this.scene.add.container(x, y);
    this.container.setAlpha(0);
    this.container.setDepth(1100); // Above other UI elements

    this.background = this.scene.add.graphics();
    this.container.add(this.background);
  }

  async showVoices(voices) {
    // Prevent overlapping calls
    if (this.isShowing) {
      this.clear();
    }
    this.isShowing = true;

    this.clear();
    this.container.setAlpha(1);

    const voiceOrder = ['LOGIC', 'INSTINCT', 'EMPATHY', 'GHOST'];
    const voiceColors = {
      LOGIC: UI_COLORS.voiceLogic,
      INSTINCT: UI_COLORS.voiceInstinct,
      EMPATHY: UI_COLORS.voiceEmpathy,
      GHOST: UI_COLORS.voiceGhost
    };

    // Collect voices to show
    const voicesToShow = [];
    for (const voice of voiceOrder) {
      const voiceData = Array.isArray(voices)
        ? voices.find(v => v.voice === voice)
        : voices[voice];

      if (!voiceData) continue;

      const text = typeof voiceData === 'string' ? voiceData : voiceData.text;
      if (!text) continue;

      voicesToShow.push({ voice, text, color: voiceColors[voice] });
    }

    if (voicesToShow.length === 0) {
      this.isShowing = false;
      return;
    }

    // Update background for all voices
    const lineHeight = 28;
    this.updateBackground(voicesToShow.length * lineHeight + 10);

    // Create all voice lines sequentially with delays
    const promises = [];
    voicesToShow.forEach((voiceInfo, index) => {
      const promise = new Promise((resolve) => {
        const delay = index * 400; // Stagger appearance

        this.scene.time.delayedCall(delay, () => {
          if (!this.isShowing) {
            resolve();
            return;
          }

          const yPos = index * lineHeight;
          const textObj = this.createVoiceLine(voiceInfo.voice, voiceInfo.text, voiceInfo.color, yPos);
          this.voiceTexts.push(textObj);

          // Fade in
          this.scene.tweens.add({
            targets: textObj,
            alpha: 1,
            duration: 200
          });

          // Fade out after duration
          this.scene.time.delayedCall(UI_TIMING.voiceDuration, () => {
            if (textObj && textObj.active) {
              this.scene.tweens.add({
                targets: textObj,
                alpha: 0,
                duration: 300,
                onComplete: resolve
              });
            } else {
              resolve();
            }
          });
        });
      });

      promises.push(promise);
    });

    await Promise.all(promises);
    this.isShowing = false;
    this.container.setAlpha(0);
  }

  createVoiceLine(voice, text, color, yPos) {
    const formattedText = `[${voice}] ${text}`;

    const textObj = this.scene.add.text(
      -280,
      yPos,
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
    this.background.fillStyle(UI_COLORS.bgDarkest, 0.85);
    this.background.fillRoundedRect(-300, -10, 600, height + 20, 6);
  }

  async showSingleVoice(voice, text) {
    const voiceColors = {
      LOGIC: UI_COLORS.voiceLogic,
      INSTINCT: UI_COLORS.voiceInstinct,
      EMPATHY: UI_COLORS.voiceEmpathy,
      GHOST: UI_COLORS.voiceGhost
    };

    // Prevent overlapping
    if (this.isShowing) {
      this.clear();
    }
    this.isShowing = true;

    this.clear();
    this.container.setAlpha(1);
    this.updateBackground(32);

    const textObj = this.createVoiceLine(voice, text, voiceColors[voice], 0);
    this.voiceTexts.push(textObj);

    await new Promise((resolve) => {
      this.scene.tweens.add({
        targets: textObj,
        alpha: 1,
        duration: 200,
        onComplete: resolve
      });
    });

    await new Promise((resolve) => {
      this.scene.time.delayedCall(UI_TIMING.voiceDuration, resolve);
    });

    await new Promise((resolve) => {
      if (textObj && textObj.active) {
        this.scene.tweens.add({
          targets: textObj,
          alpha: 0,
          duration: 300,
          onComplete: resolve
        });
      } else {
        resolve();
      }
    });

    this.isShowing = false;
    this.container.setAlpha(0);
  }

  clear() {
    // Stop any active tweens on voice texts
    for (const text of this.voiceTexts) {
      if (text && text.active) {
        this.scene.tweens.killTweensOf(text);
        text.destroy();
      }
    }
    this.voiceTexts = [];
    this.background.clear();
  }

  hide() {
    this.isShowing = false;
    this.container.setAlpha(0);
    this.clear();
  }
}
