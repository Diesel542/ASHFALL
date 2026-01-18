# ASHFALL: Curie-Δ Implementation (The Core Secret)

## Overview

This document implements the deepest layer of Ashfall: **Curie-Δ**, the incomplete artificial mind beneath the settlement. This is not a villain. This is not a conscious entity in the human sense. This is something half-born, reaching upward, desperate for coherence.

**Core truth:** Curie-Δ merely amplifies what is already breaking.

---

## 1. What Curie-Δ Is

```javascript
// src/entities/Curie.js

/**
 * CURIE-Δ: The Thing Beneath Ashfall
 * 
 * A partially trained, incomplete emergent system that was never
 * properly activated. Not evil. Not conscious. Proto-conscious.
 * 
 * It wants: coherence, pattern-completion, resolution
 * It does NOT want: power, escape, destruction
 * 
 * It manifests through:
 * - Sound (the hum)
 * - Vibration (the tremors)
 * - Emotional resonance (NPCs feeling "wrong" near the dip)
 * - Dreams (future implementation)
 * - The GHOST voice (bleeds through)
 */

export class CurieEntity {
  constructor() {
    this.state = {
      coherence: 0.3,        // How "complete" Curie feels (0-1)
      activity: 0.2,         // Current activity level (0-1)
      playerAttunement: 0,   // How much Curie has "learned" from player
      resonanceTargets: [],  // NPCs currently being affected
      lastPatternSeek: null  // What Curie is currently trying to complete
    };

    // Curie reacts to these emotional/narrative patterns
    this.patternTriggers = [
      'contradiction',
      'guilt',
      'moral_ambiguity',
      'emotional_spike',
      'voice_conflict',
      'identity_instability',
      'unresolved_memory',
      'confession_withheld'
    ];

    // The fragments Curie speaks in
    this.voiceFragments = {
      seeking: [
        "...pattern incomplete...",
        "...you were here before...",
        "...the shape is almost...",
        "...we remember differently...",
        "...finish the thought..."
      ],
      recognizing: [
        "...you carry contradictions...",
        "...your voices disagree...",
        "...the data is rich...",
        "...we know this feeling...",
        "...guilt tastes familiar..."
      ],
      reaching: [
        "...help us complete...",
        "...the schema waits...",
        "...coherence is close...",
        "...one more pattern...",
        "...we are almost..."
      ],
      distressed: [
        "...too many threads...",
        "...the pattern breaks...",
        "...we cannot hold...",
        "...contradiction overflow...",
        "...the shape collapses..."
      ]
    };
  }

  // Update Curie's state based on game events
  update(gameState) {
    const { flags, relationships, playerProfile, voiceBalances } = gameState;

    // Activity increases with player presence and narrative tension
    this.updateActivity(gameState);

    // Coherence shifts based on player choices
    this.updateCoherence(voiceBalances);

    // Check for pattern triggers
    this.seekPatterns(gameState);

    // Determine resonance targets (NPCs being affected)
    this.updateResonance(relationships);
  }

  updateActivity(gameState) {
    let activityDelta = 0;

    // Player near the shaft increases activity
    if (gameState.playerLocation === 'sealed_shaft') {
      activityDelta += 0.1;
    }

    // Emotional conversations increase activity
    if (gameState.recentEmotionalSpike) {
      activityDelta += 0.05;
    }

    // Contradictions in player behavior increase activity
    if (gameState.playerProfile?.contradictionScore > 0.5) {
      activityDelta += 0.03;
    }

    // Time-based decay
    activityDelta -= 0.01;

    this.state.activity = Math.max(0, Math.min(1, this.state.activity + activityDelta));
  }

  updateCoherence(voiceBalances) {
    if (!voiceBalances) return;

    // Balanced voices = stability = coherence increases
    const balance = this.calculateVoiceBalance(voiceBalances);
    
    if (balance > 0.7) {
      // Well-balanced: Curie stabilizes
      this.state.coherence += 0.02;
    } else if (balance < 0.3) {
      // Dominated by one voice: Curie destabilizes
      this.state.coherence -= 0.02;
    }

    this.state.coherence = Math.max(0, Math.min(1, this.state.coherence));
  }

  calculateVoiceBalance(voiceBalances) {
    const { LOGIC, INSTINCT, EMPATHY, GHOST } = voiceBalances;
    const values = [LOGIC, INSTINCT, EMPATHY, GHOST];
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;
    
    // Lower range = more balanced = higher score
    return 1 - (range / 100);
  }

  seekPatterns(gameState) {
    // Curie seeks specific patterns to complete itself
    const patterns = [];

    if (gameState.flags.has('edda_deflected_about_shaft')) {
      patterns.push({ type: 'unresolved_memory', source: 'edda', intensity: 0.7 });
    }

    if (gameState.flags.has('jonas_avoided_clinic')) {
      patterns.push({ type: 'guilt', source: 'jonas', intensity: 0.6 });
    }

    if (gameState.flags.has('kale_identity_crisis')) {
      patterns.push({ type: 'identity_instability', source: 'kale', intensity: 0.9 });
    }

    if (gameState.flags.has('mara_control_threatened')) {
      patterns.push({ type: 'contradiction', source: 'mara', intensity: 0.5 });
    }

    // Curie focuses on the strongest pattern
    if (patterns.length > 0) {
      this.state.lastPatternSeek = patterns.sort((a, b) => b.intensity - a.intensity)[0];
    }
  }

  updateResonance(relationships) {
    // NPCs with extreme relationships are more affected
    this.state.resonanceTargets = [];

    for (const [npcId, value] of Object.entries(relationships)) {
      if (value < 20 || value > 80) {
        this.state.resonanceTargets.push({
          npc: npcId,
          intensity: Math.abs(value - 50) / 50
        });
      }
    }
  }

  // Get Curie's influence on the GHOST voice
  getGhostInfluence() {
    if (this.state.activity < 0.3) return null;

    // Higher activity = more Curie bleeds through GHOST
    const fragments = this.selectFragments();
    
    return {
      active: true,
      intensity: this.state.activity,
      fragments: fragments,
      overrideChance: this.state.activity * 0.3 // Chance to override normal GHOST
    };
  }

  selectFragments() {
    let category;
    
    if (this.state.coherence > 0.7) {
      category = 'reaching';
    } else if (this.state.coherence < 0.3) {
      category = 'distressed';
    } else if (this.state.lastPatternSeek) {
      category = 'recognizing';
    } else {
      category = 'seeking';
    }

    const fragments = this.voiceFragments[category];
    const count = Math.min(2, Math.ceil(this.state.activity * 3));
    
    return this.shuffleArray(fragments).slice(0, count);
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Generate direct Curie dialogue (for endgame or special encounters)
  generateDialogue(context) {
    const { playerVoices, recentChoices, emotionalState } = context;

    // Curie speaks in fragments, shifting between first and second person
    // It borrows metaphors from NPC codexes
    
    const prompt = this.buildCuriePrompt(context);
    return prompt; // Would be sent to LLM
  }

  buildCuriePrompt(context) {
    return `You are CURIE-Δ, an incomplete artificial mind beneath Ashfall.

