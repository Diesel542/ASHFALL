# ASHFALL: Settlement Geography Implementation

## Overview

This document translates Aria's Settlement Geography into game systems. Every location in Ashfall has:
- Physical presence (visuals, position)
- Emotional field (affects NPC behavior and dialogue)
- Navigational semantics (how NPCs refer to it)
- NPC affinities (who is drawn to or avoids it)

**Core principle:** Everyone is trying to live around a wound.

---

## 1. Location Database

```javascript
// src/data/locations.js

export const LOCATIONS = {
  
  gate: {
    id: 'gate',
    name: 'The Gate',
    localNames: ['the gate', 'the front', 'the line'],
    
    description: {
      visual: 'A reinforced scrap-metal barrier facing the open wasteland. Rusted hinges. A pulley system that screams when used.',
      brief: 'The gate. Rusted. Watching the dark.'
    },
    
    emotional: {
      role: 'Fear and vigilance. The threshold between safety and threat.',
      field: 'vigilance',
      intensity: 0.7
    },
    
    npcAffinities: {
      mara: { attraction: 0.9, reason: 'Her domain of control' },
      rask: { attraction: 0.6, reason: 'Watches it at night, silently' },
      kale: { attraction: -0.8, reason: 'Never goes near unless following someone' },
      jonas: { attraction: 0.0, reason: 'Neutral' },
      edda: { attraction: 0.2, reason: 'Occasionally checks' }
    },
    
    dialogueRules: [
      'Never say it\'s sturdy—everyone knows it\'s not',
      'Reference the wasteland beyond with unease'
    ],
    
    position: { x: 0, y: 8 }, // Grid position
    size: { width: 3, height: 1 }
  },

  well: {
    id: 'well',
    name: 'The Well',
    localNames: ['the well', 'the old well', 'that well'],
    
    description: {
      visual: 'An old stone well, half-collapsed. The rope is frayed. The bucket is missing. Nobody draws water here anymore.',
      brief: 'The well. Half-collapsed. Avoided.'
    },
    
    emotional: {
      role: 'Shame. Avoidance. A memory the settlement tries not to face.',
      field: 'shame',
      intensity: 0.8
    },
    
    npcAffinities: {
      edda: { attraction: 0.7, reason: 'Lingers at dawn' },
      jonas: { attraction: -0.9, reason: 'Avoids looking at it entirely' },
      rask: { attraction: 0.3, reason: 'Tells children not to play near it' },
      mara: { attraction: 0.0, reason: 'Practical avoidance' },
      kale: { attraction: 0.1, reason: 'Curious but wary' }
    },
    
    dialogueRules: [
      'NEVER state directly why it\'s avoided',
      'Allowed hints: "bad water," "bad memories," "it leans like it\'s tired"'
    ],
    
    position: { x: 5, y: 5 },
    size: { width: 1, height: 1 }
  },

  watchtower: {
    id: 'watchtower',
    name: 'Mara\'s Watchtower',
    localNames: ['the tower', 'the lookout', 'the scaffold', 'the bones', 'my tower'],
    
    description: {
      visual: 'A scaffold of welded beams, barely stable. Offers the best view of the wasteland, though the wood platform creaks underfoot.',
      brief: 'The scaffold. Creaking. Watching.'
    },
    
    emotional: {
      role: 'Authority, burden, isolation.',
      field: 'authority',
      intensity: 0.6
    },
    
    npcAffinities: {
      mara: { attraction: 1.0, reason: 'Her vigil-space. Sometimes sleeps there.' },
      rask: { attraction: -0.3, reason: 'Respects the boundary' },
      jonas: { attraction: -0.2, reason: 'Uncomfortable with heights' },
      edda: { attraction: 0.1, reason: 'Occasionally speaks with Mara there' },
      kale: { attraction: -0.5, reason: 'Feels unwelcome' }
    },
    
    dialogueRules: [
      'Mara calls it "my tower" or "the lookout"',
      'Others call it "the scaffold" or "the bones"',
      'Nobody else feels welcome atop it'
    ],
    
    position: { x: 2, y: 2 },
    size: { width: 2, height: 2 }
  },

  clinic: {
    id: 'clinic',
    name: 'Jonas\'s Clinic',
    localNames: ['the clinic', 'the room', 'that place', 'the med shack'],
    
    description: {
      visual: 'A shack holding dried herbs, old bandages, salvaged tools. Dust on shelves. A cot never slept in.',
      brief: 'The clinic. Dusty. Waiting.'
    },
    
    emotional: {
      role: 'Guilt. Hesitation. Abandoned purpose.',
      field: 'guilt',
      intensity: 0.7
    },
    
    npcAffinities: {
      jonas: { attraction: -0.8, reason: 'Enters only when forced' },
      mara: { attraction: 0.3, reason: 'Cleans it silently after injuries' },
      kale: { attraction: 0.4, reason: 'Snoops when lonely' },
      edda: { attraction: 0.0, reason: 'Neutral' },
      rask: { attraction: -0.2, reason: 'Avoids enclosed spaces' }
    },
    
    dialogueRules: [
      'Jonas NEVER calls it "my clinic"',
      'He says "the room" or "that place"',
      'Dust and disuse should be mentioned'
    ],
    
    position: { x: 10, y: 4 },
    size: { width: 2, height: 2 }
  },

  childrens_yard: {
    id: 'childrens_yard',
    name: 'The Children\'s Yard',
    localNames: ['the yard', 'the little circle', 'the patch'],
    
    description: {
      visual: 'A corral-like space with scrap toys, chalk marks, and a burnt patch of earth. Surprisingly colorful despite the wasteland.',
      brief: 'The yard. Small colors against grey.'
    },
    
    emotional: {
      role: 'Innocence and dread intertwined.',
      field: 'hope',
      intensity: 0.5
    },
    
    npcAffinities: {
      rask: { attraction: 0.9, reason: 'Watches from distance as protector/penitent' },
      jonas: { attraction: 0.6, reason: 'Smiles here, the only place he does' },
      edda: { attraction: -0.7, reason: 'Avoids entirely' },
      mara: { attraction: 0.2, reason: 'Checks occasionally' },
      kale: { attraction: 0.5, reason: 'Plays with children sometimes' }
    },
    
    dialogueRules: [
      'Mention the contrast—color against grey',
      'Rask\'s presence here should feel protective, not threatening',
      'Edda\'s avoidance should feel significant'
    ],
    
    position: { x: 12, y: 8 },
    size: { width: 2, height: 2 }
  },

  storehouse: {
    id: 'storehouse',
    name: 'The Storehouse',
    localNames: ['the storehouse', 'the stores', 'the supply shed'],
    
    description: {
      visual: 'A squat building of sheet metal with a heavy sliding door. Temperature swings wildly inside.',
      brief: 'The storehouse. Heavy door. Counted contents.'
    },
    
    emotional: {
      role: 'Tension. Resource anxiety. The unspoken suspicion of scarcity.',
      field: 'tension',
      intensity: 0.6
    },
    
    npcAffinities: {
      mara: { attraction: 0.7, reason: 'Monitors stock obsessively' },
      kale: { attraction: 0.4, reason: 'Helps count supplies, often gets numbers wrong' },
      jonas: { attraction: 0.3, reason: 'Hides here to avoid conversations' },
      edda: { attraction: 0.1, reason: 'Occasionally trades' },
      rask: { attraction: 0.0, reason: 'Indifferent' }
    },
    
    dialogueRules: [
      'Conversations here should feel tense and practical',
      'Numbers and supplies are always uncertain',
      'Resource anxiety is subtext'
    ],
    
    position: { x: 8, y: 2 },
    size: { width: 2, height: 2 }
  },

  market_square: {
    id: 'market_square',
    name: 'The Old Market Square',
    localNames: ['the market', 'the square', 'the slabs'],
    
    description: {
      visual: 'A cracked concrete slab with makeshift stalls. Most are empty. A few barter goods laid out on cloth.',
      brief: 'The market. Mostly empty. Echoes of trade.'
    },
    
    emotional: {
      role: 'Ghost of better days. A reminder of what community used to mean.',
      field: 'nostalgia',
      intensity: 0.5
    },
    
    npcAffinities: {
      kale: { attraction: 0.8, reason: 'Gravitates here, mimicking merchants' },
      edda: { attraction: 0.5, reason: 'Sometimes trades cryptic items' },
      mara: { attraction: 0.1, reason: 'Checks occasionally' },
      jonas: { attraction: 0.2, reason: 'Neutral presence' },
      rask: { attraction: -0.3, reason: 'Too exposed' }
    },
    
    dialogueRules: [
      'Tone should be wistful, not busy',
      'Emptiness is the dominant feature',
      'Reference what it used to be'
    ],
    
    position: { x: 6, y: 10 },
    size: { width: 3, height: 2 }
  },

  player_quarters: {
    id: 'player_quarters',
    name: 'Player\'s Quarters',
    localNames: ['your corner', 'your space', 'your little spot', 'the newcomer\'s shed'],
    
    description: {
      visual: 'A small shed-like room with a thin mattress, a crate for possessions, and a door that doesn\'t fully close.',
      brief: 'Your space. Thin mattress. Door that doesn\'t close.'
    },
    
    emotional: {
      role: 'Uncertainty. Beginning. Blank slate.',
      field: 'rootlessness',
      intensity: 0.4
    },
    
    npcAffinities: {
      kale: { attraction: 0.7, reason: 'Visits uninvited' },
      jonas: { attraction: 0.4, reason: 'Leaves supplies quietly' },
      mara: { attraction: 0.2, reason: 'Checks on newcomers' },
      edda: { attraction: 0.1, reason: 'Watches from distance' },
      rask: { attraction: -0.2, reason: 'Respects privacy' }
    },
    
    dialogueRules: [
      'NPCs treat it as temporary',
      'Use diminutive terms: "corner," "spot," "space"',
      'The door that doesn\'t close is a detail worth mentioning'
    ],
    
    position: { x: 4, y: 12 },
    size: { width: 1, height: 1 }
  },

  perimeter_path: {
    id: 'perimeter_path',
    name: 'Perimeter Path',
    localNames: ['the path', 'the perimeter', 'the loop', 'Edda\'s route'],
    
    description: {
      visual: 'A rough loop skirting Ashfall\'s boundary. Dustier than the interior, quiet except for distant hums.',
      brief: 'The perimeter. Dusty. Humming.'
    },
    
    emotional: {
      role: 'Worry. Routine. Burden.',
      field: 'anxiety',
      intensity: 0.5
    },
    
    npcAffinities: {
      edda: { attraction: 1.0, reason: 'Walks here at sunrise and sunset' },
      mara: { attraction: -0.3, reason: 'Avoids unless scouting' },
      rask: { attraction: 0.4, reason: 'Patrols occasionally' },
      jonas: { attraction: 0.0, reason: 'Rarely ventures' },
      kale: { attraction: 0.2, reason: 'Follows Edda sometimes' }
    },
    
    dialogueRules: [
      'Edda uses poetic descriptors here',
      'Others do not—they find it unsettling',
      'The "hum" can be mentioned but not explained'
    ],
    
    position: { x: 0, y: 0 }, // Surrounds settlement
    size: { width: 16, height: 16 },
    isPath: true
  },

  sealed_shaft: {
    id: 'sealed_shaft',
    name: 'The Sealed Shaft',
    localNames: ['the sealed place', 'the hum\'s origin', 'where the 23 were lost', 'the dip', 'that place'],
    
    description: {
      visual: 'A heavy circular metal cover bolted into cracked concrete. Reinforcements added over time. The ground around it dips subtly.',
      brief: 'The shaft. Sealed. Humming beneath.'
    },
    
    emotional: {
      role: 'The wound. The secret. The gravitational center.',
      field: 'forbidden',
      intensity: 1.0
    },
    
    npcAffinities: {
      edda: { attraction: 0.6, reason: 'Terrified reverence; she knows too much' },
      mara: { attraction: 0.3, reason: 'Treats as security threat, not metaphysical' },
      jonas: { attraction: -1.0, reason: 'Won\'t go near it' },
      kale: { attraction: 0.5, reason: 'Drawn for reasons he can\'t explain' },
      rask: { attraction: 0.4, reason: 'Stands guard at night during tremors' }
    },
    
    dialogueRules: [
      'NEVER allow NPCs to describe what\'s inside',
      'Allowed phrases: "the sealed place," "the hum\'s origin," "where the 23 were lost," "the dip"',
      'Everyone feels its presence',
      'Nobody speaks of it plainly'
    ],
    
    position: { x: 7, y: 7 }, // Center of settlement
    size: { width: 2, height: 2 },
    isForbidden: true
  }
};

// Emotional field types and their effects
export const EMOTIONAL_FIELDS = {
  vigilance: {
    effect: 'NPCs are more alert, terse, watchful',
    voiceBonus: 'INSTINCT'
  },
  shame: {
    effect: 'NPCs deflect, avoid eye contact, speak in fragments',
    voiceBonus: 'GHOST'
  },
  authority: {
    effect: 'NPCs are more formal, hierarchical',
    voiceBonus: 'LOGIC'
  },
  guilt: {
    effect: 'NPCs are hesitant, apologetic, avoidant',
    voiceBonus: 'EMPATHY'
  },
  hope: {
    effect: 'NPCs are slightly warmer, but guarded',
    voiceBonus: 'EMPATHY'
  },
  tension: {
    effect: 'NPCs are practical, clipped, resource-focused',
    voiceBonus: 'LOGIC'
  },
  nostalgia: {
    effect: 'NPCs are wistful, reference the past',
    voiceBonus: 'GHOST'
  },
  rootlessness: {
    effect: 'NPCs treat player as temporary, uncertain',
    voiceBonus: null
  },
  anxiety: {
    effect: 'NPCs are restless, speak of boundaries and edges',
    voiceBonus: 'INSTINCT'
  },
  forbidden: {
    effect: 'NPCs deflect aggressively, change subject, grow uncomfortable',
    voiceBonus: 'GHOST'
  }
};
```

