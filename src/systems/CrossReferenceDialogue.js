// src/systems/CrossReferenceDialogue.js
// Handles when player asks one NPC about another

export class CrossReferenceDialogue {
  constructor(relationshipManager) {
    this.relationships = relationshipManager;

    // NPC names and aliases for detection
    this.npcAliases = {
      mara: ['mara', 'leader', 'the leader'],
      jonas: ['jonas', 'healer', 'the healer', 'doctor'],
      rask: ['rask', 'threat', 'the guard', 'the big one'],
      edda: ['edda', 'keeper', 'old woman', 'the elder'],
      kale: ['kale', 'mirror', 'the boy', 'the kid', 'the young one']
    };
  }

  // Detect if player is asking about another NPC
  detectCrossReference(playerInput) {
    const input = playerInput.toLowerCase();

    for (const [npcId, aliases] of Object.entries(this.npcAliases)) {
      for (const alias of aliases) {
        if (input.includes(alias)) {
          // Check for question patterns that suggest asking about someone
          const questionPatterns = [
            `what do you think of`,
            `what about`,
            `tell me about`,
            `how do you feel about`,
            `what's ${alias} like`,
            `what is ${alias} like`,
            `do you trust`,
            `do you like`,
            `your thoughts on`,
            `opinion of`,
            `opinion on`,
            `know about`
          ];

          for (const pattern of questionPatterns) {
            if (input.includes(pattern)) {
              return npcId;
            }
          }

          // Even just mentioning them in a question context
          if (input.includes('?') || input.includes('think') ||
              input.includes('feel') || input.includes('know')) {
            return npcId;
          }
        }
      }
    }

    return null;
  }

  // Generate prompt addition when cross-reference detected
  getCrossReferenceContext(speakingNpc, mentionedNpc) {
    const sourceNpc = this.relationships.normalizeNpcId(speakingNpc);
    const targetNpc = this.relationships.normalizeNpcId(mentionedNpc);

    if (sourceNpc === targetNpc) return ''; // Can't ask about yourself

    const rel = this.relationships.getPerception(sourceNpc, targetNpc);
    if (!rel) return '';

    const sentiment = this.relationships.calculateSentiment(rel);
    const dominant = this.relationships.getDominantFeeling(sourceNpc, targetNpc);

    return `
═══════════════════════════════════════
CROSS-REFERENCE: Player asked about ${targetNpc.toUpperCase()}
═══════════════════════════════════════

YOUR PERCEPTION OF ${targetNpc.toUpperCase()}:
"${rel.perception}"

DOMINANT FEELING: ${dominant} (${rel[dominant]}/100)

WHAT YOU HIDE: ${rel.hidden}

TENSION BETWEEN YOU: ${rel.tension}

APPROPRIATE TONE FOR THIS TOPIC:
"${rel.dialogueColor[sentiment]}"

RULES:
- Speak about ${targetNpc} through the lens of your ${dominant}
- Your hidden feelings may leak through in subtext
- If trust is low (${rel.trust}), be guarded about what you reveal
- If fear is high (${rel.fear}), deflect or change subject
- If guilt is high (${rel.guilt}), become defensive or evasive
- NPCs rarely agree on interpretations of each other
`;
  }

  // Get all the gossip/impressions one NPC has about others
  getAllImpressions(npcId) {
    const sourceNpc = this.relationships.normalizeNpcId(npcId);
    const impressions = {};
    const npcNames = ['mara', 'jonas', 'rask', 'edda', 'kale'].filter(n => n !== sourceNpc);

    for (const otherNpc of npcNames) {
      const rel = this.relationships.getPerception(sourceNpc, otherNpc);
      if (rel) {
        impressions[otherNpc] = {
          summary: rel.perception,
          dominant: this.relationships.getDominantFeeling(sourceNpc, otherNpc),
          sentiment: this.relationships.calculateSentiment(rel),
          hidden: rel.hidden
        };
      }
    }

    return impressions;
  }

  // Generate the "gossip" prompt - what this NPC thinks of everyone
  getGossipPrompt(npcId) {
    const impressions = this.getAllImpressions(npcId);

    let prompt = `
YOUR IMPRESSIONS OF OTHER SETTLEMENT MEMBERS:
(Use these when discussing or thinking about them)

`;

    for (const [name, imp] of Object.entries(impressions)) {
      prompt += `${name.toUpperCase()}: "${imp.summary}" [${imp.dominant}, ${imp.sentiment}]\n`;
    }

    prompt += `
GOSSIP RULES:
- Never fully agree with player's assessment of others
- Filter information through your own biases
- Gossip is subdued but weighted
- You may defend or attack based on your feelings
- What you say reveals as much about you as about them
`;

    return prompt;
  }

  // Get a single impression for a specific NPC pair
  getImpression(speakingNpc, aboutNpc) {
    const sourceNpc = this.relationships.normalizeNpcId(speakingNpc);
    const targetNpc = this.relationships.normalizeNpcId(aboutNpc);

    const rel = this.relationships.getPerception(sourceNpc, targetNpc);
    if (!rel) return null;

    return {
      perception: rel.perception,
      hidden: rel.hidden,
      tension: rel.tension,
      dominant: this.relationships.getDominantFeeling(sourceNpc, targetNpc),
      sentiment: this.relationships.calculateSentiment(rel),
      dialogueColor: rel.dialogueColor
    };
  }

  // Check if NPC would be reluctant to discuss another NPC
  isReluctantToDiscuss(speakingNpc, aboutNpc) {
    const rel = this.relationships.getPerception(speakingNpc, aboutNpc);
    if (!rel) return false;

    // Reluctant if fear or guilt is high
    return rel.fear > 50 || rel.guilt > 50;
  }

  // Get suggested deflection if NPC doesn't want to talk about someone
  getDeflection(speakingNpc, aboutNpc) {
    const rel = this.relationships.getPerception(speakingNpc, aboutNpc);
    if (!rel) return null;

    const deflections = {
      fear: [
        "I'd rather not...",
        "*changes subject*",
        "That's not... let's talk about something else.",
        "I don't have much to say about that."
      ],
      guilt: [
        "*looks away*",
        "It's complicated.",
        "I... can we not?",
        "*silence*"
      ]
    };

    if (rel.fear > 50) {
      return deflections.fear[Math.floor(Math.random() * deflections.fear.length)];
    }

    if (rel.guilt > 50) {
      return deflections.guilt[Math.floor(Math.random() * deflections.guilt.length)];
    }

    return null;
  }

  // Check if discussing someone might reveal information
  mightReveal(speakingNpc, aboutNpc) {
    const rel = this.relationships.getPerception(speakingNpc, aboutNpc);
    if (!rel) return false;

    // High understanding + trust might lead to revelations
    return rel.understanding > 50 && rel.trust > 40;
  }

  // Get topics that this NPC knows about another
  getKnownTopics(speakingNpc, aboutNpc) {
    const rel = this.relationships.getPerception(speakingNpc, aboutNpc);
    if (!rel) return [];

    const topics = [];

    if (rel.understanding > 40) {
      topics.push('basic_background');
    }

    if (rel.understanding > 60) {
      topics.push('personal_struggles');
    }

    if (rel.understanding > 80) {
      topics.push('deep_secrets');
    }

    // Special topic knowledge based on relationships
    if (speakingNpc === 'edda') {
      topics.push('everyone_has_secrets'); // Edda knows things
    }

    return topics;
  }
}
