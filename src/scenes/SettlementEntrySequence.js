// src/scenes/SettlementEntrySequence.js
// Handles the player's first entry into the settlement
// Shows all NPCs in their characteristic positions

import { OPENING_SCENE_DATA } from '../data/openingScene.js';

/**
 * SETTLEMENT ENTRY SEQUENCE
 *
 * Called when player first enters the settlement.
 * Shows all NPCs in their characteristic positions,
 * then triggers the first subtle tremor.
 */

export class SettlementEntrySequence {
  constructor(scene) {
    this.scene = scene;
    this.npcGlimpses = [];
    this.isPlaying = false;
  }

  play(onComplete) {
    if (this.isPlaying) return;
    this.isPlaying = true;

    const glimpses = OPENING_SCENE_DATA.settlementGlimpses;

    this.displayGlimpseSequence(glimpses, () => {
      // Optional first tremor
      this.triggerFirstTremor(() => {
        this.isPlaying = false;
        onComplete();
      });
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
    // Highlight NPC on map if the method exists
    if (this.scene.highlightNpc) {
      this.scene.highlightNpc(glimpse.npc);
    }

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
      const colors = OPENING_SCENE_DATA.voiceColors;

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

            // Unhighlight NPC if method exists
            if (this.scene.unhighlightNpc) {
              this.scene.unhighlightNpc(glimpse.npc);
            }

            onComplete();
          }
        });
      });
    });
  }

  triggerFirstTremor(onComplete) {
    const data = OPENING_SCENE_DATA.firstTremor;

    // Screen shake
    this.scene.cameras.main.shake(800, 0.005);

    // Environmental text
    const tremorText = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      data.environmental,
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
        `[GHOST] "${data.ghostWhisper}"`,
        {
          fontFamily: 'Courier New',
          fontSize: '14px',
          color: OPENING_SCENE_DATA.voiceColors.GHOST,
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
    const data = OPENING_SCENE_DATA.firstTremor.npcReactions;

    // Brief visual indicators of NPC reactions
    // These would be sprite animations or emotes in a full implementation

    for (const [npc, reaction] of Object.entries(data)) {
      if (this.scene.playNpcReaction) {
        this.scene.playNpcReaction(npc, reaction.type, 800);
      }
    }
  }

  // Get tremor reaction text for an NPC
  getTremorReactionText(npcId) {
    const data = OPENING_SCENE_DATA.firstTremor.npcReactions;
    return data[npcId]?.visual || '';
  }

  // Get voice reaction for the tremor
  getTremorVoiceReactions() {
    return OPENING_SCENE_DATA.firstTremor.voiceReactions;
  }
}
