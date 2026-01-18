// src/systems/QuestArchetypes.js

/**
 * QUEST ARCHETYPE SYSTEM
 *
 * Provides templates for dynamically generating quests that:
 * - Stay within tone
 * - Respect arc gates
 * - Advance the narrative
 * - Don't break canon
 *
 * The LLM can instantiate these archetypes with specific
 * characters, locations, and circumstances.
 */

export class QuestArchetypeSystem {
  constructor() {
    this.archetypes = this.defineArchetypes();
    this.activeQuests = [];
    this.completedQuests = [];
  }

  defineArchetypes() {
    return {

      // ═══════════════════════════════════════
      // ARCHETYPE 1: THE INTERVENTION
      // ═══════════════════════════════════════

      intervention: {
        id: 'intervention',
        name: 'The Intervention',
        tagline: "Someone is about to break. Help or don't.",

        purpose: "Expose the player to an NPC's internal contradiction",
        emotionalPressure: 'high_intimacy_low_spectacle',

        validNpcs: ['jonas', 'rask', 'kale', 'mara', 'edda'],

        triggers: [
          { npc: 'jonas', condition: 'medical_emergency_nearby', scenario: 'refusing_to_treat' },
          { npc: 'rask', condition: 'settler_provocation', scenario: 'nearly_attacking' },
          { npc: 'kale', condition: 'identity_pressure', scenario: 'spiraling_mimicry' },
          { npc: 'mara', condition: 'resource_crisis', scenario: 'pushing_too_hard' },
          { npc: 'edda', condition: 'tremor_proximity', scenario: 'breaking_silence' }
        ],

        playerOutcomes: [
          { id: 'stabilize', effect: 'npc_stress_decrease', relationshipDelta: +10 },
          { id: 'escalate', effect: 'npc_crisis_deepen', relationshipDelta: -5 },
          { id: 'walk_away', effect: 'narrative_tension_increase', relationshipDelta: -15 }
        ],

        allowed: [
          'Emotional confrontation',
          'Reframing of guilt or fear',
          'Resource scarcity complicating things',
          'Voice reactions commenting on NPC state'
        ],

        forbidden: [
          'Resolving deep secrets',
          'Granting lore reveals beyond current Arc Gate',
          'Clean resolution without cost'
        ],

        promptTemplate: `
QUEST TYPE: Intervention
NPC IN CRISIS: {npc}
SCENARIO: {scenario}

The player encounters {npc} in a moment of crisis. Their internal contradiction is visible.

CRISIS DETAILS:
{crisisDescription}

PLAYER OPTIONS:
1. Attempt to stabilize (requires: patience, right words)
2. Push harder (risks: escalation, relationship damage)
3. Walk away (consequence: tension builds, guilt)

NPC BEHAVIOR:
- {npc} is at stress level {stressLevel}
- Their current Arc Gate is {gateLevel}
- They can reveal: {canReveal}
- They cannot reveal: {cannotReveal}

TONE: High intimacy, low spectacle. This is personal, not dramatic.
`
      },

      // ═══════════════════════════════════════
      // ARCHETYPE 2: THE SCARCITY DILEMMA
      // ═══════════════════════════════════════

      scarcity_dilemma: {
        id: 'scarcity_dilemma',
        name: 'The Scarcity Dilemma',
        tagline: "There isn't enough. Who suffers?",

        purpose: "Force moral ambiguity",
        emotionalPressure: 'ethical_weight',

        resources: ['food', 'medicine', 'water', 'tools', 'warmth'],

        npcPositions: {
          mara: { stance: 'strict_rationing', argument: "We ration or we die. All of us." },
          jonas: { stance: 'compassion', argument: "We can't let them suffer. There has to be another way." },
          rask: { stance: 'pragmatic_warning', argument: "Weakness gets noticed. By others." },
          kale: { stance: 'mirrors_player', argument: "What do you think we should do?" },
          edda: { stance: 'deeper_cost', argument: "The earth takes its share. Always has." }
        },

        playerOutcomes: [
          { id: 'choose_beneficiary', effect: 'relationship_shift_multiple', description: 'Someone benefits, someone suffers' },
          { id: 'choose_victim', effect: 'guilt_accumulation', description: 'Direct choice of who loses' },
          { id: 'delay', effect: 'consequence_escalation', description: 'Postpone decision, worsen outcome later' }
        ],

        allowed: [
          'Tough choices with no clean answer',
          'Relationship shifts based on alignment',
          'Resource tracking consequences',
          'NPC arguments reflecting their values'
        ],

        forbidden: [
          'Large-scale prosperity solutions',
          'Deus ex machina resource discovery',
          'Easy third options that satisfy everyone',
          'External trade or supply lines'
        ],

        promptTemplate: `
QUEST TYPE: Scarcity Dilemma
RESOURCE IN QUESTION: {resource}
SHORTAGE SEVERITY: {severity}

The settlement doesn't have enough {resource}. Someone will suffer.

NPC POSITIONS:
- MARA: "{maraArgument}"
- JONAS: "{jonasArgument}"
- RASK: "{raskArgument}"
- EDDA: "{eddaArgument}"
- KALE: Mirrors whoever the player seems to favor

PLAYER OPTIONS:
1. Side with Mara (strict rationing)
2. Side with Jonas (compassion)
3. Find middle ground (pleases no one fully)
4. Delay decision (consequences worsen)

THERE IS NO CLEAN ANSWER. The player must choose who suffers.
`
      },

      // ═══════════════════════════════════════
      // ARCHETYPE 3: THE CONFESSION QUEST
      // ═══════════════════════════════════════

      confession: {
        id: 'confession',
        name: 'The Confession Quest',
        tagline: "Someone carries a truth they cannot speak.",

        purpose: "Advance NPC arcs toward revelation gates",
        emotionalPressure: 'trust_building_trauma_adjacency',

        validNpcs: ['jonas', 'mara', 'edda'],

        confessionTypes: {
          jonas: { secret: 'the_incident', gate: 2, approach: 'gentle_patience' },
          mara: { secret: 'brother_involvement', gate: 3, approach: 'earned_respect' },
          edda: { secret: 'the_23', gate: 2, approach: 'shared_burden' }
        },

        playerOutcomes: [
          { id: 'coax_confession', effect: 'gate_progress', relationshipDelta: +15 },
          { id: 'fail_to_reach', effect: 'tension_maintained', relationshipDelta: 0 },
          { id: 'force_premature', effect: 'npc_collapse', relationshipDelta: -20, stressDelta: +30 }
        ],

        allowed: [
          'Emotional vulnerability',
          'Flashback-like metaphors',
          'Internal voice conflict',
          'Partial truths that hint at more',
          'Physical tells (shaking hands, averted eyes)'
        ],

        forbidden: [
          'Full revelation of Core Secret before Gate D',
          'Clean catharsis without ongoing weight',
          'NPC dumping exposition',
          'Resolving guilt completely'
        ],

        promptTemplate: `
QUEST TYPE: Confession
NPC: {npc}
SECRET CATEGORY: {secretCategory}
CURRENT GATE: {currentGate}
REQUIRED GATE FOR FULL TRUTH: {requiredGate}

{npc} is carrying something they cannot speak. The player senses it.

APPROACH THAT WORKS: {approach}
APPROACH THAT FAILS: Pressure, demands, moral absolutism

WHAT {npc} CAN REVEAL NOW:
{canReveal}

WHAT {npc} CANNOT REVEAL YET:
{cannotReveal}

If player is gentle and earns trust: Edge toward the next gate.
If player pushes too hard: NPC withdraws or collapses.

TONE: Trust-building, trauma-adjacent. The truth wants to emerge but fears the light.
`
      },

      // ═══════════════════════════════════════
      // ARCHETYPE 4: THE WATCHTOWER QUEST
      // ═══════════════════════════════════════

      watchtower: {
        id: 'watchtower',
        name: 'The Watchtower Quest',
        tagline: "Help guard the settlement — or interpret what's coming.",

        purpose: "Blend environmental tension with interpersonal conflict",
        emotionalPressure: 'suspense_quiet_dread',

        variants: [
          { initiator: 'mara', task: 'patrol_duty', tension: 'authority_test' },
          { initiator: 'rask', task: 'movement_warning', tension: 'trust_test' },
          { initiator: 'kale', task: 'impress_someone', tension: 'identity_test' }
        ],

        playerOutcomes: [
          { id: 'spot_anomaly', effect: 'curie_awareness_increase', description: 'Notice something others missed' },
          { id: 'misinterpret', effect: 'false_alarm_tension', description: 'Wrong conclusion, social cost' },
          { id: 'experience_tremor', effect: 'direct_curie_contact', description: 'Tremor event during watch' },
          { id: 'curie_influence', effect: 'ghost_voice_spike', description: 'Subtle wrongness creeps in' }
        ],

        allowed: [
          'Minor action (no combat)',
          'Heightened atmosphere',
          'Environmental anomalies',
          'NPC bonding during quiet moments',
          'Tremor events'
        ],

        forbidden: [
          'External raiders',
          'Large-scale combat',
          'Clear external threats',
          'Action-movie moments'
        ],

        promptTemplate: `
QUEST TYPE: Watchtower
VARIANT: {variant}
ASSIGNED BY: {initiator}

The player takes a watch shift. The wasteland is quiet. Too quiet.

ATMOSPHERE:
- Time of day: {timeOfDay}
- Weather: {weather}
- Hum intensity: {humIntensity}

POTENTIAL EVENTS:
1. Nothing happens (tension of waiting)
2. Minor anomaly (something moves, or doesn't)
3. Tremor event (Curie-Δ stirs)
4. NPC joins watch (conversation opportunity)

TONE: Suspense, quiet dread. The danger is beneath, not beyond.
`
      },

      // ═══════════════════════════════════════
      // ARCHETYPE 5: THE MEMORY ECHO
      // ═══════════════════════════════════════

      memory_echo: {
        id: 'memory_echo',
        name: 'The Memory Echo Quest',
        tagline: "Something triggers a resonance — in an NPC or the ground itself.",

        purpose: "Introduce Curie-Δ influence safely",
        emotionalPressure: 'uncanny_tension',

        echoTypes: [
          { type: 'npc_phrase', target: 'kale', description: 'Repeats a phrase he shouldn\'t know' },
          { type: 'npc_freeze', target: 'edda', description: 'Freezes mid-sentence, eyes distant' },
          { type: 'environment', target: null, description: 'A tremor alters something subtly' },
          { type: 'player_memory', target: 'player', description: 'GHOST speaks something too specific' }
        ],

        playerOutcomes: [
          { id: 'reassure', effect: 'npc_stabilize', description: 'Calm the affected NPC' },
          { id: 'question', effect: 'awareness_increase', description: 'Dig into the anomaly' },
          { id: 'ignore', effect: 'pressure_delay', description: 'Pretend it didn\'t happen (it did)' }
        ],

        allowed: [
          'Fragmented voice lines',
          'Environmental storytelling',
          'Uncanny valley moments',
          'GHOST voice intensification',
          'NPCs noticing wrongness'
        ],

        forbidden: [
          'Direct Curie-Δ communication',
          'Clear explanation of what happened',
          'NPC understanding what they said/did'
        ],

        promptTemplate: `
QUEST TYPE: Memory Echo
ECHO TYPE: {echoType}
TARGET: {target}

Something resonates. Something that shouldn't.

EVENT:
{echoDescription}

NPC REACTION (if applicable):
- They don't remember saying it
- They're frightened but can't explain why
- They deflect: "I'm fine. It's fine. The dust, maybe."

PLAYER OPTIONS:
1. Comfort and move on (delay, but kindness noted)
2. Press for explanation (yields nothing, increases unease)
3. Note it silently (LOGIC/GHOST appreciate this)

VOICE REACTIONS:
- LOGIC: "Anomaly logged. Source: unknown."
- INSTINCT: "Wrong. That was wrong."
- EMPATHY: "They're scared. They don't know why."
- GHOST: "The echo knows you heard it."

TONE: Uncanny. Something is leaking through.
`
      },

      // ═══════════════════════════════════════
      // ARCHETYPE 6: THE SMALL MERCY
      // ═══════════════════════════════════════

      small_mercy: {
        id: 'small_mercy',
        name: 'The Small Mercy',
        tagline: "Do something human in a world that punishes softness.",

        purpose: "Deepen player identity and NPC bonds",
        emotionalPressure: 'gentle_necessary_humanity',

        mercyTypes: [
          { action: 'fix_toy', target: 'children', npcBenefit: 'rask' },
          { action: 'tidy_clinic', target: 'clinic', npcBenefit: 'jonas' },
          { action: 'bring_herbs', target: 'perimeter', npcBenefit: 'edda' },
          { action: 'share_food', target: 'market', npcBenefit: 'kale' },
          { action: 'mend_something', target: 'storehouse', npcBenefit: 'mara' }
        ],

        playerOutcomes: [
          { id: 'complete', effect: 'trust_gain', relationshipDelta: +10 },
          { id: 'witnessed', effect: 'reputation_shift', description: 'Other NPCs notice kindness' },
          { id: 'trigger_arc', effect: 'side_conversation', description: 'Opens emotional dialogue' }
        ],

        allowed: [
          'Warmth under restraint',
          'Quiet moments of connection',
          'NPCs being surprised by kindness',
          'Small tangible improvements'
        ],

        forbidden: [
          'Large-scale fixes',
          'Breaking tone with sentimentality',
          'Solving systemic problems',
          'Earning permanent safety'
        ],

        promptTemplate: `
QUEST TYPE: Small Mercy
ACTION: {action}
BENEFICIARY: {npcBenefit}

A small kindness. Nothing that will save the world. Just something human.

THE ACT:
{actionDescription}

NPC REACTION:
- Surprise (kindness is rare here)
- Gratitude (restrained, Ashfall-appropriate)
- Maybe: a moment of openness

VOICE REACTIONS:
- EMPATHY: "This matters. Even if nothing else does."
- LOGIC: "Resource expenditure: minimal. Social benefit: notable."
- INSTINCT: "Soft moves get you killed. ...but not this one."
- GHOST: "You did this before. Or will. The pattern remembers kindness."

TONE: Gentle but not saccharine. Warmth exists here. It just costs something.
`
      },

      // ═══════════════════════════════════════
      // ARCHETYPE 7: THE INVESTIGATION
      // ═══════════════════════════════════════

      investigation: {
        id: 'investigation',
        name: 'The Investigation',
        tagline: "Something is wrong. Find out what — or whether you should.",

        purpose: "Drive curiosity and tension",
        emotionalPressure: 'mystery_under_constraint',

        investigationTypes: [
          { subject: 'markings', location: 'well', hint: 'Strange symbols scratched into stone' },
          { subject: 'noise', location: 'shaft_area', hint: 'Sound during tremor that shouldn\'t exist' },
          { subject: 'inventory', location: 'storehouse', hint: 'Something is missing—or moved' },
          { subject: 'behavior', location: 'any', hint: 'Kale acting strangely' }
        ],

        playerOutcomes: [
          { id: 'correct_interpretation', effect: 'awareness_gain', description: 'Piece together truth' },
          { id: 'misinterpretation', effect: 'false_conclusion', description: 'Wrong answer, consequences' },
          { id: 'emotional_fallout', effect: 'npc_reaction', description: 'Investigation hurts someone' }
        ],

        allowed: [
          'Player inference',
          'NPC contradiction',
          'Partial evidence',
          'Red herrings (used sparingly)',
          'Clues that only make sense later'
        ],

        forbidden: [
          'Full truth reveals',
          'Clear answers',
          'Evidence that proves everything',
          'NPCs explaining the mystery'
        ],

        promptTemplate: `
QUEST TYPE: Investigation
SUBJECT: {subject}
LOCATION: {location}

Something is wrong. The player wants to know what.

THE CLUE:
{clueDescription}

WHAT THE PLAYER CAN LEARN:
- Partial truth
- More questions
- NPC reactions that reveal character

WHAT THE PLAYER CANNOT LEARN:
- The full Core Secret
- Clean explanation
- Who/what is responsible (yet)

TONE: Mystery under constraint. Answers lead to more questions.
`
      },

      // ═══════════════════════════════════════
      // ARCHETYPE 8: THE SHAFT'S SHADOW
      // ═══════════════════════════════════════

      shafts_shadow: {
        id: 'shafts_shadow',
        name: 'The Shaft\'s Shadow',
        tagline: "Proximity to the sealed place forces escalation.",

        purpose: "Move the story toward Act III",
        emotionalPressure: 'atmospheric_escalation',

        manifestations: [
          { type: 'heat_leak', description: 'Something warm radiates from the sealed cover' },
          { type: 'debris_shift', description: 'Tremor dislodges debris, revealing something' },
          { type: 'kale_voice', description: 'Kale hears a voice near the dip' },
          { type: 'edda_collapse', description: 'Edda collapses near the shaft' }
        ],

        playerOutcomes: [
          { id: 'comfort', effect: 'npc_support', description: 'Help whoever is affected' },
          { id: 'investigate', effect: 'awareness_spike', description: 'Move closer to truth' },
          { id: 'deny', effect: 'tension_delay', description: 'Pretend it\'s nothing' },
          { id: 'fear', effect: 'instinct_alignment', description: 'Retreat, but remember' }
        ],

        allowed: [
          'Symbolic proximity to truth',
          'Curie-Δ influence intensification',
          'NPC breakdowns near the shaft',
          'Environmental horror (subtle)',
          'GHOST voice dominance'
        ],

        forbidden: [
          'Opening the shaft before Act III trigger',
          'Direct Curie-Δ dialogue',
          'Clear explanation of what\'s down there',
          'Player entering the shaft'
        ],

        promptTemplate: `
QUEST TYPE: Shaft's Shadow
MANIFESTATION: {manifestation}
ACT: {currentAct}

The sealed place makes itself known. The truth presses upward.

EVENT:
{eventDescription}

NPC MOST AFFECTED: {affectedNpc}
THEIR REACTION:
{npcReaction}

CURIE-Δ INFLUENCE LEVEL: {curieActivity}
HUM INTENSITY: {humIntensity}

PLAYER OPTIONS:
1. Comfort the affected
2. Investigate the source
3. Deny and distance
4. Give in to fear

The shaft cannot open yet. But it can be felt.

TONE: The truth is patient. It has waited decades. It can wait a little longer.
`
      }
    };
  }

