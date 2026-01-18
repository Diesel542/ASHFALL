// src/ui/DialogueController.js

import { UIManager } from './UIManager.js';
import { Transitions } from './Transitions.js';
import { ChoiceSystem } from '../dialogue/ChoiceSystem.js';

/**
 * DIALOGUE CONTROLLER
 *
 * High-level dialogue flow management.
 * Coordinates UI, game state, and OpenAI calls.
 */

// NPC display data
const NPC_DATA = {
  mara: { name: 'Mara', portrait: 'mara_guarded' },
  jonas: { name: 'Jonas', portrait: 'jonas_distant' },
  rask: { name: 'Rask', portrait: 'rask_watching' },
  edda: { name: 'Edda', portrait: 'edda_cryptic' },
  kale: { name: 'Kale', portrait: 'kale_eager' }
};

export class DialogueController {
  constructor(scene, gameManager) {
    this.scene = scene;
    this.game = gameManager;
    this.ui = new UIManager(scene);
    this.transitions = new Transitions(scene);

    // Initialize dynamic choice system
    this.choiceSystem = new ChoiceSystem(gameManager.gsm);

    this.currentConversation = null;
  }

  /**
   * Start talking to an NPC
   */
  async startConversation(npcId) {
    const npcData = NPC_DATA[npcId];

    this.currentConversation = {
      npc: npcId,
      turnCount: 0
    };

    // Start dialogue UI
    await this.ui.startDialogue(npcId, npcData);

    // Get initial greeting based on relationship
    const context = this.game.gsm.getDialogueContext(npcId);
    const greeting = await this.getGreeting(npcId, context);

    // Show greeting
    await this.ui.showDialogue(greeting.text, greeting.emotion);

    // Show voice reactions if any
    if (greeting.voices) {
      await this.ui.showVoices(greeting.voices);
    }

    // Show initial choices
    await this.showPlayerChoices(npcId);
  }

  /**
   * Handle player choice
   */
  async handleChoice(choice) {
    // Apply choice effects through the choice system
    this.choiceSystem.currentNpc = this.currentConversation?.npc;
    this.choiceSystem.applyChoice(choice);

    // Get NPC response from OpenAI
    const npcId = this.currentConversation.npc;
    const result = await this.game.talkTo(npcId, choice.text);

    // Handle null result (dialogue system not initialized)
    if (!result) {
      console.warn('[DialogueController] talkTo returned null - using fallback');
      const fallbackResponse = this.getLocalFallback(npcId);
      await this.ui.showDialogue(fallbackResponse, 'neutral');
      await this.showPlayerChoices(npcId);
      return;
    }

    if (result.success) {
      // Determine emotion from response
      const emotion = this.detectEmotion(result.response);

      // Show NPC response
      await this.ui.showDialogue(result.response, emotion);

      // Capture emotional dialogue for Curie's echo bank
      this.captureForCurieEcho(npcId, result.response);

      // Generate and show voice reactions
      const voices = await this.generateVoiceReactions(npcId, result.response);
      if (voices && Object.keys(voices).length > 0) {
        await this.ui.showVoices(voices);
      }

      // Check for special triggers
      await this.handleTriggers(result.triggers);

      // Continue conversation or end
      this.currentConversation.turnCount++;

      if (this.shouldEndConversation(result)) {
        await this.endConversation();
      } else {
        await this.showPlayerChoices(npcId);
      }
    } else {
      // Fallback on error
      const fallbackText = result.fallback || this.getLocalFallback(npcId);
      await this.ui.showDialogue(fallbackText, 'neutral');
      await this.showPlayerChoices(npcId);
    }
  }

