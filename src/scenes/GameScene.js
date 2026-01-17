// ASHFALL - Game Scene
// The main isometric game world

import { gridToScreen, screenToGrid, calculateDepth, isInBounds, findPath, TILE_WIDTH, TILE_HEIGHT } from '../engine/isometric.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // Map dimensions
        this.mapWidth = 16;
        this.mapHeight = 16;
        
        // Map data (0 = walkable, 1 = blocked)
        this.mapData = null;
        
        // Tile sprites
        this.tiles = [];
        
        // Player
        this.player = null;
        this.playerGridX = 2;
        this.playerGridY = 2;
        this.isMoving = false;
        this.movePath = [];
        
        // NPCs
        this.npcs = [];
        
        // Camera offset
        this.offsetX = 0;
        this.offsetY = 0;
        
        // Currently hovered tile
        this.hoveredTile = null;
    }

    create() {
        this.cameras.main.fadeIn(500, 0, 0, 0);
        
        // Calculate offset to center the map
        this.offsetX = this.cameras.main.width / 2;
        this.offsetY = 150;
        
        // Generate the settlement map
        this.generateMap();
        
        // Render the map
        this.renderMap();
        
        // Create player
        this.createPlayer();
        
        // Create NPCs
        this.createNPCs();
        
        // Set up input
        this.setupInput();
        
        // Launch UI scene on top
        this.scene.launch('UIScene');
        
        // Instructions
        this.add.text(16, 16, 'Click to move. Approach NPCs to talk.', {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#666666'
        });
        
        // Settlement name
        this.add.text(this.cameras.main.width / 2, 50, 'ASHFALL', {
            fontFamily: 'Courier New',
            fontSize: '24px',
            color: '#c4a77d'
        }).setOrigin(0.5);
    }

    generateMap() {
        // Initialize with all walkable
        this.mapData = [];
        for (let y = 0; y < this.mapHeight; y++) {
            this.mapData[y] = [];
            for (let x = 0; x < this.mapWidth; x++) {
                this.mapData[y][x] = 0;
            }
        }
        
        // Add some buildings/obstacles
        // Central building (the gathering place)
        this.setBlocked(7, 7);
        this.setBlocked(8, 7);
        this.setBlocked(7, 8);
        this.setBlocked(8, 8);
        
        // Healer's hut
        this.setBlocked(3, 4);
        this.setBlocked(4, 4);
        
        // Leader's quarters
        this.setBlocked(11, 3);
        this.setBlocked(12, 3);
        this.setBlocked(11, 4);
        
        // Storage/mystery structure
        this.setBlocked(4, 11);
        this.setBlocked(5, 11);
        this.setBlocked(4, 12);
        
        // Perimeter walls/rubble
        for (let i = 0; i < this.mapWidth; i++) {
            if (Math.random() > 0.3) this.setBlocked(i, 0);
            if (Math.random() > 0.3) this.setBlocked(i, this.mapHeight - 1);
            if (Math.random() > 0.3) this.setBlocked(0, i);
            if (Math.random() > 0.3) this.setBlocked(this.mapWidth - 1, i);
        }
        
        // Ensure starting position is clear
        this.mapData[2][2] = 0;
        this.mapData[3][2] = 0;
        this.mapData[2][3] = 0;
    }

    setBlocked(x, y) {
        if (isInBounds(x, y, this.mapWidth, this.mapHeight)) {
            this.mapData[y][x] = 1;
        }
    }

    renderMap() {
        // Create a container for proper depth sorting
        this.tileContainer = this.add.container(0, 0);
        
        for (let y = 0; y < this.mapHeight; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.mapWidth; x++) {
                const screenPos = gridToScreen(x, y);
                const isBlocked = this.mapData[y][x] === 1;
                
                const tileKey = isBlocked ? 'tile_blocked' : 'tile_ground';
                const tile = this.add.image(
                    screenPos.x + this.offsetX,
                    screenPos.y + this.offsetY,
                    tileKey
                );
                
                tile.setDepth(calculateDepth(x, y));
                tile.setInteractive();
                tile.gridX = x;
                tile.gridY = y;
                tile.isBlocked = isBlocked;
                tile.originalTexture = tileKey;
                
                this.tiles[y][x] = tile;
                
                // Add building sprites on top of blocked tiles
                if (isBlocked) {
                    const building = this.add.image(
                        screenPos.x + this.offsetX,
                        screenPos.y + this.offsetY - 16,
                        'building'
                    );
                    building.setDepth(calculateDepth(x, y) + 0.5);
                }
            }
        }
    }

    createPlayer() {
        const screenPos = gridToScreen(this.playerGridX, this.playerGridY);
        
        this.player = this.add.image(
            screenPos.x + this.offsetX,
            screenPos.y + this.offsetY - 16,
            'player'
        );
        
        this.player.setDepth(calculateDepth(this.playerGridX, this.playerGridY) + 1);
        
        // Store in global state
        window.ASHFALL.player.x = this.playerGridX;
        window.ASHFALL.player.y = this.playerGridY;
    }

    createNPCs() {
        // The five of Ashfall
        const npcData = [
            { id: 'leader', name: 'THE LEADER', gridX: 10, gridY: 4, color: 0xaa8866 },
            { id: 'healer', name: 'THE HEALER', gridX: 5, gridY: 5, color: 0x88aa88 },
            { id: 'threat', name: 'THE THREAT', gridX: 12, gridY: 10, color: 0xaa6666 },
            { id: 'keeper', name: 'THE SECRET-KEEPER', gridX: 6, gridY: 11, color: 0x8888aa },
            { id: 'mirror', name: 'THE MIRROR', gridX: 8, gridY: 5, color: 0xaaaaaa }
        ];
        
        npcData.forEach(data => {
            const screenPos = gridToScreen(data.gridX, data.gridY);
            
            const npc = this.add.image(
                screenPos.x + this.offsetX,
                screenPos.y + this.offsetY - 16,
                'npc'
            );
            
            npc.setDepth(calculateDepth(data.gridX, data.gridY) + 1);
            npc.setTint(data.color);
            npc.setInteractive();
            
            npc.npcId = data.id;
            npc.npcName = data.name;
            npc.gridX = data.gridX;
            npc.gridY = data.gridY;
            
            // Hover effect
            npc.on('pointerover', () => {
                npc.setScale(1.1);
                this.showNPCLabel(npc);
            });
            
            npc.on('pointerout', () => {
                npc.setScale(1.0);
                this.hideNPCLabel();
            });
            
            this.npcs.push(npc);
        });
    }

    showNPCLabel(npc) {
        if (this.npcLabel) this.npcLabel.destroy();
        
        this.npcLabel = this.add.text(
            npc.x,
            npc.y - 40,
            npc.npcName,
            {
                fontFamily: 'Courier New',
                fontSize: '12px',
                color: '#c4a77d',
                backgroundColor: '#1a1a1a',
                padding: { x: 4, y: 2 }
            }
        ).setOrigin(0.5).setDepth(1000);
    }

    hideNPCLabel() {
        if (this.npcLabel) {
            this.npcLabel.destroy();
            this.npcLabel = null;
        }
    }

    setupInput() {
        // Tile hover
        this.input.on('pointermove', (pointer) => {
            const worldX = pointer.x - this.offsetX;
            const worldY = pointer.y - this.offsetY;
            const gridPos = screenToGrid(worldX, worldY);
            
            // Clear previous highlight
            if (this.hoveredTile) {
                this.hoveredTile.setTexture(this.hoveredTile.originalTexture);
            }
            
            // Highlight new tile
            if (isInBounds(gridPos.x, gridPos.y, this.mapWidth, this.mapHeight)) {
                const tile = this.tiles[gridPos.y][gridPos.x];
                if (tile && !tile.isBlocked) {
                    tile.setTexture('tile_highlight');
                    this.hoveredTile = tile;
                }
            }
        });
        
        // Click to move
        this.input.on('pointerdown', (pointer) => {
            if (this.isMoving) return;
            
            const worldX = pointer.x - this.offsetX;
            const worldY = pointer.y - this.offsetY;
            const gridPos = screenToGrid(worldX, worldY);
            
            if (isInBounds(gridPos.x, gridPos.y, this.mapWidth, this.mapHeight)) {
                this.movePlayerTo(gridPos.x, gridPos.y);
            }
        });
    }

    movePlayerTo(targetX, targetY) {
        // Check if target is walkable
        if (this.mapData[targetY][targetX] === 1) return;
        
        // Find path
        const path = findPath(
            this.playerGridX,
            this.playerGridY,
            targetX,
            targetY,
            (x, y) => isInBounds(x, y, this.mapWidth, this.mapHeight) && this.mapData[y][x] === 0
        );
        
        if (path && path.length > 1) {
            this.movePath = path.slice(1); // Remove starting position
            this.isMoving = true;
            this.moveAlongPath();
        }
    }

    moveAlongPath() {
        if (this.movePath.length === 0) {
            this.isMoving = false;
            this.checkNPCProximity();
            return;
        }
        
        const nextPos = this.movePath.shift();
        const screenPos = gridToScreen(nextPos.x, nextPos.y);
        
        this.tweens.add({
            targets: this.player,
            x: screenPos.x + this.offsetX,
            y: screenPos.y + this.offsetY - 16,
            duration: 200,
            ease: 'Linear',
            onComplete: () => {
                this.playerGridX = nextPos.x;
                this.playerGridY = nextPos.y;
                this.player.setDepth(calculateDepth(nextPos.x, nextPos.y) + 1);
                
                // Update global state
                window.ASHFALL.player.x = this.playerGridX;
                window.ASHFALL.player.y = this.playerGridY;
                
                this.moveAlongPath();
            }
        });
    }

    checkNPCProximity() {
        // Check if player is adjacent to any NPC
        for (const npc of this.npcs) {
            const dx = Math.abs(this.playerGridX - npc.gridX);
            const dy = Math.abs(this.playerGridY - npc.gridY);
            
            if (dx <= 1 && dy <= 1) {
                this.startDialogue(npc);
                break;
            }
        }
    }

    startDialogue(npc) {
        // Launch dialogue scene with NPC data
        this.scene.launch('DialogueScene', {
            npcId: npc.npcId,
            npcName: npc.npcName
        });
        
        // Pause this scene
        this.scene.pause();
    }

    update() {
        // Depth sort all NPCs and player based on their grid position
        // This ensures proper visual layering
    }
}
