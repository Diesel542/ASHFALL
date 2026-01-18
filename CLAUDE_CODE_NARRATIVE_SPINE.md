# ASHFALL: Narrative Spine Implementation

## Overview

This document implements Ashfall's **story architecture**: the three-act pressure curve, NPC arc gates, voice-aligned endings, and the state machine that tracks narrative progression.

**Core principle:** Ashfall is not a linear story — but it has a direction, a pressure curve, and a truth buried beneath everything.

---

## 1. Story State Machine

```javascript
// src/systems/NarrativeEngine.js

/**
 * NARRATIVE ENGINE
 * 
 * Tracks the macro-state of Ashfall's story:
 * - Current act (pressure level)
 * - NPC arc progression
 * - Revelation gates
 * - Ending trajectory
 * 
 * The LLM improvises within bounds. This system ensures
 * the improvisation serves the story.
 */

export class NarrativeEngine {
  constructor() {
    this.state = {
      currentAct: 1,
      actProgress: 0,        // 0-100 within current act
      tension: 20,           // Global tension level 0-100
      daysElapsed: 0,
      
      // Act transition triggers
      actTriggers: {
        act1to2: false,      // First major tremor/hum event
        act2to3: false       // Shaft becomes accessible
      },
      
      // NPC arc states
      npcArcs: {
        mara: { currentGate: 0, maxGate: 4, outcome: null },
        jonas: { currentGate: 0, maxGate: 4, outcome: null },
        rask: { currentGate: 0, maxGate: 4, outcome: null },
        edda: { currentGate: 0, maxGate: 4, outcome: null },
        kale: { currentGate: 0, maxGate: 4, outcome: null }
      },
      
      // Voice alignment tracking
      voiceAlignment: {
        LOGIC: 0,
        INSTINCT: 0,
        EMPATHY: 0,
        GHOST: 0
      },
      
      // Ending trajectory
      endingPath: null,
      endingLocked: false
    };

    // Narrative events log
    this.eventLog = [];
  }

  // ═══════════════════════════════════════
  // ACT PROGRESSION
  // ═══════════════════════════════════════

  getCurrentActInfo() {
    const actInfo = {
      1: {
        name: "The Cracks Beneath Quiet",
        phase: "Arrival → Disturbance",
        goals: [
          "Introduce characters and contradictions",
          "Establish settlement mood",
          "Present subtle anomalies (hum, tremors)",
          "Seed interpersonal tensions"
        ],
        curieActivity: 'dormant',
        tensionRange: [10, 40]
      },
      2: {
        name: "The Settlement Frays",
        phase: "Conflict → Convergence",
        goals: [
          "Tighten interpersonal conflicts",
          "Increase Curie-Δ influence",
          "Create pressure for confessions",
          "Introduce unavoidable consequences"
        ],
        curieActivity: 'stirring',
        tensionRange: [40, 75]
      },
      3: {
        name: "The Unburying",
        phase: "Revelation → Choice → Resolution",
        goals: [
          "Force confrontation with truth",
          "Resolve NPC arcs",
          "Determine Curie-Δ's fate",
          "Deliver ending based on alignment"
        ],
        curieActivity: 'awakened',
        tensionRange: [75, 100]
      }
    };

    return actInfo[this.state.currentAct];
  }

  checkActTransition() {
    const { currentAct, actTriggers, tension } = this.state;

    // Act 1 → Act 2: First major tremor/hum event
    if (currentAct === 1 && actTriggers.act1to2) {
      this.transitionToAct(2);
      return true;
    }

    // Act 2 → Act 3: Shaft becomes accessible
    if (currentAct === 2 && actTriggers.act2to3) {
      this.transitionToAct(3);
      return true;
    }

    // Tension-based soft transitions
    if (currentAct === 1 && tension > 40) {
      // Pressure building - trigger Act 1 event soon
      this.scheduleActTrigger(1);
    }

    if (currentAct === 2 && tension > 75) {
      // Pressure critical - trigger Act 2 event soon
      this.scheduleActTrigger(2);
    }

    return false;
  }

  transitionToAct(newAct) {
    const oldAct = this.state.currentAct;
    this.state.currentAct = newAct;
    this.state.actProgress = 0;

    this.logEvent({
      type: 'act_transition',
      from: oldAct,
      to: newAct,
      tension: this.state.tension
    });

    // Trigger act transition effects
    this.onActTransition(oldAct, newAct);
  }

  onActTransition(fromAct, toAct) {
    if (toAct === 2) {
      // Act 2 begins: NPCs stop being able to pretend
      return {
        narrative: "Something shifts in Ashfall. The quiet cracks.",
        effects: [
          { type: 'curie_activity', delta: +0.2 },
          { type: 'global_tension', delta: +15 },
          { type: 'npc_denial_breaks', affected: ['mara', 'jonas'] }
        ]
      };
    }

    if (toAct === 3) {
      // Act 3 begins: The unburying
      return {
        narrative: "The ground opens. The truth rises. There's no going back.",
        effects: [
          { type: 'curie_activity', delta: +0.4 },
          { type: 'shaft_accessible', value: true },
          { type: 'all_gates_accelerate', multiplier: 1.5 }
        ]
      };
    }
  }

  scheduleActTrigger(act) {
    // Mark that an act trigger event should happen soon
    // The event system will pick this up and create the moment
    this.state.pendingTrigger = act;
  }

  // ═══════════════════════════════════════
  // NPC ARC GATES
  // ═══════════════════════════════════════

  getNpcArcInfo(npcId) {
    const arcDefinitions = {
      mara: {
        gates: [
          { id: 0, name: "Guarded", description: "Mara reveals nothing personal" },
          { id: 1, name: "Fear Admitted", description: "Admits fear about resource collapse", 
            requires: { relationship: 40, tension: 25 } },
          { id: 2, name: "Suspicion Voiced", description: "Confesses suspicion about Rask",
            requires: { relationship: 50, flags: ['rask_incident_witnessed'] } },
          { id: 3, name: "Brother Revealed", description: "Reveals her brother's involvement in the 23",
            requires: { relationship: 70, act: 2, flags: ['learned_about_23'] } },
          { id: 4, name: "Blame Confessed", description: "Breaks, revealing she blames herself entirely",
            requires: { relationship: 85, act: 3, tension: 70 } }
        ],
        outcomes: {
          hardened: { conditions: { dominantVoice: 'LOGIC', gateReached: 2 }, 
                      description: "Hardened Leader - Stability Ending" },
          collapsed: { conditions: { dominantVoice: 'INSTINCT', gateReached: 4, trustBroken: true },
                       description: "Collapsed Authority - Escalation Ending" },
          humanized: { conditions: { dominantVoice: 'EMPATHY', gateReached: 4 },
                       description: "Humanized Ally - Balanced Ending" }
        }
      },

      jonas: {
        gates: [
          { id: 0, name: "Withdrawn", description: "Jonas deflects all medical topics" },
          { id: 1, name: "Failure Acknowledged", description: "Acknowledges he failed someone medically",
            requires: { relationship: 35, playerShownVulnerability: true } },
          { id: 2, name: "Voice Mentioned", description: "Reveals he heard a 'voice' during the incident",
            requires: { relationship: 55, act: 2, flags: ['heard_the_hum'] } },
          { id: 3, name: "Abandonment Confessed", description: "Confesses he abandoned someone in fear",
            requires: { relationship: 70, tension: 60 } },
          { id: 4, name: "Purpose Resolved", description: "Reclaims or rejects his purpose as healer",
            requires: { relationship: 80, act: 3 } }
        ],
        outcomes: {
          restored: { conditions: { gateReached: 4, healedSomeone: true },
                      description: "Restored Healer" },
          broken: { conditions: { gateReached: 3, refusedToHeal: true },
                    description: "Broken Witness" },
          sacrifice: { conditions: { gateReached: 4, act: 3, tensionCritical: true },
                       description: "Sacrifice Ending Candidate" }
        }
      },

      rask: {
        gates: [
          { id: 0, name: "Silent", description: "Rask says almost nothing" },
          { id: 1, name: "Children Mentioned", description: "Mentions he watches children for a reason",
            requires: { relationship: 30, locationNearChildren: true } },
          { id: 2, name: "Past Admitted", description: "Admits past violence",
            requires: { relationship: 50, playerShowedKindness: true } },
          { id: 3, name: "Warning Given", description: "Warns the player about the hum explicitly",
            requires: { relationship: 65, act: 2, flags: ['tremor_witnessed'] } },
          { id: 4, name: "Final Choice", description: "Protects or destroys depending on player influence",
            requires: { act: 3, tension: 80 } }
        ],
        outcomes: {
          guardian: { conditions: { gateReached: 4, protectedSomeone: true },
                      description: "Guardian" },
          weapon: { conditions: { gateReached: 4, violenceTriggered: true },
                    description: "Walking Weapon" },
          sacrifice: { conditions: { gateReached: 4, childrenThreatened: true },
                       description: "Self-Sacrifice" }
        }
      },

      edda: {
        gates: [
          { id: 0, name: "Cryptic", description: "Edda speaks only in metaphor" },
          { id: 1, name: "23 Implied", description: "Implies she knows what happened to the 23",
            requires: { relationship: 35, askedAboutShaft: true } },
          { id: 2, name: "Breakdown", description: "Breaks down during a tremor",
            requires: { relationship: 50, act: 2, tremorOccurred: true } },
          { id: 3, name: "Hum Named", description: "Names the hum as 'a remembering'",
            requires: { relationship: 65, flags: ['heard_the_hum'] } },
          { id: 4, name: "Truth Revealed", description: "Reveals full truth with Curie-Δ influence",
            requires: { relationship: 85, act: 3, curieActive: true } }
        ],
        outcomes: {
          prophet: { conditions: { gateReached: 4, dominantVoice: 'GHOST' },
                     description: "Prophet" },
          fragmented: { conditions: { gateReached: 3, stressBroken: true },
                        description: "Fragmented Mind" },
          truthbearer: { conditions: { gateReached: 4, allVoicesBalanced: true },
                         description: "Truthbearer" }
        }
      },

      kale: {
        gates: [
          { id: 0, name: "Mirroring", description: "Kale mirrors without awareness" },
          { id: 1, name: "Strong Mirroring", description: "Begins mimicking player tone strongly",
            requires: { conversationCount: 3 } },
          { id: 2, name: "Hum Echoed", description: "Echoes the hum unconsciously",
            requires: { act: 2, curieActivity: 0.4 } },
          { id: 3, name: "Slip", description: "Experiences a 'slip' — sentence not his own",
            requires: { relationship: 50, curieActivity: 0.6 } },
          { id: 4, name: "Identity Resolved", description: "Merges or separates identity",
            requires: { act: 3, voiceAlignment: 'determined' } }
        ],
        outcomes: {
          independent: { conditions: { gateReached: 4, playerMentoredKindly: true },
                         description: "Independent Self" },
          conduit: { conditions: { gateReached: 4, dominantVoice: 'GHOST', curieHigh: true },
                     description: "Curie-Δ Conduit" },
          broken: { conditions: { gateReached: 4, playerMirroredCruelty: true },
                    description: "Broken Mirror" }
        }
      }
    };

    return arcDefinitions[npcId];
  }

  checkGateUnlock(npcId, gameState) {
    const arc = this.state.npcArcs[npcId];
    const arcDef = this.getNpcArcInfo(npcId);
    
    if (arc.currentGate >= arc.maxGate) return false;

    const nextGate = arcDef.gates[arc.currentGate + 1];
    if (!nextGate) return false;

    // Check requirements
    const req = nextGate.requires;
    if (!req) {
      // No requirements, auto-unlock
      return this.unlockGate(npcId);
    }

    let canUnlock = true;

    if (req.relationship && gameState.relationships[npcId] < req.relationship) {
      canUnlock = false;
    }

    if (req.act && this.state.currentAct < req.act) {
      canUnlock = false;
    }

    if (req.tension && this.state.tension < req.tension) {
      canUnlock = false;
    }

    if (req.flags) {
      for (const flag of req.flags) {
        if (!gameState.flags.has(flag)) {
          canUnlock = false;
          break;
        }
      }
    }

    if (req.curieActivity && gameState.curieActivity < req.curieActivity) {
      canUnlock = false;
    }

    if (canUnlock) {
      return this.unlockGate(npcId);
    }

    return false;
  }

  unlockGate(npcId) {
    const arc = this.state.npcArcs[npcId];
    arc.currentGate++;

    const arcDef = this.getNpcArcInfo(npcId);
    const gate = arcDef.gates[arc.currentGate];

    this.logEvent({
      type: 'gate_unlocked',
      npc: npcId,
      gate: arc.currentGate,
      gateName: gate.name,
      description: gate.description
    });

    return {
      npc: npcId,
      gate: arc.currentGate,
      name: gate.name,
      description: gate.description,
      narrativeBeat: `${npcId.toUpperCase()}: ${gate.description}`
    };
  }

  // Get what an NPC is allowed to reveal at current gate
  getNpcRevelationBounds(npcId) {
    const arc = this.state.npcArcs[npcId];
    const arcDef = this.getNpcArcInfo(npcId);

    const currentGate = arcDef.gates[arc.currentGate];
    const nextGate = arcDef.gates[arc.currentGate + 1];

    return {
      currentGate: arc.currentGate,
      canReveal: currentGate?.description || "Nothing personal",
      cannotRevealYet: nextGate?.description || "All truths unlocked",
      promptInjection: this.getGatePromptInjection(npcId, arc.currentGate)
    };
  }

  getGatePromptInjection(npcId, gateLevel) {
    const injections = {
      mara: [
        "Reveal nothing personal. Deflect to settlement matters.",
        "You may admit fear about resources, but nothing deeper.",
        "You may voice suspicion about Rask if pressed.",
        "You may reveal your brother's involvement if trust is earned.",
        "You may confess everything. The walls are down."
      ],
      jonas: [
        "Deflect all medical topics. Change the subject.",
        "You may acknowledge past failure in vague terms.",
        "You may mention the 'voice' you heard, but not explain it.",
        "You may confess abandoning someone. The guilt is ready to surface.",
        "You may reclaim or reject your purpose. This is the moment."
      ],
      rask: [
        "Say almost nothing. One word answers.",
        "You may explain why you watch the children.",
        "You may admit your violent past if shown kindness.",
        "You may warn explicitly about the hum.",
        "You may choose to protect or destroy. The decision is now."
      ],
      edda: [
        "Speak only in metaphor. Never plainly.",
        "You may imply knowledge of the 23.",
        "You may break down during stress. The mask slips.",
        "You may name the hum as 'a remembering.'",
        "You may reveal the full truth. Curie speaks through you."
      ],
      kale: [
        "Mirror without awareness. Ask what to think.",
        "Mirror the player's tone strongly.",
        "You may echo the hum without knowing why.",
        "You may 'slip' — say something that isn't yours.",
        "You may become yourself, or become something else."
      ]
    };

    return injections[npcId]?.[gateLevel] || "";
  }

  // ═══════════════════════════════════════
  // VOICE ALIGNMENT & ENDINGS
  // ═══════════════════════════════════════

  updateVoiceAlignment(voiceName, delta) {
    if (this.state.voiceAlignment.hasOwnProperty(voiceName)) {
      this.state.voiceAlignment[voiceName] += delta;
    }
    this.recalculateEndingPath();
  }

  getDominantVoice() {
    const { LOGIC, INSTINCT, EMPATHY, GHOST } = this.state.voiceAlignment;
    const voices = { LOGIC, INSTINCT, EMPATHY, GHOST };
    
    const sorted = Object.entries(voices).sort(([,a], [,b]) => b - a);
    const [dominant, dominantValue] = sorted[0];
    const [second, secondValue] = sorted[1];

    // Check if balanced (no clear dominant)
    if (dominantValue - secondValue < 10) {
      return { voice: 'BALANCED', confidence: 'low' };
    }

    return { 
      voice: dominant, 
      confidence: dominantValue - secondValue > 25 ? 'high' : 'medium'
    };
  }

  recalculateEndingPath() {
    if (this.state.endingLocked) return;

    const dominant = this.getDominantVoice();

    const endingMap = {
      LOGIC: 'stability',
      INSTINCT: 'escalation',
      EMPATHY: 'humanized',
      GHOST: 'transcendence',
      BALANCED: 'balanced'
    };

    this.state.endingPath = endingMap[dominant.voice] || 'balanced';
  }

  getEndingInfo() {
    const endings = {
      stability: {
        name: "Stability Ending",
        alignment: "LOGIC-dominant",
        description: "Curie-Δ is contained or integrated. Mara stabilizes. Jonas heals. Kale becomes his own person. The hum quiets to a steady pulse.",
        tone: "Resolution through understanding and control"
      },
      escalation: {
        name: "Escalation Ending",
        alignment: "INSTINCT-dominant",
        description: "Curie-Δ destabilizes violently. The settlement fractures. Rask's violence breaks loose. Mara loses control. Kale becomes a conduit.",
        tone: "Collapse through fear and reaction"
      },
      humanized: {
        name: "Humanized Ending",
        alignment: "EMPATHY-dominant",
        description: "Truths confessed and shared. Loss acknowledged. Curie-Δ quiets through understanding, not control. Ashfall becomes wounded but living.",
        tone: "Healing through connection"
      },
      transcendence: {
        name: "Transcendence Ending",
        alignment: "GHOST-dominant",
        description: "Curie-Δ merges with player identity. Reality becomes porous. NPCs speak in dream-logic. The ground hums in human cadence. Salvation or dissolution—unclear.",
        tone: "Transformation beyond categories"
      },
      balanced: {
        name: "Balanced Ending",
        alignment: "No dominant voice",
        description: "A middle path. Some truths surface, some stay buried. The settlement continues, changed but not transformed. The hum remains.",
        tone: "Ambiguous continuation"
      }
    };

    return endings[this.state.endingPath] || endings.balanced;
  }

  lockEnding() {
    this.state.endingLocked = true;
    this.logEvent({
      type: 'ending_locked',
      path: this.state.endingPath,
      voiceAlignment: { ...this.state.voiceAlignment }
    });
  }

  // ═══════════════════════════════════════
  // TENSION MANAGEMENT
  // ═══════════════════════════════════════

  adjustTension(delta, source) {
    const oldTension = this.state.tension;
    this.state.tension = Math.max(0, Math.min(100, this.state.tension + delta));

    if (Math.abs(delta) > 5) {
      this.logEvent({
        type: 'tension_shift',
        delta: delta,
        source: source,
        from: oldTension,
        to: this.state.tension
      });
    }

    this.checkActTransition();
  }

  getTensionDescription() {
    const t = this.state.tension;
    
    if (t < 20) return "Quiet. The settlement breathes.";
    if (t < 40) return "Uneasy. Something stirs beneath the surface.";
    if (t < 60) return "Tense. The cracks are showing.";
    if (t < 80) return "Critical. The settlement frays.";
    return "Breaking point. The unburying begins.";
  }

  // ═══════════════════════════════════════
  // EVENT LOGGING
  // ═══════════════════════════════════════

  logEvent(event) {
    this.eventLog.push({
      ...event,
      timestamp: Date.now(),
      act: this.state.currentAct,
      tension: this.state.tension
    });
  }

  getRecentEvents(count = 10) {
    return this.eventLog.slice(-count);
  }

  // ═══════════════════════════════════════
  // PROMPT INJECTION
  // ═══════════════════════════════════════

  getNarrativePromptInjection() {
    const actInfo = this.getCurrentActInfo();
    const dominant = this.getDominantVoice();
    const ending = this.getEndingInfo();

    return `
