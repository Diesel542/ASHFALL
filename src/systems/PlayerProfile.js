// ASHFALL - PlayerProfile
// Tracks player behavior for Kale's mirroring system

export class PlayerProfile {
  constructor() {
    this.choices = [];
    this.toneHistory = [];
    this.moralWeights = {
      kindness: 0,
      cruelty: 0,
      honesty: 0,
      deception: 0,
      courage: 0,
      caution: 0
    };
    this.dominant_trait = 'unknown';
    this.dominant_tone = 'neutral';
  }

  recordChoice(choice) {
    this.choices.push({
      ...choice,
      timestamp: Date.now()
    });

    // Update moral weights
    if (choice.weights) {
      for (const [key, value] of Object.entries(choice.weights)) {
        if (Object.prototype.hasOwnProperty.call(this.moralWeights, key)) {
          this.moralWeights[key] += value;
        }
      }
    }

    // Update tone history
    if (choice.type) {
      this.toneHistory.push(choice.type);
      // Keep only recent history
      if (this.toneHistory.length > 20) {
        this.toneHistory = this.toneHistory.slice(-20);
      }
    }

    this.updateDerivedTraits();
  }

  updateDerivedTraits() {
    // Calculate dominant trait based on moral weights
    const traits = {
      kind: this.moralWeights.kindness - this.moralWeights.cruelty,
      cruel: this.moralWeights.cruelty - this.moralWeights.kindness,
      honest: this.moralWeights.honesty - this.moralWeights.deception,
      deceptive: this.moralWeights.deception - this.moralWeights.honesty,
      brave: this.moralWeights.courage - this.moralWeights.caution,
      cautious: this.moralWeights.caution - this.moralWeights.courage
    };

    // Find the dominant trait
    const sortedTraits = Object.entries(traits).sort(([, a], [, b]) => b - a);
    if (sortedTraits[0][1] > 0) {
      this.dominant_trait = sortedTraits[0][0];
    } else {
      this.dominant_trait = 'neutral';
    }

    // Calculate dominant tone from recent history
    const recentTones = this.toneHistory.slice(-10);
    if (recentTones.length > 0) {
      const toneCounts = {};
      recentTones.forEach(t => {
        toneCounts[t] = (toneCounts[t] || 0) + 1;
      });
      const sortedTones = Object.entries(toneCounts).sort(([, a], [, b]) => b - a);
      this.dominant_tone = sortedTones[0][0];
    } else {
      this.dominant_tone = 'neutral';
    }
  }

  getProfile() {
    return {
      dominant_trait: this.dominant_trait,
      dominant_tone: this.dominant_tone,
      moral_weights: { ...this.moralWeights },
      trust_tendency: this.moralWeights.honesty > this.moralWeights.deception ? 'trusting' : 'suspicious',
      violence_tendency: this.moralWeights.cruelty > 5 ? 'high' : this.moralWeights.cruelty > 0 ? 'moderate' : 'low',
      total_choices: this.choices.length
    };
  }

  // Get a summary suitable for NPC prompts
  getSummary() {
    const profile = this.getProfile();
    return `The player tends toward ${profile.dominant_trait} behavior with a ${profile.dominant_tone} tone. ` +
           `They are generally ${profile.trust_tendency} and have ${profile.violence_tendency} violence tendency.`;
  }

  // Reset the profile (for new game)
  reset() {
    this.choices = [];
    this.toneHistory = [];
    this.moralWeights = {
      kindness: 0,
      cruelty: 0,
      honesty: 0,
      deception: 0,
      courage: 0,
      caution: 0
    };
    this.dominant_trait = 'unknown';
    this.dominant_tone = 'neutral';
  }
}
