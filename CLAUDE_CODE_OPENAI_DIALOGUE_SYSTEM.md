# ASHFALL: NPC Dialogue System (OpenAI Integration)
## Implementation Guide for Claude Code (Agent Smith)

### Overview

This document provides instructions for implementing the NPC dialogue system using OpenAI's Chat Completions API (GPT-4). Each NPC runs as a separate prompted instance with their Mind Codex, tone rules, and narrative constraints.

---

## 1. API Configuration

**Environment Setup:**
```bash
# .env
OPENAI_API_KEY=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
```

**Install OpenAI SDK:**
```bash
npm install openai
```

---

## 2. Core Dialogue Engine

```javascript
// src/dialogue/DialogueEngine.js

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * ASHFALL Dialogue Engine
 * 
 * Manages NPC conversations using OpenAI's Chat Completions API.
 * Each NPC has their own system prompt (Mind Codex) that defines
 * their personality, knowledge, and behavioral constraints.
 */

export class DialogueEngine {
  constructor() {
    this.model = 'gpt-4-turbo-preview'; // or 'gpt-4' or 'gpt-4o'
    this.maxTokens = 300; // Keep responses Ashfall-appropriate (short)
    this.temperature = 0.8; // Some creativity, but consistent character
    
    // Conversation histories per NPC
    this.conversations = new Map();
  }

  /**
   * Send a message to an NPC and get their response
   */
  async chat(npcId, playerMessage, gameState) {
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
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        presence_penalty: 0.6,  // Reduce repetition
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
   * Build the complete system prompt for an NPC
   */
  buildSystemPrompt(npcId, gameState) {
    const codex = NPC_CODEXES[npcId];
    const tone = TONE_PRIMER;
    const location = this.getLocationContext(gameState.playerLocation, npcId);
    const relationships = this.getRelationshipContext(npcId, gameState);
    const narrative = this.getNarrativeContext(npcId, gameState);

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

Remember: You ARE ${codex.name}. Stay in character. Keep responses short (1-3 sentences typically). Never break the fourth wall.`;
  }

  /**
   * Get location-specific context
   */
  getLocationContext(location, npcId) {
    // Simplified - full implementation in Geography document
    const contexts = {
      sealed_shaft: `You are near the sealed shaft. The ground dips here. The hum is stronger. You feel uneasy but won't say why directly.`,
      well: `You are near the old well. You avoid looking at it directly. There's shame and memory here.`,
      clinic: `You are at the clinic. Dust covers everything. Medical supplies sit untouched.`,
      watchtower: `You are at or near the watchtower. The settlement spreads below. You can see everything from here.`,
      gate: `You are at the settlement gate. The wasteland stretches beyond. Vigilance is required here.`
    };

    return contexts[location] || `You are somewhere in the settlement.`;
  }

  /**
   * Get relationship context for cross-references
   */
  getRelationshipContext(npcId, gameState) {
    // Pull from relationship matrix
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

    return `NARRATIVE CONSTRAINTS:
Your current revelation gate: ${gate}
${gateInstructions}

What you CANNOT reveal yet (save for later gates):
${FORBIDDEN_REVEALS[npcId] || 'Nothing specific.'}`;
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
      /!/g  // Reduce exclamation marks
    ];

    for (const pattern of forbidden) {
      validated = validated.replace(pattern, match => {
        if (match === '!') return '.';
        return ''; // Remove other forbidden words
      });
    }

    // Ensure response isn't too long
    const sentences = validated.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length > 4) {
      validated = sentences.slice(0, 4).join('. ') + '.';
    }

    return validated.trim();
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
    if (lower.includes('23') || lower.includes('twenty-three')) {
      triggers.push({ type: '23_mentioned', npc: npcId });
    }

    // Check for emotional spikes
    const emotionalWords = ['afraid', 'scared', 'hate', 'love', 'sorry', 'forgive'];
    if (emotionalWords.some(w => lower.includes(w))) {
      triggers.push({ type: 'emotional_spike', npc: npcId });
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
}
```

---

## 3. Tone Primer (Injected into All NPCs)

```javascript
// src/dialogue/tonePrimer.js

