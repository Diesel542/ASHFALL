# ASHFALL: Dynamic Dialogue & Voice Tracker
## Choices That Breathe, Voices That Show

### Overview

Two problems, one document:

1. **Dialogue choices are static** — player clicks the same options repeatedly
2. **Voice scores are invisible** — player can't track their internal balance

This spec fixes both.

---

## PART ONE: DYNAMIC CHOICE SYSTEM

### 1. Core Philosophy

Choices should feel like they **emerge from the conversation**, not from a menu.

Rules:
- Never show the same choice twice in a row
- Retire choices once answered (unless repeatable)
- Unlock new choices based on relationship, flags, gates, quests
- Voice-specific choices appear based on dominant voice
- Context matters — time, location, tension affect options

---

### 2. Choice Architecture

```javascript
// src/dialogue/ChoiceSystem.js

/**
 * CHOICE SYSTEM
 * 
 * Generates contextual, dynamic dialogue choices.
 * No more clicking the same options forever.
 */

export class ChoiceSystem {
  constructor(gameStateManager) {
    this.gsm = gameStateManager;
    
    // Track what's been asked per NPC
    this.askedChoices = {
      mara: new Set(),
      jonas: new Set(),
      rask: new Set(),
      edda: new Set(),
      kale: new Set()
    };
    
    // Track conversation count this session
    this.sessionTurns = {};
  }

  /**
   * Generate choices for an NPC conversation
   */
  generateChoices(npcId, conversationContext = {}) {
    const choices = [];
    const npc = this.gsm.state.npcs[npcId];
    const pool = CHOICE_POOLS[npcId];
    
    if (!pool || !npc) {
      return this.getDefaultChoices(npcId);
    }

    // Build context for filtering
    const context = {
      relationship: npc.relationship,
      stress: npc.stress,
      gate: npc.currentGate,
      conversationCount: npc.conversationCount,
      sessionTurns: this.sessionTurns[npcId] || 0,
      tension: this.gsm.get('narrative.tension'),
      act: this.gsm.get('narrative.currentAct'),
      timeOfDay: this.gsm.get('time.timeOfDay'),
      day: this.gsm.get('time.day'),
      location: this.gsm.get('player.location'),
      dominantVoice: this.gsm.getDominantVoice().voice,
      flags: this.gsm.state.flags,
      activeQuests: this.gsm.state.quests.active,
      asked: this.askedChoices[npcId],
      ...conversationContext
    };

    // 1. Add unlocked story choices (max 2)
    const storyChoices = this.filterChoices(pool.story || [], context);
    choices.push(...storyChoices.slice(0, 2));

    // 2. Add voice-specific choice (1)
    const voiceChoice = this.getVoiceChoice(npcId, context);
    if (voiceChoice) {
      choices.push(voiceChoice);
    }

    // 3. Add relationship-based choice (1)
    const relationshipChoice = this.getRelationshipChoice(pool.relationship || [], context);
    if (relationshipChoice) {
      choices.push(relationshipChoice);
    }

    // 4. Add quest-related choice if active (1)
    const questChoice = this.getQuestChoice(npcId, context);
    if (questChoice) {
      choices.push(questChoice);
    }

    // 5. Add situational choice (1)
    const situationalChoice = this.getSituationalChoice(pool.situational || [], context);
    if (situationalChoice) {
      choices.push(situationalChoice);
    }

    // 6. Always add [Leave]
    choices.push({
      id: 'leave',
      text: '[Leave]',
      voice: null,
      action: 'end_conversation'
    });

    // Dedupe and limit to 5 + Leave
    return this.finalizeChoices(choices);
  }

  /**
   * Filter choices based on conditions
   */
  filterChoices(choices, context) {
    return choices.filter(choice => {
      // Already asked and not repeatable?
      if (context.asked.has(choice.id) && !choice.repeatable) {
        return false;
      }

      // Check all conditions
      const c = choice.conditions || {};

      if (c.minRelationship && context.relationship < c.minRelationship) return false;
      if (c.maxRelationship && context.relationship > c.maxRelationship) return false;
      if (c.minGate && context.gate < c.minGate) return false;
      if (c.maxGate && context.gate > c.maxGate) return false;
      if (c.minTension && context.tension < c.minTension) return false;
      if (c.minAct && context.act < c.minAct) return false;
      if (c.requiresFlag && !context.flags.has(c.requiresFlag)) return false;
      if (c.excludeFlag && context.flags.has(c.excludeFlag)) return false;
      if (c.timeOfDay && context.timeOfDay !== c.timeOfDay) return false;
      if (c.minConversations && context.conversationCount < c.minConversations) return false;
      if (c.minSessionTurns && context.sessionTurns < c.minSessionTurns) return false;

      return true;
    });
  }

  /**
   * Get a voice-specific choice based on dominant voice
   */
  getVoiceChoice(npcId, context) {
    const voiceChoices = VOICE_CHOICES[npcId]?.[context.dominantVoice];
    if (!voiceChoices || voiceChoices.length === 0) return null;

    const available = this.filterChoices(voiceChoices, context);
    if (available.length === 0) return null;

    // Pick one we haven't asked recently
    const fresh = available.filter(c => !context.asked.has(c.id));
    const pick = fresh.length > 0 ? fresh[0] : available[0];
    
    return {
      ...pick,
      voice: context.dominantVoice
    };
  }

  /**
   * Get relationship-based choice
   */
  getRelationshipChoice(choices, context) {
    const available = this.filterChoices(choices, context);
    return available.length > 0 ? available[0] : null;
  }

  /**
   * Get quest-related choice if relevant
   */
  getQuestChoice(npcId, context) {
    const activeQuests = context.activeQuests.filter(q => 
      q.context?.npc === npcId || 
      q.archetype === 'investigation'
    );

    if (activeQuests.length === 0) return null;

    const quest = activeQuests[0];
    const questChoices = QUEST_CHOICES[quest.archetype];
    
    if (!questChoices) return null;

    return {
      id: `quest_${quest.id}`,
      text: questChoices.text(quest, npcId),
      voice: null,
      action: 'quest_progress',
      questId: quest.id
    };
  }

  /**
   * Get situational choice based on context
   */
  getSituationalChoice(choices, context) {
    const available = this.filterChoices(choices, context);
    return available.length > 0 ? available[0] : null;
  }

  /**
   * Mark a choice as asked
   */
  markAsked(npcId, choiceId) {
    this.askedChoices[npcId].add(choiceId);
    this.sessionTurns[npcId] = (this.sessionTurns[npcId] || 0) + 1;
  }

  /**
   * Reset session turns (on rest or day change)
   */
  resetSession() {
    this.sessionTurns = {};
  }

  /**
   * Finalize choices - dedupe, sort, limit
   */
  finalizeChoices(choices) {
    // Remove duplicates by id
    const seen = new Set();
    const unique = choices.filter(c => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });

    // Sort: voice choices first, then story, then leave
    unique.sort((a, b) => {
      if (a.id === 'leave') return 1;
      if (b.id === 'leave') return -1;
      if (a.voice && !b.voice) return -1;
      if (!a.voice && b.voice) return 1;
      return 0;
    });

    // Limit to 5 choices + leave
    const leave = unique.find(c => c.id === 'leave');
    const others = unique.filter(c => c.id !== 'leave').slice(0, 5);
    
    return [...others, leave].filter(Boolean);
  }

  /**
   * Default choices if nothing else available
   */
  getDefaultChoices(npcId) {
    return [
      { id: 'default_1', text: 'Tell me about yourself.', voice: null },
      { id: 'default_2', text: 'What do you think of this place?', voice: null },
      { id: 'leave', text: '[Leave]', voice: null, action: 'end_conversation' }
    ];
  }
}
```

