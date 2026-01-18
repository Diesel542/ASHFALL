// src/systems/QuestTriggerSystem.js

import { EVENTS } from '../core/EventBus.js';

/**
 * QUEST TRIGGER SYSTEM
 *
 * Monitors game state and spawns quests when conditions are met.
 * Each trigger defines: conditions, quest archetype, context.
 */

export class QuestTriggerSystem {
  constructor(gameStateManager, questSystem) {
    this.gsm = gameStateManager;
    this.questSystem = questSystem;

    // Define all triggers
    this.triggers = this.defineTriggers();

    // Track which triggers have fired
    this.firedTriggers = new Set();

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Check triggers after dialogue
    this.gsm.events.on(EVENTS.DIALOGUE_END, (e) => {
      this.checkDialogueTriggers(e.data?.npc);
    });

    // Check triggers on location change
    this.gsm.events.on(EVENTS.PLAYER_LOCATION_CHANGE, (e) => {
      this.checkLocationTriggers(e.data?.to);
    });

    // Check triggers on tension change
    this.gsm.events.on(EVENTS.TENSION_CHANGE, () => {
      this.checkTensionTriggers();
    });

    // Check triggers on time advance
    this.gsm.events.on(EVENTS.TIME_ADVANCE, () => {
      this.checkTimeTriggers();
    });

    // Check triggers on relationship change
    this.gsm.events.on(EVENTS.NPC_RELATIONSHIP_CHANGE, (e) => {
      this.checkRelationshipTriggers(e.data?.npc);
    });

    // Check triggers on Curie activity
    this.gsm.events.on(EVENTS.CURIE_ACTIVITY_CHANGE, () => {
      this.checkCurieTriggers();
    });
  }