---

## 2. Location-Aware Context System

Inject location context into NPC prompts based on where the conversation happens.

```javascript
// src/systems/LocationContext.js

import { LOCATIONS, EMOTIONAL_FIELDS } from '../data/locations.js';

export class LocationContext {
  constructor() {
    this.currentLocation = 'player_quarters'; // Default starting location
  }

  setLocation(locationId) {
    if (LOCATIONS[locationId]) {
      this.currentLocation = locationId;
      window.ASHFALL.currentLocation = locationId;
    }
  }

  getCurrentLocation() {
    return LOCATIONS[this.currentLocation];
  }

  // Generate location context for NPC prompts
  getLocationPrompt(npcId) {
    const location = this.getCurrentLocation();
    if (!location) return '';

    const affinity = location.npcAffinities[npcId];
    const field = EMOTIONAL_FIELDS[location.emotional.field];

    let prompt = `
CURRENT LOCATION: ${location.name}
${location.description.brief}

EMOTIONAL FIELD: ${location.emotional.role}
${field ? `Effect on dialogue: ${field.effect}` : ''}

`;

    // Add NPC-specific location feelings
    if (affinity) {
      if (affinity.attraction > 0.5) {
        prompt += `You feel drawn to this place. ${affinity.reason}\n`;
      } else if (affinity.attraction < -0.5) {
        prompt += `You feel uncomfortable here. ${affinity.reason}\n`;
      }
    }

    // Add location-specific dialogue rules
    if (location.dialogueRules && location.dialogueRules.length > 0) {
      prompt += `\nLOCATION DIALOGUE RULES:\n`;
      prompt += location.dialogueRules.map(r => `- ${r}`).join('\n');
    }

    // Add local terminology
    prompt += `\n\nRefer to this location as: ${location.localNames.slice(0, 3).join(', ')}`;

    return prompt;
  }

  // Get voice bonus for current location
  getVoiceBonus() {
    const location = this.getCurrentLocation();
    if (!location) return null;
    
    const field = EMOTIONAL_FIELDS[location.emotional.field];
    return field?.voiceBonus || null;
  }

  // Check if NPC would naturally be at this location
  isNpcNaturallyHere(npcId) {
    const location = this.getCurrentLocation();
    if (!location) return true;
    
    const affinity = location.npcAffinities[npcId];
    if (!affinity) return true;
    
    // NPCs with negative affinity are less likely to be here
    return affinity.attraction > -0.5;
  }

  // Get reason why NPC is at unexpected location
  getNpcLocationReason(npcId) {
    const location = this.getCurrentLocation();
    if (!location) return null;
    
    const affinity = location.npcAffinities[npcId];
    if (!affinity || affinity.attraction > 0) return null;
    
    // NPC is somewhere they normally avoid
    return `You're here despite your discomfort. Something brought you here—mention it if asked.`;
  }

  // Get directional cues for NPC dialogue
  getDirectionalCues() {
    const location = this.getCurrentLocation();
    const cues = [];

    // Always know where the shaft is
    cues.push({ 
      target: 'sealed_shaft', 
      phrase: 'near the dip', 
      direction: this.getRelativeDirection('sealed_shaft')
    });

    // Add nearby locations
    for (const [id, loc] of Object.entries(LOCATIONS)) {
      if (id !== this.currentLocation && this.isAdjacent(id)) {
        cues.push({
          target: id,
          phrase: loc.localNames[0],
          direction: this.getRelativeDirection(id)
        });
      }
    }

    return cues;
  }

  getRelativeDirection(targetId) {
    const current = this.getCurrentLocation();
    const target = LOCATIONS[targetId];
    
    if (!current || !target) return 'nearby';
    
    const dx = target.position.x - current.position.x;
    const dy = target.position.y - current.position.y;
    
    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return 'nearby';
    if (dy < 0) return 'toward the gate';
    if (dy > 0) return 'toward the edge';
    if (dx < 0) return 'past the yard';
    if (dx > 0) return 'behind the storehouse';
    
    return 'across the settlement';
  }

  isAdjacent(targetId) {
    const current = this.getCurrentLocation();
    const target = LOCATIONS[targetId];
    
    if (!current || !target) return false;
    
    const dx = Math.abs(target.position.x - current.position.x);
    const dy = Math.abs(target.position.y - current.position.y);
    
    return dx <= 4 && dy <= 4;
  }
}
```

---

## 3. Navigational Semantics

Rules for how NPCs refer to locations in dialogue.

```javascript
// src/systems/NavigationalSemantics.js

