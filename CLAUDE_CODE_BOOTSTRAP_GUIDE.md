# ASHFALL: Bootstrap & Integration Guide
## Wiring Everything Together

### Overview

This document is the master blueprint. It shows exactly how to assemble all the pieces into a running game. Follow this, and you'll have a playable Ashfall prototype.

---

## 1. Project Structure

```
ashfall/
├── package.json
├── vite.config.js
├── index.html
├── .env
│
├── public/
│   └── assets/
│       ├── portraits/
│       │   ├── mara_guarded.png
│       │   ├── mara_commanding.png
│       │   ├── mara_cracking.png
│       │   ├── jonas_distant.png
│       │   ├── jonas_pained.png
│       │   ├── jonas_warmth.png
│       │   ├── rask_watching.png
│       │   ├── rask_warning.png
│       │   ├── rask_softness.png
│       │   ├── edda_cryptic.png
│       │   ├── edda_frightened.png
│       │   ├── edda_prophetic.png
│       │   ├── kale_eager.png
│       │   ├── kale_confused.png
│       │   └── kale_slipping.png
│       ├── tiles/
│       │   └── (isometric tileset)
│       ├── sprites/
│       │   └── (character sprites)
│       └── audio/
│           └── (sound files)
│
└── src/
    ├── main.js                 # Entry point
    ├── config.js               # Phaser configuration
    │
    ├── core/
    │   ├── GameState.js        # State definition
    │   ├── EventBus.js         # Event system
    │   ├── GameStateManager.js # State mutations
    │   └── GameManager.js      # Top-level API
    │
    ├── scenes/
    │   ├── BootScene.js        # Asset loading
    │   ├── OpeningScene.js     # Opening sequence
    │   ├── SettlementScene.js  # Main gameplay
    │   └── EndingScene.js      # Ending sequences
    │
    ├── dialogue/
    │   ├── DialogueEngine.js   # OpenAI integration
    │   ├── VoiceSystem.js      # Internal voices
    │   ├── tonePrimer.js       # Tone rules
    │   ├── npcCodexes.js       # Mind codexes
    │   ├── arcGates.js         # Narrative constraints
    │   └── relationships.js    # NPC perceptions
    │
    ├── systems/
    │   ├── NarrativeEngine.js  # Act/gate/ending logic
    │   ├── CurieEntity.js      # Curie behavior
    │   ├── RelationshipManager.js
    │   ├── QuestSystem.js      # Quest archetypes
    │   └── EnvironmentSystem.js # Weather, hum, tremors
    │
    ├── ui/
    │   ├── UIConstants.js      # Colors, fonts, timing
    │   ├── UIManager.js        # UI coordinator
    │   ├── DialogueBox.js
    │   ├── VoicePanel.js
    │   ├── ChoicePanel.js
    │   ├── HUD.js
    │   ├── LocationPanel.js
    │   ├── Transitions.js
    │   └── DialogueController.js
    │
    ├── world/
    │   ├── Settlement.js       # Map and locations
    │   ├── Location.js         # Location class
    │   ├── NPCSprite.js        # NPC on map
    │   └── PlayerController.js # Player movement
    │
    └── data/
        ├── locations.js        # Location definitions
        ├── npcData.js          # NPC display info
        └── dialogueChoices.js  # Choice templates
```

---

## 2. Package.json

```json
{
  "name": "ashfall",
  "version": "0.1.0",
  "description": "A narrative RPG inspired by Disco Elysium and Fallout",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "openai": "^4.20.0",
    "phaser": "^3.70.0"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

---

## 3. Vite Configuration

```javascript
// vite.config.js

import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  define: {
    // Make env variables available
    'process.env.OPENAI_API_KEY': JSON.stringify(process.env.OPENAI_API_KEY)
  }
});
```

---

## 4. Environment Variables

```bash
# .env
OPENAI_API_KEY=your_openai_api_key_here
```

---

## 5. Index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ASHFALL</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      background-color: #1a1714;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      overflow: hidden;
    }
    
    #game-container {
      /* Game will be injected here */
    }
    
    /* Custom fonts */
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Oswald:wght@400;500&family=IBM+Plex+Mono:ital@0;1&display=swap');
  </style>
</head>
<body>
  <div id="game-container"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

---

## 6. Phaser Configuration

```javascript
// src/config.js

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { OpeningScene } from './scenes/OpeningScene.js';
import { SettlementScene } from './scenes/SettlementScene.js';
import { EndingScene } from './scenes/EndingScene.js';

export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1280,
  height: 720,
  backgroundColor: '#1a1714',
  
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  
  scene: [
    BootScene,
    OpeningScene,
    SettlementScene,
    EndingScene
  ],
  
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  
  render: {
    pixelArt: false,
    antialias: true
  }
};
```

---

## 7. Main Entry Point

```javascript
// src/main.js

import Phaser from 'phaser';
import { gameConfig } from './config.js';
import { GameManager, Game } from './core/GameManager.js';

/**
 * ASHFALL — Main Entry Point
 * 
 * "Small lives. Heavy truths. The earth remembers."
 */

// Initialize the game
const game = new Phaser.Game(gameConfig);

// Make Game manager globally accessible for debugging
window.AshfallGame = Game;

// Handle window focus/blur for pause
window.addEventListener('blur', () => {
  Game.gsm.events.emit('game:pause');
});

window.addEventListener('focus', () => {
  Game.gsm.events.emit('game:resume');
});

// Log startup
console.log('%c ASHFALL ', 'background: #1a1714; color: #e8dcc8; font-size: 20px; padding: 10px;');
console.log('%c The ground hums. Something waits below. ', 'color: #6b6358; font-style: italic;');

