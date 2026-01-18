// ASHFALL - AgentRunner
// Orchestrates LLM calls, assembles context, validates responses

import { createAgentsSync, hasAgent } from '../agents/index.js';
import { VoiceReactor } from './VoiceReactor.js';
import { PlayerProfile } from './PlayerProfile.js';

export class AgentRunner {
  constructor() {
    this.agents = createAgentsSync();
    this.voiceReactor = new VoiceReactor();
    this.playerProfile = new PlayerProfile();
    this.apiEndpoint = 'https://api.anthropic.com/v1/messages';

    // Make player profile globally accessible for Kale's mirroring
    if (window.ASHFALL) {
      window.ASHFALL.playerProfile = this.playerProfile.getProfile();
    }
  }

  // Get agent for an NPC
  getAgent(npcId) {
    return this.agents[npcId] || null;
  }

  // Check if we can use the agent system for this NPC
  canUseAgent(npcId) {
    return hasAgent(npcId) && this.hasApiKey();
  }

  hasApiKey() {
    return !!(
      window.ASHFALL_CONFIG?.apiKey ||
      localStorage.getItem('anthropic_api_key')
    );
  }

  getApiKey() {
    return (
      window.ASHFALL_CONFIG?.apiKey ||
      localStorage.getItem('anthropic_api_key')
    );
  }

  // Main conversation method
  async runConversation(npcId, playerInput, isOpening = false) {
    const agent = this.getAgent(npcId);
    if (!agent) {
      console.warn(`No agent found for NPC: ${npcId}`);
      return this.getFallbackResponse(npcId);
    }

    const flags = window.ASHFALL.flags;

    // Build the appropriate prompt
    const prompt = isOpening
      ? agent.getOpeningPrompt(flags)
      : agent.buildFullPrompt(playerInput, flags);

    try {
      // Call LLM API
      const response = await this.callLLM(prompt);

      // Validate response
      const validated = this.validateResponse(response, agent, flags);

      // Update agent state
      agent.updateStress(validated.stress_delta);

      // Only add to history if this wasn't an opening
      if (!isOpening && playerInput) {
        agent.addToHistory('player', playerInput);
      }
      agent.addToHistory('npc', validated.dialogue);

      // Update game state
      this.applyGameStateChanges(validated, npcId);

      // Record player choice for Kale's mirroring system
      if (playerInput) {
        this.playerProfile.recordChoice({
          text: playerInput,
          npc: npcId,
          weights: {} // Will be updated when player selects a choice with weights
        });
        window.ASHFALL.playerProfile = this.playerProfile.getProfile();
      }

      // Get voice reactions using the agent's hooks
      const voiceReactions = await this.voiceReactor.getReactions(
        agent,
        validated.dialogue,
        {
          npcStress: agent.currentStress,
          relationship: agent.getRelationship()
        },
        flags
      );

      return {
        dialogue: validated.dialogue,
        choices: validated.player_choices,
        voiceInterrupts: voiceReactions,
        internal_state: validated.internal_state,
        success: true
      };
    } catch (error) {
      console.error('Agent conversation failed:', error);
      return this.getFallbackResponse(npcId);
    }
  }

