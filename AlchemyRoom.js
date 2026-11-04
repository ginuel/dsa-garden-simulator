/**
 * ============================================================================
 * ROOM 7: ALCHEMY HOPPER (HASH TABLE MODULE)
 * ============================================================================
 * Zero cross-room dependencies. Manages its own hash table bucket array, 
 * hash code collisions via chaining, load factor calculations, and emits 
 * mutation signals via the central event bus.
 */

import { BaseRoom } from './CentralManager.js';

export class AlchemyRoom extends BaseRoom {
    constructor() {
        const container = document.createElement('div');
        container.className = 'room alchemy-room w-full h-full p-6 bg-slate-50 text-slate-800 font-sans flex flex-col';
        container.innerHTML = `
            <div class="alchemy-header mb-4">
                <h2 class="text-2xl font-extrabold text-amber-800 flex items-center gap-2">
                    ⚗️ Room 7: Alchemical Hopper (Hash Table & Collision Chaining)
                </h2>
                <p class="text-sm text-slate-600 mt-1">
                    Toss organic items into the hopper. The hash function maps them to memory bins; colliding items chain together in bucket lists!
                </p>
            </div>

            <div class="alchemy-workspace grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto">
                <!-- Left: Hopper Control Panel & Item Tossing -->
                <div class="hopper-panel p-6 border-2 border-dashed border-amber-400 rounded-2xl bg-amber-50/60 shadow-sm flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-center mb-4">
                            <span id="load-factor-badge" class="text-xs font-mono bg-amber-200 text-amber-900 px-3 py-1 rounded-md font-bold">Load Factor: 0.00 / 0.75</span>
                            <span id="capacity-badge" class="text-xs font-mono bg-slate-200 text-slate-800 px-3 py-1 rounded-md font-bold">Capacity: 4 Bins</span>
                        </div>

                        <h3 class="text-sm font-bold text-amber-900 uppercase tracking-wide mb-3">Toss Organic Item</h3>
                        <div class="grid grid-cols-2 gap-2 mb-4">
                            <button class="toss-btn px-3 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs cursor-pointer transition active:scale-95 flex items-center justify-center gap-1.5" data-item="Apple" data-icon="🍎">🍎 Apple</button>
                            <button class="toss-btn px-3 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs cursor-pointer transition active:scale-95 flex items-center justify-center gap-1.5" data-item="Leaf" data-icon="🍃">🍃 Leaf</button>
                            <button class="toss-btn px-3 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs cursor-pointer transition active:scale-95 flex items-center justify-center gap-1.5" data-item="Bone" data-icon="🦴">🦴 Bone</button>
                            <button class="toss-btn px-3 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs cursor-pointer transition active:scale-95 flex items-center justify-center gap-1.5" data-item="Root" data-icon="🪵">🪵 Root</button>
                            <button class="toss-btn px-3 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs cursor-pointer transition active:scale-95 flex items-center justify-center gap-1.5" data-item="Mushroom" data-icon="🍄">🍄 Mushroom</button>
                            <button class="toss-btn px-3 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs cursor-pointer transition active:scale-95 flex items-center justify-center gap-1.5" data-item="Berry" data-icon="🫐">🫐 Berry</button>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <button id="clear-hopper-btn" class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs shadow transition active:scale-95 cursor-pointer">
                            🗑️ Clear Hash Buckets
                        </button>
                    </div>
                </div>

                <!-- Right: Hash Table Memory Buckets Display -->
                <div class="table-display-panel lg:col-span-2 p-6 bg-slate-900 text-slate-100 rounded-2xl shadow-lg font-mono text-xs flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
                            <h3 class="text-sm font-bold tracking-wide text-amber-400 uppercase">Hash Table Memory Buckets</h3>
                            <span id="alchemy-status" class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Ready</span>
                        </div>

                        <!-- Buckets Visual List -->
                        <div id="buckets-container" class="space-y-2.5 mb-4 max-h-[280px] overflow-y-auto pr-1">
                            <!-- Rendered dynamically -->
                        </div>
                    </div>

                    <!-- Live Log Feed -->
                    <div class="space-y-1">
                        <div class="text-[10px] text-slate-400 uppercase">Alchemical Log Feed:</div>
                        <div id="alchemy-log" class="p-3 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 text-xs min-h-[50px] flex items-center">
                            <span class="text-slate-600 italic">Toss an item to generate hash index...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        super('alchemy_room', container);

        // --- LOCAL STATE ---
        this.capacity = 4; // Initial number of buckets
        this.size = 0;     // Total items stored
        this.buckets = new Array(this.capacity).fill(null).map(() => []);
    }

    init(appContext) {
        super.init(appContext);
        this._cacheDOM();
        this._bindEvents();
        this._render();
    }

    _cacheDOM() {
        this.bucketsContainer = this.container.querySelector('#buckets-container');
        this.loadFactorBadge = this.container.querySelector('#load-factor-badge');
        this.capacityBadge = this.container.querySelector('#capacity-badge');
        this.alchemyStatus = this.container.querySelector('#alchemy-status');
        this.alchemyLog = this.container.querySelector('#alchemy-log');
        this.clearBtn = this.container.querySelector('#clear-hopper-btn');
    }

    _bindEvents() {
        this.container.querySelectorAll('.toss-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemName = btn.getAttribute('data-item');
                const itemIcon = btn.getAttribute('data-icon');
                this._tossItem(itemName, itemIcon);
            });
        });

        this.clearBtn.addEventListener('click', () => {
            this._clearBuckets();
        });
    }

    _hashFunction(key) {
        // Simple hash calculation based on string length sum modulo capacity
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            hash += key.charCodeAt(i);
        }
        return hash % this.capacity;
    }

    _tossItem(name, icon) {
        const bucketIndex = this._hashFunction(name);
        const targetBucket = this.buckets[bucketIndex];

        // Check if collision occurs
        const isCollision = targetBucket.length > 0;

        targetBucket.push({ name, icon, key: `${name}-${Date.now()}` });
        this.size++;

        // Update UI logs & states
        if (isCollision) {
            this.alchemyLog.innerHTML = `⚠️ <span class="text-rose-400 font-bold">Collision!</span> '${icon} ${name}' hashed to Bin #${bucketIndex} (chained).`;
            this.alchemyStatus.textContent = "Collision Chaining";
            this.alchemyStatus.className = "text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800";
        } else {
            this.alchemyLog.innerHTML = `✨ Hashed '${icon} ${name}' directly to <span class="text-amber-300 font-bold">Bin #${bucketIndex}</span> (O(1)).`;
            this.alchemyStatus.textContent = "Optimal Lookup";
            this.alchemyStatus.className = "text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800";
        }

