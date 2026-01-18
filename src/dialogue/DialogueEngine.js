// src/dialogue/DialogueEngine.js

import OpenAI from 'openai';
import { NPC_CODEXES } from './npcCodexes.js';
import { TONE_PRIMER } from './tonePrimer.js';
import { ARC_GATE_INSTRUCTIONS, FORBIDDEN_REVEALS } from './arcGates.js';
import { NPC_RELATIONSHIPS } from './relationships.js';

/**
 * ASHFALL Dialogue Engine (OpenAI)
 *
 * Manages NPC conversations using OpenAI's Chat Completions API.
 * Each NPC has their own system prompt (Mind Codex) that defines
 * their personality, knowledge, and behavioral constraints.
 *
 * This is an alternative to the Anthropic-based AgentRunner system.
 */

export class DialogueEngine {
  constructor(config = {}) {
    // Support both environment variable and passed config
    const apiKey = config.apiKey ||
                   (typeof process !== 'undefined' && process.env?.OPENAI_API_KEY) ||
                   (typeof window !== 'undefined' && window.ASHFALL_CONFIG?.openaiApiKey) ||
                   (typeof localStorage !== 'undefined' && localStorage.getItem('openai_api_key'));

    if (apiKey) {
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Required for browser usage
      });
    } else {
      this.openai = null;
      console.warn('DialogueEngine: No OpenAI API key configured');
    }

    this.model = config.model || 'gpt-4-turbo-preview';
    this.maxTokens = config.maxTokens || 300;
    this.temperature = config.temperature || 0.8;

    // Conversation histories per NPC
    this.conversations = new Map();
  }

  /**
   * Check if the engine is configured with an API key
   */
  isConfigured() {
    return this.openai !== null;
  }

  /**
   * Send a message to an NPC and get their response
   */
  async chat(npcId, playerMessage, gameState) {
    if (!this.isConfigured()) {
      return {
        success: false,
        npc: npcId,
        error: 'OpenAI API key not configured',
        fallback: this.getFallbackResponse(npcId)
      };
    }

    // Get or create conversation history
    if (!this.conversations.has(npcId)) {
      this.conversations.set(npcId, []);
    }
    const history = this.conversations.get(npcId);

    // Build the system prompt for this NPC
    const systemPrompt = this.buildSystemPrompt(npcId, gameState);

    // Add player message to history
    history.push({
      role: 'user',
      content: playerMessage
    });

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        presence_penalty: 0.6,
        frequency_penalty: 0.3
      });

      const npcResponse = response.choices[0].message.content;

      // Add NPC response to history
      history.push({
        role: 'assistant',
        content: npcResponse
      });

      // Trim history if too long (keep last 20 exchanges)
      if (history.length > 40) {
        history.splice(0, history.length - 40);
      }

      // Post-process for tone validation
      const validated = this.validateTone(npcResponse, npcId);

      // Extract any flags or triggers from the response
      const triggers = this.extractTriggers(npcResponse, npcId, gameState);

      return {
        success: true,
        npc: npcId,
        response: validated,
        triggers: triggers,
        tokensUsed: response.usage?.total_tokens
      };

    } catch (error) {
      console.error(`Dialogue error for ${npcId}:`, error.message);
      return {
        success: false,
        npc: npcId,
        error: error.message,
        fallback: this.getFallbackResponse(npcId)
      };
    }
  }

  /**
   * Get an opening line from an NPC (no player message)
   */
  async getOpening(npcId, gameState) {
    if (!this.isConfigured()) {
      return {
        success: false,
        npc: npcId,
        error: 'OpenAI API key not configured',
        fallback: this.getFallbackResponse(npcId)
      };
    }

    // Clear any existing history for fresh opening
    this.conversations.set(npcId, []);

    const systemPrompt = this.buildSystemPrompt(npcId, gameState);
    const openingPrompt = this.getOpeningContext(npcId, gameState);

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: openingPrompt }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature
      });

      const npcResponse = response.choices[0].message.content;

      // Add to history
      this.conversations.get(npcId).push({
        role: 'assistant',
        content: npcResponse
      });

      const validated = this.validateTone(npcResponse, npcId);

      return {
        success: true,
        npc: npcId,
        response: validated,
        triggers: this.extractTriggers(npcResponse, npcId, gameState),
        tokensUsed: response.usage?.total_tokens
      };

    } catch (error) {
      console.error(`Opening error for ${npcId}:`, error.message);
      return {
        success: false,
        npc: npcId,
        error: error.message,
        fallback: this.getFallbackResponse(npcId)
      };
    }
  }

  /**
   * Build the complete system prompt for an NPC
   */
  buildSystemPrompt(npcId, gameState) {
    const codex = NPC_CODEXES[npcId] || '';
    const tone = TONE_PRIMER;
    const location = this.getLocationContext(gameState.playerLocation, npcId);
    const relationships = this.getRelationshipContext(npcId, gameState);
    const narrative = this.getNarrativeContext(npcId, gameState);

    const npcName = this.getNpcName(npcId);

    return `${codex}

${tone}

${location}

${relationships}

${narrative}

CURRENT GAME STATE:
- Day: ${gameState.day || 1}
- Time: ${gameState.timeOfDay || 'afternoon'}
- Weather: ${gameState.weather || 'still'}
- Tension Level: ${gameState.tension || 30}/100
- Your relationship with player: ${gameState.relationships?.[npcId] || 50}/100
- Your current stress: ${gameState.npcStress?.[npcId] || 30}/100

Remember: You ARE ${npcName}. Stay in character. Keep responses short (1-3 sentences typically). Never break the fourth wall.`;
  }

  /**
   * Get NPC display name from ID
   */
  getNpcName(npcId) {
    const names = {
      mara: 'Mara Hale',
      jonas: 'Jonas Reed',
      rask: 'Rask',
      edda: 'Edda Thorn',
      kale: 'Kale Sutter'
    };
    return names[npcId] || npcId;
  }

  /**
   * Get opening context for first encounter
   */
  getOpeningContext(npcId, gameState) {
    const contexts = {
      mara: "The player approaches you. They're new here. Assess them. Give a brief, guarded greeting.",
      jonas: "The player approaches you at the clinic. You look up, uncertain. Greet them but keep distance.",
      rask: "The player approaches. You watch them. Say little. Let silence do the work.",
      edda: "The player approaches you near the perimeter. You sense something about them. Offer a cryptic observation.",
      kale: "The player approaches. You're not sure how to act around someone new. Mirror uncertainty, seek cues."
    };

    return contexts[npcId] || "The player approaches you. Respond in character.";
  }

  /**
   * Get location-specific context
   */
  getLocationContext(location, npcId) {
    const contexts = {
      sealed_shaft: `You are near the sealed shaft. The ground dips here. The hum is stronger. You feel uneasy but won't say why directly.`,
      well: `You are near the old well. You avoid looking at it directly. There's shame and memory here.`,
      clinic: `You are at the clinic. Dust covers everything. Medical supplies sit untouched.`,
      watchtower: `You are at or near the watchtower. The settlement spreads below. You can see everything from here.`,
      gate: `You are at the settlement gate. The wasteland stretches beyond. Vigilance is required here.`,
      market_square: `You are in the market square. The heart of Ashfall. People pass through here.`,
      storehouse: `You are near the storehouse. Resources are counted here. Rationed.`,
      residences: `You are in the residential area. Quiet. People keep to themselves.`,
      perimeter: `You are at the perimeter. The edge of safety. Beyond is dust and silence.`
    };

    return contexts[location] || `You are somewhere in the settlement.`;
  }

  /**
   * Get relationship context for cross-references
   */
  getRelationshipContext(npcId, gameState) {
    const relationships = NPC_RELATIONSHIPS[npcId];
    if (!relationships) return '';

    let context = `YOUR FEELINGS ABOUT OTHERS:\n`;
    for (const [otherId, rel] of Object.entries(relationships)) {
      context += `- ${otherId.toUpperCase()}: "${rel.perception}"\n`;
    }

    return context;
  }

  /**
   * Get narrative constraints (arc gates)
   */
  getNarrativeContext(npcId, gameState) {
    const gate = gameState.npcGates?.[npcId] || 0;
    const gateInstructions = ARC_GATE_INSTRUCTIONS[npcId]?.[gate] || '';
    const forbidden = FORBIDDEN_REVEALS[npcId] || 'Nothing specific.';

    return `NARRATIVE CONSTRAINTS:
Your current revelation gate: ${gate}
${gateInstructions}

What you CANNOT reveal yet (save for later gates):
${forbidden}`;
  }

  /**
   * Validate response matches Ashfall tone
   */
  validateTone(response, npcId) {
    let validated = response;

    // Remove forbidden patterns
    const forbidden = [
      /awesome/gi,
      /amazing/gi,
      /cool/gi,
      /gonna/gi,
      /wanna/gi,
      /dude/gi,
      /guys/gi,
      /totally/gi,
      /literally/gi
    ];

    for (const pattern of forbidden) {
      validated = validated.replace(pattern, '');
    }

    // Reduce exclamation marks
    validated = validated.replace(/!+/g, '.');

    // Ensure response isn't too long
    const sentences = validated.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length > 4) {
      validated = sentences.slice(0, 4).join('. ') + '.';
    }

    // Clean up extra whitespace
    validated = validated.replace(/\s+/g, ' ').trim();

    return validated;
  }

  /**
   * Extract narrative triggers from response
   */
  extractTriggers(response, npcId, gameState) {
    const triggers = [];
    const lower = response.toLowerCase();

    // Check for shaft mentions
    if (lower.includes('shaft') || lower.includes('dip') || lower.includes('sealed')) {
      triggers.push({ type: 'shaft_mentioned', npc: npcId });
    }

    // Check for the 23 mentions
    if (lower.includes('23') || lower.includes('twenty-three') || lower.includes('twenty three')) {
      triggers.push({ type: '23_mentioned', npc: npcId });
    }

    // Check for hum mentions
    if (lower.includes('hum') || lower.includes('singing') || lower.includes('vibration')) {
      triggers.push({ type: 'hum_mentioned', npc: npcId });
    }

    // Check for emotional spikes
    const emotionalWords = ['afraid', 'scared', 'hate', 'love', 'sorry', 'forgive', 'trust', 'betrayed'];
    if (emotionalWords.some(w => lower.includes(w))) {
      triggers.push({ type: 'emotional_spike', npc: npcId });
    }

    // Check for confession-adjacent language
    const confessionWords = ['never told', 'secret', 'truth is', 'i did', 'my fault', 'i was there'];
    if (confessionWords.some(w => lower.includes(w))) {
      triggers.push({ type: 'confession_adjacent', npc: npcId });
    }

    return triggers;
  }

  /**
   * Fallback responses if API fails
   */
  getFallbackResponse(npcId) {
    const fallbacks = {
      mara: "*She studies you, then looks away.* Not now.",
      jonas: "*He pauses, hands still.* I... give me a moment.",
      rask: "*Silence. He watches.*",
      edda: "*She hums softly, not meeting your eyes.*",
      kale: "*He shifts uncertainly.* I... what do you think I should say?"
    };

    return fallbacks[npcId] || "*They don't respond.*";
  }

  /**
   * Clear conversation history for an NPC
   */
  clearHistory(npcId) {
    this.conversations.delete(npcId);
  }

  /**
   * Clear all conversation histories
   */
  clearAllHistories() {
    this.conversations.clear();
  }

  /**
   * Get conversation history for an NPC
   */
  getHistory(npcId) {
    return this.conversations.get(npcId) || [];
  }

  /**
   * Set a custom model
   */
  setModel(model) {
    this.model = model;
  }

  /**
   * Update configuration
   */
  configure(config) {
    if (config.model) this.model = config.model;
    if (config.maxTokens) this.maxTokens = config.maxTokens;
    if (config.temperature) this.temperature = config.temperature;
  }
}
