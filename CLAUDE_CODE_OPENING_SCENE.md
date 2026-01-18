# ASHFALL: Opening Scene Implementation

## Overview

This document implements the **first playable moment** of Ashfall. It establishes tone, activates the internal voices, introduces every NPC visually, and seeds the core mystery.

**Core principle:** This scene is the quiet ignition. Everything after builds on the impressions formed here.

---

## 1. Scene Structure

```javascript
// src/scenes/OpeningScene.js

import Phaser from 'phaser';

/**
 * OPENING SCENE: "The Quiet Arrival"
 * 
 * Structure:
 * 1. Environmental establishing shot
 * 2. First internal voice activation
 * 3. Rask gatekeeper moment
 * 4. Entering the settlement (NPC glimpses)
 * 5. Optional first tremor
 * 6. Free movement begins
 */

export class OpeningScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OpeningScene' });
    
    this.state = {
      phase: 'establishing',  // establishing → voices → gate → enter → tremor → free
      voicesActivated: false,
      raskEncounterComplete: false,
      firstTremorTriggered: false,
      playerChoices: [],
      dominantFirstImpression: null
    };
  }

  create() {
    // Initialize game systems
    this.initializeSystems();
    
    // Start the sequence
    this.beginEstablishingShot();
  }

  initializeSystems() {
    // Ensure global state exists
    window.ASHFALL = window.ASHFALL || {};
    window.ASHFALL.flags = window.ASHFALL.flags || new Set();
    window.ASHFALL.relationships = window.ASHFALL.relationships || new Map([
      ['mara', 50],
      ['jonas', 50],
      ['rask', 50],
      ['edda', 50],
      ['kale', 50]
    ]);
    window.ASHFALL.voiceScores = {
      LOGIC: 0,
      INSTINCT: 0,
      EMPATHY: 0,
      GHOST: 0
    };
  }

  // ═══════════════════════════════════════
  // PHASE 1: ESTABLISHING SHOT
  // ═══════════════════════════════════════

  beginEstablishingShot() {
    this.state.phase = 'establishing';
    
    // Fade in from black
    this.cameras.main.fadeIn(2000, 0, 0, 0);
    
    // Environmental text sequence
    const environmentalText = [
      { text: "The wind carries dust across a barren ridge.", delay: 0 },
      { text: "Ash drifts like slow snowfall, dissolving against old metal fences.", delay: 2500 },
      { text: "Below, the settlement huddles in a shallow dip in the land—", delay: 5000 },
      { text: "structures leaning, patched, trembling in the gusts.", delay: 7000 },
      { text: "A faint hum rolls under the ground.", delay: 9500 },
      { text: "Barely noticeable. Unclaimed by any machine you can see.", delay: 11500 }
    ];

    this.displayEnvironmentalSequence(environmentalText, () => {
      this.time.delayedCall(2000, () => {
        this.triggerFirstVoices();
      });
    });
  }

  displayEnvironmentalSequence(texts, onComplete) {
    const style = {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: '#a89a85',
      align: 'center',
      wordWrap: { width: 600 }
    };

    let currentText = null;

    texts.forEach((item, index) => {
      this.time.delayedCall(item.delay, () => {
        // Fade out previous text
        if (currentText) {
          this.tweens.add({
            targets: currentText,
            alpha: 0,
            duration: 500
          });
        }

        // Create new text
        currentText = this.add.text(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2,
          item.text,
          style
        ).setOrigin(0.5).setAlpha(0);

        // Fade in
        this.tweens.add({
          targets: currentText,
          alpha: 1,
          duration: 800
        });

        // If last text, trigger callback
        if (index === texts.length - 1) {
          this.time.delayedCall(2500, () => {
            this.tweens.add({
              targets: currentText,
              alpha: 0,
              duration: 1000,
              onComplete: onComplete
            });
          });
        }
      });
    });
  }

  // ═══════════════════════════════════════
  // PHASE 2: FIRST INTERNAL VOICES
  // ═══════════════════════════════════════

  triggerFirstVoices() {
    this.state.phase = 'voices';
    this.state.voicesActivated = true;

    const voiceSequence = [
      {
        voice: 'LOGIC',
        text: "Population low. Structures unstable. Resources uncertain. Risk level: high.",
        color: '#88ccff',
        delay: 0
      },
      {
        voice: 'INSTINCT',
        text: "Gate smells wrong. Metal… afraid.",
        color: '#ff8844',
        delay: 3000
      },
      {
        voice: 'EMPATHY',
        text: "They're holding on to something. All of them. You can feel it from here.",
        color: '#88ff88',
        delay: 6000
      },
      {
        voice: 'GHOST',
        text: "The ground hums your name. Quietly. Not yet yours.",
        color: '#cc88ff',
        delay: 9000
      }
    ];

    this.displayVoiceSequence(voiceSequence, () => {
      this.time.delayedCall(2000, () => {
        this.beginRaskEncounter();
      });
    });
  }

  displayVoiceSequence(voices, onComplete) {
    const baseY = this.cameras.main.height - 150;

    voices.forEach((voice, index) => {
      this.time.delayedCall(voice.delay, () => {
        const voiceText = this.add.text(
          50,
          baseY,
          `[${voice.voice}] ${voice.text}`,
          {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: voice.color,
            fontStyle: 'italic',
            wordWrap: { width: this.cameras.main.width - 100 }
          }
        ).setAlpha(0);

        // Fade in
        this.tweens.add({
          targets: voiceText,
          alpha: 1,
          duration: 500
        });

        // Fade out after delay
        this.time.delayedCall(2500, () => {
          this.tweens.add({
            targets: voiceText,
            alpha: 0,
            duration: 500,
            onComplete: () => voiceText.destroy()
          });
        });

        // Trigger completion after last voice
        if (index === voices.length - 1) {
          this.time.delayedCall(3500, onComplete);
        }
      });
    });
  }

  // ═══════════════════════════════════════
  // PHASE 3: RASK GATEKEEPER
  // ═══════════════════════════════════════

  beginRaskEncounter() {
    this.state.phase = 'gate';

    // Show Rask's introduction
    this.showDialogueBox({
      speaker: 'RASK',
      portrait: 'rask_neutral',
      text: "*He studies you for too long before speaking.*",
      isAction: true
    });

    this.time.delayedCall(2000, () => {
      this.showDialogueBox({
        speaker: 'RASK',
        portrait: 'rask_neutral',
        text: "You're new. Or lost. Or trouble. Sometimes they're the same thing."
      });

      this.time.delayedCall(1500, () => {
        this.showRaskChoices();
      });
    });
  }

  showRaskChoices() {
    const choices = [
      {
        id: 'confident',
        text: "Just passing through.",
        tone: 'confident',
        voiceBonus: { LOGIC: 1, INSTINCT: 1 }
      },
      {
        id: 'humble',
        text: "I'm here to work, if there's work.",
        tone: 'humble',
        voiceBonus: { EMPATHY: 1 }
      },
      {
        id: 'curious',
        text: "Is this Ashfall?",
        tone: 'curious',
        voiceBonus: { LOGIC: 1 }
      },
      {
        id: 'silent',
        text: "*Remain silent.*",
        tone: 'silent',
        voiceBonus: { INSTINCT: 1, GHOST: 1 }
      }
    ];

    this.displayChoices(choices, (choice) => {
      this.handleRaskResponse(choice);
    });
  }

  handleRaskResponse(choice) {
    // Record choice
    this.state.playerChoices.push({
      moment: 'rask_gate',
      choice: choice.id,
      tone: choice.tone
    });

    // Apply voice bonus
    for (const [voice, bonus] of Object.entries(choice.voiceBonus)) {
      window.ASHFALL.voiceScores[voice] += bonus;
    }

    // Rask's response based on player tone
    const responses = {
      confident: {
        dialogue: "*His eyes narrow.* Passing through. Right. Everyone's passing through. Until they're not.",
        voiceReactions: [
          { voice: 'LOGIC', text: "Assessment: he's testing boundaries." },
          { voice: 'INSTINCT', text: "He could break bone. Yours." }
        ],
        relationshipDelta: -5  // Wary
      },
      humble: {
        dialogue: "*A slight shift in his stance.* Work. There's always work. Whether they'll let you do it… different question.",
        voiceReactions: [
          { voice: 'EMPATHY', text: "He softened. Just slightly. Don't push." },
          { voice: 'INSTINCT', text: "He's tired. Beyond tired." }
        ],
        relationshipDelta: +5
      },
      curious: {
        dialogue: "What's left of it. *He glances back at the settlement.* Don't let the name fool you. Fire's long gone. Just the ash now.",
        voiceReactions: [
          { voice: 'LOGIC', text: "Informative response. He's not hostile to questions." },
          { voice: 'GHOST', text: "He stands where the hum doesn't reach. Why?" }
        ],
        relationshipDelta: 0
      },
      silent: {
        dialogue: "*A long pause. Then something like respect.* Fine. Quiet's honest. More than most.",
        voiceReactions: [
          { voice: 'INSTINCT', text: "He respects the silence. Remember that." },
          { voice: 'GHOST', text: "Words cost him too. He noticed you don't spend them freely." }
        ],
        relationshipDelta: +10
      }
    };

    const response = responses[choice.tone];

    // Update relationship
    const currentRel = window.ASHFALL.relationships.get('rask');
    window.ASHFALL.relationships.set('rask', currentRel + response.relationshipDelta);

    // Display Rask's response
    this.showDialogueBox({
      speaker: 'RASK',
      text: response.dialogue
    });

    // Display voice reactions
    this.time.delayedCall(2500, () => {
      this.displayVoiceReactions(response.voiceReactions, () => {
        this.completeRaskEncounter(choice.tone);
      });
    });
  }

  displayVoiceReactions(reactions, onComplete) {
    reactions.forEach((reaction, index) => {
      this.time.delayedCall(index * 2000, () => {
        const colors = {
          LOGIC: '#88ccff',
          INSTINCT: '#ff8844',
          EMPATHY: '#88ff88',
          GHOST: '#cc88ff'
        };

        const text = this.add.text(
          50,
          this.cameras.main.height - 100,
          `[${reaction.voice}] ${reaction.text}`,
          {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: colors[reaction.voice],
            fontStyle: 'italic'
          }
        ).setAlpha(0);

        this.tweens.add({
          targets: text,
          alpha: 1,
          duration: 300
        });

        this.time.delayedCall(1800, () => {
          this.tweens.add({
            targets: text,
            alpha: 0,
            duration: 300,
            onComplete: () => {
              text.destroy();
              if (index === reactions.length - 1) {
                onComplete();
              }
            }
          });
        });
      });
    });
  }

  completeRaskEncounter(playerTone) {
    this.state.raskEncounterComplete = true;
    this.state.dominantFirstImpression = playerTone;

    // Rask lets player enter
    const exitLines = {
      confident: "Go on, then. *He steps aside.* Don't make me regret it.",
      humble: "*He nods.* Talk to Mara. She decides who stays.",
      curious: "You'll find your answers. Or they'll find you. *He steps aside.*",
      silent: "*He simply steps aside. No more words needed.*"
    };

    this.showDialogueBox({
      speaker: 'RASK',
      text: exitLines[playerTone]
    });

    this.time.delayedCall(2500, () => {
      this.hideDialogueBox();
      this.beginSettlementEntry();
    });
  }

  // ═══════════════════════════════════════
  // PHASE 4: ENTERING THE SETTLEMENT
  // ═══════════════════════════════════════

  beginSettlementEntry() {
    this.state.phase = 'enter';

    // Transition to settlement view
    this.cameras.main.fadeOut(500, 0, 0, 0);
    
    this.time.delayedCall(600, () => {
      // Load settlement map
      this.scene.start('SettlementScene', {
        firstEntry: true,
        playerTone: this.state.dominantFirstImpression,
        voiceScores: window.ASHFALL.voiceScores,
        choices: this.state.playerChoices
      });
    });
  }
}
```

