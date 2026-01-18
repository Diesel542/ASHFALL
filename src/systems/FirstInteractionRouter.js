// src/systems/FirstInteractionRouter.js
// Determines which NPC to guide player toward based on their choices

import { OPENING_SCENE_DATA } from '../data/openingScene.js';

/**
 * FIRST INTERACTION ROUTER
 *
 * Based on player's tone at the gate, subtly guides them
 * toward an appropriate first NPC conversation.
 */

export class FirstInteractionRouter {
  constructor() {
    this.recommendations = {
      confident: {
        primary: 'mara',
        reason: "Confident players should meet the leader first",
        npcHighlight: true
      },
      humble: {
        primary: 'jonas',
        reason: "Empathetic players will connect with the healer",
        npcHighlight: true
      },
      curious: {
        primary: 'kale',
        reason: "Curious players will intrigue the mirror",
        npcHighlight: true
      },
      silent: {
        primary: 'edda',
        reason: "Silent players earn the secret-keeper's attention",
        npcHighlight: true
      }
    };

    this.firstInteractionComplete = new Set();
  }

  getRecommendation(playerTone) {
    return this.recommendations[playerTone] || this.recommendations.curious;
  }

  // Generate subtle guidance without forcing
  getGuidanceText(playerTone) {
    const guidance = OPENING_SCENE_DATA.firstInteractionGuidance;
    return guidance[playerTone] || guidance.curious;
  }

  // Check if an NPC is the recommended first interaction
  isRecommendedNpc(npcId, playerTone) {
    const rec = this.getRecommendation(playerTone);
    return rec.primary === npcId;
  }

  // Get first dialogue variant based on approach order
  getFirstMeetingVariant(npcId, playerTone, isRecommended = null) {
    const variants = OPENING_SCENE_DATA.firstMeetingVariants;
    const npcVariants = variants[npcId];

    if (!npcVariants) return null;

    // Auto-determine if not specified
    if (isRecommended === null) {
      isRecommended = this.isRecommendedNpc(npcId, playerTone);
    }

    return isRecommended ? npcVariants.recommended : npcVariants.notRecommended;
  }

  // Mark that first interaction with an NPC has occurred
  markFirstInteraction(npcId) {
    this.firstInteractionComplete.add(npcId);
  }

  // Check if first interaction has occurred
  hasMetNpc(npcId) {
    return this.firstInteractionComplete.has(npcId);
  }

  // Get which NPCs haven't been met yet
  getUnmetNpcs() {
    const allNpcs = ['mara', 'jonas', 'rask', 'edda', 'kale'];
    return allNpcs.filter(npc => !this.firstInteractionComplete.has(npc));
  }

  // Get suggested NPC based on voice scores
  getSuggestedNpcByVoice(voiceScores) {
    const voiceNpcMap = {
      LOGIC: 'mara',
      INSTINCT: 'rask',
      EMPATHY: 'jonas',
      GHOST: 'edda'
    };

    // Find dominant voice
    let maxScore = -1;
    let dominantVoice = 'LOGIC';

    for (const [voice, score] of Object.entries(voiceScores)) {
      if (score > maxScore) {
        maxScore = score;
        dominantVoice = voice;
      }
    }

    const suggested = voiceNpcMap[dominantVoice];

    // If already met, suggest Kale as wildcard
    if (this.hasMetNpc(suggested)) {
      const unmet = this.getUnmetNpcs();
      return unmet.length > 0 ? unmet[0] : 'kale';
    }

    return suggested;
  }

  // Generate hint text for where to go next
  getNextHint(playerTone, voiceScores) {
    const unmet = this.getUnmetNpcs();

    if (unmet.length === 0) {
      return {
        text: "You've met everyone. The settlement opens before you.",
        voice: 'LOGIC',
        voiceText: "Initial reconnaissance complete."
      };
    }

    // If first meeting not done, use tone-based recommendation
    if (this.firstInteractionComplete.size === 0) {
      return this.getGuidanceText(playerTone);
    }

    // Otherwise, use voice-based suggestion
    const suggested = this.getSuggestedNpcByVoice(voiceScores);
    const npcHints = {
      mara: {
        text: "Mara watches from the tower. She's waiting.",
        voice: 'LOGIC',
        voiceText: "The leader has questions. Answer them carefully."
      },
      jonas: {
        text: "Jonas lingers by the clinic. He's not as busy as he pretends.",
        voice: 'EMPATHY',
        voiceText: "He needs someone to talk to. Or someone to avoid."
      },
      rask: {
        text: "Rask patrols the perimeter. Always watching.",
        voice: 'INSTINCT',
        voiceText: "He sees threats everywhere. Including you, maybe."
      },
      edda: {
        text: "Edda walks the edges of the settlement. Muttering.",
        voice: 'GHOST',
        voiceText: "She hears things. Things that haven't happened yet."
      },
      kale: {
        text: "Kale follows at a distance. Uncertain. Curious.",
        voice: 'EMPATHY',
        voiceText: "He's learning who to be. From you, apparently."
      }
    };

    return npcHints[suggested] || npcHints.kale;
  }

  // Get all NPC introductions for the glimpse sequence
  getAllGlimpses() {
    return OPENING_SCENE_DATA.settlementGlimpses;
  }

  // Get completion data
  getCompletionData() {
    return OPENING_SCENE_DATA.completion;
  }

  // Reset state (for new game)
  reset() {
    this.firstInteractionComplete.clear();
  }
}
