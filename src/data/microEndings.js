// src/data/microEndings.js
// Individual NPC fate resolutions that accent the main ending

export const MICRO_ENDINGS = {

  rask: {
    lives_guardian: {
      conditions: { protected_someone: true, violence_controlled: true },
      text: "Rask stays. He found what he was looking for—not redemption, but purpose. He still doesn't talk much. But the children are safe. That's enough.",
      trigger: 'rask_final_choice_protect',
      state: 'guardian'
    },
    lives_weapon: {
      conditions: { violence_triggered: true, survived: true },
      text: "Rask survives, but something in him broke loose. He leaves Ashfall the same way he arrived—with blood on his boots and no story to tell.",
      trigger: 'rask_final_choice_destroy',
      state: 'weapon'
    },
    dies_sacrifice: {
      conditions: { children_threatened: true, chose_sacrifice: true },
      text: "Rask placed himself between the children and the danger. He didn't hesitate. In the end, that was all he wanted—one clean choice. One clear purpose.",
      trigger: 'rask_sacrifice',
      state: 'sacrifice'
    },
    dies_violence: {
      conditions: { violence_triggered: true, escalation_ending: true },
      text: "Rask died as they always expected him to—violently, suddenly, alone. But in his last moments, he looked toward the children's yard. They were safe. That was enough.",
      trigger: 'rask_killed',
      state: 'fallen'
    }
  },

  jonas: {
    heals_again: {
      conditions: { healed_someone: true, clinic_reopened: true },
      text: "Jonas opens the clinic. The dust is cleared. His hands still shake, but they move. The first patient he treats weeps. So does he.",
      trigger: 'jonas_restored',
      state: 'healer'
    },
    fails_again: {
      conditions: { refused_to_heal: true, someone_died: true },
      text: "Another one he couldn't save. Jonas closes the clinic door for the last time. Some wounds don't close.",
      trigger: 'jonas_final_failure',
      state: 'broken'
    },
    sacrifices: {
      conditions: { act3: true, critical_moment: true, chose_sacrifice: true },
      text: "In the end, Jonas found his purpose—not by saving someone, but by choosing who to stand beside when it mattered. His last act was medical. His last words were 'I'm sorry. I should have been here sooner.'",
      trigger: 'jonas_sacrifice',
      state: 'sacrifice'
    },
    touched: {
      conditions: { ghost_dominant: true, curie_contact: true },
      text: "Jonas remembers patients he never had. Treats wounds that haven't happened yet. Time moves differently for him now. He says it helps. No one knows if they believe him.",
      trigger: 'jonas_touched',
      state: 'touched'
    }
  },

  mara: {
    stabilizes: {
      conditions: { control_maintained: true, burden_shared: true },
      text: "Mara still watches from the tower. But she comes down more often now. She learned that control and care aren't the same thing—and that the second one matters more.",
      trigger: 'mara_stable',
      state: 'leader'
    },
    breaks: {
      conditions: { control_lost: true, confession_forced: true },
      text: "Mara tried to hold it all together. She gripped until her hands bled. In the end, she was the one who shattered.",
      trigger: 'mara_collapse',
      state: 'broken'
    },
    hardens: {
      conditions: { logic_dominant: true, no_confession: true },
      text: "Mara survived by becoming stone. The settlement follows her still—not out of love, but because stone is steady. No one knows what she's buried. No one asks.",
      trigger: 'mara_hardened',
      state: 'hardened'
    },
    humanized: {
      conditions: { empathy_dominant: true, confession_given: true },
      text: "Mara shared her burden. The brother she lost is finally mourned openly. She leads differently now—with the settlement, not above it. The tower feels less like a prison.",
      trigger: 'mara_humanized',
      state: 'humanized'
    }
  },

  kale: {
    becomes_himself: {
      conditions: { player_mentored_kindly: true, identity_formed: true },
      text: "Kale stops mirroring. He chooses his own words now—sometimes wrong, sometimes strange, but his. The first opinion he voices without asking is: 'I think I like the sunrise.'",
      trigger: 'kale_independent',
      state: 'independent'
    },
    becomes_conduit: {
      conditions: { ghost_dominant: true, curie_contact: true },
      text: "Kale is still here. But so are they. He speaks in voices he never learned. The settlement watches him the way they used to watch the shaft—with fear, with awe, with terrible hope.",
      trigger: 'kale_merged',
      state: 'conduit'
    },
    shatters: {
      conditions: { player_mirrored_cruelty: true, no_identity_formed: true },
      text: "Kale tried to be everyone and became no one. The mirror cracked. The pieces don't fit together anymore.",
      trigger: 'kale_broken',
      state: 'broken'
    },
    partial: {
      conditions: { no_dominant_influence: true },
      text: "Kale is still searching. Still asking what to think, what to feel, who to be. But now he knows that searching is part of the answer.",
      trigger: 'kale_searching',
      state: 'searching'
    }
  },

  edda: {
    prophet: {
      conditions: { ghost_dominant: true, truth_revealed: true },
      text: "Edda walks the perimeter still. But now you hear her, even when she's not speaking. Her voice has joined the hum. Perhaps it always was. Perhaps it always will be.",
      trigger: 'edda_prophet',
      state: 'prophet'
    },
    truthbearer: {
      conditions: { empathy_dominant: true, confession_shared: true },
      text: "Edda finally spoke plainly. The riddles gave way to grief, and grief gave way to something like peace. She tends the well now—not as a wound, but as a memorial.",
      trigger: 'edda_truthbearer',
      state: 'truthbearer'
    },
    fragmented: {
      conditions: { stress_broken: true, too_much_pressure: true },
      text: "Edda stopped speaking in riddles. She stopped speaking at all. The weight of what she knows finally crushed the voice that carried it.",
      trigger: 'edda_fragmented',
      state: 'fragmented'
    },
    keeper: {
      conditions: { balanced_ending: true },
      text: "Edda continues her vigil. The riddles remain. The truth stays where it's always been—half-spoken, half-hidden, waiting for someone who knows how to listen.",
      trigger: 'edda_keeper',
      state: 'keeper'
    }
  }
};