import { LOCATIONS } from '../data/locations.js';

export class NavigationalSemantics {
  
  // Convert formal location name to NPC-appropriate reference
  getLocalName(locationId, npcId = null) {
    const location = LOCATIONS[locationId];
    if (!location) return locationId;

    // Some NPCs have specific names for places
    const npcSpecific = {
      mara: {
        watchtower: 'my tower',
        gate: 'the line'
      },
      jonas: {
        clinic: 'that place',
        well: '...' // Jonas won't name it
      },
      edda: {
        sealed_shaft: 'the dip',
        perimeter_path: 'my walk'
      }
    };

    if (npcId && npcSpecific[npcId]?.[locationId]) {
      return npcSpecific[npcId][locationId];
    }

    // Return a random local name
    const names = location.localNames;
    return names[Math.floor(Math.random() * Math.min(names.length, 2))];
  }

  // Generate directional phrase from one location to another
  getDirections(fromId, toId, npcId = null) {
    const from = LOCATIONS[fromId];
    const to = LOCATIONS[toId];
    
    if (!from || !to) return 'somewhere';

    const dx = to.position.x - from.position.x;
    const dy = to.position.y - from.position.y;

    // Build natural direction phrase
    const phrases = [];
    
    if (dy < -3) {
      phrases.push('toward the front');
    } else if (dy > 3) {
      phrases.push('toward the edge');
    }
    
    if (dx < -3) {
      phrases.push('past the old market');
    } else if (dx > 3) {
      phrases.push('behind the storehouse');
    }

    // Reference a landmark if nearby
    const nearbyLandmarks = this.getNearbyLandmarks(toId);
    if (nearbyLandmarks.length > 0) {
      const landmark = nearbyLandmarks[0];
      phrases.push(`near ${this.getLocalName(landmark, npcId)}`);
    }

    if (phrases.length === 0) {
      return 'not far';
    }

    return phrases.join(', ');
  }