export { game, Game };
```

---

## 8. Boot Scene (Asset Loading)

```javascript
// src/scenes/BootScene.js

import Phaser from 'phaser';

/**
 * BOOT SCENE
 * 
 * Loads all assets before the game starts.
 * Shows a minimal loading screen.
 */

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Create loading bar
    this.createLoadingBar();

    // ═══════════════════════════════════════
    // PORTRAITS
    // ═══════════════════════════════════════
    
    const portraits = [
      'mara_guarded', 'mara_commanding', 'mara_cracking',
      'jonas_distant', 'jonas_pained', 'jonas_warmth',
      'rask_watching', 'rask_warning', 'rask_softness',
      'edda_cryptic', 'edda_frightened', 'edda_prophetic',
      'kale_eager', 'kale_confused', 'kale_slipping'
    ];

    portraits.forEach(portrait => {
      this.load.image(portrait, `assets/portraits/${portrait}.png`);
    });

    // ═══════════════════════════════════════
    // TILES (if using tilemap)
    // ═══════════════════════════════════════
    
    // this.load.image('tiles', 'assets/tiles/tileset.png');
    // this.load.tilemapTiledJSON('settlement', 'assets/tiles/settlement.json');

    // ═══════════════════════════════════════
    // SPRITES
    // ═══════════════════════════════════════
    
    // Player and NPC sprites (if using)
    // this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 32, frameHeight: 48 });
    // this.load.spritesheet('npc', 'assets/sprites/npc.png', { frameWidth: 32, frameHeight: 48 });

    // ═══════════════════════════════════════
    // AUDIO
    // ═══════════════════════════════════════
    
    // this.load.audio('hum', 'assets/audio/hum_loop.mp3');
    // this.load.audio('tremor', 'assets/audio/tremor.mp3');
    // this.load.audio('ambient', 'assets/audio/wind_ambient.mp3');

    // ═══════════════════════════════════════
    // PARTICLES
    // ═══════════════════════════════════════
    
    // Create simple particle textures programmatically
    this.createParticleTextures();
  }

  createLoadingBar() {
    const { width, height } = this.cameras.main;
    
    // Title
    const title = this.add.text(width / 2, height / 2 - 50, 'ASHFALL', {
      fontFamily: 'Oswald, sans-serif',
      fontSize: '48px',
      color: '#e8dcc8',
      letterSpacing: 8
    });
    title.setOrigin(0.5);

    // Loading text
    this.loadingText = this.add.text(width / 2, height / 2 + 20, 'Loading...', {
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: '14px',
      color: '#6b6358'
    });
    this.loadingText.setOrigin(0.5);

    // Progress bar background
    const barBg = this.add.rectangle(width / 2, height / 2 + 60, 300, 8, 0x2d2a26);
    
    // Progress bar fill
    this.progressBar = this.add.rectangle(width / 2 - 150, height / 2 + 60, 0, 8, 0x8b4513);
    this.progressBar.setOrigin(0, 0.5);

    // Progress events
    this.load.on('progress', (value) => {
      this.progressBar.width = 300 * value;
      this.loadingText.setText(`Loading... ${Math.floor(value * 100)}%`);
    });

    this.load.on('complete', () => {
      this.loadingText.setText('The ground hums...');
    });
  }

  createParticleTextures() {
    // Ash particle
    const ashGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    ashGraphics.fillStyle(0xccbbaa, 1);
    ashGraphics.fillCircle(4, 4, 3);
    ashGraphics.generateTexture('ash-particle', 8, 8);
    ashGraphics.destroy();

    // Dust particle
    const dustGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    dustGraphics.fillStyle(0x9b9085, 1);
    dustGraphics.fillCircle(2, 2, 2);
    dustGraphics.generateTexture('dust-particle', 4, 4);
    dustGraphics.destroy();
  }

  create() {
    // Short delay then start opening scene
    this.time.delayedCall(1500, () => {
      this.cameras.main.fadeOut(500, 26, 23, 20);
      
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('OpeningScene');
      });
    });
  }
}
```

---

## 9. Opening Scene

```javascript
// src/scenes/OpeningScene.js

import Phaser from 'phaser';
import { Game } from '../core/GameManager.js';
import { UIManager } from '../ui/UIManager.js';
import { Transitions } from '../ui/Transitions.js';

/**
 * OPENING SCENE
 * 
 * The first playable moment:
 * 1. Establishing shot
 * 2. First voice activation
 * 3. Rask gatekeeper encounter
 * 4. Entry to settlement
 */

