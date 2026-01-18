// src/ui/Transitions.js

import { UI_COLORS } from './UIConstants.js';

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
      width / 2,
      height / 2,
      width,
      height,
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