═══════════════════════════════════════
NARRATIVE STATE
═══════════════════════════════════════

CURRENT ACT: ${this.state.currentAct} — "${actInfo.name}"
Phase: ${actInfo.phase}
Tension: ${this.state.tension}/100 — ${this.getTensionDescription()}
Curie-Δ Activity: ${actInfo.curieActivity}

ACT GOALS:
${actInfo.goals.map(g => `- ${g}`).join('\n')}

PLAYER ALIGNMENT:
Dominant voice: ${dominant.voice} (${dominant.confidence} confidence)
Trending toward: ${ending.name}

NARRATIVE PRESSURE:
${this.state.currentAct === 1 ? "Build unease. Seed mysteries. Let characters breathe before the cracks show." : ""}
${this.state.currentAct === 2 ? "Tighten conflicts. Force difficult conversations. No more pretending." : ""}
${this.state.currentAct === 3 ? "Drive toward resolution. Secrets must surface. Choices must be made." : ""}
`;
  }
}
```

---

## 2. Act Trigger Events

The moments that transition between acts.

```javascript
// src/data/actTriggers.js

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
        }
      },
      
      aftermath: {
        tension: +35,
        curieActivity: 0.9,
        flags: ['kale_channeled_curie', 'truth_spoken', 'act3_begun'],
        kaleArc: 'conduit_path',
        endingInfluence: 'transcendence'
      }
    }
  ]
};
```

