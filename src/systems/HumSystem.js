// src/systems/HumSystem.js
// Environmental manifestation of Curie-Δ's activity
// The sound responds to Curie's state and player location

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
    // Distance mapping for all locations
    const distances = {
      shaft: 0,
      sealed_shaft: 0,
      well: 2,
      edda_dwelling: 4,
      commons: 5,
      infirmary: 5,
      market: 6,
      gate: 8,
      perimeter: 9
    };

    return distances[location] ?? 6;
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

    // Also check by role-based IDs
    const roleInjections = {
      keeper: injections.edda,
      healer: injections.jonas,
      threat: injections.rask,
      leader: injections.mara,
      mirror: injections.kale
    };

    return injections[npcId] || roleInjections[npcId] || null;
  }

  // Check if the hum should trigger a GHOST moment
  shouldTriggerGhost() {
    return this.currentVolume > 0.5 && Math.random() < (this.currentVolume * 0.3);
  }

  // Get ambient hum text for scene transitions
  getAmbientText() {
    if (this.currentVolume < 0.2) return null;

    const texts = [
      "*The hum pulses beneath you.*",
      "*Something resonates in the floor.*",
      "*You feel it more than hear it.*",
      "*The air itself seems to vibrate.*",
      "*The hum shifts pitch. Almost expectant.*"
    ];

    return texts[Math.floor(Math.random() * texts.length)];
  }

  // Get current volume level for UI/audio
  getVolumeLevel() {
    if (this.currentVolume < 0.2) return 'silent';
    if (this.currentVolume < 0.4) return 'faint';
    if (this.currentVolume < 0.7) return 'audible';
    return 'loud';
  }
}