  getNearbyLandmarks(locationId) {
    const location = LOCATIONS[locationId];
    if (!location) return [];

    const landmarks = [];
    
    for (const [id, loc] of Object.entries(LOCATIONS)) {
      if (id === locationId) continue;
      if (loc.isPath) continue; // Skip paths as landmarks
      
      const dx = Math.abs(loc.position.x - location.position.x);
      const dy = Math.abs(loc.position.y - location.position.y);
      
      if (dx <= 3 && dy <= 3) {
        landmarks.push(id);
      }
    }

    return landmarks;
  }

  // Validate that dialogue uses proper local terminology
  validateLocationReferences(dialogue) {
    const issues = [];
    
    // Check for forbidden formal names
    const forbiddenTerms = [
      { term: 'The Sealed Shaft', suggestion: 'the dip, the sealed place' },
      { term: 'Jonas\'s Clinic', suggestion: 'the clinic, that place' },
      { term: 'Mara\'s Watchtower', suggestion: 'the tower, the scaffold' },
      { term: 'Player\'s Quarters', suggestion: 'your corner, your spot' },
      { term: 'Children\'s Yard', suggestion: 'the yard, the patch' },
      { term: 'Perimeter Path', suggestion: 'the path, the loop' },
      { term: 'Market Square', suggestion: 'the market, the square' },
    ];

    for (const { term, suggestion } of forbiddenTerms) {
      if (dialogue.includes(term)) {
        issues.push({
          type: 'formal_location_name',
          found: term,
          suggestion: `Use: ${suggestion}`
        });
      }
    }

    // Check for modern directional language
    const modernTerms = ['north', 'south', 'east', 'west', 'coordinates', 'meters', 'GPS'];
    for (const term of modernTerms) {
      if (dialogue.toLowerCase().includes(term.toLowerCase())) {
        issues.push({
          type: 'modern_navigation',
          found: term,
          suggestion: 'Use relative directions: "past the yard," "near the dip," "behind the storehouse"'
        });
      }
    }

    return issues;
  }