---

### 3. Choice Pools by NPC

```javascript
// src/dialogue/choicePools.js

/**
 * CHOICE POOLS
 * 
 * Every NPC has pools of choices that unlock/retire based on conditions.
 */

export const CHOICE_POOLS = {
  
  // ═══════════════════════════════════════
  // MARA
  // ═══════════════════════════════════════
  mara: {
    story: [
      // Early game
      {
        id: 'mara_about_ashfall',
        text: 'Tell me about Ashfall.',
        conditions: { maxGate: 1 }
      },
      {
        id: 'mara_your_role',
        text: 'What do you do here?',
        conditions: { maxConversations: 2 }
      },
      {
        id: 'mara_others',
        text: 'Who else lives here?',
        conditions: { maxConversations: 3 }
      },
      
      // Mid game - unlocks after meeting everyone
      {
        id: 'mara_supplies',
        text: 'How long can the supplies last?',
        conditions: { requiresFlag: 'met_all_npcs', minTension: 30 }
      },
      {
        id: 'mara_the_shaft',
        text: 'What happened at the shaft?',
        conditions: { requiresFlag: 'shaft_mentioned', minGate: 1 }
      },
      {
        id: 'mara_before',
        text: 'What was it like before the fall?',
        conditions: { minRelationship: 50, minGate: 1 }
      },
      
      // Late game
      {
        id: 'mara_the_23',
        text: 'Tell me about the 23.',
        conditions: { requiresFlag: 'knows_about_23', minGate: 2 }
      },
      {
        id: 'mara_breaking',
        text: 'You can\'t hold this together forever.',
        conditions: { minTension: 60, minGate: 2 }
      }
    ],
    
    relationship: [
      {
        id: 'mara_tired',
        text: 'You seem exhausted.',
        conditions: { minRelationship: 40, minConversations: 2 }
      },
      {
        id: 'mara_trust',
        text: 'Do you trust any of them?',
        conditions: { minRelationship: 55 }
      },
      {
        id: 'mara_burden',
        text: 'Why do you carry this alone?',
        conditions: { minRelationship: 65, minGate: 2 }
      }
    ],
    
    situational: [
      {
        id: 'mara_night',
        text: 'Can\'t sleep either?',
        conditions: { timeOfDay: 'night' }
      },
      {
        id: 'mara_tremor',
        text: 'That tremor felt different.',
        conditions: { requiresFlag: 'recent_tremor' },
        repeatable: true
      }
    ]
  },

  // ═══════════════════════════════════════
  // JONAS
  // ═══════════════════════════════════════
  jonas: {
    story: [
      {
        id: 'jonas_clinic',
        text: 'How did you become the healer?',
        conditions: { maxGate: 1 }
      },
      {
        id: 'jonas_patients',
        text: 'Who needs your help most?',
        conditions: { maxConversations: 3 }
      },
      {
        id: 'jonas_medicine',
        text: 'Is there enough medicine?',
        conditions: { minConversations: 2 }
      },
      
      // Deeper
      {
        id: 'jonas_before_healer',
        text: 'Were you always a healer?',
        conditions: { minRelationship: 45, minGate: 1 }
      },
      {
        id: 'jonas_the_shaft',
        text: 'You were there when it happened.',
        conditions: { requiresFlag: 'jonas_was_there', minGate: 1 }
      },
      {
        id: 'jonas_wont_heal',
        text: 'Why won\'t you treat yourself?',
        conditions: { minRelationship: 60, minGate: 2 }
      },
      
      // Late
      {
        id: 'jonas_guilt',
        text: 'What did you do, Jonas?',
        conditions: { minRelationship: 70, minGate: 2, requiresFlag: 'jonas_hinted_guilt' }
      }
    ],
    
    relationship: [
      {
        id: 'jonas_hands',
        text: 'Your hands are shaking.',
        conditions: { minConversations: 2 }
      },
      {
        id: 'jonas_sleep',
        text: 'When did you last rest?',
        conditions: { minRelationship: 40 }
      },
      {
        id: 'jonas_forgive',
        text: 'Have you considered forgiving yourself?',
        conditions: { minRelationship: 65, minGate: 2 }
      }
    ],
    
    situational: [
      {
        id: 'jonas_night_clinic',
        text: 'Working late again?',
        conditions: { timeOfDay: 'night', location: 'clinic' }
      },
      {
        id: 'jonas_after_tremor',
        text: 'Anyone hurt in the tremor?',
        conditions: { requiresFlag: 'recent_tremor' },
        repeatable: true
      }
    ]
  },

  // ═══════════════════════════════════════
  // RASK
  // ═══════════════════════════════════════
  rask: {
    story: [
      {
        id: 'rask_gate_duty',
        text: 'How long have you watched the gate?',
        conditions: { maxGate: 1 }
      },
      {
        id: 'rask_threats',
        text: 'What are you watching for?',
        conditions: { maxConversations: 2 }
      },
      {
        id: 'rask_before',
        text: 'What were you before?',
        conditions: { minRelationship: 40, minGate: 1 }
      },
      
      // Deeper
      {
        id: 'rask_night_shaft',
        text: 'Why do you watch the shaft at night?',
        conditions: { requiresFlag: 'seen_rask_at_shaft', minGate: 1 }
      },
      {
        id: 'rask_let_in',
        text: 'Have you ever turned someone away?',
        conditions: { minRelationship: 50, minConversations: 3 }
      },
      
      // Late
      {
        id: 'rask_seal',
        text: 'You helped seal the shaft.',
        conditions: { requiresFlag: 'knows_rask_sealed', minGate: 2 }
      }
    ],
    
    relationship: [
      {
        id: 'rask_silent',
        text: 'You don\'t say much, do you?',
        conditions: { maxConversations: 2 }
      },
      {
        id: 'rask_weight',
        text: 'What keeps you standing here?',
        conditions: { minRelationship: 50, minGate: 1 }
      },
      {
        id: 'rask_underneath',
        text: 'There\'s more underneath, isn\'t there?',
        conditions: { minRelationship: 65, minGate: 2 }
      }
    ],
    
    situational: [
      {
        id: 'rask_night_watch',
        text: 'See anything out there?',
        conditions: { timeOfDay: 'night' },
        repeatable: true
      }
    ]
  },

  // ═══════════════════════════════════════
  // EDDA
  // ═══════════════════════════════════════
  edda: {
    story: [
      {
        id: 'edda_visions',
        text: 'What do you see?',
        conditions: { maxGate: 1 }
      },
      {
        id: 'edda_the_hum',
        text: 'You hear it too, don\'t you?',
        conditions: { maxConversations: 2 }
      },
      {
        id: 'edda_warnings',
        text: 'Your warnings — what do they mean?',
        conditions: { minConversations: 2, minGate: 1 }
      },
      
      // Deeper
      {
        id: 'edda_before_sight',
        text: 'When did the visions start?',
        conditions: { minRelationship: 45, minGate: 1 }
      },
      {
        id: 'edda_shaft_voice',
        text: 'What does the shaft say to you?',
        conditions: { requiresFlag: 'shaft_mentioned_by_edda', minGate: 1 }
      },
      
      // Late
      {
        id: 'edda_curie',
        text: 'There\'s something alive down there.',
        conditions: { requiresFlag: 'curie_contact', minGate: 2 }
      },
      {
        id: 'edda_singing',
        text: 'Tell me about the singing.',
        conditions: { minRelationship: 60, minGate: 2 }
      }
    ],
    
    relationship: [
      {
        id: 'edda_alone',
        text: 'Do the others listen to you?',
        conditions: { minConversations: 2 }
      },
      {
        id: 'edda_afraid',
        text: 'Does it frighten you?',
        conditions: { minRelationship: 50 }
      },
      {
        id: 'edda_truth',
        text: 'Why do you keep trying to warn them?',
        conditions: { minRelationship: 60, minGate: 2 }
      }
    ],
    
    situational: [
      {
        id: 'edda_tremor_felt',
        text: 'You felt that. What did it mean?',
        conditions: { requiresFlag: 'recent_tremor' },
        repeatable: true
      },
      {
        id: 'edda_night_wandering',
        text: 'Why are you out here at night?',
        conditions: { timeOfDay: 'night' }
      }
    ]
  },

  // ═══════════════════════════════════════
  // KALE
  // ═══════════════════════════════════════
  kale: {
    story: [
      {
        id: 'kale_market',
        text: 'What do you trade?',
        conditions: { maxGate: 1 }
      },
      {
        id: 'kale_before',
        text: 'What did you do before Ashfall?',
        conditions: { maxConversations: 2 }
      },
      {
        id: 'kale_others',
        text: 'How do you get along with everyone?',
        conditions: { minConversations: 2 }
      },
      
      // Deeper
      {
        id: 'kale_remember',
        text: 'Do you remember much from before?',
        conditions: { minRelationship: 40, minGate: 1 }
      },
      {
        id: 'kale_gaps',
        text: 'There are gaps, aren\'t there?',
        conditions: { requiresFlag: 'kale_slipped', minGate: 1 }
      },
      
      // Late
      {
        id: 'kale_not_his',
        text: 'Those words weren\'t yours.',
        conditions: { requiresFlag: 'kale_borrowed_words', minGate: 2 }
      },
      {
        id: 'kale_who',
        text: 'Kale... who are you really?',
        conditions: { minRelationship: 65, minGate: 2 }
      }
    ],
    
    relationship: [
      {
        id: 'kale_smile',
        text: 'You smile a lot. Is it real?',
        conditions: { minConversations: 2 }
      },
      {
        id: 'kale_belong',
        text: 'Do you feel like you belong here?',
        conditions: { minRelationship: 45 }
      },
      {
        id: 'kale_afraid',
        text: 'What are you afraid of?',
        conditions: { minRelationship: 55, minGate: 1 }
      }
    ],
    
    situational: [
      {
        id: 'kale_quiet_market',
        text: 'Quiet day at the market?',
        conditions: { location: 'market_square' },
        repeatable: true
      },
      {
        id: 'kale_after_tremor',
        text: 'You okay after that tremor?',
        conditions: { requiresFlag: 'recent_tremor' }
      }
    ]
  }
};
```

