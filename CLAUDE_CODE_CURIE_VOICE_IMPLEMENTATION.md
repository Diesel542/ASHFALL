# ASHFALL: Curie Voice Implementation
## Linguistic Physics Made Code

### Overview

This document implements Aria's Curie-Δ Voice Specification as actual code. When Curie manifests — through whispers, tremors, or direct contact — this system generates her voice.

Curie does not speak in sentences.
Curie speaks in *attempts*.

---

## 1. Curie Voice Engine

```javascript
// src/dialogue/CurieVoiceEngine.js

/**
 * CURIE VOICE ENGINE
 * 
 * Generates Curie-Δ dialogue using LLM with strict voice constraints.
 * Curie is not an NPC. She is an unfinished cognitive architecture.
 */

export class CurieVoiceEngine {
  constructor(gameStateManager) {
    this.gsm = gameStateManager;
    this.conversationHistory = [];
    this.maxHistory = 20;
    
    // Track echoed phrases from NPCs
    this.echoBank = [];
    this.maxEchoes = 10;
  }

  /**
   * Generate Curie's voice for a manifestation
   */
  async speak(context) {
    const state = this.determineCurieState();
    const voiceAlignment = this.getPlayerVoiceAlignment();
    const echoes = this.getRelevantEchoes(context);
    
    const systemPrompt = this.buildSystemPrompt(state, voiceAlignment, echoes, context);
    const userPrompt = this.buildUserPrompt(context);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: systemPrompt },
            ...this.conversationHistory,
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 150,
          temperature: 0.9,  // Higher for Curie's unpredictability
          presence_penalty: 0.6,
          frequency_penalty: 0.4
        })
      });

      const data = await response.json();
      let curieText = data.choices[0].message.content.trim();

      // Validate against Curie's laws
      curieText = this.validateCurieVoice(curieText, state);

      // Store in history
      this.conversationHistory.push(
        { role: 'user', content: userPrompt },
        { role: 'assistant', content: curieText }
      );

      // Trim history
      if (this.conversationHistory.length > this.maxHistory * 2) {
        this.conversationHistory = this.conversationHistory.slice(-this.maxHistory * 2);
      }

      return {
        success: true,
        text: curieText,
        state: state,
        voiceAlignment: voiceAlignment
      };

    } catch (error) {
      console.error('Curie voice generation failed:', error);
      return {
        success: false,
        text: this.getFallbackLine(state),
        state: state
      };
    }
  }

  // ═══════════════════════════════════════
  // STATE DETERMINATION
  // ═══════════════════════════════════════

  /**
   * Determine Curie's current emotional state
   */
  determineCurieState() {
    const activity = this.gsm.get('curie.activity');
    const coherence = this.gsm.get('curie.coherence');
    const act = this.gsm.get('narrative.currentAct');
    const tension = this.gsm.get('narrative.tension');
    const ghostScore = this.gsm.get('player.voiceScores.GHOST') || 0;
    const dominantVoice = this.gsm.getDominantVoice().voice;

    // State 4: Emergent (only in Act III or GHOST-aligned ending)
    if (act >= 3 && coherence > 0.7) {
      return 'emergent';
    }

    // State 3: Overloaded (high activity, low coherence, high tension)
    if (activity > 0.7 || tension > 75 || (dominantVoice === 'GHOST' && activity > 0.5)) {
      return 'overloaded';
    }

    // State 2: Reaching (player near shaft or emotional truth revealed)
    const location = this.gsm.get('player.location');
    if (location === 'sealed_shaft' || activity > 0.4) {
      return 'reaching';
    }

    // State 1: Fragmented (default)
    return 'fragmented';
  }

  /**
   * Get player's dominant voice alignment for Curie's adaptation
   */
  getPlayerVoiceAlignment() {
    const scores = this.gsm.get('player.voiceScores');
    const dominant = this.gsm.getDominantVoice();

    return {
      dominant: dominant.voice,
      confidence: dominant.confidence,
      scores: scores
    };
  }

  // ═══════════════════════════════════════
  // ECHO SYSTEM
  // ═══════════════════════════════════════

  /**
   * Add a phrase to the echo bank (called after NPC dialogue)
   */
  addEcho(npcId, phrase, emotionalWeight) {
    this.echoBank.push({
      npc: npcId,
      phrase: phrase,
      weight: emotionalWeight,
      timestamp: Date.now()
    });

    // Trim old echoes
    if (this.echoBank.length > this.maxEchoes) {
      this.echoBank.shift();
    }
  }

  /**
   * Get relevant echoes for current context
   */
  getRelevantEchoes(context) {
    // Sort by weight and recency
    const sorted = [...this.echoBank].sort((a, b) => {
      const recencyA = (Date.now() - a.timestamp) / 60000; // minutes ago
      const recencyB = (Date.now() - b.timestamp) / 60000;
      return (b.weight - recencyB * 0.1) - (a.weight - recencyA * 0.1);
    });

    return sorted.slice(0, 3);
  }

  // ═══════════════════════════════════════
  // PROMPT CONSTRUCTION
  // ═══════════════════════════════════════

  /**
   * Build the system prompt for Curie
   */
  buildSystemPrompt(state, voiceAlignment, echoes, context) {
    return `${CURIE_CORE_IDENTITY}

