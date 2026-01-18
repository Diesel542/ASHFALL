// src/systems/QuestPromptGenerator.js

/**
 * QUEST PROMPT GENERATOR
 *
 * Creates prompts for the LLM to generate quest content.
 * Ensures all generated content stays within Ashfall's tone and rules.
 */

export class QuestPromptGenerator {

  generatePrompt(archetype, context, gameState) {
    const basePrompt = this.getBasePrompt();
    const archetypePrompt = archetype.promptTemplate;
    const filledPrompt = this.fillTemplate(archetypePrompt, context, gameState);
    const guardrails = this.getGuardrails(archetype);

    return `${basePrompt}

${filledPrompt}

${guardrails}`;
  }

  getBasePrompt() {
    return `
═══════════════════════════════════════
ASHFALL QUEST GENERATION
═══════════════════════════════════════

You are generating content for a quest in Ashfall.

WORLD RULES:
- Small stakes, heavy truths
- No heroics, no clean solutions
- Scarcity is real and permanent
- NPCs are flawed humans, not archetypes
- The tone is brittle, haunted, human
- Hope exists but is rationed

DIALOGUE RULES:
- Sparse, weighted, edged
- Never flowery or expository
- Emotion hides behind precision
- Half-phrases are normal
- Maximum 3 sentences per NPC turn
`;
  }

  fillTemplate(template, context, gameState) {
    let filled = template;

    // Basic replacements
    const replacements = {
      '{npc}': context.npc || 'unknown',
      '{scenario}': context.scenario || 'unspecified',
      '{stressLevel}': gameState.npcStress?.[context.npc] || 30,
      '{gateLevel}': gameState.npcGates?.[context.npc] || 0,
      '{currentAct}': gameState.currentAct || 1,
      '{curieActivity}': gameState.curieActivity || 0.2,
      '{humIntensity}': this.getHumDescription(gameState.curieActivity),
      '{timeOfDay}': context.timeOfDay || 'dusk',
      '{weather}': gameState.weather || 'stillness',
      '{resource}': context.resource || 'supplies',
      '{severity}': context.severity || 'moderate',
      '{location}': context.location || 'settlement',
      '{subject}': context.subject || 'anomaly',
      '{action}': context.action || 'help',
      '{npcBenefit}': context.npcBenefit || context.npc || 'someone',
      '{variant}': context.variant || 'standard',
      '{initiator}': context.initiator || 'Mara',
      '{echoType}': context.echoType || 'environment',
      '{target}': context.target || 'unknown',
      '{manifestation}': context.manifestation || 'subtle disturbance',
      '{affectedNpc}': context.affectedNpc || context.npc || 'someone',
      '{secretCategory}': context.secretCategory || 'the past',
      '{currentGate}': context.currentGate || gameState.npcGates?.[context.npc] || 0,
      '{requiredGate}': context.requiredGate || 2,
      '{approach}': context.approach || 'patience'
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      filled = filled.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    }

    // NPC-specific content
    if (context.npc) {
      filled = filled.replace('{canReveal}', this.getCanReveal(context.npc, gameState));
      filled = filled.replace('{cannotReveal}', this.getCannotReveal(context.npc, gameState));
    }

    // Scarcity dilemma specific
    filled = filled.replace('{maraArgument}', "We ration or we die. All of us.");
    filled = filled.replace('{jonasArgument}', "We can't let them suffer. There has to be another way.");
    filled = filled.replace('{raskArgument}', "Weakness gets noticed. By others.");
    filled = filled.replace('{eddaArgument}', "The earth takes its share. Always has.");

    // Dynamic descriptions
    filled = filled.replace('{crisisDescription}', this.getCrisisDescription(context));
    filled = filled.replace('{actionDescription}', this.getActionDescription(context));
    filled = filled.replace('{clueDescription}', this.getClueDescription(context));
    filled = filled.replace('{echoDescription}', this.getEchoDescription(context));
    filled = filled.replace('{eventDescription}', this.getEventDescription(context));
    filled = filled.replace('{npcReaction}', this.getNpcReaction(context, gameState));

    return filled;
  }

  getHumDescription(activity) {
    const level = activity || 0.2;
    if (level < 0.3) return 'barely perceptible';
    if (level < 0.5) return 'noticeable if you listen';
    if (level < 0.7) return 'impossible to ignore';
    return 'overwhelming';
  }

  getCanReveal(npc, gameState) {
    const gateContent = {
      edda: [
        "Hints about the shaft",
        "That something happened to the 23",
        "The hum is not natural",
        "Mara knows more than she says"
      ],
      jonas: [
        "He failed someone once",
        "The clinic holds memories",
        "He heard something he shouldn't have"
      ],
      mara: [
        "The settlement is fragile",
        "She doesn't trust Rask",
        "Resources are worse than she admits"
      ],
      rask: [
        "He's done terrible things",
        "Violence haunts him",
        "He watches more than he admits"
      ],
      kale: [
        "He mirrors others unconsciously",
        "He hears things sometimes",
        "He doesn't know who he is"
      ]
    };

    const gate = gameState.npcGates?.[npc] || 0;
    const content = gateContent[npc] || [];
    return content.slice(0, gate + 1).join(', ') || 'Nothing personal yet';
  }

  getCannotReveal(npc, gameState) {
    const gatedSecrets = {
      edda: "What the 23 actually saw, what's in the shaft, why the ground hums",
      jonas: "Who he failed and how, the voice he heard",
      mara: "Her brother's involvement, her role in the sealing",
      rask: "His specific violent past, who he lost",
      kale: "Why he mirrors, his connection to the hum"
    };

    return gatedSecrets[npc] || 'Core secrets';
  }

