// src/ui/QuestNotification.js

import { UI_COLORS, UI_FONTS } from './UIConstants.js';

/**
 * QUEST NOTIFICATION
 *
 * Shows when a quest triggers or completes.
 */

export class QuestNotification {
  constructor(scene) {
    this.scene = scene;
    this.create();
  }

  create() {
    const { width } = this.scene.cameras.main;

    this.container = this.scene.add.container(width / 2, 80);
    this.container.setDepth(1500);
    this.container.setAlpha(0);

    // Background
    this.bg = this.scene.add.rectangle(0, 0, 400, 60, UI_COLORS.bgDark, 0.9);
    this.bg.setStrokeStyle(1, UI_COLORS.accentRust);
    this.container.add(this.bg);

    // Icon
    this.icon = this.scene.add.text(-180, 0, '◆', {
      fontSize: '24px',
      color: '#8b4513'
    });
    this.icon.setOrigin(0.5);
    this.container.add(this.icon);

    // Title
    this.title = this.scene.add.text(-150, -10, '', {
      fontFamily: 'Oswald, sans-serif',
      fontSize: '14px',
      color: UI_COLORS.textPrimary
    });
    this.container.add(this.title);

    // Description
    this.description = this.scene.add.text(-150, 10, '', {
      fontFamily: 'Lora, serif',
      fontSize: '12px',
      color: UI_COLORS.textSecondary,
      fontStyle: 'italic'
    });
    this.container.add(this.description);
  }

  /**
   * Show quest started notification
   */
  showQuestStarted(quest) {
    this.title.setText('Something Stirs');
    this.description.setText(quest.context?.description || 'A situation demands attention.');
    this.icon.setText('◆');
    this.icon.setColor('#8b4513');

    this.show();
  }

  /**
   * Show quest completed notification
   */
  showQuestCompleted(quest, outcome) {
    this.title.setText('Resolved');
    this.description.setText(outcome?.description || 'The moment has passed.');
    this.icon.setText('✓');
    this.icon.setColor('#88ff88');

    this.show();
  }

  show() {
    // Slide in from top
    this.container.y = 20;
    this.container.setAlpha(1);

    this.scene.tweens.add({
      targets: this.container,
      y: 80,
      duration: 300,
      ease: 'Power2'
    });

    // Auto-hide after delay
    this.scene.time.delayedCall(4000, () => {
      this.hide();
    });
  }

  hide() {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      y: 20,
      duration: 300,
      onComplete: () => {
        this.container.setAlpha(0);
      }
    });
  }
}