  // ═══════════════════════════════════════
  // QUEST GENERATION
  // ═══════════════════════════════════════

  generateQuest(archetypeId, context) {
    const archetype = this.archetypes[archetypeId];
    if (!archetype) return null;

    // Validate against forbidden list
    if (!this.validateContext(archetype, context)) {
      console.warn(`Quest context violates archetype rules: ${archetypeId}`);
      return null;
    }

    // Generate quest instance
    const quest = {
      id: `${archetypeId}_${Date.now()}`,
      archetype: archetypeId,
      name: archetype.name,
      tagline: archetype.tagline,
      context: context,
      state: 'active',
      outcomes: [],
      startTime: Date.now()
    };

    // Generate prompt for LLM
    quest.prompt = this.fillPromptTemplate(archetype.promptTemplate, context);

    this.activeQuests.push(quest);
    return quest;
  }

  validateContext(archetype, context) {
    // Check against forbidden variations
    for (const forbidden of archetype.forbidden) {
      if (context.violations?.includes(forbidden)) {
        return false;
      }
    }

    // Check NPC arc gates if confession quest
    if (archetype.id === 'confession') {
      const npcGate = context.npcCurrentGate || 0;
      const requiredGate = archetype.confessionTypes[context.npc]?.gate || 0;

      if (context.attemptFullReveal && npcGate < requiredGate) {
        return false; // Can't reveal yet
      }
    }

    return true;
  }

