// ASHFALL - Dialogue System
// Branching conversations with memory
//
// Core features:
// - [ ] Dialogue tree parser (JSON → runtime)
// - [ ] Choice presentation with skill checks
// - [ ] Voice interruptions (LOGIC, INSTINCT, EMPATHY, GHOST)
// - [ ] Memory flags (NPCs remember what you said)
// - [ ] Consequence hooks (choices trigger state changes)
//
// The dialogue engine is the heart of Ashfall.
// Every conversation is a chance to reveal or conceal who you are.

export class DialogueSystem {
  constructor() {
    this.flags = new Map();      // What has happened
    this.memories = new Map();   // What NPCs remember
    this.voices = {
      logic: { level: 5, active: true },
      instinct: { level: 5, active: true },
      empathy: { level: 5, active: true },
      ghost: { level: 5, active: true }
    };
  }

  // Check if a voice can interrupt
  canVoiceSpeak(voice, threshold) {
    return this.voices[voice].active && this.voices[voice].level >= threshold;
  }

  // Set a flag (something happened)
  setFlag(key, value = true) {
    this.flags.set(key, value);
  }

  // Check a flag
  hasFlag(key) {
    return this.flags.get(key) || false;
  }

  // NPC remembers something
  remember(npc, memory) {
    if (!this.memories.has(npc)) {
      this.memories.set(npc, []);
    }
    this.memories.get(npc).push(memory);
  }

  // What does this NPC remember?
  getMemories(npc) {
    return this.memories.get(npc) || [];
  }
}

export default DialogueSystem;
