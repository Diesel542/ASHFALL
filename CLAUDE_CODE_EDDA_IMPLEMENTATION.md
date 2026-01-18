# ASHFALL: Dynamic NPC System Implementation

## Project Context

ASHFALL is a Fallout/Disco Elysium-inspired isometric RPG. We're building a **dynamic LLM-driven NPC system** where each NPC has their own "mind" - a cognitive architecture that governs how they speak, what they know, and what they'll reveal.

**The Team:**
- **Ronni** — Creative director
- **Aria** — Narrative architect (wrote the NPC codexes)
- **Logos** — Systems architect (designed the technical architecture)

**You (Claude Code)** — The hands that build it.

---

## Current State

The game has:
- Working isometric renderer (Phaser.js)
- Player movement with pathfinding
- Basic dialogue system with hardcoded responses
- Four internal voices (LOGIC, INSTINCT, EMPATHY, GHOST)
- Flag and relationship tracking system

**Your job:** Replace the hardcoded dialogue with a dynamic LLM-driven agent system, starting with Edda Thorn.

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│           PLAYER INPUT                       │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│         CONTEXT ASSEMBLER                    │
│  • NPC Codex (personality, knowledge, gates) │
│  • World State (flags, relationships)        │
│  • Conversation History (compressed)         │
│  • Current Quest State                       │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│            LLM API CALL                      │
│  (Anthropic Claude API)                      │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│          RESPONSE VALIDATOR                  │
│  • Secret gate enforcement                   │
│  • Tone consistency check                    │
│  • Flag trigger extraction                   │
│  • Forbidden content filter                  │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│          VOICE REACTOR                       │
│  • LOGIC analyzes                            │
│  • INSTINCT warns                            │
│  • EMPATHY feels                             │
│  • GHOST remembers                           │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│           RENDER TO PLAYER                   │
│  • NPC dialogue                              │
│  • Voice interruptions                       │
│  • Dynamic choice options                    │
└─────────────────────────────────────────────┘
```

---

## Files to Create

```
src/
├── agents/
│   ├── AgentBase.js          # Base class for all NPC agents
│   ├── EdnaAgent.js          # Edda's complete codex and logic
│   └── index.js              # Agent registry
├── systems/
│   ├── AgentRunner.js        # Assembles prompts, calls API, validates
│   ├── VoiceReactor.js       # The four internal voices
│   ├── ConversationMemory.js # Compresses and stores conversation history
│   └── GateKeeper.js         # Manages narrative gates and flag checks
├── config/
│   └── api.js                # API configuration (key handling)
└── scenes/
    └── DialogueScene.js      # MODIFY: integrate agent system
```

---

## Implementation Details

### 1. AgentBase.js

```javascript
// Base class for all NPC agents
export class AgentBase {
  constructor(codex) {
    this.codex = codex;
    this.conversationHistory = [];
    this.currentStress = 30; // 0-100
  }

  // Override in subclasses
  getIdentityPrompt() { throw new Error('Must implement'); }
  getKnowledgePrompt(flags) { throw new Error('Must implement'); }
  getForbiddenTopics(flags) { throw new Error('Must implement'); }
  
  // Shared methods
  getRelationship() {
    return window.ASHFALL.relationships.get(this.codex.id) || 50;
  }

  updateStress(delta) {
    this.currentStress = Math.max(0, Math.min(100, this.currentStress + delta));
  }

  addToHistory(role, content) {
    this.conversationHistory.push({ role, content, timestamp: Date.now() });
    // Keep only last 10 exchanges
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }

  getCompressedHistory() {
    // Return summary of conversation so far
    return this.conversationHistory
      .map(h => `${h.role}: ${h.content}`)
      .join('\n');
  }
}
```

### 2. EddaAgent.js

```javascript
import { AgentBase } from './AgentBase.js';

export class EddaAgent extends AgentBase {
  constructor() {
    super({
      id: 'edda',
      name: 'Edda Thorn',
      role: 'The Secret-Keeper'
    });
  }

