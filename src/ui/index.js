// src/ui/index.js

/**
 * ASHFALL UI SYSTEM
 *
 * Complete Phaser 3 UI implementation for dialogue,
 * voices, choices, HUD, and transitions.
 */

// Constants
export { UI_COLORS, UI_FONTS, UI_DIMENSIONS, UI_TIMING } from './UIConstants.js';

// Core Components
export { DialogueBox } from './DialogueBox.js';
export { VoicePanel } from './VoicePanel.js';
export { ChoicePanel } from './ChoicePanel.js';
export { HUD } from './HUD.js';
export { LocationPanel } from './LocationPanel.js';

// Manager and Effects
export { UIManager } from './UIManager.js';
export { Transitions } from './Transitions.js';

// High-level Controller
export { DialogueController } from './DialogueController.js';

// Save/Load
export { SaveLoadMenu } from './SaveLoadMenu.js';
