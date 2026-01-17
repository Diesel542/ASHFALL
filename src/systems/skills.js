// ASHFALL - Skill Check System
// Your stats aren't passive. They speak.
//
// The four voices:
// - LOGIC: Cold analysis, pattern recognition, sees through lies
// - INSTINCT: Gut feelings, danger sense, survival wisdom  
// - EMPATHY: Reading others, feeling what they won't say
// - GHOST: Memory, trauma, the past that speaks
//
// Voices can:
// - Interrupt dialogue with observations
// - Unlock special dialogue options
// - Warn you (correctly or incorrectly)
// - Contradict each other

export class SkillSystem {
  constructor() {
    this.skills = {
      logic: {
        level: 5,
        name: 'LOGIC',
        color: '#88ccff',
        description: 'Cold analysis. The part that sees through lies but misses the heart.'
      },
      instinct: {
        level: 5,
        name: 'INSTINCT', 
        color: '#ff8844',
        description: 'Gut feelings. The part that keeps you alive but might make you cruel.'
      },
      empathy: {
        level: 5,
        name: 'EMPATHY',
        color: '#88ff88',
        description: 'Reading others. The part that understands everyone but might paralyze you.'
      },
      ghost: {
        level: 5,
        name: 'GHOST',
        color: '#cc88ff',
        description: 'Memory. The part that reminds you who you were.'
      }
    };
  }

  // Perform a skill check
  check(skill, difficulty, context = {}) {
    const skillData = this.skills[skill];
    if (!skillData) return { success: false, margin: -999 };

    const roll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1; // 2d6
    const total = roll + skillData.level;
    const success = total >= difficulty;
    const margin = total - difficulty;

    return {
      success,
      margin,
      roll,
      skillLevel: skillData.level,
      total,
      difficulty,
      skill: skillData.name
    };
  }

  // Check if a voice can interrupt at this threshold
  canInterrupt(skill, threshold) {
    return this.skills[skill]?.level >= threshold;
  }

  // Get all possible interruptions for a scene
  getAvailableInterruptions(scene) {
    const available = [];
    
    for (const interrupt of scene.interruptions || []) {
      if (this.canInterrupt(interrupt.skill, interrupt.threshold)) {
        available.push({
          ...interrupt,
          voice: this.skills[interrupt.skill]
        });
      }
    }

    return available;
  }

  // Format a voice interruption for display
  formatInterruption(skill, text) {
    const voice = this.skills[skill];
    return {
      voice: voice.name,
      color: voice.color,
      text: text,
      // Style: italicized, indented, clearly "internal"
    };
  }
}

export default SkillSystem;
