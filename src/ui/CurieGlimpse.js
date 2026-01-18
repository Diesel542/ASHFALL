// src/ui/CurieGlimpse.js

/**
 * CURIE GLIMPSE
 *
 * Subliminal portrait flashes when Curie manifests.
 * Player isn't sure they saw it. Unsettling, not obvious.
 */

export class CurieGlimpse {
  constructor(scene) {
    this.scene = scene;
    this.isActive = false;

    this.create();
  }

  create() {
    const { width, height } = this.scene.cameras.main;

    // Portrait image - starts hidden
    this.portrait = this.scene.add.image(width / 2, height / 2, 'curie_eager');
    this.portrait.setDepth(1850);
    this.portrait.setAlpha(0);
    this.portrait.setTint(0x9966cc); // Purple tint by default

    // Scale to reasonable size
    this.portrait.setDisplaySize(200, 200);

    // Scanline overlay effect
    this.scanlines = this.scene.add.graphics();
    this.scanlines.setDepth(1851);
    this.scanlines.setAlpha(0);
    this.createScanlineTexture();

    // Store center position
    this.centerX = width / 2;
    this.centerY = height / 2;
  }

  createScanlineTexture() {
    const { width, height } = this.scene.cameras.main;

    this.scanlines.clear();
    this.scanlines.lineStyle(1, 0x000000, 0.3);

    // Horizontal scanlines
    for (let y = 0; y < height; y += 4) {
      this.scanlines.lineBetween(0, y, width, y);
    }
  }

  /**
   * Get random position offset for glitch effect
   */
  getGlitchOffset() {
    const offsetX = (Math.random() - 0.5) * 40; // ±20 pixels
    const offsetY = (Math.random() - 0.5) * 40;
    return { x: this.centerX + offsetX, y: this.centerY + offsetY };
  }

  /**
   * Brief 150-200ms blink - used for most manifestations
   */
  async flash(duration = 150) {
    if (this.isActive) return;
    this.isActive = true;

    const pos = this.getGlitchOffset();
    this.portrait.setPosition(pos.x, pos.y);
    this.portrait.setTint(0x9966cc);

    // Quick fade in
    this.scene.tweens.add({
      targets: this.portrait,
      alpha: 0.5 + Math.random() * 0.2, // 0.5-0.7
      duration: duration * 0.3,
      ease: 'Power2'
    });

    this.scanlines.setAlpha(0.15);

    await this.delay(duration);

    // Quick fade out
    await new Promise(resolve => {
      this.scene.tweens.add({
        targets: [this.portrait, this.scanlines],
        alpha: 0,
        duration: duration * 0.5,
        onComplete: resolve
      });
    });

    this.isActive = false;
  }

  /**
   * Rapid unstable flashes - used for overloaded state
   */
  async flicker(times = 4) {
    if (this.isActive) return;
    this.isActive = true;

    for (let i = 0; i < times; i++) {
      const pos = this.getGlitchOffset();
      this.portrait.setPosition(pos.x, pos.y);

      // Vary the tint slightly for instability
      const tintVariation = Math.random() > 0.5 ? 0xff66aa : 0x9966cc;
      this.portrait.setTint(tintVariation);

      // Random alpha for each flash
      const alpha = 0.3 + Math.random() * 0.4;
      this.portrait.setAlpha(alpha);
      this.scanlines.setAlpha(0.2 + Math.random() * 0.1);

      // Random scale distortion
      const scaleX = 0.9 + Math.random() * 0.2;
      const scaleY = 0.9 + Math.random() * 0.2;
      this.portrait.setScale(scaleX, scaleY);

      await this.delay(50 + Math.random() * 100);

      // Brief off
      this.portrait.setAlpha(0);
      this.scanlines.setAlpha(0);

      await this.delay(30 + Math.random() * 70);
    }

    // Reset scale
    this.portrait.setScale(1, 1);
    this.portrait.setAlpha(0);
    this.scanlines.setAlpha(0);

    this.isActive = false;
  }

  /**
   * Longer fade - used for emergent state
   * More coherent, less glitchy, almost beautiful
   */
  async linger(duration = 2000) {
    if (this.isActive) return;
    this.isActive = true;

    // Center position, minimal offset
    const pos = {
      x: this.centerX + (Math.random() - 0.5) * 10,
      y: this.centerY + (Math.random() - 0.5) * 10
    };
    this.portrait.setPosition(pos.x, pos.y);

    // Emergent state: less purple, more ethereal blue-white
    this.portrait.setTint(0xaaccff);

    // Slow fade in
    await new Promise(resolve => {
      this.scene.tweens.add({
        targets: this.portrait,
        alpha: 0.6,
        duration: duration * 0.3,
        ease: 'Sine.easeIn',
        onComplete: resolve
      });
    });

    // Subtle scanlines
    this.scanlines.setAlpha(0.08);

    // Hold
    await this.delay(duration * 0.4);

    // Slow fade out
    await new Promise(resolve => {
      this.scene.tweens.add({
        targets: [this.portrait, this.scanlines],
        alpha: 0,
        duration: duration * 0.3,
        ease: 'Sine.easeOut',
        onComplete: resolve
      });
    });

    this.isActive = false;
  }

  /**
   * Trigger glimpse based on Curie's state
   * 40% base chance, automatic mode selection
   */
  async tryGlimpse(state) {
    // 40% chance to show glimpse
    if (Math.random() > 0.4) return;

    switch (state) {
      case 'overloaded':
        // Rapid unstable flashes
        const flickerCount = 3 + Math.floor(Math.random() * 4); // 3-6 times
        await this.flicker(flickerCount);
        break;

      case 'emergent':
        // Longer, more coherent appearance
        await this.linger(2000);
        break;

      case 'reaching':
        // Slightly longer flash
        await this.flash(250);
        break;

      case 'fragmented':
      default:
        // Brief blink
        await this.flash(150);
        break;
    }
  }

  delay(ms) {
    return new Promise(resolve => {
      this.scene.time.delayedCall(ms, resolve);
    });
  }
}
