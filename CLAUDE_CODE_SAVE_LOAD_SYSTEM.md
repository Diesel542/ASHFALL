# ASHFALL: Save/Load System
## Persistence Implementation

### Overview

A straightforward save/load system using browser localStorage. Supports auto-save, manual saves, and multiple slots.

**Scope:** Small. This is ~200 lines of actual code.

---

## 1. Save Data Structure

```javascript
// What gets saved
const saveData = {
  // Meta
  meta: {
    version: '0.1.0',
    slot: 'manual_1',
    savedAt: 1705600000000,
    playTime: 3600,        // seconds
    screenshot: null       // optional base64 thumbnail
  },

  // Time
  time: {
    day: 3,
    timeOfDay: 'dusk',
    hour: 18
  },

  // Narrative
  narrative: {
    currentAct: 2,
    actProgress: 45,
    tension: 55,
    endingPath: 'empathy',
    actTriggers: { act1to2: true, act2to3: false },
    pointOfNoReturn: false
  },

  // Player
  player: {
    location: 'clinic',
    voiceScores: { LOGIC: 12, INSTINCT: 8, EMPATHY: 18, GHOST: 5 },
    initialTone: 'humble',
    inventory: []
  },

  // NPCs
  npcs: {
    mara: { relationship: 45, stress: 50, currentGate: 2, met: true, conversationCount: 8 },
    jonas: { relationship: 70, stress: 40, currentGate: 2, met: true, conversationCount: 12 },
    // ... etc
  },

  // Curie
  curie: {
    coherence: 0.5,
    activity: 0.4,
    playerAttunement: 0.3,
    resonance: { mara: 0.2, jonas: 0.3, rask: 0.2, edda: 0.5, kale: 0.6 },
    manifestations: 4
  },

  // Environment
  environment: {
    weather: 'wind',
    humIntensity: 0.5,
    tremorCount: 3
  },

  // Flags (converted from Set to Array)
  flags: ['opening_complete', 'met_all_npcs', 'first_tremor_felt', 'shaft_mentioned_by_edda'],

  // Quests
  quests: {
    active: [],
    completed: ['intervention_jonas_1'],
    failed: []
  }
};
```

---

## 2. SaveManager Class

