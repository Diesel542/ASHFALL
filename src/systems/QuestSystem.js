// src/systems/QuestSystem.js

import { QuestPromptGenerator } from './QuestPromptGenerator.js';

/**
 * QUEST SYSTEM
 *
 * Manages quest generation and tracking.
 * Works with QuestTriggerSystem to spawn quests when conditions are met.
 */

export class QuestSystem {
  constructor() {
    this.promptGenerator = new QuestPromptGenerator();
  }

  /**
   * Generate a quest from archetype and context
   */
  generateQuest(archetype, context) {
    // Create quest object
    const quest = {
      id: `quest_${archetype}_${Date.now()}`,
      archetype,
      context,
      status: 'active',
      stages: this.generateStages(archetype, context),
      currentStage: 0,
      outcomes: this.getOutcomeOptions(archetype),
      createdAt: Date.now()
    };

    return quest;
  }

  /**
   * Generate quest stages based on archetype
   */
  generateStages(archetype, context) {
    const stageTemplates = {
      intervention: [
        { id: 'observe', description: 'Observe the situation' },
        { id: 'approach', description: 'Approach and engage' },
        { id: 'intervene', description: 'Make your choice' }
      ],
      confession: [
        { id: 'listen', description: 'Listen to what they have to say' },
        { id: 'respond', description: 'Respond to the confession' }
      ],
      memory_echo: [
        { id: 'experience', description: 'Experience the echo' },
        { id: 'interpret', description: 'Make sense of it' }
      ],
      scarcity_dilemma: [
        { id: 'assess', description: 'Assess the situation' },
        { id: 'decide', description: 'Make the allocation' }
      ],
      watchtower: [
        { id: 'watch', description: 'Keep watch' },
        { id: 'react', description: 'React to what you see' }
      ],
      small_mercy: [
        { id: 'opportunity', description: 'The moment presents itself' },
        { id: 'act', description: 'Act or don\'t' }
      ],
      investigation: [
        { id: 'gather', description: 'Gather information' },
        { id: 'confront', description: 'Confront the truth' }
      ],
      shaft_shadow: [
        { id: 'hear', description: 'Hear the call' },
        { id: 'decide', description: 'Answer or resist' }
      ]
    };

    return stageTemplates[archetype] || [
      { id: 'begin', description: 'Begin' },
      { id: 'resolve', description: 'Resolve' }
    ];
  }

  /**
   * Get outcome options for archetype
   */
  getOutcomeOptions(archetype) {
    const outcomeTemplates = {
      intervention: ['helped', 'made_worse', 'walked_away'],
      confession: ['accepted', 'rejected', 'complicated'],
      memory_echo: ['understood', 'confused', 'shaken'],
      scarcity_dilemma: ['fair', 'pragmatic', 'cruel'],
      watchtower: ['vigilant', 'missed', 'saw_too_much'],
      small_mercy: ['kind', 'practical', 'cold'],
      investigation: ['truth_found', 'buried', 'partial'],
      shaft_shadow: ['resisted', 'answered', 'lost']
    };

    return outcomeTemplates[archetype] || ['completed', 'failed'];
  }

  /**
   * Advance quest to next stage
   */
  advanceStage(quest) {
    if (quest.currentStage < quest.stages.length - 1) {
      quest.currentStage++;
      return quest.stages[quest.currentStage];
    }
    return null;
  }

  /**
   * Complete a quest with an outcome
   */
  complete(quest, outcome) {
    quest.status = 'completed';
    quest.outcome = outcome;
    quest.completedAt = Date.now();
    return quest;
  }
}
