// ASHFALL - Consequences System
// Choices that compound. Nothing is forgotten.
//
// Core features:
// - [ ] Action tracking (what the player did)
// - [ ] Weight calculation (how much each choice matters)
// - [ ] Relationship states (how NPCs feel about you)
// - [ ] Ending calculation (all choices → final state)
// - [ ] Ripple effects (choice A changes availability of choice B)

export class ConsequenceTracker {
  constructor() {
    this.actions = [];           // Everything the player has done
    this.relationships = {};     // NPC → sentiment score
    this.weights = {
      kindness: 0,
      cruelty: 0,
      truth: 0,
      deception: 0,
      courage: 0,
      cowardice: 0
    };
  }

  // Record an action
  record(action) {
    const entry = {
      ...action,
      timestamp: Date.now()
    };
    this.actions.push(entry);
    
    // Update weights
    if (action.weights) {
      for (const [key, value] of Object.entries(action.weights)) {
        if (this.weights.hasOwnProperty(key)) {
          this.weights[key] += value;
        }
      }
    }

    // Update relationships
    if (action.relationship) {
      const { npc, delta } = action.relationship;
      this.relationships[npc] = (this.relationships[npc] || 0) + delta;
    }
  }

  // Get relationship with an NPC
  getRelationship(npc) {
    return this.relationships[npc] || 0;
  }

  // Calculate ending state
  calculateEnding() {
    // The ending is not one choice. It's all of them.
    return {
      weights: { ...this.weights },
      relationships: { ...this.relationships },
      totalActions: this.actions.length,
      // More sophisticated calculation to come
    };
  }

  // Check if a specific action was taken
  didAction(actionId) {
    return this.actions.some(a => a.id === actionId);
  }
}

export default ConsequenceTracker;
