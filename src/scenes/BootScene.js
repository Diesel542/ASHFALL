// ASHFALL - Boot Scene
// Loading screen and asset initialization

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Title
        const title = this.add.text(width / 2, height / 2 - 100, 'ASHFALL', {
            fontFamily: 'Courier New',
            fontSize: '48px',
            color: '#c4a77d'
        }).setOrigin(0.5);
        
        // Subtitle
        const subtitle = this.add.text(width / 2, height / 2 - 50, 'A dying settlement at the edge of the wasteland', {
            fontFamily: 'Courier New',
            fontSize: '16px',
            color: '#666666'
        }).setOrigin(0.5);
        
        // Progress bar background
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2, 320, 30);
        
        // Progress bar fill
        const progressBar = this.add.graphics();
        
        // Loading text
        const loadingText = this.add.text(width / 2, height / 2 + 50, 'Loading...', {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#666666'
        }).setOrigin(0.5);
        
        // Update progress bar
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xc4a77d, 1);
            progressBar.fillRect(width / 2 - 155, height / 2 + 5, 310 * value, 20);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
        
        // Generate placeholder assets programmatically
        this.createPlaceholderAssets();
    }

    createPlaceholderAssets() {
        // Create isometric tile (diamond shape)
        const tileGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Ground tile - dusty brown
        tileGraphics.fillStyle(0x8B7355, 1);
        tileGraphics.beginPath();
        tileGraphics.moveTo(32, 0);      // Top
        tileGraphics.lineTo(64, 16);     // Right
        tileGraphics.lineTo(32, 32);     // Bottom
        tileGraphics.lineTo(0, 16);      // Left
        tileGraphics.closePath();
        tileGraphics.fillPath();
        
        // Add some texture/noise
        tileGraphics.lineStyle(1, 0x6B5344, 0.3);
        tileGraphics.lineTo(32, 0);
        
        tileGraphics.generateTexture('tile_ground', 64, 32);
        tileGraphics.clear();
        
        // Highlighted tile (for hover)
        tileGraphics.fillStyle(0xc4a77d, 1);
        tileGraphics.beginPath();
        tileGraphics.moveTo(32, 0);
        tileGraphics.lineTo(64, 16);
        tileGraphics.lineTo(32, 32);
        tileGraphics.lineTo(0, 16);
        tileGraphics.closePath();
        tileGraphics.fillPath();
        tileGraphics.generateTexture('tile_highlight', 64, 32);
        tileGraphics.clear();
        
        // Blocked/unwalkable tile
        tileGraphics.fillStyle(0x4a3728, 1);
        tileGraphics.beginPath();
        tileGraphics.moveTo(32, 0);
        tileGraphics.lineTo(64, 16);
        tileGraphics.lineTo(32, 32);
        tileGraphics.lineTo(0, 16);
        tileGraphics.closePath();
        tileGraphics.fillPath();
        tileGraphics.generateTexture('tile_blocked', 64, 32);
        tileGraphics.clear();
        
        // Player character (simple figure)
        const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Shadow
        playerGraphics.fillStyle(0x000000, 0.3);
        playerGraphics.fillEllipse(16, 44, 20, 8);
        
        // Body
        playerGraphics.fillStyle(0xc4a77d, 1);
        playerGraphics.fillRect(12, 16, 8, 24);
        
        // Head
        playerGraphics.fillStyle(0xd4b896, 1);
        playerGraphics.fillCircle(16, 12, 8);
        
        playerGraphics.generateTexture('player', 32, 48);
        playerGraphics.clear();
        
        // NPC placeholder (slightly different color)
        const npcGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Shadow
        npcGraphics.fillStyle(0x000000, 0.3);
        npcGraphics.fillEllipse(16, 44, 20, 8);
        
        // Body
        npcGraphics.fillStyle(0x7a6555, 1);
        npcGraphics.fillRect(12, 16, 8, 24);
        
        // Head
        npcGraphics.fillStyle(0x9a8575, 1);
        npcGraphics.fillCircle(16, 12, 8);
        
        npcGraphics.generateTexture('npc', 32, 48);
        npcGraphics.clear();
        
        // Simple building block
        const buildingGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Top face
        buildingGraphics.fillStyle(0x6a5545, 1);
        buildingGraphics.beginPath();
        buildingGraphics.moveTo(32, 0);
        buildingGraphics.lineTo(64, 16);
        buildingGraphics.lineTo(32, 32);
        buildingGraphics.lineTo(0, 16);
        buildingGraphics.closePath();
        buildingGraphics.fillPath();
        
        // Left face
        buildingGraphics.fillStyle(0x4a3525, 1);
        buildingGraphics.beginPath();
        buildingGraphics.moveTo(0, 16);
        buildingGraphics.lineTo(32, 32);
        buildingGraphics.lineTo(32, 64);
        buildingGraphics.lineTo(0, 48);
        buildingGraphics.closePath();
        buildingGraphics.fillPath();
        
        // Right face
        buildingGraphics.fillStyle(0x5a4535, 1);
        buildingGraphics.beginPath();
        buildingGraphics.moveTo(64, 16);
        buildingGraphics.lineTo(32, 32);
        buildingGraphics.lineTo(32, 64);
        buildingGraphics.lineTo(64, 48);
        buildingGraphics.closePath();
        buildingGraphics.fillPath();
        
        buildingGraphics.generateTexture('building', 64, 64);
        buildingGraphics.destroy();
    }

    create() {
        // Transition to game scene
        this.cameras.main.fadeOut(500, 0, 0, 0);
        
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
        });
    }
}