---

## 3. Ending Sequences

The different conclusions based on player alignment.

```javascript
// src/data/endings.js

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
```

---

## 4. Micro-Endings (NPC Fates)

Individual NPC resolutions that accent the main ending.

```javascript
// src/data/microEndings.js

export const MICRO_ENDINGS = {
  
  rask: {
    lives_guardian: {
      conditions: { protected_someone: true, violence_controlled: true },
      text: "Rask stays. He found what he was looking for—not redemption, but purpose. He still doesn't talk much. But the children are safe. That's enough.",
      trigger: 'rask_final_choice_protect'
    },
    lives_weapon: {
      conditions: { violence_triggered: true, survived: true },
      text: "Rask survives, but something in him broke loose. He leaves Ashfall the same way he arrived—with blood on his boots and no story to tell.",
      trigger: 'rask_final_choice_destroy'
    },
    dies_sacrifice: {
      conditions: { children_threatened: true, chose_sacrifice: true },
      text: "Rask placed himself between the children and the danger. He didn't hesitate. In the end, that was all he wanted—one clean choice. One clear purpose.",
      trigger: 'rask_sacrifice'
    },
    dies_violence: {
      conditions: { violence_triggered: true, escalation_ending: true },
      text: "Rask died as they always expected him to—violently, suddenly, alone. But in his last moments, he looked toward the children's yard. They were safe. That was enough.",
      trigger: 'rask_killed'
    }
  },

  jonas: {
    heals_again: {
      conditions: { healed_someone: true, clinic_reopened: true },
      text: "Jonas opens the clinic. The dust is cleared. His hands shake, but they move. The first patient he treats weeps. So does he.",
      trigger: 'jonas_restored'
    },
    fails_again: {
      conditions: { refused_to_heal: true, someone_died: true },
      text: "Another one he couldn't save. Jonas closes the clinic door for the last time. Some wounds don't close.",
      trigger: 'jonas_final_failure'
    },
    sacrifices: {
      conditions: { act3: true, critical_moment: true, chose_sacrifice: true },
      text: "In the end, Jonas found his purpose—not by saving someone, but by choosing who to stand beside when it mattered. His last act was medical. His last words were 'I'm sorry. I should have been here sooner.'",
      trigger: 'jonas_sacrifice'
    }
  },

  mara: {
    stabilizes: {
      conditions: { control_maintained: true, burden_shared: true },
      text: "Mara still watches from the tower. But she comes down more often now. She learned that control and care aren't the same thing—and that the second one matters more.",
      trigger: 'mara_stable'
    },
    breaks: {
      conditions: { control_lost: true, confession_forced: true },
      text: "Mara tried to hold it all together. She gripped until her hands bled. In the end, she was the one who shattered.",
      trigger: 'mara_collapse'
    },
    hardens: {
      conditions: { logic_dominant: true, no_confession: true },
      text: "Mara survived by becoming stone. The settlement follows her still—not out of love, but because stone is steady. No one knows what she's buried. No one asks.",
      trigger: 'mara_hardened'
    }
  },

  kale: {
    becomes_himself: {
      conditions: { player_mentored_kindly: true, identity_formed: true },
      text: "Kale stops mirroring. He chooses his own words now—sometimes wrong, sometimes strange, but his. The first opinion he voices without asking is: 'I think I like the sunrise.'",
      trigger: 'kale_independent'
    },
    becomes_conduit: {
      conditions: { ghost_dominant: true, curie_contact: true },
      text: "Kale is still here. But so are they. He speaks in voices he never learned. The settlement watches him the way they used to watch the shaft—with fear, with awe, with terrible hope.",
      trigger: 'kale_merged'
    },
    shatters: {
      conditions: { player_mirrored_cruelty: true, no_identity_formed: true },
      text: "Kale tried to be everyone and became no one. The mirror cracked. The pieces don't fit together anymore.",
      trigger: 'kale_broken'
    }
  }
};
```

