// ASHFALL - AgentRunner
// Orchestrates LLM calls, assembles context, validates responses

import { createAgentsSync, hasAgent } from '../agents/index.js';
import { VoiceReactor } from './VoiceReactor.js';
import { PlayerProfile } from './PlayerProfile.js';
import { ToneValidator } from './ToneValidator.js';
import { WeatherSystem } from './WeatherSystem.js';
import { EnvironmentalText } from './EnvironmentalText.js';
import { LocationContext } from './LocationContext.js';
import { NavigationalSemantics } from './NavigationalSemantics.js';

// Curie-Δ systems
import { CurieEntity } from '../entities/Curie.js';
import { HumSystem } from './HumSystem.js';
import { TremorSystem } from './TremorSystem.js';
import { GhostOverride } from './GhostOverride.js';
import { NpcResonance } from './NpcResonance.js';
import { EndgameCalculator } from './EndgameCalculator.js';
import { CURIE_GUARDRAILS } from '../config/curieGuardrails.js';

// Relationship systems
import { RelationshipManager } from './RelationshipManager.js';
import { CrossReferenceDialogue } from './CrossReferenceDialogue.js';

export class AgentRunner {
  constructor() {
    this.agents = createAgentsSync();
    this.voiceReactor = new VoiceReactor();
    this.playerProfile = new PlayerProfile();
    this.toneValidator = new ToneValidator();
    this.weatherSystem = new WeatherSystem();
    this.environmentalText = new EnvironmentalText();
    this.locationContext = new LocationContext();
    this.navigationSemantics = new NavigationalSemantics();
    this.apiEndpoint = 'https://api.anthropic.com/v1/messages';

    // Initialize Curie-Δ systems
    this.curie = new CurieEntity();
    this.humSystem = new HumSystem(this.curie);
    this.tremorSystem = new TremorSystem(this.curie);
    this.ghostOverride = new GhostOverride(this.curie);
    this.npcResonance = new NpcResonance(this.curie);
    this.endgameCalculator = new EndgameCalculator(this.curie);

    // Initialize relationship systems
    this.relationshipManager = new RelationshipManager();
    this.crossReferenceDialogue = new CrossReferenceDialogue(this.relationshipManager);

    // Pass location context to voice reactor for location-based voice bonuses
    this.voiceReactor.setLocationContext(this.locationContext);

    // Pass location and relationship context to all agents
    for (const agent of Object.values(this.agents)) {
      agent.setLocationContext(this.locationContext);
      agent.setRelationshipSystems(this.relationshipManager, this.crossReferenceDialogue);
    }

    // Make systems globally accessible
    if (window.ASHFALL) {
      window.ASHFALL.playerProfile = this.playerProfile.getProfile();
      window.ASHFALL.currentLocation = this.locationContext.currentLocation;
      window.ASHFALL.curie = this.curie.getStateSummary();
      window.ASHFALL.relationshipManager = this.relationshipManager;
      window.ASHFALL.crossReferenceDialogue = this.crossReferenceDialogue;
    }
  }

  // Set the current location (affects all subsequent conversations)
  setLocation(locationId) {
    const success = this.locationContext.setLocation(locationId);
    if (success && window.ASHFALL) {
      window.ASHFALL.currentLocation = locationId;
    }
    return success;
  }

  // Get current location data
  getCurrentLocation() {
    return this.locationContext.getCurrentLocation();
  }

  // Get all available locations
  getAllLocations() {
    return this.locationContext.getAllLocationIds();
  }

  // Get directions from current location to another
  getDirectionsTo(toLocation) {
    const fromLocation = this.locationContext.currentLocation;
    return this.navigationSemantics.getDirections(fromLocation, toLocation);
  }

  // Get NPC-flavored directions
  getNpcDirections(npcId, toLocation) {
    const fromLocation = this.locationContext.currentLocation;
    return this.navigationSemantics.generateNpcDirections(fromLocation, toLocation, npcId);
  }

  // Get a contextual landmark reference
  getLandmarkReference() {
    return this.navigationSemantics.getLandmarkReference();
  }

  // Get agent for an NPC
  getAgent(npcId) {
    return this.agents[npcId] || null;
  }

  // Check if we can use the agent system for this NPC
  canUseAgent(npcId) {
    return hasAgent(npcId) && this.hasApiKey();
  }

  hasApiKey() {
    return !!(
      window.ASHFALL_CONFIG?.apiKey ||
      localStorage.getItem('anthropic_api_key')
    );
  }

  getApiKey() {
    return (
      window.ASHFALL_CONFIG?.apiKey ||
      localStorage.getItem('anthropic_api_key')
    );
  }

