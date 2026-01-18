// ASHFALL - ToneValidator
// Post-processing layer that checks LLM responses for tone violations

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

    // Clean up any double spaces
    corrected = corrected.replace(/\s+/g, ' ').trim();

    return corrected;
  }

  // Check if dialogue matches a specific NPC's voice
  validateNpcVoice(dialogue, npcId) {
    const voiceChecks = {
      leader: {
        should_contain: [/\b(we|settlement|control|resource|survive)\b/gi],
        should_avoid: [/\b(please|sorry|maybe|perhaps)\b/gi]
      },
      healer: {
        should_contain: [/\b(pain|wound|hurt|sorry)\b/gi],
        should_avoid: [/\b(certainly|definitely|I can)\b/gi]
      },
      threat: {
        should_contain: [], // Rask says little
        should_avoid: [/\b(I think|I feel|let me explain)\b/gi],
        max_words: 15
      },
      keeper: {
        should_contain: [/\b(we|ground|remember|dust|wind)\b/gi],
        should_avoid: [/\b(definitely|certainly|the truth is)\b/gi]
      },
      mirror: {
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
