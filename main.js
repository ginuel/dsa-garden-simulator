/**
 * ============================================================================
 * MODULAR 2D GARDEN SIMULATOR - MAIN CONTROLLER SCRIPT
 * ============================================================================
 */

import { CentralGameManager } from './CentralManager.js';
import { GardenRoom } from './GardenRoom.js';
import { ClimateRoom } from './ClimateRoom.js';
import { LabRoom } from './LabRoom.js';
import { EcologyRoom } from './EcologyRoom.js';
import { TraversalRoom } from './TraversalRoom.js';
import { StoreRoom } from './StoreRoom.js';
import { AlchemyRoom } from './AlchemyRoom.js';
import { BubbleSortRoom } from './BubbleSortRoom.js';

const viewport = document.getElementById('game-viewport');
const game = new CentralGameManager(viewport, { score: 0, coins: 100 });

// Register all 9 modular rooms
game.addRoom(new GardenRoom());
game.addRoom(new ClimateRoom());
game.addRoom(new LabRoom());
game.addRoom(new EcologyRoom());
game.addRoom(new TraversalRoom());
game.addRoom(new StoreRoom());
game.addRoom(new AlchemyRoom());
game.addRoom(new BubbleSortRoom());

game.start();

// Navigation wires
document.getElementById('prev-btn').addEventListener('click', () => game.rooms.prevRoom());
document.getElementById('next-btn').addEventListener('click', () => game.rooms.nextRoom());

