// src/ui/UIConstants.js

/**
 * UI CONSTANTS
 *
 * Colors, fonts, dimensions, and timing for the Ashfall UI.
 * Design philosophy: Minimal, atmospheric, unobtrusive.
 */

export const UI_COLORS = {
  // Backgrounds
  bgDarkest: 0x1a1714,
  bgDark: 0x2d2a26,
  bgMedium: 0x3d3832,

  // Text (CSS color strings)
  textPrimary: '#e8dcc8',
  textSecondary: '#a89a85',
  textMuted: '#6b6358',

  // Accents (hex values)
  accentRust: 0x8b4513,
  accentBlood: 0x6b3030,
  accentAsh: 0x9b9085,

  // Voice colors (CSS color strings)
  voiceLogic: '#88ccff',
  voiceInstinct: '#ff8844',
  voiceEmpathy: '#88ff88',
  voiceGhost: '#cc88ff',

  // States
  selected: '#e8dcc8',
  unselected: '#6b6358',
  hover: '#a89a85'
};

export const UI_FONTS = {
  dialogue: {
    fontFamily: 'Georgia, serif',
    fontSize: '18px',
    color: UI_COLORS.textPrimary
  },
  speaker: {
    fontFamily: 'Impact, sans-serif',
    fontSize: '14px',
    color: UI_COLORS.textSecondary,
    letterSpacing: 2
  },
  voice: {
    fontFamily: '"Courier New", monospace',
    fontSize: '14px',
    fontStyle: 'italic'
  },
  choice: {
    fontFamily: 'Georgia, serif',
    fontSize: '16px'
  },
  hud: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: UI_COLORS.textMuted
  }
};

export const UI_DIMENSIONS = {
  dialogueBox: {
    width: 700,
    height: 200,
    padding: 20,
    portraitSize: 150
  },
  voicePanel: {
    width: 600,
    lineHeight: 28
  },
  choicePanel: {
    width: 500,
    optionHeight: 36
  }
};

export const UI_TIMING = {
  textSpeed: 30,
  fadeIn: 300,
  fadeOut: 200,
  voiceDelay: 500,
  voiceDuration: 3000,
  choiceDelay: 200
};

/**
 * Get voice color by voice type
 */
export function getVoiceColor(voice) {
  const colors = {
    LOGIC: UI_COLORS.voiceLogic,
    INSTINCT: UI_COLORS.voiceInstinct,
    EMPATHY: UI_COLORS.voiceEmpathy,
    GHOST: UI_COLORS.voiceGhost
  };
  return colors[voice] || UI_COLORS.textPrimary;
}

/**
 * Get voice hex color for Phaser graphics
 */
export function getVoiceHexColor(voice) {
  const colors = {
    LOGIC: 0x88ccff,
    INSTINCT: 0xff8844,
    EMPATHY: 0x88ff88,
    GHOST: 0xcc88ff
  };
  return colors[voice] || 0xe8dcc8;
}
