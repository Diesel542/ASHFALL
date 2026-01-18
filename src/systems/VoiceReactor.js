// ASHFALL - VoiceReactor
// The four internal voices that comment on NPC interactions

export class VoiceReactor {
  constructor() {
    this.voices = {
      LOGIC: {
        color: '#88ccff',
        personality: 'Cold analysis. Pattern recognition. Sees through lies but misses the heart.'
      },
      INSTINCT: {
        color: '#ff8844',
        personality: 'Gut feelings. Danger sense. Keeps you alive but might make you cruel.'
      },
      EMPATHY: {
        color: '#88ff88',
        personality: "Reading others. Feeling what they won't say. Understands everyone but might paralyze you with their pain."
      },
      GHOST: {
        color: '#cc88ff',
        personality: "Memory. Trauma. The past that speaks. Reminds you who you were—whether you want to remember or not."
      }
    };
  }

  // Get voice reactions using the agent's voice hooks
  async getReactions(agent, npcDialogue, context, flags) {
    const skills = window.ASHFALL.player.skills;
    const reactions = [];

    // Get hooks from the agent
    const hooks = agent.getVoiceHooks();

    // Check each voice
    for (const [voiceName, voiceData] of Object.entries(this.voices)) {
      const skillLevel = skills[voiceName.toLowerCase()];
      const threshold = this.getThreshold(agent.codex.id, voiceName, flags);

      if (skillLevel >= threshold) {
        const hookSet = hooks[voiceName];
        if (hookSet) {
          const reaction = this.selectHook(hookSet, agent, context);
          if (reaction) {
            reactions.push({
              voice: voiceName,
              text: reaction,
              color: voiceData.color
            });
          }
        }
      }
    }

    // Limit to 2 voice reactions per exchange to avoid overwhelming
    return reactions.slice(0, 2);
  }

  selectHook(hookSet, agent, context) {
    const relationship = agent.getRelationship();
    const stress = agent.currentStress;

    // Select appropriate hook based on context
    if (stress > 70 && hookSet.stressed) {
      return hookSet.stressed;
    } else if (relationship > 70 && hookSet.high_trust) {
      return hookSet.high_trust;
    } else if (relationship < 30 && hookSet.low_trust) {
      return hookSet.low_trust;
    } else if (hookSet.default) {
      return hookSet.default;
    }

    return null;
  }

  getThreshold(npcId, voiceName, flags) {
    // Base thresholds per NPC - some trigger certain voices more easily
    const thresholds = {
      leader: { LOGIC: 4, INSTINCT: 5, EMPATHY: 6, GHOST: 5 },
      healer: { LOGIC: 5, INSTINCT: 6, EMPATHY: 4, GHOST: 5 },
      threat: { LOGIC: 5, INSTINCT: 4, EMPATHY: 6, GHOST: 5 },
      keeper: { LOGIC: 5, INSTINCT: 4, EMPATHY: 5, GHOST: 5 },
      mirror: { LOGIC: 5, INSTINCT: 5, EMPATHY: 4, GHOST: 6 }
    };

    let threshold = thresholds[npcId]?.[voiceName] || 5;

    // Lower thresholds if player has relevant flags
    if (voiceName === 'GHOST' && (flags.has('heard_the_hum') || flags.has('saw_spiral'))) {
      threshold -= 1;
    }
    if (voiceName === 'EMPATHY' && flags.has('healer_trusts_player')) {
      threshold -= 1;
    }
    if (voiceName === 'LOGIC' && flags.has('learned_about_shaft')) {
      threshold -= 1;
    }
    if (voiceName === 'INSTINCT' && flags.has('threat_warning')) {
      threshold -= 1;
    }

    return Math.max(1, threshold);
  }

  // Get voice color by name
  getVoiceColor(voiceName) {
    const voice = this.voices[voiceName.toUpperCase()];
    return voice ? voice.color : '#ffffff';
  }
}