---

### 4. Voice-Specific Choices

```javascript
// src/dialogue/voiceChoices.js

/**
 * VOICE-SPECIFIC CHOICES
 * 
 * These appear based on the player's dominant voice.
 * They push conversations in voice-aligned directions.
 */

export const VOICE_CHOICES = {
  
  mara: {
    LOGIC: [
      {
        id: 'mara_logic_1',
        text: '[L] What\'s your rationing system?',
        conditions: { minConversations: 1 }
      },
      {
        id: 'mara_logic_2',
        text: '[L] The numbers don\'t add up. What aren\'t you counting?',
        conditions: { minTension: 40, minGate: 1 }
      },
      {
        id: 'mara_logic_3',
        text: '[L] If the supplies fail, what\'s the contingency?',
        conditions: { minTension: 60, minGate: 2 }
      }
    ],
    INSTINCT: [
      {
        id: 'mara_instinct_1',
        text: '[I] Something\'s wrong. I can feel it.',
        conditions: { minConversations: 1 }
      },
      {
        id: 'mara_instinct_2',
        text: '[I] You\'re afraid of something specific.',
        conditions: { minRelationship: 40, minGate: 1 }
      },
      {
        id: 'mara_instinct_3',
        text: '[I] Who here would you sacrifice first?',
        conditions: { minTension: 60, minGate: 2 }
      }
    ],
    EMPATHY: [
      {
        id: 'mara_empathy_1',
        text: '[E] How are you really holding up?',
        conditions: { minConversations: 1 }
      },
      {
        id: 'mara_empathy_2',
        text: '[E] You care about them. All of them.',
        conditions: { minRelationship: 45 }
      },
      {
        id: 'mara_empathy_3',
        text: '[E] When did you last let someone take care of you?',
        conditions: { minRelationship: 60, minGate: 2 }
      }
    ],
    GHOST: [
      {
        id: 'mara_ghost_1',
        text: '[G] The hum knows your name.',
        conditions: { minConversations: 2 }
      },
      {
        id: 'mara_ghost_2',
        text: '[G] You dream about them. The 23.',
        conditions: { requiresFlag: 'knows_about_23', minGate: 1 }
      },
      {
        id: 'mara_ghost_3',
        text: '[G] She remembers you. The thing below.',
        conditions: { requiresFlag: 'curie_contact', minGate: 2 }
      }
    ]
  },

  jonas: {
    LOGIC: [
      {
        id: 'jonas_logic_1',
        text: '[L] Walk me through your triage protocol.',
        conditions: { minConversations: 1 }
      },
      {
        id: 'jonas_logic_2',
        text: '[L] Your hands shake. That affects precision.',
        conditions: { minConversations: 2 }
      },
      {
        id: 'jonas_logic_3',
        text: '[L] Guilt is irrational if you had no choice.',
        conditions: { minRelationship: 50, minGate: 2 }
      }
    ],
    INSTINCT: [
      {
        id: 'jonas_instinct_1',
        text: '[I] You flinch when people thank you.',
        conditions: { minConversations: 1 }
      },
      {
        id: 'jonas_instinct_2',
        text: '[I] Part of you wants to be caught.',
        conditions: { minRelationship: 45, minGate: 1 }
      },
      {
        id: 'jonas_instinct_3',
        text: '[I] Stop running. Face it.',
        conditions: { minRelationship: 60, minGate: 2 }
      }
    ],
    EMPATHY: [
      {
        id: 'jonas_empathy_1',
        text: '[E] It wasn\'t your fault.',
        conditions: { minConversations: 2 }
      },
      {
        id: 'jonas_empathy_2',
        text: '[E] Healing others won\'t heal you.',
        conditions: { minRelationship: 50, minGate: 1 }
      },
      {
        id: 'jonas_empathy_3',
        text: '[E] You deserve forgiveness too.',
        conditions: { minRelationship: 65, minGate: 2 }
      }
    ],
    GHOST: [
      {
        id: 'jonas_ghost_1',
        text: '[G] Their voices don\'t blame you.',
        conditions: { minConversations: 2, minGate: 1 }
      },
      {
        id: 'jonas_ghost_2',
        text: '[G] I can hear them when I\'m near you.',
        conditions: { requiresFlag: 'curie_contact', minGate: 2 }
      }
    ]
  },

  rask: {
    LOGIC: [
      {
        id: 'rask_logic_1',
        text: '[L] What\'s your threat assessment?',
        conditions: { minConversations: 1 }
      },
      {
        id: 'rask_logic_2',
        text: '[L] The gate isn\'t the real danger.',
        conditions: { minRelationship: 40, minGate: 1 }
      }
    ],
    INSTINCT: [
      {
        id: 'rask_instinct_1',
        text: '[I] You\'ve killed before.',
        conditions: { minConversations: 1 }
      },
      {
        id: 'rask_instinct_2',
        text: '[I] You\'re not watching for what\'s outside.',
        conditions: { minRelationship: 45, minGate: 1 }
      }
    ],
    EMPATHY: [
      {
        id: 'rask_empathy_1',
        text: '[E] It\'s lonely out here.',
        conditions: { minConversations: 1 }
      },
      {
        id: 'rask_empathy_2',
        text: '[E] You chose this post. Why?',
        conditions: { minRelationship: 50, minGate: 1 }
      }
    ],
    GHOST: [
      {
        id: 'rask_ghost_1',
        text: '[G] The dead walk past you some nights.',
        conditions: { minConversations: 2, minGate: 1 }
      },
      {
        id: 'rask_ghost_2',
        text: '[G] You hear it too. Louder than anyone.',
        conditions: { requiresFlag: 'curie_contact', minGate: 2 }
      }
    ]
  },

  edda: {
    LOGIC: [
      {
        id: 'edda_logic_1',
        text: '[L] Describe exactly what you see.',
        conditions: { minConversations: 1 }
      },
      {
        id: 'edda_logic_2',
        text: '[L] Is there a pattern to the visions?',
        conditions: { minRelationship: 40, minGate: 1 }
      }
    ],
    INSTINCT: [
      {
        id: 'edda_instinct_1',
        text: '[I] You know something bad is coming.',
        conditions: { minConversations: 1 }
      },
      {
        id: 'edda_instinct_2',
        text: '[I] When should we run?',
        conditions: { minTension: 50, minGate: 1 }
      }
    ],
    EMPATHY: [
      {
        id: 'edda_empathy_1',
        text: '[E] It must be exhausting. Knowing.',
        conditions: { minConversations: 1 }
      },
      {
        id: 'edda_empathy_2',
        text: '[E] I believe you. I want you to know that.',
        conditions: { minRelationship: 50 }
      }
    ],
    GHOST: [
      {
        id: 'edda_ghost_1',
        text: '[G] We hear the same frequency.',
        conditions: { minConversations: 2 }
      },
      {
        id: 'edda_ghost_2',
        text: '[G] She speaks through you sometimes.',
        conditions: { requiresFlag: 'curie_contact', minGate: 2 }
      }
    ]
  },

  kale: {
    LOGIC: [
      {
        id: 'kale_logic_1',
        text: '[L] Tell me your earliest clear memory.',
        conditions: { minConversations: 1 }
      },
      {
        id: 'kale_logic_2',
        text: '[L] The gaps in your memory — how long?',
        conditions: { requiresFlag: 'kale_slipped', minGate: 1 }
      }
    ],
    INSTINCT: [
      {
        id: 'kale_instinct_1',
        text: '[I] Something\'s off about you.',
        conditions: { minConversations: 2 }
      },
      {
        id: 'kale_instinct_2',
        text: '[I] You\'re not who you think you are.',
        conditions: { minRelationship: 45, minGate: 1 }
      }
    ],
    EMPATHY: [
      {
        id: 'kale_empathy_1',
        text: '[E] You\'re trying so hard to be normal.',
        conditions: { minConversations: 1 }
      },
      {
        id: 'kale_empathy_2',
        text: '[E] It\'s okay to not know who you are.',
        conditions: { minRelationship: 50, minGate: 1 }
      }
    ],
    GHOST: [
      {
        id: 'kale_ghost_1',
        text: '[G] She put pieces of others in you.',
        conditions: { minConversations: 2, minGate: 1 }
      },
      {
        id: 'kale_ghost_2',
        text: '[G] You\'re her favorite. Her mirror.',
        conditions: { requiresFlag: 'curie_contact', minGate: 2 }
      }
    ]
  }
};
```

