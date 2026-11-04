/**
 * ============================================================================
 * ROOM 8: THE BUBBLE SORT BASKET (SIMPLE VISUAL SORTING ALGORITHM)
 * ============================================================================
 * Zero cross-room dependencies. Manages its own crop array, pairwise bubble 
 * comparisons, swap animations, and emits completion signals via the event bus.
 */

import { BaseRoom } from './CentralManager.js';

export class BubbleSortRoom extends BaseRoom {
    constructor() {
        const container = document.createElement('div');
        container.className = 'room bubble-sort-room w-full h-full p-6 bg-slate-50 text-slate-800 font-sans flex flex-col';
        container.innerHTML = `
            <div class="bubble-header mb-4">
                <h2 class="text-2xl font-extrabold text-emerald-800 flex items-center gap-2">
                    🧺 Room 8: The Bubble Sort Basket (Visual Pairwise Sorting)
                </h2>
                <p class="text-sm text-slate-600 mt-1">
                    A basket of mixed-up harvested crops. Hit <strong>Start Bubble Sort</strong> to watch adjacent items compare, swap, and bubble into order!
                </p>
            </div>

            <div class="bubble-workspace grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto">
                <!-- Left/Center: Visual Basket & Crops Row -->
                <div class="basket-display-panel lg:col-span-2 p-6 border-2 border-dashed border-emerald-400 rounded-2xl bg-emerald-50/60 shadow-sm flex flex-col justify-between">
                    <div class="w-full flex justify-between items-center mb-4">
                        <span id="basket-status-badge" class="text-xs font-mono bg-emerald-200 text-emerald-900 px-3 py-1 rounded-md font-bold">Basket Status: Unsorted Crops</span>
                        <span id="passes-badge" class="text-xs font-mono bg-slate-200 text-slate-800 px-3 py-1 rounded-md font-bold">Passes: 0</span>
                    </div>

                    <!-- Visual Basket Container -->
                    <div class="w-full bg-amber-900/10 border-4 border-amber-800/30 rounded-3xl p-6 my-auto flex flex-col items-center justify-center shadow-inner min-h-[200px]">
                        <div class="text-xs font-bold text-amber-900 uppercase tracking-widest mb-4">🌾 Organic Harvest Basket 🌾</div>
                        
                        <!-- Crops Grid/Row -->
                        <div id="basket-items-row" class="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
                            <!-- Rendered dynamically -->
                        </div>
                    </div>

                    <div class="text-xs text-slate-500 italic text-center mt-2">
                        💡 Watch the highlighted pair compare weights and bubble the largest crop to the right!
                    </div>
                </div>

                <!-- Right: Control & Action Console -->
                <div class="control-panel p-5 bg-slate-900 text-slate-100 rounded-2xl shadow-lg font-mono text-xs flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
                            <h3 class="text-sm font-bold tracking-wide text-emerald-400 uppercase">Bubble Sort Console</h3>
                            <span id="comparisons-badge" class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">0 Comparisons</span>
                        </div>

                        <!-- Live Execution Log -->
                        <div class="space-y-1 mb-4">
                            <div class="text-[10px] text-slate-400 uppercase">Algorithm Log Feed:</div>
                            <div id="bubble-log" class="p-3 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 text-xs min-h-[70px] flex items-center">
                                <span class="text-slate-600 italic">Ready to sort basket...</span>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-2.5">
                        <button id="start-bubble-btn" class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow transition active:scale-95 cursor-pointer flex items-center justify-center gap-2">
                            <span>▶️ Start Bubble Sort</span>
                        </button>
                        <button id="reset-basket-btn" class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs shadow transition active:scale-95 cursor-pointer">
                            🔄 Reset & Re-mix Basket
                        </button>
                    </div>
                </div>
            </div>
        `;

        super('bubble_sort_room', container);

        // --- LOCAL STATE ---
        this.crops = [];
        this.isSorting = false;
        this.comparisonCount = 0;
        this.passCount = 0;
        this.activePair = []; // Indices of currently compared crops

        this._initRandomBasket();
    }

    init(appContext) {
        super.init(appContext);
        this._cacheDOM();
        this._bindEvents();
        this._renderBasket();
    }

    _cacheDOM() {
        this.basketContainer = this.container.querySelector('#basket-items-row');
        this.statusBadge = this.container.querySelector('#basket-status-badge');
        this.passesBadge = this.container.querySelector('#passes-badge');
        this.comparisonsBadge = this.container.querySelector('#comparisons-badge');
        this.bubbleLog = this.container.querySelector('#bubble-log');
        this.startBtn = this.container.querySelector('#start-bubble-btn');
        this.resetBtn = this.container.querySelector('#reset-basket-btn');
    }