```javascript
// src/systems/SaveManager.js

/**
 * SAVE MANAGER
 * 
 * Handles all save/load operations.
 * Uses localStorage with JSON serialization.
 */

export class SaveManager {
  constructor(gameStateManager) {
    this.gsm = gameStateManager;
    this.storagePrefix = 'ashfall_';
    this.version = '0.1.0';
    this.maxSlots = 5;
    
    // Auto-save interval (5 minutes)
    this.autoSaveInterval = 5 * 60 * 1000;
    this.autoSaveTimer = null;
  }

  // ═══════════════════════════════════════
  // SAVE OPERATIONS
  // ═══════════════════════════════════════

  /**
   * Save to a specific slot
   */
  save(slot = 'manual_1') {
    try {
      const saveData = this.gsm.exportState();
      
      // Add save-specific meta
      saveData.meta = {
        ...saveData.meta,
        version: this.version,
        slot: slot,
        savedAt: Date.now(),
        playTime: this.calculatePlayTime()
      };

      // Serialize and store
      const serialized = JSON.stringify(saveData);
      localStorage.setItem(this.storagePrefix + slot, serialized);

      // Update save index
      this.updateSaveIndex(slot);

      console.log(`Game saved to slot: ${slot}`);
      return { success: true, slot };

    } catch (error) {
      console.error('Save failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Auto-save (silent, to dedicated slot)
   */
  autoSave() {
    return this.save('autosave');
  }

  /**
   * Quick save (to quick slot)
   */
  quickSave() {
    return this.save('quicksave');
  }

  // ═══════════════════════════════════════
  // LOAD OPERATIONS
  // ═══════════════════════════════════════

  /**
   * Load from a specific slot
   */
  load(slot) {
    try {
      const serialized = localStorage.getItem(this.storagePrefix + slot);
      
      if (!serialized) {
        return { success: false, error: 'Save not found' };
      }

      const saveData = JSON.parse(serialized);

      // Version check
      if (!this.isCompatible(saveData.meta?.version)) {
        return { success: false, error: 'Incompatible save version' };
      }

      // Restore state
      this.gsm.importState(saveData);

      console.log(`Game loaded from slot: ${slot}`);
      return { success: true, slot, data: saveData };

    } catch (error) {
      console.error('Load failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Quick load (from quick slot)
   */
  quickLoad() {
    return this.load('quicksave');
  }

  /**
   * Load auto-save
   */
  loadAutoSave() {
    return this.load('autosave');
  }

  // ═══════════════════════════════════════
  // SLOT MANAGEMENT
  // ═══════════════════════════════════════

  /**
   * Get all save slots with metadata
   */
  getSaveSlots() {
    const slots = [];
    const slotNames = ['autosave', 'quicksave', 'manual_1', 'manual_2', 'manual_3'];

    for (const slot of slotNames) {
      const data = this.getSaveInfo(slot);
      slots.push({
        slot,
        ...data
      });
    }

    return slots;
  }

  /**
   * Get info about a specific save slot
   */
  getSaveInfo(slot) {
    try {
      const serialized = localStorage.getItem(this.storagePrefix + slot);
      
      if (!serialized) {
        return { empty: true };
      }

      const saveData = JSON.parse(serialized);
      
      return {
        empty: false,
        savedAt: saveData.meta?.savedAt,
        playTime: saveData.meta?.playTime,
        day: saveData.time?.day,
        act: saveData.narrative?.currentAct,
        location: saveData.player?.location,
        tension: saveData.narrative?.tension
      };

    } catch {
      return { empty: true, corrupted: true };
    }
  }

  /**
   * Delete a save slot
   */
  deleteSave(slot) {
    localStorage.removeItem(this.storagePrefix + slot);
    this.updateSaveIndex(slot, true);
    return { success: true };
  }

  /**
   * Check if a slot has a save
   */
  hasSave(slot) {
    return localStorage.getItem(this.storagePrefix + slot) !== null;
  }

  /**
   * Check if any save exists
   */
  hasAnySave() {
    return this.getSaveSlots().some(s => !s.empty);
  }

  // ═══════════════════════════════════════
  // AUTO-SAVE MANAGEMENT
  // ═══════════════════════════════════════

  /**
   * Start auto-save timer
   */
  startAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(() => {
      this.autoSave();
    }, this.autoSaveInterval);

    console.log('Auto-save enabled');
  }

  /**
   * Stop auto-save timer
   */
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  // ═══════════════════════════════════════
  // UTILITY
  // ═══════════════════════════════════════

  /**
   * Calculate total play time
   */
  calculatePlayTime() {
    const startedAt = this.gsm.get('meta.startedAt') || Date.now();
    const previousPlayTime = this.gsm.get('meta.playTime') || 0;
    return previousPlayTime + Math.floor((Date.now() - startedAt) / 1000);
  }

  /**
   * Check save version compatibility
   */
  isCompatible(saveVersion) {
    if (!saveVersion) return false;
    
    // For now, exact match required
    // Could implement migration later
    const [saveMajor] = saveVersion.split('.');
    const [currentMajor] = this.version.split('.');
    
    return saveMajor === currentMajor;
  }

  /**
   * Update the save index (for Continue button)
   */
  updateSaveIndex(slot, removed = false) {
    let index = JSON.parse(localStorage.getItem(this.storagePrefix + 'index') || '{}');
    
    if (removed) {
      delete index[slot];
    } else {
      index[slot] = Date.now();
    }

    localStorage.setItem(this.storagePrefix + 'index', JSON.stringify(index));
  }

  /**
   * Get the most recent save (for Continue)
   */
  getMostRecentSave() {
    const index = JSON.parse(localStorage.getItem(this.storagePrefix + 'index') || '{}');
    
    let mostRecent = null;
    let mostRecentTime = 0;

    for (const [slot, time] of Object.entries(index)) {
      if (time > mostRecentTime && this.hasSave(slot)) {
        mostRecent = slot;
        mostRecentTime = time;
      }
    }

    return mostRecent;
  }

  /**
   * Format play time for display
   */
  formatPlayTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Format save date for display
   */
  formatSaveDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}
```

