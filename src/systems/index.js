// ASHFALL - Core Systems
// The architecture that holds everything together

export { DialogueSystem } from './dialogue.js';
export { ConsequenceTracker } from './consequences.js';
export { SkillSystem } from './skills.js';

// LLM-driven NPC agents
export { AgentRunner } from './AgentRunner.js';
export { VoiceReactor } from './VoiceReactor.js';
export { PlayerProfile } from './PlayerProfile.js';

// Atmospheric and tone systems
export { ToneValidator } from './ToneValidator.js';
export { WeatherSystem } from './WeatherSystem.js';
export { EnvironmentalText } from './EnvironmentalText.js';
export { VoiceTones } from './VoiceTones.js';

// Systems to build:
// - [ ] Combat (avoidable, turn-based, action points)
// - [ ] Inventory (items with weight, both physical and narrative)
// - [ ] Save/Load (full state serialization)
// - [ ] Time (day/night? events that trigger over time?)