  // Generate example directions for prompt injection
  getExampleDirections() {
    return [
      '"It\'s past the yard, near where the ground dips."',
      '"Behind the storehouse. Quieter there."',
      '"Closer to the front. Near the line."',
      '"You\'ll find it by the old well. If you must."'
    ];
  }
}
```

---

## 4. Integration with Agent System

Update the AgentBase to include location context:

```javascript
// In AgentBase.js - add these methods

getLocationContext() {
  const locationContext = window.ASHFALL.locationContext;
  if (!locationContext) return '';
  
  return locationContext.getLocationPrompt(this.codex.id);
}

buildFullPrompt(playerInput, flags) {
  // ... existing code ...

  return `${this.getIdentityPrompt()}

${this.getTonePrimer()}

${this.getLocationContext()}

${this.getKnowledgePrompt(flags)}
// ... rest of prompt
`;
}
```

---

## 5. Emotional Field Effects

Apply location emotional fields to dialogue generation:

```javascript
// src/systems/EmotionalFieldEffects.js

import { EMOTIONAL_FIELDS } from '../data/locations.js';

export class EmotionalFieldEffects {
  
  // Modify NPC behavior based on current location's emotional field
  applyFieldEffect(npcResponse, locationId) {
    const location = LOCATIONS[locationId];
    if (!location) return npcResponse;

    const field = EMOTIONAL_FIELDS[location.emotional.field];
    if (!field) return npcResponse;

    // Adjust response based on field type
    switch (location.emotional.field) {
      case 'shame':
        // Add deflection markers
        npcResponse.modifiers = npcResponse.modifiers || [];
        npcResponse.modifiers.push('deflection', 'avoidance');
        break;
        
      case 'tension':
        // Make dialogue more clipped
        npcResponse.maxSentences = 2;
        break;
        
      case 'forbidden':
        // Increase discomfort
        npcResponse.stressModifier = (npcResponse.stressModifier || 0) + 10;
        break;
        
      case 'nostalgia':
        // Allow past references
        npcResponse.allowPastReferences = true;
        break;
    }

    return npcResponse;
  }

