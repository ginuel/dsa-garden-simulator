/**
 * ============================================================================
 * ROOM 6: BINARY SEARCH TREE (SEED STOREFRONT & MARKET BALANCING)
 * ============================================================================
 * Zero cross-room dependencies. Manages BST insertion, search trace paths, 
 * and automatic balancing rotations internally. Communicates via event bus.
 */

import { BaseRoom } from './CentralManager.js';

// --- DATA STRUCTURE: BST Node ---
class BSTNode {
    constructor(seedName, marketValue) {
        this.seedName = seedName;
        this.marketValue = marketValue; // BST Key for sorting
        this.left = null;
        this.right = null;
    }
}

// --- DATA STRUCTURE: Binary Search Tree ---
class SeedBST {
    constructor() {
        this.root = null;
    }

    insert(seedName, marketValue) {
        const newNode = new BSTNode(seedName, marketValue);
        if (!this.root) {
            this.root = newNode;
            return;
        }
        let current = this.root;
        while (true) {
            if (marketValue < current.marketValue) {
                if (!current.left) {
                    current.left = newNode;
                    break;
                }
                current = current.left;
            } else {
                // Allow duplicates to go right for store inventory
                if (!current.right) {
                    current.right = newNode;
                    break;
                }
                current = current.right;
            }
        }
    }

    searchWithPath(marketValue) {
        let current = this.root;
        const path = [];
        while (current) {
            path.push({ node: current, direction: marketValue === current.marketValue ? 'found' : marketValue < current.marketValue ? 'left' : 'right' });
            if (marketValue === current.marketValue) return { found: true, path };
            current = marketValue < current.marketValue ? current.left : current.right;
        }
        return { found: false, path };
    }

    // Check if tree is skewed/unbalanced (depth vs node count heuristic)
    isUnbalanced() {
        if (!this.root) return false;
        const getDepth = (node) => {
            if (!node) return 0;
            return 1 + Math.max(getDepth(node.left), getDepth(node.right));
        };
        const countNodes = (node) => {
            if (!node) return 0;
            return 1 + countNodes(node.left) + countNodes(node.right);
        };
        const depth = getDepth(this.root);
        const count = countNodes(this.root);
        // If depth is significantly greater than log2(count) + 1, it's heavily skewed
        const idealDepth = Math.floor(Math.log2(count || 1)) + 1;
        return depth > idealDepth + 2 && count > 3;
    }

    // Rebalance tree via In-Order Traversal flattening and recursive rebuilding
    balance() {
        const nodes = [];
        const inOrder = (node) => {
            if (!node) return;
            inOrder(node.left);
            nodes.push(node);
            inOrder(node.right);
        };
        inOrder(this.root);

        const buildBalanced = (arr, start, end) => {
            if (start > end) return null;
            const mid = Math.floor((start + end) / 2);
            const node = arr[mid];
            node.left = buildBalanced(arr, start, mid - 1);
            node.right = buildBalanced(arr, mid + 1, end);
            return node;
        };

        this.root = buildBalanced(nodes, 0, nodes.length - 1);
    }
}

