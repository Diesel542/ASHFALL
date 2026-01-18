// src/dialogue/index.js

/**
 * ASHFALL Dialogue System (OpenAI)
 *
 * Alternative dialogue system using OpenAI's GPT-4.
 * For the Anthropic Claude-based system, see src/systems/AgentRunner.js
 */

export { DialogueEngine } from './DialogueEngine.js';
export { VoiceSystem, VOICE_TEMPLATES, getTemplateReaction } from './VoiceSystem.js';
export { TONE_PRIMER, TONE_CONTEXTS, getTonePrimerWithContext } from './tonePrimer.js';
export { NPC_CODEXES, getCodex, getAllNpcIds } from './npcCodexes.js';
export {
  ARC_GATE_INSTRUCTIONS,
  FORBIDDEN_REVEALS,
  GATE_REQUIREMENTS,
  canUnlockGate,
  getGateInstructions,
  getForbiddenReveals
} from './arcGates.js';
export {
  NPC_RELATIONSHIPS,
  getPerception,
  getWillMention,
  getGossipLine,
  shouldMention
} from './relationships.js';
