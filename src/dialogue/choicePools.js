// src/dialogue/choicePools.js

/**
 * CHOICE POOLS
 *
 * NPC-specific dialogue choices organized by category:
 * - story: Gate-locked, narrative-critical choices
 * - relationship: Unlocked by relationship level
 * - situational: Context-dependent (tension, time, location)
 */

export const CHOICE_POOLS = {
  // ═══════════════════════════════════════
  // MARA - The Pragmatist Leader
  // ═══════════════════════════════════════
  mara: {
    story: [
      // Gate 0 - Available from start
      {
        id: 'mara_settlement_intro',
        text: 'Tell me about Ashfall.',
        voiceTag: null,
        requireGate: 0,
        excludeFlags: ['mara_explained_settlement'],
        setFlags: ['mara_explained_settlement']
      },
      {
        id: 'mara_supplies_status',
        text: 'How are supplies holding up?',
        voiceTag: 'LOGIC',
        requireGate: 0
      },
      // Gate 1 - After initial trust
      {
        id: 'mara_old_world',
        text: 'What was this place before?',
        voiceTag: null,
        requireGate: 1,
        priority: 8
      },
      {
        id: 'mara_leadership',
        text: 'How did you become the leader here?',
        voiceTag: 'EMPATHY',
        requireGate: 1,
        excludeFlags: ['mara_talked_leadership']
      },
      // Gate 2 - Deeper trust
      {
        id: 'mara_fears',
        text: 'What keeps you up at night?',
        voiceTag: 'EMPATHY',
        requireGate: 2,
        priority: 9
      },
      {
        id: 'mara_shaft_knowledge',
        text: 'What do you know about the sealed shaft?',
        voiceTag: 'GHOST',
        requireGate: 2,
        requireFlags: ['shaft_discovered'],
        setFlags: ['mara_shaft_discussed']
      },
      // Gate 3 - Full trust
      {
        id: 'mara_curie_truth',
        text: 'Something is down there, Mara. You know it.',
        voiceTag: 'GHOST',
        requireGate: 3,
        requireFlags: ['heard_curie'],
        priority: 10
      }
    ],
    relationship: [
      {
        id: 'mara_respect',
        text: 'You keep this place running. I respect that.',
        voiceTag: 'LOGIC',
        minRelationship: 40,
        relationshipChange: 3
      },
      {
        id: 'mara_help_offer',
        text: 'Put me to work. I want to help.',
        voiceTag: 'INSTINCT',
        minRelationship: 50,
        relationshipChange: 5
      },
      {
        id: 'mara_burden',
        text: "You don't have to carry this alone.",
        voiceTag: 'EMPATHY',
        minRelationship: 60,
        relationshipChange: 4
      }
    ],
    situational: [
      {
        id: 'mara_tremor_concern',
        text: 'That tremor... should we be worried?',
        voiceTag: 'INSTINCT',
        requireFlags: ['recent_tremor'],
        priority: 7
      },
      {
        id: 'mara_night_watch',
        text: "It's late. Why are you still up?",
        voiceTag: 'EMPATHY',
        timeOfDay: 'night',
        priority: 6
      },
      {
        id: 'mara_high_tension',
        text: "Something's wrong. I can feel it.",
        voiceTag: 'INSTINCT',
        minTension: 70,
        priority: 8
      }
    ]
  },

  // ═══════════════════════════════════════
  // JONAS - The Broken Healer
  // ═══════════════════════════════════════
  jonas: {
    story: [
      {
        id: 'jonas_clinic',
        text: 'Why is the clinic closed?',
        voiceTag: 'EMPATHY',
        requireGate: 0,
        excludeFlags: ['jonas_clinic_discussed']
      },
      {
        id: 'jonas_medical_help',
        text: 'Can you help with injuries?',
        voiceTag: 'LOGIC',
        requireGate: 0
      },
      {
        id: 'jonas_past_practice',
        text: 'You were a doctor before, weren\'t you?',
        voiceTag: 'EMPATHY',
        requireGate: 1,
        excludeFlags: ['jonas_past_discussed']
      },
      {
        id: 'jonas_what_happened',
        text: 'What happened to you, Jonas?',
        voiceTag: 'EMPATHY',
        requireGate: 2,
        priority: 9
      },
      {
        id: 'jonas_patient',
        text: 'Tell me about the patient you lost.',
        voiceTag: 'EMPATHY',
        requireGate: 3,
        requireFlags: ['jonas_mentioned_patient'],
        priority: 10
      }
    ],
    relationship: [
      {
        id: 'jonas_gentle',
        text: 'Take your time. There\'s no rush.',
        voiceTag: 'EMPATHY',
        minRelationship: 30,
        relationshipChange: 3
      },
      {
        id: 'jonas_still_doctor',
        text: 'You\'re still a healer. That doesn\'t go away.',
        voiceTag: 'EMPATHY',
        minRelationship: 50,
        relationshipChange: 5
      },
      {
        id: 'jonas_forgiveness',
        text: 'Forgiving yourself isn\'t betraying them.',
        voiceTag: 'EMPATHY',
        minRelationship: 70,
        relationshipChange: 4,
        priority: 8
      }
    ],
    situational: [
      {
        id: 'jonas_drinking',
        text: 'How much have you had tonight?',
        voiceTag: 'LOGIC',
        timeOfDay: 'night',
        priority: 5
      },
      {
        id: 'jonas_injury_help',
        text: 'Someone\'s hurt. We need your help.',
        voiceTag: 'INSTINCT',
        requireFlags: ['settlement_injury'],
        priority: 9
      }
    ]
  },

  // ═══════════════════════════════════════
  // RASK - The Silent Protector
  // ═══════════════════════════════════════
  rask: {
    story: [
      {
        id: 'rask_watching',
        text: 'What are you watching for?',
        voiceTag: 'LOGIC',
        requireGate: 0
      },
      {
        id: 'rask_danger',
        text: 'Is it dangerous here?',
        voiceTag: 'INSTINCT',
        requireGate: 0
      },
      {
        id: 'rask_past_soldier',
        text: 'You were military, weren\'t you?',
        voiceTag: 'LOGIC',
        requireGate: 1,
        excludeFlags: ['rask_military_discussed']
      },
      {
        id: 'rask_children',
        text: 'You watch the children closely.',
        voiceTag: 'EMPATHY',
        requireGate: 1,
        priority: 7
      },
      {
        id: 'rask_what_guards',
        text: 'What exactly are you guarding us from?',
        voiceTag: 'INSTINCT',
        requireGate: 2,
        priority: 9
      },
      {
        id: 'rask_shaft_guards',
        text: 'Why do you never go near the shaft?',
        voiceTag: 'GHOST',
        requireGate: 3,
        requireFlags: ['shaft_discovered'],
        priority: 10
      }
    ],
    relationship: [
      {
        id: 'rask_silent',
        text: '*Sit in silence with him*',
        voiceTag: null,
        minRelationship: 30,
        relationshipChange: 4
      },
      {
        id: 'rask_respect_quiet',
        text: 'I understand. Words aren\'t always necessary.',
        voiceTag: 'EMPATHY',
        minRelationship: 50,
        relationshipChange: 5
      },
      {
        id: 'rask_trust_back',
        text: 'I\'ll watch your back if you watch mine.',
        voiceTag: 'INSTINCT',
        minRelationship: 60,
        relationshipChange: 4
      }
    ],
    situational: [
      {
        id: 'rask_perimeter_check',
        text: 'Need company on patrol?',
        voiceTag: 'INSTINCT',
        location: 'perimeter',
        priority: 6
      },
      {
        id: 'rask_threat',
        text: 'You sense something. What is it?',
        voiceTag: 'INSTINCT',
        minTension: 60,
        priority: 8
      }
    ]
  },

  // ═══════════════════════════════════════
  // EDDA - The Oracle
  // ═══════════════════════════════════════
  edda: {
    story: [
      {
        id: 'edda_hum',
        text: 'Do you hear that hum?',
        voiceTag: 'GHOST',
        requireGate: 0,
        excludeFlags: ['edda_hum_discussed'],
        setFlags: ['edda_hum_discussed'],
        curieActivityChange: 0.05
      },
      {
        id: 'edda_history',
        text: 'How long have you been here?',
        voiceTag: null,
        requireGate: 0
      },
      {
        id: 'edda_visions',
        text: 'You see things others don\'t.',
        voiceTag: 'GHOST',
        requireGate: 1,
        priority: 8
      },
      {
        id: 'edda_shaft_sealed',
        text: 'What\'s behind the sealed shaft?',
        voiceTag: 'GHOST',
        requireGate: 2,
        requireFlags: ['shaft_discovered'],
        curieActivityChange: 0.1,
        priority: 9
      },
      {
        id: 'edda_curie_name',
        text: 'Who is Curie?',
        voiceTag: 'GHOST',
        requireGate: 3,
        requireFlags: ['heard_curie_name'],
        curieActivityChange: 0.15,
        priority: 10
      }
    ],
    relationship: [
      {
        id: 'edda_listen',
        text: 'I\'m listening. Take your time.',
        voiceTag: 'EMPATHY',
        minRelationship: 30,
        relationshipChange: 3
      },
      {
        id: 'edda_believe',
        text: 'I believe you. Even if no one else does.',
        voiceTag: 'EMPATHY',
        minRelationship: 50,
        relationshipChange: 5
      },
      {
        id: 'edda_together',
        text: 'We\'ll face what\'s coming. Together.',
        voiceTag: 'EMPATHY',
        minRelationship: 70,
        relationshipChange: 4
      }
    ],
    situational: [
      {
        id: 'edda_tremor_meaning',
        text: 'That tremor... what does it mean?',
        voiceTag: 'GHOST',
        requireFlags: ['recent_tremor'],
        curieActivityChange: 0.05,
        priority: 8
      },
      {
        id: 'edda_night_whispers',
        text: 'The nights are worse, aren\'t they?',
        voiceTag: 'GHOST',
        timeOfDay: 'night',
        priority: 7
      }
    ]
  },

  // ═══════════════════════════════════════
  // KALE - The Resonant Youth
  // ═══════════════════════════════════════
  kale: {
    story: [
      {
        id: 'kale_self',
        text: 'Tell me about yourself.',
        voiceTag: 'EMPATHY',
        requireGate: 0,
        excludeFlags: ['kale_intro_done']
      },
      {
        id: 'kale_others_opinion',
        text: 'What do you think of the others?',
        voiceTag: null,
        requireGate: 0
      },
      {
        id: 'kale_strange_feeling',
        text: 'Do you ever feel... strange here?',
        voiceTag: 'GHOST',
        requireGate: 1,
        curieActivityChange: 0.05,
        priority: 7
      },
      {
        id: 'kale_voices',
        text: 'You hear them too, don\'t you? The voices.',
        voiceTag: 'GHOST',
        requireGate: 2,
        curieActivityChange: 0.1,
        priority: 9
      },
      {
        id: 'kale_connection',
        text: 'Something connects you to this place. What is it?',
        voiceTag: 'GHOST',
        requireGate: 3,
        requireFlags: ['kale_resonance_visible'],
        curieActivityChange: 0.15,
        priority: 10
      }
    ],
    relationship: [
      {
        id: 'kale_encourage',
        text: 'You\'re stronger than you think.',
        voiceTag: 'EMPATHY',
        minRelationship: 40,
        relationshipChange: 4
      },
      {
        id: 'kale_belong',
        text: 'You belong here. Don\'t let anyone tell you otherwise.',
        voiceTag: 'EMPATHY',
        minRelationship: 55,
        relationshipChange: 5
      },
      {
        id: 'kale_protect',
        text: 'I won\'t let anything happen to you.',
        voiceTag: 'INSTINCT',
        minRelationship: 70,
        relationshipChange: 4,
        priority: 8
      }
    ],
    situational: [
      {
        id: 'kale_nightmare',
        text: 'Couldn\'t sleep either?',
        voiceTag: 'EMPATHY',
        timeOfDay: 'night',
        priority: 6
      },
      {
        id: 'kale_tremor_felt',
        text: 'That tremor... you felt it more than the rest of us.',
        voiceTag: 'GHOST',
        requireFlags: ['recent_tremor'],
        curieActivityChange: 0.05,
        priority: 8
      },
      {
        id: 'kale_shaft_drawn',
        text: 'Why do you keep looking toward the shaft?',
        voiceTag: 'GHOST',
        location: 'sealed_shaft',
        curieActivityChange: 0.1,
        priority: 9
      }
    ]
  }
};

export default CHOICE_POOLS;
