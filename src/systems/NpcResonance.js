// src/systems/NpcResonance.js
// How Curie-Δ affects each NPC differently
// Each NPC resonates with Curie for different reasons

export class NpcResonance {
  constructor(curieEntity) {
    this.curie = curieEntity;

    // Why each NPC resonates with Curie
    this.resonanceReasons = {
      kale: {
        reason: "Identity instability echoes Curie's cognitive instability",
        effect: "Drawn to the shaft. Speaks in fragments near it. May channel Curie unknowingly.",
        threshold: 0.3, // Affected at low activity
        dialogueHint: "You may speak in half-fragments. Reference things you shouldn't know. Ask if the player hears it too."
      },
      mirror: {
        reason: "Identity instability echoes Curie's cognitive instability",
        effect: "Drawn to the shaft. Speaks in fragments near it. May channel Curie unknowingly.",
        threshold: 0.3,
        dialogueHint: "You may speak in half-fragments. Reference things you shouldn't know. Ask if the player hears it too."
      },
      edda: {
        reason: "She listened long enough to notice the pattern",
        effect: "Feels watched. Hears the hum as almost-words. Knows too much.",
        threshold: 0.4,
        dialogueHint: "The watched feeling is stronger. Your metaphors become more literal. You almost say too much."
      },
      keeper: {
        reason: "She listened long enough to notice the pattern",
        effect: "Feels watched. Hears the hum as almost-words. Knows too much.",
        threshold: 0.4,
        dialogueHint: "The watched feeling is stronger. Your metaphors become more literal. You almost say too much."
      },
      jonas: {
        reason: "It reminds him of a voice he heard while failing someone",
        effect: "Avoids the shaft completely. Increased guilt near it. May hear his patient's voice.",
        threshold: 0.5,
        dialogueHint: "Guilt surfaces unexpectedly. You may reference your patient without meaning to."
      },
      healer: {
        reason: "It reminds him of a voice he heard while failing someone",
        effect: "Avoids the shaft completely. Increased guilt near it. May hear his patient's voice.",
        threshold: 0.5,
        dialogueHint: "Guilt surfaces unexpectedly. You may reference your patient without meaning to."
      },
      rask: {
        reason: "He senses danger without understanding it",
        effect: "Guards the shaft at night. Heightened alertness. Protective instincts spike.",
        threshold: 0.6,
        dialogueHint: "Your awareness sharpens. You track shadows. Your warnings become more urgent."
      },
      threat: {
        reason: "He senses danger without understanding it",
        effect: "Guards the shaft at night. Heightened alertness. Protective instincts spike.",
        threshold: 0.6,
        dialogueHint: "Your awareness sharpens. You track shadows. Your warnings become more urgent."
      },
      mara: {
        reason: "It represents a threat she cannot control",
        effect: "Denial. Rationalization. Increased stress. Control tightens.",
        threshold: 0.7,
        dialogueHint: "Control slips slightly. You over-explain. You deny things no one asked about."
      },
      leader: {
        reason: "It represents a threat she cannot control",
        effect: "Denial. Rationalization. Increased stress. Control tightens.",
        threshold: 0.7,
        dialogueHint: "Control slips slightly. You over-explain. You deny things no one asked about."
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

    const intensity = (this.curie.state.activity - resonance.threshold) / (1 - resonance.threshold);

    return {
      npc: npcId,
      reason: resonance.reason,
      effect: resonance.effect,
      intensity: intensity,
      dialogueHint: resonance.dialogueHint
    };
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

  // Get stress modifier from resonance
  getStressModifier(npcId) {
    const effect = this.getResonanceEffect(npcId);
    if (!effect) return 0;

    // Resonance increases stress
    return Math.floor(effect.intensity * 15);
  }

  // Check if NPC would refuse to go somewhere due to resonance
  wouldRefuseLocation(npcId, locationId) {
    const effect = this.getResonanceEffect(npcId);
    if (!effect) return false;

    // Jonas and Rask avoid the shaft when resonance is high
    if (locationId === 'shaft' || locationId === 'sealed_shaft') {
      if ((npcId === 'jonas' || npcId === 'healer') && effect.intensity > 0.5) {
        return true;
      }
    }

    return false;
  }

  // Get NPC's instinctive reaction to resonance
  getInstinctiveReaction(npcId) {
    const effect = this.getResonanceEffect(npcId);
    if (!effect) return null;

    const reactions = {
      kale: [
        "*His words stumble, then rearrange themselves.*",
        "*He pauses, head tilted. Listening to something.*",
        "*For a moment, he sounds like someone else.*"
      ],
      mirror: [
        "*His words stumble, then rearrange themselves.*",
        "*He pauses, head tilted. Listening to something.*",
        "*For a moment, he sounds like someone else.*"
      ],
      edda: [
        "*She looks at the floor. Through it.*",
        "*Her hand touches the wall, as if checking for vibration.*",
        "*The dust shifts around her. Or seems to.*"
      ],
      keeper: [
        "*She looks at the floor. Through it.*",
        "*Her hand touches the wall, as if checking for vibration.*",
        "*The dust shifts around her. Or seems to.*"
      ],
      jonas: [
        "*His hands shake. He hides them.*",
        "*He looks toward the door. Escape route mapped.*",
        "*A name almost escapes his lips. He swallows it.*"
      ],
      healer: [
        "*His hands shake. He hides them.*",
        "*He looks toward the door. Escape route mapped.*",
        "*A name almost escapes his lips. He swallows it.*"
      ],
      rask: [
        "*His posture shifts. Combat-ready without moving.*",
        "*His eyes track something you can't see.*",
        "*Complete stillness. The dangerous kind.*"
      ],
      threat: [
        "*His posture shifts. Combat-ready without moving.*",
        "*His eyes track something you can't see.*",
        "*Complete stillness. The dangerous kind.*"
      ],
      mara: [
        "*Her jaw tightens almost imperceptibly.*",
        "*She straightens papers that don't need straightening.*",
        "*'Anyway.' She redirects. Always redirects.*"
      ],
      leader: [
        "*Her jaw tightens almost imperceptibly.*",
        "*She straightens papers that don't need straightening.*",
        "*'Anyway.' She redirects. Always redirects.*"
      ]
    };

    const npcReactions = reactions[npcId];
    if (!npcReactions) return null;

    return npcReactions[Math.floor(Math.random() * npcReactions.length)];
  }

  // Get all currently affected NPCs
  getAffectedNpcs() {
    const affected = [];

    for (const npcId of Object.keys(this.resonanceReasons)) {
      const effect = this.getResonanceEffect(npcId);
      if (effect) {
        affected.push({
          npc: npcId,
          intensity: effect.intensity
        });
      }
    }

    return affected.sort((a, b) => b.intensity - a.intensity);
  }
}
