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

  // Get voice reactions for a specific NPC and context
  async getReactions(npcId, npcDialogue, playerContext, flags) {
    const skills = window.ASHFALL.player.skills;
    const reactions = [];

    // NPC-specific voice hooks
    const hooks = this.getNpcHooks(npcId);

    // Check each voice
    for (const [voiceName, voiceData] of Object.entries(this.voices)) {
      const skillLevel = skills[voiceName.toLowerCase()];
      const threshold = this.getThreshold(npcId, voiceName, flags);

      if (skillLevel >= threshold) {
        const reaction = this.generateVoiceReaction(
          voiceName,
          voiceData,
          npcDialogue,
          hooks[voiceName],
          playerContext
        );

        if (reaction) {
          reactions.push({
            voice: voiceName,
            text: reaction,
            color: voiceData.color
          });
        }
      }
    }

    // Limit to 1-2 voices per exchange to avoid overwhelming
    return reactions.slice(0, 2);
  }

  getNpcHooks(npcId) {
    // Pre-written hooks for each NPC/voice combination
    const hooks = {
      keeper: {
        LOGIC: {
          default: "She's hiding the subject. Watch how she pivots.",
          high_trust: "She wants to tell you. The pauses are where the truth lives.",
          stressed: "Her syntax is fragmenting. She's close to breaking.",
          low_trust: "Every sentence is a locked door. Find the key."
        },
        INSTINCT: {
          default: "Danger. Not from her—from what she's afraid of.",
          high_trust: "She's protecting you. From what?",
          stressed: "She's about to run. Let her breathe.",
          low_trust: "Careful. She's deciding whether you're a threat."
        },
        EMPATHY: {
          default: "She's exhausted. Every word costs her something.",
          high_trust: "She sees you now. Really sees you.",
          stressed: "Too much. You're hurting her.",
          low_trust: "Guilt. Drowning in it. But not her own—inherited."
        },
        GHOST: {
          default: "This room knows her voice. It knows yours too.",
          high_trust: "She reminds you of someone. Who?",
          stressed: "Memory and present are blurring for her. For you too.",
          low_trust: "She's spoken these words before. To someone who never came back."
        }
      },
      leader: {
        LOGIC: {
          default: "She's testing you. That sentence was rehearsed.",
          high_trust: "The mask is slipping. She's exhausted from pretending.",
          stressed: "Her authority is crumbling. She knows it."
        },
        INSTINCT: {
          default: "Her hand hasn't moved from her belt.",
          high_trust: "She's let her guard down. Don't make her regret it.",
          stressed: "Fight or flight. She's calculating which."
        },
        EMPATHY: {
          default: "She's lost people. Recently. The grief is fresh.",
          high_trust: "She wants to trust you. It terrifies her.",
          stressed: "The weight of everyone's expectations. It's crushing her."
        },
        GHOST: {
          default: "You've seen leaders like her before. In the Before.",
          high_trust: "She reminds you of someone. Someone you couldn't save.",
          stressed: "This is how it always starts. The unraveling."
        }
      },
      healer: {
        LOGIC: {
          default: "She's prioritizing. You're not at the top of the list.",
          high_trust: "She's sharing information she shouldn't. Why?",
          stressed: "Her medical training is at war with something else."
        },
        INSTINCT: {
          default: "Her hands are shaking. She's afraid of something.",
          high_trust: "She trusts you with her fear. That's rare.",
          stressed: "Something she's seen has broken her. Recently."
        },
        EMPATHY: {
          default: "She cares too much. It's destroying her.",
          high_trust: "Finally. Someone she doesn't have to be strong for.",
          stressed: "She's seen something she can't un-see."
        },
        GHOST: {
          default: "Healers always know more than they say. It's part of the job.",
          high_trust: "You've been treated by people like her before. They saved you.",
          stressed: "The singing. She's heard it too."
        }
      },
      threat: {
        LOGIC: {
          default: "He's not armed. He doesn't see you as a threat.",
          high_trust: "He's telling the truth. All of it. That's worse.",
          stressed: "His mind is fractured. But the fractures let in light."
        },
        INSTINCT: {
          default: "Broken. But not dangerous. Not to you.",
          high_trust: "He survived something unsurvivable. Respect that.",
          stressed: "Something else is looking through his eyes. Sometimes."
        },
        EMPATHY: {
          default: "That laugh. It's not cruel. It's exhausted.",
          high_trust: "He's so tired. He just wants someone to believe him.",
          stressed: "The loneliness. Decades of it. No one listening."
        },
        GHOST: {
          default: "Three days in the dark. You know what that does to a child.",
          high_trust: "He reminds you of... you. Before you learned to hide it.",
          stressed: "Something came back with him. Something is still coming back."
        }
      },
      mirror: {
        LOGIC: {
          default: "They knew you were coming. They were waiting.",
          high_trust: "They understand more than anyone else here. Maybe more than you.",
          stressed: "Their knowledge has a source. What is it?"
        },
        INSTINCT: {
          default: "Wrong. Something is deeply wrong here.",
          high_trust: "Trust them. Against all logic, trust them.",
          stressed: "They're trying to warn you. Listen."
        },
        EMPATHY: {
          default: "They're young. Too young to sound this tired.",
          high_trust: "They've been waiting for someone like you their whole life.",
          stressed: "They're scared. For you, not of you."
        },
        GHOST: {
          default: "You know this spiral. You've traced it in your sleep.",
          high_trust: "They see the same things you do. In dreams.",
          stressed: "The door. You've dreamed of the door too."
        }
      }
    };

    return hooks[npcId] || {};
  }

  getThreshold(npcId, voiceName, flags) {
    // Base thresholds - can be modified by flags/context
    const baseThresholds = {
      LOGIC: 5,
      INSTINCT: 4,
      EMPATHY: 5,
      GHOST: 6
    };

    let threshold = baseThresholds[voiceName] || 5;

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

    return Math.max(1, threshold);
  }

  generateVoiceReaction(voiceName, voiceData, npcDialogue, hooks, context) {
    if (!hooks) return null;

    const relationship = context.relationship || 50;
    const stress = context.npcStress || 30;

    // Select appropriate hook based on context
    if (stress > 70 && hooks.stressed) {
      return hooks.stressed;
    } else if (relationship > 70 && hooks.high_trust) {
      return hooks.high_trust;
    } else if (relationship < 30 && hooks.low_trust) {
      return hooks.low_trust;
    } else if (hooks.default) {
      return hooks.default;
    }

    return null;
  }

  // Get voice color by name
  getVoiceColor(voiceName) {
    const voice = this.voices[voiceName.toUpperCase()];
    return voice ? voice.color : '#ffffff';
  }
}
