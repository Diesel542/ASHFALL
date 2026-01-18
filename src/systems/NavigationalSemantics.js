// src/systems/NavigationalSemantics.js
// Landmark-based navigation - "past the yard" not "north"

export class NavigationalSemantics {
  constructor() {
    // Ashfall's spatial layout - locations relative to each other
    this.spatialRelations = {
      market: {
        well: 'past the counting stones',
        gate: 'toward the boundary posts',
        shaft: 'past the well, where no one goes',
        commons: 'where the voices gather',
        infirmary: 'near where the wounded rest',
        edda_dwelling: 'past the old scales, tucked away',
        perimeter: 'toward where Ashfall ends'
      },
      well: {
        market: 'back toward the trading space',
        gate: 'away from here, toward the posts',
        shaft: 'deeper in, where the ground hums',
        commons: 'where people still gather',
        infirmary: 'where Jonas tends',
        edda_dwelling: 'where the paper woman lives',
        perimeter: 'toward the edge'
      },
      gate: {
        market: 'into the settlement, by the scales',
        well: 'past the market, by the old stones',
        shaft: 'deep inside, where no one should go',
        commons: 'where the settlement meets',
        infirmary: 'where the healer works',
        edda_dwelling: 'past the gathering place',
        perimeter: 'along the edge, either way'
      },
      shaft: {
        market: 'back toward the living',
        well: 'by the leaning stones',
        gate: 'far from here, where light is',
        commons: 'where voices still sound human',
        infirmary: 'where wounds can heal',
        edda_dwelling: 'where someone keeps the names',
        perimeter: 'anywhere but here'
      },
      commons: {
        market: 'by the old trading stones',
        well: 'toward the leaning well',
        gate: 'toward the boundary',
        shaft: 'where we don\'t speak of',
        infirmary: 'where Jonas works',
        edda_dwelling: 'where the keeper lives',
        perimeter: 'toward the dust'
      },
      infirmary: {
        market: 'where trading happens',
        well: 'by the bad water',
        gate: 'toward the way out',
        shaft: 'where the ground is wrong',
        commons: 'where voices carry',
        edda_dwelling: 'where records are kept',
        perimeter: 'toward nothing'
      },
      edda_dwelling: {
        market: 'where things change hands',
        well: 'where the water went bad',
        gate: 'the way in, or out',
        shaft: 'the place below',
        commons: 'the gathering space',
        infirmary: 'where Jonas mends',
        perimeter: 'the edge of everything'
      },
      perimeter: {
        market: 'back into Ashfall proper',
        well: 'toward the heart of it',
        gate: 'where the posts mark entry',
        shaft: 'the worst part',
        commons: 'where people pretend normalcy',
        infirmary: 'where pain is managed',
        edda_dwelling: 'where someone remembers'
      }
    };

    // General landmarks for use in any context
    this.landmarks = {
      major: [
        'the old well',
        'the gate posts',
        'the market stones',
        'the shaft boarding',
        'the speaking stone'
      ],
      minor: [
        'the bent signpost',
        'the dead tree',
        'the rubble pile',
        'the rust stain',
        'the cracked foundation',
        'the leaning wall',
        'where the fire was'
      ],
      personal: {
        mara: 'Mara\'s usual spot',
        jonas: 'the infirmary steps',
        rask: 'where Rask watches',
        edda: 'Edda\'s doorway',
        kale: 'wherever Kale was last'
      }
    };

    // Distance descriptors (never precise)
    this.distances = {
      close: [
        'just past',
        'near',
        'by',
        'beside',
        'a stone\'s throw from'
      ],
      medium: [
        'past',
        'beyond',
        'through',
        'on the other side of',
        'a walk from'
      ],
      far: [
        'far past',
        'well beyond',
        'at the edge near',
        'as far as you can go toward',
        'where Ashfall barely reaches'
      ]
    };

    // Directional descriptions (never compass directions)
    this.directions = {
      toward_center: [
        'toward the heart of it',
        'deeper into Ashfall',
        'where people still gather',
        'inward'
      ],
      toward_edge: [
        'toward the dust',
        'where Ashfall ends',
        'toward nothing',
        'outward'
      ],
      along: [
        'following the worn path',
        'along the old foundations',
        'where feet have made a trail',
        'the way others walk'
      ]
    };
  }

  // Get directions from one location to another
  getDirections(fromLocation, toLocation) {
    if (fromLocation === toLocation) {
      return 'You\'re already there.';
    }

    const relations = this.spatialRelations[fromLocation];
    if (relations && relations[toLocation]) {
      return relations[toLocation];
    }

    // Fallback - generic direction
    return this.getGenericDirection(fromLocation, toLocation);
  }