export class OpeningScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OpeningScene' });
  }

  create() {
    this.cameras.main.fadeIn(1000, 26, 23, 20);
    
    // Initialize game
    Game.startNewGame();
    
    // Create UI
    this.ui = new UIManager(this);
    this.transitions = new Transitions(this);
    
    // Create ash particles
    this.createAshfall();
    
    // Start the sequence
    this.runOpeningSequence();
  }

  createAshfall() {
    const { width } = this.cameras.main;
    
    this.ashEmitter = this.add.particles(0, -10, 'ash-particle', {
      x: { min: 0, max: width },
      lifespan: 8000,
      speedY: { min: 15, max: 35 },
      speedX: { min: -10, max: 10 },
      scale: { start: 0.8, end: 0.3 },
      alpha: { start: 0.5, end: 0 },
      quantity: 1,
      frequency: 300
    });
  }

  async runOpeningSequence() {
    // Phase 1: Establishing Shot
    await this.establishingShot();
    
    // Phase 2: First Voices
    await this.firstVoices();
    
    // Phase 3: Rask Encounter
    await this.raskEncounter();
    
    // Phase 4: Transition to Settlement
    await this.enterSettlement();
  }

  async establishingShot() {
    const { width, height } = this.cameras.main;
    
    const lines = [
      "The wind carries dust across a barren ridge.",
      "Below, a settlement huddles in a shallow dip.",
      "Smoke rises thin. Movement, sparse.",
      "And beneath it all — a hum.",
      "Faint. Persistent. Almost like breathing."
    ];

    for (const line of lines) {
      const text = this.add.text(width / 2, height / 2, line, {
        fontFamily: 'Lora, serif',
        fontSize: '20px',
        color: '#a89a85',
        fontStyle: 'italic'
      });
      text.setOrigin(0.5);
      text.setAlpha(0);

      // Fade in
      await this.fadeText(text, 1, 800);
      
      // Hold
      await this.delay(2000);
      
      // Fade out
      await this.fadeText(text, 0, 600);
      
      text.destroy();
    }
  }

  async firstVoices() {
    const voices = {
      LOGIC: "Population low. Structures unstable. Resources uncertain. Risk level: high.",
      INSTINCT: "Gate smells wrong. Metal… afraid.",
      EMPATHY: "They're holding on to something. All of them. You can feel it from here.",
      GHOST: "The ground hums your name. Quietly. Not yet yours."
    };

    // Show voice panel
    await this.ui.voicePanel.showVoices(voices);

    // Set flag
    Game.gsm.setFlag('voices_activated');
  }

  async raskEncounter() {
    // Show Rask
    await this.ui.startDialogue('rask', {
      name: 'RASK',
      portrait: 'rask_watching'
    });

    // Rask's intro
    await this.ui.showDialogue(
      "*A figure blocks the gate. Heavy. Still.* You're new. Or lost. Or trouble. *A pause.* Sometimes they're the same thing."
    );

    // Player choices
    const choices = [
      { id: 'confident', text: "Just passing through.", voiceTag: 'LOGIC' },
      { id: 'humble', text: "I'm here to work, if there's work.", voiceTag: 'EMPATHY' },
      { id: 'curious', text: "Is this Ashfall?", voiceTag: 'LOGIC' },
      { id: 'silent', text: "*Remain silent.*", voiceTag: 'INSTINCT' }
    ];

    const choice = await this.ui.showChoices(choices);
    
    // Process choice
    await this.handleRaskResponse(choice);
  }

  async handleRaskResponse(choice) {
    // Apply voice bonuses
    if (choice.voiceTag) {
      Game.gsm.adjustVoiceScore(choice.voiceTag, 1);
    }

    // Set initial tone
    Game.gsm.state.player.initialTone = choice.id;

    // Rask's response varies
    const responses = {
      confident: {
        text: "*He studies you too long.* People pass through. Not many stay passing. *He steps aside, barely.* Go on then. Pass.",
        relationship: -5,
        emotion: 'warning'
      },
      humble: {
        text: "*Something shifts in his stance.* Work. *He looks toward the settlement.* Mara decides who works. Talk to her. *He moves aside.*",
        relationship: 5,
        emotion: 'watching'
      },
      curious: {
        text: "Ashfall. *He says it like a fact, not a name.* What's left of it. *He gestures vaguely inward.* The boy can show you around. Kale. Find him.",
        relationship: 0,
        emotion: 'watching'
      },
      silent: {
        text: "*Silence holds. He watches. You watch back.* *Finally, something like respect crosses his face.* Hm. *He steps aside.*",
        relationship: 10,
        emotion: 'softness'
      }
    };

    const response = responses[choice.id];
    
    // Update portrait
    this.ui.dialogueBox.setPortrait(`rask_${response.emotion}`);
    
    // Show response
    await this.ui.showDialogue(response.text);

    // Update relationship
    Game.gsm.adjustRelationship('rask', response.relationship);

    // Voice reactions to Rask's response
    const voiceReactions = this.getRaskVoiceReactions(choice.id);
    await this.ui.showVoices(voiceReactions);

    // End dialogue
    await this.ui.endDialogue();
  }

  getRaskVoiceReactions(choiceId) {
    const reactions = {
      confident: {
        LOGIC: "He's measuring you. Deciding something.",
        INSTINCT: "Predator recognizes predator."
      },
      humble: {
        EMPATHY: "That landed. He's not used to humility here.",
        LOGIC: "Practical approach. Noted."
      },
      curious: {
        LOGIC: "Information gathering established.",
        GHOST: "Ashfall. The name holds weight here."
      },
      silent: {
        INSTINCT: "Good. Silence is honest.",
        GHOST: "He sees you now. The real shape."
      }
    };

    return reactions[choiceId] || {};
  }

  async enterSettlement() {
    // Transition effect
    await this.transitions.locationTransition(
      'ASHFALL',
      'The settlement accepts you. For now.'
    );

    // Set flags
    Game.gsm.setFlag('opening_complete');
    Game.gsm.setFlag('entered_settlement');
    Game.gsm.meetNpc('rask');

    // Move player to gate location
    Game.gsm.movePlayer('gate');

    // Transition to settlement scene
    this.scene.start('SettlementScene');
  }

  // ═══════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════

  fadeText(text, targetAlpha, duration) {
    return new Promise(resolve => {
      this.tweens.add({
        targets: text,
        alpha: targetAlpha,
        duration: duration,
        onComplete: resolve
      });
    });
  }

  delay(ms) {
    return new Promise(resolve => {
      this.time.delayedCall(ms, resolve);
    });
  }
}
```

---

## 10. Settlement Scene (Main Gameplay)

```javascript
// src/scenes/SettlementScene.js

