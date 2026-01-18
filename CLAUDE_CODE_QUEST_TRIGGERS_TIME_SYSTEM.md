# ASHFALL: Quest Triggers & Time System
## Wiring It All Together

### Overview

This document connects the quest archetypes and time mechanics to actual gameplay. When conditions are met, quests spawn. When actions happen, time passes. The world breathes.

---

## 1. Time System

### Time Flow Rules

```javascript
// src/systems/TimeSystem.js

import { EVENTS } from '../core/EventBus.js';

/**
 * TIME SYSTEM
 * 
 * Controls how time passes in Ashfall.
 * Time creates pressure, changes NPC behavior, triggers events.
 */

export class TimeSystem {
  constructor(gameStateManager) {
    this.gsm = gameStateManager;
    
    // Time costs for actions
    this.timeCosts = {
      conversation: 1,        // 1 hour per conversation
      travel: 0,              // Travel is instant (small settlement)
      rest: 6,                // Rest advances 6 hours
      investigate: 2,         // Investigating something takes 2 hours
      quest_complete: 2       // Completing a quest takes 2 hours
    };

    // Time periods
    this.periods = {
      morning: { start: 6, end: 12 },
      afternoon: { start: 12, end: 17 },
      dusk: { start: 17, end: 21 },
      night: { start: 21, end: 6 }
    };

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Time passes after conversations
    this.gsm.events.on(EVENTS.DIALOGUE_END, () => {
      this.passTime('conversation');
    });

    // Time passes after quest completion
    this.gsm.events.on(EVENTS.QUEST_COMPLETE, () => {
      this.passTime('quest_complete');
    });
  }

  /**
   * Pass time based on action type
   */
  passTime(action) {
    const hours = this.timeCosts[action] || 1;
    this.gsm.advanceTime(hours);
    
    // Check for time-based triggers
    this.checkTimeEvents();
  }

  /**
   * Rest at player quarters
   */
  rest() {
    const location = this.gsm.get('player.location');
    
    if (location !== 'player_quarters') {
      return { success: false, reason: 'Must be at Your Quarters to rest' };
    }

    this.passTime('rest');
    
    // Resting reduces player stress (if we track it)
    // NPCs may move during rest
    this.updateNpcLocations();
    
    return { success: true, hoursRested: this.timeCosts.rest };
  }

  /**
   * Check for time-triggered events
   */
  checkTimeEvents() {
    const day = this.gsm.get('time.day');
    const timeOfDay = this.gsm.get('time.timeOfDay');
    const hour = this.gsm.get('time.hour');

    // Day 2 dusk - first major tremor
    if (day === 2 && timeOfDay === 'dusk' && !this.gsm.hasFlag('day2_tremor')) {
      this.gsm.setFlag('day2_tremor');
      this.gsm.triggerTremor('medium');
      this.gsm.events.emit('narrative:event', {
        type: 'tremor_event',
        text: 'The ground shudders. Longer this time. The hum swells and fades.'
      });
    }

    // Day 3 - Edda seeks the player
    if (day === 3 && !this.gsm.hasFlag('edda_seeks_player')) {
      this.gsm.setFlag('edda_seeks_player');
      this.triggerNpcSeek('edda');
    }

    // Day 4 morning - supplies become critical
    if (day === 4 && timeOfDay === 'morning' && !this.gsm.hasFlag('supplies_critical')) {
      this.gsm.setFlag('supplies_critical');
      this.gsm.adjustTension(15, 'supplies_critical');
      this.gsm.events.emit('narrative:event', {
        type: 'scarcity_event',
        text: 'Morning count. The storehouse grows emptier. Mara\'s jaw is tight.'
      });
    }

    // Night - Rask moves to shaft
    if (timeOfDay === 'night') {
      this.gsm.state.npcs.rask.location = 'sealed_shaft';
    } else if (this.gsm.state.npcs.rask.location === 'sealed_shaft') {
      this.gsm.state.npcs.rask.location = 'gate';
    }

    // Curie is more active at night
    if (timeOfDay === 'night') {
      this.gsm.adjustCurieActivity(0.05);
    }
  }

  /**
   * Trigger an NPC to seek out the player
   */
  triggerNpcSeek(npcId) {
    this.gsm.events.emit('npc:seeks_player', {
      npc: npcId,
      reason: 'has_something_to_say'
    });
  }

  /**
   * Update NPC locations based on time
   */
  updateNpcLocations() {
    const timeOfDay = this.gsm.get('time.timeOfDay');
    const npcs = this.gsm.state.npcs;

    const schedules = {
      mara: {
        morning: 'storehouse',
        afternoon: 'watchtower',
        dusk: 'watchtower',
        night: 'watchtower'
      },
      jonas: {
        morning: 'clinic',
        afternoon: 'clinic',
        dusk: 'market_square',
        night: 'clinic'
      },
      rask: {
        morning: 'gate',
        afternoon: 'gate',
        dusk: 'perimeter_path',
        night: 'sealed_shaft'
      },
      edda: {
        morning: 'well',
        afternoon: 'perimeter_path',
        dusk: 'perimeter_path',
        night: 'player_quarters'  // She watches
      },
      kale: {
        morning: 'market_square',
        afternoon: 'storehouse',
        dusk: 'market_square',
        night: 'player_quarters'
      }
    };

    for (const [npcId, schedule] of Object.entries(schedules)) {
      const newLocation = schedule[timeOfDay];
      if (npcs[npcId] && newLocation) {
        npcs[npcId].location = newLocation;
      }
    }

    this.gsm.events.emit('npcs:locations_updated', { timeOfDay });
  }

  /**
   * Get description of current time
   */
  getTimeDescription() {
    const day = this.gsm.get('time.day');
    const timeOfDay = this.gsm.get('time.timeOfDay');
    
    const descriptions = {
      morning: 'The ash settles in the pale light.',
      afternoon: 'The sun hangs heavy. Heat shimmers.',
      dusk: 'Shadows stretch. The hum seems louder.',
      night: 'Darkness. The settlement sleeps. Mostly.'
    };

    return {
      day,
      timeOfDay,
      description: descriptions[timeOfDay]
    };
  }
}
```

