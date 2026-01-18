// src/ui/CurieWhisperPanel.js

import { UI_COLORS } from './UIConstants.js';

/**
 * CURIE WHISPER PANEL
 *
 * Displays Curie's manifestations.
 * Different from NPC dialogue - ethereal, unsettling, brief.
 */

export class CurieWhisperPanel {
  constructor(scene) {
    this.scene = scene;
    this.isVisible = false;

    this.create();
  }

  create() {
    const { width, height } = this.scene.cameras.main;

    // Container - centered but slightly above middle
    this.container = this.scene.add.container(width / 2, height / 2 - 50);
    this.container.setDepth(1800);
    this.container.setAlpha(0);

    // Glitch overlay (subtle)
    this.glitchOverlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x220022, 0);
    this.glitchOverlay.setDepth(1799);

    // Text - Curie's voice
    this.text = this.scene.add.text(0, 0, '', {
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: '18px',
      color: '#cc88ff',
      fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: 500 },
      lineSpacing: 8
    });
    this.text.setOrigin(0.5);
    this.container.add(this.text);

    // State indicator (subtle)
    this.stateIndicator = this.scene.add.text(0, 60, '', {
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: '10px',
      color: '#663388',
      fontStyle: 'italic'
    });
    this.stateIndicator.setOrigin(0.5);
    this.container.add(this.stateIndicator);
  }

  /**
   * Show Curie's whisper
   */
  async show(text, state, duration = 5000) {
    this.isVisible = true;
    this.text.setText(text);

    // State indicator
    const stateLabels = {
      fragmented: '[ signal fragmented ]',
      reaching: '[ signal reaching ]',
      overloaded: '[ signal unstable ]',
      emergent: '[ signal coherent ]'
    };
    this.stateIndicator.setText(stateLabels[state] || '');

    // Color based on state
    const stateColors = {
      fragmented: '#9966cc',
      reaching: '#cc88ff',
      overloaded: '#ff66aa',
      emergent: '#aaccff'
    };
    this.text.setColor(stateColors[state] || '#cc88ff');

    // Glitch effect for overloaded
    if (state === 'overloaded') {
      this.startGlitchEffect();
    }

    // Fade in with slight scale
    this.container.setScale(0.95);

    await new Promise(resolve => {
      this.scene.tweens.add({
        targets: this.container,
        alpha: 1,
        scale: 1,
        duration: 400,
        ease: 'Power2',
        onComplete: resolve
      });
    });

    // Subtle pulse while visible
    this.pulseAnimation = this.scene.tweens.add({
      targets: this.text,
      alpha: { from: 1, to: 0.8 },
      duration: 1500,
      yoyo: true,
      repeat: -1
    });

    // Auto-hide after duration
    await new Promise(resolve => {
      this.scene.time.delayedCall(duration, resolve);
    });

    await this.hide();
  }

  /**
   * Hide the whisper
   */
  async hide() {
    if (this.pulseAnimation) {
      this.pulseAnimation.stop();
    }

    this.stopGlitchEffect();

    await new Promise(resolve => {
      this.scene.tweens.add({
        targets: this.container,
        alpha: 0,
        scale: 0.95,
        duration: 300,
        onComplete: resolve
      });
    });

    this.isVisible = false;
  }

  /**
   * Glitch effect for overloaded state
   */
  startGlitchEffect() {
    this.glitchTimer = this.scene.time.addEvent({
      delay: 100,
      callback: () => {
        // Random offset
        this.text.x = (Math.random() - 0.5) * 4;
        this.text.y = (Math.random() - 0.5) * 4;

        // Flash overlay
        this.glitchOverlay.alpha = Math.random() * 0.1;
      },
      loop: true
    });
  }

  stopGlitchEffect() {
    if (this.glitchTimer) {
      this.glitchTimer.destroy();
      this.glitchTimer = null;
    }
    this.text.x = 0;
    this.text.y = 0;
    this.glitchOverlay.alpha = 0;
  }
}