  // Generate a generic direction when specific isn't defined
  getGenericDirection(from, to) {
    const centerLocations = ['market', 'commons', 'well'];
    const edgeLocations = ['gate', 'perimeter', 'shaft'];

    const fromCenter = centerLocations.includes(from);
    const toCenter = centerLocations.includes(to);

    if (fromCenter && !toCenter) {
      return this.randomFrom(this.directions.toward_edge);
    } else if (!fromCenter && toCenter) {
      return this.randomFrom(this.directions.toward_center);
    } else {
      return this.randomFrom(this.directions.along);
    }
  }

  // Get a contextual landmark reference
  getLandmarkReference(context = 'general') {
    if (context === 'major' || context === 'general') {
      return this.randomFrom(this.landmarks.major);
    } else if (context === 'minor') {
      return this.randomFrom(this.landmarks.minor);
    } else if (this.landmarks.personal[context]) {
      return this.landmarks.personal[context];
    }
    return this.randomFrom(this.landmarks.minor);
  }

  // Generate a location description using landmarks
  describeLocation(locationId, detailLevel = 'brief') {
    const landmarks = this.landmarks;
    const distance = this.randomFrom(this.distances.close);

    if (detailLevel === 'brief') {
      return `${distance} ${this.getLandmarkReference('minor')}`;
    } else {
      return `${distance} ${this.getLandmarkReference('major')}, ${this.randomFrom(this.directions.along)}`;
    }
  }

  // Convert compass direction to Ashfall-speak
  convertCompassDirection(compassDir) {
    const conversions = {
      'north': 'toward the gate',
      'south': 'deeper into the settlement',
      'east': 'toward the perimeter',
      'west': 'toward the old structures',
      'northeast': 'toward the gate and beyond',
      'northwest': 'toward the gate, past the wall',
      'southeast': 'toward the edge, the long way',
      'southwest': 'into the shadows of the old buildings'
    };

    return conversions[compassDir.toLowerCase()] || 'that way';
  }

  // Check if text contains forbidden navigation language
  containsForbiddenNavigation(text) {
    const forbidden = [
      /\b(north|south|east|west|northeast|northwest|southeast|southwest)\b/gi,
      /\b(\d+)\s*(meters?|feet|yards|miles?|kilometers?)\b/gi,
      /\b(coordinates?|grid|sector|zone\s+\d)\b/gi,
      /\b(left|right)\s+at\b/gi,  // Too precise
      /\b(exactly|precisely|approximately)\s+\d/gi
    ];

    for (const pattern of forbidden) {
      if (pattern.test(text)) {
        return true;
      }
    }
    return false;
  }

  // Auto-correct navigation language in text
  correctNavigationLanguage(text) {
    let corrected = text;

    // Replace compass directions
    const compassReplacements = [
      [/\bnorth\b/gi, 'toward the gate'],
      [/\bsouth\b/gi, 'deeper in'],
      [/\beast\b/gi, 'toward the edge'],
      [/\bwest\b/gi, 'toward the old walls'],
      [/\bnortheast\b/gi, 'toward the gate'],
      [/\bnorthwest\b/gi, 'past the market'],
      [/\bsoutheast\b/gi, 'toward the perimeter'],
      [/\bsouthwest\b/gi, 'past the well']
    ];

    for (const [pattern, replacement] of compassReplacements) {
      corrected = corrected.replace(pattern, replacement);
    }

    // Remove precise distances
    corrected = corrected.replace(/\b\d+\s*(meters?|feet|yards)\b/gi, 'a ways');
    corrected = corrected.replace(/\b\d+\s*(miles?|kilometers?)\b/gi, 'far');

    return corrected;
  }

  // Get a vague distance description
  getVagueDistance(isClose) {
    if (isClose) {
      return this.randomFrom(this.distances.close);
    } else {
      return this.randomFrom([
        ...this.distances.medium,
        ...this.distances.far
      ]);
    }
  }

  // Helper: random selection from array
  randomFrom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Generate NPC-appropriate directions (they speak in landmarks, not precision)
  generateNpcDirections(fromLocation, toLocation, npcId) {
    const baseDirection = this.getDirections(fromLocation, toLocation);

    // NPCs add their own flavor
    const npcPrefixes = {
      mara: 'You\'ll go',
      jonas: 'If you must... head',
      rask: '*gestures*',
      edda: 'The path leads',
      kale: 'People usually go'
    };

    const prefix = npcPrefixes[npcId] || 'Head';

    if (npcId === 'rask') {
      return `${prefix} ${baseDirection}`;  // Rask just gestures
    }

    return `${prefix} ${baseDirection}.`;
  }
}