  getCrisisDescription(context) {
    const crisisTemplates = {
      jonas: "Jonas stands frozen outside the clinic. Someone inside needs help. He won't move.",
      rask: "Rask has a settler by the collar. His fist is raised. Something small set him off.",
      kale: "Kale is shifting between postures rapidly. Speaking in voices that aren't his.",
      mara: "Mara is pushing people too hard. Demanding more than they can give. Breaking.",
      edda: "Edda has stopped in the middle of the path. Her lips move but no sound comes."
    };

    return crisisTemplates[context.npc] || "Something is wrong. The moment hangs.";
  }

  getActionDescription(context) {
    const actionTemplates = {
      'fix_toy': "A child's broken toy. Something simple. Something that matters to someone small.",
      'tidy_clinic': "The clinic needs cleaning. Jonas won't do it himself. Too many memories in the dust.",
      'bring_herbs': "Edda needs herbs from beyond the perimeter. A small errand with quiet weight.",
      'share_food': "Kale is hungry but won't ask. Sharing costs something here.",
      'mend_something': "Something in the storehouse is broken. Mara won't admit she needs help."
    };

    return actionTemplates[context.action] || "A small kindness. Nothing more.";
  }

  getClueDescription(context) {
    const clueTemplates = {
      'markings': "Strange symbols scratched into the stone near the well. Old. Desperate.",
      'noise': "During the last tremor, something sounded different. Wrong frequency.",
      'inventory': "Items in the storehouse have moved. Or been moved. Someone is lying.",
      'behavior': "Kale said something yesterday. Something he couldn't have known."
    };

    return clueTemplates[context.subject] || "Something doesn't add up.";
  }

  getEchoDescription(context) {
    const echoTemplates = {
      'npc_phrase': "Kale repeats a phrase. Word for word. From a conversation he wasn't present for.",
      'npc_freeze': "Edda freezes mid-sentence. Her eyes go distant. When she returns, she doesn't remember.",
      'environment': "The tremor passes. Something has changed. Something small. Wrong.",
      'player_memory': "GHOST whispers something specific. Too specific. About a moment you never told anyone."
    };

    return echoTemplates[context.echoType] || "Something resonates. Something that shouldn't.";
  }

  getEventDescription(context) {
    const eventTemplates = {
      'heat_leak': "The sealed cover is warm. Not hot. Just... warm. In a way that shouldn't be possible.",
      'debris_shift': "The tremor dislodged something. Old metal. Writing you can almost read.",
      'kale_voice': "Kale stands near the dip. Listening. To something only he can hear.",
      'edda_collapse': "Edda collapses near the shaft. She's breathing. But her eyes see something else."
    };

    return eventTemplates[context.manifestation] || "The shaft makes itself known.";
  }

  getNpcReaction(context, gameState) {
    const npc = context.affectedNpc || context.npc;
    const stress = gameState.npcStress?.[npc] || 30;

    if (stress > 70) {
      return "They're barely holding on. Shaking. Words come in fragments.";
    } else if (stress > 50) {
      return "They're rattled. Trying to hide it. Failing.";
    } else {
      return "They're unsettled but composed. Watching you watch them.";
    }
  }

  getGuardrails(archetype) {
    return `
═══════════════════════════════════════
GUARDRAILS — DO NOT VIOLATE
═══════════════════════════════════════

FORBIDDEN:
${archetype.forbidden.map(f => `- ${f}`).join('\n')}

ALLOWED:
${archetype.allowed.map(a => `- ${a}`).join('\n')}

CRITICAL RULES:
- No outside factions or raiders
- No resource abundance solutions
- No premature lore reveals
- No heroic power fantasy
- No clean moral binaries
- No exposition monologues
- No tone-breaking language

The quest must feel like Ashfall: small, heavy, human, haunted.
`;
  }

  // Generate a complete quest prompt with all context
  generateCompleteQuestPrompt(archetype, context, gameState, npcCodex = null) {
    let prompt = this.generatePrompt(archetype, context, gameState);

    // Add NPC-specific context if available
    if (npcCodex && context.npc) {
      prompt += `

═══════════════════════════════════════
NPC CONTEXT: ${context.npc.toUpperCase()}
═══════════════════════════════════════

${this.getNpcContext(context.npc, npcCodex, gameState)}
`;
    }

    // Add voice alignment context
    if (gameState.voiceAlignment) {
      prompt += `

═══════════════════════════════════════
VOICE ALIGNMENT
═══════════════════════════════════════

Dominant Voice: ${gameState.voiceAlignment.dominant || 'BALANCED'}
LOGIC: ${gameState.voiceAlignment.LOGIC || 0}
INSTINCT: ${gameState.voiceAlignment.INSTINCT || 0}
EMPATHY: ${gameState.voiceAlignment.EMPATHY || 0}
GHOST: ${gameState.voiceAlignment.GHOST || 0}

Weight voice reactions accordingly.
`;
    }

    return prompt;
  }

  getNpcContext(npcId, codex, gameState) {
    // This would integrate with the existing NPC codex system
    const relationship = gameState.relationships?.[npcId] || 50;
    const stress = gameState.npcStress?.[npcId] || 30;
    const gate = gameState.npcGates?.[npcId] || 0;

    return `Relationship: ${relationship}
Stress Level: ${stress}
Current Arc Gate: ${gate}
Can Reveal: ${this.getCanReveal(npcId, gameState)}
Cannot Reveal: ${this.getCannotReveal(npcId, gameState)}`;
  }
}
