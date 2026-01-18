// ASHFALL - Agent Registry
// Central export for all NPC agents

import { MaraAgent } from './MaraAgent.js';
import { JonasAgent } from './JonasAgent.js';
import { RaskAgent } from './RaskAgent.js';
import { EddaAgent } from './EddaAgent.js';
import { KaleAgent } from './KaleAgent.js';

export { AgentBase } from './AgentBase.js';
export { MaraAgent, JonasAgent, RaskAgent, EddaAgent, KaleAgent };

// Map NPC IDs to their agent classes for lazy loading
export const AgentRegistry = {
  leader: () => import('./MaraAgent.js').then(m => new m.MaraAgent()),
  healer: () => import('./JonasAgent.js').then(m => new m.JonasAgent()),
  threat: () => import('./RaskAgent.js').then(m => new m.RaskAgent()),
  keeper: () => import('./EddaAgent.js').then(m => new m.EddaAgent()),
  mirror: () => import('./KaleAgent.js').then(m => new m.KaleAgent()),
};

// Check if an NPC has an agent implementation
export function hasAgent(npcId) {
  return npcId in AgentRegistry;
}

// Create an agent instance for an NPC (async)
export async function createAgent(npcId) {
  if (!hasAgent(npcId)) {
    return null;
  }
  return await AgentRegistry[npcId]();
}

// Synchronous agent creation - creates all agents at once
export function createAgentsSync() {
  return {
    leader: new MaraAgent(),
    healer: new JonasAgent(),
    threat: new RaskAgent(),
    keeper: new EddaAgent(),
    mirror: new KaleAgent()
  };
}
