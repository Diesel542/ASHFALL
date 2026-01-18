// ASHFALL - AgentBase
// Base class for all NPC agents with LLM-driven dialogue

export class AgentBase {
  constructor(codex) {
    this.codex = codex;
    this.conversationHistory = [];
    this.currentStress = 30; // 0-100
  }

  // Override in subclasses
  getIdentityPrompt() {
    throw new Error('Must implement getIdentityPrompt');
  }

  getKnowledgePrompt(flags) {
    throw new Error('Must implement getKnowledgePrompt');
  }

  getForbiddenTopics(flags) {
    throw new Error('Must implement getForbiddenTopics');
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
    // Return summary of conversation so far
    return this.conversationHistory
      .map(h => `${h.role === 'player' ? 'PLAYER' : this.codex.name.toUpperCase()}: ${h.content}`)
      .join('\n');
  }

  resetConversation() {
    this.conversationHistory = [];
    this.currentStress = 30;
  }
}