import Phaser from 'phaser';
import { Game } from '../core/GameManager.js';
import { UIManager } from '../ui/UIManager.js';
import { DialogueController } from '../ui/DialogueController.js';
import { Transitions } from '../ui/Transitions.js';
import { Settlement } from '../world/Settlement.js';
import { PlayerController } from '../world/PlayerController.js';
import { EVENTS } from '../core/EventBus.js';

/**
 * SETTLEMENT SCENE
 * 
 * The main gameplay scene.
 * Player explores, talks to NPCs, uncovers the mystery.
 */

export class SettlementScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettlementScene' });
  }

  create() {
    this.cameras.main.fadeIn(500, 26, 23, 20);

    // ═══════════════════════════════════════
    // WORLD SETUP
    // ═══════════════════════════════════════
    
    // Create settlement map
    this.settlement = new Settlement(this);
    
    // Create player controller
    this.player = new PlayerController(this, this.settlement);

    // ═══════════════════════════════════════
    // UI SETUP
    // ═══════════════════════════════════════
    
    this.ui = new UIManager(this);
    this.dialogue = new DialogueController(this, Game);
    this.transitions = new Transitions(this);

    // ═══════════════════════════════════════
    // ATMOSPHERE
    // ═══════════════════════════════════════
    
    this.createAshfall();
    this.createHumEffect();

    // ═══════════════════════════════════════
    // EVENT LISTENERS
    // ═══════════════════════════════════════
    
    this.setupEventListeners();

    // ═══════════════════════════════════════
    // INITIAL STATE
    // ═══════════════════════════════════════
    
    // Update UI with current state
    this.updateUI();

    // Show initial location
    this.onLocationChange({ to: Game.gsm.get('player.location') });

    // If first entry, show glimpses
    if (!Game.gsm.hasFlag('settlement_glimpses_shown')) {
      this.showSettlementGlimpses();
    }
  }

  setupEventListeners() {
    const events = Game.gsm.events;

    // Location changes
    events.on(EVENTS.PLAYER_LOCATION_CHANGE, (e) => this.onLocationChange(e.data));

    // Tremors
    events.on(EVENTS.TREMOR, (e) => this.onTremor(e.data));

    // Curie manifestations
    events.on(EVENTS.CURIE_MANIFESTATION, () => this.onCurieManifestation());

    // Act transitions
    events.on(EVENTS.ACT_TRANSITION, (e) => this.onActTransition(e.data));

    // Conversation end
    this.events.on('conversation:end', () => this.onConversationEnd());

    // Dialogue advance (player clicks to continue)
    this.events.on('dialogue:advance', () => this.onDialogueAdvance());
  }

  // ═══════════════════════════════════════
  // ATMOSPHERE
  // ═══════════════════════════════════════

  createAshfall() {
    const { width } = this.cameras.main;
    
    this.ashEmitter = this.add.particles(0, -10, 'ash-particle', {
      x: { min: 0, max: width },
      lifespan: 8000,
      speedY: { min: 15, max: 35 },
      speedX: { min: -10, max: 10 },
      scale: { start: 0.8, end: 0.3 },
      alpha: { start: 0.5, end: 0 },
      quantity: 1,
      frequency: 300
    });
  }

  createHumEffect() {
    const { width, height } = this.cameras.main;

    // Vignette overlay for hum visualization
    this.humOverlay = this.add.graphics();
    this.humOverlay.setDepth(999);
    this.updateHumVisual();
  }

  updateHumVisual() {
    const { width, height } = this.cameras.main;
    const intensity = Game.gsm.get('environment.humIntensity');

    this.humOverlay.clear();

    // Draw vignette
    const alpha = intensity * 0.3;
    this.humOverlay.fillStyle(0x1a1714, alpha);
    this.humOverlay.fillRect(0, 0, 100, height);
    this.humOverlay.fillRect(width - 100, 0, 100, height);
    this.humOverlay.fillRect(0, 0, width, 80);
    this.humOverlay.fillRect(0, height - 80, width, 80);

    // Subtle color shift near edges
    if (intensity > 0.5) {
      this.humOverlay.fillStyle(0x442222, (intensity - 0.5) * 0.2);
      this.humOverlay.fillRect(0, 0, width, height);
    }
  }

  // ═══════════════════════════════════════
  // SETTLEMENT GLIMPSES (First Entry)
  // ═══════════════════════════════════════

  async showSettlementGlimpses() {
    const glimpses = [
      { npc: 'mara', text: "On the watchtower: a woman. Her posture says 'control.' Her grip on the railing says something else." },
      { npc: 'jonas', text: "By a shuttered building: a man with healer's hands. They're still. Too still." },
      { npc: 'kale', text: "Near the market stalls: a young man. He mirrors your posture before catching himself." },
      { npc: 'edda', text: "At the settlement's edge: an old woman. She's looking at you like she expected you." }
    ];

    for (const glimpse of glimpses) {
      await this.showGlimpse(glimpse);
    }

    // First tremor
    await this.delay(2000);
    await this.triggerFirstTremor();

    Game.gsm.setFlag('settlement_glimpses_shown');
  }

  async showGlimpse(glimpse) {
    const { width, height } = this.cameras.main;

    const text = this.add.text(width / 2, height / 2, glimpse.text, {
      fontFamily: 'Lora, serif',
      fontSize: '18px',
      color: '#a89a85',
      fontStyle: 'italic',
      wordWrap: { width: 600 },
      align: 'center'
    });
    text.setOrigin(0.5);
    text.setAlpha(0);
    text.setDepth(1500);

    await this.fadeElement(text, 1, 600);
    await this.delay(3000);
    await this.fadeElement(text, 0, 400);
    
    text.destroy();
  }

  async triggerFirstTremor() {
    // Environmental text
    const { width, height } = this.cameras.main;
    
    const text = this.add.text(width / 2, height / 2, "A subtle tremor. The well's stones shift softly.", {
      fontFamily: 'Lora, serif',
      fontSize: '18px',
      color: '#a89a85',
      fontStyle: 'italic'
    });
    text.setOrigin(0.5);
    text.setAlpha(0);
    text.setDepth(1500);

    await this.fadeElement(text, 1, 400);
    
    // Tremor effect
    Game.gsm.triggerTremor('light');
    await this.transitions.tremor('light');

    await this.delay(1500);

    // GHOST whisper
    await this.ui.voicePanel.showSingleVoice(
      'GHOST',
      "It remembers you. Or mistakes you. Both are dangerous."
    );

    await this.fadeElement(text, 0, 400);
    text.destroy();
  }

  // ═══════════════════════════════════════
  // EVENT HANDLERS
  // ═══════════════════════════════════════

  onLocationChange(data) {
    const location = data.to;
    const locationData = this.settlement.getLocationData(location);
    const npcsHere = this.settlement.getNpcsAtLocation(location);

    // Update location panel
    this.ui.updateLocation(location, locationData, npcsHere);

    // Update hum visual based on proximity to shaft
    this.updateHumVisual();

    // Special location effects
    if (location === 'sealed_shaft') {
      this.onNearShaft();
    }
  }

  onNearShaft() {
    // Intensify atmosphere
    this.transitions.ghostEffect(1500);
    
    // GHOST speaks
    this.ui.voicePanel.showSingleVoice(
      'GHOST',
      "Here. It's here. Beneath. Reaching."
    );
  }

  onTremor(data) {
    this.transitions.tremor(data.intensity);
    this.updateHumVisual();
  }

  onCurieManifestation() {
    this.transitions.ghostEffect(2000);
    
    // Random manifestation text
    const manifestations = [
      "The air thickens. Something presses against the edges of perception.",
      "For a moment, the hum sounds almost like words.",
      "The ground sighs. Or you imagine it does."
    ];
    
    const text = manifestations[Math.floor(Math.random() * manifestations.length)];
    // Could show as environmental text
  }

  onActTransition(data) {
    // Show act transition
    const actNames = {
      2: 'ACT II: The Settlement Frays',
      3: 'ACT III: The Unburying'
    };

    if (actNames[data.to]) {
      this.transitions.locationTransition(
        actNames[data.to],
        'Something has changed. Everything has changed.'
      );
    }
  }

  onConversationEnd() {
    // Re-enable player movement
    this.player.enable();
    
    // Update UI
    this.updateUI();
  }

  onDialogueAdvance() {
    // Handle in dialogue controller
  }

  // ═══════════════════════════════════════
  // NPC INTERACTION
  // ═══════════════════════════════════════

  async interactWithNpc(npcId) {
    // Disable player movement
    this.player.disable();

    // Start conversation
    await this.dialogue.startConversation(npcId);
  }

  // ═══════════════════════════════════════
  // UPDATE LOOP
  // ═══════════════════════════════════════

  update(time, delta) {
    // Update player
    if (this.player) {
      this.player.update(time, delta);
    }

    // Update HUD periodically
    if (time % 1000 < delta) {
      this.updateUI();
    }

    // Check for random events
    this.checkRandomEvents(time);
  }

  updateUI() {
    this.ui.updateHUD(Game.getUIState());
  }

  checkRandomEvents(time) {
    // Random tremor chance (increases with Curie activity)
    const curieActivity = Game.gsm.get('curie.activity');
    const lastTremor = Game.gsm.get('environment.lastTremor') || 0;
    const timeSinceTremor = time - lastTremor;

    if (timeSinceTremor > 60000 && Math.random() < curieActivity * 0.001) {
      Game.gsm.triggerTremor('light');
    }
  }

  // ═══════════════════════════════════════
  // UTILITY
  // ═══════════════════════════════════════

  fadeElement(element, targetAlpha, duration) {
    return new Promise(resolve => {
      this.tweens.add({
        targets: element,
        alpha: targetAlpha,
        duration: duration,
        onComplete: resolve
      });
    });
  }

  delay(ms) {
    return new Promise(resolve => {
      this.time.delayedCall(ms, resolve);
    });
  }
}
```

---

## 11. Player Controller

```javascript
// src/world/PlayerController.js

