// src/systems/QuestValidator.js

/**
 * QUEST VALIDATOR
 *
 * Enforces the fundamental rules that quests must never break.
 * This is the guardrail that keeps dynamic content safe.
 */

export class QuestValidator {
  constructor() {
    this.fundamentalRules = [
      'no_outside_factions',
      'no_scarcity_breaking',
      'no_clean_solutions',
      'no_premature_reveals',
      'no_heroic_fantasy',
      'no_tone_violation',
      'no_exposition_dumping',
      'no_binary_morality'
    ];
  }

  // Validate a quest before it's presented to the player
  validate(quest, gameState) {
    const violations = [];

    // Rule 1: No outside factions
    if (this.mentionsOutsiders(quest)) {
      violations.push({
        rule: 'no_outside_factions',
        severity: 'critical',
        description: 'Quest introduces external groups'
      });
    }

    // Rule 2: No scarcity breaking
    if (this.breaksScarcity(quest)) {
      violations.push({
        rule: 'no_scarcity_breaking',
        severity: 'critical',
        description: 'Quest provides easy resource solutions'
      });
    }

    // Rule 3: No clean solutions
    if (this.hasCleanSolution(quest)) {
      violations.push({
        rule: 'no_clean_solutions',
        severity: 'warning',
        description: 'Quest resolves without meaningful cost'
      });
    }

    // Rule 4: No premature reveals
    if (this.revealsEarly(quest, gameState)) {
      violations.push({
        rule: 'no_premature_reveals',
        severity: 'critical',
        description: 'Quest reveals lore before appropriate gate'
      });
    }

    // Rule 5: No heroic fantasy
    if (this.isHeroicFantasy(quest)) {
      violations.push({
        rule: 'no_heroic_fantasy',
        severity: 'warning',
        description: 'Quest enables power fantasy'
      });
    }

    // Rule 6: No tone violations
    if (this.violatesTone(quest)) {
      violations.push({
        rule: 'no_tone_violation',
        severity: 'warning',
        description: 'Quest breaks Ashfall tone'
      });
    }

    // Rule 7: No exposition dumping
    if (this.hasExpositionDump(quest)) {
      violations.push({
        rule: 'no_exposition_dumping',
        severity: 'warning',
        description: 'NPC delivers lore monologue'
      });
    }

    // Rule 8: No binary morality
    if (this.hasBinaryMorality(quest)) {
      violations.push({
        rule: 'no_binary_morality',
        severity: 'warning',
        description: 'Quest has clear good/evil choice'
      });
    }

    return {
      valid: violations.filter(v => v.severity === 'critical').length === 0,
      violations: violations
    };
  }

  // ═══════════════════════════════════════
  // RULE CHECKS
  // ═══════════════════════════════════════

  mentionsOutsiders(quest) {
    const outsiderTerms = [
      'raiders', 'traders', 'caravan', 'army', 'faction',
      'other settlement', 'outsiders', 'visitors', 'merchants'
    ];

    const questText = JSON.stringify(quest).toLowerCase();
    return outsiderTerms.some(term => questText.includes(term));
  }

  breaksScarcity(quest) {
    const abundanceTerms = [
      'plenty', 'abundant', 'enough for everyone', 'solved',
      'cache', 'hidden supplies', 'trade route', 'surplus'
    ];

    const questText = JSON.stringify(quest).toLowerCase();
    return abundanceTerms.some(term => questText.includes(term));
  }

  hasCleanSolution(quest) {
    // Check if all outcomes have costs
    if (quest.outcomes) {
      return quest.outcomes.some(o =>
        !o.cost && !o.consequence && !o.relationshipDelta
      );
    }
    return false;
  }

  revealsEarly(quest, gameState) {
    const loreTerms = {
      'curie': { requiredFlag: 'discovered_curie_designation' },
      'neural scaffolding': { requiredFlag: 'entered_the_shaft' },
      'the 23 saw': { requiredFlag: 'learned_23_truth' },
      'woke the schema': { requiredFlag: 'found_survivor_writing' }
    };

    const questText = JSON.stringify(quest).toLowerCase();

    for (const [term, requirement] of Object.entries(loreTerms)) {
      if (questText.includes(term) && !gameState.flags?.has(requirement.requiredFlag)) {
        return true;
      }
    }

    return false;
  }