  /**
   * Define all quest triggers
   */
  defineTriggers() {
    return [
      // ═══════════════════════════════════════
      // INTERVENTION QUESTS
      // ═══════════════════════════════════════
      {
        id: 'jonas_intervention_1',
        archetype: 'intervention',
        conditions: {
          npc: 'jonas',
          conversationCount: { min: 3 },
          stress: { min: 60 },
          gate: { min: 1 }
        },
        context: {
          npc: 'jonas',
          scenario: 'refusing_to_help',
          description: 'Jonas is spiraling. He needs someone to reach him.'
        },
        once: true
      },
      {
        id: 'mara_intervention_1',
        archetype: 'intervention',
        conditions: {
          npc: 'mara',
          conversationCount: { min: 4 },
          stress: { min: 70 },
          tension: { min: 50 }
        },
        context: {
          npc: 'mara',
          scenario: 'control_slipping',
          description: 'Mara\'s grip is slipping. The cracks are showing.'
        },
        once: true
      },

      // ═══════════════════════════════════════
      // CONFESSION QUESTS
      // ═══════════════════════════════════════
      {
        id: 'rask_confession_1',
        archetype: 'confession',
        conditions: {
          npc: 'rask',
          relationship: { min: 65 },
          conversationCount: { min: 4 },
          timeOfDay: 'night'
        },
        context: {
          npc: 'rask',
          scenario: 'night_watch',
          description: 'Rask is at the shaft. He\'s never talked about why.'
        },
        once: true
      },
      {
        id: 'edda_confession_1',
        archetype: 'confession',
        conditions: {
          npc: 'edda',
          relationship: { min: 60 },
          gate: { min: 2 },
          flag: 'shaft_mentioned_by_edda'
        },
        context: {
          npc: 'edda',
          scenario: 'the_singing',
          description: 'Edda is ready to speak of what she heard.'
        },
        once: true
      },

      // ═══════════════════════════════════════
      // MEMORY ECHO QUESTS (Curie)
      // ═══════════════════════════════════════
      {
        id: 'memory_echo_1',
        archetype: 'memory_echo',
        conditions: {
          location: 'sealed_shaft',
          curieActivity: { min: 0.4 }
        },
        context: {
          trigger: 'shaft_proximity',
          scenario: 'first_echo',
          description: 'The hum shapes itself. Almost words. Almost memories.'
        },
        once: true
      },
      {
        id: 'memory_echo_kale',
        archetype: 'memory_echo',
        conditions: {
          npc: 'kale',
          curieResonance: { npc: 'kale', min: 0.5 },
          conversationCount: { min: 3 }
        },
        context: {
          npc: 'kale',
          trigger: 'kale_slips',
          scenario: 'borrowed_words',
          description: 'Kale says something that isn\'t his. He doesn\'t notice.'
        },
        once: true
      },

      // ═══════════════════════════════════════
      // SCARCITY DILEMMA QUESTS
      // ═══════════════════════════════════════
      {
        id: 'scarcity_water',
        archetype: 'scarcity_dilemma',
        conditions: {
          day: { min: 3 },
          tension: { min: 40 },
          flag: 'visited_well'
        },
        context: {
          resource: 'water',
          scenario: 'well_failing',
          description: 'The well water is running strange. Mara wants to ration harder.'
        },
        once: true
      },
      {
        id: 'scarcity_medicine',
        archetype: 'scarcity_dilemma',
        conditions: {
          day: { min: 4 },
          flag: 'met_jonas',
          tension: { min: 50 }
        },
        context: {
          resource: 'medicine',
          scenario: 'someone_sick',
          description: 'Someone is sick. The medicine exists. Jonas won\'t touch it.'
        },
        once: true
      },

      // ═══════════════════════════════════════
      // WATCHTOWER QUESTS
      // ═══════════════════════════════════════
      {
        id: 'watchtower_night',
        archetype: 'watchtower',
        conditions: {
          day: { min: 2 },
          timeOfDay: 'night',
          location: 'watchtower'
        },
        context: {
          scenario: 'night_watch',
          description: 'Something moves at the edge of the light. Or doesn\'t.'
        },
        once: true
      },

      // ═══════════════════════════════════════
      // SMALL MERCY QUESTS
      // ═══════════════════════════════════════
      {
        id: 'small_mercy_kale',
        archetype: 'small_mercy',
        conditions: {
          npc: 'kale',
          relationship: { min: 55 },
          conversationCount: { min: 2 }
        },
        context: {
          npc: 'kale',
          scenario: 'identity_crisis',
          description: 'Kale asks who you think he should be. It matters.'
        },
        once: true
      },
      {
        id: 'small_mercy_jonas',
        archetype: 'small_mercy',
        conditions: {
          npc: 'jonas',
          gate: { min: 2 },
          relationship: { min: 60 }
        },
        context: {
          npc: 'jonas',
          scenario: 'small_wound',
          description: 'You have a cut. Nothing serious. But you could ask him.'
        },
        once: true
      },

      // ═══════════════════════════════════════
      // INVESTIGATION QUESTS
      // ═══════════════════════════════════════
      {
        id: 'investigate_shaft',
        archetype: 'investigation',
        conditions: {
          day: { min: 2 },
          flag: 'shaft_mentioned_by_edda',
          flag2: 'first_tremor_felt'
        },
        context: {
          target: 'sealed_shaft',
          scenario: 'what_happened',
          description: 'Everyone avoids the shaft. But someone knows what happened.'
        },
        once: true
      },

      // ═══════════════════════════════════════
      // SHAFT'S SHADOW (Late Game)
      // ═══════════════════════════════════════
      {
        id: 'shaft_calls',
        archetype: 'shaft_shadow',
        conditions: {
          act: { min: 2 },
          curieActivity: { min: 0.6 },
          tension: { min: 65 }
        },
        context: {
          scenario: 'the_call',
          description: 'The shaft isn\'t just sealed. It\'s waiting.'
        },
        once: true
      }
    ];
  }

  // ═══════════════════════════════════════
  // CONDITION CHECKING
  // ═══════════════════════════════════════

  /**
   * Check all conditions for a trigger
   */
  checkConditions(trigger) {
    const c = trigger.conditions;
    const state = this.gsm.state;

    // Already fired?
    if (trigger.once && this.firedTriggers.has(trigger.id)) {
      return false;
    }

    // NPC-specific checks
    if (c.npc) {
      const npc = state.npcs?.[c.npc];
      if (!npc) return false;

      if (c.conversationCount?.min && (npc.conversationCount || 0) < c.conversationCount.min) {
        return false;
      }
      if (c.stress?.min && (npc.stress || 0) < c.stress.min) {
        return false;
      }
      if (c.relationship?.min && (npc.relationship || 50) < c.relationship.min) {
        return false;
      }
      if (c.gate?.min && (npc.currentGate || 0) < c.gate.min) {
        return false;
      }
    }

    // Location check
    if (c.location && state.player?.location !== c.location) {
      return false;
    }

    // Time checks
    if (c.day?.min && (state.time?.day || 1) < c.day.min) {
      return false;
    }
    if (c.timeOfDay && state.time?.timeOfDay !== c.timeOfDay) {
      return false;
    }

    // Narrative checks
    if (c.tension?.min && (state.narrative?.tension || 0) < c.tension.min) {
      return false;
    }
    if (c.act?.min && (state.narrative?.currentAct || 1) < c.act.min) {
      return false;
    }

    // Flag checks
    if (c.flag && !state.flags?.has(c.flag)) {
      return false;
    }
    if (c.flag2 && !state.flags?.has(c.flag2)) {
      return false;
    }

    // Curie checks
    if (c.curieActivity?.min && (state.curie?.activity || 0) < c.curieActivity.min) {
      return false;
    }
    if (c.curieResonance) {
      const resonance = state.curie?.resonance?.[c.curieResonance.npc];
      if (!resonance || resonance < c.curieResonance.min) {
        return false;
      }
    }

    return true;
  }

