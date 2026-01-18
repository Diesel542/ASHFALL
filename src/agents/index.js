// ASHFALL - Agent Registry
// Central export for all NPC agents

export { AgentBase } from './AgentBase.js';
export { EddaAgent } from './EddaAgent.js';

// Map NPC IDs to their agent classes
// 'keeper' is Edda's ID in the game
export const AgentRegistry = {
  keeper: () => import('./EddaAgent.js').then(m => new m.EddaAgent()),
  // Future agents:
  // leader: () => import('./MaraAgent.js').then(m => new m.MaraAgent()),
  // healer: () => import('./JonasAgent.js').then(m => new m.JonasAgent()),
  // threat: () => import('./RaskAgent.js').then(m => new m.RaskAgent()),
  // mirror: () => import('./KaleAgent.js').then(m => new m.KaleAgent()),
};

// Check if an NPC has an agent implementation
export function hasAgent(npcId) {
  return npcId in AgentRegistry;
}

// Create an agent instance for an NPC
export async function createAgent(npcId) {
  if (!hasAgent(npcId)) {
    return null;
  }
  return await AgentRegistry[npcId]();
}
