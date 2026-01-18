// src/systems/GhostOverride.js
// When Curie-Δ bleeds through the player's GHOST voice
// Creates the unsettling effect of something older speaking through memory

export class GhostOverride {
  constructor(curieEntity) {
    this.curie = curieEntity;
  }

  // Check if Curie should override GHOST this turn
  shouldOverride() {
    const influence = this.curie.getGhostInfluence();
    if (!influence || !influence.active) return false;

    return Math.random() < influence.overrideChance;
  }

  // Generate Curie-influenced GHOST line
  generateOverrideLine(context = {}) {
    const influence = this.curie.getGhostInfluence();
    if (!influence) return null;

    // Get a Curie fragment
    const curieFragment = influence.fragments[0];

    // Curie-GHOST hybrid lines
    const hybridLines = [
      `${curieFragment} ...you've heard this before. Haven't you?`,
      `The memory shifts. ${curieFragment}`,
      `${curieFragment} ...the pattern is familiar.`,
      `Something older than memory speaks: ${curieFragment}`,
      `GHOST flickers. Beneath it: ${curieFragment}`,
      `${curieFragment} ...we remember you remembering.`,
      `The voice that isn't GHOST: ${curieFragment}`,
      `${curieFragment} ...or did we dream this?`
    ];

    const line = hybridLines[Math.floor(Math.random() * hybridLines.length)];

    return {
      voice: 'GHOST',
      text: line,
      color: '#cc88ff',
      curieInfluenced: true,
      intensity: influence.intensity,
      setFlag: 'ghost_curie_overlap'
    };
  }

  // Get a pure Curie line (for high activity moments)
  generatePureCurieLine() {
    const fragments = this.curie.selectFragments();
    if (fragments.length === 0) return null;

    // Combine fragments for a more substantial message
    const fragment = fragments[0];
    const secondFragment = fragments[1] || '';

    const templates = [
      `${fragment}`,
      `${fragment} ${secondFragment}`,
      `—${fragment}—`,
      `[static] ${fragment} [static]`,
      `...${fragment.replace('...', '')}...`
    ];

    return {
      voice: 'CURIE',
      text: templates[Math.floor(Math.random() * templates.length)],
      color: '#ffffff', // White - distinct from GHOST purple
      curieInfluenced: true,
      intensity: this.curie.state.activity
    };
  }

  // Get visual/audio cues for Curie-influenced GHOST
  getOverrideCues() {
    return {
      textEffect: 'flicker', // Text should visually flicker
      colorShift: true,      // Color shifts slightly toward white
      soundCue: 'hum_spike', // Brief hum increase
      screenEffect: 'subtle_static' // Very subtle visual noise
    };
  }

  // Check if conditions are right for Curie to manifest
  canManifest() {
    return this.curie.state.activity > 0.3;
  }

  // Get the intensity of Curie's current influence
  getInfluenceIntensity() {
    const influence = this.curie.getGhostInfluence();
    return influence ? influence.intensity : 0;
  }

  // Determine if this GHOST line should be modified
  modifyGhostLine(originalLine) {
    if (!this.shouldOverride()) {
      return { modified: false, line: originalLine };
    }

    const influence = this.curie.getGhostInfluence();
    const fragment = influence.fragments[0];

    // Subtle modifications to existing GHOST lines
    const modifiedLines = [
      `${originalLine} ${fragment}`,
      `${fragment} ...no, that was: ${originalLine}`,
      `${originalLine.split('.')[0]}. ${fragment}`,
      `[${fragment}] ${originalLine}`
    ];

    return {
      modified: true,
      line: modifiedLines[Math.floor(Math.random() * modifiedLines.length)],
      curieInfluence: fragment,
      cues: this.getOverrideCues()
    };
  }

  // Get prompt injection for when GHOST speaks during high Curie activity
  getGhostPromptInjection() {
    if (this.curie.state.activity < 0.4) return '';

    const intensity = Math.floor(this.curie.state.activity * 100);

    return `
CURIE-Δ BLEEDING THROUGH (${intensity}%):
Something older is interfering with GHOST. Your lines may:
- Trail off into fragments that aren't yours
- Reference things the player hasn't experienced yet
- Blur between memory and prophecy
- Include patterns from the settlement's collective guilt

Fragments bleeding through: "${this.curie.selectFragments().join('" "')}"

Speak as GHOST, but with occasional static—moments where the voice isn't quite yours.`;
  }
}
