// src/world/PlayerController.js

import Phaser from 'phaser';
import { getGame } from '../core/GameManager.js';

/**
 * PLAYER CONTROLLER
 *
 * Handles player movement and interaction in the settlement.
 */

export class PlayerController {
  constructor(scene, settlement) {
    this.scene = scene;
    this.settlement = settlement;
    this.game = getGame();
    this.enabled = true;
    this.speed = 150;

    this.create();
  }

  create() {
    const { width, height } = this.scene.cameras.main;

    // Player token (simple circle for prototype)
    this.sprite = this.scene.add.circle(width / 2, height / 2, 12, 0xe8dcc8);
    this.sprite.setDepth(100);

    // Movement indicator
    this.targetIndicator = this.scene.add.circle(0, 0, 8, 0x8b4513, 0.5);
    this.targetIndicator.setVisible(false);
    this.targetIndicator.setDepth(99);

    // Input
    this.setupInput();

    // Movement state
    this.isMoving = false;
    this.targetX = this.sprite.x;
    this.targetY = this.sprite.y;

    // Position player at current location
    const currentLocation = this.game.gsm.get('player.location');
    if (currentLocation) {
      const pos = this.settlement.getLocationPosition(currentLocation);
      if (pos) {
        this.setPosition(pos.x, pos.y);
      }
    }
  }

  setupInput() {
    // Click to move
    this.scene.input.on('pointerdown', (pointer) => {
      if (!this.enabled) return;

      // Check if clicking on NPC or location
      const clicked = this.checkClickTarget(pointer.x, pointer.y);

      if (clicked) {
        this.handleClick(clicked);
      } else {
        // Move to position
        this.moveTo(pointer.x, pointer.y);
      }
    });

    // Keyboard shortcuts for locations
    this.setupKeyboardShortcuts();
  }

  setupKeyboardShortcuts() {
    const keys = this.scene.input.keyboard.addKeys({
      one: 'ONE',
      two: 'TWO',
      three: 'THREE',
      four: 'FOUR',
      five: 'FIVE',
      six: 'SIX',
      seven: 'SEVEN',
      eight: 'EIGHT',
      nine: 'NINE'
    });

    const locationShortcuts = [
      'gate',
      'market_square',
      'clinic',
      'watchtower',
      'storehouse',
      'well',
      'perimeter_path',
      'player_quarters',
      'sealed_shaft'
    ];

    Object.values(keys).forEach((key, index) => {
      key.on('down', () => {
        if (this.enabled && locationShortcuts[index]) {
          this.goToLocation(locationShortcuts[index]);
        }
      });
    });
  }

  checkClickTarget(x, y) {
    // Check NPCs
    for (const [npcId, npcSprite] of this.settlement.npcSprites) {
      if (npcSprite.getBounds().contains(x, y)) {
        return { type: 'npc', id: npcId };
      }
    }

    // Check location markers
    for (const [locId, locMarker] of this.settlement.locationMarkers) {
      if (locMarker.getBounds().contains(x, y)) {
        return { type: 'location', id: locId };
      }
    }

    return null;
  }

  handleClick(target) {
    if (target.type === 'npc') {
      // Move toward NPC then interact
      const npcSprite = this.settlement.npcSprites.get(target.id);
      this.moveTo(npcSprite.x, npcSprite.y, () => {
        this.scene.interactWithNpc(target.id);
      });
    } else if (target.type === 'location') {
      this.goToLocation(target.id);
    }
  }

  moveTo(x, y, onComplete = null) {
    this.targetX = x;
    this.targetY = y;
    this.isMoving = true;
    this.onMoveComplete = onComplete;

    // Show target indicator
    this.targetIndicator.setPosition(x, y);
    this.targetIndicator.setVisible(true);
  }

  goToLocation(locationId) {
    const locationData = this.settlement.getLocationData(locationId);
    if (!locationData) return;

    // Move to location center
    const pos = this.settlement.getLocationPosition(locationId);
    if (!pos) return;

    this.moveTo(pos.x, pos.y, () => {
      this.game.gsm.movePlayer(locationId);
    });
  }

  update(time, delta) {
    if (!this.enabled || !this.isMoving) return;

    // Move toward target
    const dx = this.targetX - this.sprite.x;
    const dy = this.targetY - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      // Arrived
      this.sprite.setPosition(this.targetX, this.targetY);
      this.isMoving = false;
      this.targetIndicator.setVisible(false);

      if (this.onMoveComplete) {
        this.onMoveComplete();
        this.onMoveComplete = null;
      }
    } else {
      // Move toward target
      const moveX = (dx / distance) * this.speed * (delta / 1000);
      const moveY = (dy / distance) * this.speed * (delta / 1000);

      this.sprite.x += moveX;
      this.sprite.y += moveY;
    }
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
    this.isMoving = false;
  }

  setPosition(x, y) {
    this.sprite.setPosition(x, y);
    this.targetX = x;
    this.targetY = y;
  }
}