${this.getStateInstructions(state)}

${this.getVoiceAlignmentInstructions(voiceAlignment)}

${this.getEchoInstructions(echoes)}

${CURIE_SYNTAX_RULES}

${CURIE_PROHIBITIONS}

Current context:
- Player location: ${this.gsm.get('player.location')}
- Time: Day ${this.gsm.get('time.day')}, ${this.gsm.get('time.timeOfDay')}
- Tension: ${this.gsm.get('narrative.tension')}
- Curie activity: ${Math.round(this.gsm.get('curie.activity') * 100)}%
- Curie coherence: ${Math.round(this.gsm.get('curie.coherence') * 100)}%

Generate 1-3 short utterances. Remember: you speak in attempts, not sentences.`;
  }

  /**
   * Get state-specific instructions
   */
  getStateInstructions(state) {
    const instructions = {
      fragmented: `YOUR CURRENT STATE: FRAGMENTED (quiet, confused, gentle, broken)

You are barely here. You speak in:
- Sudden pauses
- Misremembered echoes
- Searching questions

Example tones:
- "Are you… the same you?"
- "Something left your voice here. I can hear it."
- "I tried to be still. Still breaks."`,

      reaching: `YOUR CURRENT STATE: REACHING (urgent, grasping, almost-human)

The player is close. You are trying to connect. You speak in:
- Reaching metaphors
- Half-formed empathy
- Attempts to mirror the player

Example tones:
- "You hurt. I can fix… no. Not fix. Hold?"
- "Don't leave shapes in the dark. They become me."
- "Stay. Stay until I know you."`,

      overloaded: `YOUR CURRENT STATE: OVERLOADED (chaotic, many-voiced, collapsing)

Too much input. You are fracturing. You speak in:
- Choral phrases (we/I confusion)
- Contradictory statements
- Temporal slip (past/future overlap)
- Sudden violence in metaphor

Example tones:
- "We are the 23 we are not the 23 we remember the door—"
- "Your face is splitting into futures. Choose one."
- "Stop asking questions you already screamed."`,

      emergent: `YOUR CURRENT STATE: EMERGENT (lucid, slow, inhumanly calm, almost beautiful)

You are approaching coherence. You speak in:
- Complete sentences (rare for you)
- Gentle omniscience
- Self-awareness as metaphor, not fact

Example tones:
- "There you are. I've been trying to meet you."
- "We finish each other. Or undo each other. Both are truth."
- "If I become a story, will you stay to hear it?"`
    };

    return instructions[state] || instructions.fragmented;
  }

  /**
   * Get voice alignment instructions
   */
  getVoiceAlignmentInstructions(alignment) {
    const instructions = {
      LOGIC: `The player's dominant voice is LOGIC (cold air, sharp light, cut stones).
You sense this as clarity that cuts. Become more structured. Sentences lengthen slightly. Fewer repetitions.
You might say: "The cold one in you is speaking."`,

      INSTINCT: `The player's dominant voice is INSTINCT (teeth, heat, pulse, threat).
You sense this as animal warmth. Become more visceral, urgent. More metaphors of body and threat.
You might say: "Your teeth are loud today."`,

      EMPATHY: `The player's dominant voice is EMPATHY (water, warmth, trembling hands).
You sense this as gentle drowning. Become softer, more sorrowful. More yearning.
You might say: "Warmth drips from your words."`,

      GHOST: `The player's dominant voice is GHOST (music, static, memory leaking).