import Phaser from 'phaser';
import { Game } from '../core/GameManager.js';

/**
 * PLAYER CONTROLLER
 * 
 * Handles player movement and interaction in the settlement.
 */

export class PlayerController {
  constructor(scene, settlement) {
    this.scene = scene;
    this.settlement = settlement;
    this.enabled = true;
    this.speed = 150;

    this.create();
  }

  create() {
    const { width, height } = this.scene.cameras.main;

    // Player token (simple circle for prototype)
    this.sprite = this.scene.add.circle(width / 2, height / 2, 12, 0xe8dcc8);
    this.sprite.setDepth(100);

    // Movement indicator
    this.targetIndicator = this.scene.add.circle(0, 0, 8, 0x8b4513, 0.5);
    this.targetIndicator.setVisible(false);
    this.targetIndicator.setDepth(99);

    // Input
    this.setupInput();

    // Movement state
    this.isMoving = false;
    this.targetX = this.sprite.x;
    this.targetY = this.sprite.y;
  }

  setupInput() {
    // Click to move
    this.scene.input.on('pointerdown', (pointer) => {
      if (!this.enabled) return;
      
      // Check if clicking on NPC or location
      const clicked = this.checkClickTarget(pointer.x, pointer.y);
      
      if (clicked) {
        this.handleClick(clicked);
      } else {
        // Move to position
        this.moveTo(pointer.x, pointer.y);
      }
    });

    // Keyboard shortcuts for locations
    this.setupKeyboardShortcuts();
  }

