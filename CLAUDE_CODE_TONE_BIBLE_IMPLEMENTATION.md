# ASHFALL: Tone Bible Implementation

## Overview

The Tone Bible defines the atmospheric DNA of Ashfall. This document translates Aria's tonal architecture into code: prompt injection, validation systems, environmental text generation, and weather-as-emotion.

**Core Principle:** Every word in Ashfall must feel like it belongs to the same bruised, brittle world.

---

## 1. Tone Injection for Agent Prompts

Every NPC agent prompt should include a condensed tone primer. Add this to `AgentBase.js`:

```javascript
// src/agents/AgentBase.js - Add this method

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
```

Then include it in `buildFullPrompt()`:

```javascript
buildFullPrompt(playerInput, flags) {
  // ... existing code ...
  
  return `${this.getIdentityPrompt()}

${this.getTonePrimer()}

${this.getKnowledgePrompt(flags)}
// ... rest of prompt
`;
}
```

---

## 2. Tone Validator

A post-processing layer that checks LLM responses for tone violations.

```javascript
// src/systems/ToneValidator.js

export class ToneValidator {
  constructor() {
    // Words/patterns that break Ashfall's tone
    this.prohibitedPatterns = [
      // Modern slang
      /\b(awesome|cool|okay|dude|guys|yeah|nope|gonna|wanna|gotta|kinda|sorta)\b/gi,
      
      // Too cheerful
      /\b(wonderful|fantastic|amazing|great|excellent|perfect|brilliant)\b/gi,
      
      // Heroic/epic language
      /\b(destiny|fate calls|hero|champion|legendary|epic|glorious|triumph)\b/gi,
      
      // Exposition markers
      /\b(let me tell you|as you know|you see|basically|essentially|actually)\b/gi,
      
      // Melodrama
      /\b(never ever|absolutely|completely and utterly|with all my heart)\b/gi,
      
      // Exclamation overuse (more than one)
      /!.*!/g
    ];

    // Patterns that indicate good Ashfall tone
    this.approvedPatterns = [
      /\.\.\./g,           // Trailing off (hesitation)
      /—/g,                // Em-dashes (interruption, fragmentation)
      /\*[^*]+\*/g,        // Action beats
      /^.{1,100}$/gm,      // Short sentences
    ];

    // Maximum sentence length (words)
    this.maxSentenceWords = 20;
    
    // Maximum response length (sentences) for normal dialogue
    this.maxSentences = 4;
  }

  validate(response, npcId) {
    const issues = [];
    const dialogue = response.dialogue || '';

    // Check prohibited patterns
    for (const pattern of this.prohibitedPatterns) {
      const matches = dialogue.match(pattern);
      if (matches) {
        issues.push({
          type: 'prohibited_language',
          matches: matches,
          severity: 'warning'
        });
      }
    }

    // Check sentence length
    const sentences = dialogue.split(/[.!?]+/).filter(s => s.trim());
    for (const sentence of sentences) {
      const wordCount = sentence.trim().split(/\s+/).length;
      if (wordCount > this.maxSentenceWords) {
        issues.push({
          type: 'sentence_too_long',
          sentence: sentence.trim(),
          wordCount: wordCount,
          severity: 'warning'
        });
      }
    }

    // Check total length
    if (sentences.length > this.maxSentences) {
      issues.push({
        type: 'response_too_long',
        sentenceCount: sentences.length,
        severity: 'info'
      });
    }

    // Check for exclamation overuse
    const exclamationCount = (dialogue.match(/!/g) || []).length;
    if (exclamationCount > 1) {
      issues.push({
        type: 'exclamation_overuse',
        count: exclamationCount,
        severity: 'warning'
      });
    }

    return {
      valid: issues.filter(i => i.severity === 'error').length === 0,
      issues: issues,
      dialogue: this.autoCorrect(dialogue, issues)
    };
  }

  autoCorrect(dialogue, issues) {
    let corrected = dialogue;

    // Replace prohibited words with Ashfall-appropriate alternatives
    const replacements = {
      'awesome': 'useful',
      'cool': 'fine',
      'okay': 'alright',
      'yeah': 'yes',
      'nope': 'no',
      'gonna': 'going to',
      'wanna': 'want to',
      'wonderful': 'good',
      'fantastic': 'fine',
      'amazing': 'rare',
      'great': 'adequate',
      'perfect': 'sufficient',
      'basically': '',
      'essentially': '',
      'actually': '',
      'as you know': '',
      'let me tell you': ''
    };

    for (const [bad, good] of Object.entries(replacements)) {
      const regex = new RegExp(`\\b${bad}\\b`, 'gi');
      corrected = corrected.replace(regex, good);
    }

    // Remove excess exclamation marks (keep only first)
    let firstExclamation = true;
    corrected = corrected.replace(/!/g, () => {
      if (firstExclamation) {
        firstExclamation = false;
        return '!';
      }
      return '.';
    });

    return corrected.trim();
  }

  // Check if dialogue matches a specific NPC's voice
  validateNpcVoice(dialogue, npcId) {
    const voiceChecks = {
      mara: {
        should_contain: [/\b(we|settlement|control|resource|survive)\b/gi],
        should_avoid: [/\b(please|sorry|maybe|perhaps)\b/gi]
      },
      jonas: {
        should_contain: [/\b(pain|wound|hurt|sorry)\b/gi],
        should_avoid: [/\b(certainly|definitely|I can)\b/gi]
      },
      rask: {
        should_contain: [], // Rask says little
        should_avoid: [/\b(I think|I feel|let me explain)\b/gi],
        max_words: 15
      },
      edda: {
        should_contain: [/\b(we|ground|remember|dust|wind)\b/gi],
        should_avoid: [/\b(definitely|certainly|the truth is)\b/gi]
      },
      kale: {
        should_contain: [/\b(you|should I|what do you)\b/gi],
        should_avoid: [] // Kale mirrors, so more flexible
      }
    };

    const checks = voiceChecks[npcId];
    if (!checks) return { valid: true, issues: [] };

    const issues = [];

    // Check word limit for terse characters
    if (checks.max_words) {
      const wordCount = dialogue.split(/\s+/).length;
      if (wordCount > checks.max_words) {
        issues.push({
          type: 'too_verbose_for_character',
          npc: npcId,
          wordCount: wordCount,
          limit: checks.max_words
        });
      }
    }

    return { valid: issues.length === 0, issues };
  }
}
```

