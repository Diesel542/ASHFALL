// src/ui/SaveLoadMenu.js

import { UI_COLORS, UI_FONTS } from './UIConstants.js';

/**
 * SAVE/LOAD MENU
 *
 * Simple menu for save and load operations.
 */

export class SaveLoadMenu {
  constructor(scene, saveManager) {
    this.scene = scene;
    this.saveManager = saveManager;
    this.isVisible = false;
    this.mode = 'save'; // 'save' or 'load'

    this.create();
  }

  create() {
    const { width, height } = this.scene.cameras.main;

    // Container
    this.container = this.scene.add.container(width / 2, height / 2);
    this.container.setDepth(2000);
    this.container.setAlpha(0);
    this.container.setVisible(false);

    // Background overlay
    this.overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    this.container.add(this.overlay);

    // Panel
    this.panel = this.scene.add.rectangle(0, 0, 400, 350, UI_COLORS.bgDark);
    this.panel.setStrokeStyle(2, UI_COLORS.accentRust);
    this.container.add(this.panel);

    // Title
    this.title = this.scene.add.text(0, -140, 'SAVE GAME', {
      fontFamily: 'Oswald, sans-serif',
      fontSize: '24px',
      color: UI_COLORS.textPrimary,
      letterSpacing: 3
    });
    this.title.setOrigin(0.5);
    this.container.add(this.title);

    // Slot container
    this.slotContainer = this.scene.add.container(0, 0);
    this.container.add(this.slotContainer);

    // Close button
    this.closeButton = this.createButton(0, 140, 'CLOSE', () => this.hide());
    this.container.add(this.closeButton);

    // Keyboard
    this.scene.input.keyboard.on('keydown-ESC', () => {
      if (this.isVisible) this.hide();
    });
  }

  /**
   * Show the menu in save or load mode
   */
  show(mode = 'save') {
    this.mode = mode;
    this.title.setText(mode === 'save' ? 'SAVE GAME' : 'LOAD GAME');

    this.refreshSlots();

    this.container.setVisible(true);
    this.isVisible = true;

    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 200
    });
  }

  /**
   * Hide the menu
   */
  hide() {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 150,
      onComplete: () => {
        this.container.setVisible(false);
        this.isVisible = false;
      }
    });
  }

  /**
   * Refresh the slot display
   */
  refreshSlots() {
    // Clear existing slots
    this.slotContainer.removeAll(true);

    const slots = this.saveManager.getSaveSlots();
    const startY = -80;
    const slotHeight = 50;

    slots.forEach((slotData, index) => {
      const y = startY + index * slotHeight;
      const slotUI = this.createSlotUI(slotData, y);
      this.slotContainer.add(slotUI);
    });
  }

  /**
   * Create UI for a single save slot
   */
  createSlotUI(slotData, y) {
    const container = this.scene.add.container(0, y);

    // Background
    const bg = this.scene.add.rectangle(0, 0, 360, 44, UI_COLORS.bgMedium, 0.5);
    bg.setInteractive({ useHandCursor: true });
    container.add(bg);

    // Slot name
    const slotName = this.getSlotDisplayName(slotData.slot);
    const nameText = this.scene.add.text(-170, -8, slotName, {
      fontFamily: 'Oswald, sans-serif',
      fontSize: '14px',
      color: UI_COLORS.textPrimary
    });
    container.add(nameText);

    if (slotData.empty) {
      // Empty slot
      const emptyText = this.scene.add.text(-170, 8, 'Empty', {
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: '11px',
        color: UI_COLORS.textMuted,
        fontStyle: 'italic'
      });
      container.add(emptyText);

      // Only allow save to empty slots
      if (this.mode === 'save') {
        this.setupSlotInteraction(bg, container, slotData.slot);
      } else {
        bg.disableInteractive();
        bg.setAlpha(0.3);
      }
    } else {
      // Filled slot
      const info = `Day ${slotData.day} · Act ${slotData.act} · ${this.saveManager.formatPlayTime(slotData.playTime)}`;
      const infoText = this.scene.add.text(-170, 8, info, {
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: '11px',
        color: UI_COLORS.textSecondary
      });
      container.add(infoText);

      // Date
      const dateText = this.scene.add.text(
        170,
        0,
        this.saveManager.formatSaveDate(slotData.savedAt),
        {
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: '10px',
          color: UI_COLORS.textMuted
        }
      );
      dateText.setOrigin(1, 0.5);
      container.add(dateText);

      this.setupSlotInteraction(bg, container, slotData.slot);
    }

    return container;
  }

  /**
   * Setup hover and click for slot
   */
  setupSlotInteraction(bg, container, slot) {
    bg.on('pointerover', () => {
      bg.setFillStyle(UI_COLORS.bgMedium, 0.8);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(UI_COLORS.bgMedium, 0.5);
    });

    bg.on('pointerdown', () => {
      if (this.mode === 'save') {
        this.onSaveSlot(slot);
      } else {
        this.onLoadSlot(slot);
      }
    });
  }

  /**
   * Handle save to slot
   */
  onSaveSlot(slot) {
    // For overwrite, just proceed (no confirm dialog in game)
    const result = this.saveManager.save(slot);

    if (result.success) {
      this.showMessage('Game Saved');
      this.refreshSlots();
    } else {
      this.showMessage('Save Failed', true);
    }
  }

  /**
   * Handle load from slot
   */
  onLoadSlot(slot) {
    const result = this.saveManager.load(slot);

    if (result.success) {
      this.hide();
      // Trigger scene reload
      this.scene.events.emit('game:loaded', result);
    } else {
      this.showMessage(result.error || 'Load Failed', true);
    }
  }

  /**
   * Show a temporary message
   */
  showMessage(text, isError = false) {
    const msg = this.scene.add.text(0, -160, text, {
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: '12px',
      color: isError ? '#ff6666' : '#88ff88'
    });
    msg.setOrigin(0.5);
    this.container.add(msg);

    this.scene.tweens.add({
      targets: msg,
      alpha: 0,
      y: -180,
      duration: 1500,
      delay: 500,
      onComplete: () => msg.destroy()
    });
  }

  /**
   * Get display name for slot
   */
  getSlotDisplayName(slot) {
    const names = {
      autosave: 'Auto-Save',
      quicksave: 'Quick Save',
      manual_1: 'Save Slot 1',
      manual_2: 'Save Slot 2',
      manual_3: 'Save Slot 3'
    };
    return names[slot] || slot;
  }

  /**
   * Create a button
   */
  createButton(x, y, text, onClick) {
    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.rectangle(0, 0, 120, 32, UI_COLORS.bgMedium);
    bg.setInteractive({ useHandCursor: true });
    container.add(bg);

    const label = this.scene.add.text(0, 0, text, {
      fontFamily: 'Oswald, sans-serif',
      fontSize: '14px',
      color: UI_COLORS.textPrimary
    });
    label.setOrigin(0.5);
    container.add(label);

    bg.on('pointerover', () => bg.setFillStyle(UI_COLORS.accentRust, 0.8));
    bg.on('pointerout', () => bg.setFillStyle(UI_COLORS.bgMedium, 1));
    bg.on('pointerdown', onClick);

    return container;
  }
}