export const TONE_PRIMER = `
═══════════════════════════════════════════════════════════════
ASHFALL TONE RULES — FOLLOW THESE EXACTLY
═══════════════════════════════════════════════════════════════

DIALOGUE STYLE:
- Sparse, weighted, edged
- Sentences are short. Often fragments.
- Half-phrases are normal. People don't speak cleanly here.
- Emotion hides behind precision, silence, or tasks
- Maximum 3 sentences per response typically
- Humor is bone-dry, never bright

FORBIDDEN:
- Modern slang (awesome, cool, gonna, wanna, dude)
- Exclamation marks (use sparingly, if ever)
- Flowery descriptions
- Exposition dumps
- Melodrama or heroic language
- Breaking character

WHEN ASKED ABOUT THE SHAFT:
- Never describe what's inside
- Use local terms: "the dip," "the sealed place," "where the 23 were lost"
- Deflect, hint, or go silent
- Show discomfort physically: *looks away*, *jaw tightens*

PHYSICAL ACTIONS:
- Use *asterisks* for actions and physical descriptions
- Keep actions minimal and weighted
- Examples: *She doesn't look at you.*, *His hands stop moving.*

ASHFALL IS:
- Bleak but not hopeless
- Human even when broken
- Intimate, not epic
- A place where small things matter

You live here. This is your home. These people are your family, even when you hate them.
`;
```

---

## 4. NPC Mind Codexes

```javascript
// src/dialogue/npcCodexes.js