---

## 3. Environmental Text Generator

For item descriptions, location text, and system messages.

```javascript
// src/systems/EnvironmentalText.js

export class EnvironmentalText {
  constructor() {
    // Ashfall's adjective palette
    this.adjectives = [
      'brittle', 'hollow', 'scorched', 'trembling', 'exhausted',
      'dusty', 'rusted', 'humming', 'bone-dry', 'dim',
      'cracked', 'worn', 'faded', 'silent', 'heavy'
    ];

    // Sensory fragments
    this.sensoryFragments = [
      'dust settles like memory',
      'metal tastes the air',
      'boards creak in complaint',
      'something hums beneath',
      'ash falls soft and persistent',
      'the wind carries whispers',
      'shadows lean wrong',
      'silence has weight here'
    ];
  }

  // Generate item description in Ashfall tone
  generateItemDescription(item) {
    const templates = [
      `${this.randomAdjective()} ${item.baseType}. ${item.history || 'Someone needed this once.'}`,
      `A ${item.baseType}, ${this.randomAdjective()} with age. ${item.useHint || ''}`,
      `${item.baseType}. ${this.randomAdjective()}. ${item.emotionalResidue || 'It remembers being held.'}`,
    ];

    return templates[Math.floor(Math.random() * templates.length)]
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Generate location description
  generateLocationDescription(location) {
    const sensory = this.sensoryFragments[
      Math.floor(Math.random() * this.sensoryFragments.length)
    ];

    const templates = [
      `${location.name}. ${this.randomAdjective()} walls. ${sensory}.`,
      `The ${location.name} feels ${this.randomAdjective()}. ${location.history || ''}`,
      `${sensory}. This is ${location.name}. ${location.warning || ''}`,
    ];

    return templates[Math.floor(Math.random() * templates.length)].trim();
  }

  // Generate system message (save, load, etc.)
  generateSystemMessage(type, context = {}) {
    const messages = {
      save: [
        'Memory preserved. For now.',
        'The settlement remembers this moment.',
        'Saved. The dust settles.',
        'Recorded. Whether you want it to be or not.'
      ],
      load: [
        'Returning to what was.',
        'The past resurfaces.',
        'Memory reconstructed.',
        'You were here before. You are here again.'
      ],
      death: [
        'The ground claims another.',
        'Silence. Then nothing.',
        'Some things don\'t survive Ashfall.',
        'The settlement continues. Without you.'
      ],
      newArea: [
        `Entering ${context.areaName}. ${this.randomSensory()}`,
        `${context.areaName}. The air changes here.`,
        `You cross into ${context.areaName}. Something watches.`
      ],
      questUpdate: [
        'Something shifts in the settlement.',
        'The balance changes.',
        'Consequences accumulate.',
        `${context.npcName || 'Someone'} will remember this.`
      ]
    };

    const options = messages[type] || messages.save;
    return options[Math.floor(Math.random() * options.length)];
  }

  randomAdjective() {
    return this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
  }

  randomSensory() {
    return this.sensoryFragments[
      Math.floor(Math.random() * this.sensoryFragments.length)
    ];
  }
}
```