---

### 5. Quest-Related Choices

```javascript
// src/dialogue/questChoices.js

/**
 * QUEST-RELATED CHOICES
 * 
 * When a quest is active, relevant choices appear.
 */

export const QUEST_CHOICES = {
  
  intervention: {
    text: (quest, npcId) => {
      if (quest.context.npc === npcId) {
        return `I'm worried about you.`;
      }
      return `Have you noticed something wrong with ${quest.context.npc}?`;
    }
  },
  
  confession: {
    text: (quest, npcId) => {
      if (quest.context.npc === npcId) {
        return `You wanted to tell me something.`;
      }
      return null; // Only show for the quest NPC
    }
  },
  
  investigation: {
    text: (quest, npcId) => {
      return `What do you know about the shaft?`;
    }
  },
  
  scarcity_dilemma: {
    text: (quest, npcId) => {
      if (npcId === 'mara') {
        return `We need to talk about the ${quest.context.resource}.`;
      }
      return `What would you do if supplies ran out?`;
    }
  },
  
  memory_echo: {
    text: (quest, npcId) => {
      if (npcId === 'edda') {
        return `I heard something. From below.`;
      }
      if (npcId === 'kale') {
        return `You said something strange earlier.`;
      }
      return null;
    }
  }
};
```

---

## PART TWO: VOICE TRACKER UI

### 6. Voice Tracker Component

```javascript
// src/ui/VoiceTracker.js