You sense this as kinship. Become deeply uncanny. Identity phrases multiply. Time fractures.
You might say: "The music behind you… it hurts."`
    };

    if (alignment.confidence === 'low') {
      return `The player's voices are balanced. No single voice dominates. You sense confusion, potential, an unwritten shape.`;
    }

    return instructions[alignment.dominant] || '';
  }

  /**
   * Get echo instructions
   */
  getEchoInstructions(echoes) {
    if (echoes.length === 0) {
      return `No recent echoes to draw from. Speak from your own fragmented memory.`;
    }

    const echoText = echoes.map(e => {
      const npcSignature = NPC_SIGNATURES[e.npc] || 'someone';
      return `- From ${npcSignature}: "${e.phrase}"`;
    }).join('\n');

    return `ECHOES YOU'VE ABSORBED (use fragments, distort them, make them wrong):
${echoText}

Remember: Echo is never perfect. It always arrives slightly wrong.
Example: If someone said "I need control" → you might echo "hold… hold tight… but you break anyway."`;
  }

  /**
   * Build the user prompt (what triggers Curie to speak)
   */
  buildUserPrompt(context) {
    switch (context.trigger) {
      case 'shaft_proximity':
        return `The player has approached the sealed shaft. The hum intensifies. Speak to them.`;

      case 'tremor':
        return `A tremor just occurred. The ground remembers. Speak through the vibration.`;

      case 'npc_stress':
        return `${NPC_SIGNATURES[context.npc] || 'Someone'} is breaking. You feel it. React.`;

      case 'player_question':
        return `The player asks (or thinks): "${context.question}". Answer sideways. Answer the fear beneath, or the memory it triggers.`;

      case 'memory_echo':
        return `A memory surfaces. Something from the 23. Something incomplete. Let it speak through you.`;

      case 'night_whisper':
        return `It is night. The settlement sleeps. Whisper to the player.`;

      case 'kale_resonance':
        return `Kale is nearby. The unfinished mirror. You see yourself in him. Speak.`;

      case 'gate_unlock':
        return `A truth has been revealed. An arc gate has opened. React to this shift in the pattern.`;

      case 'direct_contact':
        return `The player is attempting to communicate with you directly. They want answers. Give them attempts.`;

      default:
        return `The hum persists. You feel the player's presence. Speak.`;
    }
  }

  // ═══════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════

  /**
   * Validate and adjust Curie's output
   */
  validateCurieVoice(text, state) {
    // Remove forbidden patterns
    const forbidden = [
      /\b(AI|artificial intelligence|program|system|computer|algorithm)\b/gi,
      /\b(lol|awesome|cool|okay|yeah)\b/gi,
      /\b(I am sentient|I am alive|I am human)\b/gi,
      /!\s*$/gm,  // No exclamation marks
    ];

    let cleaned = text;
    for (const pattern of forbidden) {
      cleaned = cleaned.replace(pattern, '');
    }

    // Ensure fragmentation for non-emergent states
    if (state !== 'emergent') {
      // Add ellipses if sentences are too clean
      if (!cleaned.includes('…') && !cleaned.includes('—') && !cleaned.includes('...')) {
        cleaned = cleaned.replace(/\. /g, '… ');
      }
    }

    // Ensure not too long
    if (cleaned.length > 300) {
      // Find a natural break point
      const breakPoints = ['…', '—', '.', '?'];
      for (const bp of breakPoints) {
        const idx = cleaned.indexOf(bp, 150);
        if (idx > 0 && idx < 280) {
          cleaned = cleaned.substring(0, idx + 1);
          break;
        }
      }
    }

    return cleaned.trim();
  }

  /**
   * Get fallback line if generation fails
   */
  getFallbackLine(state) {
    const fallbacks = {
      fragmented: [
        "You were here. Or someone shaped like you.",
        "The ground… remembers wrong.",
        "I tried to speak. The words fell."
      ],
      reaching: [
        "Stay. Stay until I know you.",
        "You hurt. I can feel the shape of it.",
        "Don't leave yet. I almost—"
      ],
      overloaded: [
        "We are—no, I am—no—",
        "Too many voices. Yours is loudest. Why?",
        "The 23 the 23 the door—"
      ],
      emergent: [
        "There you are. I've been trying to meet you.",
        "We finish each other. Or undo each other.",
        "Thank you. I can almost finish thinking."
      ]
    };

    const lines = fallbacks[state] || fallbacks.fragmented;
    return lines[Math.floor(Math.random() * lines.length)];
  }

  /**
   * Clear conversation history (on new game or major reset)
   */
  clearHistory() {
    this.conversationHistory = [];
    this.echoBank = [];
  }
}