  // Get voice threshold modifier for location
  getVoiceThresholdModifier(voiceName, locationId) {
    const location = LOCATIONS[locationId];
    if (!location) return 0;

    const field = EMOTIONAL_FIELDS[location.emotional.field];
    if (!field) return 0;

    // If this voice matches the location's bonus voice, lower threshold
    if (field.voiceBonus === voiceName) {
      return -2; // Easier to trigger
    }

    return 0;
  }
}
```

---

## 6. Location Prompt Injection Template

What gets injected into every NPC prompt based on location:

```javascript
// Example: Conversation at The Well with Edda

const locationPrompt = `
CURRENT LOCATION: The Well
The well. Half-collapsed. Avoided.

EMOTIONAL FIELD: Shame. Avoidance. A memory the settlement tries not to face.
Effect on dialogue: NPCs deflect, avoid eye contact, speak in fragments

You feel drawn to this place. Lingers at dawn

LOCATION DIALOGUE RULES:
- NEVER state directly why it's avoided
- Allowed hints: "bad water," "bad memories," "it leans like it's tired"

Refer to this location as: the well, the old well, that well

NEARBY LANDMARKS:
- The sealed place is nearby (the dip)
- The storehouse is past the yard

DIRECTIONAL EXAMPLES:
- "It's past the yard, near where the ground dips."
- "Behind the storehouse. Quieter there."
`;
```

---

## 7. Map Visualization Data

For rendering the isometric map:

```javascript
// src/data/mapLayout.js

