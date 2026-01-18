// src/ui/LocationPanel.js

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
      const npcNames = npcsHere.map((n) => n.charAt(0).toUpperCase() + n.slice(1));
      this.npcsText.setText(`Here: ${npcNames.join(', ')}`);
    } else {
      this.npcsText.setText('No one here.');
    }

    // Update destinations
    if (locationData.connections && locationData.connections.length > 0) {
      const destText = locationData.connections.map((d) => `[${d}]`).join(' ');
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