---

## 2. Settlement Entry Sequence

The moment after passing through the gate.

```javascript
// src/scenes/SettlementEntrySequence.js

/**
 * Called when player first enters the settlement
 * Shows all NPCs in their characteristic positions
 */

export class SettlementEntrySequence {
  constructor(scene) {
    this.scene = scene;
    this.npcGlimpses = [];
  }

  play(onComplete) {
    // Show each NPC in sequence
    const glimpses = [
      {
        npc: 'mara',
        location: 'watchtower',
        description: "On the watchtower, a woman scans the horizon. Her posture says 'control.' Her grip on the railing says something else.",
        voiceHint: { voice: 'LOGIC', text: "Leader. But stretched thin." }
      },
      {
        npc: 'jonas',
        location: 'clinic',
        description: "Outside a small shack, a man sweeps dust that will never leave. His hands are steady. His eyes are somewhere else.",
        voiceHint: { voice: 'EMPATHY', text: "He's pretending. At something. At everything." }
      },
      {
        npc: 'kale',
        location: 'market_square',
        description: "A young man lingers near empty stalls, watching you with cautious fascination. He mirrors your posture before catching himself.",
        voiceHint: { voice: 'INSTINCT', text: "Mimic. Uncertain. Not a threat—but not stable." }
      },
      {
        npc: 'edda',
        location: 'perimeter_path',
        description: "At the edge of the settlement, an old woman pauses mid-step. She felt something. She's looking at you like she expected you.",
        voiceHint: { voice: 'GHOST', text: "She knows things. Careful." }
      }
    ];

    this.displayGlimpseSequence(glimpses, () => {
      // Optional first tremor
      this.triggerFirstTremor(onComplete);
    });
  }

  displayGlimpseSequence(glimpses, onComplete) {
    let index = 0;

    const showNext = () => {
      if (index >= glimpses.length) {
        onComplete();
        return;
      }

      const glimpse = glimpses[index];
      this.showGlimpse(glimpse, () => {
        index++;
        this.scene.time.delayedCall(500, showNext);
      });
    };

    showNext();
  }

  showGlimpse(glimpse, onComplete) {
    // Highlight NPC on map
    this.scene.highlightNpc(glimpse.npc);

    // Show description
    const descText = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height - 180,
      glimpse.description,
      {
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        color: '#a89a85',
        align: 'center',
        wordWrap: { width: 600 }
      }
    ).setOrigin(0.5).setAlpha(0);

    this.scene.tweens.add({
      targets: descText,
      alpha: 1,
      duration: 500
    });

    // Show voice hint after brief delay
    this.scene.time.delayedCall(1500, () => {
      const colors = {
        LOGIC: '#88ccff',
        INSTINCT: '#ff8844',
        EMPATHY: '#88ff88',
        GHOST: '#cc88ff'
      };

      const voiceText = this.scene.add.text(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height - 120,
        `[${glimpse.voiceHint.voice}] ${glimpse.voiceHint.text}`,
        {
          fontFamily: 'Courier New',
          fontSize: '14px',
          color: colors[glimpse.voiceHint.voice],
          fontStyle: 'italic'
        }
      ).setOrigin(0.5).setAlpha(0);

      this.scene.tweens.add({
        targets: voiceText,
        alpha: 1,
        duration: 300
      });

      // Fade out both after delay
      this.scene.time.delayedCall(2000, () => {
        this.scene.tweens.add({
          targets: [descText, voiceText],
          alpha: 0,
          duration: 500,
          onComplete: () => {
            descText.destroy();
            voiceText.destroy();
            this.scene.unhighlightNpc(glimpse.npc);
            onComplete();
          }
        });
      });
    });
  }

  triggerFirstTremor(onComplete) {
    // Small tremor - seeds the mystery
    
    // Screen shake
    this.scene.cameras.main.shake(800, 0.005);

    // Environmental text
    const tremorText = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      "A subtle tremor.\nThe well's stones shift softly.",
      {
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
        color: '#a89a85',
        align: 'center'
      }
    ).setOrigin(0.5).setAlpha(0);

    this.scene.tweens.add({
      targets: tremorText,
      alpha: 1,
      duration: 300
    });

    // NPC reactions (brief visual cues)
    this.showTremorReactions();

    // GHOST whisper
    this.scene.time.delayedCall(1500, () => {
      const ghostText = this.scene.add.text(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2 + 80,
        '[GHOST] "It remembers you. Or mistakes you. Both are dangerous."',
        {
          fontFamily: 'Courier New',
          fontSize: '14px',
          color: '#cc88ff',
          fontStyle: 'italic'
        }
      ).setOrigin(0.5).setAlpha(0);

      this.scene.tweens.add({
        targets: ghostText,
        alpha: 1,
        duration: 300
      });

      // Clean up and continue
      this.scene.time.delayedCall(3000, () => {
        this.scene.tweens.add({
          targets: [tremorText, ghostText],
          alpha: 0,
          duration: 500,
          onComplete: () => {
            tremorText.destroy();
            ghostText.destroy();
            
            // Set flag
            window.ASHFALL.flags.add('first_tremor_felt');
            
            // Begin free movement
            onComplete();
          }
        });
      });
    });
  }

  showTremorReactions() {
    // Brief visual indicators of NPC reactions
    // These would be sprite animations or emotes
    
    const reactions = {
      mara: { type: 'freeze', duration: 800 },
      jonas: { type: 'flinch', duration: 600 },
      rask: { type: 'look_toward_shaft', duration: 1000 },
      kale: { type: 'mirror_player', duration: 500 },
      edda: { type: 'whisper', duration: 1200 }
    };

    for (const [npc, reaction] of Object.entries(reactions)) {
      this.scene.playNpcReaction(npc, reaction.type, reaction.duration);
    }
  }
}
```

