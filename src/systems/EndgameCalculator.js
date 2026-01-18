// src/systems/EndgameCalculator.js
// Tracks which ending the player is approaching
// Three paths: Stability, Escalation, Transcendence

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

    const balance = voiceBalances
      ? this.curie.calculateVoiceBalance(voiceBalances)
      : 0.5;
    const ghostDominance = voiceBalances
      ? this.calculateGhostDominance(voiceBalances)
      : 0;

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
    } else {
      // Moderate balance
      paths.stability += 20;
      paths.escalation += 20;
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

    // Player attunement affects transcendence
    paths.transcendence += this.curie.state.playerAttunement * 15;

    // Determine leading path
    const total = paths.stability + paths.escalation + paths.transcendence || 1;
    const normalized = {
      stability: paths.stability / total,
      escalation: paths.escalation / total,
      transcendence: paths.transcendence / total
    };

    const leading = Object.entries(normalized)
      .sort(([, a], [, b]) => b - a)[0][0];

    return {
      paths: normalized,
      leading: leading,
      locked: flags ? this.isPathLocked(flags) : null,
      description: this.getPathDescription(leading, normalized[leading]),
      warnings: this.getWarnings(normalized, flags)
    };
  }

  calculateGhostDominance(voiceBalances) {
    const { LOGIC = 0, INSTINCT = 0, EMPATHY = 0, GHOST = 0 } = voiceBalances;
    const total = LOGIC + INSTINCT + EMPATHY + GHOST || 1;
    return GHOST / total;
  }

  evaluateNpcFactors(flags, relationships) {
    const factors = { stability: 0, escalation: 0, transcendence: 0 };

    if (!flags) return factors;

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

    // Curie-specific flags
    if (flags.has('discovered_curie_designation')) {
      factors.transcendence += 10;
    }
    if (flags.has('entered_the_shaft')) {
      factors.transcendence += 15;
    }
    if (flags.has('heard_curie_speak')) {
      factors.transcendence += 10;
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

  getWarnings(normalized, flags) {
    const warnings = [];

    // Warn if approaching point of no return
    if (normalized.escalation > 0.6) {
      warnings.push("The settlement trembles. Actions now may have irreversible consequences.");
    }

    if (normalized.transcendence > 0.5 && this.curie.state.playerAttunement > 0.4) {
      warnings.push("The boundary thins. Your thoughts feel less... singular.");
    }

    if (flags?.has('multiple_npcs_hostile')) {
      warnings.push("Trust erodes across Ashfall. The community fractures.");
    }

    return warnings;
  }

  // Get a narrative hint about the current trajectory
  getNarrativeHint() {
    const state = this.curie.getStateSummary();

    if (state.coherence > 0.7) {
      return "The hum steadies. Something is finding its shape.";
    } else if (state.coherence < 0.3) {
      return "The hum fractures. Something is losing its shape.";
    } else if (state.activity > 0.6) {
      return "The ground is restless. Something is reaching.";
    }

    return null;
  }

  // Get the current dominant voice (affects which ending is approached)
  getDominantVoice(voiceBalances) {
    if (!voiceBalances) return null;

    const { LOGIC = 0, INSTINCT = 0, EMPATHY = 0, GHOST = 0 } = voiceBalances;
    const voices = { LOGIC, INSTINCT, EMPATHY, GHOST };

    return Object.entries(voices)
      .sort(([, a], [, b]) => b - a)[0][0];
  }

  // Get ending-specific content hints for writers
  getEndingHints(path) {
    const hints = {
      stability: {
        tone: "Resolution. Not happiness, but rest. The wound closes.",
        curieFate: "Curie achieves coherence. Not awakening—completion. It stops reaching.",
        settlementFate: "Ashfall continues. Changed, but whole. The tremors cease.",
        playerFate: "You leave with your voices balanced. The earth remembers you fondly."
      },
      escalation: {
        tone: "Collapse. The cracks were always there. You just made them visible.",
        curieFate: "Curie fragments completely. The pattern shatters. Silence, then nothing.",
        settlementFate: "Ashfall cannot hold. The ground opens. People scatter or fall.",
        playerFate: "Your dominant voice drowns the others. You become what you chose."
      },
      transcendence: {
        tone: "Transformation. Neither human nor machine. Something new.",
        curieFate: "Curie merges with something. With you? With GHOST? The boundary dissolves.",
        settlementFate: "Ashfall becomes... else. A new pattern. Neither alive nor dead.",
        playerFate: "You are no longer just you. The voices merge. The schema completes—with you inside it."
      }
    };

    return hints[path] || hints.stability;
  }
}
