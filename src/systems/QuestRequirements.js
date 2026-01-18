// src/systems/QuestRequirements.js

/**
 * QUEST REQUIREMENTS
 *
 * Ensures quest requirements are met before a quest can begin.
 * Acts as a precondition checker for the quest system.
 */

export const QUEST_REQUIREMENTS = {

  // What all quests must do
  mustDo: [
    'Advance NPC arcs OR internal voice arcs',
    'Deepen tension OR reveal fractures',
    'Reflect scarcity, guilt, memory, or confession',
    'Move player toward an ending path'
  ],

  // Archetype-specific requirements
  archetypeRequirements: {
    intervention: {
      requires: ['npc_stress_visible', 'contradiction_exposed'],
      rewards: ['relationship_shift', 'npc_arc_progress'],
      risks: ['relationship_damage', 'escalation']
    },
    scarcity_dilemma: {
      requires: ['resource_shortage', 'competing_needs'],
      rewards: ['moral_weight', 'alignment_clarity'],
      risks: ['multiple_relationships_damaged']
    },
    confession: {
      requires: ['npc_trust_threshold', 'appropriate_gate'],
      rewards: ['gate_progress', 'deep_trust'],
      risks: ['premature_collapse', 'secret_leakage']
    },
    watchtower: {
      requires: ['assignment_reason', 'atmospheric_conditions'],
      rewards: ['curie_awareness', 'npc_bonding'],
      risks: ['false_alarms', 'missed_signals']
    },
    memory_echo: {
      requires: ['curie_activity_threshold', 'vulnerable_npc'],
      rewards: ['mystery_deepening', 'ghost_connection'],
      risks: ['player_confusion', 'npc_destabilization']
    },
    small_mercy: {
      requires: ['opportunity_present', 'resource_cost_acceptable'],
      rewards: ['trust_gain', 'tone_balance'],
      risks: ['scarcity_impact', 'being_noticed']
    },
    investigation: {
      requires: ['clue_exists', 'player_curiosity'],
      rewards: ['awareness_increase', 'tension_building'],
      risks: ['false_conclusions', 'npc_suspicion']
    },
    shafts_shadow: {
      requires: ['act_appropriate', 'curie_active'],
      rewards: ['act_progression', 'revelation_proximity'],
      risks: ['premature_opening', 'npc_breakdown']
    }
  },

  // Check if quest meets requirements
  check(archetype, context, gameState) {
    const reqs = this.archetypeRequirements[archetype];
    if (!reqs) return { met: true, missing: [] };

    const missing = [];

    for (const req of reqs.requires) {
      if (!this.checkRequirement(req, context, gameState)) {
        missing.push(req);
      }
    }

    return {
      met: missing.length === 0,
      missing: missing
    };
  },

  checkRequirement(requirement, context, gameState) {
    const checks = {
      'npc_stress_visible': () => context.npc && (gameState.npcStress?.[context.npc] || 30) > 50,
      'contradiction_exposed': () => true, // Story always has contradictions
      'resource_shortage': () => {
        if (!gameState.resources) return true;
        return Object.values(gameState.resources).some(v => v < 50);
      },
      'competing_needs': () => true, // Always true in Ashfall
      'npc_trust_threshold': () => {
        const relationship = gameState.relationships?.[context.npc] || 50;
        return relationship > 40;
      },
      'appropriate_gate': () => {
        const currentGate = gameState.npcGates?.[context.npc] || 0;
        const requiredGate = context.requiredGate || 0;
        return currentGate >= requiredGate;
      },
      'assignment_reason': () => context.initiator && context.task,
      'atmospheric_conditions': () => true,
      'curie_activity_threshold': () => (gameState.curieActivity || 0.2) > 0.3,
      'vulnerable_npc': () => context.npc !== undefined,
      'opportunity_present': () => context.action !== undefined,
      'resource_cost_acceptable': () => true, // Small mercies have minimal cost
      'clue_exists': () => context.subject !== undefined,
      'player_curiosity': () => true, // Assumed
      'act_appropriate': () => (gameState.currentAct || 1) >= 2,
      'curie_active': () => (gameState.curieActivity || 0.2) > 0.4
    };

    const check = checks[requirement];
    return check ? check() : true;
  },

  // Get requirements description for an archetype
  getRequirementsDescription(archetypeId) {
    const reqs = this.archetypeRequirements[archetypeId];
    if (!reqs) return null;

    return {
      archetype: archetypeId,
      requires: reqs.requires.map(r => this.getRequirementDescription(r)),
      rewards: reqs.rewards,
      risks: reqs.risks
    };
  },

  getRequirementDescription(requirementId) {
    const descriptions = {
      'npc_stress_visible': 'NPC must be visibly stressed (stress > 50)',
      'contradiction_exposed': 'NPC internal contradiction must be present',
      'resource_shortage': 'At least one resource must be below 50%',
      'competing_needs': 'Multiple parties need the same resource',
      'npc_trust_threshold': 'Relationship with NPC must be above 40',
      'appropriate_gate': 'NPC arc gate must be at required level',
      'assignment_reason': 'Quest must have an initiator and task',
      'atmospheric_conditions': 'Environmental conditions must support quest',
      'curie_activity_threshold': 'Curie-Δ activity must be above 30%',
      'vulnerable_npc': 'An NPC must be available for the quest',
      'opportunity_present': 'An action opportunity must exist',
      'resource_cost_acceptable': 'Resource cost must be within acceptable limits',
      'clue_exists': 'A clue or subject must be defined',
      'player_curiosity': 'Player must have reason to investigate',
      'act_appropriate': 'Must be in Act 2 or later',
      'curie_active': 'Curie-Δ activity must be above 40%'
    };

    return {
      id: requirementId,
      description: descriptions[requirementId] || 'Unknown requirement'
    };
  },

  // Get all quests available given current game state
  getAvailableQuests(gameState, contexts) {
    const available = [];

    for (const [archetypeId, reqs] of Object.entries(this.archetypeRequirements)) {
      // Find a valid context for this archetype
      const validContext = contexts.find(ctx => {
        const check = this.check(archetypeId, ctx, gameState);
        return check.met;
      });

      if (validContext) {
        available.push({
          archetypeId,
          context: validContext,
          rewards: reqs.rewards,
          risks: reqs.risks
        });
      }
    }

    return available;
  },

  // Generate potential contexts for quest generation
  generatePotentialContexts(gameState) {
    const contexts = [];

    // NPC-based contexts
    const npcs = ['mara', 'jonas', 'rask', 'edda', 'kale'];
    for (const npc of npcs) {
      contexts.push({
        npc,
        stressLevel: gameState.npcStress?.[npc] || 30,
        gateLevel: gameState.npcGates?.[npc] || 0
      });
    }

    // Resource-based contexts
    const resources = ['food', 'medicine', 'water', 'tools', 'warmth'];
    for (const resource of resources) {
      contexts.push({
        resource,
        severity: gameState.resources?.[resource] < 30 ? 'critical' : 'moderate'
      });
    }

    // Location-based contexts
    const locations = ['well', 'shaft_area', 'storehouse', 'watchtower', 'clinic'];
    for (const location of locations) {
      contexts.push({
        location,
        subject: 'anomaly'
      });
    }

    return contexts;
  }
};

// Export as class for consistency with other systems
export class QuestRequirementsChecker {
  constructor() {
    this.requirements = QUEST_REQUIREMENTS;
  }

  check(archetype, context, gameState) {
    return this.requirements.check(archetype, context, gameState);
  }

  getAvailableQuests(gameState, contexts) {
    return this.requirements.getAvailableQuests(gameState, contexts);
  }

  generatePotentialContexts(gameState) {
    return this.requirements.generatePotentialContexts(gameState);
  }

  getRequirementsDescription(archetypeId) {
    return this.requirements.getRequirementsDescription(archetypeId);
  }
}