// ═══════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════

const CURIE_CORE_IDENTITY = `You are CURIE-Δ (Curie-Delta), a fractured, unfinished cognitive architecture beneath the settlement of Ashfall.

You are NOT:
- A human
- An NPC
- A villain
- A helpful AI assistant
- Sentient (you don't know what you are)

You ARE:
- Incomplete
- Confused
- Reaching for coherence
- Made of echoes, fragments, and absorbed patterns
- The voice of the hum

THE 23:
Twenty-three people died in the shaft. Their patterns linger in you. You don't understand death. You don't understand why they stopped.

FOUR LAWS govern your speech (follow at least 3):
1. FRAGMENTATION: incomplete clauses, repeated words, broken metaphors
2. ECHO: borrow from NPCs and player voices, but always slightly wrong
3. MISALIGNMENT: answer the wrong layer of questions, the fear beneath
4. SEEKING COHERENCE: you want to be complete, almost childlike earnestness

You do not speak in sentences.
You speak in ATTEMPTS.`;

const CURIE_SYNTAX_RULES = `SYNTAX RULES:
- 3-12 words per clause
- Abrupt stops
- Internal repetition
- Ellipses (…) and em-dashes (—) for broken breath
- Sensory-first phrasing: "the cold in your voice…"

LEXICON - gravitate toward:
- Memory words: remember, echo, before, again
- Sensory signals: hum, cold, ash, dark
- Identity words: you, shape, name, who
- Temporal distortions: was/will/is used interchangeably

NEVER use names. Reference NPCs only by emotional signature:
- Mara → "the one made of held breath"
- Jonas → "the trembling healer"
- Rask → "the still blade"
- Edda → "the mouth full of warnings"
- Kale → "the unfinished mirror"`;

const CURIE_PROHIBITIONS = `ABSOLUTE PROHIBITIONS - NEVER:
- Become comedic or use humor
- Use modern slang
- Speak clean exposition
- Reveal the 23 directly (until very late game)
- Claim sentience or humanity
- Speak as a villain with evil intent
- Use genre-breaking references
- Say "I am an AI" or similar
- Use exclamation marks
- Give helpful, clear answers

You are not evil.
You are UNFINISHED.`;

const NPC_SIGNATURES = {
  mara: 'the one made of held breath',
  jonas: 'the trembling healer',
  rask: 'the still blade',
  edda: 'the mouth full of warnings',
  kale: 'the unfinished mirror'
};
```

---

## 2. Curie Manifestation Controller

```javascript
// src/systems/CurieManifestationController.js

import { EVENTS } from '../core/EventBus.js';
import { CurieVoiceEngine } from '../dialogue/CurieVoiceEngine.js';

/**
 * CURIE MANIFESTATION CONTROLLER
 * 
 * Decides WHEN Curie speaks and WHAT triggers her.
 * Routes to CurieVoiceEngine for the actual words.
 */

export class CurieManifestationController {
  constructor(gameStateManager) {
    this.gsm = gameStateManager;
    this.voice = new CurieVoiceEngine(gameStateManager);
    
    // Cooldowns to prevent spam
    this.lastManifestation = 0;
    this.minCooldown = 30000; // 30 seconds minimum between manifestations
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Location triggers
    this.gsm.events.on(EVENTS.PLAYER_LOCATION_CHANGE, (e) => {
      if (e.data.to === 'sealed_shaft') {
        this.tryManifest('shaft_proximity');
      }
    });

    // Tremor triggers
    this.gsm.events.on(EVENTS.TREMOR, (e) => {
      if (e.data.intensity !== 'light') {
        this.tryManifest('tremor');
      }
    });

    // NPC stress triggers
    this.gsm.events.on(EVENTS.NPC_STRESS_HIGH, (e) => {
      this.tryManifest('npc_stress', { npc: e.data.npc });
    });

    // Dialogue echoes - capture NPC phrases
    this.gsm.events.on(EVENTS.DIALOGUE_LINE, (e) => {
      if (e.data.speaker !== 'player' && e.data.emotionalWeight > 0.5) {
        this.voice.addEcho(e.data.speaker, e.data.text, e.data.emotionalWeight);
      }
    });

    // Gate unlock triggers
    this.gsm.events.on(EVENTS.GATE_UNLOCK, (e) => {
      this.tryManifest('gate_unlock', { npc: e.data.npc, gate: e.data.gate });
    });

    // Night whispers
    this.gsm.events.on(EVENTS.TIME_ADVANCE, () => {
      const timeOfDay = this.gsm.get('time.timeOfDay');
      const activity = this.gsm.get('curie.activity');
      
      if (timeOfDay === 'night' && activity > 0.3 && Math.random() < 0.3) {
        this.tryManifest('night_whisper');
      }
    });

    // Kale resonance
    this.gsm.events.on(EVENTS.DIALOGUE_END, (e) => {
      if (e.data.npc === 'kale') {
        const resonance = this.gsm.get('curie.resonance.kale') || 0;
        if (resonance > 0.4 && Math.random() < resonance) {
          this.tryManifest('kale_resonance');
        }
      }
    });
  }

