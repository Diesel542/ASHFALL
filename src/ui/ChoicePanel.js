// src/ui/ChoicePanel.js

import { UI_COLORS, UI_FONTS, UI_DIMENSIONS, UI_TIMING } from './UIConstants.js';

/**
 * CHOICE PANEL
 *
 * Player dialogue choices.
 * Supports voice-tagged options and keyboard navigation.
 */

export class ChoicePanel {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;

    this.choices = [];
    this.choiceTexts = [];
    this.selectedIndex = 0;
    this.onSelect = null;

    this.create();
  }

  create() {
    const { x, y } = this.config;

    this.container = this.scene.add.container(x, y);
    this.container.setAlpha(0);

    this.background = this.scene.add.graphics();
    this.container.add(this.background);

    this.selector = this.scene.add.text(0, 0, '>', {
      fontSize: '16px',
      color: UI_COLORS.textPrimary
    });
    this.selector.setAlpha(0);
    this.container.add(this.selector);
  }

  show(choices, onSelect) {
    this.choices = choices;
    this.onSelect = onSelect;
    this.selectedIndex = 0;

    this.clear();

    const dim = UI_DIMENSIONS.choicePanel;
    // Position choices to expand downward from the container position
    const totalHeight = choices.length * dim.optionHeight;
    const startY = 0; // Start at container position, expand downward

    choices.forEach((choice, index) => {
      const y = startY + index * dim.optionHeight;

      let displayText = choice.text;
      if (choice.voiceTag) {
        const tagColors = {
          LOGIC: '[L]',
          INSTINCT: '[I]',
          EMPATHY: '[E]',
          GHOST: '[G]'
        };
        displayText = `${tagColors[choice.voiceTag]} ${choice.text}`;
      }

      const text = this.scene.add.text(
        -dim.width / 2 + 30,
        y,
        displayText,
        {
          ...UI_FONTS.choice,
          color: index === 0 ? UI_COLORS.selected : UI_COLORS.unselected
        }
      );

      text.setInteractive({ useHandCursor: true });
      text.on('pointerover', () => this.selectIndex(index));
      text.on('pointerdown', () => {
        this.selectIndex(index);
        this.confirmSelection();
      });

      this.choiceTexts.push(text);
      this.container.add(text);
    });

    this.background.clear();
    // Dark background for choice panel above dialogue box
    this.background.fillStyle(UI_COLORS.bgDark, 0.95);
    this.background.fillRoundedRect(
      -dim.width / 2 - 10,
      startY - 10,
      dim.width + 20,
      totalHeight + 20,
      6
    );
    // Border
    this.background.lineStyle(1, UI_COLORS.accentRust, 0.6);
    this.background.strokeRoundedRect(
      -dim.width / 2 - 10,
      startY - 10,
      dim.width + 20,
      totalHeight + 20,
      6
    );

    this.updateSelector();

    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: UI_TIMING.fadeIn
    });
  }

  selectIndex(index) {
    if (index < 0 || index >= this.choices.length) return;

    if (this.choiceTexts[this.selectedIndex]) {
      this.choiceTexts[this.selectedIndex].setColor(UI_COLORS.unselected);
    }

    this.selectedIndex = index;

    if (this.choiceTexts[this.selectedIndex]) {
      this.choiceTexts[this.selectedIndex].setColor(UI_COLORS.selected);
    }

    this.updateSelector();
  }

  selectPrevious() {
    this.selectIndex(Math.max(0, this.selectedIndex - 1));
  }

  selectNext() {
    this.selectIndex(Math.min(this.choices.length - 1, this.selectedIndex + 1));
  }

  updateSelector() {
    if (this.choiceTexts[this.selectedIndex]) {
      const target = this.choiceTexts[this.selectedIndex];

      this.scene.tweens.add({
        targets: this.selector,
        x: target.x - 20,
        y: target.y,
        alpha: 1,
        duration: 100
      });
    }
  }

  confirmSelection() {
    const choice = this.choices[this.selectedIndex];

    if (this.onSelect) {
      this.scene.tweens.add({
        targets: this.choiceTexts[this.selectedIndex],
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          this.onSelect(choice);
        }
      });
    }
  }

  clear() {
    for (const text of this.choiceTexts) {
      text.destroy();
    }
    this.choiceTexts = [];
    this.selector.setAlpha(0);
  }

  hide() {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: UI_TIMING.fadeOut,
      onComplete: () => this.clear()
    });
  }
}
