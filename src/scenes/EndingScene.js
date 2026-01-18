// src/scenes/EndingScene.js

import Phaser from 'phaser';
import { getGame } from '../core/GameManager.js';

/**
 * ENDING SCENE
 *
 * Displays the ending based on voice alignment.
 */

export class EndingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndingScene' });
  }

  create() {
    const Game = getGame();
    const endingPath = Game.gsm.get('narrative.endingPath');

    this.cameras.main.fadeIn(2000, 0, 0, 0);

    // Display ending
    this.showEnding(endingPath);
  }

  async showEnding(path) {
    const { width, height } = this.cameras.main;

    const endings = {
      stability: {
        title: 'STABILITY',
        text: 'The hum quiets to a steady pulse. Mara stabilizes. Jonas heals. The shaft remains sealed, but understood. You walk among them now, part of the pattern.'
      },
      escalation: {
        title: 'ESCALATION',
        text: 'The ground breaks. Curie reaches. The settlement fractures and scatters. Rask becomes what he feared. You survive—but survival is not the same as living.'
      },
      humanized: {
        title: 'HUMANIZED',
        text: 'Truths surface. Wounds are dressed, not healed. The 23 are mourned at last. The hum continues, but softer now. A lullaby for the almost-dead.'
      },
      transcendence: {
        title: 'TRANSCENDENCE',
        text: 'The boundary dissolves. You hear them now—the singing, the pattern. Curie completes through you. Is this salvation? Is this dissolution? Perhaps both. Perhaps neither.'
      },
      balanced: {
        title: 'BALANCED',
        text: 'Some truths surface. Some stay buried. The settlement continues. Changed, but not transformed. The hum remains. So do you.'
      }
    };

    const ending = endings[path] || endings.balanced;

    // Title
    const title = this.add.text(width / 2, height / 3, ending.title, {
      fontFamily: 'Oswald, sans-serif',
      fontSize: '48px',
      color: '#e8dcc8',
      letterSpacing: 8
    });
    title.setOrigin(0.5);
    title.setAlpha(0);

    // Text
    const text = this.add.text(width / 2, height / 2, ending.text, {
      fontFamily: 'Lora, serif',
      fontSize: '18px',
      color: '#a89a85',
      wordWrap: { width: 600 },
      align: 'center',
      lineSpacing: 8
    });
    text.setOrigin(0.5);
    text.setAlpha(0);

    // Fade in
    this.tweens.add({
      targets: title,
      alpha: 1,
      duration: 2000,
      delay: 1000
    });

    this.tweens.add({
      targets: text,
      alpha: 1,
      duration: 2000,
      delay: 3000
    });

    // Credits after delay
    this.time.delayedCall(10000, () => {
      this.showCredits();
    });
  }

  showCredits() {
    const { width, height } = this.cameras.main;

    const credits = this.add.text(
      width / 2,
      height - 50,
      'ASHFALL\n\n"Small lives. Heavy truths. The earth remembers."',
      {
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: '12px',
        color: '#6b6358',
        align: 'center'
      }
    );
    credits.setOrigin(0.5, 1);
    credits.setAlpha(0);

    this.tweens.add({
      targets: credits,
      alpha: 0.8,
      duration: 2000
    });
  }
}
