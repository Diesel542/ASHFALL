// ASHFALL - VoiceTones
// Each internal voice has a strict tonal signature

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

  // Get voice configuration
  getVoice(voiceName) {
    return this.voices[voiceName.toUpperCase()] || null;
  }

  // Get voice color
  getVoiceColor(voiceName) {
    const voice = this.getVoice(voiceName);
    return voice ? voice.color : '#ffffff';
  }

  // Validate a voice line matches its tonal rules
  validateVoiceLine(voiceName, text) {
    const voice = this.getVoice(voiceName);
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

  // Generate voice line from context (selects from examples)
  generateVoiceLine(voiceName, context) {
    const voice = this.getVoice(voiceName);
    if (!voice) return null;

    return {
      voice: voiceName,
      text: this.selectAppropriateExample(voice, context),
      color: voice.color
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
    const voice = this.getVoice(voiceName);
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
