// src/dialogue/relationships.js

/**
 * NPC-to-NPC Relationships (Simplified)
 *
 * Quick-reference perceptions for cross-reference dialogue.
 * For full relationship matrix, see src/data/relationships.js
 */

export const NPC_RELATIONSHIPS = {
  mara: {
    jonas: {
      perception: "He could help—if he'd stop drowning in guilt.",
      tone: 'frustrated',
      willMention: true
    },
    rask: {
      perception: "A weapon. Useful—until he isn't.",
      tone: 'wary',
      willMention: true
    },
    edda: {
      perception: "Her riddles worry me. She knows something.",
      tone: 'suspicious',
      willMention: false
    },
    kale: {
      perception: "He tries. That's the best I can say.",
      tone: 'dismissive',
      willMention: true
    }
  },

  jonas: {
    mara: {
      perception: "She carries too much alone. No one should.",
      tone: 'sympathetic',
      willMention: true
    },
    rask: {
      perception: "He's not what people fear. He's worse, and better.",
      tone: 'understanding',
      willMention: false
    },
    edda: {
      perception: "She knows too much. I know too little.",
      tone: 'respectful',
      willMention: false
    },
    kale: {
      perception: "He tries to be everyone. Someone should tell him he's enough.",
      tone: 'protective',
      willMention: true
    }
  },

  rask: {
    mara: {
      perception: "She thinks I'm trouble. Not wrong.",
      tone: 'accepting',
      willMention: false
    },
    jonas: {
      perception: "Gentle hands. Shame they stay still.",
      tone: 'curious',
      willMention: false
    },
    edda: {
      perception: "She talks to the wind. Sometimes it answers.",
      tone: 'respectful',
      willMention: false
    },
    kale: {
      perception: "He'll break if no one teaches him how not to.",
      tone: 'protective',
      willMention: true
    }
  },

  edda: {
    mara: {
      perception: "Hard edges crack. She'll learn.",
      tone: 'knowing',
      willMention: false
    },
    jonas: {
      perception: "His hands remember healing. His heart forgot.",
      tone: 'sad',
      willMention: true
    },
    rask: {
      perception: "They fear the wrong things about him.",
      tone: 'understanding',
      willMention: false
    },
    kale: {
      perception: "He hears things he shouldn't. Poor boy.",
      tone: 'fearful',
      willMention: true
    }
  },

  kale: {
    mara: {
      perception: "She looks at me like I'm wrong. She's probably right.",
      tone: 'anxious',
      willMention: true
    },
    jonas: {
      perception: "He talks soft. Like what I say matters.",
      tone: 'comfortable',
      willMention: true
    },
    rask: {
      perception: "He doesn't talk much. I copy his stance when I'm scared.",
      tone: 'admiring',
      willMention: false
    },
    edda: {
      perception: "She scares me. She looks at me like she sees something else.",
      tone: 'fearful',
      willMention: false
    }
  }
};

/**
 * Get what one NPC thinks about another
 */
export function getPerception(fromNpc, aboutNpc) {
  return NPC_RELATIONSHIPS[fromNpc]?.[aboutNpc] || null;
}

/**
 * Get all NPCs that a given NPC will mention unprompted
 */
export function getWillMention(npcId) {
  const relationships = NPC_RELATIONSHIPS[npcId];
  if (!relationships) return [];

  return Object.entries(relationships)
    .filter(([_, rel]) => rel.willMention)
    .map(([otherId, _]) => otherId);
}

/**
 * Get a random gossip line from one NPC about another
 */
export function getGossipLine(fromNpc, aboutNpc) {
  const relationship = NPC_RELATIONSHIPS[fromNpc]?.[aboutNpc];
  if (!relationship) return null;

  const gossipTemplates = {
    mara: {
      jonas: [
        "Jonas... he used to be different.",
        "The medic won't lift a finger. Some help he is.",
        "*She glances toward the clinic.* Waste of supplies."
      ],
      rask: [
        "Keep your distance from Rask.",
        "He's useful. For now.",
        "*Her jaw tightens.* Watch him. I do."
      ],
      kale: [
        "The boy runs errands. That's all he's good for.",
        "Kale? Unreliable.",
        "*Dismissive wave.* He'll figure it out. Or he won't."
      ]
    },

    jonas: {
      mara: [
        "Mara carries everything. It's too much.",
        "She doesn't trust anyone. Can you blame her?",
        "*Quietly* She's stronger than she knows."
      ],
      kale: [
        "Kale's trying. That counts for something.",
        "He just needs someone to believe in him.",
        "*Soft smile* He reminds me of... someone."
      ]
    },

    edda: {
      jonas: [
        "The healer's hands remember. Even if he doesn't.",
        "Jonas could help, if he'd let himself.",
        "*Hums softly* Guilt is heavy. He carries too much."
      ],
      kale: [
        "The boy hears things. Poor child.",
        "*Closes eyes* He flickers. Like a candle in wind.",
        "Be gentle with him. He's not... entirely here."
      ]
    },

    rask: {
      kale: [
        "*Looks toward Kale* Someone needs to watch him.",
        "The boy's lost. I was lost once.",
        "*Silence. Then:* He's not safe. But he's not dangerous either."
      ]
    },

    kale: {
      mara: [
        "Mara looks at me like... like I did something wrong.",
        "She's so sure of everything. I wish I was.",
        "*Shifts uncomfortably* I try to help. She doesn't see it."
      ],
      jonas: [
        "Jonas is kind. He talks like what I say matters.",
        "I like being around him. It's... easier.",
        "*Adopts softer tone* He's sad, though. Always sad."
      ]
    }
  };

  const lines = gossipTemplates[fromNpc]?.[aboutNpc];
  if (!lines || lines.length === 0) {
    return `*${fromNpc} considers.* ${relationship.perception}`;
  }

  return lines[Math.floor(Math.random() * lines.length)];
}

/**
 * Check if mentioning an NPC would be appropriate given context
 */
export function shouldMention(fromNpc, aboutNpc, context = {}) {
  const relationship = NPC_RELATIONSHIPS[fromNpc]?.[aboutNpc];
  if (!relationship) return false;

  // Don't mention if relationship is strained and stress is high
  if (context.stress > 70 && relationship.tone === 'frustrated') {
    return false;
  }

  // More likely to mention if recently saw that NPC
  if (context.recentlyEncountered?.includes(aboutNpc)) {
    return true;
  }

  return relationship.willMention;
}