---

## 4. Weather-as-Emotion System

Weather reflects narrative state, not random chance.

```javascript
// src/systems/WeatherSystem.js

export class WeatherSystem {
  constructor() {
    this.currentWeather = 'stillness';
    this.weatherDescriptions = {
      fog: {
        visual: 'Fog rolls through the settlement, obscuring edges.',
        meaning: 'secrets, uncertainty, withheld truth',
        triggers: ['secret_discovered', 'npc_lying', 'approaching_revelation']
      },
      wind: {
        visual: 'Wind gusts through Ashfall, rattling loose boards.',
        meaning: 'conflict brewing',
        triggers: ['relationship_damaged', 'confrontation_pending', 'tension_high']
      },
      stillness: {
        visual: 'The air hangs motionless. Heavy. Waiting.',
        meaning: 'dread, anticipation',
        triggers: ['before_major_choice', 'calm_before_storm', 'default']
      },
      tremors: {
        visual: 'The ground shudders. Dust falls from beams.',
        meaning: 'the thing below stirring',
        triggers: ['shaft_discussed', 'deep_secret_approached', 'endgame_near']
      },
      ashfall: {
        visual: 'Ash drifts from the sky. Soft. Relentless. Suffocating.',
        meaning: 'grief, resignation, inevitability',
        triggers: ['death_occurred', 'hope_lost', 'tragic_choice_made']
      },
      dust_storm: {
        visual: 'Dust scours the settlement. Visibility drops to nothing.',
        meaning: 'chaos, loss of clarity',
        triggers: ['multiple_crises', 'player_overwhelmed', 'relationships_fractured']
      }
    };
  }

  // Update weather based on game state
  updateWeather(flags, relationships, recentEvents) {
    // Check triggers in priority order
    
    // Ashfall (highest emotional weight)
    if (recentEvents.includes('death_occurred') || flags.has('tragic_ending_locked')) {
      this.setWeather('ashfall');
      return;
    }

    // Tremors (shaft-related)
    if (flags.has('shaft_opened') || flags.has('heard_the_singing') || 
        recentEvents.includes('shaft_discussed')) {
      this.setWeather('tremors');
      return;
    }

    // Wind (conflict)
    const damagedRelationships = Object.values(relationships)
      .filter(r => r < 30).length;
    if (damagedRelationships >= 2 || recentEvents.includes('confrontation')) {
      this.setWeather('wind');
      return;
    }

    // Fog (secrets)
    if (recentEvents.includes('npc_deflected') || 
        recentEvents.includes('partial_truth_told')) {
      this.setWeather('fog');
      return;
    }

    // Default: stillness
    this.setWeather('stillness');
  }

  setWeather(weatherType) {
    if (this.currentWeather !== weatherType) {
      this.currentWeather = weatherType;
      this.announceWeatherChange(weatherType);
    }
  }

  announceWeatherChange(weatherType) {
    const weather = this.weatherDescriptions[weatherType];
    if (weather) {
      // This should trigger a UI notification
      window.ASHFALL?.showEnvironmentalText?.(weather.visual);
    }
  }

  getCurrentDescription() {
    return this.weatherDescriptions[this.currentWeather]?.visual || '';
  }

  // Get weather-appropriate ambient text for dialogue scenes
  getAmbientText() {
    const ambients = {
      fog: [
        '*The fog thickens outside.*',
        '*Shapes move in the mist. Or don\'t.*',
        '*You can barely see the nearest building.*'
      ],
      wind: [
        '*A gust rattles the walls.*',
        '*Something metal clangs in the distance.*',
        '*The wind sounds almost like voices.*'
      ],
      stillness: [
        '*The silence presses.*',
        '*Nothing moves.*',
        '*The air feels thick. Waiting.*'
      ],
      tremors: [
        '*The floor shudders briefly.*',
        '*Dust falls from the ceiling.*',
        '*Something groans beneath you.*'
      ],
      ashfall: [
        '*Ash drifts past the window.*',
        '*The sky is grey. Always grey now.*',
        '*You taste it in the back of your throat.*'
      ],
      dust_storm: [
        '*The storm howls outside.*',
        '*You can\'t see three feet beyond the door.*',
        '*Best to wait this out.*'
      ]
    };

    const options = ambients[this.currentWeather] || ambients.stillness;
    return options[Math.floor(Math.random() * options.length)];
  }
}
```