// Get micro ending for NPC based on conditions
export function getNpcMicroEnding(npcId, gameState) {
  const npcEndings = MICRO_ENDINGS[npcId];
  if (!npcEndings) return null;

  for (const [key, ending] of Object.entries(npcEndings)) {
    if (checkMicroEndingConditions(ending.conditions, gameState)) {
      return {
        key,
        ...ending
      };
    }
  }

  return null;
}

// Check if micro ending conditions are met
function checkMicroEndingConditions(conditions, gameState) {
  for (const [key, value] of Object.entries(conditions)) {
    switch (key) {
      case 'protected_someone':
        if (value && !gameState.flags?.has('rask_protected_someone')) return false;
        break;
      case 'violence_controlled':
        if (value && gameState.flags?.has('rask_violence_uncontrolled')) return false;
        break;
      case 'violence_triggered':
        if (value && !gameState.flags?.has('violence_occurred')) return false;
        break;
      case 'survived':
        if (value && gameState.flags?.has('rask_died')) return false;
        break;
      case 'children_threatened':
        if (value && !gameState.flags?.has('threat_near_children')) return false;
        break;
      case 'chose_sacrifice':
        if (value && !gameState.flags?.has(`${gameState.currentNpc}_chose_sacrifice`)) return false;
        break;
      case 'escalation_ending':
        if (value && gameState.endingPath !== 'escalation') return false;
        break;
      case 'healed_someone':
        if (value && !gameState.flags?.has('jonas_healed_someone')) return false;
        break;
      case 'clinic_reopened':
        if (value && !gameState.flags?.has('clinic_reopened')) return false;
        break;
      case 'refused_to_heal':
        if (value && !gameState.flags?.has('jonas_refused_heal')) return false;
        break;
      case 'someone_died':
        if (value && !gameState.flags?.has('patient_died')) return false;
        break;
      case 'act3':
        if (value && gameState.currentAct < 3) return false;
        break;
      case 'critical_moment':
        if (value && gameState.tension < 80) return false;
        break;
      case 'ghost_dominant':
        if (value && gameState.dominantVoice !== 'GHOST') return false;
        break;
      case 'logic_dominant':
        if (value && gameState.dominantVoice !== 'LOGIC') return false;
        break;
      case 'empathy_dominant':
        if (value && gameState.dominantVoice !== 'EMPATHY') return false;
        break;
      case 'curie_contact':
        if (value && !gameState.flags?.has('curie_direct_contact')) return false;
        break;
      case 'control_maintained':
        if (value && gameState.flags?.has('mara_lost_control')) return false;
        break;
      case 'burden_shared':
        if (value && !gameState.flags?.has('mara_shared_burden')) return false;
        break;
      case 'control_lost':
        if (value && !gameState.flags?.has('mara_lost_control')) return false;
        break;
      case 'confession_forced':
        if (value && !gameState.flags?.has('mara_confession_forced')) return false;
        break;
      case 'no_confession':
        if (value && gameState.flags?.has('mara_confession')) return false;
        break;
      case 'confession_given':
        if (value && !gameState.flags?.has('mara_confession')) return false;
        break;
      case 'player_mentored_kindly':
        if (value && !gameState.flags?.has('kale_mentored_kindly')) return false;
        break;
      case 'identity_formed':
        if (value && !gameState.flags?.has('kale_identity_formed')) return false;
        break;
      case 'player_mirrored_cruelty':
        if (value && !gameState.flags?.has('player_cruel_to_kale')) return false;
        break;
      case 'no_identity_formed':
        if (value && gameState.flags?.has('kale_identity_formed')) return false;
        break;
      case 'no_dominant_influence':
        if (value && (gameState.flags?.has('kale_mentored_kindly') ||
                      gameState.flags?.has('player_cruel_to_kale') ||
                      gameState.dominantVoice === 'GHOST')) return false;
        break;
      case 'truth_revealed':
        if (value && !gameState.flags?.has('full_truth_revealed')) return false;
        break;
      case 'confession_shared':
        if (value && !gameState.flags?.has('edda_spoke_plainly')) return false;
        break;
      case 'stress_broken':
        if (value && !gameState.flags?.has('edda_stress_broken')) return false;
        break;
      case 'too_much_pressure':
        if (value && gameState.npcStress?.edda < 80) return false;
        break;
      case 'balanced_ending':
        if (value && gameState.endingPath !== 'balanced') return false;
        break;
    }
  }

  return true;
}

// Get all micro endings that would apply to current state
export function getAllApplicableMicroEndings(gameState) {
  const results = {};

  for (const npcId of Object.keys(MICRO_ENDINGS)) {
    const ending = getNpcMicroEnding(npcId, gameState);
    if (ending) {
      results[npcId] = ending;
    }
  }

  return results;
}

// Get micro ending text for epilogue
export function getEpilogueText(gameState) {
  const microEndings = getAllApplicableMicroEndings(gameState);
  const epilogues = [];

  for (const [npcId, ending] of Object.entries(microEndings)) {
    epilogues.push({
      npc: npcId,
      text: ending.text,
      state: ending.state
    });
  }

  return epilogues;
}
