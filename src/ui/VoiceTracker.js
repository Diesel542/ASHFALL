// src/ui/VoiceTracker.js

import { UI_COLORS } from './UIConstants.js';

/**
 * VOICE TRACKER
 *
 * Bottom-right UI showing the four internal voices.
 * - Displays bars for LOGIC, INSTINCT, EMPATHY, GHOST
 * - Dominant voice glows and pulses
 * - Flashes when a voice-aligned choice is selected
 */

const VOICE_CONFIG = {
  LOGIC: {
    label: 'LOGIC',
    color: 0x88ccff,
    colorHex: '#88ccff',
    description: 'Reason, analysis, evidence'
  },
  INSTINCT: {
    label: 'INSTINCT',
    color: 0xff8844,
    colorHex: '#ff8844',
    description: 'Gut feelings, survival'
  },
  EMPATHY: {
    label: 'EMPATHY',
    color: 0x88ff88,
    colorHex: '#88ff88',
    description: 'Connection, understanding'
  },
  GHOST: {
    label: 'GHOST',
    color: 0xcc88ff,
    colorHex: '#cc88ff',
    description: 'Memory, patterns, the uncanny'
  }
};

export class VoiceTracker {
  constructor(scene, gameStateManager) {
    this.scene = scene;
    this.gsm = gameStateManager;

    // State
    this.isVisible = true;
    this.currentDominant = null;
    this.bars = {};
    this.labels = {};
    this.glowTweens = {};

    this.create();
    this.setupEventListeners();
  }

  create() {
    const { width, height } = this.scene.cameras.main;

    // Container - bottom right corner
    this.container = this.scene.add.container(width - 150, height - 120);
    this.container.setDepth(1500);
    this.container.setAlpha(0.8);

    // Background panel
    this.background = this.scene.add.rectangle(0, 0, 130, 110, 0x1a1714, 0.7);
    this.background.setStrokeStyle(1, 0x3d3832);
    this.container.add(this.background);

    // Title
    this.title = this.scene.add.text(0, -48, 'VOICES', {
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: '10px',
      color: '#6b6358',
      letterSpacing: 2
    });
    this.title.setOrigin(0.5);
    this.container.add(this.title);

    // Create voice bars
    const voices = ['LOGIC', 'INSTINCT', 'EMPATHY', 'GHOST'];
    const barWidth = 80;
    const barHeight = 8;
    const startY = -30;
    const spacing = 22;

    voices.forEach((voice, index) => {
      const y = startY + (index * spacing);
      const config = VOICE_CONFIG[voice];

      // Label
      const label = this.scene.add.text(-55, y - 2, config.label.charAt(0), {
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: '10px',
        color: config.colorHex
      });
      label.setOrigin(0, 0.5);
      this.container.add(label);
      this.labels[voice] = label;

      // Bar background
      const barBg = this.scene.add.rectangle(-10, y, barWidth, barHeight, 0x2d2a26);
      barBg.setOrigin(0, 0.5);
      this.container.add(barBg);

      // Bar fill
      const barFill = this.scene.add.rectangle(-10, y, 1, barHeight - 2, config.color);
      barFill.setOrigin(0, 0.5);
      this.container.add(barFill);

      // Glow effect (hidden by default)
      const glow = this.scene.add.rectangle(-10, y, barWidth, barHeight, config.color, 0);
      glow.setOrigin(0, 0.5);
      this.container.add(glow);

      this.bars[voice] = {
        background: barBg,
        fill: barFill,
        glow: glow,
        maxWidth: barWidth - 4
      };
    });

    // Initial update
    this.updateBars();
  }

  setupEventListeners() {
    // Listen for voice score changes
    if (this.gsm?.events) {
      this.gsm.events.on('voice:change', () => {
        this.updateBars();
      });

      // Flash on voice-aligned choice
      this.gsm.events.on('voice:choice', (e) => {
        if (e.data?.voice) {
          this.flashVoice(e.data.voice);
        }
      });
    }
  }