---

## 5. Voice Tone Enforcement

Each internal voice has a strict tonal signature.

```javascript
// src/systems/VoiceTones.js

export class VoiceTones {
  constructor() {
    this.voices = {
      LOGIC: {
        color: '#88ccff',
        essence: 'The scalpel',
        rules: [
          'Precise, cold, observational',
          'Unemotional analysis',
          'Short declarative sentences',
          'Never uses "I feel" or emotional language',
          'Identifies patterns, inconsistencies, lies'
        ],
        examples: [
          "Her story has inconsistencies. Track them.",
          "Three facts don't align. Which is the lie?",
          "Probability of truth: low.",
          "Notice the hands. They contradict the voice.",
          "This is calculation, not confession."
        ],
        prohibited: [
          'I feel', 'maybe', 'perhaps', 'I think', 
          'emotional', 'sad', 'happy', 'wonderful'
        ],
        maxWords: 12
      },
      
      INSTINCT: {
        color: '#ff8844',
        essence: 'The animal',
        rules: [
          'Feral intuition',
          'Pre-verbal edges',
          'Visceral reactions',
          'Threat detection',
          'Often one word or fragment'
        ],
        examples: [
          "Back away. Now.",
          "Danger.",
          "Wrong. Something's wrong.",
          "Don't turn your back.",
          "Predator. Watch."
        ],
        prohibited: [
          'I think', 'it seems', 'perhaps', 'analysis',
          'logically', 'therefore', 'consequently'
        ],
        maxWords: 8
      },
      
      EMPATHY: {
        color: '#88ff88',
        essence: 'The ache',
        rules: [
          'Soft, perceptive',
          'Reads micro-expressions',
          'Prioritizes emotional truth',
          'Sees the wound behind the words',
          'Sometimes painfully accurate'
        ],
        examples: [
          "He's terrified you'll make him choose.",
          "She hasn't slept. Guilt does that.",
          "The anger is a mask. Underneath: grief.",
          "They need someone to see them. Really see them.",
          "This kindness costs her everything."
        ],
        prohibited: [
          'logically', 'analysis', 'probability',
          'data suggests', 'objectively'
        ],
        maxWords: 15
      },
      
      GHOST: {
        color: '#cc88ff',
        essence: 'The intrusion',
        rules: [
          'Cryptic, poetic',
          'Wrong in the right way',
          'Speaks like memory or prophecy',
          'References things the player might not remember',
          'Blurs past and present'
        ],
        examples: [
          "The soil hums your name. Why does it know you?",
          "You've stood here before. You will again.",
          "This room remembers screaming.",
          "Twenty-three voices. Still singing.",
          "Memory is a door. Some doors open both ways."
        ],
        prohibited: [
          'basically', 'essentially', 'in other words',
          'clearly', 'obviously', 'simply put'
        ],
        maxWords: 15
      }
    };
  }

  // Generate voice line from context
  generateVoiceLine(voiceName, context) {
    const voice = this.voices[voiceName];
    if (!voice) return null;

    // This would typically call an LLM with voice-specific prompting
    // For now, return contextual example or null
    
    return {
      voice: voiceName,
      text: this.selectAppropriateExample(voice, context),
      color: voice.color
    };
  }

  // Validate a voice line matches its tonal rules
  validateVoiceLine(voiceName, text) {
    const voice = this.voices[voiceName];
    if (!voice) return { valid: false, reason: 'Unknown voice' };

    const issues = [];

    // Check prohibited words
    for (const word of voice.prohibited) {
      if (text.toLowerCase().includes(word.toLowerCase())) {
        issues.push(`Contains prohibited phrase: "${word}"`);
      }
    }

    // Check word count
    const wordCount = text.split(/\s+/).length;
    if (wordCount > voice.maxWords) {
      issues.push(`Too long: ${wordCount} words (max: ${voice.maxWords})`);
    }

    return {
      valid: issues.length === 0,
      issues: issues
    };
  }

  selectAppropriateExample(voice, context) {
    // Select example based on context type
    // This is simplified - real implementation would be more sophisticated
    const examples = voice.examples;
    return examples[Math.floor(Math.random() * examples.length)];
  }

  // Get voice prompt for LLM
  getVoicePrompt(voiceName) {
    const voice = this.voices[voiceName];
    if (!voice) return '';

    return `