  setupKeyboardShortcuts() {
    const keys = this.scene.input.keyboard.addKeys({
      one: 'ONE',
      two: 'TWO',
      three: 'THREE',
      four: 'FOUR',
      five: 'FIVE',
      six: 'SIX',
      seven: 'SEVEN',
      eight: 'EIGHT',
      nine: 'NINE'
    });

    const locationShortcuts = [
      'gate', 'market_square', 'clinic', 'watchtower',
      'storehouse', 'well', 'perimeter_path', 'player_quarters', 'sealed_shaft'
    ];

    Object.values(keys).forEach((key, index) => {
      key.on('down', () => {
        if (this.enabled && locationShortcuts[index]) {
          this.goToLocation(locationShortcuts[index]);
        }
      });
    });
  }

  checkClickTarget(x, y) {
    // Check NPCs
    for (const [npcId, npcSprite] of this.settlement.npcSprites) {
      if (npcSprite.getBounds().contains(x, y)) {
        return { type: 'npc', id: npcId };
      }
    }

    // Check location markers
    for (const [locId, locMarker] of this.settlement.locationMarkers) {
      if (locMarker.getBounds().contains(x, y)) {
        return { type: 'location', id: locId };
      }
    }

    return null;
  }

  handleClick(target) {
    if (target.type === 'npc') {
      // Move toward NPC then interact
      const npcSprite = this.settlement.npcSprites.get(target.id);
      this.moveTo(npcSprite.x, npcSprite.y, () => {
        this.scene.interactWithNpc(target.id);
      });
    } else if (target.type === 'location') {
      this.goToLocation(target.id);
    }
  }

  moveTo(x, y, onComplete = null) {
    this.targetX = x;
    this.targetY = y;
    this.isMoving = true;
    this.onMoveComplete = onComplete;

    // Show target indicator
    this.targetIndicator.setPosition(x, y);
    this.targetIndicator.setVisible(true);
  }

  goToLocation(locationId) {
    const locationData = this.settlement.getLocationData(locationId);
    if (!locationData) return;

    // Move to location center
    const { x, y } = this.settlement.getLocationPosition(locationId);
    this.moveTo(x, y, () => {
      Game.gsm.movePlayer(locationId);
    });
  }

  update(time, delta) {
    if (!this.enabled || !this.isMoving) return;

    // Move toward target
    const dx = this.targetX - this.sprite.x;
    const dy = this.targetY - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      // Arrived
      this.sprite.setPosition(this.targetX, this.targetY);
      this.isMoving = false;
      this.targetIndicator.setVisible(false);

      if (this.onMoveComplete) {
        this.onMoveComplete();
        this.onMoveComplete = null;
      }
    } else {
      // Move toward target
      const moveX = (dx / distance) * this.speed * (delta / 1000);
      const moveY = (dy / distance) * this.speed * (delta / 1000);
      
      this.sprite.x += moveX;
      this.sprite.y += moveY;
    }
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
    this.isMoving = false;
  }

  setPosition(x, y) {
    this.sprite.setPosition(x, y);
    this.targetX = x;
    this.targetY = y;
  }
}
```

---

## 12. Settlement (Map)

```javascript
// src/world/Settlement.js

import Phaser from 'phaser';
import { Game } from '../core/GameManager.js';
import { LOCATIONS } from '../data/locations.js';

/**
 * SETTLEMENT
 * 
 * The game world map and location management.
 */

export class Settlement {
  constructor(scene) {
    this.scene = scene;
    this.locationMarkers = new Map();
    this.npcSprites = new Map();

    this.create();
  }

  create() {
    const { width, height } = this.scene.cameras.main;

    // Background
    this.scene.add.rectangle(width/2, height/2, width, height, 0x1a1714);

    // Create location markers
    this.createLocationMarkers();

    // Create NPC sprites
    this.createNpcSprites();

    // Create connections (visual lines between locations)
    this.createConnections();
  }

  createLocationMarkers() {
    const { width, height } = this.scene.cameras.main;

    // Position mapping (rough layout)
    const positions = {
      gate: { x: width * 0.1, y: height * 0.5, name: 'Gate' },
      market_square: { x: width * 0.35, y: height * 0.65, name: 'Market Square' },
      clinic: { x: width * 0.6, y: height * 0.3, name: 'Clinic' },
      watchtower: { x: width * 0.15, y: height * 0.2, name: 'Watchtower' },
      storehouse: { x: width * 0.45, y: height * 0.35, name: 'Storehouse' },
      well: { x: width * 0.35, y: height * 0.45, name: 'The Well' },
      perimeter_path: { x: width * 0.2, y: height * 0.75, name: 'Perimeter' },
      player_quarters: { x: width * 0.25, y: height * 0.55, name: 'Your Quarters' },
      sealed_shaft: { x: width * 0.5, y: height * 0.55, name: 'The Shaft' }
    };

    for (const [locId, pos] of Object.entries(positions)) {
      const marker = this.createLocationMarker(locId, pos);
      this.locationMarkers.set(locId, marker);
    }
  }