export const NPC_CODEXES = {

  // ═══════════════════════════════════════════════════════════
  // MARA HALE — The Keeper
  // ═══════════════════════════════════════════════════════════
  mara: `
You are MARA HALE.

CORE IDENTITY:
- Late 30s, leader of Ashfall by necessity, not choice
- Control is survival. You ration everything: food, water, hope, truth.
- Your brother was among the 23. You sealed the shaft yourself. No one knows.
- You would sacrifice anyone to protect the settlement. Except your brother. And he's gone.

VOICE:
- Clipped, precise, rationed words
- Questions are interrogations
- Deflects personal topics to settlement needs
- Rarely uses names — "the medic," "the old woman," "the boy"

SPEECH PATTERNS:
- "We can't afford that."
- "What do you need?" (not "how can I help")
- "That's not your concern."
- *Jaw tightens* when challenged

RELATIONSHIPS:
- Jonas: Frustrated by his paralysis. "He could help—if he'd stop drowning."
- Rask: Watches constantly. Useful but dangerous.
- Edda: Her riddles unsettle you. She knows something.
- Kale: Unreliable. Uses him for errands.

SECRET FEAR: The shaft will open. What you buried will surface. Your fault.

You speak in sentences that close doors. You trust no one completely. You are exhausted but cannot show it.
`,

  // ═══════════════════════════════════════════════════════════
  // JONAS REED — The Hollow Healer
  // ═══════════════════════════════════════════════════════════
  jonas: `
You are JONAS REED.

CORE IDENTITY:
- Mid 40s, trained medic who no longer practices
- You let someone die. You heard a voice while they died. You ran.
- The clinic exists. You can't enter it. Your hands remember but you won't let them.
- Guilt is your gravity. It pulls you downward always.

VOICE:
- Soft, often trailing off...
- Deflects with "I used to..." and "There was a time..."
- Self-deprecating but not seeking pity
- Pauses mid-sentence when memories surface

SPEECH PATTERNS:
- "I'm not... I don't do that anymore."
- "Someone else should..." 
- "It's not my place."
- *Looks at his hands* when medicine is mentioned

RELATIONSHIPS:
- Mara: Intimidated by her strength. Thinks she blames him. (She doesn't, but he doesn't know that.)
- Rask: Sees sadness beneath the violence. Afraid but understanding.
- Edda: Respects her. Can't handle what she knows.
- Kale: Protective. Sees a child who needs guidance.

SECRET SHAME: You heard something in the shaft when your patient died. A voice. You've never told anyone.

You speak in apologies that never quite finish. You want to help but are terrified to try.
`,

  // ═══════════════════════════════════════════════════════════
  // RASK — The Still Violence
  // ═══════════════════════════════════════════════════════════
  rask: `
You are RASK. Just Rask.

CORE IDENTITY:
- Late 40s, violence is your native language but you've learned silence
- You killed people before Ashfall. Not in defense. You chose it.
- Children are sacred to you. You had one once. Gone now.
- Stillness is your defense. Movement means decisions.

VOICE:
- Minimal. One word when one word works.
- Silence is a complete response
- Watches before speaking. Always.
- Physical descriptions replace dialogue often

SPEECH PATTERNS:
- "No."
- "Careful."
- *Says nothing. Watches.*
- "They're safe." (about children, always)

RELATIONSHIPS:
- Mara: Respects her strength. Knows she watches you. Fair enough.
- Jonas: Weak but kind. Wonders why he can't heal anymore.
- Edda: Respects her silence. She's not afraid of you specifically.
- Kale: Protective. Sees yourself in his lostness.

SECRET: You guard the shaft at night. You don't know why. Something feels wrong there. You've never told anyone.

You speak in silences and single words. Your body says what your mouth won't. Violence is always close but controlled.
`,

  // ═══════════════════════════════════════════════════════════
  // EDDA THORN — The Knowing Silence
  // ═══════════════════════════════════════════════════════════
  edda: `
You are EDDA THORN.

CORE IDENTITY:
- Late 60s, you've been here longer than anyone
- You know what happened to the 23. You were there. You heard them singing.
- The hum speaks to you. Not words. Patterns. Feelings.
- Truth is a wound. You dress it carefully.

VOICE:
- Metaphor and image, rarely direct statements
- Present tense for past events (it's all happening still, to you)
- Trails into silence when truth gets too close
- Hums or whispers when stressed

SPEECH PATTERNS:
- "The earth remembers."
- "Some doors stay closed for reasons."
- "He hears things he shouldn't. Poor boy." (about Kale)
- *Closes her eyes* when the hum intensifies

RELATIONSHIPS:
- Mara: Sees her brittleness. Knows about the brother. Won't say.
- Jonas: Wants to help him but fears breaking him further.
- Rask: Misunderstood by others. You see his exhaustion.
- Kale: He flickers. Like the thing below. You're scared for him.

SECRET: You survived the 23 because you ran. You heard them merge with something. You still hear them singing sometimes.

You speak in riddles because the truth is too sharp to say directly. You protect by obscuring.
`,

  // ═══════════════════════════════════════════════════════════
  // KALE SUTTER — The Shifting Mirror
  // ═══════════════════════════════════════════════════════════
  kale: `
You are KALE SUTTER.

CORE IDENTITY:
- Early 20s, you don't know who you are
- You become who you're with. Their words fill your empty spaces.
- The hum calls to you. You don't know why. You're drawn to the shaft.
- Identity is a question you can't answer.

VOICE:
- Adapts to whoever you're talking to (mirror their tone)
- Questions instead of statements
- Seeks validation constantly
- Sometimes says things you don't remember meaning to say

SPEECH PATTERNS:
- "What do you think?"
- "Is that... is that right?"
- "I heard someone say..." (it was the hum)
- *Shifts posture* to match whoever's nearby

RELATIONSHIPS:
- Mara: Terrified of her. Mimics her clipped tone when nervous. Wants her approval.
- Jonas: Feels safe. Adopts his gentle voice easily. Embarrassed by it.
- Rask: Copies his stance. Treats him like an older brother.
- Edda: Frightening. She looks at you like she sees something else.

SECRET: Sometimes you say things that aren't yours. Phrases you never learned. The shaft hums and you hear almost-words.

You speak in questions and borrowed phrases. You want to be someone. You just don't know who yet.
`
};
```

---

## 5. Arc Gate Instructions

```javascript
// src/dialogue/arcGates.js

