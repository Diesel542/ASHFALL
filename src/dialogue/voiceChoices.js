// src/dialogue/voiceChoices.js

/**
 * VOICE CHOICES
 *
 * Voice-aligned dialogue options for each NPC.
 * These appear based on the player's dominant internal voice.
 *
 * LOGIC: Analytical, evidence-based
 * INSTINCT: Gut feelings, survival
 * EMPATHY: Emotional connection, understanding
 * GHOST: Memory, pattern recognition, the uncanny
 */

export const VOICE_CHOICES = {
  // ═══════════════════════════════════════
  // MARA
  // ═══════════════════════════════════════
  mara: {
    LOGIC: {
      id: 'mara_voice_logic',
      text: 'Let\'s think through this systematically.',
      voiceTag: 'LOGIC',
      voiceText: 'Numbers don\'t lie. Make her see the math.'
    },
    INSTINCT: {
      id: 'mara_voice_instinct',
      text: 'Something about this doesn\'t sit right.',
      voiceTag: 'INSTINCT',
      voiceText: 'She\'s holding something back. Push.'
    },
    EMPATHY: {
      id: 'mara_voice_empathy',
      text: 'The weight you carry... it\'s visible.',
      voiceTag: 'EMPATHY',
      voiceText: 'Under all that armor, she\'s terrified.',
      relationshipChange: 2
    },
    GHOST: {
      id: 'mara_voice_ghost',
      text: 'You\'ve felt it too. The wrongness beneath.',
      voiceTag: 'GHOST',
      voiceText: 'She knows more than she admits. Even to herself.',
      curieActivityChange: 0.03
    }
  },

  // ═══════════════════════════════════════
  // JONAS
  // ═══════════════════════════════════════
  jonas: {
    LOGIC: {
      id: 'jonas_voice_logic',
      text: 'Your hands still remember the motions.',
      voiceTag: 'LOGIC',
      voiceText: 'Muscle memory. Suturing, incisions. It\'s all still there.'
    },
    INSTINCT: {
      id: 'jonas_voice_instinct',
      text: 'The guilt is eating you alive.',
      voiceTag: 'INSTINCT',
      voiceText: 'Death follows him. He can smell it on himself.',
      relationshipChange: -1
    },
    EMPATHY: {
      id: 'jonas_voice_empathy',
      text: 'You don\'t have to forgive yourself. Just survive today.',
      voiceTag: 'EMPATHY',
      voiceText: 'So much pain. He needs to know someone sees it.',
      relationshipChange: 3
    },
    GHOST: {
      id: 'jonas_voice_ghost',
      text: 'They don\'t blame you. Wherever they are.',
      voiceTag: 'GHOST',
      voiceText: 'The dead don\'t hold grudges. Only the living do.',
      relationshipChange: 2
    }
  },

  // ═══════════════════════════════════════
  // RASK
  // ═══════════════════════════════════════
  rask: {
    LOGIC: {
      id: 'rask_voice_logic',
      text: 'Your patrol patterns. Deliberate. Tactical.',
      voiceTag: 'LOGIC',
      voiceText: 'Military training. The way he positions himself. Fields of fire.'
    },
    INSTINCT: {
      id: 'rask_voice_instinct',
      text: '*Hold your ground. Don\'t flinch.*',
      voiceTag: 'INSTINCT',
      voiceText: 'He respects strength. Show him you won\'t break.',
      relationshipChange: 2
    },
    EMPATHY: {
      id: 'rask_voice_empathy',
      text: 'You don\'t have to be alone in this.',
      voiceTag: 'EMPATHY',
      voiceText: 'All that vigilance. He\'s exhausted. Let him rest.',
      relationshipChange: 2
    },
    GHOST: {
      id: 'rask_voice_ghost',
      text: 'The things you\'ve seen... they don\'t leave you.',
      voiceTag: 'GHOST',
      voiceText: 'War never ends. Not really. It just moves inside.',
      relationshipChange: 1
    }
  },

  // ═══════════════════════════════════════
  // EDDA
  // ═══════════════════════════════════════
  edda: {
    LOGIC: {
      id: 'edda_voice_logic',
      text: 'Your warnings have patterns. Consistent ones.',
      voiceTag: 'LOGIC',
      voiceText: 'Not madness. Observation. She sees what others dismiss.'
    },
    INSTINCT: {
      id: 'edda_voice_instinct',
      text: 'My gut says to trust you.',
      voiceTag: 'INSTINCT',
      voiceText: 'She knows things. Dangerous things. But necessary.',
      relationshipChange: 2
    },
    EMPATHY: {
      id: 'edda_voice_empathy',
      text: 'It\'s lonely, isn\'t it? Knowing what others can\'t see.',
      voiceTag: 'EMPATHY',
      voiceText: 'All those years of being dismissed. She just wants someone to believe.',
      relationshipChange: 3
    },
    GHOST: {
      id: 'edda_voice_ghost',
      text: 'I hear it too. The whisper beneath the hum.',
      voiceTag: 'GHOST',
      voiceText: 'She is a tuning fork. And so are you.',
      curieActivityChange: 0.05,
      relationshipChange: 3
    }
  },

  // ═══════════════════════════════════════
  // KALE
  // ═══════════════════════════════════════
  kale: {
    LOGIC: {
      id: 'kale_voice_logic',
      text: 'You observe more than you let on.',
      voiceTag: 'LOGIC',
      voiceText: 'Quiet doesn\'t mean unaware. He catalogues everything.'
    },
    INSTINCT: {
      id: 'kale_voice_instinct',
      text: 'Trust your feelings. Even when they scare you.',
      voiceTag: 'INSTINCT',
      voiceText: 'His instincts are sharper than he knows. Help him trust them.',
      relationshipChange: 2
    },
    EMPATHY: {
      id: 'kale_voice_empathy',
      text: 'You\'re not a burden. You never were.',
      voiceTag: 'EMPATHY',
      voiceText: 'He thinks he\'s unwanted. Show him otherwise.',
      relationshipChange: 4
    },
    GHOST: {
      id: 'kale_voice_ghost',
      text: 'The thing beneath... it knows you. Doesn\'t it?',
      voiceTag: 'GHOST',
      voiceText: 'He resonates. Like a bell struck by something ancient.',
      curieActivityChange: 0.08,
      relationshipChange: 1
    }
  }
};

/**
 * Get voice commentary for displaying alongside the choice
 */
export function getVoiceCommentary(npcId, voice) {
  const choice = VOICE_CHOICES[npcId]?.[voice];
  return choice?.voiceText || null;
}

/**
 * Get all voice choices for an NPC
 */
export function getAllVoiceChoices(npcId) {
  return VOICE_CHOICES[npcId] || {};
}

export default VOICE_CHOICES;