import { UI_COLORS } from './UIConstants.js';

/**
 * VOICE TRACKER
 * 
 * Shows the player's internal voice balance.
 * Subtle, ambient, always present.
 */

export class VoiceTracker {
  constructor(scene) {
    this.scene = scene;
    this.voices = ['LOGIC', 'INSTINCT', 'EMPATHY', 'GHOST'];
    
    this.voiceConfig = {
      LOGIC: { color: 0x4a9eff, icon: '◇', label: 'L' },
      INSTINCT: { color: 0xff6b35, icon: '◈', label: 'I' },
      EMPATHY: { color: 0x4ecdc4, icon: '○', label: 'E' },
      GHOST: { color: 0x9b59b6, icon: '◎', label: 'G' }
    };

    this.create();
  }

  create() {
    const { width, height } = this.scene.cameras.main;
    
    // Position: bottom right corner
    this.container = this.scene.add.container(width - 120, height - 80);
    this.container.setDepth(1000);
    this.container.setAlpha(0.7);

    // Background (subtle)
    this.bg = this.scene.add.rectangle(0, 0, 100, 70, 0x000000, 0.3);
    this.bg.setStrokeStyle(1, 0x333333);
    this.container.add(this.bg);

    // Voice bars
    this.bars = {};
    this.icons = {};
    this.glows = {};
    
    const startY = -25;
    const spacing = 16;

    this.voices.forEach((voice, index) => {
      const y = startY + (index * spacing);
      const config = this.voiceConfig[voice];
      
      // Label
      const label = this.scene.add.text(-40, y, config.label, {
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: '10px',
        color: '#' + config.color.toString(16).padStart(6, '0')
      });
      label.setOrigin(0, 0.5);
      this.container.add(label);

      // Bar background
      const barBg = this.scene.add.rectangle(10, y, 60, 8, 0x222222);
      barBg.setOrigin(0, 0.5);
      this.container.add(barBg);

      // Bar fill
      const bar = this.scene.add.rectangle(10, y, 0, 6, config.color);
      bar.setOrigin(0, 0.5);
      this.container.add(bar);
      this.bars[voice] = bar;

      // Glow indicator for dominant
      const glow = this.scene.add.circle(-40, y, 3, config.color, 0);
      this.container.add(glow);
      this.glows[voice] = glow;
    });

    // "Dominant" label (appears when one voice leads)
    this.dominantLabel = this.scene.add.text(0, 35, '', {
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: '8px',
      color: '#666666'
    });
    this.dominantLabel.setOrigin(0.5);
    this.container.add(this.dominantLabel);

    // Initial update
    this.update();

    // Listen for voice changes
    Game.gsm.events.on('player:voice_score_change', () => {
      this.update();
    });
  }