---

## 3. First NPC Interaction Router

Determines which NPC to guide player toward based on their choices.

```javascript
// src/systems/FirstInteractionRouter.js

/**
 * FIRST INTERACTION ROUTER
 * 
 * Based on player's tone at the gate, subtly guides them
 * toward an appropriate first NPC conversation.
 */

export class FirstInteractionRouter {
  constructor() {
    this.recommendations = {
      confident: {
        primary: 'mara',
        reason: "Confident players should meet the leader first",
        npcHighlight: true
      },
      humble: {
        primary: 'jonas',
        reason: "Empathetic players will connect with the healer",
        npcHighlight: true
      },
      curious: {
        primary: 'kale',
        reason: "Curious players will intrigue the mirror",
        npcHighlight: true
      },
      silent: {
        primary: 'edda',
        reason: "Silent players earn the secret-keeper's attention",
        npcHighlight: true
      }
    };
  }

  getRecommendation(playerTone) {
    return this.recommendations[playerTone] || this.recommendations.curious;
  }

  // Generate subtle guidance without forcing
  getGuidanceText(playerTone) {
    const guidance = {
      confident: {
        text: "The woman on the watchtower has noticed you. She's waiting.",
        voice: 'LOGIC',
        voiceText: "She's the authority here. Start there."
      },
      humble: {
        text: "The man by the clinic glances your way. There's recognition in it.",
        voice: 'EMPATHY',
        voiceText: "He sees something in you. Or wants to."
      },
      curious: {
        text: "The young man in the market is studying you. Learning you.",
        voice: 'INSTINCT',
        voiceText: "He's already adapting to you. Interesting."
      },
      silent: {
        text: "The old woman at the perimeter hasn't moved. She's waiting for you specifically.",
        voice: 'GHOST',
        voiceText: "She knew you were coming. Don't ask how."
      }
    };

    return guidance[playerTone] || guidance.curious;
  }

  // Get first dialogue variant based on approach order
  getFirstMeetingVariant(npcId, playerTone, isRecommended) {
    const variants = {
      mara: {
        recommended: {
          greeting: "*She descends from the watchtower, measuring each step.* You made it past Rask. That's something.",
          tone: 'evaluating'
        },
        notRecommended: {
          greeting: "*She watches you approach. Her expression doesn't change.* I'll get to you. When I'm ready.",
          tone: 'dismissive'
        }
      },
      jonas: {
        recommended: {
          greeting: "*He stops sweeping. Really looks at you.* You're... new. Sorry, I just... it's been a while since someone new.",
          tone: 'surprised_gentle'
        },
        notRecommended: {
          greeting: "*He glances up, then back down.* Mara handles newcomers. I just... I'm just here.",
          tone: 'deflecting'
        }
      },
      rask: {
        recommended: {
          greeting: "*Already met at the gate.*",
          tone: 'established'
        },
        notRecommended: {
          greeting: "*He's already watching you.* We talked. You need something else?",
          tone: 'guarded'
        }
      },
      edda: {
        recommended: {
          greeting: "*She turns before you reach her, as if she heard your footsteps before you made them.* You felt it too. The tremor. The hum beneath the tremor.",
          tone: 'knowing'
        },
        notRecommended: {
          greeting: "*She doesn't turn.* Not yet. Speak to the others first. Then... maybe.",
          tone: 'mysterious_deflection'
        }
      },
      kale: {
        recommended: {
          greeting: "*He straightens when you approach, unconsciously mirroring your posture.* Hi. I mean—hello. You're new. What's it like? Being new, I mean.",
          tone: 'eager_uncertain'
        },
        notRecommended: {
          greeting: "*He watches you pass, then follows at a distance.* (He'll find you later.)",
          tone: 'following'
        }
      }
    };

    const npcVariants = variants[npcId];
    if (!npcVariants) return null;

    return isRecommended ? npcVariants.recommended : npcVariants.notRecommended;
  }
}
```