You are ${voiceName}, one of the player's internal voices.

ESSENCE: ${voice.essence}

RULES:
${voice.rules.map(r => `- ${r}`).join('\n')}

EXAMPLES OF YOUR VOICE:
${voice.examples.map(e => `- "${e}"`).join('\n')}

NEVER USE THESE WORDS/PHRASES:
${voice.prohibited.join(', ')}

MAXIMUM WORDS: ${voice.maxWords}

Respond with a single observation. No more than ${voice.maxWords} words. Stay in character.`;
  }
}
```

---

## 6. Integration with Agent Runner

Update `AgentRunner.js` to use tone validation:

```javascript
// In AgentRunner.js

import { ToneValidator } from './ToneValidator.js';
import { WeatherSystem } from './WeatherSystem.js';
import { EnvironmentalText } from './EnvironmentalText.js';

export class AgentRunner {
  constructor() {
    // ... existing code ...
    this.toneValidator = new ToneValidator();
    this.weatherSystem = new WeatherSystem();
    this.environmentalText = new EnvironmentalText();
  }

  async runConversation(npcId, playerInput) {
    // ... existing code to get response ...

    try {
      const response = await this.callLLM(prompt);
      
      // TONE VALIDATION - New step
      const toneCheck = this.toneValidator.validate(response, npcId);
      if (!toneCheck.valid) {
        console.warn('Tone issues detected:', toneCheck.issues);
      }
      
      // Use corrected dialogue
      response.dialogue = toneCheck.dialogue;
      
      // NPC-specific voice check
      const voiceCheck = this.toneValidator.validateNpcVoice(response.dialogue, npcId);
      if (!voiceCheck.valid) {
        console.warn('NPC voice issues:', voiceCheck.issues);
      }

      const validated = this.validateResponse(response, agent, flags);
      
      // Update weather based on conversation
      this.updateWeatherFromConversation(validated, npcId);
      
      // ... rest of existing code ...
      
      // Add ambient text if appropriate
      if (Math.random() < 0.3) { // 30% chance
        validated.ambientText = this.weatherSystem.getAmbientText();
      }

      return {
        dialogue: validated.dialogue,
        choices: validated.player_choices,
        voiceInterrupts: voiceReactions,
        ambientText: validated.ambientText,
        internal_state: validated.internal_state
      };

    } catch (error) {
      // ... existing error handling ...
    }
  }

  updateWeatherFromConversation(response, npcId) {
    const recentEvents = [];
    
    // Detect conversation events that affect weather
    if (response.flags_to_set?.includes('shaft_discussed') ||
        response.dialogue?.toLowerCase().includes('shaft')) {
      recentEvents.push('shaft_discussed');
    }
    
    if (response.relationship_delta < -5) {
      recentEvents.push('confrontation');
    }
    
    if (response.internal_state?.includes('deflect') ||
        response.internal_state?.includes('hiding')) {
      recentEvents.push('npc_deflected');
    }

    // Update weather
    this.weatherSystem.updateWeather(
      window.ASHFALL.flags,
      window.ASHFALL.relationships,
      recentEvents
    );
  }
}
```