export class StoreRoom extends BaseRoom {
    constructor() {
        const container = document.createElement('div');
        container.className = 'room store-room w-full h-full p-6 bg-slate-50 text-slate-800 font-sans flex flex-col';
        container.innerHTML = `
            <div class="store-header mb-4">
                <h2 class="text-2xl font-extrabold text-amber-800 flex items-center gap-2">
                    🏪 Room 6: Seed Storefront (Binary Search Tree & Market Balancing)
                </h2>
                <p class="text-sm text-slate-600 mt-1">
                    Store items are sorted on BST shelves by market value. Flood the market to unbalance the tree, then trigger rebalancing!
                </p>
            </div>

            <div class="store-workspace grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto">
                <!-- Left/Center: BST Visual Shelf Display -->
                <div class="shelf-display-panel lg:col-span-2 p-6 border-2 border-dashed border-amber-400 rounded-2xl bg-amber-50/60 shadow-sm flex flex-col justify-between">
                    <div class="w-full flex justify-between items-center mb-4">
                        <span id="store-status-badge" class="text-xs font-mono bg-amber-200 text-amber-900 px-3 py-1 rounded-md font-bold">Market Status: Stable & Balanced</span>
                        <span id="inventory-count-badge" class="text-xs font-mono bg-emerald-200 text-emerald-900 px-3 py-1 rounded-md font-bold">Total Seed Types: 7</span>
                    </div>

                    <!-- Visual BST Pyramid Structure -->
                    <div id="bst-tree-container" class="w-full flex flex-col items-center justify-center gap-4 py-4 my-auto overflow-auto font-mono text-xs">
                        <!-- Rendered dynamically -->
                    </div>

                    <div class="text-xs text-slate-500 italic text-center mt-2">
                        💡 Search values or flood market to observe BST structural integrity.
                    </div>
                </div>

                <!-- Right: Storefront Register & Operations Panel -->
                <div class="register-panel p-5 bg-slate-900 text-slate-100 rounded-2xl shadow-lg font-mono text-xs flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
                            <h3 class="text-sm font-bold tracking-wide text-amber-400 uppercase">BST Market Terminal</h3>
                            <span id="search-status" class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">O(log n) Lookup</span>
                        </div>

                        <!-- Search Box -->
                        <div class="space-y-2 mb-4">
                            <label class="text-[10px] text-slate-400 uppercase block">Search Seed Value:</label>
                            <div class="flex gap-2">
                                <input id="search-val-input" type="number" placeholder="Enter value..." class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500">
                                <button id="search-btn" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition cursor-pointer">Find</button>
                            </div>
                        </div>

                        <!-- Log / Trace Feed -->
                        <div class="space-y-1 mb-4">
                            <div class="text-[10px] text-slate-400 uppercase">Search Path Trace:</div>
                            <div id="search-trace-log" class="p-3 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 text-xs min-h-[50px] flex items-center">
                                <span class="text-slate-600 italic">Perform a search to trace left/right child branches...</span>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-2.5">
                        <button id="flood-market-btn" class="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5">
                            ⚡ Flood Market (Insert Sorted Data / Unbalance)
                        </button>
                        <button id="rebalance-btn" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5" disabled>
                            ⚖️ Auto-Rebalance BST Rotations
                        </button>
                    </div>
                </div>
            </div>
        `;

        super('store_room', container);

        // --- LOCAL BST STATE ---
        this.bst = new SeedBST();
        this.activeSearchPath = [];

        // Initialize standard balanced seed stock
        this._initDefaultStock();
    }

    init(appContext) {
        super.init(appContext);
        this._cacheDOM();
        this._bindEvents();
        this._renderBST();
    }

    _cacheDOM() {
        this.treeContainer = this.container.querySelector('#bst-tree-container');
        this.storeStatusBadge = this.container.querySelector('#store-status-badge');
        this.inventoryBadge = this.container.querySelector('#inventory-count-badge');
        this.searchInput = this.container.querySelector('#search-val-input');
        this.searchBtn = this.container.querySelector('#search-btn');
        this.searchLog = this.container.querySelector('#search-trace-log');
        this.floodBtn = this.container.querySelector('#flood-market-btn');
        this.rebalanceBtn = this.container.querySelector('#rebalance-btn');
    }

    _bindEvents() {
        this.searchBtn.addEventListener('click', () => {
            const val = parseInt(this.searchInput.value);
            if (!isNaN(val)) this._performSearch(val);
        });

        this.floodBtn.addEventListener('click', () => {
            this._floodMarket();
        });

        this.rebalanceBtn.addEventListener('click', () => {
            this._rebalanceTree();
        });
    }

    _initDefaultStock() {
        // Insert values to form a balanced initial tree
        // Root: 50, Left: 25, 75, etc.
        const defaultSeeds = [
            { name: 'Sunflower Seeds', val: 50 },
            { name: 'Pumpkin Seeds', val: 25 },
            { name: 'Melon Seeds', val: 75 },
            { name: 'Berry Seeds', val: 12 },
            { name: 'Carrot Seeds', val: 37 },
            { name: 'Tomato Seeds', val: 62 },
            { name: 'Orchid Seeds', val: 88 }
        ];

        this.bst = new SeedBST();
        defaultSeeds.forEach(s => this.bst.insert(s.name, s.val));
    }

