// src/dialogue/VoiceSystem.js

import OpenAI from 'openai';

/**
 * Voice System (OpenAI)
 *
 * Generates internal voice reactions using OpenAI.
 * The four voices (LOGIC, INSTINCT, EMPATHY, GHOST) comment
 * on NPC dialogue and player decisions.
 */

export class VoiceSystem {
  constructor(config = {}) {
    const apiKey = config.apiKey ||
                   (typeof process !== 'undefined' && process.env?.OPENAI_API_KEY) ||
                   (typeof window !== 'undefined' && window.ASHFALL_CONFIG?.openaiApiKey) ||
                   (typeof localStorage !== 'undefined' && localStorage.getItem('openai_api_key'));

    if (apiKey) {
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });
    } else {
      this.openai = null;
    }

    this.model = config.model || 'gpt-4-turbo-preview';
    this.maxTokens = config.maxTokens || 200;
    this.temperature = config.temperature || 0.7;
  }

  /**
   * Check if the system is configured
   */
  isConfigured() {
    return this.openai !== null;
  }

  /**
   * Get voice reactions to an NPC's dialogue
   */
  async getVoiceReactions(context) {
    if (!this.isConfigured()) {
      return this.getFallbackReactions(context);
    }

    const prompt = this.buildVoicePrompt(context);

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: this.maxTokens,
        temperature: this.temperature
      });

      return this.parseVoiceResponse(response.choices[0].message.content);

    } catch (error) {
      console.error('Voice system error:', error.message);
      return this.getFallbackReactions(context);
    }
  }

  /**
   * Build the prompt for voice generation
   */
  buildVoicePrompt(context) {
    return `You are generating internal voice reactions for a player character in Ashfall, a bleak post-collapse settlement RPG.

CONTEXT:
- Location: ${context.location || 'settlement'}
- Talking to: ${context.npc || 'someone'}
- They just said: "${context.npcDialogue || '...'}"
- Player's current emotional state: ${context.emotion || 'neutral'}
- Narrative tension: ${context.tension || 30}/100
- Relationship with this NPC: ${context.relationship || 50}/100

Generate exactly 4 short reactions, one for each internal voice. Each should be 1 sentence max (often just a fragment).

VOICE RULES:
- LOGIC: Cold, analytical, observational. No emotion words. Pattern recognition. "Probability of deception: high." or "Their pulse elevated when they mentioned the shaft."
- INSTINCT: Feral, visceral, gut feeling. Pre-verbal. Short. "Wrong." or "Danger here. Old danger." or "Run? No. Watch."
- EMPATHY: Soft, perceptive, focused on others' feelings. "They're hiding pain." or "This costs them something to say."
- GHOST: Cryptic, poetic, references memory or the past. Slightly wrong. Unsettling. "You've heard this before. Or you will." or "The echo knows your name."

IMPORTANT:
- Keep each reaction SHORT (3-10 words ideal)
- GHOST should feel slightly off, like it knows things it shouldn't
- Don't explain or elaborate
- Match the tone: bleak, weighted, intimate

Format your response exactly like this:
LOGIC: [reaction]
INSTINCT: [reaction]
EMPATHY: [reaction]
GHOST: [reaction]`;
  }

  /**
   * Parse the voice response into structured format
   */
  parseVoiceResponse(text) {
    const voices = {
      LOGIC: null,
      INSTINCT: null,
      EMPATHY: null,
      GHOST: null
    };

    const lines = text.split('\n');

    for (const line of lines) {
      const match = line.match(/^(LOGIC|INSTINCT|EMPATHY|GHOST):\s*(.+)$/i);
      if (match) {
        const voice = match[1].toUpperCase();
        let content = match[2].trim();

        // Remove quotes if present
        content = content.replace(/^["']|["']$/g, '');

        voices[voice] = {
          voice: voice,
          text: content,
          color: this.getVoiceColor(voice)
        };
      }
    }

    // Convert to array, filtering out any that didn't parse
    return Object.values(voices).filter(v => v !== null);
  }

  /**
   * Get the display color for a voice
   */
  getVoiceColor(voice) {
    const colors = {
      LOGIC: '#88ccff',    // Cool blue
      INSTINCT: '#ff8844', // Warm orange
      EMPATHY: '#88ff88',  // Soft green
      GHOST: '#cc88ff'     // Ethereal purple
    };
    return colors[voice] || '#ffffff';
  }

  /**
   * Fallback reactions when API is unavailable
   */
  getFallbackReactions(context) {
    const npc = context.npc || 'them';
    const tension = context.tension || 30;

    // Select appropriate fallbacks based on tension
    if (tension > 70) {
      return [
        { voice: 'LOGIC', text: 'Elevated stress indicators. Proceed with caution.', color: '#88ccff' },
        { voice: 'INSTINCT', text: 'Wrong. All of this is wrong.', color: '#ff8844' },
        { voice: 'EMPATHY', text: "They're barely holding on.", color: '#88ff88' },
        { voice: 'GHOST', text: 'The pattern tightens.', color: '#cc88ff' }
      ];
    } else if (tension > 40) {
      return [
        { voice: 'LOGIC', text: 'Information withheld. Motive unclear.', color: '#88ccff' },
        { voice: 'INSTINCT', text: 'Watch. Wait.', color: '#ff8844' },
        { voice: 'EMPATHY', text: "There's more they're not saying.", color: '#88ff88' },
        { voice: 'GHOST', text: 'You knew this already.', color: '#cc88ff' }
      ];
    } else {
      return [
        { voice: 'LOGIC', text: 'Baseline conversation. Nothing unusual.', color: '#88ccff' },
        { voice: 'INSTINCT', text: 'Safe. For now.', color: '#ff8844' },
        { voice: 'EMPATHY', text: 'They seem... tired.', color: '#88ff88' },
        { voice: 'GHOST', text: 'Listen to what they don\'t say.', color: '#cc88ff' }
      ];
    }
  }

  /**
   * Get a single voice reaction (for specific voice emphasis)
   */
  async getSingleVoiceReaction(voice, context) {
    const allReactions = await this.getVoiceReactions(context);
    return allReactions.find(r => r.voice === voice) || null;
  }

  /**
   * Get weighted voice reactions based on player alignment
   */
  async getWeightedReactions(context, voiceWeights = {}) {
    const reactions = await this.getVoiceReactions(context);

    // Sort by weight (higher weighted voices appear first)
    const defaultWeight = 1;
    reactions.sort((a, b) => {
      const weightA = voiceWeights[a.voice] || defaultWeight;
      const weightB = voiceWeights[b.voice] || defaultWeight;
      return weightB - weightA;
    });

    // Mark dominant voice
    if (reactions.length > 0) {
      const topWeight = voiceWeights[reactions[0].voice] || defaultWeight;
      if (topWeight > 1.5) {
        reactions[0].dominant = true;
      }
    }

    return reactions;
  }
}

/**
 * Voice reaction templates for specific situations
 */
export const VOICE_TEMPLATES = {
  shaft_mentioned: {
    LOGIC: [
      'Subject deflects. The shaft is significant.',
      'Anxiety response detected. This topic is dangerous to them.',
      'Patterns suggest concealment. The shaft holds answers.'
    ],
    INSTINCT: [
      'Bad. Don\'t ask more.',
      'The ground feels wrong when they say that word.',
      'Stop. Change subject. Now.'
    ],
    EMPATHY: [
      'This hurts them to talk about.',
      'They\'re protecting something. Or someone.',
      'The fear is real. Give them space.'
    ],
    GHOST: [
      'The singing starts when they say that word.',
      'You\'ve been here before. You\'ll be here again.',
      'The earth remembers what they forgot.'
    ]
  },

  emotional_spike: {
    LOGIC: [
      'Emotional state unstable. Data unreliable.',
      'Truthful responses more likely during distress.',
      'Their defenses are lowering.'
    ],
    INSTINCT: [
      'Vulnerable. Help or exploit?',
      'The mask slipped. Watch.',
      'Real now. This is real.'
    ],
    EMPATHY: [
      'They need someone right now.',
      'This is costing them everything.',
      'Be gentle. This matters.'
    ],
    GHOST: [
      'Everyone breaks eventually.',
      'You\'ve made someone cry like this.',
      'The pattern requires pain.'
    ]
  },

  confession_adjacent: {
    LOGIC: [
      'Approaching revelation threshold.',
      'Trust metrics elevated. They may share more.',
      'Critical information incoming.'
    ],
    INSTINCT: [
      'They want to tell you. Let them.',
      'Close now. Don\'t push.',
      'Truth is coming. Brace.'
    ],
    EMPATHY: [
      'They\'ve carried this alone too long.',
      'Witness this. It\'s what they need.',
      'This changes everything between you.'
    ],
    GHOST: [
      'Secrets are just truths that waited.',
      'You knew. You always knew.',
      'The confession was already written.'
    ]
  }
};

/**
 * Get template-based reaction for a specific trigger
 */
export function getTemplateReaction(trigger, voice) {
  const templates = VOICE_TEMPLATES[trigger]?.[voice];
  if (!templates || templates.length === 0) return null;

  return templates[Math.floor(Math.random() * templates.length)];
}