  async callLLM(prompt) {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      throw new Error('No API key configured');
    }

    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      throw new Error(`Failed to parse JSON: ${e.message}`);
    }
  }

  validateResponse(response, agent, flags) {
    // Ensure required fields exist with sensible defaults
    const validated = {
      dialogue: response.dialogue || '...',
      internal_state: response.internal_state || 'guarded',
      stress_delta: this.clamp(response.stress_delta || 0, -10, 10),
      relationship_delta: this.clamp(response.relationship_delta || 0, -10, 10),
      flags_to_set: Array.isArray(response.flags_to_set) ? response.flags_to_set : [],
      player_choices: Array.isArray(response.player_choices)
        ? response.player_choices
        : this.getDefaultChoices(agent.codex.name)
    };

    // Validate choices format
    validated.player_choices = validated.player_choices.map(choice => ({
      text: choice.text || 'Continue',
      type: choice.type || 'neutral',
      skill_hint: choice.skill_hint || null
    }));

    // Ensure there's always a leave option
    const hasLeave = validated.player_choices.some(
      c => c.text === '[Leave]' || c.type === 'withdrawal'
    );
    if (!hasLeave) {
      validated.player_choices.push({
        text: '[Leave]',
        type: 'withdrawal',
        skill_hint: null
      });
    }

    // Check for forbidden content (basic implementation)
    const forbidden = agent.getForbiddenTopics(flags);
    for (const topic of forbidden) {
      const keywords = topic.toLowerCase().split(' ').filter(w => w.length > 4);
      for (const keyword of keywords) {
        if (validated.dialogue.toLowerCase().includes(keyword)) {
          console.warn(`Potential forbidden topic breach detected: "${topic}"`);
          break;
        }
      }
    }

    return validated;
  }

  applyGameStateChanges(response, npcId) {
    // Apply relationship change
    if (response.relationship_delta !== 0) {
      window.ASHFALL.adjustRelationship(npcId, response.relationship_delta);
    }

    // Set flags
    for (const flag of response.flags_to_set) {
      if (typeof flag === 'string' && flag.length > 0) {
        window.ASHFALL.setFlag(flag);
      }
    }
  }

  // Record a player choice with weights for the profile system
  recordPlayerChoice(choice) {
    this.playerProfile.recordChoice(choice);
    window.ASHFALL.playerProfile = this.playerProfile.getProfile();
  }

  getDefaultChoices(npcName) {
    return [
      { text: 'Tell me more.', type: 'gentle', skill_hint: null },
      { text: 'I should go.', type: 'withdrawal', skill_hint: null }
    ];
  }

  getFallbackResponse(npcId) {
    // Hardcoded fallbacks if API fails
    const fallbacks = {
      leader: {
        dialogue: "*She looks at you, calculating.* We're done here.",
        choices: [
          { text: 'For now.', type: 'direct', skill_hint: null },
          { text: '[Leave]', type: 'withdrawal', skill_hint: null }
        ],
        voiceInterrupts: [
          {
            voice: 'LOGIC',
            text: "She's calculating. You're either useful or a liability.",
            color: '#88ccff'
          }
        ],
        internal_state: 'dismissive',
        success: false
      },
      healer: {
        dialogue: "*He looks away.* I... should check on supplies.",
        choices: [
          { text: 'Are you alright?', type: 'gentle', skill_hint: 'EMPATHY' },
          { text: '[Leave]', type: 'withdrawal', skill_hint: null }
        ],
        voiceInterrupts: [
          {
            voice: 'EMPATHY',
            text: "The guilt is eating him alive. Every day.",
            color: '#88ff88'
          }
        ],
        internal_state: 'avoidant',
        success: false
      },
      threat: {
        dialogue: '*Silence. He watches.*',
        choices: [
          { text: '*Wait*', type: 'silence', skill_hint: null },
          { text: '[Leave]', type: 'withdrawal', skill_hint: null }
        ],
        voiceInterrupts: [
          {
            voice: 'INSTINCT',
            text: 'Dangerous. Absolutely dangerous. But... controlled.',
            color: '#ff8844'
          }
        ],
        internal_state: 'watchful',
        success: false
      },
      keeper: {
        dialogue: "*She looks at you, then away.* The dust is thick today.",
        choices: [
          { text: 'Is something wrong?', type: 'gentle', skill_hint: 'EMPATHY' },
          { text: "[Leave]", type: 'withdrawal', skill_hint: null }
        ],
        voiceInterrupts: [
          {
            voice: 'EMPATHY',
            text: "She's exhausted. Every word costs her something.",
            color: '#88ff88'
          }
        ],
        internal_state: 'guarded',
        success: false
      },
      mirror: {
        dialogue: "I... did I say something wrong?",
        choices: [
          { text: "No, you're fine.", type: 'gentle', skill_hint: null },
          { text: '[Leave]', type: 'withdrawal', skill_hint: null }
        ],
        voiceInterrupts: [
          {
            voice: 'EMPATHY',
            text: "He's desperate. For direction. For someone to follow.",
            color: '#88ff88'
          }
        ],
        internal_state: 'anxious',
        success: false
      }
    };

    return fallbacks[npcId] || fallbacks.keeper;
  }

  // Reset an agent's conversation state
  resetAgent(npcId) {
    if (this.agents[npcId]) {
      this.agents[npcId].resetConversation();
    }
  }

  // Reset all agents
  resetAllAgents() {
    for (const agent of Object.values(this.agents)) {
      agent.resetConversation();
    }
    this.playerProfile.reset();
    window.ASHFALL.playerProfile = this.playerProfile.getProfile();
  }

  // Utility
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
}
