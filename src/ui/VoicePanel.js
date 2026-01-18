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

    this.create();
  }

  create() {
    const { x, y } = this.config;

    this.container = this.scene.add.container(x, y);
    this.container.setAlpha(0);

    this.background = this.scene.add.graphics();
    this.container.add(this.background);
  }

  async showVoices(voices) {
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
      const voiceData = Array.isArray(voices)
        ? voices.find(v => v.voice === voice)
        : voices[voice];

      if (!voiceData) continue;

      const text = typeof voiceData === 'string' ? voiceData : voiceData.text;
      if (!text) continue;

      const promise = new Promise((resolve) => {
        this.scene.time.delayedCall(yOffset * 150, () => {
          const textObj = this.createVoiceLine(voice, text, voiceColors[voice], yOffset * lineHeight);
          this.voiceTexts.push(textObj);

          this.scene.tweens.add({
            targets: textObj,
            alpha: 1,
            duration: 200
          });

          this.scene.time.delayedCall(UI_TIMING.voiceDuration, () => {
            this.scene.tweens.add({
              targets: textObj,
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

    this.updateBackground(yOffset * lineHeight);

    await Promise.all(promises);
    this.container.setAlpha(0);
  }

  createVoiceLine(voice, text, color, yPos) {
    const formattedText = `[${voice}] ${text}`;

    const textObj = this.scene.add.text(
      -280,
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
