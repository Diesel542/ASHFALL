// src/systems/LocationContext.js
// Location-aware context injection for NPC dialogue

export class LocationContext {
  constructor() {
    this.currentLocation = 'market';

    // Every location in Ashfall with its emotional properties
    this.locations = {
      market: {
        name: 'The Market',
        description: 'What passes for commerce. Mostly barter. Mostly silence.',
        landmarks: ['near the counting stones', 'by the old scales', 'where traders used to gather'],
        emotionalField: {
          effect: 'nostalgia',
          modifier: 'Allows reminiscence. NPCs may share fragments of before.',
          stressModifier: 0,
          deflectionModifier: -10  // Less guarded here
        },
        voiceBonus: {
          EMPATHY: 15,  // Memories trigger emotional perception
          GHOST: 5      // Echoes of commerce past
        },
        npcFeelings: {
          mara: 'Control point. She watches everything that changes hands.',
          jonas: 'Brings him memories. He traded here with his daughter.',
          rask: 'Exposed. Too many angles to watch.',
          edda: 'Comfortable. Information flows through markets.',
          kale: 'Observes patterns. Good place to learn what people value.'
        },
        ambientDetails: [
          'Empty stalls cast long shadows.',
          'The scales hang crooked. No one bothers to fix them.',
          'Dust coats the counting stones.'
        ]
      },

      well: {
        name: 'The Well',
        description: 'The old well. Something wrong with the water. No one drinks from it anymore.',
        landmarks: ['by the well', 'near the stone lip', 'where the water used to be clean'],
        emotionalField: {
          effect: 'deflection',
          modifier: 'NPCs avoid direct answers. Conversations circle.',
          stressModifier: 10,
          deflectionModifier: 25  // Much more guarded
        },
        voiceBonus: {
          GHOST: 25,    // The well remembers
          EMPATHY: 10   // Something sorrowful here
        },
        npcFeelings: {
          mara: 'Avoids it. The water remembers her decisions.',
          jonas: 'Guilt. He tested the water. He knows what\'s in it.',
          rask: 'Won\'t go near it. Says it watches him.',
          edda: 'Drawn to it. The well knows secrets she guards.',
          kale: 'Uncomfortable. Too many emotions to mirror here.'
        },
        ambientDetails: [
          'The well leans slightly. As if ashamed.',
          'Something glints in the depths. Or doesn\'t.',
          'The stone lip is worn smooth by hands that no longer reach.'
        ]
      },

      gate: {
        name: 'The Gate',
        description: 'Ashfall\'s only entrance. What comes in, what goes out. If anything.',
        landmarks: ['at the gate', 'near the posts', 'by the boundary markers'],
        emotionalField: {
          effect: 'vigilance',
          modifier: 'Heightened awareness. NPCs scan for threats.',
          stressModifier: 15,
          deflectionModifier: 5
        },
        voiceBonus: {
          INSTINCT: 25,  // Threat detection peaks here
          LOGIC: 10      // Evaluating who comes and goes
        },
        npcFeelings: {
          mara: 'Her domain. She decides who enters, who leaves.',
          jonas: 'Anxious. Remembers those who left and never returned.',
          rask: 'Comfortable. Clear sightlines. Knows his role here.',
          edda: 'Watches the horizon. The wasteland sends messages.',
          kale: 'Studies arrivals. New people to observe, to become.'
        },
        ambientDetails: [
          'The posts creak in the wind.',
          'Someone carved marks into the gate. Counting something.',
          'Beyond: dust, and more dust.'
        ]
      },

      shaft: {
        name: 'The Shaft',
        description: 'The old mine entrance. Boarded up. The boards are new.',
        landmarks: ['near the shaft', 'by the boarded entrance', 'where the ground hums'],
        emotionalField: {
          effect: 'dread',
          modifier: 'Maximum stress. NPCs want to leave. Conversations truncate.',
          stressModifier: 30,
          deflectionModifier: 40  // Everyone deflects here
        },
        voiceBonus: {
          GHOST: 40,     // The shaft screams with memory
          INSTINCT: 20   // Primal fear response
        },
        npcFeelings: {
          mara: 'Rigid. This is what she protects the settlement from.',
          jonas: 'Trembling. He\'s been down there. He won\'t say what he saw.',
          rask: 'The only place that makes him speak. "Don\'t."',
          edda: 'Drawn against her will. The earth whispers her name.',
          kale: 'Refuses to come here. Says he can\'t mirror what\'s below.'
        },
        ambientDetails: [
          'The boards are new. The nails, newer.',
          'The ground hums. Or you imagine it does.',
          'Twenty-three names carved near the entrance. None recent.'
        ]
      },

      commons: {
        name: 'The Commons',
        description: 'Where decisions get made. Where voices carry.',
        landmarks: ['in the commons', 'by the speaking stone', 'where the settlement gathers'],
        emotionalField: {
          effect: 'exposure',
          modifier: 'Public space. NPCs aware of being observed.',
          stressModifier: 5,
          deflectionModifier: 15
        },
        voiceBonus: {
          LOGIC: 20,    // Political calculations
          EMPATHY: 15   // Reading the crowd
        },
        npcFeelings: {
          mara: 'Her stage. She performs authority here.',
          jonas: 'Uncomfortable. Too many people who need things.',
          rask: 'Peripheral. Watches from the edges.',
          edda: 'Information hub. Listens more than speaks.',
          kale: 'Studies group dynamics. Lots to learn.'
        },
        ambientDetails: [
          'The speaking stone is worn smooth from years of hands.',
          'People gather in clusters. Never alone here.',
          'Voices carry further than they should.'
        ]
      },

      infirmary: {
        name: 'The Infirmary',
        description: 'Jonas\'s domain. Smells of herbs and old blood.',
        landmarks: ['in the infirmary', 'near the cots', 'where the wounded go'],
        emotionalField: {
          effect: 'vulnerability',
          modifier: 'Defenses lower. Pain makes truth easier.',
          stressModifier: -5,
          deflectionModifier: -15  // Easier to open up
        },
        voiceBonus: {
          EMPATHY: 30,  // Suffering is visible here
          LOGIC: 5      // Medical deduction
        },
        npcFeelings: {
          mara: 'Rare visitor. Dislikes seeing weakness.',
          jonas: 'Home. The only place he feels useful.',
          rask: 'Avoids unless injured. Vulnerability disturbs him.',
          edda: 'Brings herbs. Stays to listen to the fevered.',
          kale: 'Studies pain responses. Disturbing but educational.'
        },
        ambientDetails: [
          'The cots are never all empty.',
          'Herbs hang drying. Some you recognize. Some you don\'t.',
          'Someone moans softly in the corner.'
        ]
      },

      edda_dwelling: {
        name: 'Edda\'s Dwelling',
        description: 'Small. Cluttered with dried plants and bound papers.',
        landmarks: ['in Edda\'s place', 'among her papers', 'where she keeps the records'],
        emotionalField: {
          effect: 'secrets',
          modifier: 'Edda\'s territory. Others feel like intruders.',
          stressModifier: 10,
          deflectionModifier: 20
        },
        voiceBonus: {
          GHOST: 20,    // Old documents hold memories
          LOGIC: 15     // Patterns in the archives
        },
        npcFeelings: {
          mara: 'Uncomfortable. Too many records she\'d rather not exist.',
          jonas: 'Respectful. Edda remembers things he needs forgotten.',
          rask: 'Never enters. Says the papers watch him.',
          edda: 'Her sanctuary. Every secret has its place.',
          kale: 'Fascinated. So many identities to study.'
        },
        ambientDetails: [
          'Papers rustle though there\'s no wind.',
          'Dried flowers mark certain pages. A system only she understands.',
          'The ink smell never fades.'
        ]
      },

      perimeter: {
        name: 'The Perimeter',
        description: 'The edge of Ashfall. Where settlement meets wasteland.',
        landmarks: ['at the edge', 'near the boundary', 'where Ashfall ends'],
        emotionalField: {
          effect: 'liminality',
          modifier: 'Threshold space. NPCs contemplate leaving or staying.',
          stressModifier: 20,
          deflectionModifier: 0  // Honesty at the edge
        },
        voiceBonus: {
          INSTINCT: 15,  // Danger from outside
          GHOST: 15      // Memories of those who left
        },
        npcFeelings: {
          mara: 'Patrol. She knows every weak point.',
          jonas: 'Melancholy. His daughter walked this way.',
          rask: 'Alert. This is where threats come from.',
          edda: 'Whispers to the wind. It whispers back.',
          kale: 'Watches the horizon. Wondering who he\'d become out there.'
        },
        ambientDetails: [
          'The wind is stronger here.',
          'Footprints lead out. None lead back.',
          'The wasteland stretches. Empty. Patient.'
        ]
      }
    };
  }