---

## 2. Quest Trigger System

```javascript
// src/systems/QuestTriggerSystem.js

import { EVENTS } from '../core/EventBus.js';

/**
 * QUEST TRIGGER SYSTEM
 * 
 * Monitors game state and spawns quests when conditions are met.
 * Each trigger defines: conditions, quest archetype, context.
 */

export class QuestTriggerSystem {
  constructor(gameStateManager, questSystem) {
    this.gsm = gameStateManager;
    this.questSystem = questSystem;
    
    // Define all triggers
    this.triggers = this.defineTriggers();
    
    // Track which triggers have fired
    this.firedTriggers = new Set();
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Check triggers after dialogue
    this.gsm.events.on(EVENTS.DIALOGUE_END, (e) => {
      this.checkDialogueTriggers(e.data.npc);
    });

    // Check triggers on location change
    this.gsm.events.on(EVENTS.PLAYER_LOCATION_CHANGE, (e) => {
      this.checkLocationTriggers(e.data.to);
    });

    // Check triggers on tension change
    this.gsm.events.on(EVENTS.TENSION_CHANGE, () => {
      this.checkTensionTriggers();
    });

    // Check triggers on time advance
    this.gsm.events.on(EVENTS.TIME_ADVANCE, () => {
      this.checkTimeTriggers();
    });

    // Check triggers on relationship change
    this.gsm.events.on(EVENTS.NPC_RELATIONSHIP_CHANGE, (e) => {
      this.checkRelationshipTriggers(e.data.npc);
    });

    // Check triggers on Curie activity
    this.gsm.events.on(EVENTS.CURIE_ACTIVITY_CHANGE, () => {
      this.checkCurieTriggers();
    });
  }

  /**
   * Define all quest triggers
   */
  defineTriggers() {
    return [
      // ═══════════════════════════════════════
      // INTERVENTION QUESTS
      // ═══════════════════════════════════════
      {
        id: 'jonas_intervention_1',
        archetype: 'intervention',
        conditions: {
          npc: 'jonas',
          conversationCount: { min: 3 },
          stress: { min: 60 },
          gate: { min: 1 }
        },
        context: {
          npc: 'jonas',
          scenario: 'refusing_to_help',
          description: 'Jonas is spiraling. He needs someone to reach him.'
        },
        once: true
      },
      {
        id: 'mara_intervention_1',
        archetype: 'intervention',
        conditions: {
          npc: 'mara',
          conversationCount: { min: 4 },
          stress: { min: 70 },
          tension: { min: 50 }
        },
        context: {
          npc: 'mara',
          scenario: 'control_slipping',
          description: 'Mara\'s grip is slipping. The cracks are showing.'
        },
        once: true
      },

      // ═══════════════════════════════════════
      // CONFESSION QUESTS
      // ═══════════════════════════════════════
      {
        id: 'rask_confession_1',
        archetype: 'confession',
        conditions: {
          npc: 'rask',
          relationship: { min: 65 },
          conversationCount: { min: 4 },
          timeOfDay: 'night'
        },
        context: {
          npc: 'rask',
          scenario: 'night_watch',
          description: 'Rask is at the shaft. He\'s never talked about why.'
        },
        once: true
      },
      {
        id: 'edda_confession_1',
        archetype: 'confession',
        conditions: {
          npc: 'edda',
          relationship: { min: 60 },
          gate: { min: 2 },
          flag: 'shaft_mentioned_by_edda'
        },
        context: {
          npc: 'edda',
          scenario: 'the_singing',
          description: 'Edda is ready to speak of what she heard.'
        },
        once: true
      },

      // ═══════════════════════════════════════
      // MEMORY ECHO QUESTS (Curie)
      // ═══════════════════════════════════════
      {
        id: 'memory_echo_1',
        archetype: 'memory_echo',
        conditions: {
          location: 'sealed_shaft',
          curieActivity: { min: 0.4 }
        },
        context: {
          trigger: 'shaft_proximity',
          scenario: 'first_echo',
          description: 'The hum shapes itself. Almost words. Almost memories.'
        },
        once: true
      },
      {
        id: 'memory_echo_kale',
        archetype: 'memory_echo',
        conditions: {
          npc: 'kale',
          curieResonance: { npc: 'kale', min: 0.5 },
          conversationCount: { min: 3 }
        },
        context: {
          npc: 'kale',
          trigger: 'kale_slips',
          scenario: 'borrowed_words',
          description: 'Kale says something that isn\'t his. He doesn\'t notice.'
        },
        once: true
      },

      // ═══════════════════════════════════════
      // SCARCITY DILEMMA QUESTS
      // ═══════════════════════════════════════
      {
        id: 'scarcity_water',
        archetype: 'scarcity_dilemma',
        conditions: {
          day: { min: 3 },
          tension: { min: 40 },
          flag: 'visited_well'
        },
        context: {
          resource: 'water',
          scenario: 'well_failing',
          description: 'The well water is running strange. Mara wants to ration harder.'
        },
        once: true
      },
      {
        id: 'scarcity_medicine',
        archetype: 'scarcity_dilemma',
        conditions: {
          day: { min: 4 },
          flag: 'met_jonas',
          tension: { min: 50 }
        },
        context: {
          resource: 'medicine',
          scenario: 'someone_sick',
          description: 'Someone is sick. The medicine exists. Jonas won\'t touch it.'
        },
        once: true
      },

      // ═══════════════════════════════════════
      // WATCHTOWER QUESTS
      // ═══════════════════════════════════════
      {
        id: 'watchtower_night',
        archetype: 'watchtower',
        conditions: {
          day: { min: 2 },
          timeOfDay: 'night',
          location: 'watchtower'
        },
        context: {
          scenario: 'night_watch',
          description: 'Something moves at the edge of the light. Or doesn\'t.'
        },
        once: true
      },

      // ═══════════════════════════════════════
      // SMALL MERCY QUESTS
      // ═══════════════════════════════════════
      {
        id: 'small_mercy_kale',
        archetype: 'small_mercy',
        conditions: {
          npc: 'kale',
          relationship: { min: 55 },
          conversationCount: { min: 2 }
        },
        context: {
          npc: 'kale',
          scenario: 'identity_crisis',
          description: 'Kale asks who you think he should be. It matters.'
        },
        once: true
      },
      {
        id: 'small_mercy_jonas',
        archetype: 'small_mercy',
        conditions: {
          npc: 'jonas',
          gate: { min: 2 },
          relationship: { min: 60 }
        },
        context: {
          npc: 'jonas',
          scenario: 'small_wound',
          description: 'You have a cut. Nothing serious. But you could ask him.'
        },
        once: true
      },

      // ═══════════════════════════════════════
      // INVESTIGATION QUESTS
      // ═══════════════════════════════════════
      {
        id: 'investigate_shaft',
        archetype: 'investigation',
        conditions: {
          day: { min: 2 },
          flag: 'shaft_mentioned_by_edda',
          flag2: 'first_tremor_felt'
        },
        context: {
          target: 'sealed_shaft',
          scenario: 'what_happened',
          description: 'Everyone avoids the shaft. But someone knows what happened.'
        },
        once: true
      },

      // ═══════════════════════════════════════
      // SHAFT'S SHADOW (Late Game)
      // ═══════════════════════════════════════
      {
        id: 'shaft_calls',
        archetype: 'shaft_shadow',
        conditions: {
          act: { min: 2 },
          curieActivity: { min: 0.6 },
          tension: { min: 65 }
        },
        context: {
          scenario: 'the_call',
          description: 'The shaft isn\'t just sealed. It\'s waiting.'
        },
        once: true
      }
    ];
  }

  // ═══════════════════════════════════════
  // CONDITION CHECKING
  // ═══════════════════════════════════════

  /**
   * Check all conditions for a trigger
   */
  checkConditions(trigger) {
    const c = trigger.conditions;
    const state = this.gsm.state;

    // Already fired?
    if (trigger.once && this.firedTriggers.has(trigger.id)) {
      return false;
    }

    // NPC-specific checks
    if (c.npc) {
      const npc = state.npcs[c.npc];
      if (!npc) return false;

      if (c.conversationCount?.min && npc.conversationCount < c.conversationCount.min) {
        return false;
      }
      if (c.stress?.min && npc.stress < c.stress.min) {
        return false;
      }
      if (c.relationship?.min && npc.relationship < c.relationship.min) {
        return false;
      }
      if (c.gate?.min && npc.currentGate < c.gate.min) {
        return false;
      }
    }

    // Location check
    if (c.location && state.player.location !== c.location) {
      return false;
    }

    // Time checks
    if (c.day?.min && state.time.day < c.day.min) {
      return false;
    }
    if (c.timeOfDay && state.time.timeOfDay !== c.timeOfDay) {
      return false;
    }

    // Narrative checks
    if (c.tension?.min && state.narrative.tension < c.tension.min) {
      return false;
    }
    if (c.act?.min && state.narrative.currentAct < c.act.min) {
      return false;
    }

    // Flag checks
    if (c.flag && !state.flags.has(c.flag)) {
      return false;
    }
    if (c.flag2 && !state.flags.has(c.flag2)) {
      return false;
    }

    // Curie checks
    if (c.curieActivity?.min && state.curie.activity < c.curieActivity.min) {
      return false;
    }
    if (c.curieResonance) {
      const resonance = state.curie.resonance[c.curieResonance.npc];
      if (!resonance || resonance < c.curieResonance.min) {
        return false;
      }
    }

    return true;
  }

  /**
   * Fire a trigger - spawn the quest
   */
  fireTrigger(trigger) {
    console.log(`[Quest] Trigger fired: ${trigger.id}`);
    
    // Mark as fired
    this.firedTriggers.add(trigger.id);
    
    // Create the quest
    const quest = this.questSystem.generateQuest(trigger.archetype, trigger.context);
    
    // Add to active quests
    this.gsm.state.quests.active.push({
      id: trigger.id,
      archetype: trigger.archetype,
      context: trigger.context,
      quest: quest,
      startedAt: Date.now(),
      day: this.gsm.get('time.day')
    });

    // Emit event
    this.gsm.events.emit(EVENTS.QUEST_START, {
      triggerId: trigger.id,
      archetype: trigger.archetype,
      context: trigger.context
    });

    // Set flag
    this.gsm.setFlag(`quest_started_${trigger.id}`);

    return quest;
  }

  // ═══════════════════════════════════════
  // TRIGGER CHECKS BY EVENT TYPE
  // ═══════════════════════════════════════

  checkDialogueTriggers(npcId) {
    for (const trigger of this.triggers) {
      if (trigger.conditions.npc === npcId) {
        if (this.checkConditions(trigger)) {
          this.fireTrigger(trigger);
        }
      }
    }
  }

  checkLocationTriggers(locationId) {
    for (const trigger of this.triggers) {
      if (trigger.conditions.location === locationId) {
        if (this.checkConditions(trigger)) {
          this.fireTrigger(trigger);
        }
      }
    }
  }

  checkTensionTriggers() {
    for (const trigger of this.triggers) {
      if (trigger.conditions.tension) {
        if (this.checkConditions(trigger)) {
          this.fireTrigger(trigger);
        }
      }
    }
  }

  checkTimeTriggers() {
    for (const trigger of this.triggers) {
      if (trigger.conditions.day || trigger.conditions.timeOfDay) {
        if (this.checkConditions(trigger)) {
          this.fireTrigger(trigger);
        }
      }
    }
  }

  checkRelationshipTriggers(npcId) {
    for (const trigger of this.triggers) {
      if (trigger.conditions.npc === npcId && trigger.conditions.relationship) {
        if (this.checkConditions(trigger)) {
          this.fireTrigger(trigger);
        }
      }
    }
  }

  checkCurieTriggers() {
    for (const trigger of this.triggers) {
      if (trigger.conditions.curieActivity || trigger.conditions.curieResonance) {
        if (this.checkConditions(trigger)) {
          this.fireTrigger(trigger);
        }
      }
    }
  }

  /**
   * Manual check - run all triggers
   */
  checkAllTriggers() {
    for (const trigger of this.triggers) {
      if (this.checkConditions(trigger)) {
        this.fireTrigger(trigger);
      }
    }
  }

  /**
   * Get active quests
   */
  getActiveQuests() {
    return this.gsm.state.quests.active;
  }

  /**
   * Complete a quest
   */
  completeQuest(questId, outcome) {
    const quests = this.gsm.state.quests;
    const index = quests.active.findIndex(q => q.id === questId);
    
    if (index === -1) return false;

    const quest = quests.active.splice(index, 1)[0];
    quest.completedAt = Date.now();
    quest.outcome = outcome;
    
    quests.completed.push(quest);

    this.gsm.events.emit(EVENTS.QUEST_COMPLETE, {
      questId,
      outcome,
      archetype: quest.archetype
    });

    this.gsm.setFlag(`quest_completed_${questId}`);

    return true;
  }
}
```

