// src/data/npcData.js

/**
 * NPC display data for UI components
 */

export const NPC_DATA = {
  mara: {
    name: 'Mara',
    portrait: 'mara_guarded',
    color: 0x8b4513,
    title: 'The Leader',
    description: 'Keeps the settlement running through sheer force of will.'
  },

  jonas: {
    name: 'Jonas',
    portrait: 'jonas_distant',
    color: 0x6b8e6b,
    title: 'The Healer',
    description: 'Medical knowledge he refuses to use. Hands that remember.'
  },

  rask: {
    name: 'Rask',
    portrait: 'rask_watching',
    color: 0x4a4a4a,
    title: 'The Gatekeeper',
    description: 'Watches everything. Trusts no one. Protects without speaking.'
  },

  edda: {
    name: 'Edda',
    portrait: 'edda_cryptic',
    color: 0x9b8b7b,
    title: 'The Seer',
    description: 'Walks the perimeter. Hears things others dismiss.'
  },

  kale: {
    name: 'Kale',
    portrait: 'kale_eager',
    color: 0x7b7b9b,
    title: 'The Mirror',
    description: 'Young. Unstable. Reflects what he sees in others.'
  }
};

/**
 * Portrait variants for each NPC
 */
export const NPC_PORTRAITS = {
  mara: ['mara_guarded', 'mara_commanding', 'mara_cracking'],
  jonas: ['jonas_distant', 'jonas_pained', 'jonas_warmth'],
  rask: ['rask_watching', 'rask_warning', 'rask_softness'],
  edda: ['edda_cryptic', 'edda_frightened', 'edda_prophetic'],
  kale: ['kale_eager', 'kale_confused', 'kale_slipping']
};

/**
 * Get NPC display name (capitalized)
 */
export function getNpcDisplayName(npcId) {
  return NPC_DATA[npcId]?.name || npcId.charAt(0).toUpperCase() + npcId.slice(1);
}

/**
 * Get NPC color for map markers
 */
export function getNpcColor(npcId) {
  return NPC_DATA[npcId]?.color || 0x666666;
}
