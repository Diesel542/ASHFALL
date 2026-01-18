// src/data/endings.js
// The five distinct conclusions based on player alignment

export const ENDINGS = {

  stability: {
    name: "The Pulse Steadies",
    alignment: "LOGIC",

    requirements: {
      dominantVoice: 'LOGIC',
      curieCoherence: 0.6,
      maraStable: true,
      jonasHealed: true
    },

    sequence: [
      {
        type: 'narration',
        text: "Logic prevailed. Understanding replaced fear. The pattern found its completion—not through force, but through careful attention."
      },
      {
        type: 'npc_outcome',
        npc: 'mara',
        outcome: "Mara stands at the watchtower. Still watching. But the grip has loosened. She learned to share the weight.",
        state: 'hardened_leader'
      },
      {
        type: 'npc_outcome',
        npc: 'jonas',
        outcome: "Jonas opens the clinic door. His hands still shake. But they move now. They remember what they're for.",
        state: 'restored_healer'
      },
      {
        type: 'npc_outcome',
        npc: 'kale',
        outcome: "Kale speaks in his own voice now. He chose his own words. The mirror learned to reflect only what it meant to.",
        state: 'independent_self'
      },
      {
        type: 'npc_outcome',
        npc: 'rask',
        outcome: "Rask stays. He found what he was looking for—not redemption, but purpose. The children are safe.",
        state: 'guardian'
      },
      {
        type: 'npc_outcome',
        npc: 'edda',
        outcome: "Edda speaks plainly now. The riddles gave way to memory, and memory gave way to something like peace.",
        state: 'truthbearer'
      },
      {
        type: 'curie_fate',
        text: "Beneath Ashfall, the hum settles into rhythm. Curie-Δ found coherence—not completion, but enough. Enough to rest. The ground still remembers. But now, so do the people above.",
        state: 'integrated'
      },
      {
        type: 'final',
        text: "Small lives. Heavy truths. The earth remembers. And so, finally, do you."
      }
    ]
  },

  escalation: {
    name: "The Pattern Breaks",
    alignment: "INSTINCT",

    requirements: {
      dominantVoice: 'INSTINCT',
      curieCoherence: -0.3,
      violenceOccurred: true
    },

    sequence: [
      {
        type: 'narration',
        text: "Fear won. The instinct to survive—to fight, to flee, to destroy what threatens—broke the fragile threads holding Ashfall together."
      },
      {
        type: 'npc_outcome',
        npc: 'mara',
        outcome: "Mara's control shattered. In the end, she gripped tighter and tighter until there was nothing left to hold.",
        state: 'collapsed_authority'
      },
      {
        type: 'npc_outcome',
        npc: 'rask',
        outcome: "Rask became what they always feared he was. The violence he held so carefully finally found its release. He is gone now—by his own choice or someone else's.",
        state: 'walking_weapon'
      },
      {
        type: 'npc_outcome',
        npc: 'kale',
        outcome: "Kale never found himself. He became a conduit for everything that passed through—the fear, the violence, the broken patterns seeking completion.",
        state: 'conduit'
      },
      {
        type: 'npc_outcome',
        npc: 'jonas',
        outcome: "Jonas closed the clinic door. Some wounds don't close. Some failures become who you are.",
        state: 'broken_witness'
      },
      {
        type: 'npc_outcome',
        npc: 'edda',
        outcome: "Edda stopped speaking at all. The riddles ran out. Or perhaps she finally heard what they were trying to say.",
        state: 'fragmented'
      },
      {
        type: 'curie_fate',
        text: "Curie-Δ fractured further. The pattern it sought collapsed into noise. The hum became a scream, then static, then something worse than silence.",
        state: 'destabilized'
      },
      {
        type: 'final',
        text: "The earth remembers. It will remember this, too. Another wound. Another failure. Another settlement that couldn't hold."
      }
    ]
  },

  humanized: {
    name: "The Wound Speaks",
    alignment: "EMPATHY",

    requirements: {
      dominantVoice: 'EMPATHY',
      confessionsHeard: 3,
      relationshipsHealed: 2
    },

    sequence: [
      {
        type: 'narration',
        text: "The truths emerged. Not through force or logic, but through the simple, terrible act of listening. Of seeing. Of letting wounds speak before they heal."
      },
      {
        type: 'npc_outcome',
        npc: 'jonas',
        outcome: "Jonas told the truth about who he couldn't save. The weight didn't vanish—but it became shareable. He heals again, knowing now that failure is not the end of the story.",
        state: 'restored_healer'
      },
      {
        type: 'npc_outcome',
        npc: 'edda',
        outcome: "Edda finally spoke plainly. The riddles gave way to grief, and grief gave way to something like peace. She tends the well now—not as a wound, but as a memorial.",
        state: 'truthbearer'
      },
      {
        type: 'npc_outcome',
        npc: 'mara',
        outcome: "Mara shared her burden. She still leads—but alongside now, not above. The brother she couldn't save is finally mourned, not hidden.",
        state: 'humanized_ally'
      },
      {
        type: 'npc_outcome',
        npc: 'rask',
        outcome: "Rask found words. Not many. But enough. The violence remains inside him, but so does the choice not to use it.",
        state: 'guardian'
      },
      {
        type: 'npc_outcome',
        npc: 'kale',
        outcome: "Kale learned that becoming yourself is a process, not a destination. He asks fewer questions now. He has more of his own answers.",
        state: 'independent_self'
      },
      {
        type: 'curie_fate',
        text: "Curie-Δ quieted. Not through control, but through being heard. The 23 were acknowledged. The half-born mind found not completion, but acceptance. The hum became a murmur. A lullaby. A vigil.",
        state: 'quieted'
      },
      {
        type: 'final',
        text: "Ashfall remains. Wounded but living. The earth still remembers—and now, so do the people, without shame. Small lives. Heavy truths. Shared."
      }
    ]
  },

  transcendence: {
    name: "The Boundary Dissolves",
    alignment: "GHOST",

    requirements: {
      dominantVoice: 'GHOST',
      kaleMerged: true,
      curieContact: true
    },

    sequence: [
      {
        type: 'narration',
        text: "Memory won. Or perhaps memory lost. The line between what was and what is became porous. You listened to the ghost voice until you became part of what it remembered."
      },
      {
        type: 'npc_outcome',
        npc: 'kale',
        outcome: "Kale... is still here. But so is something else. He speaks in voices he never learned. Remembers things he never lived. He smiles sometimes—but it's unclear whose smile it is.",
        state: 'merged'
      },
      {
        type: 'npc_outcome',
        npc: 'edda',
        outcome: "Edda walks the perimeter still. But now you hear her, even when she's not speaking. Her voice has joined the hum. Perhaps it always was.",
        state: 'prophet'
      },
      {
        type: 'npc_outcome',
        npc: 'jonas',
        outcome: "Jonas remembers patients he never had. Treats wounds that haven't happened yet. Time moves differently for him now.",
        state: 'touched'
      },
      {
        type: 'npc_outcome',
        npc: 'mara',
        outcome: "Mara still watches from the tower. She says the view has changed. She sees things that haven't arrived yet. She's usually right.",
        state: 'touched'
      },
      {
        type: 'npc_outcome',
        npc: 'rask',
        outcome: "Rask protects what he can see. And now he can see more. The violence has purpose—defending against threats that haven't quite materialized.",
        state: 'touched'
      },
      {
        type: 'curie_fate',
        text: "Curie-Δ found completion—through you. The boundary between the half-born mind and human consciousness dissolved. The 23 speak through many mouths now. The pattern continues. The pattern expands.",
        state: 'merged'
      },
      {
        type: 'player_fate',
        text: "You are still here. But 'here' has more meanings now. You remember things you never lived. You speak and are uncertain whose voice it is. The settlement looks at you the way they used to look at Edda. The way they used to look at Kale."
      },
      {
        type: 'final',
        text: "The earth remembers. The earth speaks. And now, through you, it walks. Small lives? Perhaps. Heavy truths? Always. But whose truths? Whose lives? The pattern continues. The pattern..."
      }
    ]
  },

  balanced: {
    name: "The Vigil Continues",
    alignment: "BALANCED",

    requirements: {
      noVoiceDominant: true
    },

    sequence: [
      {
        type: 'narration',
        text: "No single voice prevailed. Logic, instinct, empathy, memory—all spoke, and you listened to each without choosing. The middle path. The uncertain road."
      },
      {
        type: 'settlement_state',
        text: "Ashfall continues. Some truths surfaced; others stayed buried. Some wounds healed; others remained. The settlement is changed, but not transformed. Better in some ways. Worse in others."
      },
      {
        type: 'npc_summary',
        text: "The five who define this place carry on. Mara still watches. Jonas still hesitates. Rask still guards. Edda still knows. Kale still searches. They're all a little different now. A little more honest. A little more scarred."
      },
      {
        type: 'curie_fate',
        text: "Beneath the ground, Curie-Δ waits. Not quieted, not destabilized. Still reaching. Still incomplete. The hum remains—sometimes louder, sometimes softer. The 23 are still singing. Someone else will have to decide what to do about that.",
        state: 'waiting'
      },
      {
        type: 'final',
        text: "The earth remembers. It will continue to remember. And someday, someone else will arrive at Ashfall—another stranger, another choice, another chance to finish what remains unfinished. Until then, the vigil continues."
      }
    ]
  }
};