---

## 3. Integration with GameManager

```javascript
// Add to GameManager.js

import { TimeSystem } from '../systems/TimeSystem.js';
import { QuestTriggerSystem } from '../systems/QuestTriggerSystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';

export class GameManager {
  constructor() {
    // ... existing code ...

    // Initialize quest system
    this.questSystem = new QuestSystem();
    
    // Initialize time system
    this.time = new TimeSystem(this.gsm);
    
    // Initialize quest triggers
    this.questTriggers = new QuestTriggerSystem(this.gsm, this.questSystem);
    
    // Register systems
    this.gsm.registerSystem('time', this.time);
    this.gsm.registerSystem('questTriggers', this.questTriggers);
  }

  // ═══════════════════════════════════════
  // TIME API
  // ═══════════════════════════════════════

  /**
   * Rest at player quarters
   */
  rest() {
    return this.time.rest();
  }

  /**
   * Get current time info
   */
  getTimeInfo() {
    return this.time.getTimeDescription();
  }

  // ═══════════════════════════════════════
  // QUEST API
  // ═══════════════════════════════════════

  /**
   * Get active quests
   */
  getActiveQuests() {
    return this.questTriggers.getActiveQuests();
  }

  /**
   * Complete a quest
   */
  completeQuest(questId, outcome) {
    return this.questTriggers.completeQuest(questId, outcome);
  }

  /**
   * Check for available quests
   */
  checkForQuests() {
    this.questTriggers.checkAllTriggers();
  }
}
```

