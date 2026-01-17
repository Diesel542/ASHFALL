// ASHFALL - Isometric Utilities
// Convert between screen space and isometric grid space

// Tile dimensions (2:1 ratio for isometric)
export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

// Convert grid coordinates to screen position
export function gridToScreen(gridX, gridY) {
    const screenX = (gridX - gridY) * (TILE_WIDTH / 2);
    const screenY = (gridX + gridY) * (TILE_HEIGHT / 2);
    return { x: screenX, y: screenY };
}

// Convert screen position to grid coordinates
export function screenToGrid(screenX, screenY) {
    const gridX = Math.floor((screenX / (TILE_WIDTH / 2) + screenY / (TILE_HEIGHT / 2)) / 2);
    const gridY = Math.floor((screenY / (TILE_HEIGHT / 2) - screenX / (TILE_WIDTH / 2)) / 2);
    return { x: gridX, y: gridY };
}

// Get the center offset for the map (to center it on screen)
export function getMapCenter(mapWidth, mapHeight, screenWidth, screenHeight) {
    return {
        x: screenWidth / 2,
        y: screenHeight / 4
    };
}

// Calculate depth for sprite sorting (things further back render first)
export function calculateDepth(gridX, gridY) {
    return gridX + gridY;
}

// Check if a grid position is within map bounds
export function isInBounds(gridX, gridY, mapWidth, mapHeight) {
    return gridX >= 0 && gridX < mapWidth && gridY >= 0 && gridY < mapHeight;
}

// Get neighboring tiles (for pathfinding)
export function getNeighbors(gridX, gridY) {
    return [
        { x: gridX - 1, y: gridY },     // West
        { x: gridX + 1, y: gridY },     // East
        { x: gridX, y: gridY - 1 },     // North
        { x: gridX, y: gridY + 1 },     // South
        { x: gridX - 1, y: gridY - 1 }, // Northwest
        { x: gridX + 1, y: gridY - 1 }, // Northeast
        { x: gridX - 1, y: gridY + 1 }, // Southwest
        { x: gridX + 1, y: gridY + 1 }  // Southeast
    ];
}

// Simple A* pathfinding
export function findPath(startX, startY, endX, endY, isWalkable) {
    const openSet = [{ x: startX, y: startY, g: 0, h: 0, f: 0, parent: null }];
    const closedSet = new Set();
    
    const heuristic = (x1, y1, x2, y2) => Math.abs(x1 - x2) + Math.abs(y1 - y2);
    
    while (openSet.length > 0) {
        // Find node with lowest f score
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift();
        
        // Reached the goal
        if (current.x === endX && current.y === endY) {
            const path = [];
            let node = current;
            while (node) {
                path.unshift({ x: node.x, y: node.y });
                node = node.parent;
            }
            return path;
        }
        
        closedSet.add(`${current.x},${current.y}`);
        
        // Check neighbors
        for (const neighbor of getNeighbors(current.x, current.y)) {
            const key = `${neighbor.x},${neighbor.y}`;
            
            if (closedSet.has(key)) continue;
            if (!isWalkable(neighbor.x, neighbor.y)) continue;
            
            const g = current.g + 1;
            const h = heuristic(neighbor.x, neighbor.y, endX, endY);
            const f = g + h;
            
            const existing = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
            
            if (!existing) {
                openSet.push({ ...neighbor, g, h, f, parent: current });
            } else if (g < existing.g) {
                existing.g = g;
                existing.f = f;
                existing.parent = current;
            }
        }
    }
    
    return null; // No path found
}