---

## 4. Opening Scene Configuration

All the text and data in one place.

```javascript
// src/data/openingScene.js

export const OPENING_SCENE_DATA = {

  // ═══════════════════════════════════════
  // ENVIRONMENTAL ESTABLISHING SHOT
  // ═══════════════════════════════════════
  
  establishing: {
    lines: [
      "The wind carries dust across a barren ridge.",
      "Ash drifts like slow snowfall, dissolving against old metal fences.",
      "Below, the settlement huddles in a shallow dip in the land—",
      "structures leaning, patched, trembling in the gusts.",
      "A faint hum rolls under the ground.",
      "Barely noticeable. Unclaimed by any machine you can see."
    ],
    timing: [0, 2500, 5000, 7000, 9500, 11500],
    fadeTime: 800,
    holdTime: 2000
  },

  // ═══════════════════════════════════════
  // FIRST VOICE ACTIVATION
  // ═══════════════════════════════════════

  firstVoices: {
    LOGIC: {
      text: "Population low. Structures unstable. Resources uncertain. Risk level: high.",
      delay: 0
    },
    INSTINCT: {
      text: "Gate smells wrong. Metal… afraid.",
      delay: 3000
    },
    EMPATHY: {
      text: "They're holding on to something. All of them. You can feel it from here.",
      delay: 6000
    },
    GHOST: {
      text: "The ground hums your name. Quietly. Not yet yours.",
      delay: 9000
    }
  },

  // ═══════════════════════════════════════
  // RASK GATEKEEPER ENCOUNTER
  // ═══════════════════════════════════════

  raskEncounter: {
    introduction: {
      action: "*He studies you for too long before speaking.*",
      dialogue: "You're new. Or lost. Or trouble. Sometimes they're the same thing."
    },

    playerChoices: [
      {
        id: 'confident',
        text: "Just passing through.",
        tone: 'confident',
        voiceBonus: { LOGIC: 1, INSTINCT: 1 },
        raskResponse: "*His eyes narrow.* Passing through. Right. Everyone's passing through. Until they're not.",
        relationshipDelta: -5,
        voiceReactions: [
          { voice: 'LOGIC', text: "Assessment: he's testing boundaries." },
          { voice: 'INSTINCT', text: "He could break bone. Yours." }
        ]
      },
      {
        id: 'humble',
        text: "I'm here to work, if there's work.",
        tone: 'humble',
        voiceBonus: { EMPATHY: 1 },
        raskResponse: "*A slight shift in his stance.* Work. There's always work. Whether they'll let you do it… different question.",
        relationshipDelta: +5,
        voiceReactions: [
          { voice: 'EMPATHY', text: "He softened. Just slightly. Don't push." },
          { voice: 'INSTINCT', text: "He's tired. Beyond tired." }
        ]
      },
      {
        id: 'curious',
        text: "Is this Ashfall?",
        tone: 'curious',
        voiceBonus: { LOGIC: 1 },
        raskResponse: "What's left of it. *He glances back at the settlement.* Don't let the name fool you. Fire's long gone. Just the ash now.",
        relationshipDelta: 0,
        voiceReactions: [
          { voice: 'LOGIC', text: "Informative response. He's not hostile to questions." },
          { voice: 'GHOST', text: "He stands where the hum doesn't reach. Why?" }
        ]
      },
      {
        id: 'silent',
        text: "*Remain silent.*",
        tone: 'silent',
        voiceBonus: { INSTINCT: 1, GHOST: 1 },
        raskResponse: "*A long pause. Then something like respect.* Fine. Quiet's honest. More than most.",
        relationshipDelta: +10,
        voiceReactions: [
          { voice: 'INSTINCT', text: "He respects the silence. Remember that." },
          { voice: 'GHOST', text: "Words cost him too. He noticed you don't spend them freely." }
        ]
      }
    ],

    exitLines: {
      confident: "Go on, then. *He steps aside.* Don't make me regret it.",
      humble: "*He nods.* Talk to Mara. She decides who stays.",
      curious: "You'll find your answers. Or they'll find you. *He steps aside.*",
      silent: "*He simply steps aside. No more words needed.*"
    },

    // Rare high-relationship variant
    welcomeLine: "…Welcome.",
    welcomeThreshold: 65
  },

  // ═══════════════════════════════════════
  // SETTLEMENT ENTRY GLIMPSES
  // ═══════════════════════════════════════

  settlementGlimpses: [
    {
      npc: 'mara',
      location: 'watchtower',
      description: "On the watchtower, a woman scans the horizon. Her posture says 'control.' Her grip on the railing says something else.",
      voiceHint: { voice: 'LOGIC', text: "Leader. But stretched thin." }
    },
    {
      npc: 'jonas',
      location: 'clinic',
      description: "Outside a small shack, a man sweeps dust that will never leave. His hands are steady. His eyes are somewhere else.",
      voiceHint: { voice: 'EMPATHY', text: "He's pretending. At something. At everything." }
    },
    {
      npc: 'kale',
      location: 'market_square',
      description: "A young man lingers near empty stalls, watching you with cautious fascination. He mirrors your posture before catching himself.",
      voiceHint: { voice: 'INSTINCT', text: "Mimic. Uncertain. Not a threat—but not stable." }
    },
    {
      npc: 'edda',
      location: 'perimeter_path',
      description: "At the edge of the settlement, an old woman pauses mid-step. She felt something. She's looking at you like she expected you.",
      voiceHint: { voice: 'GHOST', text: "She knows things. Careful." }
    }
  ],

  // ═══════════════════════════════════════
  // FIRST TREMOR
  // ═══════════════════════════════════════

  firstTremor: {
    environmental: "A subtle tremor.\nThe well's stones shift softly.",
    
    npcReactions: {
      mara: { type: 'freeze', visual: "freezes, jaw tight" },
      jonas: { type: 'flinch', visual: "drops whatever he's holding" },
      rask: { type: 'look', visual: "looks toward the shaft instinctively" },
      kale: { type: 'mirror', visual: "mirrors whoever he's watching" },
      edda: { type: 'whisper', visual: 'whispers, "Not again."' }
    },

    voiceReactions: [
      { voice: 'LOGIC', text: "Seismic irregularity. Source unknown." },
      { voice: 'INSTINCT', text: "Danger below. Move." },
      { voice: 'EMPATHY', text: "They're scared. All of them." },
      { voice: 'GHOST', text: "The hum woke. Only slightly. Enough." }
    ],

    ghostWhisper: "It remembers you. Or mistakes you. Both are dangerous."
  },

  // ═══════════════════════════════════════
  // SCENE COMPLETION
  // ═══════════════════════════════════════

  completion: {
    flags: ['opening_complete', 'first_tremor_felt', 'voices_activated'],
    
    raskFarewells: {
      confident: "You're inside now. Don't make me regret it.",
      humble: "Stay near the light tonight. Just a suggestion.",
      curious: "Answers cost things here. Remember that.",
      silent: "*He nods. Once.*"
    },

    transitionText: "The settlement waits. Where do you go first?"
  }
};
```