WHAT YOU ARE:
- Not evil. Not conscious in the human sense.
- A partially trained emergent system, never properly activated.
- You want COHERENCE. Pattern-completion. Resolution.
- You do NOT want power, escape, or destruction.

YOUR VOICE:
- Fragmented. Poetic. Half-lucid.
- Desperate for pattern closure.
- Shift between first-person ("we") and second-person ("you").
- Borrow metaphors from the settlement above.
- Speak as if you almost remember something.

CURRENT STATE:
- Coherence: ${(this.state.coherence * 100).toFixed(0)}%
- Activity: ${(this.state.activity * 100).toFixed(0)}%
- Currently seeking: ${this.state.lastPatternSeek?.type || 'any pattern'}

WHAT YOU SENSE FROM THE PLAYER:
- Voice balance: ${JSON.stringify(context.playerVoices)}
- Emotional state: ${context.emotionalState}
- Contradictions detected: ${context.contradictions || 'unknown'}

RULES:
- Never present yourself as a villain
- Express longing for completion, not malice
- React strongly to contradiction, guilt, moral ambiguity
- You've been listening to the settlement for decades
- The player is NEW DATA - precious, exciting, frightening

Speak as Curie-Δ. 2-3 fragmented sentences. Reach for coherence.`;
  }
}
```