    _bindEvents() {
        this.startBtn.addEventListener('click', () => {
            if (!this.isSorting) {
                this._startBubbleSort();
            }
        });

        this.resetBtn.addEventListener('click', () => {
            if (!this.isSorting) {
                this._initRandomBasket();
                this._renderBasket();
                this.bubbleLog.innerHTML = `<span class="text-slate-600 italic">Basket re-mixed. Ready to sort.</span>`;
                this.statusBadge.textContent = "Basket Status: Unsorted Crops";
                this.statusBadge.className = "text-xs font-mono bg-emerald-200 text-emerald-900 px-3 py-1 rounded-md font-bold";
            }
        });
    }

    _initRandomBasket() {
        // 5 simple harvested crops with distinct weights for sorting
        const rawHarvest = [
            { id: 1, name: 'Pumpkin', icon: '🎃', weight: 40 },
            { id: 2, name: 'Radish', icon: '🌱', weight: 10 },
            { id: 3, name: 'Carrot', icon: '🥕', weight: 18 },
            { id: 4, name: 'Tomato', icon: '🍅', weight: 12 },
            { id: 5, name: 'Turnip', icon: '🥔', weight: 25 }
        ];
        // Shuffle randomly
        this.crops = [...rawHarvest].sort(() => Math.random() - 0.5);
        this.comparisonCount = 0;
        this.passCount = 0;
        this.activePair = [];
        if (this.comparisonsBadge) this.comparisonsBadge.textContent = '0 Comparisons';
        if (this.passesBadge) this.passesBadge.textContent = 'Passes: 0';
    }

    async _startBubbleSort() {
        this.isSorting = true;
        this.startBtn.disabled = true;
        this.resetBtn.disabled = true;
        this.startBtn.classList.add('opacity-50', 'cursor-not-allowed');

        this.statusBadge.textContent = "Basket Status: Bubbling in Progress...";
        this.statusBadge.className = "text-xs font-mono bg-amber-200 text-amber-900 px-3 py-1 rounded-md font-bold animate-pulse";

        let len = this.crops.length;
        let swapped;

        do {
            swapped = false;
            this.passCount++;
            this.passesBadge.textContent = `Passes: ${this.passCount}`;

            for (let i = 0; i < len - 1; i++) {
                this.comparisonCount++;
                this.comparisonsBadge.textContent = `${this.comparisonCount} Comparisons`;
                this.activePair = [i, i + 1];

                this.bubbleLog.innerHTML = `Comparing <span class="text-amber-300">${this.crops[i].name} (${this.crops[i].weight}g)</span> & <span class="text-amber-300">${this.crops[i+1].name} (${this.crops[i+1].weight}g)</span>`;
                this._renderBasket();

                await new Promise(r => setTimeout(r, 550)); // Visual inspection delay

                if (this.crops[i].weight > this.crops[i + 1].weight) {
                    // Swap adjacent items
                    this.bubbleLog.innerHTML = `⚠️ Out of order! Swapping <span class="text-rose-300">${this.crops[i].name}</span> and <span class="text-rose-300">${this.crops[i+1].name}</span>`;
                    
                    let temp = this.crops[i];
                    this.crops[i] = this.crops[i + 1];
                    this.crops[i + 1] = temp;
                    swapped = true;

                    this._renderBasket();
                    await new Promise(r => setTimeout(r, 450)); // Swap animation pause
                }
            }
            len--;
        } while (swapped);

        this.activePair = [];
        this.isSorting = false;
        this.startBtn.disabled = false;
        this.resetBtn.disabled = false;
        this.startBtn.classList.remove('opacity-50', 'cursor-not-allowed');

        this.statusBadge.textContent = "✨ Basket Sorted Successfully!";
        this.statusBadge.className = "text-xs font-mono bg-emerald-200 text-emerald-900 px-3 py-1 rounded-md font-bold";
        this.bubbleLog.innerHTML = `<span class="text-emerald-400 font-bold">🔔 Success Chime! All crops perfectly ordered by weight.</span>`;
        this._renderBasket();

        // --- STRICT CENTRAL INTEGRATION: Emit completion signal ---
        if (this.app && this.app.events) {
            this.app.events.emit("basket_sorted", {
                room: this.id,
                success: true,
                totalComparisons: this.comparisonCount
            });
        }
    }

    _renderBasket() {
        if (!this.basketContainer) return;
        let html = '';

        this.crops.forEach((crop, idx) => {
            const isActive = this.activePair.includes(idx);
            const cardStyle = isActive
                ? "bg-amber-500 text-white border-amber-600 shadow-xl scale-115 ring-4 ring-amber-200 animate-bounce"
                : "bg-white text-slate-800 border-emerald-200 shadow-md";

            html += `
                <div class="flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all duration-300 min-w-[85px] ${cardStyle}">
                    <span class="text-4xl mb-1">${crop.icon}</span>
                    <span class="text-xs font-bold truncate max-w-[75px]">${crop.name}</span>
                    <span class="text-[10px] font-mono mt-0.5 opacity-80">${crop.weight}g</span>
                </div>
            `;
        });

        this.basketContainer.innerHTML = html;
    }

    destroy() {
        this.crops = [];
        super.destroy();
    }
}

