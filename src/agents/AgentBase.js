// ASHFALL - AgentBase
// Base class for all NPC agents with LLM-driven dialogue

export class AgentBase {
  constructor(codex) {
    this.codex = codex;
    this.conversationHistory = [];
    this.currentStress = 30; // 0-100
  }

  // Must be implemented by each agent
  getIdentityPrompt() {
    throw new Error('Must implement getIdentityPrompt');
  }

  getKnowledgePrompt(flags) {
    throw new Error('Must implement getKnowledgePrompt');
  }

  getForbiddenTopics(flags) {
    throw new Error('Must implement getForbiddenTopics');
  }

  getVoiceHooks() {
    throw new Error('Must implement getVoiceHooks');
  }

  // Shared methods
  getRelationship() {
    return window.ASHFALL.relationships.get(this.codex.id) || 50;
  }

  updateStress(delta) {
    this.currentStress = Math.max(0, Math.min(100, this.currentStress + delta));
  }

  addToHistory(role, content) {
    this.conversationHistory.push({
      role,
      content,
      timestamp: Date.now()
    });
    // Keep only last 20 exchanges (10 back-and-forth)
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }

  getCompressedHistory() {
    if (this.conversationHistory.length === 0) {
      return null;
    }
    return this.conversationHistory
      .map(h => `${h.role === 'player' ? 'PLAYER' : this.codex.name.toUpperCase()}: ${h.content}`)
      .join('\n');
  }

  resetConversation() {
    this.conversationHistory = [];
    this.currentStress = 30;
  }

  // Helper methods for describing state
  getRelationshipDescription() {
    const rel = this.getRelationship();
    if (rel < 20) return 'hostile';
    if (rel < 40) return 'guarded';
    if (rel < 60) return 'cautious';
    if (rel < 80) return 'warming';
    return 'trusting';
  }

  getStressDescription() {
    if (this.currentStress > 80) return 'overwhelmed';
    if (this.currentStress > 60) return 'high';
    if (this.currentStress > 40) return 'elevated';
    return 'stable';
  }

  getResponseFormat() {
    return `
RESPONSE FORMAT (valid JSON only):
{
  "dialogue": "What ${this.codex.name} says (1-3 sentences, in character)",
  "internal_state": "Brief emotional state note",
  "stress_delta": <-10 to +10>,
  "relationship_delta": <-10 to +10>,
  "flags_to_set": ["array", "of", "flags"],
  "player_choices": [
    {
      "text": "Player dialogue option",
      "type": "gentle|direct|silence|confrontation|perception",
      "skill_hint": "LOGIC|INSTINCT|EMPATHY|GHOST|null"
    }
  ]
}

Provide 3-4 choices. Include variety: gentle, direct, and withdrawal options.
One choice should always be "[Leave]" with type "withdrawal".`;
  }

  buildFullPrompt(playerInput, flags) {
    const forbidden = this.getForbiddenTopics(flags);

    let forbiddenSection = '';
    if (forbidden.length > 0) {
      forbiddenSection = `
FORBIDDEN - DO NOT REVEAL:
${forbidden.map(f => `- ${f}`).join('\n')}
(Hint, deflect, or refuse—never state directly)`;
    }

    const history = this.getCompressedHistory();
    const historySection = history
      ? `CONVERSATION HISTORY:\n${history}`
      : '(First exchange)';

    return `${this.getIdentityPrompt()}

${this.getKnowledgePrompt(flags)}
${forbiddenSection}

CURRENT STATE:
- Stress: ${this.currentStress}/100 (${this.getStressDescription()})
- Relationship: ${this.getRelationship()}/100 (${this.getRelationshipDescription()})

${historySection}

PLAYER SAYS: "${playerInput}"

Respond in character. Keep responses under 3 sentences unless emotionally warranted.

${this.getResponseFormat()}`;
  }

  // Get an opening line for when conversation starts
  getOpeningPrompt(flags) {
    const history = this.getCompressedHistory();

    // If we have history, this is a continuation
    if (history) {
      return this.buildFullPrompt("*approaches again*", flags);
    }

    // First meeting
    return `${this.getIdentityPrompt()}

${this.getKnowledgePrompt(flags)}

CURRENT STATE:
- Stress: ${this.currentStress}/100 (${this.getStressDescription()})
- Relationship: ${this.getRelationship()}/100 (${this.getRelationshipDescription()})

The player approaches you for the first time. Generate an opening line that:
- Establishes your character immediately
- Hints at mystery without revealing anything
- Invites conversation while maintaining your characteristic distance/tone

${this.getResponseFormat()}`;
  }
}