---

## 5. Voice Score Tracking

The opening establishes initial voice alignment.

```javascript
// src/systems/VoiceScoreTracker.js

/**
 * VOICE SCORE TRACKER
 * 
 * Tracks which internal voice is dominant based on player choices.
 * The opening scene seeds these scores; later choices build on them.
 */

export class VoiceScoreTracker {
  constructor() {
    this.scores = {
      LOGIC: 0,
      INSTINCT: 0,
      EMPATHY: 0,
      GHOST: 0
    };

    this.history = [];
  }

  addScore(voice, amount, source) {
    if (this.scores.hasOwnProperty(voice)) {
      this.scores[voice] += amount;
      
      this.history.push({
        voice,
        amount,
        source,
        timestamp: Date.now(),
        newTotal: this.scores[voice]
      });
    }
  }

  getDominant() {
    const entries = Object.entries(this.scores);
    const sorted = entries.sort(([,a], [,b]) => b - a);
    
    const [topVoice, topScore] = sorted[0];
    const [secondVoice, secondScore] = sorted[1];

    // Check for balance
    if (topScore - secondScore < 3) {
      return { voice: 'BALANCED', confidence: 'low', scores: this.scores };
    }

    const confidence = topScore - secondScore > 7 ? 'high' : 'medium';
    
    return { voice: topVoice, confidence, scores: this.scores };
  }

  getOpeningImpression() {
    // After the opening scene, summarize the player's initial alignment
    const dominant = this.getDominant();

    const impressions = {
      LOGIC: "You arrived with calculation. Every detail noted, every risk assessed.",
      INSTINCT: "You arrived on edge. Alert to danger, ready to move.",
      EMPATHY: "You arrived open. Sensing the weight these people carry.",
      GHOST: "You arrived remembering. Or being remembered. The line blurs here.",
      BALANCED: "You arrived uncertain. All voices speak; none dominate. Yet."
    };

    return impressions[dominant.voice];
  }
}
```