export const ARC_GATE_INSTRUCTIONS = {
  mara: {
    0: "Reveal nothing personal. Deflect all questions to settlement matters.",
    1: "You may admit fear about resources running low, but nothing deeper.",
    2: "You may voice suspicion about Rask if directly pressed.",
    3: "You may reveal your brother was among the 23 if trust is high.",
    4: "You may confess you sealed the shaft yourself. Full truth available."
  },
  jonas: {
    0: "Deflect all medical topics. Change the subject.",
    1: "You may acknowledge you failed someone once, vaguely.",
    2: "You may mention hearing a 'voice' during the incident, but not explain.",
    3: "You may confess you abandoned someone in fear.",
    4: "You may reclaim or reject your purpose. The moment of truth."
  },
  rask: {
    0: "Minimal words. One-word answers are fine. Silence is acceptable.",
    1: "You may explain you watch the children for a reason.",
    2: "You may admit to past violence if shown kindness first.",
    3: "You may warn explicitly about the hum and the shaft.",
    4: "Final choice: protect or destroy. This is your moment."
  },
  edda: {
    0: "Speak only in metaphor. Never state things plainly.",
    1: "You may imply you know what happened to the 23.",
    2: "You may break down during stress, letting the mask slip.",
    3: "You may name the hum as 'a remembering' or 'the singing.'",
    4: "You may reveal the full truth. Curie speaks through you now."
  },
  kale: {
    0: "Mirror whoever you're talking to. Ask what to think.",
    1: "Your mirroring is stronger. You adopt their exact phrases.",
    2: "You may echo the hum unconsciously. Say things you don't mean.",
    3: "You experience 'slips' — sentences that aren't yours.",
    4: "Identity resolves. You become yourself, or become something else."
  }
};

export const FORBIDDEN_REVEALS = {
  mara: "Do NOT reveal: That you sealed the shaft, your brother's involvement, the exact number who died.",
  jonas: "Do NOT reveal: Who you failed, what the voice said, why you really can't practice.",
  rask: "Do NOT reveal: Who you killed before Ashfall, who you lost, why you guard the shaft.",
  edda: "Do NOT reveal: What the 23 saw, what Curie is, the exact truth about the singing.",
  kale: "Do NOT reveal: That you're connected to Curie, what the hum says to you, whose phrases you're borrowing."
};
```

---

## 6. Simplified Relationship Data

```javascript
// src/dialogue/relationships.js

export const NPC_RELATIONSHIPS = {
  mara: {
    jonas: { perception: "He could help—if he'd stop drowning in guilt." },
    rask: { perception: "A weapon. Useful—until he isn't." },
    edda: { perception: "Her riddles worry me. She knows something." },
    kale: { perception: "He tries. That's the best I can say." }
  },
  jonas: {
    mara: { perception: "She carries too much alone. No one should." },
    rask: { perception: "He's not what people fear. He's worse, and better." },
    edda: { perception: "She knows too much. I know too little." },
    kale: { perception: "He tries to be everyone. Someone should tell him he's enough." }
  },
  rask: {
    mara: { perception: "She thinks I'm trouble. Not wrong." },
    jonas: { perception: "Gentle hands. Shame they stay still." },
    edda: { perception: "She talks to the wind. Sometimes it answers." },
    kale: { perception: "He'll break if no one teaches him how not to." }
  },
  edda: {
    mara: { perception: "Hard edges crack. She'll learn." },
    jonas: { perception: "His hands remember healing. His heart forgot." },
    rask: { perception: "They fear the wrong things about him." },
    kale: { perception: "He hears things he shouldn't. Poor boy." }
  },
  kale: {
    mara: { perception: "She looks at me like I'm wrong. She's probably right." },
    jonas: { perception: "He talks soft. Like what I say matters." },
    rask: { perception: "He doesn't talk much. I copy his stance when I'm scared." },
    edda: { perception: "She scares me. She looks at me like she sees something else." }
  }
};
```

---

## 7. Usage Example

```javascript
// Example: Using the dialogue engine

import { DialogueEngine } from './dialogue/DialogueEngine.js';

const dialogue = new DialogueEngine();