    _performSearch(targetVal) {
        const result = this.bst.searchWithPath(targetVal);
        this.activeSearchPath = result.path.map(p => p.node);

        if (result.found) {
            const matched = result.path[result.path.length - 1].node;
            this.searchLog.innerHTML = `<span class="text-emerald-400 font-bold">✔ Found "${matched.seedName}" (Val: ${targetVal})! Path:</span><br>` + 
                result.path.map(p => `${p.node.marketValue} (${p.direction})`).join(' ➔ ');
        } else {
            this.searchLog.innerHTML = `<span class="text-rose-400 font-bold">✖ Value ${targetVal} not found. Path traversed:</span><br>` + 
                result.path.map(p => `${p.node.marketValue}`).join(' ➔ ');
        }
        this._renderBST();
    }

    _floodMarket() {
        // Flooding inserts sequentially ascending values (100, 110, 120...) which severely skews/unbalances the BST
        const floodValues = [95, 105, 115, 130];
        floodValues.forEach((val, idx) => {
            this.bst.insert(`Exotic Seed #${idx + 1}`, val);
        });

        this._renderBST();
        
        if (this.bst.isUnbalanced()) {
            this.storeStatusBadge.textContent = "⚠️ Market Flooded! BST Unbalanced & Skewed!";
            this.storeStatusBadge.className = "text-xs font-mono bg-rose-200 text-rose-900 px-3 py-1 rounded-md font-bold animate-pulse";
            this.rebalanceBtn.disabled = false;
            this.rebalanceBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }

        // Broadcast global event
        if (this.app && this.app.events) {
            this.app.events.emit('market:flooded', { room: this.id });
        }
    }

    _rebalanceTree() {
        this.bst.balance();
        this._renderBST();

        this.storeStatusBadge.textContent = "⚖️ BST Successfully Rebalanced via Rotations!";
        this.storeStatusBadge.className = "text-xs font-mono bg-emerald-200 text-emerald-900 px-3 py-1 rounded-md font-bold";
        this.rebalanceBtn.disabled = true;
        this.rebalanceBtn.classList.add('opacity-50', 'cursor-not-allowed');
        this.searchLog.innerHTML = `<span class="text-emerald-400">⚖️ Tree rotation complete. O(log n) search efficiency restored!</span>`;

        if (this.app && this.app.events) {
            this.app.events.emit('market:rebalanced', { room: this.id });
        }
    }

    _renderBST() {
        // Render tree levels hierarchically using a level-order traversal queue
        if (!this.bst.root) {
            this.treeContainer.innerHTML = `<p class="text-slate-400 italic">Shelf is empty.</p>`;
            return;
        }

        const levels = [];
        const queue = [{ node: this.bst.root, depth: 0 }];

        while (queue.length > 0) {
            const { node, depth } = queue.shift();
            if (!levels[depth]) levels[depth] = [];
            levels[depth].push(node);

            if (node) {
                queue.push({ node: node.left, depth: depth + 1 });
                queue.push({ node: node.right, depth: depth + 1 });
            }
        }

        // Trim trailing empty levels if necessary
        while (levels.length > 0 && levels[levels.length - 1].every(n => n === null)) {
            levels.pop();
        }

        let html = '';
        levels.forEach((levelNodes, depth) => {
            html += `<div class="flex justify-center gap-4 sm:gap-6 w-full my-1">`;
            levelNodes.forEach(node => {
                if (!node) {
                    html += `<div class="w-20 opacity-20 text-center font-mono text-[10px]">-</div>`;
                } else {
                    const isHighlighted = this.activeSearchPath.some(n => n === node);
                    const cardStyle = isHighlighted
                        ? "bg-amber-600 text-white border-amber-700 shadow-lg scale-105 ring-2 ring-amber-300"
                        : "bg-white text-slate-800 border-amber-200 hover:bg-amber-50 shadow-sm";

                    html += `
                        <div class="px-3 py-2 rounded-xl border-2 font-mono text-center transition min-w-[90px] ${cardStyle}">
                            <div class="font-bold text-amber-900 truncate max-w-[100px]" title="${node.seedName}">${node.seedName}</div>
                            <div class="text-[10px] text-amber-600 font-bold mt-0.5">Val: $${node.marketValue}</div>
                        </div>
                    `;
                }
            });
            html += `</div>`;
        });

        this.treeContainer.innerHTML = html;
    }

    destroy() {
        this.bst = null;
        super.destroy();
    }
}

