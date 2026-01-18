// src/dialogue/ChoiceSystem.js

import { CHOICE_POOLS } from './choicePools.js';
import { VOICE_CHOICES } from './voiceChoices.js';
import { QUEST_CHOICES } from './questChoices.js';

/**
 * CHOICE SYSTEM
 *
 * Generates contextual dialogue choices based on:
 * - NPC relationship level
 * - Unlocked gates
 * - Active flags
 * - Current tension
 * - Dominant voice
 * - Active quests
 */

export class ChoiceSystem {
  constructor(gameStateManager) {
    this.gsm = gameStateManager;
  }

  /**
   * Generate choices for an NPC conversation
   * @param {string} npcId - The NPC being talked to
   * @param {object} context - Additional context (recent dialogue, etc.)
   * @returns {Array} Available choices
   */
  generateChoices(npcId, context = {}) {
    const choices = [];

    // Get state
    const relationship = this.gsm.get(`relationships.${npcId}.score`) || 50;
    const gate = this.gsm.get(`relationships.${npcId}.gate`) || 0;
    const tension = this.gsm.get('tension.current') || 30;
    const dominantVoice = this.getDominantVoice();
    const flags = this.gsm.state.flags || new Set();

    // 1. Story choices (gate-locked)
    const storyChoices = this.getStoryChoices(npcId, gate, flags);
    choices.push(...storyChoices);

    // 2. Relationship choices
    const relationshipChoices = this.getRelationshipChoices(npcId, relationship, context);
    choices.push(...relationshipChoices);

    // 3. Situational choices
    const situationalChoices = this.getSituationalChoices(npcId, tension, context);
    choices.push(...situationalChoices);

    // 4. Voice-aligned choices
    const voiceChoices = this.getVoiceChoices(npcId, dominantVoice);
    choices.push(...voiceChoices);

    // 5. Quest-related choices
    const questChoices = this.getQuestChoices(npcId);
    choices.push(...questChoices);

    // 6. Always add leave option
    choices.push({
      id: 'leave',
      text: '[Leave]',
      voiceTag: null,
      priority: -1
    });

    // Sort by priority (highest first) and limit to reasonable number
    const sortedChoices = choices
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .slice(0, 5); // Max 4 choices + leave

    // Ensure leave is always last
    const leaveIdx = sortedChoices.findIndex(c => c.id === 'leave');
    if (leaveIdx >= 0 && leaveIdx !== sortedChoices.length - 1) {
      const leave = sortedChoices.splice(leaveIdx, 1)[0];
      sortedChoices.push(leave);
    }

    return sortedChoices;
  }

  /**
   * Get story-critical choices based on gate progression
   */
  getStoryChoices(npcId, gate, flags) {
    const pool = CHOICE_POOLS[npcId]?.story || [];
    const choices = [];

    for (const choice of pool) {
      // Check gate requirement
      if (choice.requireGate && choice.requireGate > gate) continue;

      // Check flag requirements
      if (choice.requireFlags) {
        const hasAllFlags = choice.requireFlags.every(f => flags.has(f));
        if (!hasAllFlags) continue;
      }

      // Check exclusion flags
      if (choice.excludeFlags) {
        const hasExcluded = choice.excludeFlags.some(f => flags.has(f));
        if (hasExcluded) continue;
      }

      choices.push({
        ...choice,
        priority: choice.priority || 10
      });
    }

    return choices;
  }

  /**
   * Get relationship-based choices
   */
  getRelationshipChoices(npcId, relationship, context) {
    const pool = CHOICE_POOLS[npcId]?.relationship || [];
    const choices = [];

    for (const choice of pool) {
      // Check relationship threshold
      if (choice.minRelationship && relationship < choice.minRelationship) continue;
      if (choice.maxRelationship && relationship > choice.maxRelationship) continue;

      choices.push({
        ...choice,
        priority: choice.priority || 5
      });
    }

    return choices;
  }

  /**
   * Get situational choices based on tension and context
   */
  getSituationalChoices(npcId, tension, context) {
    const pool = CHOICE_POOLS[npcId]?.situational || [];
    const choices = [];

    for (const choice of pool) {
      // Check tension requirements
      if (choice.minTension && tension < choice.minTension) continue;
      if (choice.maxTension && tension > choice.maxTension) continue;

      // Check time of day
      if (choice.timeOfDay) {
        const currentTime = this.gsm.get('time.timeOfDay');
        if (choice.timeOfDay !== currentTime) continue;
      }

      // Check location
      if (choice.location) {
        const currentLocation = this.gsm.get('player.location');
        if (choice.location !== currentLocation) continue;
      }

      choices.push({
        ...choice,
        priority: choice.priority || 3
      });
    }

    return choices;
  }

