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
    return this.getSaveSlots().some((s) => !s.empty);
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
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    );
  }
}
