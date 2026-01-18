// src/data/openingScene.js
// All text, timing, and configuration for the opening scene

export const OPENING_SCENE_DATA = {

  // ═══════════════════════════════════════
  // ENVIRONMENTAL ESTABLISHING SHOT
  // ═══════════════════════════════════════

  establishing: {
    lines: [
      "The wind carries dust across a barren ridge.",
      "Ash drifts like slow snowfall, dissolving against old metal fences.",
      "Below, the settlement huddles in a shallow dip in the land—",
      "structures leaning, patched, trembling in the gusts.",
      "A faint hum rolls under the ground.",
      "Barely noticeable. Unclaimed by any machine you can see."
    ],
    timing: [0, 2500, 5000, 7000, 9500, 11500],
    fadeTime: 800,
    holdTime: 2000
  },

  // ═══════════════════════════════════════
  // FIRST VOICE ACTIVATION
  // ═══════════════════════════════════════

  firstVoices: {
    LOGIC: {
      text: "Population low. Structures unstable. Resources uncertain. Risk level: high.",
      delay: 0
    },
    INSTINCT: {
      text: "Gate smells wrong. Metal... afraid.",
      delay: 3000
    },
    EMPATHY: {
      text: "They're holding on to something. All of them. You can feel it from here.",
      delay: 6000
    },
    GHOST: {
      text: "The ground hums your name. Quietly. Not yet yours.",
      delay: 9000
    }
  },

  // ═══════════════════════════════════════
  // RASK GATEKEEPER ENCOUNTER
  // ═══════════════════════════════════════

  raskEncounter: {
    introduction: {
      action: "*He studies you for too long before speaking.*",
      dialogue: "You're new. Or lost. Or trouble. Sometimes they're the same thing."
    },

    playerChoices: [
      {
        id: 'confident',
        text: "Just passing through.",
        tone: 'confident',
        voiceBonus: { LOGIC: 1, INSTINCT: 1 },
        raskResponse: "*His eyes narrow.* Passing through. Right. Everyone's passing through. Until they're not.",
        relationshipDelta: -5,
        voiceReactions: [
          { voice: 'LOGIC', text: "Assessment: he's testing boundaries." },
          { voice: 'INSTINCT', text: "He could break bone. Yours." }
        ]
      },
      {
        id: 'humble',
        text: "I'm here to work, if there's work.",
        tone: 'humble',
        voiceBonus: { EMPATHY: 1 },
        raskResponse: "*A slight shift in his stance.* Work. There's always work. Whether they'll let you do it... different question.",
        relationshipDelta: +5,
        voiceReactions: [
          { voice: 'EMPATHY', text: "He softened. Just slightly. Don't push." },
          { voice: 'INSTINCT', text: "He's tired. Beyond tired." }
        ]
      },
      {
        id: 'curious',
        text: "Is this Ashfall?",
        tone: 'curious',
        voiceBonus: { LOGIC: 1 },
        raskResponse: "What's left of it. *He glances back at the settlement.* Don't let the name fool you. Fire's long gone. Just the ash now.",
        relationshipDelta: 0,
        voiceReactions: [
          { voice: 'LOGIC', text: "Informative response. He's not hostile to questions." },
          { voice: 'GHOST', text: "He stands where the hum doesn't reach. Why?" }
        ]
      },
      {
        id: 'silent',
        text: "*Remain silent.*",
        tone: 'silent',
        voiceBonus: { INSTINCT: 1, GHOST: 1 },
        raskResponse: "*A long pause. Then something like respect.* Fine. Quiet's honest. More than most.",
        relationshipDelta: +10,
        voiceReactions: [
          { voice: 'INSTINCT', text: "He respects the silence. Remember that." },
          { voice: 'GHOST', text: "Words cost him too. He noticed you don't spend them freely." }
        ]
      }
    ],

    exitLines: {
      confident: "Go on, then. *He steps aside.* Don't make me regret it.",
      humble: "*He nods.* Talk to Mara. She decides who stays.",
      curious: "You'll find your answers. Or they'll find you. *He steps aside.*",
      silent: "*He simply steps aside. No more words needed.*"
    },

    // Rare high-relationship variant
    welcomeLine: "...Welcome.",
    welcomeThreshold: 65
  },

  // ═══════════════════════════════════════
  // SETTLEMENT ENTRY GLIMPSES
  // ═══════════════════════════════════════

  settlementGlimpses: [
    {
      npc: 'mara',
      location: 'watchtower',
      description: "On the watchtower, a woman scans the horizon. Her posture says 'control.' Her grip on the railing says something else.",
      voiceHint: { voice: 'LOGIC', text: "Leader. But stretched thin." }
    },
    {
      npc: 'jonas',
      location: 'clinic',
      description: "Outside a small shack, a man sweeps dust that will never leave. His hands are steady. His eyes are somewhere else.",
      voiceHint: { voice: 'EMPATHY', text: "He's pretending. At something. At everything." }
    },
    {
      npc: 'kale',
      location: 'market_square',
      description: "A young man lingers near empty stalls, watching you with cautious fascination. He mirrors your posture before catching himself.",
      voiceHint: { voice: 'INSTINCT', text: "Mimic. Uncertain. Not a threat—but not stable." }
    },
    {
      npc: 'edda',
      location: 'perimeter_path',
      description: "At the edge of the settlement, an old woman pauses mid-step. She felt something. She's looking at you like she expected you.",
      voiceHint: { voice: 'GHOST', text: "She knows things. Careful." }
    }
  ],

  // ═══════════════════════════════════════
  // FIRST TREMOR
  // ═══════════════════════════════════════

  firstTremor: {
    environmental: "A subtle tremor.\nThe well's stones shift softly.",

    npcReactions: {
      mara: { type: 'freeze', visual: "freezes, jaw tight" },
      jonas: { type: 'flinch', visual: "drops whatever he's holding" },
      rask: { type: 'look', visual: "looks toward the shaft instinctively" },
      kale: { type: 'mirror', visual: "mirrors whoever he's watching" },
      edda: { type: 'whisper', visual: 'whispers, "Not again."' }
    },

    voiceReactions: [
      { voice: 'LOGIC', text: "Seismic irregularity. Source unknown." },
      { voice: 'INSTINCT', text: "Danger below. Move." },
      { voice: 'EMPATHY', text: "They're scared. All of them." },
      { voice: 'GHOST', text: "The hum woke. Only slightly. Enough." }
    ],

    ghostWhisper: "It remembers you. Or mistakes you. Both are dangerous."
  },

  // ═══════════════════════════════════════
  // FIRST INTERACTION GUIDANCE
  // ═══════════════════════════════════════

  firstInteractionGuidance: {
    confident: {
      recommendedNpc: 'mara',
      text: "The woman on the watchtower has noticed you. She's waiting.",
      voice: 'LOGIC',
      voiceText: "She's the authority here. Start there."
    },
    humble: {
      recommendedNpc: 'jonas',
      text: "The man by the clinic glances your way. There's recognition in it.",
      voice: 'EMPATHY',
      voiceText: "He sees something in you. Or wants to."
    },
    curious: {
      recommendedNpc: 'kale',
      text: "The young man in the market is studying you. Learning you.",
      voice: 'INSTINCT',
      voiceText: "He's already adapting to you. Interesting."
    },
    silent: {
      recommendedNpc: 'edda',
      text: "The old woman at the perimeter hasn't moved. She's waiting for you specifically.",
      voice: 'GHOST',
      voiceText: "She knew you were coming. Don't ask how."
    }
  },

  // ═══════════════════════════════════════
  // FIRST MEETING VARIANTS
  // ═══════════════════════════════════════

  firstMeetingVariants: {
    mara: {
      recommended: {
        greeting: "*She descends from the watchtower, measuring each step.* You made it past Rask. That's something.",
        tone: 'evaluating'
      },
      notRecommended: {
        greeting: "*She watches you approach. Her expression doesn't change.* I'll get to you. When I'm ready.",
        tone: 'dismissive'
      }
    },
    jonas: {
      recommended: {
        greeting: "*He stops sweeping. Really looks at you.* You're... new. Sorry, I just... it's been a while since someone new.",
        tone: 'surprised_gentle'
      },
      notRecommended: {
        greeting: "*He glances up, then back down.* Mara handles newcomers. I just... I'm just here.",
        tone: 'deflecting'
      }
    },
    rask: {
      recommended: {
        greeting: "*Already met at the gate.*",
        tone: 'established'
      },
      notRecommended: {
        greeting: "*He's already watching you.* We talked. You need something else?",
        tone: 'guarded'
      }
    },
    edda: {
      recommended: {
        greeting: "*She turns before you reach her, as if she heard your footsteps before you made them.* You felt it too. The tremor. The hum beneath the tremor.",
        tone: 'knowing'
      },
      notRecommended: {
        greeting: "*She doesn't turn.* Not yet. Speak to the others first. Then... maybe.",
        tone: 'mysterious_deflection'
      }
    },
    kale: {
      recommended: {
        greeting: "*He straightens when you approach, unconsciously mirroring your posture.* Hi. I mean—hello. You're new. What's it like? Being new, I mean.",
        tone: 'eager_uncertain'
      },
      notRecommended: {
        greeting: "*He watches you pass, then follows at a distance.* (He'll find you later.)",
        tone: 'following'
      }
    }
  },

  // ═══════════════════════════════════════
  // SCENE COMPLETION
  // ═══════════════════════════════════════

  completion: {
    flags: ['opening_complete', 'first_tremor_felt', 'voices_activated'],

    raskFarewells: {
      confident: "You're inside now. Don't make me regret it.",
      humble: "Stay near the light tonight. Just a suggestion.",
      curious: "Answers cost things here. Remember that.",
      silent: "*He nods. Once.*"
    },

    transitionText: "The settlement waits. Where do you go first?"
  },

  // ═══════════════════════════════════════
  // VOICE COLORS (for consistent styling)
  // ═══════════════════════════════════════

  voiceColors: {
    LOGIC: '#88ccff',
    INSTINCT: '#ff8844',
    EMPATHY: '#88ff88',
    GHOST: '#cc88ff'
  }
};