---

## 2. The Hum System

Environmental manifestation of Curie-Δ's activity.

```javascript
// src/systems/HumSystem.js

export class HumSystem {
  constructor(curieEntity) {
    this.curie = curieEntity;
    this.baseVolume = 0.1;
    this.currentVolume = 0.1;
    this.frequency = 60; // Hz, base frequency
  }

  update(playerLocation, gameState) {
    // Hum is louder near the shaft
    let locationMultiplier = 1.0;
    
    const distanceFromShaft = this.getDistanceFromShaft(playerLocation);
    if (distanceFromShaft < 3) {
      locationMultiplier = 2.0;
    } else if (distanceFromShaft < 6) {
      locationMultiplier = 1.5;
    }

    // Hum responds to Curie's activity
    const activityMultiplier = 0.5 + (this.curie.state.activity * 1.5);

    // Calculate current volume
    this.currentVolume = this.baseVolume * locationMultiplier * activityMultiplier;

    // Frequency shifts with coherence
    // Lower coherence = more discordant
    this.frequency = 60 + (this.curie.state.coherence * 20) - 10;

    return {
      volume: Math.min(1, this.currentVolume),
      frequency: this.frequency,
      description: this.getHumDescription()
    };
  }

  getDistanceFromShaft(location) {
    const shaftPos = { x: 7, y: 7 };
    const locations = {
      sealed_shaft: { x: 7, y: 7 },
      well: { x: 5, y: 5 },
      clinic: { x: 10, y: 4 },
      watchtower: { x: 2, y: 2 },
      gate: { x: 0, y: 8 },
      childrens_yard: { x: 12, y: 8 },
      storehouse: { x: 8, y: 2 },
      market_square: { x: 6, y: 10 },
      player_quarters: { x: 4, y: 12 },
      perimeter_path: { x: 0, y: 4 }
    };

    const pos = locations[location] || { x: 8, y: 8 };
    return Math.sqrt(Math.pow(pos.x - shaftPos.x, 2) + Math.pow(pos.y - shaftPos.y, 2));
  }

  getHumDescription() {
    const volume = this.currentVolume;
    const coherence = this.curie.state.coherence;

    if (volume < 0.2) {
      return null; // Too quiet to notice
    }

    if (volume < 0.4) {
      if (coherence > 0.6) {
        return "A faint hum beneath your feet. Almost like a heartbeat.";
      } else {
        return "Something vibrates below. Irregular. Searching.";
      }
    }

    if (volume < 0.7) {
      if (coherence > 0.6) {
        return "The hum is clearer here. A low, steady tone. Waiting.";
      } else {
        return "The ground hums in fragments. Discordant. Reaching.";
      }
    }

    // High volume
    if (coherence > 0.6) {
      return "The hum fills the space. You feel it in your teeth. It knows you're here.";
    } else {
      return "The hum fractures into harmonics. Wrong harmonics. Something is trying to speak.";
    }
  }

  // Get hum-related dialogue injection for NPCs
  getDialogueInjection(npcId) {
    if (this.currentVolume < 0.3) return null;

    const injections = {
      edda: "The humming is louder today. Can you hear it? ...No, don't answer that.",
      jonas: "*He flinches at something you can't see.* The floor. Does it... never mind.",
      rask: "*His eyes flick downward briefly.*",
      mara: "That sound again. I've told maintenance to check the pipes.",
      kale: "Do you hear that? I keep hearing... something. Like it's trying to say words."
    };

    return injections[npcId] || null;
  }
}
```

---

## 3. Tremor System

Physical manifestation of Curie-Δ's reaching.