  isHeroicFantasy(quest) {
    const heroicTerms = [
      'save everyone', 'hero', 'champion', 'victory',
      'defeat the enemy', 'triumph', 'glory', 'legend'
    ];

    const questText = JSON.stringify(quest).toLowerCase();
    return heroicTerms.some(term => questText.includes(term));
  }

  violatesTone(quest) {
    const toneViolations = [
      'awesome', 'cool', 'amazing', 'fantastic',
      'lol', 'gonna', 'wanna', 'dude'
    ];

    const questText = JSON.stringify(quest).toLowerCase();
    return toneViolations.some(term => questText.includes(term));
  }

  hasExpositionDump(quest) {
    // Check for long NPC monologues that explain lore
    if (quest.npcDialogue) {
      const sentences = quest.npcDialogue.split(/[.!?]+/);
      if (sentences.length > 5) {
        // Check if it's mostly exposition
        const loreWords = ['history', 'years ago', 'the truth is', 'let me explain'];
        const matches = loreWords.filter(w => quest.npcDialogue.toLowerCase().includes(w));
        return matches.length >= 2;
      }
    }
    return false;
  }

  hasBinaryMorality(quest) {
    // Check for clear good/evil framing
    const binaryTerms = [
      'the right thing', 'the wrong choice', 'evil', 'pure',
      'clearly good', 'obviously bad', 'moral duty'
    ];

    const questText = JSON.stringify(quest).toLowerCase();
    return binaryTerms.some(term => questText.includes(term));
  }

  // ═══════════════════════════════════════
  // VALIDATION HELPERS
  // ═══════════════════════════════════════

  // Validate generated LLM content
  validateLLMContent(content, gameState) {
    const violations = [];

    // Check for outsider mentions
    if (this.mentionsOutsiders({ content })) {
      violations.push({
        rule: 'no_outside_factions',
        severity: 'critical',
        description: 'LLM content introduces external groups'
      });
    }

    // Check for premature lore
    if (this.revealsEarly({ content }, gameState)) {
      violations.push({
        rule: 'no_premature_reveals',
        severity: 'critical',
        description: 'LLM content reveals lore too early'
      });
    }

    // Check tone
    if (this.violatesTone({ content })) {
      violations.push({
        rule: 'no_tone_violation',
        severity: 'warning',
        description: 'LLM content breaks tone'
      });
    }

    return {
      valid: violations.filter(v => v.severity === 'critical').length === 0,
      violations: violations
    };
  }

  // Get all rules for prompt injection
  getRulesForPrompt() {
    return `
FUNDAMENTAL RULES — NEVER VIOLATE:

1. NO OUTSIDE FACTIONS
   - No raiders, traders, caravans, armies
   - No other settlements or external groups
   - The world is small and isolated

2. NO SCARCITY BREAKING
   - No hidden supplies or caches
   - No trade routes or surplus
   - Resources are always limited

3. NO CLEAN SOLUTIONS
   - Every choice has a cost
   - No outcomes that satisfy everyone
   - Consequences are real

4. NO PREMATURE REVEALS
   - Lore must be earned through gates
   - NPCs don't dump exposition
   - Mystery unfolds gradually

5. NO HEROIC FANTASY
   - No saving everyone
   - No triumph or glory
   - Small stakes, heavy truths

6. NO TONE VIOLATIONS
   - No casual or modern language
   - No excitement or enthusiasm
   - Brittle, haunted, human

7. NO EXPOSITION DUMPING
   - NPCs don't explain lore
   - Show, don't tell
   - Maximum 3 sentences

8. NO BINARY MORALITY
   - No clear right/wrong
   - Moral ambiguity is the rule
   - Good intentions have costs
`;
  }

  // Check if a specific rule is violated
  checkRule(ruleName, content, gameState = {}) {
    const checks = {
      'no_outside_factions': () => this.mentionsOutsiders({ content }),
      'no_scarcity_breaking': () => this.breaksScarcity({ content }),
      'no_clean_solutions': () => this.hasCleanSolution({ content }),
      'no_premature_reveals': () => this.revealsEarly({ content }, gameState),
      'no_heroic_fantasy': () => this.isHeroicFantasy({ content }),
      'no_tone_violation': () => this.violatesTone({ content }),
      'no_exposition_dumping': () => this.hasExpositionDump({ npcDialogue: content }),
      'no_binary_morality': () => this.hasBinaryMorality({ content })
    };

    const check = checks[ruleName];
    return check ? check() : false;
  }
}