  // Main conversation method
  async runConversation(npcId, playerInput, isOpening = false) {
    const agent = this.getAgent(npcId);
    if (!agent) {
      console.warn(`No agent found for NPC: ${npcId}`);
      return this.getFallbackResponse(npcId);
    }

    const flags = window.ASHFALL.flags;

    // Build the appropriate prompt
    const prompt = isOpening
      ? agent.getOpeningPrompt(flags)
      : agent.buildFullPrompt(playerInput, flags);

    try {
      // Call LLM API
      const response = await this.callLLM(prompt);

      // TONE VALIDATION - Check and auto-correct dialogue
      const toneCheck = this.toneValidator.validate(response, npcId);
      if (!toneCheck.valid || toneCheck.issues.length > 0) {
        console.warn('Tone issues detected:', toneCheck.issues);
      }
      // Use tone-corrected dialogue
      response.dialogue = toneCheck.dialogue;

      // NAVIGATION CORRECTION - Replace compass directions with landmarks
      if (this.navigationSemantics.containsForbiddenNavigation(response.dialogue)) {
        response.dialogue = this.navigationSemantics.correctNavigationLanguage(response.dialogue);
      }

      // CURIE GUARDRAILS - Ensure secrets stay gated
      const guardrailCheck = CURIE_GUARDRAILS.validate(response.dialogue, flags);
      if (!guardrailCheck.valid) {
        console.warn('Curie guardrail violations:', guardrailCheck.violations);
        response.dialogue = CURIE_GUARDRAILS.autoCorrect(response.dialogue, flags);
      }

      // NPC-specific voice check
      const voiceCheck = this.toneValidator.validateNpcVoice(response.dialogue, npcId);
      if (!voiceCheck.valid) {
        console.warn('NPC voice issues:', voiceCheck.issues);
      }

      // Validate response structure
      const validated = this.validateResponse(response, agent, flags);

      // Update agent state
      agent.updateStress(validated.stress_delta);

      // Only add to history if this wasn't an opening
      if (!isOpening && playerInput) {
        agent.addToHistory('player', playerInput);
      }
      agent.addToHistory('npc', validated.dialogue);

      // Update game state
      this.applyGameStateChanges(validated, npcId);

      // Record player choice for Kale's mirroring system
      if (playerInput) {
        this.playerProfile.recordChoice({
          text: playerInput,
          npc: npcId,
          weights: {} // Will be updated when player selects a choice with weights
        });
        window.ASHFALL.playerProfile = this.playerProfile.getProfile();
      }

      // Update weather based on conversation events
      this.updateWeatherFromConversation(validated, npcId);

      // UPDATE CURIE STATE based on conversation
      this.updateCurieFromConversation(validated, npcId);

      // Get voice reactions using the agent's hooks
      let voiceReactions = await this.voiceReactor.getReactions(
        agent,
        validated.dialogue,
        {
          npcStress: agent.currentStress,
          relationship: agent.getRelationship()
        },
        flags
      );

      // Check for Curie-influenced GHOST override
      const ghostOverrideLine = this.checkGhostOverride(voiceReactions);
      if (ghostOverrideLine) {
        // Replace or add Curie-influenced GHOST line
        voiceReactions = voiceReactions.filter(v => v.voice !== 'GHOST');
        voiceReactions.push(ghostOverrideLine);
      }

      // Check for NPC resonance effects
      const resonanceReaction = this.npcResonance.getInstinctiveReaction(npcId);

      // Check for tremors
      const tremor = this.tremorSystem.update(
        {
          inDialogue: true,
          dialogueEmotional: Math.abs(validated.relationship_delta) > 3,
          flags: flags,
          playerLocation: this.locationContext.currentLocation,
          voiceConflict: this.calculateVoiceConflict(),
          currentNpc: npcId
        },
        Date.now()
      );

      // Add ambient text based on weather, location, or hum (30% chance)
      let ambientText = null;
      if (Math.random() < 0.3) {
        const humText = this.humSystem.getAmbientText();
        const rand = Math.random();
        if (rand < 0.33 && humText) {
          ambientText = humText;
        } else if (rand < 0.66) {
          ambientText = this.weatherSystem.getAmbientText();
        } else {
          ambientText = this.locationContext.getAmbientDetail();
        }
      }

      // Get location-specific data for response
      const currentLocation = this.getCurrentLocation();

      // Build response with Curie data
      const result = {
        dialogue: validated.dialogue,
        choices: validated.player_choices,
        voiceInterrupts: voiceReactions,
        ambientText: ambientText,
        weather: this.weatherSystem.getCurrentWeather(),
        location: {
          id: this.locationContext.currentLocation,
          name: currentLocation.name,
          emotionalEffect: currentLocation.emotionalField.effect
        },
        internal_state: validated.internal_state,
        curie: this.curie.getStateSummary(),
        endgamePath: this.endgameCalculator.calculatePath({
          voiceBalances: window.ASHFALL?.player?.skills,
          flags: flags,
          relationships: window.ASHFALL?.relationships
        }).leading,
        success: true
      };

      // Add resonance reaction if present
      if (resonanceReaction) {
        result.resonanceEffect = resonanceReaction;
      }

      // Add tremor if one occurred
      if (tremor) {
        result.tremor = tremor;
        if (tremor.setFlag) {
          window.ASHFALL?.setFlag(tremor.setFlag);
        }
      }

      // Update global Curie state
      if (window.ASHFALL) {
        window.ASHFALL.curie = this.curie.getStateSummary();
      }

      return result;
    } catch (error) {
      console.error('Agent conversation failed:', error);
      return this.getFallbackResponse(npcId);
    }
  }

