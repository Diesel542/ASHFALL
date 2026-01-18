// src/dialogue/questChoices.js

/**
 * QUEST CHOICES
 *
 * Dialogue options that appear when certain quests are active.
 * Organized by quest archetype.
 */

export const QUEST_CHOICES = {
  // ═══════════════════════════════════════
  // INTERVENTION - Someone needs saving
  // ═══════════════════════════════════════
  intervention: [
    {
      id: 'intervention_ask',
      text: 'I heard something\'s wrong. What happened?',
      voiceTag: 'EMPATHY',
      stage: 'discovered',
      priority: 8
    },
    {
      id: 'intervention_help',
      text: 'What do you need? I want to help.',
      voiceTag: 'EMPATHY',
      stage: 'discovered',
      priority: 7
    },
    {
      id: 'intervention_why',
      text: 'Why is this happening?',
      voiceTag: 'LOGIC',
      stage: 'investigating',
      priority: 6
    },
    {
      id: 'intervention_solve',
      text: 'I think I know how to fix this.',
      voiceTag: 'LOGIC',
      stage: 'investigating',
      priority: 8
    },
    {
      id: 'intervention_act',
      text: 'It\'s time. Let\'s do this.',
      voiceTag: 'INSTINCT',
      stage: 'ready',
      priority: 9
    }
  ],

  // ═══════════════════════════════════════
  // CONFESSION - Extracting truth
  // ═══════════════════════════════════════
  confession: [
    {
      id: 'confession_probe',
      text: 'There\'s something you\'re not telling me.',
      voiceTag: 'INSTINCT',
      stage: 'discovered',
      priority: 8
    },
    {
      id: 'confession_gentle',
      text: 'You can trust me. Whatever it is.',
      voiceTag: 'EMPATHY',
      stage: 'discovered',
      priority: 7
    },
    {
      id: 'confession_evidence',
      text: 'I found something. Want to explain?',
      voiceTag: 'LOGIC',
      stage: 'investigating',
      requireFlags: ['has_evidence'],
      priority: 9
    },
    {
      id: 'confession_pressure',
      text: 'I already know. Just say it.',
      voiceTag: 'INSTINCT',
      stage: 'confronting',
      priority: 8
    },
    {
      id: 'confession_forgive',
      text: 'I\'m not here to judge. I just need the truth.',
      voiceTag: 'EMPATHY',
      stage: 'confronting',
      priority: 9
    }
  ],

  // ═══════════════════════════════════════
  // MEMORY_ECHO - Uncovering the past
  // ═══════════════════════════════════════
  memory_echo: [
    {
      id: 'memory_ask',
      text: 'What do you remember about before?',
      voiceTag: 'GHOST',
      stage: 'discovered',
      priority: 7
    },
    {
      id: 'memory_fragment',
      text: 'I found this. Does it mean anything to you?',
      voiceTag: 'GHOST',
      stage: 'investigating',
      priority: 8
    },
    {
      id: 'memory_connect',
      text: 'It\'s all connected, isn\'t it? The past and now.',
      voiceTag: 'GHOST',
      stage: 'investigating',
      curieActivityChange: 0.05,
      priority: 8
    },
    {
      id: 'memory_reveal',
      text: 'I know what happened here. Long ago.',
      voiceTag: 'GHOST',
      stage: 'revealing',
      curieActivityChange: 0.1,
      priority: 9
    }
  ],

  // ═══════════════════════════════════════
  // SCARCITY_DILEMMA - Resource conflict
  // ═══════════════════════════════════════
  scarcity_dilemma: [
    {
      id: 'scarcity_assess',
      text: 'How bad is the shortage?',
      voiceTag: 'LOGIC',
      stage: 'discovered',
      priority: 7
    },
    {
      id: 'scarcity_options',
      text: 'What are our options?',
      voiceTag: 'LOGIC',
      stage: 'discovered',
      priority: 6
    },
    {
      id: 'scarcity_fair',
      text: 'We need to divide this fairly.',
      voiceTag: 'LOGIC',
      stage: 'deciding',
      priority: 8
    },
    {
      id: 'scarcity_sacrifice',
      text: 'I\'ll give up my share.',
      voiceTag: 'EMPATHY',
      stage: 'deciding',
      priority: 8,
      relationshipChange: 5
    },
    {
      id: 'scarcity_brutal',
      text: 'Some people matter more than others right now.',
      voiceTag: 'INSTINCT',
      stage: 'deciding',
      tensionChange: 10,
      priority: 7
    }
  ],

  // ═══════════════════════════════════════
  // TRUST_TEST - Proving loyalty
  // ═══════════════════════════════════════
  trust_test: [
    {
      id: 'trust_willing',
      text: 'I\'ll do whatever it takes to prove myself.',
      voiceTag: 'INSTINCT',
      stage: 'discovered',
      priority: 7
    },
    {
      id: 'trust_question',
      text: 'Why should I have to prove anything?',
      voiceTag: 'INSTINCT',
      stage: 'discovered',
      tensionChange: 5,
      priority: 6
    },
    {
      id: 'trust_accept',
      text: 'Name the test. I\'ll pass it.',
      voiceTag: 'INSTINCT',
      stage: 'testing',
      priority: 8
    },
    {
      id: 'trust_earned',
      text: 'Trust is earned through action, not words.',
      voiceTag: 'LOGIC',
      stage: 'testing',
      priority: 7
    }
  ],

  // ═══════════════════════════════════════
  // FACTION_FRACTURE - Taking sides
  // ═══════════════════════════════════════
  faction_fracture: [
    {
      id: 'faction_understand',
      text: 'What\'s the disagreement about?',
      voiceTag: 'LOGIC',
      stage: 'discovered',
      priority: 7
    },
    {
      id: 'faction_both_sides',
      text: 'I want to hear both sides.',
      voiceTag: 'EMPATHY',
      stage: 'investigating',
      priority: 6
    },
    {
      id: 'faction_mediate',
      text: 'Maybe I can help find common ground.',
      voiceTag: 'EMPATHY',
      stage: 'deciding',
      priority: 8
    },
    {
      id: 'faction_choose',
      text: 'I\'ve made my decision.',
      voiceTag: 'INSTINCT',
      stage: 'deciding',
      priority: 9
    }
  ],

  // ═══════════════════════════════════════
  // CURIE_CONTACT - Investigating the entity
  // ═══════════════════════════════════════
  curie_contact: [
    {
      id: 'curie_ask_npc',
      text: 'Have you ever felt... watched? From below?',
      voiceTag: 'GHOST',
      stage: 'discovered',
      curieActivityChange: 0.05,
      priority: 8
    },
    {
      id: 'curie_warn',
      text: 'Something is down there. Something aware.',
      voiceTag: 'GHOST',
      stage: 'investigating',
      curieActivityChange: 0.08,
      priority: 9
    },
    {
      id: 'curie_defend',
      text: 'She\'s not evil. She\'s just... trapped.',
      voiceTag: 'EMPATHY',
      stage: 'understanding',
      curieActivityChange: 0.1,
      priority: 9
    },
    {
      id: 'curie_prepare',
      text: 'We need to prepare. For what\'s waking up.',
      voiceTag: 'INSTINCT',
      stage: 'preparing',
      curieActivityChange: 0.1,
      priority: 10
    }
  ],

  // ═══════════════════════════════════════
  // MERCY_KILL - Difficult decisions about suffering
  // ═══════════════════════════════════════
  mercy_kill: [
    {
      id: 'mercy_condition',
      text: 'How much pain are they in?',
      voiceTag: 'EMPATHY',
      stage: 'discovered',
      priority: 8
    },
    {
      id: 'mercy_options',
      text: 'Is there any other way?',
      voiceTag: 'LOGIC',
      stage: 'investigating',
      priority: 7
    },
    {
      id: 'mercy_refuse',
      text: 'I won\'t be part of this.',
      voiceTag: 'EMPATHY',
      stage: 'deciding',
      priority: 8
    },
    {
      id: 'mercy_accept',
      text: 'If it\'s truly what they want...',
      voiceTag: 'EMPATHY',
      stage: 'deciding',
      priority: 8
    },
    {
      id: 'mercy_do_it',
      text: 'I\'ll do it. No one else should have to.',
      voiceTag: 'INSTINCT',
      stage: 'acting',
      priority: 9
    }
  ],

  // ═══════════════════════════════════════
  // EXILE_DECISION - Banishment judgment
  // ═══════════════════════════════════════
  exile_decision: [
    {
      id: 'exile_crime',
      text: 'What exactly did they do?',
      voiceTag: 'LOGIC',
      stage: 'discovered',
      priority: 7
    },
    {
      id: 'exile_defense',
      text: 'Everyone deserves a chance to explain.',
      voiceTag: 'EMPATHY',
      stage: 'investigating',
      priority: 7
    },
    {
      id: 'exile_forgive',
      text: 'People can change. Give them another chance.',
      voiceTag: 'EMPATHY',
      stage: 'deciding',
      priority: 8
    },
    {
      id: 'exile_harsh',
      text: 'The safety of the group comes first.',
      voiceTag: 'LOGIC',
      stage: 'deciding',
      priority: 8
    },
    {
      id: 'exile_cast',
      text: 'They have to go. There\'s no other way.',
      voiceTag: 'INSTINCT',
      stage: 'acting',
      tensionChange: 15,
      priority: 9
    }
  ]
};

/**
 * Get choices for a specific quest
 */
export function getQuestChoices(archetype, stage) {
  const pool = QUEST_CHOICES[archetype] || [];
  if (stage) {
    return pool.filter(c => c.stage === stage);
  }
  return pool;
}

/**
 * Check if any quest choices are available for an NPC
 */
export function hasQuestChoicesForNpc(archetype, npcId) {
  const pool = QUEST_CHOICES[archetype] || [];
  return pool.some(c => !c.npc || c.npc === npcId);
}

export default QUEST_CHOICES;