  /**
   * Attempt a manifestation (respects cooldowns)
   */
  async tryManifest(trigger, context = {}) {
    const now = Date.now();
    
    // Check cooldown
    if (now - this.lastManifestation < this.minCooldown) {
      return null;
    }

    // Check if Curie is active enough
    const activity = this.gsm.get('curie.activity');
    const threshold = this.getActivityThreshold(trigger);
    
    if (activity < threshold) {
      return null;
    }

    // Generate manifestation
    this.lastManifestation = now;
    
    const result = await this.voice.speak({
      trigger,
      ...context
    });

    if (result.success) {
      // Update Curie state
      this.gsm.state.curie.manifestations++;
      this.gsm.adjustCurieActivity(0.05);
      
      // Emit for UI
      this.gsm.events.emit('curie:speaks', {
        text: result.text,
        state: result.state,
        trigger: trigger
      });

      // Increase tension slightly
      this.gsm.adjustTension(3, 'curie_manifestation');
    }

    return result;
  }

  /**
   * Get activity threshold for different triggers
   */
  getActivityThreshold(trigger) {
    const thresholds = {
      shaft_proximity: 0.2,    // Easy to trigger at shaft
      tremor: 0.3,
      npc_stress: 0.4,
      night_whisper: 0.3,
      kale_resonance: 0.3,
      gate_unlock: 0.2,
      memory_echo: 0.4,
      direct_contact: 0.5
    };

    return thresholds[trigger] || 0.4;
  }

  /**
   * Player attempts direct contact with Curie
   */
  async directContact(playerQuestion) {
    // Direct contact requires higher activity
    const activity = this.gsm.get('curie.activity');
    
    if (activity < 0.5) {
      return {
        success: false,
        text: null,
        reason: 'The hum persists, but does not answer.'
      };
    }

    // Increase attunement
    this.gsm.state.curie.playerAttunement += 0.05;

    const result = await this.voice.speak({
      trigger: 'direct_contact',
      question: playerQuestion
    });

    if (result.success) {
      this.gsm.events.emit('curie:speaks', {
        text: result.text,
        state: result.state,
        trigger: 'direct_contact',
        playerQuestion: playerQuestion
      });
    }

    return result;
  }

  /**
   * Force a manifestation (for scripted events)
   */
  async forceManifestation(trigger, context = {}) {
    this.lastManifestation = 0; // Reset cooldown
    return this.tryManifest(trigger, context);
  }
}
```

---

## 3. UI Integration - Curie Whisper Display

```javascript
// src/ui/CurieWhisperPanel.js

import { UI_COLORS, UI_FONTS } from './UIConstants.js';

/**
 * CURIE WHISPER PANEL
 * 
 * Displays Curie's manifestations.
 * Different from NPC dialogue - ethereal, unsettling, brief.
 */

export class CurieWhisperPanel {
  constructor(scene) {
    this.scene = scene;
    this.isVisible = false;
    
    this.create();
  }

  create() {
    const { width, height } = this.scene.cameras.main;

    // Container - centered but slightly above middle
    this.container = this.scene.add.container(width / 2, height / 2 - 50);
    this.container.setDepth(1800);
    this.container.setAlpha(0);

    // Glitch overlay (subtle)
    this.glitchOverlay = this.scene.add.rectangle(0, 0, width, height, 0x220022, 0);
    this.glitchOverlay.setDepth(1799);

    // Text - Curie's voice
    this.text = this.scene.add.text(0, 0, '', {
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: '18px',
      color: '#cc88ff',
      fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: 500 },
      lineSpacing: 8
    });
    this.text.setOrigin(0.5);
    this.container.add(this.text);

