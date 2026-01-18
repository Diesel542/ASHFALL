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

// Location and navigation systems
export { LocationContext } from './LocationContext.js';
export { NavigationalSemantics } from './NavigationalSemantics.js';

// Curie-Δ systems (the thing beneath)
export { HumSystem } from './HumSystem.js';
export { TremorSystem } from './TremorSystem.js';
export { GhostOverride } from './GhostOverride.js';
export { NpcResonance } from './NpcResonance.js';
export { EndgameCalculator } from './EndgameCalculator.js';

// Time and quest systems
export { TimeSystem } from './TimeSystem.js';
export { QuestSystem } from './QuestSystem.js';
export { QuestTriggerSystem } from './QuestTriggerSystem.js';

// Systems to build:
// - [ ] Combat (avoidable, turn-based, action points)
// - [ ] Inventory (items with weight, both physical and narrative)
// - [x] Save/Load (full state serialization)
// - [x] Time (day/night, events that trigger over time)
