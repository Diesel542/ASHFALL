# ASHFALL: Quest Archetype Implementation

## Overview

This document implements **narrative-safe quest structures** that Ashfall's dynamic system can generate, adapt, or extend without breaking tone, canon, or emotional coherence.

These are not specific quests. They are **archetypes** — modular skeletons that the LLM can instantiate while staying within bounds.

**Core principle:** Ashfall is a world of small stakes, heavy truths, and emotional gravity. Quests must serve that.

---

## 1. Quest Archetype System

```javascript
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
}
```

---

## 2. Quest Validator

Ensures quests never break the rules.

```javascript
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
      if (questText.includes(term) && !gameState.flags.has(requirement.requiredFlag)) {
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
}
```

---

## 3. Quest Requirement Checker

Ensures quest requirements are met.

```javascript
// src/systems/QuestRequirements.js

export const QUEST_REQUIREMENTS = {
  
  // What all quests must do
  mustDo: [
    'Advance NPC arcs OR internal voice arcs',
    'Deepen tension OR reveal fractures',
    'Reflect scarcity, guilt, memory, or confession',
    'Move player toward an ending path'
  ],

  // Archetype-specific requirements
  archetypeRequirements: {
    intervention: {
      requires: ['npc_stress_visible', 'contradiction_exposed'],
      rewards: ['relationship_shift', 'npc_arc_progress'],
      risks: ['relationship_damage', 'escalation']
    },
    scarcity_dilemma: {
      requires: ['resource_shortage', 'competing_needs'],
      rewards: ['moral_weight', 'alignment_clarity'],
      risks: ['multiple_relationships_damaged']
    },
    confession: {
      requires: ['npc_trust_threshold', 'appropriate_gate'],
      rewards: ['gate_progress', 'deep_trust'],
      risks: ['premature_collapse', 'secret_leakage']
    },
    watchtower: {
      requires: ['assignment_reason', 'atmospheric_conditions'],
      rewards: ['curie_awareness', 'npc_bonding'],
      risks: ['false_alarms', 'missed_signals']
    },
    memory_echo: {
      requires: ['curie_activity_threshold', 'vulnerable_npc'],
      rewards: ['mystery_deepening', 'ghost_connection'],
      risks: ['player_confusion', 'npc_destabilization']
    },
    small_mercy: {
      requires: ['opportunity_present', 'resource_cost_acceptable'],
      rewards: ['trust_gain', 'tone_balance'],
      risks: ['scarcity_impact', 'being_noticed']
    },
    investigation: {
      requires: ['clue_exists', 'player_curiosity'],
      rewards: ['awareness_increase', 'tension_building'],
      risks: ['false_conclusions', 'npc_suspicion']
    },
    shafts_shadow: {
      requires: ['act_appropriate', 'curie_active'],
      rewards: ['act_progression', 'revelation_proximity'],
      risks: ['premature_opening', 'npc_breakdown']
    }
  },

  // Check if quest meets requirements
  check(archetype, context, gameState) {
    const reqs = this.archetypeRequirements[archetype];
    if (!reqs) return { met: true, missing: [] };

    const missing = [];

    for (const req of reqs.requires) {
      if (!this.checkRequirement(req, context, gameState)) {
        missing.push(req);
      }
    }

    return {
      met: missing.length === 0,
      missing: missing
    };
  },

  checkRequirement(requirement, context, gameState) {
    const checks = {
      'npc_stress_visible': () => context.npc && gameState.npcStress[context.npc] > 50,
      'contradiction_exposed': () => true, // Story always has contradictions
      'resource_shortage': () => gameState.resources.any < 50,
      'competing_needs': () => true, // Always true in Ashfall
      'npc_trust_threshold': () => gameState.relationships[context.npc] > 40,
      'appropriate_gate': () => gameState.npcGates[context.npc] >= (context.requiredGate || 0),
      'assignment_reason': () => context.initiator && context.task,
      'atmospheric_conditions': () => true,
      'curie_activity_threshold': () => gameState.curieActivity > 0.3,
      'vulnerable_npc': () => context.npc,
      'opportunity_present': () => context.action,
      'resource_cost_acceptable': () => true, // Small mercies have minimal cost
      'clue_exists': () => context.subject,
      'player_curiosity': () => true, // Assumed
      'act_appropriate': () => gameState.currentAct >= 2,
      'curie_active': () => gameState.curieActivity > 0.4
    };

    const check = checks[requirement];
    return check ? check() : true;
  }
};
```

---

## 4. Quest Prompt Generator

Creates prompts for the LLM to generate quest content.

```javascript
// src/systems/QuestPromptGenerator.js

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
      '{weather}': gameState.weather || 'stillness'
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      filled = filled.replace(new RegExp(placeholder, 'g'), value);
    }

    // NPC-specific content
    if (context.npc) {
      filled = filled.replace('{canReveal}', this.getCanReveal(context.npc, gameState));
      filled = filled.replace('{cannotReveal}', this.getCannotReveal(context.npc, gameState));
    }

    return filled;
  }

  getHumDescription(activity) {
    if (activity < 0.3) return 'barely perceptible';
    if (activity < 0.5) return 'noticeable if you listen';
    if (activity < 0.7) return 'impossible to ignore';
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
      ]
    };

    const gate = gameState.npcGates?.[npc] || 0;
    const content = gateContent[npc] || [];
    return content.slice(0, gate + 1).join(', ') || 'Nothing personal';
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
}
```

---

## Summary

The Quest Archetype implementation includes:

| System | Purpose |
|--------|---------|
| **QuestArchetypeSystem** | Eight modular quest templates |
| **QuestValidator** | Enforces fundamental rules |
| **QuestRequirements** | Checks preconditions |
| **QuestPromptGenerator** | Creates LLM prompts with guardrails |

**The Eight Archetypes:**

| Archetype | Tagline | Pressure |
|-----------|---------|----------|
| **Intervention** | "Someone is about to break." | High intimacy |
| **Scarcity Dilemma** | "There isn't enough." | Ethical weight |
| **Confession** | "Someone carries a truth." | Trust-building |
| **Watchtower** | "Guard the settlement." | Quiet dread |
| **Memory Echo** | "Something triggers resonance." | Uncanny tension |
| **Small Mercy** | "Do something human." | Gentle humanity |
| **Investigation** | "Something is wrong." | Mystery |
| **Shaft's Shadow** | "The sealed place calls." | Escalation |

**What Quests Must Never Do:**

1. Introduce outside factions
2. Break scarcity dynamics
3. Solve systemic problems cleanly
4. Reveal major lore before its gate
5. Allow heroic power fantasies
6. Contradict the Tone Bible
7. Turn NPCs into exposition machines
8. Create binary morality

---

*"Ashfall is a world of small stakes, heavy truths, and emotional gravity."*

*— The shape of every story that can be told here*
