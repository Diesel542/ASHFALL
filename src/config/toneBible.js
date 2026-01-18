// ASHFALL - Tone Bible
// Compressed tone reference for prompts and validation

export const TONE_BIBLE_COMPRESSED = `
ASHFALL TONE (MEMORIZE):

PILLARS:
• Bleak but not hopeless. Hope is rationed.
• Intimate, not epic. Personal stakes.
• Human, even when broken. No pure villains.
• Sparse, sharp language. Every word weighted.
• The world is watching. Everything feels aware.

DIALOGUE RULES:
• Half-phrases normal. People don't speak cleanly.
• Emotion hides behind precision, silence, tasks.
• Humor is bone-dry, never bright.
• No exposition dumps. Truth is dragged out.
• Maximum 3 sentences. Usually fewer.

PROHIBITED:
• Modern slang
• Melodrama
• Heroic language
• Exclamation overuse
• Flowery description
• Exposition monologues

TOUCHSTONES:
"Small lives. Heavy truths."
"The earth remembers."
"Hope is rationed."
"Nothing here is whole."
`;

export const VOICE_TONES = {
  LOGIC: 'Cold. Precise. Observational. "Her story has inconsistencies."',
  INSTINCT: 'Feral. Pre-verbal. Visceral. "Back away. Now."',
  EMPATHY: 'Soft. Perceptive. Aching. "He\'s terrified you\'ll make him choose."',
  GHOST: 'Cryptic. Poetic. Wrong. "The soil hums your name."'
};

// Quick reference for tone validation
export const TONE_PROHIBITIONS = {
  modern_slang: ['awesome', 'cool', 'okay', 'dude', 'guys', 'yeah', 'nope', 'gonna', 'wanna'],
  cheerful_words: ['wonderful', 'fantastic', 'amazing', 'great', 'excellent', 'perfect'],
  epic_language: ['destiny', 'hero', 'champion', 'legendary', 'epic', 'glorious', 'triumph'],
  exposition_markers: ['let me tell you', 'as you know', 'you see', 'basically', 'essentially'],
  melodrama: ['never ever', 'absolutely', 'completely and utterly', 'with all my heart']
};

// Good Ashfall dialogue examples
export const TONE_EXAMPLES = [
  "Things break here. Sometimes people do too.",
  "Well, we're not dead. Yet. Let's call that a win.",
  "The well leans slightly, as if ashamed of what it knows.",
  "Hope is a resource, same as water. I ration both.",
  "The ground remembers. We pretend it doesn't.",
  "Pain is honest. Everything else? Negotiable.",
  "Don't linger near the old well. The wind gets... confused there."
];