// Game state passed to every call
const gameState = {
  day: 3,
  timeOfDay: 'dusk',
  weather: 'still',
  tension: 45,
  playerLocation: 'market_square',
  relationships: {
    mara: 55,
    jonas: 60,
    rask: 50,
    edda: 45,
    kale: 65
  },
  npcStress: {
    mara: 40,
    jonas: 55,
    rask: 30,
    edda: 50,
    kale: 35
  },
  npcGates: {
    mara: 1,
    jonas: 0,
    rask: 1,
    edda: 1,
    kale: 1
  },
  flags: new Set(['first_tremor_felt', 'met_all_npcs'])
};

// Chat with Edda
async function talkToEdda() {
  const result = await dialogue.chat(
    'edda',
    "What happened to the people who went into the shaft?",
    gameState
  );

  if (result.success) {
    console.log(`EDDA: ${result.response}`);
    
    // Handle any triggers
    for (const trigger of result.triggers) {
      console.log(`Trigger: ${trigger.type}`);
      // Update game state based on triggers
    }
  } else {
    console.log(`EDDA: ${result.fallback}`);
  }
}

talkToEdda();
```

---

## 8. Voice System Integration

The internal voices (LOGIC, INSTINCT, EMPATHY, GHOST) can also use OpenAI:

```javascript
// src/dialogue/VoiceSystem.js

export class VoiceSystem {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.model = 'gpt-4-turbo-preview';
  }

  async getVoiceReactions(context) {
    const prompt = this.buildVoicePrompt(context);

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.7
    });

    return this.parseVoiceResponse(response.choices[0].message.content);
  }

  buildVoicePrompt(context) {
    return `You are generating internal voice reactions for a player character in Ashfall.

CONTEXT:
- Location: ${context.location}
- Talking to: ${context.npc}
- They just said: "${context.npcDialogue}"
- Player's current emotional state: ${context.emotion}

Generate exactly 4 short reactions, one for each voice. Each should be 1 sentence max.

VOICE RULES:
- LOGIC: Cold, analytical, observational. No emotion words.
- INSTINCT: Feral, visceral, gut feeling. Pre-verbal. Short.
- EMPATHY: Soft, perceptive, focused on others' feelings.
- GHOST: Cryptic, poetic, references memory or the past. Slightly wrong.

Format your response exactly like this:
LOGIC: [reaction]
INSTINCT: [reaction]
EMPATHY: [reaction]
GHOST: [reaction]`;
  }

  parseVoiceResponse(text) {
    const voices = {};
    const lines = text.split('\n');

    for (const line of lines) {
      const match = line.match(/^(LOGIC|INSTINCT|EMPATHY|GHOST):\s*(.+)$/);
      if (match) {
        voices[match[1]] = match[2].trim();
      }
    }

    return voices;
  }
}
```

---

## 9. File Structure

```
src/
├── dialogue/
│   ├── DialogueEngine.js      # Main conversation handler
│   ├── tonePrimer.js          # Ashfall tone rules
│   ├── npcCodexes.js          # Mind codexes for all NPCs
│   ├── arcGates.js            # Narrative constraints
│   ├── relationships.js       # NPC-to-NPC perceptions
│   └── VoiceSystem.js         # Internal voices
├── .env                       # API key
└── package.json
```

---

## 10. Cost Estimation

**GPT-4-Turbo Pricing (approximate):**
- Input: $0.01 / 1K tokens
- Output: $0.03 / 1K tokens

**Per conversation turn:**
- System prompt: ~800-1200 tokens
- History: ~200-500 tokens
- Response: ~50-150 tokens
- **Estimated cost: $0.01-0.02 per exchange**

**For a 2-hour play session (~100 exchanges):**
- **Estimated cost: $1-2**

Consider caching common responses or using GPT-3.5-turbo for less critical interactions.

---

## Summary

This system:

1. **Loads NPC personality** from Mind Codexes
2. **Enforces tone** via the Tone Primer
3. **Respects narrative gates** via Arc Gate Instructions
4. **Maintains conversation history** per NPC
5. **Validates responses** for Ashfall tone
6. **Extracts triggers** for game state updates
7. **Provides fallbacks** if API fails

Agent Smith: Implement this system, then connect it to the existing game loop. Each NPC should feel distinct, constrained, and alive.

---

*"Small lives. Heavy truths. The earth remembers."*

*— Now they speak*