  /**
   * Fire a trigger - spawn the quest
   */
  fireTrigger(trigger) {
    console.log(`[Quest] Trigger fired: ${trigger.id}`);

    // Mark as fired
    this.firedTriggers.add(trigger.id);

    // Create the quest
    const quest = this.questSystem.generateQuest(trigger.archetype, trigger.context);

    // Initialize quests state if needed
    if (!this.gsm.state.quests) {
      this.gsm.state.quests = { active: [], completed: [] };
    }

    // Add to active quests
    this.gsm.state.quests.active.push({
      id: trigger.id,
      archetype: trigger.archetype,
      context: trigger.context,
      quest: quest,
      startedAt: Date.now(),
      day: this.gsm.get('time.day')
    });

    // Emit event
    this.gsm.events.emit(EVENTS.QUEST_START, {
      triggerId: trigger.id,
      archetype: trigger.archetype,
      context: trigger.context
    });

    // Set flag
    this.gsm.setFlag(`quest_started_${trigger.id}`);

    return quest;
  }

  // ═══════════════════════════════════════
  // TRIGGER CHECKS BY EVENT TYPE
  // ═══════════════════════════════════════

  checkDialogueTriggers(npcId) {
    if (!npcId) return;
    for (const trigger of this.triggers) {
      if (trigger.conditions.npc === npcId) {
        if (this.checkConditions(trigger)) {
          this.fireTrigger(trigger);
        }
      }
    }
  }

  checkLocationTriggers(locationId) {
    if (!locationId) return;
    for (const trigger of this.triggers) {
      if (trigger.conditions.location === locationId) {
        if (this.checkConditions(trigger)) {
          this.fireTrigger(trigger);
        }
      }
    }
  }

  checkTensionTriggers() {
    for (const trigger of this.triggers) {
      if (trigger.conditions.tension) {
        if (this.checkConditions(trigger)) {
          this.fireTrigger(trigger);
        }
      }
    }
  }

  checkTimeTriggers() {
    for (const trigger of this.triggers) {
      if (trigger.conditions.day || trigger.conditions.timeOfDay) {
        if (this.checkConditions(trigger)) {
          this.fireTrigger(trigger);
        }
      }
    }
  }

  checkRelationshipTriggers(npcId) {
    if (!npcId) return;
    for (const trigger of this.triggers) {
      if (trigger.conditions.npc === npcId && trigger.conditions.relationship) {
        if (this.checkConditions(trigger)) {
          this.fireTrigger(trigger);
        }
      }
    }
  }

  checkCurieTriggers() {
    for (const trigger of this.triggers) {
      if (trigger.conditions.curieActivity || trigger.conditions.curieResonance) {
        if (this.checkConditions(trigger)) {
          this.fireTrigger(trigger);
        }
      }
    }
  }

  /**
   * Manual check - run all triggers
   */
  checkAllTriggers() {
    for (const trigger of this.triggers) {
      if (this.checkConditions(trigger)) {
        this.fireTrigger(trigger);
      }
    }
  }

  /**
   * Get active quests
   */
  getActiveQuests() {
    return this.gsm.state.quests?.active || [];
  }

  /**
   * Complete a quest
   */
  completeQuest(questId, outcome) {
    const quests = this.gsm.state.quests;
    if (!quests) return false;

    const index = quests.active.findIndex(q => q.id === questId);

    if (index === -1) return false;

    const quest = quests.active.splice(index, 1)[0];
    quest.completedAt = Date.now();
    quest.outcome = outcome;

    quests.completed.push(quest);

    this.gsm.events.emit(EVENTS.QUEST_COMPLETE, {
      questId,
      outcome,
      archetype: quest.archetype
    });

    this.gsm.setFlag(`quest_completed_${questId}`);

    return true;
  }
}
