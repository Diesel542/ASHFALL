// ASHFALL - Main Entry Point
// A dying settlement. Five people. One secret.

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { GameScene } from './scenes/GameScene.js';
import { DialogueScene } from './scenes/DialogueScene.js';
import { UIScene } from './scenes/UIScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#1a1a1a',
    pixelArt: true,
    scene: [BootScene, GameScene, DialogueScene, UIScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Global game state - persists across scenes
window.ASHFALL = {
    // Player state
    player: {
        x: 0,
        y: 0,
        skills: {
            logic: 5,
            instinct: 5,
            empathy: 5,
            ghost: 5
        }
    },
    
    // Consequence tracking
    flags: new Map(),
    memories: new Map(),
    relationships: {},
    weights: {
        kindness: 0,
        cruelty: 0,
        truth: 0,
        deception: 0,
        courage: 0,
        cowardice: 0
    },
    
    // Actions log
    actions: [],
    
    // Helper methods
    setFlag(key, value = true) {
        this.flags.set(key, value);
    },
    
    hasFlag(key) {
        return this.flags.get(key) || false;
    },
    
    remember(npc, memory) {
        if (!this.memories.has(npc)) {
            this.memories.set(npc, []);
        }
        this.memories.get(npc).push(memory);
    },
    
    getMemories(npc) {
        return this.memories.get(npc) || [];
    },
    
    adjustRelationship(npc, delta) {
        this.relationships[npc] = (this.relationships[npc] || 0) + delta;
    },
    
    recordAction(action) {
        this.actions.push({
            ...action,
            timestamp: Date.now()
        });
        
        if (action.weights) {
            for (const [key, value] of Object.entries(action.weights)) {
                if (this.weights.hasOwnProperty(key)) {
                    this.weights[key] += value;
                }
            }
        }
    }
};

// Start the game
const game = new Phaser.Game(config);

export default game;