  /**
   * Get a local fallback response when API is unavailable
   */
  getLocalFallback(npcId) {
    const fallbacks = {
      mara: "*She studies you for a long moment, then looks away.* We'll talk later. There's work to be done.",
      jonas: "*He pauses, lost in thought.* I... sorry, what were you saying? My mind wandered.",
      rask: "*He grunts.* Not now. Keep your distance.",
      edda: "*Her eyes grow distant.* The words aren't ready yet. They'll come when they're meant to.",
      kale: "*He shifts nervously.* I don't... I'm not sure what to say right now."
    };
    return fallbacks[npcId] || "*They seem distracted and don't respond.*";
  }

  /**
   * Show player choices
   */
  async showPlayerChoices(npcId) {
    const context = this.game.gsm.getDialogueContext(npcId);
    const choices = await this.generateChoices(npcId, context);

    const selected = await this.ui.showChoices(choices);

    if (selected.id === 'leave') {
      await this.endConversation();
    } else {
      await this.handleChoice(selected);
    }
  }

  /**
   * Generate contextual choices using the dynamic ChoiceSystem
   */
  async generateChoices(npcId, context) {
    // Use the ChoiceSystem for dynamic, context-aware choices
    return this.choiceSystem.generateChoices(npcId, context);
  }

  async generateVoiceReactions(npcId, npcResponse) {
    // Use VoiceSystem to generate reactions
    const voiceSystem = this.game.gsm.getSystem('voices');
    if (voiceSystem) {
      return await voiceSystem.getVoiceReactions({
        npc: npcId,
        npcDialogue: npcResponse,
        location: this.game.gsm.get('player.location')
      });
    }
    return null;
  }

  detectEmotion(response) {
    const lower = response.toLowerCase();

    if (lower.includes('*tightens*') || lower.includes('*hardens*')) return 'guarded';
    if (lower.includes('*softens*') || lower.includes('*quiet*')) return 'vulnerable';
    if (lower.includes('*looks away*') || lower.includes('*distant*')) return 'distant';
    if (lower.includes('*fear*') || lower.includes('*trembl*')) return 'frightened';

    return 'neutral';
  }

  async handleTriggers(triggers) {
    if (!triggers) return;

    for (const trigger of triggers) {
      if (trigger.type === 'shaft_mentioned') {
        // Subtle tremor when shaft is mentioned
        await this.transitions.tremor('light');
      }

      if (trigger.type === 'emotional_spike') {
        // Brief ghost effect
        await this.transitions.ghostEffect(500);
      }
    }
  }

  shouldEndConversation(result) {
    // End after certain triggers or turn count
    if (this.currentConversation.turnCount > 6) return true;
    if (result.triggers?.some((t) => t.type === 'conversation_end')) return true;
    return false;
  }

  async endConversation() {
    await this.ui.endDialogue();
    this.currentConversation = null;

    // Emit event for game to handle
    this.scene.events.emit('conversation:end');
  }

  /**
   * Get initial greeting based on relationship and context
   */
  async getGreeting(npcId, context) {
    const relationship = context.relationship;

    // Simple greeting variations based on relationship
    const greetings = {
      mara: {
        low: { text: "*She barely acknowledges you.* What.", emotion: 'guarded' },
        medium: { text: "*She looks up from her work.* You need something?", emotion: 'neutral' },
        high: { text: "*She nods.* Good. I was hoping you'd come by.", emotion: 'neutral' }
      },
      jonas: {
        low: { text: "*He doesn't look up.* I'm... busy.", emotion: 'distant' },
        medium: { text: "*He pauses.* Oh. Hello.", emotion: 'distant' },
        high: { text: "*He almost smiles.* It's good to see you.", emotion: 'warmth' }
      },
      rask: {
        low: { text: '*He watches. Says nothing.*', emotion: 'watching' },
        medium: { text: '*A slight nod.*', emotion: 'neutral' },
        high: { text: "*He shifts to make room.* Stay a while.", emotion: 'softness' }
      },
      edda: {
        low: { text: '*She hums softly, not quite looking at you.*', emotion: 'cryptic' },
        medium: { text: '*She turns.* The wind brought you. Or something did.', emotion: 'cryptic' },
        high: {
          text: "*She takes your hand briefly.* You came back. That means something.",
          emotion: 'prophetic'
        }
      },
      kale: {
        low: { text: "*He shifts nervously.* Oh. Hi. I wasn't—did you need me?", emotion: 'eager' },
        medium: { text: "*He brightens.* Hey! I was hoping I'd run into you.", emotion: 'eager' },
        high: { text: "*He relaxes.* It's... it's nice when you're around.", emotion: 'eager' }
      }
    };

    const level = relationship < 40 ? 'low' : relationship < 70 ? 'medium' : 'high';
    const greeting = greetings[npcId]?.[level] || { text: '*They look at you.*', emotion: 'neutral' };

    // Add voice reactions for first meeting
    if (!context.flags.has(`met_${npcId}`)) {
      greeting.voices = this.getFirstMeetingVoices(npcId);
    }

    return greeting;
  }

