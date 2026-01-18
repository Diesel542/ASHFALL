// src/ui/HUD.js

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