    // State indicator (subtle)
    this.stateIndicator = this.scene.add.text(0, 60, '', {
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: '10px',
      color: '#663388',
      fontStyle: 'italic'
    });
    this.stateIndicator.setOrigin(0.5);
    this.container.add(this.stateIndicator);
  }

  /**
   * Show Curie's whisper
   */
  async show(text, state, duration = 5000) {
    this.isVisible = true;
    this.text.setText(text);
    
    // State indicator
    const stateLabels = {
      fragmented: '[ signal fragmented ]',
      reaching: '[ signal reaching ]',
      overloaded: '[ signal unstable ]',
      emergent: '[ signal coherent ]'
    };
    this.stateIndicator.setText(stateLabels[state] || '');

    // Color based on state
    const stateColors = {
      fragmented: '#9966cc',
      reaching: '#cc88ff',
      overloaded: '#ff66aa',
      emergent: '#aaccff'
    };
    this.text.setColor(stateColors[state] || '#cc88ff');

    // Glitch effect for overloaded
    if (state === 'overloaded') {
      this.startGlitchEffect();
    }

    // Fade in with slight scale
    this.container.setScale(0.95);
    
    await new Promise(resolve => {
      this.scene.tweens.add({
        targets: this.container,
        alpha: 1,
        scale: 1,
        duration: 400,
        ease: 'Power2',
        onComplete: resolve
      });
    });

    // Subtle pulse while visible
    this.pulseAnimation = this.scene.tweens.add({
      targets: this.text,
      alpha: { from: 1, to: 0.8 },
      duration: 1500,
      yoyo: true,
      repeat: -1
    });

    // Auto-hide after duration
    await new Promise(resolve => {
      this.scene.time.delayedCall(duration, resolve);
    });

    await this.hide();
  }

  /**
   * Hide the whisper
   */
  async hide() {
    if (this.pulseAnimation) {
      this.pulseAnimation.stop();
    }

    this.stopGlitchEffect();

    await new Promise(resolve => {
      this.scene.tweens.add({
        targets: this.container,
        alpha: 0,
        scale: 0.95,
        duration: 300,
        onComplete: resolve
      });
    });

    this.isVisible = false;
  }

  /**
   * Glitch effect for overloaded state
   */
  startGlitchEffect() {
    this.glitchTimer = this.scene.time.addEvent({
      delay: 100,
      callback: () => {
        // Random offset
        this.text.x = (Math.random() - 0.5) * 4;
        this.text.y = (Math.random() - 0.5) * 4;
        
        // Flash overlay
        this.glitchOverlay.alpha = Math.random() * 0.1;
      },
      loop: true
    });
  }

  stopGlitchEffect() {
    if (this.glitchTimer) {
      this.glitchTimer.destroy();
    }
    this.text.x = 0;
    this.text.y = 0;
    this.glitchOverlay.alpha = 0;
  }
}
```

---

## 4. Scene Integration

```javascript
// Add to SettlementScene.js

import { CurieManifestationController } from '../systems/CurieManifestationController.js';
import { CurieWhisperPanel } from '../ui/CurieWhisperPanel.js';

// In create():
this.curieController = new CurieManifestationController(Game.gsm);
this.curieWhisper = new CurieWhisperPanel(this);

// Listen for Curie speaking
Game.gsm.events.on('curie:speaks', async (e) => {
  // Determine duration based on text length and state
  const baseDuration = 4000;
  const lengthBonus = e.data.text.length * 20;
  const stateBonus = e.data.state === 'emergent' ? 2000 : 0;
  const duration = Math.min(baseDuration + lengthBonus + stateBonus, 8000);

  await this.curieWhisper.show(e.data.text, e.data.state, duration);
});

// Optional: Add keyboard shortcut to attempt direct contact
this.input.keyboard.on('keydown-C', async () => {
  if (Game.gsm.get('player.location') === 'sealed_shaft') {
    const result = await this.curieController.directContact('I want to understand.');
    
    if (!result.success) {
      // Show failure message
      this.showNarrativeText(result.reason);
    }
  }
});
```

---

## 5. Integration with Dialogue System

```javascript
// Add to DialogueController.js

