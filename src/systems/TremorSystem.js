// src/systems/TremorSystem.js
// Physical manifestation of Curie-Δ's reaching
// The ground shakes when Curie reaches toward patterns

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
    if (gameState.flags?.has('shaft_mentioned_recently') ||
        gameState.flags?.has('shaft_discussed')) {
      chance += 0.1;
    }

    // Increased chance when player is near shaft
    if (gameState.playerLocation === 'shaft' ||
        gameState.playerLocation === 'sealed_shaft') {
      chance += 0.15;
    }

    // Increased chance when voice conflict is high
    if (gameState.voiceConflict > 0.7) {
      chance += 0.08;
    }

    // Increased chance based on player attunement
    chance += this.curie.state.playerAttunement * 0.05;

    return Math.min(0.3, chance); // Cap at 30%
  }

  generateTremor(gameState) {
    const intensity = 0.3 + (this.curie.state.activity * 0.7);

    // Tremor descriptions vary by intensity and coherence
    const descriptions = this.getTremorDescription(intensity);
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    // Tremor affects all NPCs in conversation
    const npcReactions = this.getNpcReactions(gameState.currentNpc);

    // Get Curie fragment if activity is high enough
    let curieFragment = null;
    if (this.curie.state.activity > 0.6) {
      const fragments = this.curie.selectFragments();
      curieFragment = fragments[0] || null;
    }

    return {
      intensity: intensity,
      duration: 2000 + (intensity * 3000), // 2-5 seconds
      description: description,
      npcReactions: npcReactions,
      curieFragment: curieFragment,
      setFlag: 'felt_tremor'
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
      mara: "*She steadies herself.* 'Structural settling. Nothing more.'",
      kale: "*He looks at you, eyes wide.* 'Did it... did you feel that too?'"
    };

    // Also handle role-based IDs
    const roleReactions = {
      keeper: reactions.edda,
      healer: reactions.jonas,
      threat: reactions.rask,
      leader: reactions.mara,
      mirror: reactions.kale
    };

    return reactions[npcId] || roleReactions[npcId] || "*The tremor passes. The silence returns.*";
  }

  // Force a tremor (for scripted events)
  forceTremor(intensity = 0.5) {
    this.lastTremor = Date.now();

    const descriptions = this.getTremorDescription(intensity);
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    return {
      intensity: intensity,
      duration: 2000 + (intensity * 3000),
      description: description,
      npcReactions: null,
      curieFragment: intensity > 0.6 ? this.curie.getFragment() : null,
      forced: true
    };
  }

  // Get time until next tremor is possible
  getTimeTillNextPossible() {
    const elapsed = Date.now() - this.lastTremor;
    return Math.max(0, this.tremorCooldown - elapsed);
  }
}