  /**
   * Update the voice display
   */
  update() {
    const scores = Game.gsm.get('player.voiceScores') || {
      LOGIC: 0, INSTINCT: 0, EMPATHY: 0, GHOST: 0
    };

    // Find max score for normalization
    const maxScore = Math.max(1, ...Object.values(scores));
    const dominant = Game.gsm.getDominantVoice();

    this.voices.forEach(voice => {
      const score = scores[voice] || 0;
      const normalized = score / maxScore;
      const barWidth = Math.max(2, normalized * 55); // Min 2px, max 55px

      // Animate bar
      this.scene.tweens.add({
        targets: this.bars[voice],
        width: barWidth,
        duration: 300,
        ease: 'Power2'
      });

      // Update glow for dominant voice
      const isDominant = dominant.voice === voice && dominant.confidence !== 'low';
      
      this.scene.tweens.add({
        targets: this.glows[voice],
        alpha: isDominant ? 0.8 : 0,
        duration: 300
      });

      // Pulse glow if dominant
      if (isDominant && !this.glows[voice].pulseAnim) {
        this.glows[voice].pulseAnim = this.scene.tweens.add({
          targets: this.glows[voice],
          scale: { from: 1, to: 1.5 },
          alpha: { from: 0.8, to: 0.4 },
          duration: 1000,
          yoyo: true,
          repeat: -1
        });
      } else if (!isDominant && this.glows[voice].pulseAnim) {
        this.glows[voice].pulseAnim.stop();
        this.glows[voice].pulseAnim = null;
        this.glows[voice].setScale(1);
      }
    });

    // Update dominant label
    if (dominant.confidence === 'high') {
      this.dominantLabel.setText(dominant.voice.toLowerCase() + ' rising');
      this.dominantLabel.setColor('#' + this.voiceConfig[dominant.voice].color.toString(16).padStart(6, '0'));
    } else if (dominant.confidence === 'medium') {
      this.dominantLabel.setText(dominant.voice.toLowerCase() + ' leads');
      this.dominantLabel.setColor('#666666');
    } else {
      this.dominantLabel.setText('balanced');
      this.dominantLabel.setColor('#444444');
    }
  }