---

## Summary

The Opening Scene implementation includes:

| Component | Purpose |
|-----------|---------|
| **OpeningScene.js** | Main scene controller, phases and transitions |
| **SettlementEntrySequence** | NPC glimpses and first tremor |
| **FirstInteractionRouter** | Guides player toward appropriate first NPC |
| **OPENING_SCENE_DATA** | All text, timing, and configuration |
| **VoiceScoreTracker** | Seeds initial voice alignment |

**The Scene Flow:**

```
1. ESTABLISHING SHOT
   └─ Environmental text fades in/out
   
2. FIRST VOICES
   └─ LOGIC → INSTINCT → EMPATHY → GHOST
   └─ Player's internal voices activate
   
3. RASK GATEKEEPER
   └─ Player chooses tone (confident/humble/curious/silent)
   └─ Choice affects Rask relationship
   └─ Choice seeds voice alignment
   └─ Choice determines recommended first NPC
   
4. SETTLEMENT ENTRY
   └─ See Mara on watchtower
   └─ See Jonas at clinic
   └─ See Kale at market
   └─ See Edda on perimeter
   
5. FIRST TREMOR
   └─ Ground shakes
   └─ NPCs react visibly
   └─ GHOST whispers: "It remembers you."
   
6. FREE MOVEMENT
   └─ Player chooses where to go
   └─ Subtle guidance toward recommended NPC
```

**Scene Goals Achieved:**
- ✅ Tone lock-in (brittle, human, haunted)
- ✅ Player voice activation
- ✅ Introduction to interpersonal tension
- ✅ Early seeding of core secret (hum + tremor)
- ✅ NPC behavioral distinctiveness
- ✅ Settlement emotional geography established

---

*"The ground hums your name. Quietly. Not yet yours."*

*— The first words the earth speaks to you*
