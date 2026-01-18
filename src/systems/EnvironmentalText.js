// ASHFALL - EnvironmentalText
// For item descriptions, location text, and system messages in Ashfall's voice

export class EnvironmentalText {
  constructor() {
    // Ashfall's adjective palette
    this.adjectives = [
      'brittle', 'hollow', 'scorched', 'trembling', 'exhausted',
      'dusty', 'rusted', 'humming', 'bone-dry', 'dim',
      'cracked', 'worn', 'faded', 'silent', 'heavy'
    ];

    // Sensory fragments
    this.sensoryFragments = [
      'dust settles like memory',
      'metal tastes the air',
      'boards creak in complaint',
      'something hums beneath',
      'ash falls soft and persistent',
      'the wind carries whispers',
      'shadows lean wrong',
      'silence has weight here'
    ];
  }

  // Generate item description in Ashfall tone
  generateItemDescription(item) {
    const templates = [
      `${this.randomAdjective()} ${item.baseType}. ${item.history || 'Someone needed this once.'}`,
      `A ${item.baseType}, ${this.randomAdjective()} with age. ${item.useHint || ''}`,
      `${item.baseType}. ${this.randomAdjective()}. ${item.emotionalResidue || 'It remembers being held.'}`,
    ];

    return templates[Math.floor(Math.random() * templates.length)]
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Generate location description
  generateLocationDescription(location) {
    const sensory = this.sensoryFragments[
      Math.floor(Math.random() * this.sensoryFragments.length)
    ];

    const templates = [
      `${location.name}. ${this.randomAdjective()} walls. ${sensory}.`,
      `The ${location.name} feels ${this.randomAdjective()}. ${location.history || ''}`,
      `${sensory}. This is ${location.name}. ${location.warning || ''}`,
    ];

    return templates[Math.floor(Math.random() * templates.length)].trim();
  }

  // Generate system message (save, load, etc.)
  generateSystemMessage(type, context = {}) {
    const messages = {
      save: [
        'Memory preserved. For now.',
        'The settlement remembers this moment.',
        'Saved. The dust settles.',
        'Recorded. Whether you want it to be or not.'
      ],
      load: [
        'Returning to what was.',
        'The past resurfaces.',
        'Memory reconstructed.',
        'You were here before. You are here again.'
      ],
      death: [
        'The ground claims another.',
        'Silence. Then nothing.',
        "Some things don't survive Ashfall.",
        'The settlement continues. Without you.'
      ],
      newArea: [
        `Entering ${context.areaName || 'unknown territory'}. ${this.randomSensory()}`,
        `${context.areaName || 'A new place'}. The air changes here.`,
        `You cross into ${context.areaName || 'somewhere new'}. Something watches.`
      ],
      questUpdate: [
        'Something shifts in the settlement.',
        'The balance changes.',
        'Consequences accumulate.',
        `${context.npcName || 'Someone'} will remember this.`
      ],
      flagSet: [
        'You know something new. It weighs.',
        'Truth, like ash, settles.',
        'Memory stores this.',
        'The settlement shifts around what you know.'
      ]
    };

    const options = messages[type] || messages.save;
    return options[Math.floor(Math.random() * options.length)];
  }

  // Generate dialogue preamble based on weather/time/state
  generateDialoguePreamble(weather, npcId) {
    const weatherPreambles = {
      fog: [
        '*Through the fog, a figure.*',
        '*They emerge from the grey.*'
      ],
      wind: [
        '*You have to raise your voice over the wind.*',
        '*Dust stings your eyes as you approach.*'
      ],
      stillness: [
        '*The silence makes your footsteps loud.*',
        '*They heard you coming.*'
      ],
      tremors: [
        '*The ground settled just as you arrived.*',
        '*Dust still falls from their shoulders.*'
      ],
      ashfall: [
        '*Ash clings to their hair.*',
        '*They wipe grey from their face.*'
      ],
      dust_storm: [
        '*You can barely see each other.*',
        '*Words get lost in the howl.*'
      ]
    };

    const options = weatherPreambles[weather] || weatherPreambles.stillness;
    return options[Math.floor(Math.random() * options.length)];
  }

  randomAdjective() {
    return this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
  }

  randomSensory() {
    return this.sensoryFragments[
      Math.floor(Math.random() * this.sensoryFragments.length)
    ];
  }
}