  /**
   * Update bar widths based on current voice scores
   */
  updateBars() {
    const voices = this.gsm ? {
      LOGIC: this.gsm.get('voices.LOGIC') || 0,
      INSTINCT: this.gsm.get('voices.INSTINCT') || 0,
      EMPATHY: this.gsm.get('voices.EMPATHY') || 0,
      GHOST: this.gsm.get('voices.GHOST') || 0
    } : { LOGIC: 0, INSTINCT: 0, EMPATHY: 0, GHOST: 0 };

    // Find max for scaling
    const maxScore = Math.max(10, ...Object.values(voices));

    // Find dominant voice
    const sorted = Object.entries(voices).sort((a, b) => b[1] - a[1]);
    const [dominantVoice, dominantScore] = sorted[0];
    const [secondVoice, secondScore] = sorted[1] || [null, 0];

    // Determine if dominance is clear
    const isDominantClear = dominantScore >= 5 && (dominantScore - secondScore) >= 2;

    // Update each bar
    for (const [voice, score] of Object.entries(voices)) {
      const bar = this.bars[voice];
      if (!bar) continue;

      // Calculate width (minimum 1px if any score)
      const width = score > 0 ? Math.max(1, (score / maxScore) * bar.maxWidth) : 0;

      // Animate bar width
      this.scene.tweens.add({
        targets: bar.fill,
        width: width,
        duration: 300,
        ease: 'Power2'
      });

      // Handle dominant glow
      const isDominant = voice === dominantVoice && isDominantClear;

      if (isDominant && !this.glowTweens[voice]) {
        // Start glow pulse
        bar.glow.alpha = 0.3;
        this.glowTweens[voice] = this.scene.tweens.add({
          targets: bar.glow,
          alpha: { from: 0.3, to: 0.1 },
          duration: 1000,
          yoyo: true,
          repeat: -1
        });

        // Brighten label
        this.labels[voice].setAlpha(1);
      } else if (!isDominant && this.glowTweens[voice]) {
        // Stop glow
        this.glowTweens[voice].stop();
        this.glowTweens[voice] = null;
        bar.glow.alpha = 0;
        this.labels[voice].setAlpha(0.7);
      }
    }

    this.currentDominant = isDominantClear ? dominantVoice : null;
  }

  /**
   * Flash a voice bar when a choice aligned with it is selected
   */
  flashVoice(voice) {
    const bar = this.bars[voice];
    if (!bar) return;

    const config = VOICE_CONFIG[voice];

    // Bright flash
    this.scene.tweens.add({
      targets: bar.glow,
      alpha: { from: 0.8, to: 0 },
      duration: 500,
      ease: 'Power2'
    });

    // Scale pulse on label
    this.scene.tweens.add({
      targets: this.labels[voice],
      scaleX: { from: 1.3, to: 1 },
      scaleY: { from: 1.3, to: 1 },
      duration: 300,
      ease: 'Back.out'
    });

    // Temporary full brightness
    this.labels[voice].setAlpha(1);
    this.scene.time.delayedCall(500, () => {
      if (voice !== this.currentDominant) {
        this.labels[voice].setAlpha(0.7);
      }
    });
  }

  /**
   * Show the tracker
   */
  show() {
    if (this.isVisible) return;

    this.isVisible = true;
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0.8,
      duration: 300
    });
  }

  /**
   * Hide the tracker
   */
  hide() {
    if (!this.isVisible) return;

    this.isVisible = false;
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 300
    });
  }

  /**
   * Get dominant voice info for display
   */
  getDominantVoice() {
    const voices = this.gsm ? {
      LOGIC: this.gsm.get('voices.LOGIC') || 0,
      INSTINCT: this.gsm.get('voices.INSTINCT') || 0,
      EMPATHY: this.gsm.get('voices.EMPATHY') || 0,
      GHOST: this.gsm.get('voices.GHOST') || 0
    } : { LOGIC: 0, INSTINCT: 0, EMPATHY: 0, GHOST: 0 };

    const sorted = Object.entries(voices).sort((a, b) => b[1] - a[1]);
    const [topVoice, topScore] = sorted[0];
    const [, secondScore] = sorted[1] || [null, 0];

    let confidence = 'low';
    if (topScore >= 10 && topScore - secondScore >= 3) {
      confidence = 'high';
    } else if (topScore >= 5) {
      confidence = 'medium';
    }

    return {
      voice: topVoice,
      score: topScore,
      confidence,
      config: VOICE_CONFIG[topVoice]
    };
  }

  /**
   * Destroy the tracker
   */
  destroy() {
    // Stop all glow tweens
    for (const tween of Object.values(this.glowTweens)) {
      if (tween) tween.stop();
    }

    this.container.destroy();
  }
}
