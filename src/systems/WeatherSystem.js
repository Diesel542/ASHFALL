// ASHFALL - WeatherSystem
// Weather reflects narrative state, not random chance

export class WeatherSystem {
  constructor() {
    this.currentWeather = 'stillness';
    this.weatherDescriptions = {
      fog: {
        visual: 'Fog rolls through the settlement, obscuring edges.',
        meaning: 'secrets, uncertainty, withheld truth',
        triggers: ['secret_discovered', 'npc_lying', 'approaching_revelation']
      },
      wind: {
        visual: 'Wind gusts through Ashfall, rattling loose boards.',
        meaning: 'conflict brewing',
        triggers: ['relationship_damaged', 'confrontation_pending', 'tension_high']
      },
      stillness: {
        visual: 'The air hangs motionless. Heavy. Waiting.',
        meaning: 'dread, anticipation',
        triggers: ['before_major_choice', 'calm_before_storm', 'default']
      },
      tremors: {
        visual: 'The ground shudders. Dust falls from beams.',
        meaning: 'the thing below stirring',
        triggers: ['shaft_discussed', 'deep_secret_approached', 'endgame_near']
      },
      ashfall: {
        visual: 'Ash drifts from the sky. Soft. Relentless. Suffocating.',
        meaning: 'grief, resignation, inevitability',
        triggers: ['death_occurred', 'hope_lost', 'tragic_choice_made']
      },
      dust_storm: {
        visual: 'Dust scours the settlement. Visibility drops to nothing.',
        meaning: 'chaos, loss of clarity',
        triggers: ['multiple_crises', 'player_overwhelmed', 'relationships_fractured']
      }
    };
  }

  // Update weather based on game state
  updateWeather(flags, relationships, recentEvents) {
    // Check triggers in priority order

    // Ashfall (highest emotional weight)
    if (recentEvents.includes('death_occurred') || flags.has('tragic_ending_locked')) {
      this.setWeather('ashfall');
      return;
    }

    // Tremors (shaft-related)
    if (flags.has('shaft_opened') || flags.has('heard_the_singing') ||
        recentEvents.includes('shaft_discussed')) {
      this.setWeather('tremors');
      return;
    }

    // Dust storm (chaos)
    const damagedRelationships = this.countDamagedRelationships(relationships);
    if (damagedRelationships >= 3 || recentEvents.includes('multiple_crises')) {
      this.setWeather('dust_storm');
      return;
    }

    // Wind (conflict)
    if (damagedRelationships >= 2 || recentEvents.includes('confrontation')) {
      this.setWeather('wind');
      return;
    }

    // Fog (secrets)
    if (recentEvents.includes('npc_deflected') ||
        recentEvents.includes('partial_truth_told')) {
      this.setWeather('fog');
      return;
    }

    // Default: stillness
    this.setWeather('stillness');
  }

  countDamagedRelationships(relationships) {
    if (!relationships) return 0;
    let count = 0;
    if (typeof relationships.forEach === 'function') {
      relationships.forEach(value => {
        if (value < 30) count++;
      });
    } else {
      for (const value of Object.values(relationships)) {
        if (value < 30) count++;
      }
    }
    return count;
  }

  setWeather(weatherType) {
    if (this.currentWeather !== weatherType) {
      this.currentWeather = weatherType;
      this.announceWeatherChange(weatherType);
    }
  }

  announceWeatherChange(weatherType) {
    const weather = this.weatherDescriptions[weatherType];
    if (weather) {
      // Trigger UI notification if available
      if (window.ASHFALL?.showEnvironmentalText) {
        window.ASHFALL.showEnvironmentalText(weather.visual);
      }
    }
  }

  getCurrentDescription() {
    return this.weatherDescriptions[this.currentWeather]?.visual || '';
  }

  getCurrentWeather() {
    return this.currentWeather;
  }

  // Get weather-appropriate ambient text for dialogue scenes
  getAmbientText() {
    const ambients = {
      fog: [
        '*The fog thickens outside.*',
        "*Shapes move in the mist. Or don't.*",
        '*You can barely see the nearest building.*'
      ],
      wind: [
        '*A gust rattles the walls.*',
        '*Something metal clangs in the distance.*',
        '*The wind sounds almost like voices.*'
      ],
      stillness: [
        '*The silence presses.*',
        '*Nothing moves.*',
        '*The air feels thick. Waiting.*'
      ],
      tremors: [
        '*The floor shudders briefly.*',
        '*Dust falls from the ceiling.*',
        '*Something groans beneath you.*'
      ],
      ashfall: [
        '*Ash drifts past the window.*',
        '*The sky is grey. Always grey now.*',
        '*You taste it in the back of your throat.*'
      ],
      dust_storm: [
        '*The storm howls outside.*',
        "*You can't see three feet beyond the door.*",
        '*Best to wait this out.*'
      ]
    };

    const options = ambients[this.currentWeather] || ambients.stillness;
    return options[Math.floor(Math.random() * options.length)];
  }

  // Get weather meaning for system messages
  getCurrentMeaning() {
    return this.weatherDescriptions[this.currentWeather]?.meaning || '';
  }
}