---

## 4. UI Integration - Quest Notification

```javascript
// src/ui/QuestNotification.js

import { UI_COLORS, UI_FONTS } from './UIConstants.js';

/**
 * QUEST NOTIFICATION
 * 
 * Shows when a quest triggers or completes.
 */

export class QuestNotification {
  constructor(scene) {
    this.scene = scene;
    this.create();
  }

  create() {
    const { width } = this.scene.cameras.main;

    this.container = this.scene.add.container(width / 2, 80);
    this.container.setDepth(1500);
    this.container.setAlpha(0);

    // Background
    this.bg = this.scene.add.rectangle(0, 0, 400, 60, UI_COLORS.bgDark, 0.9);
    this.bg.setStrokeStyle(1, UI_COLORS.accentRust);
    this.container.add(this.bg);

    // Icon
    this.icon = this.scene.add.text(-180, 0, '◆', {
      fontSize: '24px',
      color: UI_COLORS.accentRust
    });
    this.icon.setOrigin(0.5);
    this.container.add(this.icon);

    // Title
    this.title = this.scene.add.text(-150, -10, '', {
      fontFamily: 'Oswald, sans-serif',
      fontSize: '14px',
      color: UI_COLORS.textPrimary
    });
    this.container.add(this.title);

    // Description
    this.description = this.scene.add.text(-150, 10, '', {
      fontFamily: 'Lora, serif',
      fontSize: '12px',
      color: UI_COLORS.textSecondary,
      fontStyle: 'italic'
    });
    this.container.add(this.description);
  }

  /**
   * Show quest started notification
   */
  showQuestStarted(quest) {
    this.title.setText('Something Stirs');
    this.description.setText(quest.context.description || 'A situation demands attention.');
    this.icon.setText('◆');
    this.icon.setColor(UI_COLORS.accentRust);

    this.show();
  }

  /**
   * Show quest completed notification
   */
  showQuestCompleted(quest, outcome) {
    this.title.setText('Resolved');
    this.description.setText(outcome.description || 'The moment has passed.');
    this.icon.setText('✓');
    this.icon.setColor('#88ff88');

    this.show();
  }

  show() {
    // Slide in from top
    this.container.y = 20;
    this.container.setAlpha(1);

    this.scene.tweens.add({
      targets: this.container,
      y: 80,
      duration: 300,
      ease: 'Power2'
    });

    // Auto-hide after delay
    this.scene.time.delayedCall(4000, () => {
      this.hide();
    });
  }

  hide() {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      y: 20,
      duration: 300,
      onComplete: () => {
        this.container.setAlpha(0);
      }
    });
  }
}
```

