// src/data/relationshipEvents.js
// Events that trigger relationship shifts between NPCs

export const RELATIONSHIP_EVENTS = {

  // ═══════════════════════════════════════════════════════════════
  // JONAS EVENTS
  // ═══════════════════════════════════════════════════════════════

  jonas_healed_someone: {
    description: "Jonas overcame his paralysis and saved someone",
    affectedRelationships: [
      { from: 'mara', to: 'jonas', changes: { trust: +15, respect: +20, resentment: -10 } },
      { from: 'rask', to: 'jonas', changes: { respect: +25, trust: +15 } },
      { from: 'edda', to: 'jonas', changes: { respect: +20, guilt: -10 } }
    ],
    flags: ['jonas_practiced_medicine']
  },

  jonas_refused_to_help: {
    description: "Jonas refused to help when someone needed medical aid",
    affectedRelationships: [
      { from: 'mara', to: 'jonas', changes: { resentment: +15, trust: -10 } },
      { from: 'rask', to: 'jonas', changes: { resentment: +15 } }
    ],
    flags: ['jonas_refused_aid']
  },

  jonas_snapped: {
    description: "Jonas lost his temper (rare event)",
    affectedRelationships: [
      { from: 'kale', to: 'jonas', changes: { fear: +40, trust: -25 } },
      { from: 'jonas', to: 'kale', changes: { guilt: +30 } }
    ],
    flags: ['jonas_anger_revealed']
  },

  jonas_breakdown: {
    description: "Jonas had an emotional breakdown",
    affectedRelationships: [
      { from: 'edda', to: 'jonas', changes: { guilt: +25, protection: +30 } }
    ],
    flags: ['jonas_breakdown_witnessed']
  },

  jonas_confessed_to_edda: {
    description: "Jonas confessed his role in the 23 to Edda",
    affectedRelationships: [
      { from: 'jonas', to: 'edda', changes: { guilt: -20, trust: +25 } },
      { from: 'edda', to: 'jonas', changes: { understanding: +20, protection: +15 } }
    ],
    flags: ['jonas_confessed_23']
  },

  jonas_opened_up_to_rask: {
    description: "Jonas opened up to Rask about his pain",
    affectedRelationships: [
      { from: 'jonas', to: 'rask', changes: { understanding: +25, fear: -20 } },
      { from: 'rask', to: 'jonas', changes: { understanding: +20, protection: +10 } }
    ],
    flags: ['jonas_rask_bonded']
  },

  // ═══════════════════════════════════════════════════════════════
  // RASK EVENTS
  // ═══════════════════════════════════════════════════════════════

  rask_protected_child: {
    description: "Rask protected a child from danger",
    affectedRelationships: [
      { from: 'mara', to: 'rask', changes: { trust: +20, fear: -15, respect: +15 } },
      { from: 'kale', to: 'rask', changes: { trust: +30, fear: -20 } }
    ],
    flags: ['rask_protected_children']
  },

  rask_violence_triggered: {
    description: "Rask resorted to violence",
    affectedRelationships: [
      { from: 'mara', to: 'rask', changes: { fear: +30, trust: -25 } },
      { from: 'jonas', to: 'rask', changes: { fear: +40, trust: -20 } },
      { from: 'edda', to: 'rask', changes: { fear: +20, understanding: -10 } }
    ],
    flags: ['rask_violence_witnessed']
  },

  rask_guarded_shaft: {
    description: "Rask stood guard at the shaft during tremors",
    affectedRelationships: [
      { from: 'edda', to: 'rask', changes: { trust: +15, respect: +10 } }
    ],
    flags: ['rask_guards_shaft']
  },

  rask_proved_loyal: {
    description: "Rask demonstrated loyalty to the settlement",
    affectedRelationships: [
      { from: 'mara', to: 'rask', changes: { trust: +20, resentment: -15 } },
      { from: 'rask', to: 'mara', changes: { respect: +15 } }
    ],
    flags: ['rask_loyalty_proven']
  },

  rask_confided_in_edda: {
    description: "Rask confided in Edda about what he watches for",
    affectedRelationships: [
      { from: 'edda', to: 'rask', changes: { understanding: +25, trust: +20 } },
      { from: 'rask', to: 'edda', changes: { trust: +15 } }
    ],
    flags: ['rask_edda_confidence']
  },

  rask_taught_kale: {
    description: "Rask taught Kale something (wordlessly)",
    affectedRelationships: [
      { from: 'kale', to: 'rask', changes: { understanding: +25, respect: +15 } },
      { from: 'rask', to: 'kale', changes: { protection: +10 } }
    ],
    flags: ['rask_mentored_kale']
  },

  // ═══════════════════════════════════════════════════════════════
  // MARA EVENTS
  // ═══════════════════════════════════════════════════════════════

  mara_confessed_about_brother: {
    description: "Mara revealed the truth about her brother's involvement",
    affectedRelationships: [
      { from: 'edda', to: 'mara', changes: { understanding: +30, guilt: -15 } }
    ],
    flags: ['mara_brother_truth']
  },

  mara_control_broken: {
    description: "Mara lost control of the settlement",
    affectedRelationships: [
      { from: 'jonas', to: 'mara', changes: { fear: -20, protection: +15 } },
      { from: 'rask', to: 'mara', changes: { respect: -10, protection: +20 } }
    ],
    flags: ['mara_control_lost']
  },

  mara_praised_kale: {
    description: "Mara gave Kale genuine praise",
    affectedRelationships: [
      { from: 'kale', to: 'mara', changes: { fear: -20, trust: +25, respect: +15 } }
    ],
    flags: ['kale_mara_approved']
  },

  mara_dismissed_kale: {
    description: "Mara dismissed or belittled Kale",
    affectedRelationships: [
      { from: 'kale', to: 'mara', changes: { resentment: +15, fear: +10 } }
    ],
    flags: ['kale_mara_dismissed']
  },

  mara_trusted_rask: {
    description: "Mara explicitly trusted Rask with something important",
    affectedRelationships: [
      { from: 'rask', to: 'mara', changes: { trust: +25, fear: -20 } }
    ],
    flags: ['mara_rask_trust']
  },

  mara_accused_rask: {
    description: "Mara accused Rask of wrongdoing",
    affectedRelationships: [
      { from: 'rask', to: 'mara', changes: { resentment: +20, trust: -15 } }
    ],
    flags: ['mara_rask_accused']
  },

  mara_asked_edda_for_help: {
    description: "Mara asked Edda for help or advice",
    affectedRelationships: [
      { from: 'edda', to: 'mara', changes: { trust: +25, respect: +15 } }
    ],
    flags: ['mara_edda_help']
  },

  mara_thanked_jonas: {
    description: "Mara thanked Jonas genuinely",
    affectedRelationships: [
      { from: 'jonas', to: 'mara', changes: { trust: +20, guilt: -10 } }
    ],
    flags: ['mara_jonas_thanked']
  },

  mara_blamed_jonas: {
    description: "Mara blamed Jonas for something",
    affectedRelationships: [
      { from: 'jonas', to: 'mara', changes: { guilt: +25, fear: +15 } }
    ],
    flags: ['mara_jonas_blamed']
  },

  // ═══════════════════════════════════════════════════════════════
  // EDDA EVENTS
  // ═══════════════════════════════════════════════════════════════

  edda_hinted_shaft_to_mara: {
    description: "Edda hinted about the shaft to Mara",
    affectedRelationships: [
      { from: 'mara', to: 'edda', changes: { fear: +15, resentment: +10 } }
    ],
    flags: ['edda_shaft_hint']
  },

  edda_proven_right: {
    description: "One of Edda's warnings proved accurate",
    affectedRelationships: [
      { from: 'mara', to: 'edda', changes: { respect: +20, understanding: +15 } }
    ],
    flags: ['edda_warning_accurate']
  },

  edda_warned_kale_about_shaft: {
    description: "Edda warned Kale to stay away from the shaft",
    affectedRelationships: [
      { from: 'kale', to: 'edda', changes: { fear: +20, trust: +10 } }
    ],
    flags: ['edda_warned_kale']
  },

  edda_showed_kale_kindness: {
    description: "Edda showed unexpected kindness to Kale",
    affectedRelationships: [
      { from: 'kale', to: 'edda', changes: { fear: -15, trust: +20 } }
    ],
    flags: ['edda_kale_kindness']
  },

  edda_mentioned_23_to_jonas: {
    description: "Edda mentioned the 23 in Jonas's presence",
    affectedRelationships: [
      { from: 'jonas', to: 'edda', changes: { fear: +30, guilt: +20 } }
    ],
    flags: ['edda_23_mention']
  },

  // ═══════════════════════════════════════════════════════════════
  // KALE EVENTS
  // ═══════════════════════════════════════════════════════════════

  kale_found_identity: {
    description: "Kale began developing his own identity",
    affectedRelationships: [
      { from: 'edda', to: 'kale', changes: { fear: -25, protection: -10, trust: +20 } },
      { from: 'rask', to: 'kale', changes: { guilt: -15, respect: +20 } },
      { from: 'jonas', to: 'kale', changes: { protection: -10, respect: +20 } }
    ],
    flags: ['kale_identity_forming']
  },

  kale_mirrored_cruelty: {
    description: "Kale mirrored cruel behavior from the player",
    affectedRelationships: [
      { from: 'mara', to: 'kale', changes: { resentment: +20, protection: -10 } },
      { from: 'rask', to: 'kale', changes: { guilt: +40, protection: +20 } }
    ],
    flags: ['kale_cruelty_learned']
  },

  kale_channeled_curie: {
    description: "Kale unknowingly channeled Curie-Δ",
    affectedRelationships: [
      { from: 'edda', to: 'kale', changes: { fear: +50, understanding: +30 } },
      { from: 'kale', to: 'edda', changes: { fear: +40, understanding: +25 } }
    ],
    flags: ['kale_curie_channel']
  },

  kale_near_shaft: {
    description: "Kale was found near the shaft",
    affectedRelationships: [
      { from: 'edda', to: 'kale', changes: { fear: +30, protection: +20, guilt: +15 } }
    ],
    flags: ['kale_near_shaft']
  },

  kale_showed_competence: {
    description: "Kale demonstrated unexpected competence",
    affectedRelationships: [
      { from: 'mara', to: 'kale', changes: { respect: +15, trust: +10 } }
    ],
    flags: ['kale_competent']
  },

  kale_violent_choice: {
    description: "Kale made a violent choice",
    affectedRelationships: [
      { from: 'rask', to: 'kale', changes: { guilt: +40, protection: +20 } }
    ],
    flags: ['kale_violence']
  },

  kale_copied_rask_stance: {
    description: "Kale unconsciously copied Rask's protective stance",
    affectedRelationships: [
      { from: 'rask', to: 'kale', changes: { protection: +10, understanding: +15 } }
    ],
    flags: ['kale_rask_influence']
  },

  kale_mirrored_jonas_kindness: {
    description: "Kale mirrored Jonas's kindness to someone",
    affectedRelationships: [
      { from: 'jonas', to: 'kale', changes: { trust: +15, understanding: +15 } },
      { from: 'kale', to: 'jonas', changes: { respect: +10 } }
    ],
    flags: ['kale_jonas_influence']
  },

  // ═══════════════════════════════════════════════════════════════
  // PLAYER-MEDIATED EVENTS
  // ═══════════════════════════════════════════════════════════════

  player_showed_mara_vulnerability: {
    description: "Player helped Mara show vulnerability",
    affectedRelationships: [
      { from: 'jonas', to: 'mara', changes: { fear: -15, understanding: +20 } },
      { from: 'mara', to: 'jonas', changes: { understanding: +10 } }
    ],
    flags: ['mara_vulnerable_witnessed']
  },

  player_defended_rask: {
    description: "Player defended Rask to Mara",
    affectedRelationships: [
      // Note: This affects player relationship, not NPC-to-NPC
    ],
    flags: ['player_defended_rask']
  },

  player_comforted_jonas: {
    description: "Player comforted Jonas during distress",
    affectedRelationships: [
      { from: 'edda', to: 'jonas', changes: { trust: +15 } }
    ],
    flags: ['jonas_comforted']
  },

  player_mentored_kale: {
    description: "Player took on a mentoring role with Kale",
    affectedRelationships: [
      // Note: This affects player relationship with Mara
    ],
    flags: ['player_kale_mentor']
  },

  player_reconciled_npcs: {
    description: "Player helped reconcile two NPCs",
    affectedRelationships: [],
    flags: ['reconciliation_achieved']
  }
};

// Helper to get all events that affect a specific NPC pair
export function getEventsForPair(npcA, npcB) {
  const events = [];

  for (const [eventName, eventData] of Object.entries(RELATIONSHIP_EVENTS)) {
    const affects = eventData.affectedRelationships.some(
      rel => (rel.from === npcA && rel.to === npcB) ||
             (rel.from === npcB && rel.to === npcA)
    );

    if (affects) {
      events.push({ name: eventName, ...eventData });
    }
  }

  return events;
}

// Helper to get all events involving a specific NPC
export function getEventsInvolvingNpc(npcId) {
  const events = [];

  for (const [eventName, eventData] of Object.entries(RELATIONSHIP_EVENTS)) {
    const involves = eventData.affectedRelationships.some(
      rel => rel.from === npcId || rel.to === npcId
    );

    if (involves) {
      events.push({ name: eventName, ...eventData });
    }
  }

  return events;
}