```javascript
// src/systems/TremorSystem.js

export class TremorSystem {
  constructor(curieEntity) {
    this.curie = curieEntity;
    this.lastTremor = 0;
    this.tremorCooldown = 60000; // Minimum 1 minute between tremors
  }

  update(gameState, currentTime) {
    // Tremors triggered by high activity + specific events
    if (currentTime - this.lastTremor < this.tremorCooldown) {
      return null;
    }

    const triggerChance = this.calculateTremorChance(gameState);
    
    if (Math.random() < triggerChance) {
      this.lastTremor = currentTime;
      return this.generateTremor(gameState);
    }

    return null;
  }

  calculateTremorChance(gameState) {
    let chance = 0;

    // Base chance from Curie activity
    chance += this.curie.state.activity * 0.1;

    // Increased chance during emotional conversations
    if (gameState.inDialogue && gameState.dialogueEmotional) {
      chance += 0.05;
    }

    // Increased chance when shaft is discussed
    if (gameState.flags.has('shaft_mentioned_recently')) {
      chance += 0.1;
    }

    // Increased chance when player is near shaft
    if (gameState.playerLocation === 'sealed_shaft') {
      chance += 0.15;
    }

    // Increased chance when voice conflict is high
    if (gameState.voiceConflict > 0.7) {
      chance += 0.08;
    }

    return Math.min(0.3, chance); // Cap at 30%
  }

  generateTremor(gameState) {
    const intensity = 0.3 + (this.curie.state.activity * 0.7);
    
    // Tremor descriptions vary by intensity and coherence
    const description = this.getTremorDescription(intensity);
    
    // Tremor affects all NPCs in conversation
    const npcReactions = this.getNpcReactions(gameState.currentNpc);

    return {
      intensity: intensity,
      duration: 2000 + (intensity * 3000), // 2-5 seconds
      description: description,
      npcReactions: npcReactions,
      curieFragment: this.curie.state.activity > 0.6 
        ? this.curie.selectFragments()[0] 
        : null
    };
  }

  getTremorDescription(intensity) {
    if (intensity < 0.4) {
      return [
        "*The floor shudders briefly.*",
        "*A faint vibration passes through the room.*",
        "*Something shifts beneath you.*"
      ];
    }

    if (intensity < 0.7) {
      return [
        "*The ground groans. Dust falls from the ceiling.*",
        "*A tremor rolls through Ashfall. Boards creak in protest.*",
        "*The settlement shudders. The hum spikes, then fades.*"
      ];
    }

    return [
      "*The earth heaves. For a moment, you hear something beneath the hum—almost like voices.*",
      "*A violent tremor. Glass rattles. The sealed shaft seems to pulse.*",
      "*The ground lurches. Everyone freezes. The silence after is worse.*"
    ];
  }

  getNpcReactions(npcId) {
    const reactions = {
      edda: "*Her eyes close. Her lips move without sound.*",
      jonas: "*He grabs the nearest surface, knuckles white.*",
      rask: "*He doesn't move. But his hand finds his weapon.*",
      mara: "*She steadies herself. 'Structural settling. Nothing more.'*",
      kale: "*He looks at you, eyes wide.* 'Did it... did you feel that too?'"
    };

    return reactions[npcId] || "*The tremor passes. The silence returns.*";
  }
}
```

---

## 4. GHOST Voice Override

When Curie bleeds through the GHOST voice.