---

## 5. UI Integration - Rest Action

```javascript
// Add to LocationPanel.js or create RestButton.js

/**
 * Add rest button when at player quarters
 */
updateRestButton() {
  const location = Game.gsm.get('player.location');
  
  if (location === 'player_quarters') {
    this.showRestButton();
  } else {
    this.hideRestButton();
  }
}

showRestButton() {
  if (this.restButton) return;

  this.restButton = this.scene.add.text(0, 80, '[REST]', {
    fontFamily: 'IBM Plex Mono, monospace',
    fontSize: '12px',
    color: UI_COLORS.textSecondary
  });
  this.restButton.setInteractive({ useHandCursor: true });
  
  this.restButton.on('pointerover', () => {
    this.restButton.setColor(UI_COLORS.textPrimary);
  });
  
  this.restButton.on('pointerout', () => {
    this.restButton.setColor(UI_COLORS.textSecondary);
  });
  
  this.restButton.on('pointerdown', () => {
    const result = Game.rest();
    if (result.success) {
      // Show rest transition
      this.scene.events.emit('player:rested', result);
    }
  });

  this.container.add(this.restButton);
}
```

---

## 6. Scene Integration

```javascript
// Add to SettlementScene.js create()

// Quest notifications
this.questNotification = new QuestNotification(this);

// Listen for quest events
Game.gsm.events.on(EVENTS.QUEST_START, (e) => {
  this.questNotification.showQuestStarted(e.data);
});

Game.gsm.events.on(EVENTS.QUEST_COMPLETE, (e) => {
  this.questNotification.showQuestCompleted(e.data, e.data.outcome);
});

// Listen for NPC seeking player
Game.gsm.events.on('npc:seeks_player', (e) => {
  this.showNpcSeeking(e.data.npc);
});

// Listen for narrative events
Game.gsm.events.on('narrative:event', (e) => {
  this.showNarrativeText(e.data.text);
});

// Listen for rest
this.events.on('player:rested', (data) => {
  this.transitions.fadeOut(500).then(() => {
    // Update NPC positions
    this.settlement.updateNpcPositions();
    // Update UI
    this.updateUI();
    // Fade back in
    this.transitions.fadeIn(500);
  });
});
```