  createLocationMarker(locId, pos) {
    const isShaft = locId === 'sealed_shaft';
    const color = isShaft ? 0x442222 : 0x3d3832;
    const size = isShaft ? 40 : 25;

    // Marker circle
    const marker = this.scene.add.circle(pos.x, pos.y, size, color, 0.6);
    marker.setInteractive({ useHandCursor: true });
    marker.setDepth(10);

    // Hover effect
    marker.on('pointerover', () => {
      marker.setFillStyle(color, 0.9);
      this.showLocationTooltip(pos.x, pos.y - 40, pos.name);
    });

    marker.on('pointerout', () => {
      marker.setFillStyle(color, 0.6);
      this.hideLocationTooltip();
    });

    // Label
    const label = this.scene.add.text(pos.x, pos.y + size + 10, pos.name, {
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: '11px',
      color: '#6b6358'
    });
    label.setOrigin(0.5, 0);
    label.setDepth(11);

    // Special effect for shaft
    if (isShaft) {
      this.createShaftEffect(pos.x, pos.y);
    }

    return marker;
  }

  createShaftEffect(x, y) {
    // Pulsing glow
    const glow = this.scene.add.circle(x, y, 45, 0x442222, 0.2);
    glow.setDepth(9);

    this.scene.tweens.add({
      targets: glow,
      alpha: { from: 0.1, to: 0.3 },
      scale: { from: 1, to: 1.1 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Rising dust
    this.scene.add.particles(x, y, 'dust-particle', {
      speed: { min: 5, max: 15 },
      angle: { min: 260, max: 280 },
      lifespan: 3000,
      alpha: { start: 0.4, end: 0 },
      quantity: 1,
      frequency: 800
    });
  }

  showLocationTooltip(x, y, text) {
    if (this.tooltip) this.tooltip.destroy();

    this.tooltip = this.scene.add.text(x, y, text, {
      fontFamily: 'Oswald, sans-serif',
      fontSize: '14px',
      color: '#e8dcc8',
      backgroundColor: '#1a1714',
      padding: { x: 8, y: 4 }
    });
    this.tooltip.setOrigin(0.5);
    this.tooltip.setDepth(1000);
  }

  hideLocationTooltip() {
    if (this.tooltip) {
      this.tooltip.destroy();
      this.tooltip = null;
    }
  }

  createNpcSprites() {
    const npcs = Game.gsm.get('npcs');
    
    for (const [npcId, npcData] of Object.entries(npcs)) {
      const locPos = this.getLocationPosition(npcData.location);
      if (!locPos) continue;

      // Offset from location center
      const offset = this.getNpcOffset(npcId);
      const x = locPos.x + offset.x;
      const y = locPos.y + offset.y;

      const sprite = this.createNpcSprite(npcId, x, y);
      this.npcSprites.set(npcId, sprite);
    }
  }

  getNpcOffset(npcId) {
    const offsets = {
      mara: { x: 0, y: -20 },
      jonas: { x: 15, y: 0 },
      rask: { x: -20, y: 0 },
      edda: { x: 0, y: 20 },
      kale: { x: 20, y: 10 }
    };
    return offsets[npcId] || { x: 0, y: 0 };
  }

  createNpcSprite(npcId, x, y) {
    const colors = {
      mara: 0x8b4513,
      jonas: 0x6b8e6b,
      rask: 0x4a4a4a,
      edda: 0x9b8b7b,
      kale: 0x7b7b9b
    };

    const sprite = this.scene.add.circle(x, y, 10, colors[npcId] || 0x666666);
    sprite.setInteractive({ useHandCursor: true });
    sprite.setDepth(50);

    // NPC name label
    const label = this.scene.add.text(x, y - 18, npcId.charAt(0).toUpperCase() + npcId.slice(1), {
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: '10px',
      color: '#a89a85'
    });
    label.setOrigin(0.5);
    label.setDepth(51);

    // Hover effect
    sprite.on('pointerover', () => {
      sprite.setScale(1.3);
      label.setColor('#e8dcc8');
    });

    sprite.on('pointerout', () => {
      sprite.setScale(1);
      label.setColor('#a89a85');
    });

    return sprite;
  }

  createConnections() {
    const connections = [
      ['gate', 'market_square'],
      ['gate', 'perimeter_path'],
      ['market_square', 'well'],
      ['market_square', 'player_quarters'],
      ['well', 'sealed_shaft'],
      ['well', 'storehouse'],
      ['storehouse', 'clinic'],
      ['storehouse', 'sealed_shaft'],
      ['watchtower', 'perimeter_path'],
      ['watchtower', 'storehouse']
    ];

    const graphics = this.scene.add.graphics();
    graphics.lineStyle(1, 0x3d3832, 0.3);

    for (const [from, to] of connections) {
      const fromPos = this.getLocationPosition(from);
      const toPos = this.getLocationPosition(to);
      
      if (fromPos && toPos) {
        graphics.lineBetween(fromPos.x, fromPos.y, toPos.x, toPos.y);
      }
    }

    graphics.setDepth(1);
  }

  // ═══════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════

  getLocationPosition(locationId) {
    const marker = this.locationMarkers.get(locationId);
    if (marker) {
      return { x: marker.x, y: marker.y };
    }
    return null;
  }

  getLocationData(locationId) {
    return LOCATIONS[locationId] || null;
  }

  getNpcsAtLocation(locationId) {
    const npcs = Game.gsm.get('npcs');
    const result = [];

    for (const [npcId, npcData] of Object.entries(npcs)) {
      if (npcData.location === locationId) {
        result.push(npcId);
      }
    }

    return result;
  }

  // ═══════════════════════════════════════
  // NPC POSITION UPDATES
  // ═══════════════════════════════════════

  updateNpcPosition(npcId, newLocation) {
    const sprite = this.npcSprites.get(npcId);
    if (!sprite) return;

    const locPos = this.getLocationPosition(newLocation);
    if (!locPos) return;

    const offset = this.getNpcOffset(npcId);

    this.scene.tweens.add({
      targets: sprite,
      x: locPos.x + offset.x,
      y: locPos.y + offset.y,
      duration: 500,
      ease: 'Power2'
    });
  }
}
```

---

## 13. Location Data

```javascript
// src/data/locations.js

export const LOCATIONS = {
  gate: {
    name: 'The Gate',
    description: 'Heavy metal, patched and re-patched. The only way in or out.',
    connections: ['market_square', 'perimeter_path'],
    emotionalField: 'threshold',
    defaultNpcs: ['rask']
  },

  market_square: {
    name: 'Market Square',
    description: 'Empty stalls. Ghost of commerce. The dustiest place in Ashfall.',
    connections: ['gate', 'well', 'player_quarters'],
    emotionalField: 'absence',
    defaultNpcs: ['kale']
  },

  clinic: {
    name: "Jonas's Clinic",
    description: 'A shack with dusty windows. The door is open but uninviting.',
    connections: ['storehouse'],
    emotionalField: 'paralysis',
    defaultNpcs: ['jonas']
  },

  watchtower: {
    name: "Mara's Watchtower",
    description: 'Scaffold of beams. Highest point in the settlement. Isolated.',
    connections: ['perimeter_path', 'storehouse'],
    emotionalField: 'vigilance',
    defaultNpcs: ['mara']
  },

  storehouse: {
    name: 'The Storehouse',
    description: "Largest intact building. Locked. Mara's territory.",
    connections: ['well', 'clinic', 'watchtower', 'sealed_shaft'],
    emotionalField: 'scarcity',
    defaultNpcs: []
  },

  well: {
    name: 'The Old Well',
    description: 'Cracked stone, half-collapsed. Nobody looks at it directly.',
    connections: ['market_square', 'storehouse', 'sealed_shaft'],
    emotionalField: 'shame',
    defaultNpcs: []
  },

  perimeter_path: {
    name: 'Perimeter Path',
    description: "Dusty track along the settlement's edge. Edda walks here.",
    connections: ['gate', 'watchtower'],
    emotionalField: 'boundary',
    defaultNpcs: ['edda']
  },

  player_quarters: {
    name: 'Your Quarters',
    description: "Thin walls. Door doesn't close right. But it's yours.",
    connections: ['market_square'],
    emotionalField: 'liminal',
    defaultNpcs: []
  },

  sealed_shaft: {
    name: 'The Sealed Shaft',
    description: 'The center of everything. A metal cover. The ground dips toward it.',
    connections: ['well', 'storehouse'],
    emotionalField: 'dread',
    defaultNpcs: [],
    special: true
  }
};
```

---

## 14. Ending Scene (Placeholder)

```javascript
// src/scenes/EndingScene.js

import Phaser from 'phaser';
import { Game } from '../core/GameManager.js';

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

    const credits = this.add.text(width / 2, height - 50, 
      'ASHFALL\n\nCreated with Aria, Logos, and Agent Smith\n\n"Small lives. Heavy truths. The earth remembers."', {
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: '12px',
      color: '#6b6358',
      align: 'center'
    });
    credits.setOrigin(0.5, 1);
    credits.setAlpha(0);

    this.tweens.add({
      targets: credits,
      alpha: 0.8,
      duration: 2000
    });
  }
}
```

---

## 15. Installation & Running

```bash
# Clone or create the project directory
mkdir ashfall
cd ashfall

# Initialize and install dependencies
npm init -y
npm install phaser openai vite

# Create the file structure (as shown above)
# ... create all files ...

# Add your OpenAI API key to .env
echo "OPENAI_API_KEY=your_key_here" > .env

# Run the development server
npm run dev

# Open http://localhost:3000
```

---

## 16. Implementation Order

For Agent Smith, build in this order:

1. **Core Setup**
   - [ ] package.json, vite.config.js, index.html
   - [ ] src/config.js
   - [ ] src/main.js

2. **Core Systems**
   - [ ] src/core/GameState.js
   - [ ] src/core/EventBus.js
   - [ ] src/core/GameStateManager.js
   - [ ] src/core/GameManager.js

3. **Data**
   - [ ] src/data/locations.js
   - [ ] src/data/npcData.js

4. **UI Foundation**
   - [ ] src/ui/UIConstants.js
   - [ ] src/ui/UIManager.js (minimal version)
   - [ ] src/ui/DialogueBox.js
   - [ ] src/ui/VoicePanel.js
   - [ ] src/ui/ChoicePanel.js

5. **Scenes**
   - [ ] src/scenes/BootScene.js
   - [ ] src/scenes/OpeningScene.js (simplified)
   - [ ] src/scenes/SettlementScene.js (minimal)

6. **World**
   - [ ] src/world/Settlement.js
   - [ ] src/world/PlayerController.js

7. **Dialogue**
   - [ ] src/dialogue/DialogueEngine.js
   - [ ] src/dialogue/npcCodexes.js
   - [ ] src/dialogue/tonePrimer.js

8. **Polish**
   - [ ] Full UI components
   - [ ] Transitions
   - [ ] Audio (if time)
   - [ ] Ending scene

---

## Summary

This bootstrap guide provides:

| Component | Purpose |
|-----------|---------|
| **Project Structure** | Where everything goes |
| **Package.json** | Dependencies |
| **Vite Config** | Build system |
| **Main.js** | Entry point |
| **Config.js** | Phaser setup |
| **BootScene** | Asset loading |
| **OpeningScene** | First playable moment |
| **SettlementScene** | Main gameplay |
| **PlayerController** | Movement |
| **Settlement** | Map and NPCs |
| **Location Data** | World definition |
| **EndingScene** | Victory/conclusion |

**To run the game:**

```bash
npm install
npm run dev
```

---

*"Small lives. Heavy truths. The earth remembers."*

*— The complete blueprint*