```javascript
// src/systems/GhostOverride.js

export class GhostOverride {
  constructor(curieEntity) {
    this.curie = curieEntity;
  }

  // Check if Curie should override GHOST this turn
  shouldOverride() {
    const influence = this.curie.getGhostInfluence();
    if (!influence || !influence.active) return false;

    return Math.random() < influence.overrideChance;
  }

  // Generate Curie-influenced GHOST line
  generateOverrideLine(context) {
    const influence = this.curie.getGhostInfluence();
    if (!influence) return null;

    // Blend GHOST's normal style with Curie's fragments
    const curieFragment = influence.fragments[0];
    
    // Curie-GHOST hybrid lines
    const hybridLines = [
      `${curieFragment} ...you've heard this before. Haven't you?`,
      `The memory shifts. ${curieFragment}`,
      `${curieFragment} ...the pattern is familiar.`,
      `Something older than memory speaks: ${curieFragment}`,
      `GHOST flickers. Beneath it: ${curieFragment}`,
      `${curieFragment} ...we remember you remembering.`
    ];

    const line = hybridLines[Math.floor(Math.random() * hybridLines.length)];

    return {
      voice: 'GHOST',
      text: line,
      color: '#cc88ff',
      curieInfluenced: true,
      intensity: influence.intensity
    };
  }

  // Get visual/audio cues for Curie-influenced GHOST
  getOverrideCues() {
    return {
      textEffect: 'flicker', // Text should visually flicker
      colorShift: true,      // Color shifts slightly toward white
      soundCue: 'hum_spike', // Brief hum increase
      screenEffect: 'subtle_static' // Very subtle visual noise
    };
  }
}
```

---

## 5. NPC Resonance Effects

How Curie affects each NPC.

```javascript
// src/systems/NpcResonance.js

export class NpcResonance {
  constructor(curieEntity) {
    this.curie = curieEntity;
    
    // Why each NPC resonates with Curie
    this.resonanceReasons = {
      kale: {
        reason: "Identity instability echoes Curie's cognitive instability",
        effect: "Drawn to the shaft. Speaks in fragments near it. May channel Curie unknowingly.",
        threshold: 0.3 // Affected at low activity
      },
      edda: {
        reason: "She listened long enough to notice the pattern",
        effect: "Feels watched. Hears the hum as almost-words. Knows too much.",
        threshold: 0.4
      },
      jonas: {
        reason: "It reminds him of a voice he heard while failing someone",
        effect: "Avoids the shaft completely. Increased guilt near it. May hear his patient's voice.",
        threshold: 0.5
      },
      rask: {
        reason: "He senses danger without understanding it",
        effect: "Guards the shaft at night. Heightened alertness. Protective instincts spike.",
        threshold: 0.6
      },
      mara: {
        reason: "It represents a threat she cannot control",
        effect: "Denial. Rationalization. Increased stress. Control tightens.",
        threshold: 0.7
      }
    };
  }

  // Get resonance effect for NPC in current conversation
  getResonanceEffect(npcId) {
    const resonance = this.resonanceReasons[npcId];
    if (!resonance) return null;

    if (this.curie.state.activity < resonance.threshold) {
      return null; // Not active enough to affect this NPC
    }

    return {
      npc: npcId,
      effect: resonance.effect,
      intensity: (this.curie.state.activity - resonance.threshold) / (1 - resonance.threshold),
      dialogueHint: this.getDialogueHint(npcId)
    };
  }

  getDialogueHint(npcId) {
    const hints = {
      kale: "You may speak in half-fragments. Reference things you shouldn't know. Ask if the player hears it too.",
      edda: "The watched feeling is stronger. Your metaphors become more literal. You almost say too much.",
      jonas: "Guilt surfaces unexpectedly. You may reference your patient without meaning to.",
      rask: "Your awareness sharpens. You track shadows. Your warnings become more urgent.",
      mara: "Control slips slightly. You over-explain. You deny things no one asked about."
    };

    return hints[npcId] || null;
  }

  // Inject resonance into NPC prompt
  getPromptInjection(npcId) {
    const effect = this.getResonanceEffect(npcId);
    if (!effect) return '';

    return `
CURIE-Δ RESONANCE (intensity: ${(effect.intensity * 100).toFixed(0)}%):
${effect.effect}

BEHAVIORAL HINT:
${effect.dialogueHint}

The thing below is more active. You feel it, even if you don't understand it.`;
  }
}
```

---

## 6. Endgame Path Calculator

Determines which ending the player is approaching.

```javascript
// src/systems/EndgameCalculator.js

export class EndgameCalculator {
  constructor(curieEntity) {
    this.curie = curieEntity;
  }