---

## 3. Save/Load UI

```javascript
// src/ui/SaveLoadMenu.js

import { UI_COLORS, UI_FONTS, UI_TIMING } from './UIConstants.js';

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
      const y = startY + (index * slotHeight);
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
      const dateText = this.scene.add.text(170, 0, this.saveManager.formatSaveDate(slotData.savedAt), {
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: '10px',
        color: UI_COLORS.textMuted
      });
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
    // Confirm if overwriting
    const existing = this.saveManager.hasSave(slot);
    
    if (existing && slot !== 'autosave' && slot !== 'quicksave') {
      // Simple confirmation - in production, use a proper dialog
      if (!confirm('Overwrite existing save?')) {
        return;
      }
    }

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
```

---

## 4. Integration

```javascript
// In GameManager.js - add SaveManager

import { SaveManager } from '../systems/SaveManager.js';

export class GameManager {
  constructor() {
    // ... existing code ...
    
    // Add save manager
    this.save = new SaveManager(this.gsm);
  }

  // Convenience methods
  saveGame(slot) {
    return this.save.save(slot);
  }

  loadGame(slot) {
    const result = this.save.load(slot);
    if (result.success) {
      // Reinitialize systems with loaded state
      this.reinitializeSystems();
    }
    return result;
  }

  quickSave() {
    return this.save.quickSave();
  }

  quickLoad() {
    return this.save.quickLoad();
  }

  startAutoSave() {
    this.save.startAutoSave();
  }

  reinitializeSystems() {
    // Reset dialogue histories
    this.dialogue.clearAllHistories();
    
    // Notify systems of state change
    this.gsm.events.emit('game:loaded');
  }
}
```

```javascript
// In SettlementScene.js - add keyboard shortcuts

create() {
  // ... existing code ...

  // Save/Load keyboard shortcuts
  this.input.keyboard.on('keydown-F5', () => {
    Game.quickSave();
    this.showNotification('Quick Saved');
  });

  this.input.keyboard.on('keydown-F9', () => {
    Game.quickLoad();
  });

  this.input.keyboard.on('keydown-ESC', () => {
    this.saveLoadMenu.show('save');
  });

  // Create save/load menu
  this.saveLoadMenu = new SaveLoadMenu(this, Game.save);

  // Handle load event
  this.events.on('game:loaded', () => {
    // Restart scene with new state
    this.scene.restart();
  });

  // Start auto-save
  Game.startAutoSave();
}
```

---

## 5. Main Menu Integration

```javascript
// For a title screen with Continue option

const hasSave = Game.save.hasAnySave();
const mostRecent = Game.save.getMostRecentSave();

if (hasSave && mostRecent) {
  // Show "Continue" button
  continueButton.on('pointerdown', () => {
    Game.loadGame(mostRecent);
    this.scene.start('SettlementScene');
  });
}
```

---

## 6. What Gets Preserved

| Data | Saved | Notes |
|------|-------|-------|
| Day/Time | ✅ | Full time state |
| Player Location | ✅ | Current position |
| Voice Scores | ✅ | All four voices |
| NPC Relationships | ✅ | All five NPCs |
| NPC Stress | ✅ | All five NPCs |
| Arc Gates | ✅ | Progression locked |
| Tension | ✅ | Global narrative |
| Curie State | ✅ | Activity, coherence |
| Flags | ✅ | All story triggers |
| Quests | ✅ | Active, completed, failed |
| Act Progress | ✅ | Which act, progress |
| Dialogue History | ❌ | Regenerated by LLM |
| UI State | ❌ | Rebuilt on load |

---

## Summary

| Feature | Implementation |
|---------|---------------|
| **Save Slots** | 5 total (auto, quick, 3 manual) |
| **Auto-Save** | Every 5 minutes |
| **Quick Save/Load** | F5 / F9 |
| **Storage** | localStorage |
| **Compatibility** | Version checking |
| **Continue** | Most recent save |

**Total new code:** ~300 lines

**Keyboard shortcuts:**
- `F5` — Quick Save
- `F9` — Quick Load  
- `ESC` — Open Save/Load Menu

---

*"Some things stay buried. Others, we choose to preserve."*

*— Progress, persisted*
