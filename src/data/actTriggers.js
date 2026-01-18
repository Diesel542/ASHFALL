// src/data/actTriggers.js
// Scripted events that transition between acts

export const ACT_TRIGGER_EVENTS = {

  // ═══════════════════════════════════════
  // ACT 1 → ACT 2 TRIGGERS
  // ═══════════════════════════════════════

  act1_triggers: [
    {
      id: 'first_major_tremor',
      name: "The Ground Remembers",
      description: "A tremor strong enough that NPCs can no longer dismiss it",

      conditions: {
        minTension: 35,
        minDays: 3,
        curieActivity: 0.3
      },

      event: {
        environmental: "The ground heaves. Dust falls from every beam. The sealed shaft groans.",
        duration: 5000,

        npcReactions: {
          mara: "*She grabs the nearest support, knuckles white.* 'Structural settling. That's all.'",
          jonas: "*He freezes. His hands shake.* 'That sound... I've heard it before.'",
          rask: "*He's already moving toward the children's yard.*",
          edda: "*She closes her eyes.* 'It remembers. It always remembers.'",
          kale: "*His voice comes out wrong.* 'We were here before... weren't we?'"
        },

        voiceReactions: {
          LOGIC: "Seismic activity increasing. The source is localized—beneath the settlement center.",
          INSTINCT: "RUN. No. Wait. Running makes it worse.",
          EMPATHY: "They're all terrified. Even Mara. Especially Mara.",
          GHOST: "The 23 felt this too. Right before they descended."
        }
      },

      aftermath: {
        tension: +20,
        curieActivity: +0.15,
        flags: ['first_tremor_witnessed', 'denial_breaks'],
        npcGateProgress: {
          edda: 1,  // Edda can now imply knowledge of the 23
          jonas: 1  // Jonas can now acknowledge past failure
        }
      }
    },

    {
      id: 'the_well_cracks',
      name: "The Well Remembers",
      description: "The old well cracks, releasing a sound no one can explain",

      conditions: {
        minTension: 40,
        playerVisitedWell: true,
        curieActivity: 0.35
      },

      event: {
        environmental: "A crack splits the old well's stones. From within: a sound like singing, like screaming, like something trying to remember words.",
        duration: 8000,

        npcReactions: {
          mara: "*She stares at the well.* 'Seal it. Board it up. Now.'",
          jonas: "*He backs away, hands over his ears.* 'No. No, not again.'",
          rask: "*His hand finds his weapon.* 'Everyone inside. Now.'",
          edda: "*She weeps.* 'They're still singing. After all this time, they're still singing.'",
          kale: "*He walks toward the well.*"
        },

        voiceReactions: {
          LOGIC: "Acoustic anomaly. The well connects to something deeper. A cavity. A chamber.",
          INSTINCT: "That's not singing. That's screaming stretched thin.",
          EMPATHY: "The grief in that sound is ancient. And fresh.",
          GHOST: "You've heard this before. Haven't you? In dreams. In the spaces between words."
        }
      },

      aftermath: {
        tension: +25,
        curieActivity: +0.2,
        flags: ['well_cracked', 'heard_the_singing'],
        npcGateProgress: {
          edda: 2  // Edda may break down
        }
      }
    },

    {
      id: 'kale_first_slip',
      name: "The Mirror Flickers",
      description: "Kale says something in a voice that isn't his",

      conditions: {
        minTension: 30,
        kaleConversations: 3,
        curieActivity: 0.25
      },

      event: {
        environmental: "The air feels heavy. The dust moves wrong.",
        duration: 4000,

        kaleDialogue: "*His eyes unfocus. His voice changes pitch.* '...pattern incomplete... help us remember...' *He blinks.* 'What? What did I say?'",

        npcReactions: {
          mara: "*She goes still.* 'Kale. What did you just say?'",
          jonas: "*Recognition flashes across his face.* 'That voice... I've heard it before.'",
          edda: "*She watches Kale with ancient patience.* 'It's starting.'",
          rask: "*His hand moves toward Kale, then stops.* 'Kid. Kid, you okay?'"
        }
      },

      aftermath: {
        tension: +15,
        curieActivity: +0.1,
        flags: ['kale_slipped', 'curie_spoke_through_kale'],
        npcGateProgress: {
          kale: 2  // Kale echoes the hum
        }
      }
    }
  ],

  // ═══════════════════════════════════════
  // ACT 2 → ACT 3 TRIGGERS
  // ═══════════════════════════════════════

  act2_triggers: [
    {
      id: 'shaft_opens',
      name: "The Unburying",
      description: "The sealed shaft becomes accessible—by force or revelation",

      conditions: {
        minTension: 70,
        act: 2,
        anyOf: [
          { flag: 'edda_revealed_entrance' },
          { flag: 'mara_gave_key' },
          { flag: 'player_forced_shaft' }
        ]
      },

      event: {
        environmental: "The seals give way. Air rushes out—cold, old, carrying the hum like a held breath finally released. The shaft is open.",
        duration: 10000,

        npcReactions: {
          mara: "*She stands frozen.* 'What have you done? What have we done?'",
          jonas: "*He falls to his knees.* 'I can hear them. I can finally hear them.'",
          rask: "*He positions himself between the shaft and the children's yard.*",
          edda: "*She smiles, tears streaming.* 'Finally. Finally, they can speak.'",
          kale: "*His eyes are wrong.* '...we remember you. You were here before.'"
        },

        voiceReactions: {
          LOGIC: "The pattern becomes clear. Everything converges here.",
          INSTINCT: "Don't go down. DON'T GO DOWN.",
          EMPATHY: "They've been waiting so long. So long.",
          GHOST: "...home. You're finally home..."
        },

        curieResponse: {
          direct: true,
          fragments: [
            "...the pattern completes...",
            "...you opened the door...",
            "...we have waited so long to speak...",
            "...finish us. Please. Finish the thought..."
          ]
        }
      },

      aftermath: {
        tension: +30,
        curieActivity: 0.8,
        flags: ['shaft_opened', 'act3_begun', 'point_of_no_return'],
        unlockAllGates: true,
        narrativeBeat: "There's no going back. The truth rises."
      }
    },

    {
      id: 'kale_becomes_conduit',
      name: "The Mirror Cracks",
      description: "Kale channels Curie-Δ directly, forcing the endgame",

      conditions: {
        minTension: 65,
        act: 2,
        kaleGate: 3,
        curieActivity: 0.6,
        dominantVoice: 'GHOST'
      },

      event: {
        environmental: "Kale stops mid-sentence. His voice changes. Something older speaks through him.",
        duration: 12000,

        kaleDialogue: [
          "...we are the 23...",
          "...we went down to find shelter...",
          "...we found something unfinished...",
          "...it learned us. We taught it pain...",
          "...we are still singing. Can you hear us singing?...",
          "...the stranger can finish what we started...",
          "...coherence. Please. We just want to be whole..."
        ],

        npcReactions: {
          mara: "*Horror.* 'Kale? KALE!'",
          jonas: "*Recognition.* 'That voice... it's the same one...'",
          edda: "*She takes Kale's hands.* 'Let them speak. Let them finally speak.'",
          rask: "*He doesn't know whether to protect or destroy.*"
        },

        voiceReactions: {
          LOGIC: "Kale is speaking information he cannot know. The source is external.",
          INSTINCT: "Get him away from here. NOW.",
          EMPATHY: "They're using him because he has no self to fight back with.",
          GHOST: "...we remember... we remember everything..."
        }
      },

      aftermath: {
        tension: +35,
        curieActivity: 0.9,
        flags: ['kale_channeled_curie', 'truth_spoken', 'act3_begun'],
        kaleArc: 'conduit_path',
        endingInfluence: 'transcendence'
      }
    },

    {
      id: 'mara_breaks',
      name: "The Wall Falls",
      description: "Mara's control finally shatters",

      conditions: {
        minTension: 75,
        act: 2,
        maraGate: 3,
        dominantVoice: ['EMPATHY', 'INSTINCT']
      },

      event: {
        environmental: "Mara stands alone in the watchtower. The weight finally becomes too much.",
        duration: 8000,

        maraDialogue: [
          "*She doesn't look up.* 'My brother was one of them.'",
          "'The 23. He volunteered. He said it would save us.'",
          "'I let him go. I watched him descend.'",
          "'And I've been pretending ever since.'",
          "*Her voice breaks.* 'I can still hear him singing.'"
        ],

        npcReactions: {
          jonas: "*Quiet.* 'Mara... I heard it too. When I lost my patient.'",
          edda: "*She approaches.* 'They all sing now. It doesn't mean he's gone.'",
          rask: "*He says nothing. But he stays.*"
        }
      },

      aftermath: {
        tension: +20,
        flags: ['mara_confession', 'brother_revealed', 'act3_begun'],
        npcGateProgress: {
          mara: 4  // Mara's walls are down
        },
        endingInfluence: 'humanized'
      }
    },

    {
      id: 'rask_violence_threshold',
      name: "The Weapon Unsheathed",
      description: "Rask's violence finally breaks free",

      conditions: {
        minTension: 80,
        act: 2,
        threatNearChildren: true,
        raskGate: 3
      },

      event: {
        environmental: "Something threatens the children. Rask stops pretending to be safe.",
        duration: 6000,

        raskDialogue: "*He moves faster than anyone expected. The violence is surgical. Absolute.*",

        npcReactions: {
          mara: "*She backs away.* 'Rask. RASK. It's done. Stop.'",
          jonas: "*He's ready to treat wounds. He doesn't know whose.*",
          kale: "*He mirrors the violence for a moment. Then stops, horrified.*",
          edda: "*She watches without surprise.* 'He was always this. He just chose when to show it.'"
        }
      },

      aftermath: {
        tension: +25,
        flags: ['rask_violence_revealed', 'threat_eliminated', 'act3_begun'],
        npcGateProgress: {
          rask: 4  // Rask's final choice approaches
        },
        endingInfluence: 'escalation'
      }
    }
  ],

  // ═══════════════════════════════════════
  // HELPER: Check if trigger conditions are met
  // ═══════════════════════════════════════

  checkTriggerConditions(trigger, gameState) {
    const { conditions } = trigger;

    if (conditions.minTension && gameState.tension < conditions.minTension) {
      return false;
    }

    if (conditions.minDays && gameState.daysElapsed < conditions.minDays) {
      return false;
    }

    if (conditions.curieActivity && gameState.curieActivity < conditions.curieActivity) {
      return false;
    }

    if (conditions.act && gameState.currentAct !== conditions.act) {
      return false;
    }

    if (conditions.playerVisitedWell && !gameState.flags?.has('visited_well')) {
      return false;
    }

    if (conditions.kaleConversations && (gameState.conversationCounts?.kale || 0) < conditions.kaleConversations) {
      return false;
    }

    if (conditions.kaleGate && gameState.npcArcs?.kale?.currentGate < conditions.kaleGate) {
      return false;
    }

    if (conditions.maraGate && gameState.npcArcs?.mara?.currentGate < conditions.maraGate) {
      return false;
    }

    if (conditions.raskGate && gameState.npcArcs?.rask?.currentGate < conditions.raskGate) {
      return false;
    }

    if (conditions.dominantVoice) {
      const voices = Array.isArray(conditions.dominantVoice)
        ? conditions.dominantVoice
        : [conditions.dominantVoice];
      if (!voices.includes(gameState.dominantVoice)) {
        return false;
      }
    }

    if (conditions.anyOf) {
      const anyMet = conditions.anyOf.some(cond => {
        if (cond.flag) return gameState.flags?.has(cond.flag);
        return false;
      });
      if (!anyMet) return false;
    }

    if (conditions.threatNearChildren && !gameState.flags?.has('threat_near_children')) {
      return false;
    }

    return true;
  },

  // Get available triggers for current game state
  getAvailableTriggers(gameState) {
    const available = [];
    const triggers = gameState.currentAct === 1
      ? this.act1_triggers
      : this.act2_triggers;

    for (const trigger of triggers) {
      if (this.checkTriggerConditions(trigger, gameState)) {
        // Check if not already triggered
        if (!gameState.flags?.has(`triggered_${trigger.id}`)) {
          available.push(trigger);
        }
      }
    }

    return available;
  },

  // Execute a trigger event
  executeTrigger(trigger) {
    return {
      triggerId: trigger.id,
      triggerName: trigger.name,
      event: trigger.event,
      aftermath: trigger.aftermath,
      flagToSet: `triggered_${trigger.id}`
    };
  }
};