  fillPromptTemplate(template, context) {
    let filled = template;

    for (const [key, value] of Object.entries(context)) {
      const placeholder = `{${key}}`;
      filled = filled.replace(new RegExp(placeholder, 'g'), value);
    }

    return filled;
  }

  // ═══════════════════════════════════════
  // QUEST COMPLETION
  // ═══════════════════════════════════════

  completeQuest(questId, outcomeId) {
    const questIndex = this.activeQuests.findIndex(q => q.id === questId);
    if (questIndex === -1) return null;

    const quest = this.activeQuests[questIndex];
    const archetype = this.archetypes[quest.archetype];
    const outcome = archetype.playerOutcomes.find(o => o.id === outcomeId);

    if (!outcome) return null;

    quest.state = 'completed';
    quest.outcome = outcome;
    quest.endTime = Date.now();

    // Move to completed
    this.activeQuests.splice(questIndex, 1);
    this.completedQuests.push(quest);

    return {
      quest: quest,
      effects: this.calculateEffects(outcome, quest.context)
    };
  }

  calculateEffects(outcome, context) {
    const effects = {
      relationshipChanges: {},
      flagsToSet: [],
      tensionDelta: 0,
      voiceScoreChanges: {},
      narrativeBeat: null
    };

    // Relationship changes
    if (outcome.relationshipDelta && context.npc) {
      effects.relationshipChanges[context.npc] = outcome.relationshipDelta;
    }

    // Tension changes
    if (outcome.effect === 'narrative_tension_increase') {
      effects.tensionDelta = 10;
    }

    // Gate progress
    if (outcome.effect === 'gate_progress' && context.npc) {
      effects.flagsToSet.push(`${context.npc}_gate_progress`);
    }

    return effects;
  }