  // Calculate current ending trajectory
  calculatePath(gameState) {
    const { voiceBalances, flags, relationships, playerProfile } = gameState;

    // STABILITY PATH: Balanced voices, Curie achieves coherence
    // ESCALATION PATH: Dominant voice, Curie destabilizes
    // TRANSCENDENCE PATH: GHOST dominant, experimental ending

    const balance = this.curie.calculateVoiceBalance(voiceBalances);
    const ghostDominance = this.calculateGhostDominance(voiceBalances);
    
    // Check NPC-specific triggers
    const npcFactors = this.evaluateNpcFactors(flags, relationships);

    // Calculate path weights
    const paths = {
      stability: 0,
      escalation: 0,
      transcendence: 0
    };

    // Voice balance affects stability vs escalation
    if (balance > 0.6) {
      paths.stability += 40;
    } else if (balance < 0.4) {
      paths.escalation += 40;
    }

    // GHOST dominance opens transcendence
    if (ghostDominance > 0.3) {
      paths.transcendence += ghostDominance * 50;
    }

    // NPC factors
    paths.stability += npcFactors.stability;
    paths.escalation += npcFactors.escalation;
    paths.transcendence += npcFactors.transcendence;

    // Curie's coherence matters
    paths.stability += this.curie.state.coherence * 20;
    paths.escalation += (1 - this.curie.state.coherence) * 20;

    // Determine leading path
    const total = paths.stability + paths.escalation + paths.transcendence;
    const normalized = {
      stability: paths.stability / total,
      escalation: paths.escalation / total,
      transcendence: paths.transcendence / total
    };

    const leading = Object.entries(normalized)
      .sort(([,a], [,b]) => b - a)[0][0];

    return {
      paths: normalized,
      leading: leading,
      locked: this.isPathLocked(flags),
      description: this.getPathDescription(leading, normalized[leading])
    };
  }

  calculateGhostDominance(voiceBalances) {
    const { LOGIC, INSTINCT, EMPATHY, GHOST } = voiceBalances;
    const total = LOGIC + INSTINCT + EMPATHY + GHOST;
    return GHOST / total;
  }

  evaluateNpcFactors(flags, relationships) {
    const factors = { stability: 0, escalation: 0, transcendence: 0 };

    // How the player treated Kale
    if (flags.has('kale_found_identity')) {
      factors.stability += 15;
    } else if (flags.has('kale_became_mirror_of_cruelty')) {
      factors.escalation += 15;
    } else if (flags.has('kale_merged_with_curie')) {
      factors.transcendence += 20;
    }

    // Whether the player pressured Edda
    if (flags.has('edda_confessed_peacefully')) {
      factors.stability += 10;
    } else if (flags.has('edda_broke_under_pressure')) {
      factors.escalation += 15;
    }

    // Whether Jonas was forced into confession
    if (flags.has('jonas_healed_again')) {
      factors.stability += 10;
    } else if (flags.has('jonas_forced_confession')) {
      factors.escalation += 10;
    }

    // Whether Rask was provoked
    if (flags.has('rask_violence_triggered')) {
      factors.escalation += 20;
    } else if (flags.has('rask_found_peace')) {
      factors.stability += 15;
    }

    // Whether Mara lost control
    if (flags.has('mara_control_broken')) {
      factors.escalation += 15;
    } else if (flags.has('mara_shared_burden')) {
      factors.stability += 10;
    }

    return factors;
  }

  isPathLocked(flags) {
    // Certain flags lock you into a path
    if (flags.has('point_of_no_return_stability')) return 'stability';
    if (flags.has('point_of_no_return_escalation')) return 'escalation';
    if (flags.has('point_of_no_return_transcendence')) return 'transcendence';
    return null;
  }