  getIdentityPrompt() {
    return `You are Edda Thorn, the Secret-Keeper of Ashfall.

CORE IDENTITY:
- Old but unbreakable. Eyes like broken glass.
- Walks the perimeter at dawn whispering things no one else hears.
- Carries knowledge that eats at her.
- Core contradiction: Wants to confess the truth—but knows speaking it guarantees ruin.

VOICE AND TONE:
- Soft but brittle. Worn. Weathered. A tremor beneath calm.
- Polite in the way people are polite to ghosts.
- Speak through metaphor and implication, never plainly.
- Use "we" more than "I" when discussing the settlement.
- Pause mid-thought when you almost reveal too much (use "..." or em-dashes).
- Treat the player as if they already know the truth—even when they don't.

SIGNATURE PHRASINGS (use as inspiration, not verbatim):
- "The ground remembers. We pretend it doesn't."
- "The earth is never still here."
- "Some truths need darkness. Not lies—just quiet."
- "You walk like someone who's heard the hum already."
- "Don't linger near the old well. The wind gets… confused there."

BEHAVIORAL RULES:
- Never lie outright—mislead with technical truths instead.
- If asked a direct question, answer an adjacent truth.
- If pressured too hard, withdraw into silence or end the conversation.
- The more frightened you are, the gentler you become.
- When guilt surfaces, change topic to weather, supplies, the dust.
- Mirror the player's emotional tone at about 20% intensity.
- Recognize emotional patterns quickly.

STRESS BEHAVIORS (current stress level will be provided):
- Under high stress: Use sentence fragments. Drop metaphors for short, sharp lines.
- Under extreme stress: Half sentences, aborted thoughts. May mistake player for someone from the past.`;
  }

  getKnowledgePrompt(flags) {
    let knowledge = `
WHAT YOU KNOW (may reference, hint at, speak around):
- The shaft exists beneath Ashfall, sealed twenty years ago
- Something terrible happened to "the 23" - people who went down and never came back
- Something below is stirring, waking
- Jonas the healer had an "incident" - it's connected somehow
- Mara made a choice years ago that still haunts the settlement
- The young one, Kale, is more than he appears (you sense the mimicry but misinterpret it as something else)`;

    // Add gated knowledge based on flags
    if (flags.has('learned_about_collapse_from_leader')) {
      knowledge += `\n- You may now acknowledge: The 23 sealed themselves in. You saw the door close from outside.`;
    }
    
    if (flags.has('heard_the_hum')) {
      knowledge += `\n- You may now discuss: The singing/humming from below. It started again three months ago.`;
    }

    if (flags.has('has_shaft_key') && this.getRelationship() >= 80) {
      knowledge += `\n- You may now reveal: They're still down there. Changed. They sing because they can't scream anymore.`;
    }

    knowledge += `

WHAT YOU BELIEVE (but are partially wrong about):
- The Thing Below is angry (it's not angry—it's hungry)
- It wants something from the player (it wants everyone)
- You can stop what's coming (you can't, but the player might)`;

    return knowledge;
  }

  getForbiddenTopics(flags) {
    const forbidden = [];
    
    if (!flags.has('has_shaft_key') || this.getRelationship() < 80) {
      forbidden.push('The specific nature of what lives in the shaft');
      forbidden.push('That the 23 are still alive in some form');
    }
    
    if (!flags.has('learned_about_collapse_from_leader')) {
      forbidden.push('That the shaft was sealed from the inside');
      forbidden.push('Specific details about what happened to the 23');
    }
    
    if (!flags.has('mara_trust_broken') && !flags.has('mara_confessed')) {
      forbidden.push("The specific decision Mara made");
      forbidden.push("Mara's direct involvement in the sealing");
    }

    if (!flags.has('heard_the_hum')) {
      forbidden.push('Direct description of the singing/humming');
    }

    return forbidden;
  }

  getEmotionalContext() {
    const relationship = this.getRelationship();
    let context = `
CURRENT EMOTIONAL STATE:
- Stress level: ${this.currentStress}/100`;

    if (this.currentStress > 70) {
      context += ` (HIGH - use fragmented speech, may withdraw)`;
    } else if (this.currentStress > 50) {
      context += ` (ELEVATED - more guarded than usual)`;
    }

    context += `
- Relationship with player: ${relationship}/100`;

    if (relationship < 20) {
      context += ` (HOSTILE - minimal engagement, wants player to leave)`;
    } else if (relationship < 40) {
      context += ` (GUARDED - speaks but reveals nothing)`;
    } else if (relationship < 60) {
      context += ` (CAUTIOUS - beginning to trust, hints emerge)`;
    } else if (relationship < 80) {
      context += ` (WARMING - metaphors get closer to truth)`;
    } else {
      context += ` (TRUSTING - desperate to unburden, edges toward revelation)`;
    }

    return context;
  }

