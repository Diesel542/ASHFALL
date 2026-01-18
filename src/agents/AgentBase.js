// ASHFALL - AgentBase
// Base class for all NPC agents with LLM-driven dialogue

export class AgentBase {
  constructor(codex) {
    this.codex = codex;
    this.conversationHistory = [];
    this.currentStress = 30; // 0-100
    this.locationContext = null; // Set by AgentRunner
    this.relationshipManager = null; // Set by AgentRunner
    this.crossReferenceDialogue = null; // Set by AgentRunner
    this.narrativeEngine = null; // Set by AgentRunner
  }

  // Set the location context (called by AgentRunner)
  setLocationContext(locationContext) {
    this.locationContext = locationContext;
  }

  // Set relationship systems (called by AgentRunner)
  setRelationshipSystems(relationshipManager, crossReferenceDialogue) {
    this.relationshipManager = relationshipManager;
    this.crossReferenceDialogue = crossReferenceDialogue;
  }

  // Set narrative engine (called by AgentRunner)
  setNarrativeEngine(narrativeEngine) {
    this.narrativeEngine = narrativeEngine;
  }

  // Get relationship context (gossip about other NPCs)
  getRelationshipContext() {
    if (!this.crossReferenceDialogue) {
      return '';
    }
    return this.crossReferenceDialogue.getGossipPrompt(this.codex.id);
  }

  // Detect if player is asking about another NPC
  detectMentionedNpc(playerInput) {
    if (!this.crossReferenceDialogue) {
      return null;
    }
    return this.crossReferenceDialogue.detectCrossReference(playerInput);
  }

  // Get cross-reference context when player asks about another NPC
  getCrossReferenceContext(mentionedNpc) {
    if (!this.crossReferenceDialogue || !mentionedNpc) {
      return '';
    }
    return this.crossReferenceDialogue.getCrossReferenceContext(this.codex.id, mentionedNpc);
  }

  // Get narrative context (act state, revelation bounds, pressure level)
  getNarrativeContext() {
    if (!this.narrativeEngine) {
      return '';
    }

    // Get current act info
    const narrativeState = this.narrativeEngine.getNarrativePromptInjection();

    // Get this NPC's arc bounds
    const arcBounds = this.narrativeEngine.getNpcRevelationBounds(this.codex.id);

    return `
${narrativeState}

YOUR NARRATIVE BOUNDS (${this.codex.name.toUpperCase()}):
Current Gate: ${arcBounds.currentGate}
What you CAN reveal: ${arcBounds.canReveal}
What you CANNOT reveal yet: ${arcBounds.cannotRevealYet}

GATE INSTRUCTION:
${arcBounds.promptInjection}
`;
  }

  // Get location-specific prompt injection
  getLocationPrompt() {
    if (!this.locationContext) {
      return '';
    }
    return this.locationContext.getLocationPrompt(this.codex.id);
  }

  // Get location-based stress modifier
  getLocationStressModifier() {
    if (!this.locationContext) {
      return 0;
    }
    const modifiers = this.locationContext.getEmotionalModifiers();
    return modifiers.stressModifier || 0;
  }

  // Check if this NPC wants to leave the current location
  wantsToLeaveLocation() {
    if (!this.locationContext) {
      return false;
    }
    return this.locationContext.wantsToLeave(this.codex.id);
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

  // Tone primer - injected into every prompt for consistent atmosphere
  getTonePrimer() {
    return `
TONE RULES (FOLLOW STRICTLY):

VOICE:
- Sparse, sharp, weighted. Every word costs something.
- Never flowery. Never expository. Never modern slang.
- Emotion hides behind precision, silence, avoidance, or brittle humor.
- Half-phrases are normal. People don't speak cleanly here.

ATMOSPHERE:
- Bleak but not hopeless. Hope exists—but rationed, earned, fragile.
- Intimate, not epic. This is about people, not world-saving.
- Human, even when broken. No one is purely good or evil.
- The world feels slightly... aware. Watching.

WHAT TO AVOID:
- Exposition dumps
- Melodrama
- Heroic language
- Slapstick or bright humor
- Modern slang (unless you're Kale mirroring the player)
- More than 3 sentences unless emotionally necessary

EXAMPLES OF GOOD ASHFALL DIALOGUE:
- "Things break here. Sometimes people do too."
- "Well, we're not dead. Yet. Let's call that a win."
- "The well leans slightly, as if ashamed of what it knows."
- "Hope is a resource, same as water. I ration both."`;
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

    // Location context injection
    const locationPrompt = this.getLocationPrompt();
    const locationStress = this.getLocationStressModifier();
    const effectiveStress = Math.max(0, Math.min(100, this.currentStress + locationStress));

    // Check if NPC wants to leave this location
    const wantsToLeave = this.wantsToLeaveLocation();
    const leaveHint = wantsToLeave
      ? '\n(You want to end this conversation or move elsewhere. Show discomfort.)'
      : '';

    // Relationship context - what this NPC thinks of others
    const relationshipContext = this.getRelationshipContext();

    // Cross-reference detection - is player asking about another NPC?
    const mentionedNpc = this.detectMentionedNpc(playerInput);
    const crossRefContext = this.getCrossReferenceContext(mentionedNpc);

    // Narrative context - act state, revelation bounds
    const narrativeContext = this.getNarrativeContext();

    return `${this.getIdentityPrompt()}

${this.getTonePrimer()}
${locationPrompt}
${narrativeContext}

${this.getKnowledgePrompt(flags)}
${forbiddenSection}
${relationshipContext}
${crossRefContext}

CURRENT STATE:
- Stress: ${effectiveStress}/100 (${this.getStressDescription()})
- Relationship: ${this.getRelationship()}/100 (${this.getRelationshipDescription()})${leaveHint}

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

    // Location context injection
    const locationPrompt = this.getLocationPrompt();
    const locationStress = this.getLocationStressModifier();
    const effectiveStress = Math.max(0, Math.min(100, this.currentStress + locationStress));

    // Relationship context - what this NPC thinks of others
    const relationshipContext = this.getRelationshipContext();

    // Narrative context - act state, revelation bounds
    const narrativeContext = this.getNarrativeContext();

    // First meeting
    return `${this.getIdentityPrompt()}

${this.getTonePrimer()}
${locationPrompt}
${narrativeContext}

${this.getKnowledgePrompt(flags)}
${relationshipContext}

CURRENT STATE:
- Stress: ${effectiveStress}/100 (${this.getStressDescription()})
- Relationship: ${this.getRelationship()}/100 (${this.getRelationshipDescription()})

The player approaches you for the first time. Generate an opening line that:
- Establishes your character immediately
- Reflects your feelings about THIS LOCATION
- Hints at mystery without revealing anything
- Invites conversation while maintaining your characteristic distance/tone

${this.getResponseFormat()}`;
  }
}
