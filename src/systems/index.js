// ASHFALL - Core Systems
// The architecture that holds everything together

export { DialogueSystem } from './dialogue.js';
export { ConsequenceTracker } from './consequences.js';
export { SkillSystem } from './skills.js';

// LLM-driven NPC agents
export { AgentRunner } from './AgentRunner.js';
export { VoiceReactor } from './VoiceReactor.js';

// Systems to build:
// - [ ] Combat (avoidable, turn-based, action points)
// - [ ] Inventory (items with weight, both physical and narrative)
// - [ ] Save/Load (full state serialization)
// - [ ] Time (day/night? events that trigger over time?)
