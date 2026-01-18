// src/ui/DialogueBox.js

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
    this.background.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    this.background.lineStyle(1, UI_COLORS.accentRust, 0.8);
    this.background.strokeRoundedRect(-width / 2, -height / 2, width, height, 8);
    this.container.add(this.background);

    // Portrait frame
    const portraitX = -width / 2 + dim.padding + dim.portraitSize / 2;
    const portraitY = -height / 2 + dim.padding + dim.portraitSize / 2;

    this.portraitFrame = this.scene.add.graphics();
    this.portraitFrame.lineStyle(2, UI_COLORS.bgDarkest, 1);
    this.portraitFrame.strokeRect(
      portraitX - dim.portraitSize / 2 - 2,
      portraitY - dim.portraitSize / 2 - 2,
      dim.portraitSize + 4,
      dim.portraitSize + 4
    );
    this.container.add(this.portraitFrame);

    // Portrait placeholder
    this.portrait = this.scene.add.rectangle(
      portraitX, portraitY,
      dim.portraitSize, dim.portraitSize,
      UI_COLORS.bgMedium
    );
    this.container.add(this.portrait);

    // Speaker name
    const textX = -width / 2 + dim.padding * 2 + dim.portraitSize;

    this.speakerName = this.scene.add.text(
      textX,
      -height / 2 + dim.padding,
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
      -height / 2 + dim.padding + 28,
      '',
      {
        ...UI_FONTS.dialogue,
        wordWrap: { width: width - dim.portraitSize - dim.padding * 4 }
      }
    );
    this.container.add(this.dialogueText);

    // Continue indicator
    this.continueIndicator = this.scene.add.text(
      width / 2 - dim.padding - 20,
      height / 2 - dim.padding - 10,
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

  setPortrait(portraitKey) {
    if (this.scene.textures.exists(portraitKey)) {
      if (this.portrait.type === 'Rectangle') {
        this.portrait.destroy();

        const dim = UI_DIMENSIONS.dialogueBox;
        const portraitX = -this.config.width / 2 + dim.padding + dim.portraitSize / 2;
        const portraitY = -this.config.height / 2 + dim.padding + dim.portraitSize / 2;

        this.portrait = this.scene.add.image(portraitX, portraitY, portraitKey);
        this.portrait.setDisplaySize(dim.portraitSize, dim.portraitSize);
        this.container.add(this.portrait);
      } else {
        this.portrait.setTexture(portraitKey);
      }
    }
  }

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
          const char = text[charIndex];
          const isAction = text[charIndex - 1] === '*' ||
            (this.displayedText.match(/\*/g)?.length || 0) % 2 === 1;

          this.displayedText += char;
          this.dialogueText.setText(this.displayedText);

          charIndex++;

          if (isAction) {
            this.typeTimer.delay = UI_TIMING.textSpeed / 2;
          } else {
            this.typeTimer.delay = UI_TIMING.textSpeed;
          }

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
