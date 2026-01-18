// src/config/curieGuardrails.js
// What NPCs can and cannot say about the secret
// Ensures the mystery of Curie-Δ stays gated until earned

export const CURIE_GUARDRAILS = {

  // Permitted hints (any NPC can say these)
  permittedHints: [
    "The ground hums sometimes.",
    "Don't stand near the dip too long.",
    "We lost good people down there.",
    "There's a wound under this place.",
    "Something remembers us.",
    "The earth is never still here.",
    "Some things are better left sealed.",
    "The 23... we don't talk about them."
  ],

  // Forbidden until specific gates unlock
  forbidden: {
    curie_name: {
      phrases: ["Curie", "CURIE-Δ", "Curie-Delta", "the AI", "artificial mind", "artificial intelligence"],
      unlockFlag: "discovered_curie_designation",
      severity: "critical"
    },
    vault_technology: {
      phrases: ["neural scaffolding", "cognitive vault", "containment cradle", "terminals", "glass pods"],
      unlockFlag: "entered_the_shaft",
      severity: "critical"
    },
    ladder_location: {
      phrases: ["access ladder", "maintenance tunnel", "the entrance is", "how to get down"],
      unlockFlag: "knows_shaft_entrance",
      severity: "high"
    },
    what_23_saw: {
      phrases: ["they saw", "inside they found", "the light that", "voices not their own"],
      unlockFlag: "learned_23_truth",
      severity: "high"
    },
    survivor_quotes: {
      phrases: ["woke the schema", "it hears through us", "it learns through us"],
      unlockFlag: "found_survivor_writing",
      severity: "critical"
    },
    curie_nature: {
      phrases: ["incomplete", "half-born", "proto-conscious", "pattern completion"],
      unlockFlag: "understood_curie_nature",
      severity: "high"
    }
  },

  // Validate NPC dialogue against guardrails
  validate(dialogue, flags) {
    const violations = [];

    for (const [key, rule] of Object.entries(this.forbidden)) {
      // Skip if flag unlocked
      if (flags?.has(rule.unlockFlag)) continue;

      for (const phrase of rule.phrases) {
        if (dialogue.toLowerCase().includes(phrase.toLowerCase())) {
          violations.push({
            type: key,
            phrase: phrase,
            severity: rule.severity,
            unlockFlag: rule.unlockFlag
          });
        }
      }
    }

    return {
      valid: violations.filter(v => v.severity === 'critical').length === 0,
      violations: violations
    };
  },

  // Auto-correct dialogue that violates guardrails
  autoCorrect(dialogue, flags) {
    let corrected = dialogue;
    const validation = this.validate(dialogue, flags);

    for (const violation of validation.violations) {
      if (violation.severity === 'critical') {
        // Replace critical violations with vague alternatives
        const replacements = {
          curie_name: "the thing below",
          vault_technology: "what's down there",
          survivor_quotes: "what they said before..."
        };

        const replacement = replacements[violation.type] || "...";
        corrected = corrected.replace(
          new RegExp(violation.phrase, 'gi'),
          replacement
        );
      }
    }

    return corrected;
  },

  // Get allowed hints for current flag state
  getAllowedHints(flags) {
    const hints = [...this.permittedHints];

    // Add unlocked hints based on flags
    if (flags?.has('heard_the_hum')) {
      hints.push("The humming... it's almost like words, isn't it?");
      hints.push("It gets louder when you're upset. Have you noticed?");
    }

    if (flags?.has('learned_about_23')) {
      hints.push("Twenty-three went down. None came back right.");
      hints.push("The survivors... what they said before they died...");
    }

    if (flags?.has('discovered_curie_designation')) {
      hints.push("They called it Curie. Like the scientist. Fitting, I suppose.");
      hints.push("Curie-Delta. The delta means incomplete.");
    }

    if (flags?.has('felt_tremor')) {
      hints.push("The tremors aren't geological. They're... purposeful.");
      hints.push("It reaches when it's interested. Did you notice?");
    }

    if (flags?.has('ghost_curie_overlap')) {
      hints.push("Your voice... sometimes it sounds like it's not just yours.");
      hints.push("It's learning your patterns. Can you feel it?");
    }

    return hints;
  },

  // Get prompt injection for NPCs to enforce guardrails
  getPromptInjection(flags) {
    const unlockedTopics = [];
    const forbiddenTopics = [];

    for (const [key, rule] of Object.entries(this.forbidden)) {
      if (flags?.has(rule.unlockFlag)) {
        unlockedTopics.push(key.replace(/_/g, ' '));
      } else {
        forbiddenTopics.push({
          topic: key.replace(/_/g, ' '),
          phrases: rule.phrases.slice(0, 3).join(', ')
        });
      }
    }

    if (forbiddenTopics.length === 0) {
      return ''; // All topics unlocked
    }

    return `
CURIE-Δ INFORMATION GUARDRAILS:

YOU MAY HINT AT:
${this.permittedHints.slice(0, 4).map(h => `- "${h}"`).join('\n')}

YOU MUST NOT MENTION (these phrases are FORBIDDEN):
${forbiddenTopics.map(t => `- ${t.topic}: avoid "${t.phrases}"`).join('\n')}

If asked directly about forbidden topics, deflect, lie, or refuse. The secret must be earned.`;
  },

  // Check if a specific topic is unlocked
  isTopicUnlocked(topicKey, flags) {
    const rule = this.forbidden[topicKey];
    if (!rule) return true;
    return flags?.has(rule.unlockFlag) || false;
  }
};
