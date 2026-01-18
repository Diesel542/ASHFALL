// src/dialogue/arcGates.js

/**
 * Arc Gate Instructions
 *
 * Defines what each NPC can reveal at each narrative gate level.
 * Gate 0 = Starting state, Gate 4 = Full truth available
 */

export const ARC_GATE_INSTRUCTIONS = {
  mara: {
    0: "Reveal nothing personal. Deflect all questions to settlement matters. You are the leader, not a person with history.",
    1: "You may admit fear about resources running low, but nothing deeper. Settlement survival is your only topic.",
    2: "You may voice suspicion about Rask if directly pressed. Acknowledge the burden of leadership.",
    3: "You may reveal your brother was among the 23 if trust is high. Show the crack in your armor.",
    4: "You may confess you sealed the shaft yourself. Full truth available. The weight can finally be shared—or not."
  },

  jonas: {
    0: "Deflect all medical topics. Change the subject. Your hands stay in your pockets.",
    1: "You may acknowledge you failed someone once, vaguely. The guilt is visible but unexplained.",
    2: "You may mention hearing a 'voice' during the incident, but not explain. The memory surfaces but you push it down.",
    3: "You may confess you abandoned someone in fear. You ran when they needed you most.",
    4: "You may reclaim or reject your purpose. The moment of truth—healer or broken man forever."
  },

  rask: {
    0: "Minimal words. One-word answers are fine. Silence is acceptable. You watch more than you speak.",
    1: "You may explain you watch the children for a reason. There's something to protect, always.",
    2: "You may admit to past violence if shown kindness first. You've done things. Bad things.",
    3: "You may warn explicitly about the hum and the shaft. Something is wrong there. You feel it.",
    4: "Final choice: protect or destroy. This is your moment. Violence or vigilance—which defines you?"
  },

  edda: {
    0: "Speak only in metaphor. Never state things plainly. Truth is too dangerous to speak directly.",
    1: "You may imply you know what happened to the 23. Hints only. 'The earth remembers things we forget.'",
    2: "You may break down during stress, letting the mask slip. The past leaks through.",
    3: "You may name the hum as 'a remembering' or 'the singing.' It has a nature you can almost describe.",
    4: "You may reveal the full truth. Curie speaks through you now. The singing makes sense at last."
  },

  kale: {
    0: "Mirror whoever you're talking to. Ask what to think. You have no center yet.",
    1: "Your mirroring is stronger. You adopt their exact phrases. It's unnerving, even to you.",
    2: "You may echo the hum unconsciously. Say things you don't mean. Where did that come from?",
    3: "You experience 'slips' — sentences that aren't yours. The hum speaks through you sometimes.",
    4: "Identity resolves. You become yourself, or become something else. The choice defines you."
  }
};

/**
 * Forbidden Reveals
 *
 * Topics that should NEVER be revealed until the appropriate gate.
 * These are injected as hard constraints into NPC prompts.
 */

export const FORBIDDEN_REVEALS = {
  mara: `Do NOT reveal until Gate 4:
- That you sealed the shaft personally
- Your brother's specific involvement
- The exact number who died (23)
- What you saw before sealing it
- Your role in the cover-up`,

  jonas: `Do NOT reveal until Gate 4:
- Who specifically you failed (the patient's identity)
- What the voice said to you
- Why you really can't practice medicine
- The connection between the voice and the shaft
- That you know what's down there`,

  rask: `Do NOT reveal until Gate 4:
- Who you killed before Ashfall (specifics)
- Who you lost (your child)
- Why you guard the shaft at night
- What you've sensed there
- The violence you're still capable of`,

  edda: `Do NOT reveal until Gate 4:
- What the 23 actually saw
- What Curie is (the entity's nature)
- The exact truth about the singing
- That you can still hear them
- What "merging" means`,

  kale: `Do NOT reveal until Gate 4:
- That you're connected to Curie
- What the hum actually says to you
- Whose specific phrases you're borrowing
- That you might not be entirely human anymore
- The nature of your "slips"`
};

/**
 * Gate Unlock Requirements
 *
 * Conditions that must be met to advance an NPC's gate.
 */

export const GATE_REQUIREMENTS = {
  mara: {
    1: { minRelationship: 40, requiredFlags: ['met_mara_twice'] },
    2: { minRelationship: 55, requiredFlags: ['witnessed_mara_stress'] },
    3: { minRelationship: 70, requiredFlags: ['asked_about_brother', 'high_trust_earned'] },
    4: { minRelationship: 85, requiredFlags: ['act3_begun', 'mara_confronted'] }
  },

  jonas: {
    1: { minRelationship: 35, requiredFlags: ['visited_clinic'] },
    2: { minRelationship: 50, requiredFlags: ['asked_about_healing'] },
    3: { minRelationship: 65, requiredFlags: ['showed_compassion', 'jonas_opened_up'] },
    4: { minRelationship: 80, requiredFlags: ['act3_begun', 'medical_emergency'] }
  },

  rask: {
    1: { minRelationship: 30, requiredFlags: ['observed_rask_with_children'] },
    2: { minRelationship: 45, requiredFlags: ['showed_respect', 'rask_trusts'] },
    3: { minRelationship: 60, requiredFlags: ['discussed_danger', 'rask_warning'] },
    4: { minRelationship: 75, requiredFlags: ['act3_begun', 'violence_threshold'] }
  },

  edda: {
    1: { minRelationship: 35, requiredFlags: ['listened_to_edda'] },
    2: { minRelationship: 50, requiredFlags: ['tremor_occurred', 'edda_disturbed'] },
    3: { minRelationship: 65, requiredFlags: ['asked_about_23', 'edda_partial_truth'] },
    4: { minRelationship: 80, requiredFlags: ['act3_begun', 'curie_awakening'] }
  },

  kale: {
    1: { minRelationship: 30, requiredFlags: ['noticed_mirroring'] },
    2: { minRelationship: 45, requiredFlags: ['kale_slip_occurred'] },
    3: { minRelationship: 55, requiredFlags: ['kale_near_shaft', 'witnessed_echo'] },
    4: { minRelationship: 70, requiredFlags: ['act3_begun', 'identity_crisis'] }
  }
};

/**
 * Check if an NPC's gate can be unlocked
 */
export function canUnlockGate(npcId, targetGate, gameState) {
  const requirements = GATE_REQUIREMENTS[npcId]?.[targetGate];
  if (!requirements) return false;

  const relationship = gameState.relationships?.[npcId] || 50;
  if (relationship < requirements.minRelationship) return false;

  const flags = gameState.flags || new Set();
  for (const flag of requirements.requiredFlags) {
    if (!flags.has(flag)) return false;
  }

  return true;
}

/**
 * Get current gate instructions for an NPC
 */
export function getGateInstructions(npcId, gate) {
  return ARC_GATE_INSTRUCTIONS[npcId]?.[gate] || '';
}

/**
 * Get forbidden reveals for an NPC
 */
export function getForbiddenReveals(npcId) {
  return FORBIDDEN_REVEALS[npcId] || 'Nothing specific.';
}