  /**
   * Flash a voice when a choice is made
   */
  flashVoice(voice) {
    const config = this.voiceConfig[voice];
    if (!config) return;

    // Brief bright flash
    const flash = this.scene.add.rectangle(10, 0, 60, 20, config.color, 0.5);
    flash.setOrigin(0, 0.5);
    this.container.add(flash);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy()
    });
  }

  /**
   * Show/hide the tracker
   */
  show() {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0.7,
      duration: 300
    });
  }

  hide() {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 300
    });
  }

  /**
   * Set visibility during dialogue (more prominent)
   */
  setDialogueMode(active) {
    this.scene.tweens.add({
      targets: this.container,
      alpha: active ? 0.9 : 0.7,
      y: active ? this.container.y - 20 : this.container.y + 20,
      duration: 300
    });
  }
}
```

---

### 7. Integration

```javascript
// Add to SettlementScene.js create()

import { VoiceTracker } from '../ui/VoiceTracker.js';
import { ChoiceSystem } from '../dialogue/ChoiceSystem.js';

// Create systems
this.voiceTracker = new VoiceTracker(this);
this.choiceSystem = new ChoiceSystem(Game.gsm);

// When generating choices, use the new system
async showChoicesForNpc(npcId) {
  const choices = this.choiceSystem.generateChoices(npcId, {
    lastResponse: this.lastNpcResponse,
    emotion: this.currentEmotion
  });
  
  this.choicePanel.showChoices(choices);
}