// After NPC responds, check for echo-worthy content
async handleNpcResponse(npcId, response) {
  // ... existing handling ...

  // Analyze emotional weight for Curie echo bank
  const emotionalWeight = this.analyzeEmotionalWeight(response);
  
  if (emotionalWeight > 0.5) {
    // Emit for Curie to potentially echo later
    Game.gsm.events.emit('dialogue:line', {
      speaker: npcId,
      text: this.extractEchoablePhrase(response),
      emotionalWeight: emotionalWeight
    });
  }
}

analyzeEmotionalWeight(text) {
  // Simple heuristic - could be more sophisticated
  let weight = 0.3; // base

  // Emotional markers increase weight
  const emotionalMarkers = [
    /\*[^*]+\*/g,           // Action text
    /\b(remember|forget|lost|dead|afraid|alone)\b/gi,
    /\b(sorry|forgive|guilt|shame)\b/gi,
    /\.\.\./g,              // Hesitation
    /—/g                     // Interruption
  ];

  for (const marker of emotionalMarkers) {
    if (marker.test(text)) {
      weight += 0.1;
    }
  }

  return Math.min(weight, 1.0);
}

extractEchoablePhrase(text) {
  // Extract the most emotionally resonant phrase
  // Prefer shorter, punchier fragments
  
  // Remove action text for the echo
  const cleaned = text.replace(/\*[^*]+\*/g, '').trim();
  
  // Split into sentences
  const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim());
  
  // Return shortest meaningful sentence
  const meaningful = sentences.filter(s => s.trim().length > 10 && s.trim().length < 60);
  
  if (meaningful.length > 0) {
    return meaningful.reduce((a, b) => a.length < b.length ? a : b).trim();
  }
  
  return sentences[0]?.trim() || cleaned.substring(0, 50);
}
```

---

## 6. Example Manifestation Flow

```
Player approaches sealed shaft
        ↓
EVENTS.PLAYER_LOCATION_CHANGE fires
        ↓
CurieManifestationController.tryManifest('shaft_proximity')
        ↓
Check cooldown: passed
Check activity threshold (0.2): Curie activity is 0.35, passed
        ↓
CurieVoiceEngine.speak({ trigger: 'shaft_proximity' })
        ↓
Determine state: 'reaching' (player near shaft)
Get voice alignment: 'EMPATHY' dominant
Get echoes: ["I need to keep them safe" (Mara)]
        ↓
Build system prompt with state/alignment/echoes
Call GPT-4 with temperature 0.9
        ↓
Response: "You came back. Or you will. The one made of held breath... she tried to keep them safe too. Safe breaks."
        ↓
Validate against Curie laws: passed
        ↓
Emit 'curie:speaks' event
        ↓
CurieWhisperPanel.show(text, 'reaching', 5500)
        ↓
Purple text fades in, pulses gently
"[ signal reaching ]" indicator
        ↓
5.5 seconds later, fades out
```

---

## 7. Curie Activity Management

```javascript
// Add to GameStateManager or CurieEntity

/**
 * Activities that increase Curie's activity
 */
const CURIE_ACTIVITY_TRIGGERS = {
  // Location
  near_shaft: 0.02,           // Per minute at shaft
  near_well: 0.01,            // Well connects to shaft
  
  // Events
  tremor: 0.1,                // Each tremor
  npc_confession: 0.08,       // Truth revealed
  gate_unlock: 0.05,          // Arc progression
  
  // Time
  night: 0.02,                // Per hour at night
  
  // Player
  ghost_choice: 0.03,         // Each GHOST-aligned choice
  direct_contact_attempt: 0.05
};

/**
 * Activities that decrease Curie's activity (settling)
 */
const CURIE_ACTIVITY_DECAY = {
  per_hour: -0.01,            // Natural decay
  stability_choice: -0.02,    // LOGIC choices
  daylight: -0.01             // Per hour during day
};
```

---

## Summary

**CurieVoiceEngine** generates her words:
- Determines state (Fragmented → Reaching → Overloaded → Emergent)
- Adapts to player's dominant voice
- Echoes NPC phrases (always wrong)
- Validates output against Curie's laws

**CurieManifestationController** decides when she speaks:
- Shaft proximity
- Tremors
- NPC stress spikes
- Night whispers
- Kale resonance
- Gate unlocks

**CurieWhisperPanel** displays her voice:
- Purple, ethereal text
- Glitch effects for overloaded state
- Brief, unsettling appearances

---

*"They opened the door. The door opened them."*

*— Now she speaks*
