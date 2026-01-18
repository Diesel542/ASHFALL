// src/systems/VoiceScoreTracker.js
// Tracks which internal voice is dominant based on player choices

/**
 * VOICE SCORE TRACKER
 *
 * Tracks which internal voice is dominant based on player choices.
 * The opening scene seeds these scores; later choices build on them.
 */

export class VoiceScoreTracker {
  constructor() {
    this.scores = {
      LOGIC: 0,
      INSTINCT: 0,
      EMPATHY: 0,
      GHOST: 0
    };

    this.history = [];
  }

  addScore(voice, amount, source) {
    if (this.scores.hasOwnProperty(voice)) {
      this.scores[voice] += amount;

      this.history.push({
        voice,
        amount,
        source,
        timestamp: Date.now(),
        newTotal: this.scores[voice]
      });
    }
  }

  // Add scores from an object (e.g., { LOGIC: 1, INSTINCT: 2 })
  addScores(scoreObj, source) {
    for (const [voice, amount] of Object.entries(scoreObj)) {
      this.addScore(voice, amount, source);
    }
  }

  getScore(voice) {
    return this.scores[voice] || 0;
  }

  getScores() {
    return { ...this.scores };
  }

  getDominant() {
    const entries = Object.entries(this.scores);
    const sorted = entries.sort(([, a], [, b]) => b - a);

    const [topVoice, topScore] = sorted[0];
    const [, secondScore] = sorted[1];

    // Check for balance
    if (topScore - secondScore < 3) {
      return { voice: 'BALANCED', confidence: 'low', scores: this.scores };
    }

    const confidence = topScore - secondScore > 7 ? 'high' : 'medium';

    return { voice: topVoice, confidence, scores: this.scores };
  }

  getOpeningImpression() {
    // After the opening scene, summarize the player's initial alignment
    const dominant = this.getDominant();

    const impressions = {
      LOGIC: "You arrived with calculation. Every detail noted, every risk assessed.",
      INSTINCT: "You arrived on edge. Alert to danger, ready to move.",
      EMPATHY: "You arrived open. Sensing the weight these people carry.",
      GHOST: "You arrived remembering. Or being remembered. The line blurs here.",
      BALANCED: "You arrived uncertain. All voices speak; none dominate. Yet."
    };

    return impressions[dominant.voice];
  }

  // Get a narrative description of the voice balance
  getVoiceNarrative() {
    const dominant = this.getDominant();
    const { LOGIC, INSTINCT, EMPATHY, GHOST } = this.scores;
    const total = LOGIC + INSTINCT + EMPATHY + GHOST;

    if (total === 0) {
      return "The voices are silent. Waiting.";
    }

    if (dominant.voice === 'BALANCED') {
      return "Your internal voices compete equally. No single perspective dominates.";
    }

    const voiceDescriptions = {
      LOGIC: {
        high: "Logic speaks loudest. You see patterns, calculate risks, measure everything.",
        medium: "Logic guides you, but other voices still speak."
      },
      INSTINCT: {
        high: "Instinct screams. You feel danger in your bones, react before thinking.",
        medium: "Instinct alerts you, but you haven't surrendered to it."
      },
      EMPATHY: {
        high: "Empathy overwhelms. You feel what others feel, sometimes losing yourself.",
        medium: "Empathy connects you, but you maintain boundaries."
      },
      GHOST: {
        high: "The ghost voice consumes. Memory and premonition blend. Reality thins.",
        medium: "The ghost whispers. You hear things others don't. Careful."
      }
    };

    const desc = voiceDescriptions[dominant.voice];
    return dominant.confidence === 'high' ? desc.high : desc.medium;
  }

  // Get voice tendencies for NPC reactions
  getVoiceTendency() {
    const dominant = this.getDominant();

    const tendencies = {
      LOGIC: {
        approach: 'analytical',
        npcsReact: 'Mara respects your clarity. Jonas finds it cold.',
        danger: 'Missing emotional cues.'
      },
      INSTINCT: {
        approach: 'reactive',
        npcsReact: 'Rask recognizes a survivor. Kale finds you intimidating.',
        danger: 'Acting before understanding.'
      },
      EMPATHY: {
        approach: 'connective',
        npcsReact: 'Jonas opens to you. Mara finds you naive.',
        danger: 'Absorbing others\' pain.'
      },
      GHOST: {
        approach: 'perceptive',
        npcsReact: 'Edda speaks plainly to you. Others find you unsettling.',
        danger: 'Losing distinction between memory and present.'
      },
      BALANCED: {
        approach: 'adaptive',
        npcsReact: 'They\'re uncertain what to make of you. Flexibility or indecision?',
        danger: 'Analysis paralysis.'
      }
    };

    return tendencies[dominant.voice];
  }

  // Get history of voice score changes
  getHistory(limit = 10) {
    return this.history.slice(-limit);
  }

  // Get history filtered by voice
  getVoiceHistory(voice, limit = 10) {
    return this.history
      .filter(h => h.voice === voice)
      .slice(-limit);
  }

  // Sync with global state
  syncWithGlobal() {
    if (window.ASHFALL?.voiceScores) {
      this.scores = { ...window.ASHFALL.voiceScores };
    }
  }

  updateGlobal() {
    if (window.ASHFALL) {
      window.ASHFALL.voiceScores = { ...this.scores };
    }
  }

  // Reset scores
  reset() {
    this.scores = {
      LOGIC: 0,
      INSTINCT: 0,
      EMPATHY: 0,
      GHOST: 0
    };
    this.history = [];
  }

  // Serialize for save
  serialize() {
    return JSON.stringify({
      scores: this.scores,
      history: this.history
    });
  }

  // Deserialize from save
  deserialize(json) {
    const data = JSON.parse(json);
    this.scores = data.scores;
    this.history = data.history || [];
  }
}