  async callLLM(prompt) {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      throw new Error('No API key configured');
    }

    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      throw new Error(`Failed to parse JSON: ${e.message}`);
    }
  }

  validateResponse(response, agent, flags) {
    // Ensure required fields exist with sensible defaults
    const validated = {
      dialogue: response.dialogue || '...',
      internal_state: response.internal_state || 'guarded',
      stress_delta: this.clamp(response.stress_delta || 0, -10, 10),
      relationship_delta: this.clamp(response.relationship_delta || 0, -10, 10),
      flags_to_set: Array.isArray(response.flags_to_set) ? response.flags_to_set : [],
      player_choices: Array.isArray(response.player_choices)
        ? response.player_choices
        : this.getDefaultChoices(agent.codex.name)
    };

    // Validate choices format
    validated.player_choices = validated.player_choices.map(choice => ({
      text: choice.text || 'Continue',
      type: choice.type || 'neutral',
      skill_hint: choice.skill_hint || null
    }));

    // Ensure there's always a leave option
    const hasLeave = validated.player_choices.some(
      c => c.text === '[Leave]' || c.type === 'withdrawal'
    );
    if (!hasLeave) {
      validated.player_choices.push({
        text: '[Leave]',
        type: 'withdrawal',
        skill_hint: null
      });
    }

    // Check for forbidden content (basic implementation)
    const forbidden = agent.getForbiddenTopics(flags);
    for (const topic of forbidden) {
      const keywords = topic.toLowerCase().split(' ').filter(w => w.length > 4);
      for (const keyword of keywords) {
        if (validated.dialogue.toLowerCase().includes(keyword)) {
          console.warn(`Potential forbidden topic breach detected: "${topic}"`);
          break;
        }
      }
    }

    return validated;
  }

  applyGameStateChanges(response, npcId) {
    // Apply relationship change
    if (response.relationship_delta !== 0) {
      window.ASHFALL.adjustRelationship(npcId, response.relationship_delta);
    }

    // Set flags and check for relationship events
    for (const flag of response.flags_to_set) {
      if (typeof flag === 'string' && flag.length > 0) {
        window.ASHFALL.setFlag(flag);

        // Check if this flag triggers any NPC-to-NPC relationship events
        this.checkRelationshipEventTrigger(flag, npcId);
      }
    }
  }

  // Check if a flag triggers NPC-to-NPC relationship shifts
  checkRelationshipEventTrigger(flag, currentNpc) {
    // Map of flags to relationship events
    const flagEventMap = {
      'jonas_treated_patient': 'jonas_healed_someone',
      'jonas_healed': 'jonas_healed_someone',
      'rask_violence': 'rask_violence_triggered',
      'rask_attacked': 'rask_violence_triggered',
      'rask_protected': 'rask_protected_settlement',
      'mara_secret_revealed': 'mara_secret_exposed',
      'mara_lie_exposed': 'mara_secret_exposed',
      'edda_truth': 'edda_spoke_truth',
      'edda_revealed': 'edda_spoke_truth',
      'kale_identity_found': 'kale_found_identity',
      'kale_remembered': 'kale_found_identity',
      'shaft_discussed': 'shaft_mentioned_in_conversation',
      'shaft_singing': 'shaft_mentioned_in_conversation',
      'shared_secret': 'shared_secret_revealed',
      'betrayal_discovered': 'betrayal_discovered'
    };

    const eventName = flagEventMap[flag];
    if (eventName) {
      this.applyRelationshipEvent(eventName);
    }
  }

  // Update weather based on conversation events
  updateWeatherFromConversation(response, npcId) {
    const recentEvents = [];

    // Detect conversation events that affect weather
    if (response.flags_to_set?.some(f =>
        f.includes('shaft') || f.includes('singing') || f.includes('below'))) {
      recentEvents.push('shaft_discussed');
    }

    if (response.dialogue?.toLowerCase().includes('shaft') ||
        response.dialogue?.toLowerCase().includes('singing') ||
        response.dialogue?.toLowerCase().includes('below')) {
      recentEvents.push('shaft_discussed');
    }

    if (response.relationship_delta < -5) {
      recentEvents.push('confrontation');
    }

    if (response.internal_state?.includes('deflect') ||
        response.internal_state?.includes('hiding') ||
        response.internal_state?.includes('guarded')) {
      recentEvents.push('npc_deflected');
    }

    if (response.internal_state?.includes('partial') ||
        response.internal_state?.includes('hint')) {
      recentEvents.push('partial_truth_told');
    }

    // Update weather system
    this.weatherSystem.updateWeather(
      window.ASHFALL.flags,
      window.ASHFALL.relationships,
      recentEvents
    );
  }

  // Get current weather description
  getWeatherDescription() {
    return this.weatherSystem.getCurrentDescription();
  }

  // Get environmental text generator for items/locations
  getEnvironmentalText() {
    return this.environmentalText;
  }

  // Record a player choice with weights for the profile system
  recordPlayerChoice(choice) {
    this.playerProfile.recordChoice(choice);
    window.ASHFALL.playerProfile = this.playerProfile.getProfile();
  }

  getDefaultChoices(npcName) {
    return [
      { text: 'Tell me more.', type: 'gentle', skill_hint: null },
      { text: 'I should go.', type: 'withdrawal', skill_hint: null }
    ];
  }

  getFallbackResponse(npcId) {
    // Hardcoded fallbacks if API fails
    const fallbacks = {
      leader: {
        dialogue: "*She looks at you, calculating.* We're done here.",
        choices: [
          { text: 'For now.', type: 'direct', skill_hint: null },
          { text: '[Leave]', type: 'withdrawal', skill_hint: null }
        ],
        voiceInterrupts: [
          {
            voice: 'LOGIC',
            text: "She's calculating. You're either useful or a liability.",
            color: '#88ccff'
          }
        ],
        internal_state: 'dismissive',
        success: false
      },
      healer: {
        dialogue: "*He looks away.* I... should check on supplies.",
        choices: [
          { text: 'Are you alright?', type: 'gentle', skill_hint: 'EMPATHY' },
          { text: '[Leave]', type: 'withdrawal', skill_hint: null }
        ],
        voiceInterrupts: [
          {
            voice: 'EMPATHY',
            text: "The guilt is eating him alive. Every day.",
            color: '#88ff88'
          }
        ],
        internal_state: 'avoidant',
        success: false
      },
      threat: {
        dialogue: '*Silence. He watches.*',
        choices: [
          { text: '*Wait*', type: 'silence', skill_hint: null },
          { text: '[Leave]', type: 'withdrawal', skill_hint: null }
        ],
        voiceInterrupts: [
          {
            voice: 'INSTINCT',
            text: 'Dangerous. Absolutely dangerous. But... controlled.',
            color: '#ff8844'
          }
        ],
        internal_state: 'watchful',
        success: false
      },
      keeper: {
        dialogue: "*She looks at you, then away.* The dust is thick today.",
        choices: [
          { text: 'Is something wrong?', type: 'gentle', skill_hint: 'EMPATHY' },
          { text: "[Leave]", type: 'withdrawal', skill_hint: null }
        ],
        voiceInterrupts: [
          {
            voice: 'EMPATHY',
            text: "She's exhausted. Every word costs her something.",
            color: '#88ff88'
          }
        ],
        internal_state: 'guarded',
        success: false
      },
      mirror: {
        dialogue: "I... did I say something wrong?",
        choices: [
          { text: "No, you're fine.", type: 'gentle', skill_hint: null },
          { text: '[Leave]', type: 'withdrawal', skill_hint: null }
        ],
        voiceInterrupts: [
          {
            voice: 'EMPATHY',
            text: "He's desperate. For direction. For someone to follow.",
            color: '#88ff88'
          }
        ],
        internal_state: 'anxious',
        success: false
      }
    };

    return fallbacks[npcId] || fallbacks.keeper;
  }

  // Reset an agent's conversation state
  resetAgent(npcId) {
    if (this.agents[npcId]) {
      this.agents[npcId].resetConversation();
    }
  }

  // Reset all agents
  resetAllAgents() {
    for (const agent of Object.values(this.agents)) {
      agent.resetConversation();
    }
    this.playerProfile.reset();
    window.ASHFALL.playerProfile = this.playerProfile.getProfile();
  }

  // Utility
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  // ═══════════════════════════════════════════════════════════════
  // CURIE-Δ INTEGRATION
  // ═══════════════════════════════════════════════════════════════

  // Update Curie state based on conversation events
  updateCurieFromConversation(response, npcId) {
    const gameState = {
      flags: window.ASHFALL?.flags,
      relationships: window.ASHFALL?.relationships,
      playerProfile: this.playerProfile.getProfile(),
      voiceBalances: window.ASHFALL?.player?.skills,
      playerLocation: this.locationContext.currentLocation,
      recentEmotionalSpike: Math.abs(response.relationship_delta) > 5
    };

    this.curie.update(gameState);

    // Update hum based on current state
    this.humSystem.update(this.locationContext.currentLocation, gameState);
  }

  // Check if GHOST voice should be overridden by Curie
  checkGhostOverride(voiceReactions) {
    if (!this.ghostOverride.shouldOverride()) {
      return null;
    }

    // Generate Curie-influenced GHOST line
    return this.ghostOverride.generateOverrideLine();
  }

  // Calculate voice conflict for tremor triggering
  calculateVoiceConflict() {
    const skills = window.ASHFALL?.player?.skills;
    if (!skills) return 0;

    const { LOGIC = 0, INSTINCT = 0, EMPATHY = 0, GHOST = 0 } = skills;
    const values = [LOGIC, INSTINCT, EMPATHY, GHOST];
    const max = Math.max(...values);
    const min = Math.min(...values);

    // Higher conflict when voices are very unbalanced
    return (max - min) / 100;
  }

  // Get NPC resonance prompt injection
  getNpcResonanceInjection(npcId) {
    return this.npcResonance.getPromptInjection(npcId);
  }

  // Get current hum state
  getHumState() {
    return this.humSystem.update(
      this.locationContext.currentLocation,
      { flags: window.ASHFALL?.flags }
    );
  }

  // Get current ending path
  getEndingPath() {
    return this.endgameCalculator.calculatePath({
      voiceBalances: window.ASHFALL?.player?.skills,
      flags: window.ASHFALL?.flags,
      relationships: window.ASHFALL?.relationships
    });
  }

  // Get Curie entity for direct access
  getCurie() {
    return this.curie;
  }

  // Force a tremor (for scripted events)
  forceTremor(intensity = 0.5) {
    return this.tremorSystem.forceTremor(intensity);
  }

  // Get allowed Curie hints based on current flags
  getAllowedCurieHints() {
    return CURIE_GUARDRAILS.getAllowedHints(window.ASHFALL?.flags);
  }

  // Check if a Curie topic is unlocked
  isCurieTopicUnlocked(topicKey) {
    return CURIE_GUARDRAILS.isTopicUnlocked(topicKey, window.ASHFALL?.flags);
  }

  // Reset Curie state
  resetCurie() {
    this.curie.reset();
    if (window.ASHFALL) {
      window.ASHFALL.curie = this.curie.getStateSummary();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // RELATIONSHIP SYSTEM INTEGRATION
  // ═══════════════════════════════════════════════════════════════

  // Apply a relationship event (e.g., 'jonas_healed_someone')
  applyRelationshipEvent(eventName) {
    const results = this.relationshipManager.applyEvent(eventName);
    if (results.length > 0) {
      console.log(`Relationship event '${eventName}' applied:`, results);
    }
    return results;
  }

  // Get what one NPC thinks of another
  getNpcImpression(speakingNpc, aboutNpc) {
    return this.crossReferenceDialogue.getImpression(speakingNpc, aboutNpc);
  }

  // Get all impressions one NPC has
  getAllNpcImpressions(npcId) {
    return this.crossReferenceDialogue.getAllImpressions(npcId);
  }

  // Check if player input mentions another NPC
  detectCrossReference(playerInput) {
    return this.crossReferenceDialogue.detectCrossReference(playerInput);
  }

  // Get the relationship manager for direct access
  getRelationshipManager() {
    return this.relationshipManager;
  }

  // Get current NPC-to-NPC relationship state
  getNpcRelationshipState(npc1, npc2) {
    return this.relationshipManager.getPerception(npc1, npc2);
  }

  // Get the dominant feeling one NPC has toward another
  getDominantFeeling(fromNpc, toNpc) {
    return this.relationshipManager.getDominantFeeling(fromNpc, toNpc);
  }
}
