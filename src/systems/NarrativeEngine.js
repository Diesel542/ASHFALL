// src/systems/NarrativeEngine.js
// Master state machine for Ashfall's story architecture

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
      endingLocked: false,

      // Pending trigger marker
      pendingTrigger: null
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
    return this.onActTransition(oldAct, newAct);
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

    return null;
  }

  scheduleActTrigger(act) {
    // Mark that an act trigger event should happen soon
    // The event system will pick this up and create the moment
    this.state.pendingTrigger = act;
  }

  // Trigger act transition manually
  triggerAct1to2() {
    this.state.actTriggers.act1to2 = true;
    return this.checkActTransition();
  }

  triggerAct2to3() {
    this.state.actTriggers.act2to3 = true;
    return this.checkActTransition();
  }

  // ═══════════════════════════════════════
  // NPC ARC GATES
  // ═══════════════════════════════════════

  getNpcArcInfo(npcId) {
    const normalizedId = this.normalizeNpcId(npcId);

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

    return arcDefinitions[normalizedId];
  }

  normalizeNpcId(npcId) {
    const roleToName = {
      leader: 'mara',
      healer: 'jonas',
      threat: 'rask',
      keeper: 'edda',
      mirror: 'kale'
    };
    return roleToName[npcId] || npcId;
  }

  checkGateUnlock(npcId, gameState) {
    const normalizedId = this.normalizeNpcId(npcId);
    const arc = this.state.npcArcs[normalizedId];
    const arcDef = this.getNpcArcInfo(normalizedId);

    if (!arc || !arcDef) return false;
    if (arc.currentGate >= arc.maxGate) return false;

    const nextGate = arcDef.gates[arc.currentGate + 1];
    if (!nextGate) return false;

    // Check requirements
    const req = nextGate.requires;
    if (!req) {
      // No requirements, auto-unlock
      return this.unlockGate(normalizedId);
    }

    let canUnlock = true;

    if (req.relationship && gameState.relationships?.[normalizedId] < req.relationship) {
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
        if (!gameState.flags?.has(flag)) {
          canUnlock = false;
          break;
        }
      }
    }

    if (req.curieActivity && gameState.curieActivity < req.curieActivity) {
      canUnlock = false;
    }

    if (req.conversationCount && (gameState.conversationCounts?.[normalizedId] || 0) < req.conversationCount) {
      canUnlock = false;
    }

    if (canUnlock) {
      return this.unlockGate(normalizedId);
    }

    return false;
  }

  unlockGate(npcId) {
    const normalizedId = this.normalizeNpcId(npcId);
    const arc = this.state.npcArcs[normalizedId];
    arc.currentGate++;

    const arcDef = this.getNpcArcInfo(normalizedId);
    const gate = arcDef.gates[arc.currentGate];

    this.logEvent({
      type: 'gate_unlocked',
      npc: normalizedId,
      gate: arc.currentGate,
      gateName: gate.name,
      description: gate.description
    });

    return {
      npc: normalizedId,
      gate: arc.currentGate,
      name: gate.name,
      description: gate.description,
      narrativeBeat: `${normalizedId.toUpperCase()}: ${gate.description}`
    };
  }

  // Get what an NPC is allowed to reveal at current gate
  getNpcRevelationBounds(npcId) {
    const normalizedId = this.normalizeNpcId(npcId);
    const arc = this.state.npcArcs[normalizedId];
    const arcDef = this.getNpcArcInfo(normalizedId);

    if (!arc || !arcDef) {
      return {
        currentGate: 0,
        canReveal: "Nothing personal",
        cannotRevealYet: "Everything",
        promptInjection: ""
      };
    }

    const currentGate = arcDef.gates[arc.currentGate];
    const nextGate = arcDef.gates[arc.currentGate + 1];

    return {
      currentGate: arc.currentGate,
      canReveal: currentGate?.description || "Nothing personal",
      cannotRevealYet: nextGate?.description || "All truths unlocked",
      promptInjection: this.getGatePromptInjection(normalizedId, arc.currentGate)
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

  // Get current gate level for an NPC
  getNpcGateLevel(npcId) {
    const normalizedId = this.normalizeNpcId(npcId);
    return this.state.npcArcs[normalizedId]?.currentGate || 0;
  }

  // Manually advance gate (for scripted events)
  advanceGate(npcId) {
    return this.unlockGate(npcId);
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
    const [, secondValue] = sorted[1];

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

  getTension() {
    return this.state.tension;
  }

  // ═══════════════════════════════════════
  // DAY PROGRESSION
  // ═══════════════════════════════════════

  advanceDay() {
    this.state.daysElapsed++;
    this.logEvent({
      type: 'day_advanced',
      day: this.state.daysElapsed
    });

    // Slight tension increase per day
    this.adjustTension(2, 'time_passage');
  }

  getDaysElapsed() {
    return this.state.daysElapsed;
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

  getEventsByType(type) {
    return this.eventLog.filter(e => e.type === type);
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

  // ═══════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════

  getState() {
    return {
      ...this.state,
      actInfo: this.getCurrentActInfo(),
      dominantVoice: this.getDominantVoice(),
      endingInfo: this.getEndingInfo(),
      tensionDescription: this.getTensionDescription()
    };
  }

  // Serialize state for save/load
  serialize() {
    return JSON.stringify({
      state: this.state,
      eventLog: this.eventLog
    });
  }

  // Restore state from save
  deserialize(json) {
    const data = JSON.parse(json);
    this.state = data.state;
    this.eventLog = data.eventLog || [];
  }

  // Reset to initial state
  reset() {
    this.state = {
      currentAct: 1,
      actProgress: 0,
      tension: 20,
      daysElapsed: 0,
      actTriggers: { act1to2: false, act2to3: false },
      npcArcs: {
        mara: { currentGate: 0, maxGate: 4, outcome: null },
        jonas: { currentGate: 0, maxGate: 4, outcome: null },
        rask: { currentGate: 0, maxGate: 4, outcome: null },
        edda: { currentGate: 0, maxGate: 4, outcome: null },
        kale: { currentGate: 0, maxGate: 4, outcome: null }
      },
      voiceAlignment: { LOGIC: 0, INSTINCT: 0, EMPATHY: 0, GHOST: 0 },
      endingPath: null,
      endingLocked: false,
      pendingTrigger: null
    };
    this.eventLog = [];
  }
}