  getFirstMeetingVoices(npcId) {
    const voices = {
      mara: {
        LOGIC: 'Leader. But stretched thin.',
        INSTINCT: 'She could cut you with a look.',
        EMPATHY: 'So much weight on those shoulders.'
      },
      jonas: {
        LOGIC: "Medical training evident. Why isn't he practicing?",
        EMPATHY: "He's drowning in something.",
        GHOST: 'His hands remember what his heart forgot.'
      },
      rask: {
        INSTINCT: 'Dangerous. Very dangerous.',
        EMPATHY: "He's tired. Of everything.",
        LOGIC: 'Controlled violence. Strategic stillness.'
      },
      edda: {
        GHOST: 'She knows things. Old things.',
        EMPATHY: 'Such sadness in those eyes.',
        INSTINCT: 'Careful. She sees too much.'
      },
      kale: {
        EMPATHY: "He's looking for himself in everyone else.",
        INSTINCT: 'Unstable. But not a threat.',
        GHOST: 'Something flickers in him. Familiar.'
      }
    };

    return voices[npcId] || {};
  }

  // ═══════════════════════════════════════
  // CURIE ECHO CAPTURE
  // ═══════════════════════════════════════

  /**
   * Capture emotionally weighted NPC dialogue for Curie's echo bank
   */
  captureForCurieEcho(npcId, response) {
    const emotionalWeight = this.analyzeEmotionalWeight(response);

    if (emotionalWeight > 0.5) {
      const echoPhrase = this.extractEchoablePhrase(response);

      // Emit for Curie to potentially echo later
      this.game.gsm.events.emit('dialogue:line', {
        speaker: npcId,
        text: echoPhrase,
        emotionalWeight: emotionalWeight
      });
    }
  }

  /**
   * Analyze emotional weight of dialogue text
   */
  analyzeEmotionalWeight(text) {
    let weight = 0.3; // base

    // Emotional markers increase weight
    const emotionalMarkers = [
      /\*[^*]+\*/g,           // Action text
      /\b(remember|forget|lost|dead|afraid|alone)\b/gi,
      /\b(sorry|forgive|guilt|shame)\b/gi,
      /\.\.\./g,              // Hesitation
      /—/g                     // Interruption
    ];

    for (const marker of emotionalMarkers) {
      if (marker.test(text)) {
        weight += 0.1;
      }
    }

    return Math.min(weight, 1.0);
  }

  /**
   * Extract the most emotionally resonant phrase for Curie to echo
   */
  extractEchoablePhrase(text) {
    // Remove action text for the echo
    const cleaned = text.replace(/\*[^*]+\*/g, '').trim();

    // Split into sentences
    const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim());

    // Return shortest meaningful sentence (more impactful as echoes)
    const meaningful = sentences.filter(s => s.trim().length > 10 && s.trim().length < 60);

    if (meaningful.length > 0) {
      return meaningful.reduce((a, b) => a.length < b.length ? a : b).trim();
    }

    return sentences[0]?.trim() || cleaned.substring(0, 50);
  }
}