---

## 7. Quest Flow Example

**Player Experience:**

```
Day 1 Morning:
- Meet Rask at gate
- Explore settlement
- Talk to NPCs

Day 1 Afternoon:
- Talk to Jonas (1st time)
- Talk to Edda about the hum

Day 1 Dusk:
- Talk to Mara
- First tremor (Curie stirs)

Day 2 Morning:
- Talk to Jonas (2nd time)
- Talk to Jonas (3rd time) + stress > 60
  → QUEST TRIGGERED: "Jonas Intervention"
  → Notification: "Something Stirs - Jonas is spiraling..."

Day 2 Night:
- Go to sealed shaft
- Curie activity > 0.4
  → QUEST TRIGGERED: "Memory Echo"
  → The hum shapes itself...
```

---

## 8. Quest Trigger Summary

| Quest ID | Archetype | Key Conditions |
|----------|-----------|----------------|
| `jonas_intervention_1` | Intervention | 3+ talks, stress 60+, gate 1+ |
| `mara_intervention_1` | Intervention | 4+ talks, stress 70+, tension 50+ |
| `rask_confession_1` | Confession | 65+ relationship, night, 4+ talks |
| `edda_confession_1` | Confession | 60+ relationship, gate 2+, shaft mentioned |
| `memory_echo_1` | Memory Echo | At shaft, Curie 0.4+ |
| `memory_echo_kale` | Memory Echo | Kale resonance 0.5+, 3+ talks |
| `scarcity_water` | Scarcity | Day 3+, tension 40+, visited well |
| `scarcity_medicine` | Scarcity | Day 4+, tension 50+, met Jonas |
| `watchtower_night` | Watchtower | Day 2+, night, at watchtower |
| `small_mercy_kale` | Small Mercy | 55+ relationship, 2+ talks |
| `small_mercy_jonas` | Small Mercy | gate 2+, 60+ relationship |
| `investigate_shaft` | Investigation | Day 2+, Edda mentioned shaft, felt tremor |
| `shaft_calls` | Shaft Shadow | Act 2+, Curie 0.6+, tension 65+ |

---

## Summary

**Time System:**
- Conversations cost 1 hour
- Rest advances 6 hours
- NPCs move based on time of day
- Night increases Curie activity
- Time events trigger on specific day/hour

**Quest Triggers:**
- Monitor 13 conditions (relationship, stress, location, time, flags, Curie)
- Fire when all conditions met
- Each trigger fires once
- Quest notification appears
- Quest added to active list

**Integration:**
- `Game.rest()` — rest at quarters
- `Game.getActiveQuests()` — see active quests
- `Game.completeQuest(id, outcome)` — resolve quest

---

*"Time passes. The hum persists. Something waits."*

*— Now it breathes*