  // Set current location
  setLocation(locationId) {
    if (this.locations[locationId]) {
      this.currentLocation = locationId;
      return true;
    }
    return false;
  }

  // Get current location data
  getCurrentLocation() {
    return this.locations[this.currentLocation];
  }

  // Get location-specific prompt injection for an NPC
  getLocationPrompt(npcId) {
    const location = this.getCurrentLocation();
    const npcFeeling = location.npcFeelings[npcId] || 'Wary. This place holds no comfort.';
    const ambient = location.ambientDetails[
      Math.floor(Math.random() * location.ambientDetails.length)
    ];

    return `
CURRENT LOCATION: ${location.name}
${location.description}

YOUR FEELING ABOUT THIS PLACE: ${npcFeeling}

AMBIENT DETAIL: ${ambient}

LOCATION EFFECT: ${location.emotionalField.effect.toUpperCase()}
${location.emotionalField.modifier}

Use location-relative directions: "${location.landmarks[0]}", "${location.landmarks[1]}" - never compass directions or coordinates.`;
  }

  // Get emotional modifiers for current location
  getEmotionalModifiers() {
    const location = this.getCurrentLocation();
    return {
      stressModifier: location.emotionalField.stressModifier,
      deflectionModifier: location.emotionalField.deflectionModifier,
      effect: location.emotionalField.effect
    };
  }

  // Get voice bonuses for current location
  getVoiceBonuses() {
    const location = this.getCurrentLocation();
    return location.voiceBonus || {};
  }

  // Get a random landmark reference for the current location
  getLandmarkReference() {
    const location = this.getCurrentLocation();
    return location.landmarks[
      Math.floor(Math.random() * location.landmarks.length)
    ];
  }

  // Get ambient detail for current location
  getAmbientDetail() {
    const location = this.getCurrentLocation();
    return location.ambientDetails[
      Math.floor(Math.random() * location.ambientDetails.length)
    ];
  }

  // Check if NPC would want to leave this location
  wantsToLeave(npcId) {
    const location = this.getCurrentLocation();
    const stress = location.emotionalField.stressModifier;

    // Special cases
    if (this.currentLocation === 'shaft' && npcId !== 'edda') {
      return true;  // Everyone but Edda wants to leave the shaft
    }
    if (this.currentLocation === 'infirmary' && npcId === 'jonas') {
      return false;  // Jonas is comfortable in his infirmary
    }

    return stress >= 25;
  }

  // Get all location IDs
  getAllLocationIds() {
    return Object.keys(this.locations);
  }
}