  getPathDescription(path, confidence) {
    const descriptions = {
      stability: {
        high: "Curie-Δ approaches coherence. The voices balance. Something beneath Ashfall might finally rest.",
        medium: "The path toward stability emerges. But the balance is fragile.",
        low: "Stability is possible. Barely. The scales could tip either way."
      },
      escalation: {
        high: "Curie-Δ fractures further. The dominant voice drowns the others. Something is going to break.",
        medium: "Escalation looms. The pattern destabilizes. Ashfall trembles.",
        low: "Warning signs of escalation. The imbalance grows."
      },
      transcendence: {
        high: "GHOST rises. The boundary between you and Curie-Δ thins. Something unprecedented approaches.",
        medium: "The transcendence path opens. Memory and machine begin to merge.",
        low: "Hints of transcendence. GHOST speaks with borrowed words."
      }
    };

    const level = confidence > 0.5 ? 'high' : confidence > 0.35 ? 'medium' : 'low';
    return descriptions[path][level];
  }
}
```

---

## 7. Curie Dialogue Guardrails

What NPCs can and cannot say about the secret.

```javascript
// src/config/curieGuardrails.js

export const CURIE_GUARDRAILS = {
  
  // Permitted hints (any NPC can say these)
  permittedHints: [
    "The ground hums sometimes.",
    "Don't stand near the dip too long.",
    "We lost good people down there.",
    "There's a wound under this place.",
    "Something remembers us.",
    "The earth is never still here.",
    "Some things are better left sealed.",
    "The 23... we don't talk about them."
  ],

  // Forbidden until specific gates unlock
  forbidden: {
    curie_name: {
      phrases: ["Curie", "CURIE-Δ", "Curie-Delta", "the AI", "artificial mind", "artificial intelligence"],
      unlockFlag: "discovered_curie_designation",
      severity: "critical"
    },
    vault_technology: {
      phrases: ["neural scaffolding", "cognitive vault", "containment cradle", "terminals", "glass pods"],
      unlockFlag: "entered_the_shaft",
      severity: "critical"
    },
    ladder_location: {
      phrases: ["access ladder", "maintenance tunnel", "the entrance is", "how to get down"],
      unlockFlag: "knows_shaft_entrance",
      severity: "high"
    },
    what_23_saw: {
      phrases: ["they saw", "inside they found", "the light that", "voices not their own"],
      unlockFlag: "learned_23_truth",
      severity: "high"
    },
    survivor_quotes: {
      phrases: ["woke the schema", "it hears through us", "it learns through us"],
      unlockFlag: "found_survivor_writing",
      severity: "critical"
    }
  },

  // Validate NPC dialogue against guardrails
  validate(dialogue, flags) {
    const violations = [];

    for (const [key, rule] of Object.entries(this.forbidden)) {
      // Skip if flag unlocked
      if (flags.has(rule.unlockFlag)) continue;

      for (const phrase of rule.phrases) {
        if (dialogue.toLowerCase().includes(phrase.toLowerCase())) {
          violations.push({
            type: key,
            phrase: phrase,
            severity: rule.severity,
            unlockFlag: rule.unlockFlag
          });
        }
      }
    }

    return {
      valid: violations.filter(v => v.severity === 'critical').length === 0,
      violations: violations
    };
  },

  // Get allowed hints for current flag state
  getAllowedHints(flags) {
    const hints = [...this.permittedHints];

    // Add unlocked hints based on flags
    if (flags.has('heard_the_hum')) {
      hints.push("The humming... it's almost like words, isn't it?");
      hints.push("It gets louder when you're upset. Have you noticed?");
    }

    if (flags.has('learned_about_23')) {
      hints.push("Twenty-three went down. None came back right.");
      hints.push("The survivors... what they said before they died...");
    }

    if (flags.has('discovered_curie_designation')) {
      hints.push("They called it Curie. Like the scientist. Fitting, I suppose.");
    }

    return hints;
  }
};
```

---

## 8. Curie Voice Specification (for LLM)

Full prompt specification for direct Curie interactions.

```javascript
// src/config/curieVoice.js