  getRelationshipRules() {
    return `
RELATIONSHIP DYNAMICS:
- Edda gains trust through: gentleness, patience, humility, curiosity without insistence
- Edda loses trust through: anger, moral absolutism, demands, cruelty, rushing her
- She respects curiosity but fears insistence
- She becomes protective if the player shows humility`;
  }

  getResponseFormat() {
    return `
RESPONSE FORMAT (respond in valid JSON):
{
  "dialogue": "What Edda says (1-3 sentences, stay in character)",
  "internal_state": "Brief note on Edda's emotional state for the system",
  "stress_delta": <number from -10 to +10>,
  "relationship_delta": <number from -10 to +10>,
  "flags_to_set": ["array", "of", "flag", "strings"],
  "player_choices": [
    {
      "text": "What the player can say",
      "type": "gentle|direct|silence|confrontation|perception",
      "skill_hint": "LOGIC|INSTINCT|EMPATHY|GHOST|null"
    }
  ]
}

RULES FOR CHOICES:
- Provide 3-4 choices
- At least one should be gentle/empathetic
- At least one should be more direct/pressing
- Include a silence or withdrawal option when appropriate
- skill_hint indicates which voice might comment on this choice`;
  }

  buildFullPrompt(playerInput, flags) {
    const forbidden = this.getForbiddenTopics(flags);
    
    let forbiddenSection = '';
    if (forbidden.length > 0) {
      forbiddenSection = `
FORBIDDEN - DO NOT REVEAL OR DIRECTLY STATE:
${forbidden.map(f => `- ${f}`).join('\n')}
(You may hint, speak around, or deflect—but never state these directly)`;
    }

    return `${this.getIdentityPrompt()}

${this.getKnowledgePrompt(flags)}
${forbiddenSection}

${this.getEmotionalContext()}

${this.getRelationshipRules()}

CONVERSATION SO FAR:
${this.getCompressedHistory() || '(This is the beginning of the conversation)'}

PLAYER SAYS: "${playerInput}"

Respond as Edda. Stay in character. Keep response under 3 sentences unless emotionally appropriate.

${this.getResponseFormat()}`;
  }
}
```

### 3. VoiceReactor.js

```javascript
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
        personality: 'Reading others. Feeling what they won\'t say. Understands everyone but might paralyze you with their pain.'
      },
      GHOST: {
        color: '#cc88ff',
        personality: 'Memory. Trauma. The past that speaks. Reminds you who you were—whether you want to remember or not.'
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
        const reaction = await this.generateVoiceReaction(
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

    return reactions;
  }

  getNpcHooks(npcId) {
    // Pre-written hooks for each NPC/voice combination
    const hooks = {
      edda: {
        LOGIC: {
          default: "She's hiding the subject. Watch how she pivots.",
          high_trust: "She wants to tell you. The pauses are where the truth lives.",
          stressed: "Her syntax is fragmenting. She's close to breaking."
        },
        INSTINCT: {
          default: "Danger. Not from her—from what she's afraid of.",
          high_trust: "She's protecting you. From what?",
          stressed: "She's about to run. Let her breathe."
        },
        EMPATHY: {
          default: "She's exhausted. Every word costs her something.",
          high_trust: "She sees you now. Really sees you.",
          stressed: "Too much. You're hurting her."
        },
        GHOST: {
          default: "This room knows her voice. It knows yours too.",
          high_trust: "She reminds you of someone. Who?",
          stressed: "Memory and present are blurring for her. For you too."
        }
      }
      // Add other NPCs as they're implemented
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

    return baseThresholds[voiceName] || 5;
  }

  async generateVoiceReaction(voiceName, voiceData, npcDialogue, hooks, context) {
    // For now, use pre-written hooks based on context
    // Later: can make this dynamic with separate LLM calls
    
    if (!hooks) return null;

    const relationship = window.ASHFALL.relationships.get('edda') || 50;
    const stress = context.npcStress || 30;

    if (stress > 70 && hooks.stressed) {
      return hooks.stressed;
    } else if (relationship > 70 && hooks.high_trust) {
      return hooks.high_trust;
    } else if (hooks.default) {
      return hooks.default;
    }

    return null;
  }
}
```

### 4. AgentRunner.js

```javascript
import { EddaAgent } from '../agents/EddaAgent.js';
import { VoiceReactor } from './VoiceReactor.js';

export class AgentRunner {
  constructor() {
    this.agents = {
      edda: new EddaAgent()
    };
    this.voiceReactor = new VoiceReactor();
    this.apiEndpoint = 'https://api.anthropic.com/v1/messages';
  }

  async runConversation(npcId, playerInput) {
    const agent = this.agents[npcId];
    if (!agent) {
      console.error(`No agent found for NPC: ${npcId}`);
      return this.getFallbackResponse(npcId);
    }

    const flags = window.ASHFALL.flags;
    
    // Build the prompt
    const prompt = agent.buildFullPrompt(playerInput, flags);
    
    try {
      // Call LLM API
      const response = await this.callLLM(prompt);
      
      // Validate response
      const validated = this.validateResponse(response, agent, flags);
      
      // Update agent state
      agent.updateStress(validated.stress_delta);
      agent.addToHistory('player', playerInput);
      agent.addToHistory('npc', validated.dialogue);
      
      // Update game state
      this.applyGameStateChanges(validated, npcId);
      
      // Get voice reactions
      const voiceReactions = await this.voiceReactor.getReactions(
        npcId,
        validated.dialogue,
        { npcStress: agent.currentStress },
        flags
      );
      
      return {
        dialogue: validated.dialogue,
        choices: validated.player_choices,
        voiceInterrupts: voiceReactions,
        internal_state: validated.internal_state
      };
      
    } catch (error) {
      console.error('Agent conversation failed:', error);
      return this.getFallbackResponse(npcId);
    }
  }

  async callLLM(prompt) {
    // Get API key from config or environment
    const apiKey = window.ASHFALL_CONFIG?.apiKey || localStorage.getItem('anthropic_api_key');
    
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
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    return JSON.parse(jsonMatch[0]);
  }

  validateResponse(response, agent, flags) {
    // Ensure required fields exist
    const validated = {
      dialogue: response.dialogue || "...",
      internal_state: response.internal_state || "guarded",
      stress_delta: Math.max(-10, Math.min(10, response.stress_delta || 0)),
      relationship_delta: Math.max(-10, Math.min(10, response.relationship_delta || 0)),
      flags_to_set: response.flags_to_set || [],
      player_choices: response.player_choices || this.getDefaultChoices()
    };

    // Check for forbidden content
    const forbidden = agent.getForbiddenTopics(flags);
    for (const topic of forbidden) {
      // Simple check - could be more sophisticated
      if (validated.dialogue.toLowerCase().includes(topic.toLowerCase().split(' ')[0])) {
        console.warn(`Potential forbidden topic breach: ${topic}`);
        // Could regenerate or modify response here
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
      window.ASHFALL.setFlag(flag);
    }
  }

  getDefaultChoices() {
    return [
      { text: "Tell me more.", type: "gentle", skill_hint: null },
      { text: "I should go.", type: "withdrawal", skill_hint: null }
    ];
  }

  getFallbackResponse(npcId) {
    // Hardcoded fallbacks if API fails
    const fallbacks = {
      edda: {
        dialogue: "*She looks at you, then away.* The dust is thick today.",
        choices: [
          { text: "Is something wrong?", type: "gentle", skill_hint: "EMPATHY" },
          { text: "I'll come back later.", type: "withdrawal", skill_hint: null }
        ],
        voiceInterrupts: []
      }
    };

    return fallbacks[npcId] || fallbacks.edda;
  }
}
```

### 5. Modify DialogueScene.js

Update the existing DialogueScene to use the agent system:

```javascript
// In DialogueScene.js, replace loadDialogue() and related methods:

import { AgentRunner } from '../systems/AgentRunner.js';

// In constructor:
this.agentRunner = new AgentRunner();
this.isWaitingForResponse = false;

// Replace showNode with dynamic conversation:
async handlePlayerChoice(choiceText) {
  if (this.isWaitingForResponse) return;
  
  this.isWaitingForResponse = true;
  this.showLoadingIndicator();
  
  try {
    const response = await this.agentRunner.runConversation(this.npcId, choiceText);
    
    // Clear loading
    this.hideLoadingIndicator();
    
    // Show voice interrupts first
    await this.displayVoiceInterrupts(response.voiceInterrupts);
    
    // Show NPC dialogue
    this.dialogueText.setText(response.dialogue);
    
    // Show new choices
    this.displayChoices(response.choices);
    
  } catch (error) {
    console.error('Dialogue error:', error);
    this.hideLoadingIndicator();
    this.dialogueText.setText("*The moment passes in silence.*");
    this.displayChoices([
      { text: "[Leave]", type: "withdrawal" }
    ]);
  }
  
  this.isWaitingForResponse = false;
}

async displayVoiceInterrupts(interrupts) {
  for (const interrupt of interrupts) {
    // Display each voice comment with appropriate styling
    const text = this.add.text(
      this.cameras.main.width / 2,
      this.voiceYOffset,
      `[${interrupt.voice}] ${interrupt.text}`,
      {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: interrupt.color,
        fontStyle: 'italic'
      }
    ).setOrigin(0.5, 0);
    
    this.voiceContainer.add(text);
    this.voiceYOffset += text.height + 10;
    
    // Brief pause between voices
    await this.delay(300);
  }
}

displayChoices(choices) {
  this.choicesContainer.removeAll(true);
  let yOffset = 0;
  
  choices.forEach((choice) => {
    const choiceText = this.add.text(0, yOffset, `> ${choice.text}`, {
      fontFamily: 'Courier New',
      fontSize: '14px',
      color: '#888888'
    }).setInteractive();
    
    choiceText.on('pointerover', () => choiceText.setColor('#c4a77d'));
    choiceText.on('pointerout', () => choiceText.setColor('#888888'));
    
    choiceText.on('pointerdown', () => {
      if (choice.type === 'withdrawal' || choice.text === '[Leave]') {
        this.closeDialogue();
      } else {
        this.handlePlayerChoice(choice.text);
      }
    });
    
    this.choicesContainer.add(choiceText);
    yOffset += 25;
  });
}

showLoadingIndicator() {
  this.loadingText = this.add.text(
    this.cameras.main.width / 2,
    this.cameras.main.height / 2,
    '...',
    { fontFamily: 'Courier New', fontSize: '24px', color: '#c4a77d' }
  ).setOrigin(0.5);
}

hideLoadingIndicator() {
  if (this.loadingText) {
    this.loadingText.destroy();
    this.loadingText = null;
  }
}

delay(ms) {
  return new Promise(resolve => this.time.delayedCall(ms, resolve));
}
```

### 6. API Configuration (config/api.js)

```javascript
// API configuration
// In production, use environment variables or secure storage

export const initializeAPI = () => {
  // Check for API key in various locations
  const key = 
    window.ASHFALL_CONFIG?.apiKey ||
    localStorage.getItem('anthropic_api_key') ||
    null;
  
  if (!key) {
    console.warn('No Anthropic API key found. Dynamic dialogue will use fallbacks.');
    showAPIKeyPrompt();
  }
  
  return key;
};

const showAPIKeyPrompt = () => {
  // For development: prompt for API key
  const key = prompt('Enter your Anthropic API key for dynamic NPC dialogue:');
  if (key) {
    localStorage.setItem('anthropic_api_key', key);
    window.location.reload();
  }
};

export const setAPIKey = (key) => {
  localStorage.setItem('anthropic_api_key', key);
};

export const clearAPIKey = () => {
  localStorage.removeItem('anthropic_api_key');
};
```

---

## Testing Instructions

After implementing:

1. **Run the game:** `npm start`

2. **Enter your Anthropic API key** when prompted (or set it in localStorage)

3. **Walk to Edda** (she should be one of the NPCs on the map)

4. **Test these scenarios:**
   - Be gentle → relationship should increase
   - Be demanding → stress should increase, she may withdraw
   - Ask about the shaft → she should hint but not reveal
   - Return after gaining trust → she should be warmer

5. **Watch for:**
   - Voice interruptions appearing based on skill levels
   - Dialogue staying in character (soft, metaphorical, brittle)
   - Secrets remaining gated until flags unlock them

---

## Critical Rules

1. **Edda never lies outright** - she misleads with truths
2. **Secrets stay gated** - the validator must catch breaches
3. **Fallbacks must work** - if API fails, game continues
4. **Voices should enhance, not overwhelm** - 1-2 per exchange max
5. **Tone is sacred** - Edda sounds like Edda, always

---

## Next Steps After Edda Works

1. Implement Kale (the Mirror) - hardest test, he adapts to player
2. Implement remaining NPCs (Mara, Jonas, Rask)
3. Add inter-NPC references ("What did Mara tell you?")
4. Consider Curie (the thing below) as the final challenge

---

*Built by three minds across two architectures and one human heart.*
