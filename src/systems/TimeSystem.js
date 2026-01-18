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
      if (this.gsm.state.npcs?.rask) {
        this.gsm.state.npcs.rask.location = 'sealed_shaft';
      }
    } else if (this.gsm.state.npcs?.rask?.location === 'sealed_shaft') {
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

    if (!npcs) return;

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