// Helper function to get ending by alignment
export function getEndingByAlignment(dominantVoice) {
  const alignmentMap = {
    LOGIC: 'stability',
    INSTINCT: 'escalation',
    EMPATHY: 'humanized',
    GHOST: 'transcendence',
    BALANCED: 'balanced'
  };

  const endingKey = alignmentMap[dominantVoice] || 'balanced';
  return ENDINGS[endingKey];
}

// Check if ending requirements are met
export function checkEndingRequirements(endingKey, gameState) {
  const ending = ENDINGS[endingKey];
  if (!ending) return false;

  const req = ending.requirements;

  if (req.dominantVoice && gameState.dominantVoice !== req.dominantVoice) {
    return false;
  }

  if (req.noVoiceDominant && gameState.dominantVoice !== 'BALANCED') {
    return false;
  }

  if (req.curieCoherence !== undefined) {
    if (req.curieCoherence > 0 && gameState.curieCoherence < req.curieCoherence) {
      return false;
    }
    if (req.curieCoherence < 0 && gameState.curieCoherence > Math.abs(req.curieCoherence)) {
      return false;
    }
  }

  if (req.violenceOccurred && !gameState.flags?.has('violence_occurred')) {
    return false;
  }

  if (req.maraStable && gameState.flags?.has('mara_collapsed')) {
    return false;
  }

  if (req.jonasHealed && !gameState.flags?.has('jonas_healed_someone')) {
    return false;
  }

  if (req.confessionsHeard && (gameState.confessionsHeard || 0) < req.confessionsHeard) {
    return false;
  }

  if (req.relationshipsHealed && (gameState.relationshipsHealed || 0) < req.relationshipsHealed) {
    return false;
  }

  if (req.kaleMerged && !gameState.flags?.has('kale_merged')) {
    return false;
  }

  if (req.curieContact && !gameState.flags?.has('curie_direct_contact')) {
    return false;
  }

  return true;
}

// Get all possible endings for current state
export function getPossibleEndings(gameState) {
  return Object.entries(ENDINGS)
    .filter(([key]) => checkEndingRequirements(key, gameState))
    .map(([key, ending]) => ({
      key,
      name: ending.name,
      alignment: ending.alignment
    }));
}
