// src/data/locations.js

export const LOCATIONS = {
  gate: {
    name: 'The Gate',
    description: 'Heavy metal, patched and re-patched. The only way in or out.',
    connections: ['market_square', 'perimeter_path'],
    emotionalField: 'threshold',
    defaultNpcs: ['rask']
  },

  market_square: {
    name: 'Market Square',
    description: 'Empty stalls. Ghost of commerce. The dustiest place in Ashfall.',
    connections: ['gate', 'well', 'player_quarters'],
    emotionalField: 'absence',
    defaultNpcs: ['kale']
  },

  clinic: {
    name: "Jonas's Clinic",
    description: 'A shack with dusty windows. The door is open but uninviting.',
    connections: ['storehouse'],
    emotionalField: 'paralysis',
    defaultNpcs: ['jonas']
  },

  watchtower: {
    name: "Mara's Watchtower",
    description: 'Scaffold of beams. Highest point in the settlement. Isolated.',
    connections: ['perimeter_path', 'storehouse'],
    emotionalField: 'vigilance',
    defaultNpcs: ['mara']
  },

  storehouse: {
    name: 'The Storehouse',
    description: "Largest intact building. Locked. Mara's territory.",
    connections: ['well', 'clinic', 'watchtower', 'sealed_shaft'],
    emotionalField: 'scarcity',
    defaultNpcs: []
  },

  well: {
    name: 'The Old Well',
    description: 'Cracked stone, half-collapsed. Nobody looks at it directly.',
    connections: ['market_square', 'storehouse', 'sealed_shaft'],
    emotionalField: 'shame',
    defaultNpcs: []
  },

  perimeter_path: {
    name: 'Perimeter Path',
    description: "Dusty track along the settlement's edge. Edda walks here.",
    connections: ['gate', 'watchtower'],
    emotionalField: 'boundary',
    defaultNpcs: ['edda']
  },

  player_quarters: {
    name: 'Your Quarters',
    description: "Thin walls. Door doesn't close right. But it's yours.",
    connections: ['market_square'],
    emotionalField: 'liminal',
    defaultNpcs: []
  },

  sealed_shaft: {
    name: 'The Sealed Shaft',
    description: 'The center of everything. A metal cover. The ground dips toward it.',
    connections: ['well', 'storehouse'],
    emotionalField: 'dread',
    defaultNpcs: [],
    special: true
  }
};