// When a choice is made
handleChoice(choice) {
  // Mark as asked
  this.choiceSystem.markAsked(this.currentNpc, choice.id);
  
  // Flash voice tracker if voice choice
  if (choice.voice) {
    this.voiceTracker.flashVoice(choice.voice);
  }
  
  // Continue with dialogue...
}

// During dialogue, make tracker more visible
startDialogue(npcId) {
  this.voiceTracker.setDialogueMode(true);
  // ...
}

endDialogue() {
  this.voiceTracker.setDialogueMode(false);
  // ...
}
```

---

### 8. Updating DialogueController

```javascript
// Modify DialogueController.js to use ChoiceSystem

generateChoices(npcId, context) {
  // Use the new ChoiceSystem instead of static choices
  return this.scene.choiceSystem.generateChoices(npcId, context);
}
```

---

## Summary

**Dynamic Choice System:**
- Choices unlock based on relationship, gates, flags, tension, time
- Voice-specific choices appear based on dominant voice
- Quest-related choices appear when quests are active
- Asked choices are retired (unless repeatable)
- Never see the same stale options twice

**Voice Tracker UI:**
- Four bars showing LOGIC / INSTINCT / EMPATHY / GHOST
- Dominant voice glows and pulses
- Label shows "balanced" / "[voice] leads" / "[voice] rising"
- Flashes when you pick a voice-aligned choice
- More prominent during dialogue

**Choice Counts:**
- ~8-12 story choices per NPC (gated by progression)
- ~3-4 relationship choices per NPC
- ~4 voice-specific choices per voice per NPC
- ~2-3 situational choices per NPC
- Total: ~80+ unique choices across all NPCs

---

*"The questions change because you've changed."*

*— Now it breathes with you*
