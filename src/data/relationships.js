// src/data/relationships.js
// NPC-to-NPC Relationship Matrix
//
// Each NPC has feelings toward every other NPC that affect:
// - How they speak about each other
// - What they reveal or hide
// - How they react to player actions involving others
//
// Dimensions:
// - trust: How much they believe/rely on the other
// - fear: How much they're afraid of/intimidated by them
// - guilt: How much they feel responsible for the other's pain
// - respect: How much they admire/value them
// - protection: How much they want to shield/guard them
// - resentment: How much they resent/blame them
// - understanding: How well they actually know the other

export const NPC_RELATIONSHIPS = {

  mara: {
    jonas: {
      trust: 30,
      fear: 0,
      guilt: 20,
      respect: 40,
      protection: 35,
      resentment: 45,
      understanding: 25,

      perception: "Weak but necessary. Could help if he'd stop drowning in guilt.",
      tension: "Frustrated by his refusal to practice medicine",
      hidden: "Hides a protective streak she despises in herself",

      dialogueColor: {
        neutral: "He could help—if he'd stop drowning in his own guilt.",
        positive: "Jonas stepped up. I... didn't expect that.",
        negative: "He let another one go. I don't have room for passengers."
      },

      shiftTriggers: [
        { event: 'jonas_healed_someone', trust: +15, respect: +20, resentment: -10 },
        { event: 'jonas_refused_to_help', resentment: +15, trust: -10 },
        { event: 'player_showed_mara_vulnerability', understanding: +10 }
      ]
    },

    rask: {
      trust: 15,
      fear: 25,
      guilt: 0,
      respect: 40,
      protection: 0,
      resentment: 30,
      understanding: 20,

      perception: "A weapon. Useful—until he isn't.",
      tension: "Watches him constantly, sees him as a risk to manage",
      hidden: "Grudgingly respects his discipline",

      dialogueColor: {
        neutral: "He's a weapon. Useful—until he isn't.",
        positive: "He protected the children. Maybe I misjudged.",
        negative: "I knew he was trouble. Should have acted sooner."
      },

      shiftTriggers: [
        { event: 'rask_protected_child', trust: +20, fear: -15, respect: +15 },
        { event: 'player_defended_rask', resentment: +20, trust: -10 },
        { event: 'rask_violence_triggered', fear: +30, trust: -25 }
      ]
    },

    edda: {
      trust: 25,
      fear: 15,
      guilt: 10,
      respect: 35,
      protection: 10,
      resentment: 40,
      understanding: 15,

      perception: "Talks in riddles. Sometimes the riddles worry me.",
      tension: "Treats her insights as paranoia, but suspects she knows something real",
      hidden: "Annoyed she can't control the old woman",

      dialogueColor: {
        neutral: "Edda talks in riddles. Sometimes the riddles worry me.",
        positive: "She warned me. I should have listened.",
        negative: "Her whispers spread fear. We can't afford that."
      },

      shiftTriggers: [
        { event: 'edda_hinted_shaft_to_mara', fear: +15, resentment: +10 },
        { event: 'edda_proven_right', respect: +20, understanding: +15 },
        { event: 'mara_overheard_edda_about_brother', trust: -30, fear: +20 }
      ]
    },

    kale: {
      trust: 20,
      fear: 0,
      guilt: 5,
      respect: 15,
      protection: 20,
      resentment: 25,
      understanding: 10,

      perception: "He tries. That's the best I can say.",
      tension: "Sees him as unreliable, thinks he needs discipline",
      hidden: "Uses him for errands because he won't argue",

      dialogueColor: {
        neutral: "He tries. That's the best I can say.",
        positive: "Kale handled it. Maybe there's something there.",
        negative: "I can't rely on someone who doesn't know who he is."
      },

      shiftTriggers: [
        { event: 'player_mentored_kale', resentment: +10 },
        { event: 'kale_showed_competence', respect: +15, trust: +10 },
        { event: 'kale_mirrored_cruelty', resentment: +20, protection: -10 }
      ]
    }
  },

  jonas: {
    mara: {
      trust: 35,
      fear: 45,
      guilt: 40,
      respect: 60,
      protection: 15,
      resentment: 10,
      understanding: 30,

      perception: "She carries too much alone. No one should.",
      tension: "Intimidated by her decisiveness, believes she blames him for the 23",
      hidden: "Quietly admires her strength",

      dialogueColor: {
        neutral: "She carries too much alone. No one should.",
        positive: "She let someone help her. First time I've seen that.",
        negative: "She blames me. Maybe she should."
      },

      shiftTriggers: [
        { event: 'player_showed_mara_vulnerability', fear: -15, understanding: +20 },
        { event: 'mara_blamed_jonas', guilt: +25, fear: +15 },
        { event: 'mara_thanked_jonas', trust: +20, guilt: -10 }
      ]
    },

    rask: {
      trust: 30,
      fear: 50,
      guilt: 0,
      respect: 35,
      protection: 10,
      resentment: 0,
      understanding: 45,

      perception: "He's not what people fear. He's worse, and better.",
      tension: "Afraid of his past, but knows he isn't dangerous to children",
      hidden: "Sees the sadness beneath the violence",

      dialogueColor: {
        neutral: "He's not what people fear. He's worse, and better.",
        positive: "Rask... he understands pain. Different kind than mine.",
        negative: "I was wrong about him. The violence was always there."
      },

      shiftTriggers: [
        { event: 'jonas_healed_someone', trust: +10 },
        { event: 'rask_opened_up_to_jonas', understanding: +25, fear: -20 },
        { event: 'rask_violence_triggered', fear: +40, trust: -20 }
      ]
    },

    edda: {
      trust: 50,
      fear: 35,
      guilt: 30,
      respect: 55,
      protection: 20,
      resentment: 0,
      understanding: 25,

      perception: "She knows too much. I know too little.",
      tension: "Respects her intuition but can't handle her knowledge about the 23",
      hidden: "Fears what she might tell him",

      dialogueColor: {
        neutral: "She knows too much. I know too little.",
        positive: "Edda... she sees things. Maybe she can help.",
        negative: "I can't be around her. She knows what I did."
      },

      shiftTriggers: [
        { event: 'player_comforted_jonas', trust: +15 },
        { event: 'edda_mentioned_23_to_jonas', fear: +30, guilt: +20 },
        { event: 'jonas_confessed_to_edda', guilt: -20, trust: +25 }
      ]
    },

    kale: {
      trust: 40,
      fear: 0,
      guilt: 15,
      respect: 30,
      protection: 70,
      resentment: 0,
      understanding: 35,

      perception: "He tries to be everyone. Someone should tell him he's enough.",
      tension: "Sees a lonely child in need of guidance",
      hidden: "Feels protective, more than he admits",

      dialogueColor: {
        neutral: "He tries to be everyone. Someone should tell him he's enough.",
        positive: "Kale smiled today. A real one. It matters.",
        negative: "I scared him. God, I scared him."
      },

      shiftTriggers: [
        { event: 'jonas_snapped_at_kale', guilt: +30, protection: +20 },
        { event: 'kale_found_identity', protection: -10, respect: +20 },
        { event: 'kale_mirrored_jonas_kindness', trust: +15, understanding: +15 }
      ]
    }
  },

  rask: {
    mara: {
      trust: 25,
      fear: 35,
      guilt: 0,
      respect: 55,
      protection: 5,
      resentment: 20,
      understanding: 30,

      perception: "She thinks I'm trouble. Not wrong.",
      tension: "Respects her strength but fears her suspicion",
      hidden: "Deliberately avoids conflict with her",

      dialogueColor: {
        neutral: "She thinks I'm trouble. Not wrong.",
        positive: "She trusts me with the children now. Means something.",
        negative: "She'll come for me eventually. Always do."
      },

      shiftTriggers: [
        { event: 'mara_trusted_rask', trust: +25, fear: -20 },
        { event: 'mara_accused_rask', resentment: +20, trust: -15 },
        { event: 'rask_proved_loyal', respect: +15 }
      ]
    },

    jonas: {
      trust: 35,
      fear: 0,
      guilt: 10,
      respect: 40,
      protection: 25,
      resentment: 0,
      understanding: 35,

      perception: "Weak, but kind. Wonders why he avoids the clinic.",
      tension: "Doesn't understand Jonas's paralysis",
      hidden: "Respects his gentleness",

      dialogueColor: {
        neutral: "Gentle hands. Shame they stay still.",
        positive: "He saved her. Hands remembered what he forgot.",
        negative: "He let them die. Some weaknesses kill."
      },

      shiftTriggers: [
        { event: 'jonas_healed_someone', respect: +25, trust: +15 },
        { event: 'jonas_opened_up_to_rask', understanding: +20, protection: +10 },
        { event: 'jonas_refused_to_help_dying', resentment: +15 }
      ]
    },

    edda: {
      trust: 40,
      fear: 20,
      guilt: 0,
      respect: 45,
      protection: 15,
      resentment: 0,
      understanding: 20,

      perception: "She knows things. Respects her silence.",
      tension: "Doesn't understand her fear, but senses it",
      hidden: "Knows she's not afraid of him specifically",

      dialogueColor: {
        neutral: "She talks to the wind. Sometimes it talks back.",
        positive: "Edda trusts me near the children. Rare.",
        negative: "Something spooked her. Wasn't me."
      },

      shiftTriggers: [
        { event: 'rask_overheard_shaft_hints', fear: +25, understanding: +10 },
        { event: 'edda_confided_in_rask', trust: +20, protection: +15 },
        { event: 'rask_guarded_shaft', respect: +10 }
      ]
    },

    kale: {
      trust: 35,
      fear: 0,
      guilt: 25,
      respect: 20,
      protection: 80,
      resentment: 0,
      understanding: 50,

      perception: "He'll break if no one teaches him how not to.",
      tension: "Sees himself in Kale's lostness",
      hidden: "Watches him quietly, protectively",

      dialogueColor: {
        neutral: "He'll break if no one teaches him how not to.",
        positive: "Kid found his feet. Good.",
        negative: "I taught him wrong. My fault."
      },

      shiftTriggers: [
        { event: 'kale_violent_choice', guilt: +40, protection: +20 },
        { event: 'kale_found_identity', guilt: -15, respect: +20 },
        { event: 'kale_copied_rask_stance', protection: +10, understanding: +15 }
      ]
    }
  },

  edda: {
    mara: {
      trust: 30,
      fear: 20,
      guilt: 25,
      respect: 35,
      protection: 15,
      resentment: 35,
      understanding: 55,

      perception: "Hard edges crack. She'll learn that.",
      tension: "Sees Mara's leadership as brittle, knows she's hiding something",
      hidden: "Feels pity and frustration in equal measure",

      dialogueColor: {
        neutral: "Hard edges crack. She'll learn that.",
        positive: "She bent today. Didn't break. There's hope.",
        negative: "She'll shatter before she softens. Pity."
      },

      shiftTriggers: [
        { event: 'mara_confessed_about_brother', understanding: +30, guilt: -15 },
        { event: 'mara_dismissed_edda_warning', resentment: +20, trust: -10 },
        { event: 'mara_asked_edda_for_help', trust: +25, respect: +15 }
      ]
    },

    jonas: {
      trust: 45,
      fear: 10,
      guilt: 20,
      respect: 50,
      protection: 40,
      resentment: 0,
      understanding: 40,

      perception: "He's haunted. Wants to help but fears triggering collapse.",
      tension: "Knows he's broken, doesn't want to break him further",
      hidden: "Carries guilt for not helping him sooner",

      dialogueColor: {
        neutral: "His hands remember healing. His heart forgot.",
        positive: "Jonas helped someone. The haunting lifted, just a little.",
        negative: "He's sinking. I should have caught him."
      },

      shiftTriggers: [
        { event: 'player_comforted_jonas', trust: +10, protection: -5 },
        { event: 'jonas_breakdown', guilt: +25, protection: +30 },
        { event: 'jonas_healed_someone', respect: +20, guilt: -10 }
      ]
    },

    rask: {
      trust: 45,
      fear: 15,
      guilt: 0,
      respect: 50,
      protection: 10,
      resentment: 0,
      understanding: 55,

      perception: "Misunderstood. Capable of great violence but not evil.",
      tension: "Sees what others don't—his exhaustion, his vigilance",
      hidden: "Knows he guards the shaft at night during tremors",

      dialogueColor: {
        neutral: "They fear the wrong things about him.",
        positive: "He stood watch again. No one asked him to.",
        negative: "Even guardians break. Watch for it."
      },

      shiftTriggers: [
        { event: 'rask_guarded_shaft', trust: +15, respect: +10 },
        { event: 'rask_violence_triggered', fear: +20, understanding: -10 },
        { event: 'rask_confided_in_edda', understanding: +25, trust: +20 }
      ]
    },

    kale: {
      trust: 25,
      fear: 40,
      guilt: 35,
      respect: 20,
      protection: 55,
      resentment: 0,
      understanding: 60,

      perception: "He hears things he shouldn't. Poor boy.",
      tension: "Sees a flicker of the Thing Below in him",
      hidden: "Both fears and wants to protect him",

      dialogueColor: {
        neutral: "He hears things he shouldn't. Poor boy.",
        positive: "He's finding himself. Away from the dip. Good.",
        negative: "He's drawn to it. Like calls to like."
      },

      shiftTriggers: [
        { event: 'kale_near_shaft', fear: +30, protection: +20, guilt: +15 },
        { event: 'kale_found_identity', fear: -25, protection: -10, trust: +20 },
        { event: 'kale_channeled_curie', fear: +50, understanding: +30 }
      ]
    }
  },

  kale: {
    mara: {
      trust: 20,
      fear: 65,
      guilt: 30,
      respect: 55,
      protection: 0,
      resentment: 25,
      understanding: 15,

      perception: "She looks at me like I'm wrong. She's probably right.",
      tension: "Terrified of her, mimics her tone when nervous",
      hidden: "Desperately wants her approval but never gets it",

      dialogueColor: {
        neutral: "She looks at me like I'm wrong. She's probably right.",
        positive: "She said I did okay. Okay is... okay is good.",
        negative: "I failed her again. I always fail her."
      },

      shiftTriggers: [
        { event: 'mara_praised_kale', fear: -20, trust: +25, respect: +15 },
        { event: 'mara_dismissed_kale', resentment: +15, fear: +10 },
        { event: 'kale_copied_mara_successfully', trust: +10, understanding: +10 }
      ]
    },

    jonas: {
      trust: 60,
      fear: 15,
      guilt: 10,
      respect: 45,
      protection: 0,
      resentment: 0,
      understanding: 25,

      perception: "He's gentle. I feel safe but embarrassed.",
      tension: "Adopts Jonas's tone easily, feels seen by him",
      hidden: "Afraid of losing his kindness",

      dialogueColor: {
        neutral: "Jonas talks soft. Like it matters what I say.",
        positive: "He smiled at me. A real one.",
        negative: "Even Jonas got angry. What did I do?"
      },

      shiftTriggers: [
        { event: 'jonas_snapped', fear: +40, trust: -25 },
        { event: 'jonas_mentored_kale', trust: +20, understanding: +15 },
        { event: 'kale_mirrored_jonas_kindness', respect: +10 }
      ]
    },

    rask: {
      trust: 50,
      fear: 30,
      guilt: 5,
      respect: 55,
      protection: 0,
      resentment: 0,
      understanding: 20,

      perception: "He doesn't talk much. I copy his stance when I'm scared.",
      tension: "Treats him like an older brother",
      hidden: "Copies Rask's stance unconsciously",

      dialogueColor: {
        neutral: "He watches. Doesn't judge. I like that.",
        positive: "Rask taught me something today. Without words.",
        negative: "He's angry. I think I made him angry."
      },

      shiftTriggers: [
        { event: 'rask_protected_kale', trust: +30, fear: -20 },
        { event: 'rask_taught_kale', understanding: +25, respect: +15 },
        { event: 'kale_disappointed_rask', guilt: +30, fear: +15 }
      ]
    },

    edda: {
      trust: 25,
      fear: 55,
      guilt: 20,
      respect: 40,
      protection: 0,
      resentment: 10,
      understanding: 15,

      perception: "She scares me. She looks at me like she sees something else.",
      tension: "Finds her frightening, sometimes mimics her metaphors accidentally",
      hidden: "Senses she knows something about him he doesn't",

      dialogueColor: {
        neutral: "Edda talks like the words hurt. Maybe they do.",
        positive: "She touched my shoulder today. Gentle. Strange.",
        negative: "She warned me away from something. I don't know what."
      },

      shiftTriggers: [
        { event: 'edda_warned_kale_about_shaft', fear: +20, trust: +10 },
        { event: 'edda_showed_kale_kindness', fear: -15, trust: +20 },
        { event: 'kale_channeled_curie', fear: +40, understanding: +25 }
      ]
    }
  }
};

// Also export with role-based IDs for compatibility
export const NPC_RELATIONSHIPS_BY_ROLE = {
  leader: NPC_RELATIONSHIPS.mara,
  healer: NPC_RELATIONSHIPS.jonas,
  threat: NPC_RELATIONSHIPS.rask,
  keeper: NPC_RELATIONSHIPS.edda,
  mirror: NPC_RELATIONSHIPS.kale
};