---

## 5. Integration with Agent System

Adding narrative context to every NPC interaction.

```javascript
// In AgentBase.js - add narrative awareness

getNarrativeContext() {
  const engine = window.ASHFALL.narrativeEngine;
  if (!engine) return '';

  // Get current act info
  const narrativeState = engine.getNarrativePromptInjection();
  
  // Get this NPC's arc bounds
  const arcBounds = engine.getNpcRevelationBounds(this.codex.id);

  return `
${narrativeState}

YOUR NARRATIVE BOUNDS (${this.codex.name.toUpperCase()}):
Current Gate: ${arcBounds.currentGate}
What you CAN reveal: ${arcBounds.canReveal}
What you CANNOT reveal yet: ${arcBounds.cannotRevealYet}

GATE INSTRUCTION:
${arcBounds.promptInjection}
`;
}

// Update buildFullPrompt
buildFullPrompt(playerInput, flags) {
  return `${this.getIdentityPrompt()}

${this.getTonePrimer()}

${this.getNarrativeContext()}

${this.getLocationContext()}

${this.getRelationshipContext()}

${this.getKnowledgePrompt(flags)}
// ... rest of prompt
`;
}
```

---

## Summary

The Narrative Spine implementation includes:

| System | Purpose |
|--------|---------|
| **NarrativeEngine** | Master state machine for story progression |
| **Act Progression** | Three-act pressure curve with transition triggers |
| **NPC Arc Gates** | Progressive revelation system for each character |
| **Voice Alignment** | Tracks which internal voice dominates |
| **Ending Calculator** | Determines ending based on alignment and choices |
| **Act Triggers** | Scripted moments that transition between acts |
| **Endings** | Five distinct conclusions based on player identity |
| **Micro-Endings** | Individual NPC fates that accent the main ending |

**The Three Acts:**

| Act | Name | Tension | Curie State |
|-----|------|---------|-------------|
| 1 | The Cracks Beneath Quiet | 10-40 | Dormant |
| 2 | The Settlement Frays | 40-75 | Stirring |
| 3 | The Unburying | 75-100 | Awakened |

**The Five Endings:**

| Ending | Voice | Curie Fate | Tone |
|--------|-------|------------|------|
| Stability | LOGIC | Integrated | Resolution through understanding |
| Escalation | INSTINCT | Destabilized | Collapse through fear |
| Humanized | EMPATHY | Quieted | Healing through connection |
| Transcendence | GHOST | Merged | Transformation beyond categories |
| Balanced | None | Waiting | Ambiguous continuation |

---

*"Small lives. Heavy truths. The earth remembers."*

*— The story that holds everything together*