        // Check load factor (size / capacity)
        const loadFactor = this.size / this.capacity;
        if (loadFactor > 0.75) {
            this._rehashTable();
        }

        this._render();

        // Emit central event
        if (this.app && this.app.events) {
            this.app.events.emit('item_hashed', {
                room: this.id,
                item: name,
                bucket: bucketIndex,
                collision: isCollision
            });
        }
    }

    _rehashTable() {
        this.capacity *= 2; // Double capacity
        const oldBuckets = this.buckets;
        this.buckets = new Array(this.capacity).fill(null).map(() => []);
        this.size = 0;

        oldBuckets.forEach(bucket => {
            bucket.forEach(item => {
                const newIndex = this._hashFunction(item.name);
                this.buckets[newIndex].push(item);
                this.size++;
            });
        });

        this.alchemyLog.innerHTML = `⚡ Load factor exceeded 0.75! <span class="text-cyan-300 font-bold">Rehashed table to capacity ${this.capacity}.</span>`;
    }

    _clearBuckets() {
        this.capacity = 4;
        this.size = 0;
        this.buckets = new Array(this.capacity).fill(null).map(() => []);
        this._render();
        this.alchemyLog.innerHTML = `<span class="text-slate-600 italic">Buckets cleared. Ready for new input...</span>`;
        this.alchemyStatus.textContent = "Ready";
        this.alchemyStatus.className = "text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded";
    }

    _render() {
        if (!this.bucketsContainer) return;

        const loadFactor = (this.size / this.capacity).toFixed(2);
        this.loadFactorBadge.textContent = `Load Factor: ${loadFactor} / 0.75`;
        this.capacityBadge.textContent = `Capacity: ${this.capacity} Bins`;

        let html = '';
        this.buckets.forEach((bucket, idx) => {
            html += `
                <div class="p-3 border border-slate-700 bg-slate-800/90 rounded-xl flex items-center justify-between gap-3 shadow-sm">
                    <div class="flex items-center gap-2 min-w-[90px]">
                        <span class="text-amber-400 font-bold">Bin #${idx}:</span>
                    </div>
                    <div class="flex items-center gap-2 flex-wrap flex-1">
            `;

            if (bucket.length === 0) {
                html += `<span class="text-slate-500 italic text-[11px]">empty (null)</span>`;
            } else {
                bucket.forEach((item, bIdx) => {
                    html += `
                        <div class="flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs shadow">
                            <span>${item.icon}</span>
                            <span class="text-amber-200 font-semibold">${item.name}</span>
                        </div>
                    `;
                    if (bIdx < bucket.length - 1) {
                        html += `<span class="text-amber-500 font-bold text-[10px]">➔</span>`;
                    }
                });
            }

            html += `
                    </div>
                </div>
            `;
        });

        this.bucketsContainer.innerHTML = html;
    }

    destroy() {
        this.buckets = [];
        super.destroy();
    }
}