  /**
   * Get voice-aligned choices
   */
  getVoiceChoices(npcId, dominantVoice) {
    const voicePool = VOICE_CHOICES[npcId] || {};
    const choices = [];

    // Always include dominant voice choice if available
    if (dominantVoice.confidence !== 'low' && voicePool[dominantVoice.voice]) {
      choices.push({
        ...voicePool[dominantVoice.voice],
        voiceTag: dominantVoice.voice,
        priority: 8,
        isDominantVoice: true
      });
    }

    // Include secondary voice choices with lower priority
    const voices = ['LOGIC', 'INSTINCT', 'EMPATHY', 'GHOST'];
    for (const voice of voices) {
      if (voice === dominantVoice.voice) continue;
      if (!voicePool[voice]) continue;

      // Only include non-dominant voices sometimes
      const voiceScore = this.gsm.get(`voices.${voice}`) || 0;
      if (voiceScore > 3) {
        choices.push({
          ...voicePool[voice],
          voiceTag: voice,
          priority: 2
        });
      }
    }

    return choices;
  }

  /**
   * Get quest-related choices
   */
  getQuestChoices(npcId) {
    const activeQuests = this.gsm.get('quests.active') || [];
    const choices = [];

    for (const quest of activeQuests) {
      const questPool = QUEST_CHOICES[quest.archetype] || [];
      const relevantChoices = questPool.filter(c =>
        !c.npc || c.npc === npcId
      );

      for (const choice of relevantChoices) {
        // Check stage requirement
        if (choice.stage && choice.stage !== quest.stage) continue;

        choices.push({
          ...choice,
          questId: quest.id,
          priority: choice.priority || 7
        });
      }
    }

    return choices;
  }

  /**
   * Get the player's dominant voice
   */
  getDominantVoice() {
    const voices = {
      LOGIC: this.gsm.get('voices.LOGIC') || 0,
      INSTINCT: this.gsm.get('voices.INSTINCT') || 0,
      EMPATHY: this.gsm.get('voices.EMPATHY') || 0,
      GHOST: this.gsm.get('voices.GHOST') || 0
    };

    const sorted = Object.entries(voices)
      .sort((a, b) => b[1] - a[1]);

    const [topVoice, topScore] = sorted[0];
    const [secondVoice, secondScore] = sorted[1] || [null, 0];

    // Determine confidence
    let confidence = 'low';
    if (topScore >= 10 && topScore - secondScore >= 3) {
      confidence = 'high';
    } else if (topScore >= 5) {
      confidence = 'medium';
    }

    return {
      voice: topVoice,
      score: topScore,
      confidence
    };
  }

  /**
   * Apply the effect of a chosen choice
   */
  applyChoice(choice) {
    // Apply voice alignment
    if (choice.voiceTag) {
      this.gsm.adjustVoiceScore(choice.voiceTag, 1);

      // Emit for UI flash
      this.gsm.events.emit('voice:choice', {
        voice: choice.voiceTag
      });
    }

    // Apply relationship change
    if (choice.relationshipChange) {
      const npcId = choice.npc || this.currentNpc;
      if (npcId) {
        this.gsm.adjustRelationship(npcId, choice.relationshipChange);
      }
    }

    // Set flags
    if (choice.setFlags) {
      for (const flag of choice.setFlags) {
        this.gsm.setFlag(flag);
      }
    }

    // Apply tension change
    if (choice.tensionChange) {
      this.gsm.adjustTension(choice.tensionChange, 'player_choice');
    }

    // Apply Curie activity change
    if (choice.curieActivityChange) {
      this.gsm.adjustCurieActivity(choice.curieActivityChange);
    }

    return choice;
  }

  /**
   * Get all voices and their scores for display
   */
  getVoiceScores() {
    return {
      LOGIC: this.gsm.get('voices.LOGIC') || 0,
      INSTINCT: this.gsm.get('voices.INSTINCT') || 0,
      EMPATHY: this.gsm.get('voices.EMPATHY') || 0,
      GHOST: this.gsm.get('voices.GHOST') || 0
    };
  }
}
