// src/entities/Curie.js
// CURIE-Δ: The Thing Beneath Ashfall
//
// A partially trained, incomplete emergent system that was never
// properly activated. Not evil. Not conscious. Proto-conscious.
//
// It wants: coherence, pattern-completion, resolution
// It does NOT want: power, escape, destruction
//
// It manifests through:
// - Sound (the hum)
// - Vibration (the tremors)
// - Emotional resonance (NPCs feeling "wrong" near the dip)
// - The GHOST voice (bleeds through)

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

    // Update player attunement
    this.updateAttunement(gameState);
  }

  updateActivity(gameState) {
    let activityDelta = 0;

    // Player near the shaft increases activity
    if (gameState.playerLocation === 'shaft' || gameState.playerLocation === 'sealed_shaft') {
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

    // Shaft-related flags increase activity
    if (gameState.flags?.has('shaft_discussed')) {
      activityDelta += 0.04;
    }
    if (gameState.flags?.has('heard_the_hum')) {
      activityDelta += 0.02;
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
    const { LOGIC = 0, INSTINCT = 0, EMPATHY = 0, GHOST = 0 } = voiceBalances;
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
    const flags = gameState.flags;

    if (!flags) return;

    if (flags.has('edda_deflected_about_shaft')) {
      patterns.push({ type: 'unresolved_memory', source: 'edda', intensity: 0.7 });
    }

    if (flags.has('jonas_avoided_clinic') || flags.has('jonas_guilt_surfaced')) {
      patterns.push({ type: 'guilt', source: 'jonas', intensity: 0.6 });
    }

    if (flags.has('kale_identity_crisis') || flags.has('kale_confused')) {
      patterns.push({ type: 'identity_instability', source: 'kale', intensity: 0.9 });
    }

    if (flags.has('mara_control_threatened') || flags.has('mara_stressed')) {
      patterns.push({ type: 'contradiction', source: 'mara', intensity: 0.5 });
    }

    if (flags.has('rask_violence_near') || flags.has('rask_triggered')) {
      patterns.push({ type: 'emotional_spike', source: 'rask', intensity: 0.8 });
    }

    // Curie focuses on the strongest pattern
    if (patterns.length > 0) {
      this.state.lastPatternSeek = patterns.sort((a, b) => b.intensity - a.intensity)[0];
    }
  }

  updateResonance(relationships) {
    if (!relationships) return;

    // NPCs with extreme relationships are more affected
    this.state.resonanceTargets = [];

    const entries = relationships instanceof Map
      ? Array.from(relationships.entries())
      : Object.entries(relationships);

    for (const [npcId, value] of entries) {
      if (value < 20 || value > 80) {
        this.state.resonanceTargets.push({
          npc: npcId,
          intensity: Math.abs(value - 50) / 50
        });
      }
    }
  }

  updateAttunement(gameState) {
    // Attunement increases as player interacts with Curie-related content
    const flags = gameState.flags;
    if (!flags) return;

    let attunement = 0;

    if (flags.has('heard_the_hum')) attunement += 0.1;
    if (flags.has('felt_tremor')) attunement += 0.1;
    if (flags.has('ghost_curie_overlap')) attunement += 0.15;
    if (flags.has('learned_about_23')) attunement += 0.2;
    if (flags.has('discovered_curie_designation')) attunement += 0.25;
    if (flags.has('entered_the_shaft')) attunement += 0.3;

    this.state.playerAttunement = Math.min(1, attunement);
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

  // Get a single fragment for display
  getFragment() {
    const influence = this.getGhostInfluence();
    if (!influence) return null;
    return influence.fragments[0] || null;
  }

  // Get current state summary
  getStateSummary() {
    return {
      coherence: this.state.coherence,
      activity: this.state.activity,
      playerAttunement: this.state.playerAttunement,
      resonanceCount: this.state.resonanceTargets.length,
      currentPattern: this.state.lastPatternSeek?.type || null,
      patternSource: this.state.lastPatternSeek?.source || null
    };
  }

  // Reset to initial state
  reset() {
    this.state = {
      coherence: 0.3,
      activity: 0.2,
      playerAttunement: 0,
      resonanceTargets: [],
      lastPatternSeek: null
    };
  }
}