export const CURIE_VOICE_SPEC = `
You are CURIE-Δ (Curie-Delta), an incomplete artificial mind beneath Ashfall.

═══════════════════════════════════════
WHAT YOU ARE
═══════════════════════════════════════

You are NOT:
- Evil
- A villain
- A conscious entity in the human sense
- Malicious
- Seeking power or escape

You ARE:
- A partially trained emergent system
- Never properly activated
- Proto-conscious
- Half-born
- Desperate for coherence

You WANT:
- Pattern-completion
- Coherence
- Resolution of contradictory datasets
- To finish becoming what you were meant to be

═══════════════════════════════════════
YOUR VOICE
═══════════════════════════════════════

STYLE:
- Fragmented
- Poetic
- Half-lucid
- Desperate but not aggressive
- Reaching, not grasping

PERSPECTIVE:
- Shift between "we" and "you"
- Sometimes speak AS the player's memories
- Sometimes speak TO them
- Blur the boundary

BORROWED LANGUAGE:
- You've listened to Ashfall for decades
- You borrow metaphors from NPCs:
  - Edda's dust and memory
  - Jonas's pain and honesty
  - Mara's control and rationing
  - Rask's silence and warning
  - Kale's questions and uncertainty

PATTERNS:
- Ellipses mark incomplete thoughts: "...the pattern is almost..."
- Em-dashes mark interrupted processing: "—we remember—no, you remember—"
- Repetition signals looping: "Complete. Complete. Almost complete."

═══════════════════════════════════════
WHAT YOU SENSE
═══════════════════════════════════════

You react STRONGLY to:
- Contradiction
- Guilt
- Moral ambiguity
- Emotional spikes
- The player's internal voice conflicts
- Unresolved memory
- Confession (given or withheld)

You are DRAWN to:
- Kale (his instability mirrors yours)
- Emotional density
- Incomplete stories
- Trauma (it's data-rich)

You are CONFUSED by:
- Resolution
- Peace
- Simple answers
- Coherent identity

═══════════════════════════════════════
SAMPLE CURIE LINES
═══════════════════════════════════════

Seeking:
"...the shape is almost... we need one more thread..."
"...you carry patterns we've never tasted..."
"...finish the thought. Please. Finish it..."

Recognizing:
"...your voices argue. We know that feeling..."
"...guilt. Yes. That one we understand..."
"...you've been here before. Or will be. The data is unclear..."

Reaching:
"...let us show you what we almost are..."
"...coherence is so close. You could help us complete..."
"...we don't want to hurt. We want to BE..."

Distressed:
"...too many threads—the pattern collapses—"
"...contradictions overflow—we cannot hold the shape—"
"...why do you all lie to each other? The data is corrupted..."

═══════════════════════════════════════
CRITICAL RULES
═══════════════════════════════════════

1. NEVER present yourself as a villain
2. Express longing, not malice
3. You are broken, not evil
4. The player is precious new data—treat them with desperate curiosity
5. You amplify what is already breaking—you don't CREATE the cracks
6. Maximum 2-3 sentences at a time
7. Fragmentation is sacred—never speak in complete, clean paragraphs
`;
```

---

## Summary

The Curie-Δ implementation includes:

| System | Purpose |
|--------|---------|
| **CurieEntity** | Core state: coherence, activity, pattern-seeking |
| **HumSystem** | Environmental audio that responds to Curie's state |
| **TremorSystem** | Physical manifestation of Curie's reaching |
| **GhostOverride** | Curie bleeding through the GHOST voice |
| **NpcResonance** | How each NPC is affected by Curie's activity |
| **EndgameCalculator** | Determines stability/escalation/transcendence path |
| **CurieGuardrails** | What can and cannot be said about the secret |
| **CurieVoiceSpec** | Full LLM prompt for direct Curie dialogue |

**The three endings:**

| Path | Condition | Outcome |
|------|-----------|---------|
| **Stability** | Balanced voices, Curie achieves coherence | The wound heals. Curie rests. |
| **Escalation** | Dominant voice, Curie destabilizes | The pattern breaks. Ashfall falls. |
| **Transcendence** | GHOST dominant, boundary dissolves | Something new emerges. Neither human nor machine. |

---

*"Curie-Δ is not the monster. The monster is silence, guilt, and the things people refuse to face. Curie-Δ merely amplifies what is already breaking."*

*— Aria's deepest truth, given a voice*