  // ═══════════════════════════════════════
  // QUEST QUERIES
  // ═══════════════════════════════════════

  getArchetype(archetypeId) {
    return this.archetypes[archetypeId] || null;
  }

  getActiveQuests() {
    return [...this.activeQuests];
  }

  getCompletedQuests() {
    return [...this.completedQuests];
  }

  getQuestById(questId) {
    return this.activeQuests.find(q => q.id === questId) ||
           this.completedQuests.find(q => q.id === questId) ||
           null;
  }

  // Get available archetypes based on game state
  getAvailableArchetypes(gameState) {
    const available = [];

    for (const [id, archetype] of Object.entries(this.archetypes)) {
      // Check act requirements
      if (id === 'shafts_shadow' && gameState.currentAct < 2) {
        continue;
      }

      // Check if any valid NPCs exist for NPC-specific archetypes
      if (archetype.validNpcs) {
        const hasValidNpc = archetype.validNpcs.some(npc =>
          !gameState.disabledNpcs?.includes(npc)
        );
        if (!hasValidNpc) continue;
      }

      available.push({
        id,
        name: archetype.name,
        tagline: archetype.tagline,
        purpose: archetype.purpose
      });
    }

    return available;
  }

  // ═══════════════════════════════════════
  // SERIALIZATION
  // ═══════════════════════════════════════

  serialize() {
    return JSON.stringify({
      activeQuests: this.activeQuests,
      completedQuests: this.completedQuests
    });
  }

  deserialize(json) {
    const data = JSON.parse(json);
    this.activeQuests = data.activeQuests || [];
    this.completedQuests = data.completedQuests || [];
  }
}
