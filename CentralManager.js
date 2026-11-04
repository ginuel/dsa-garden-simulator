/**
 * ============================================================================
 * CENTRAL MANAGER & ROOM ARCHITECTURE (ROBUST SCROLL & HEIGHT FIX)
 * ============================================================================
 */

export class BaseRoom {
    constructor(id, container) {
        this.id = id;
        this.container = container;
        this.app = null;
        
        // --- ROBUST ROOM CONTAINER FIX ---
        // Using 'h-auto min-h-full' instead of rigid 'h-full' lets the room 
        // expand naturally based on its contents, preventing lower items/stacks from getting trapped.
        if (this.container) {
            this.container.className = 'room w-full h-auto min-h-full flex flex-col box-border p-6';
        }
    }

    init(appContext) {
        this.app = appContext;
    }

    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

export class EventManager {
    constructor() {
        this.listeners = {};
    }

    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => callback(data));
    }
}

export class RoomManager {
    constructor(viewportElement) {
        this.viewport = viewportElement;
        this.rooms = [];
        this.currentIndex = 0;

        // --- VIEWPORT SCROLL CONTAINER FIX ---
        // Ensures the viewport acts as the primary scroll container for all modules.
        if (this.viewport) {
            this.viewport.className = 'w-full h-screen min-h-screen overflow-y-auto relative flex flex-col';
        }
    }

    addRoom(roomInstance) {
        this.rooms.push(roomInstance);
    }

    showRoom(index) {
        if (this.rooms.length === 0) return;

        // Handle bounds wrap-around
        if (index < 0) {
            this.currentIndex = this.rooms.length - 1;
        } else if (index >= this.rooms.length) {
            this.currentIndex = 0;
        } else {
            this.currentIndex = index;
        }

        // Clear viewport and mount new room safely
        this.viewport.innerHTML = '';
        const currentRoom = this.rooms[this.currentIndex];
        this.viewport.appendChild(currentRoom.container);

        // Instantly reset scroll position to the very top when switching rooms
        this.viewport.scrollTop = 0;

        if (currentRoom.init) {
            currentRoom.init(this.appContext);
        }
    }

    nextRoom() {
        this.showRoom(this.currentIndex + 1);
    }

    prevRoom() {
        this.showRoom(this.currentIndex - 1);
    }
}

export class CentralGameManager {
    constructor(viewportElement, initialState = {}) {
        this.viewport = viewportElement;
        this.state = initialState;
        this.events = new EventManager();
        this.rooms = new RoomManager(viewportElement);
        
        // Pass context reference to room manager
        this.rooms.appContext = this;
    }

    addRoom(roomInstance) {
        this.rooms.addRoom(roomInstance);
    }

    start() {
        if (this.rooms.rooms.length > 0) {
            this.rooms.showRoom(0);
        }
    }
}