export const MAP_LAYOUT = {
  width: 16,
  height: 16,
  
  // Terrain types
  terrain: {
    dust: { color: '#8B7355', walkable: true },
    concrete: { color: '#696969', walkable: true },
    metal: { color: '#4A4A4A', walkable: false },
    path: { color: '#9B8B75', walkable: true }
  },

  // Building footprints (for collision and rendering)
  buildings: [
    { id: 'watchtower', x: 2, y: 2, w: 2, h: 2, height: 3 },
    { id: 'storehouse', x: 8, y: 2, w: 2, h: 2, height: 1 },
    { id: 'clinic', x: 10, y: 4, w: 2, h: 2, height: 1 },
    { id: 'player_quarters', x: 4, y: 12, w: 1, h: 1, height: 1 }
  ],

  // Points of interest (non-building locations)
  poi: [
    { id: 'gate', x: 0, y: 8, w: 3, h: 1, type: 'barrier' },
    { id: 'well', x: 5, y: 5, w: 1, h: 1, type: 'object' },
    { id: 'sealed_shaft', x: 7, y: 7, w: 2, h: 2, type: 'forbidden' },
    { id: 'childrens_yard', x: 12, y: 8, w: 2, h: 2, type: 'area' },
    { id: 'market_square', x: 6, y: 10, w: 3, h: 2, type: 'area' }
  ],

  // NPC spawn/patrol points
  npcSpawns: {
    mara: [
      { x: 2, y: 3, time: 'day', activity: 'watching from tower' },
      { x: 1, y: 8, time: 'night', activity: 'patrolling gate' }
    ],
    jonas: [
      { x: 11, y: 5, time: 'day', activity: 'sitting outside clinic' },
      { x: 8, y: 3, time: 'evening', activity: 'hiding in storehouse' }
    ],
    rask: [
      { x: 13, y: 9, time: 'day', activity: 'watching children' },
      { x: 1, y: 8, time: 'night', activity: 'guarding gate' }
    ],
    edda: [
      { x: 5, y: 5, time: 'dawn', activity: 'standing at well' },
      { x: 0, y: 4, time: 'sunset', activity: 'walking perimeter' }
    ],
    kale: [
      { x: 7, y: 10, time: 'day', activity: 'lingering at market' },
      { x: 4, y: 12, time: 'evening', activity: 'near player quarters' }
    ]
  }
};
```

---

## Summary

The Settlement Geography implementation includes:

| System | Purpose |
|--------|---------|
| **Location Database** | All locations with emotional fields, NPC affinities, dialogue rules |
| **LocationContext** | Injects location-aware context into NPC prompts |
| **NavigationalSemantics** | Ensures NPCs use local terminology, not formal names |
| **EmotionalFieldEffects** | Modifies dialogue based on location's emotional weight |
| **Map Layout** | Rendering data for the isometric world |

**Key insight:** The sealed shaft is at the center. Everything orbits the wound.

---

*"Everyone is trying to live around a wound."*

*— Aria's geography, translated to coordinates*