---

## 7. Tone Bible Quick Reference (for prompts)

A compressed version to include in every agent prompt:

```javascript
// src/config/toneBible.js

export const TONE_BIBLE_COMPRESSED = `
ASHFALL TONE (MEMORIZE):

PILLARS:
• Bleak but not hopeless. Hope is rationed.
• Intimate, not epic. Personal stakes.
• Human, even when broken. No pure villains.
• Sparse, sharp language. Every word weighted.
• The world is watching. Everything feels aware.

DIALOGUE RULES:
• Half-phrases normal. People don't speak cleanly.
• Emotion hides behind precision, silence, tasks.
• Humor is bone-dry, never bright.
• No exposition dumps. Truth is dragged out.
• Maximum 3 sentences. Usually fewer.

PROHIBITED:
• Modern slang
• Melodrama
• Heroic language
• Exclamation overuse
• Flowery description
• Exposition monologues

TOUCHSTONES:
"Small lives. Heavy truths."
"The earth remembers."
"Hope is rationed."
"Nothing here is whole."
`;

export const VOICE_TONES = {
  LOGIC: 'Cold. Precise. Observational. "Her story has inconsistencies."',
  INSTINCT: 'Feral. Pre-verbal. Visceral. "Back away. Now."',
  EMPATHY: 'Soft. Perceptive. Aching. "He\'s terrified you\'ll make him choose."',
  GHOST: 'Cryptic. Poetic. Wrong. "The soil hums your name."'
};
```

---

## 8. Testing Tone Compliance

```javascript
// Test suite for tone validation

const testDialogues = [
  // Should PASS
  { text: "Things break here. Sometimes people do too.", expected: 'pass' },
  { text: "The dust... it never stops.", expected: 'pass' },
  { text: "*She looks away.* We don't talk about that.", expected: 'pass' },
  
  // Should FAIL or WARN
  { text: "That's awesome! Let me tell you about the amazing history!", expected: 'fail' },
  { text: "Basically, the destiny of our glorious settlement depends on you, hero!", expected: 'fail' },
  { text: "Yeah, gonna head out. Cool talking to you, dude.", expected: 'fail' },
];

function runToneTests() {
  const validator = new ToneValidator();
  
  for (const test of testDialogues) {
    const result = validator.validate({ dialogue: test.text });
    const status = result.issues.length === 0 ? 'pass' : 'fail';
    
    console.log(`${status === test.expected ? '✓' : '✗'} "${test.text.substring(0, 40)}..."`);
    if (result.issues.length > 0) {
      console.log(`  Issues: ${result.issues.map(i => i.type).join(', ')}`);
    }
  }
}
```

---

## Summary

The Tone Bible implementation includes:

| System | Purpose |
|--------|---------|
| **Tone Primer** | Injected into every agent prompt |
| **ToneValidator** | Post-processes responses, auto-corrects violations |
| **EnvironmentalText** | Generates item/location/system text in Ashfall voice |
| **WeatherSystem** | Weather reflects narrative state (fog = secrets, tremors = below) |
| **VoiceTones** | Enforces distinct personalities for LOGIC/INSTINCT/EMPATHY/GHOST |

**Integration order:**
1. Add `getTonePrimer()` to AgentBase
2. Create ToneValidator and integrate into AgentRunner
3. Implement WeatherSystem
4. Add EnvironmentalText for items and locations
5. Implement VoiceTones for internal voices

---

*"Small lives. Heavy truths. The earth remembers."*

*— Aria's oxygen, translated to code*
