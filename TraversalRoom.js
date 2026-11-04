/**
 * ============================================================================
 * ROOM 5: TREE TRAVERSAL (CRYSTAL ORCHID BINARY TREE & ALGORITHMS)
 * ============================================================================
 * Zero cross-room dependencies. Computes Pre-order, In-order, and Post-order
 * traversals internally and reports harvests via the global event bus.
 */

import { BaseRoom } from './CentralManager.js';

// --- DATA STRUCTURE: Binary Tree Node ---
class OrchidNode {
    constructor(id, label) {
        this.id = id;       // Unique ID for sequence tracking (e.g., 'A', 'B')
        this.label = label; // Display text / Petal name
        this.left = null;
        this.right = null;
    }
}

export class TraversalRoom extends BaseRoom {
    constructor() {
        const container = document.createElement('div');
        container.className = 'room traversal-room w-full h-full p-6 bg-slate-50 text-slate-800 font-sans flex flex-col';
        container.innerHTML = `
            <div class="traversal-header mb-4">
                <h2 class="text-2xl font-extrabold text-purple-800 flex items-center gap-2">
                    🔮 Room 5: Geodesic Dome (Crystal Orchid Binary Tree Traversal)
                </h2>
                <p class="text-sm text-slate-600 mt-1">
                    Follow the terminal instruction to harvest crystal nectar by clicking nodes in the exact correct traversal sequence.
                </p>
            </div>

            <div class="traversal-workspace grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto">
                <!-- Left/Center: Visual Binary Tree (Crystal Orchid Structure) -->
                <div class="tree-display-panel lg:col-span-2 p-6 border-2 border-dashed border-purple-400 rounded-2xl bg-purple-50/60 shadow-sm flex flex-col items-center justify-between">
                    <div class="w-full flex justify-between items-center mb-4">
                        <span id="dome-status-badge" class="text-xs font-mono bg-purple-200 text-purple-900 px-3 py-1 rounded-md font-bold">Dome Status: Active Bloom</span>
                        <span id="harvest-score-badge" class="text-xs font-mono bg-emerald-200 text-emerald-900 px-3 py-1 rounded-md font-bold">Nectar Harvested: 0</span>
                    </div>

                    <!-- Visual Binary Tree Pyramid Container -->
                    <div id="binary-tree-container" class="w-full flex flex-col items-center justify-center gap-6 py-4 my-auto">
                        <!-- Rendered via JS in levels -->
                    </div>

                    <div class="text-xs text-slate-500 italic text-center mt-2">
                        💡 Click the orchid nodes in the correct algorithmic order!
                    </div>
                </div>

                <!-- Right: Terminal & Challenge Instruction Panel -->
                <div class="terminal-panel p-5 bg-slate-900 text-slate-100 rounded-2xl shadow-lg font-mono text-xs flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
                            <h3 class="text-sm font-bold tracking-wide text-purple-400 uppercase">Traversal Terminal</h3>
                            <span id="timer-badge" class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Algorithm Challenge</span>
                        </div>

                        <!-- Current Instruction Box -->
                        <div class="bg-slate-800/80 p-4 rounded-xl border border-slate-700 mb-4 space-y-2">
                            <div class="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Today's Directive:</div>
                            <div id="challenge-title" class="text-sm font-bold text-purple-300">In-order Traversal</div>
                            <div id="challenge-rule" class="text-xs text-slate-300 font-sans">Rule: Left Subtree ➔ Root ➔ Right Subtree</div>
                        </div>

                        <!-- Player Input Sequence Progress -->
                        <div class="space-y-1.5 mb-4">
                            <div class="text-[10px] text-slate-400 uppercase">Your Click Sequence:</div>
                            <div id="player-sequence-display" class="p-3 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono text-sm tracking-wider min-h-[42px] flex items-center">
                                <span class="text-slate-600 italic">Waiting for first node click...</span>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <button id="reset-sequence-btn" class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs shadow transition active:scale-95 cursor-pointer">
                            🔄 Reset Sequence
                        </button>
                        <button id="new-challenge-btn" class="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow transition active:scale-95 cursor-pointer">
                            ✨ New Challenge
                        </button>
                    </div>
                </div>
            </div>
        `;

        super('traversal_room', container);

        // --- LOCAL STATE & BINARY TREE ---
        this.root = null;
        this.harvestScore = 0;
        this.currentChallenge = null; // { type, name, rule, computeFn }
        this.playerSequence = [];     // Array of clicked node IDs

        // Initialize Binary Tree and Challenge
        this._initBinaryTree();
        this._initChallenges();
    }

    init(appContext) {
        super.init(appContext);
        this._cacheDOM();
        this._bindEvents();
        this._loadRandomChallenge();
    }

    _cacheDOM() {
        this.treeContainer = this.container.querySelector('#binary-tree-container');
        this.domeStatusBadge = this.container.querySelector('#dome-status-badge');
        this.harvestScoreBadge = this.container.querySelector('#harvest-score-badge');
        this.challengeTitle = this.container.querySelector('#challenge-title');
        this.challengeRule = this.container.querySelector('#challenge-rule');
        this.playerSeqDisplay = this.container.querySelector('#player-sequence-display');
        this.resetBtn = this.container.querySelector('#reset-sequence-btn');
        this.newChallengeBtn = this.container.querySelector('#new-challenge-btn');
    }

    _bindEvents() {
        this.resetBtn.addEventListener('click', () => {
            this.playerSequence = [];
            this._updateUI();
        });

        this.newChallengeBtn.addEventListener('click', () => {
            this._loadRandomChallenge();
        });
    }

    // ==========================================
    // SELF-CONTAINED BINARY TREE GENERATION
    // ==========================================
    _initBinaryTree() {
        // Constructing a balanced 3-level binary tree (7 nodes)
        //       A (Root)
        //     /   \
        //    B     C
        //   / \   / \
        //  D   E F   G

        this.root = new OrchidNode('A', 'Orchid Core (A)');
        this.root.left = new OrchidNode('B', 'Petal B');
        this.root.right = new OrchidNode('C', 'Petal C');

        this.root.left.left = new OrchidNode('D', 'Bud D');
        this.root.left.right = new OrchidNode('E', 'Bud E');

        this.root.right.left = new OrchidNode('F', 'Bud F');
        this.root.right.right = new OrchidNode('G', 'Bud G');
    }

    // ==========================================
    // SELF-CONTAINED TRAVERSAL ALGORITHMS
    // ==========================================
    _computePreOrder(node, result = []) {
        if (!node) return result;
        result.push(node.id);               // Root
        this._computePreOrder(node.left, result);   // Left
        this._computePreOrder(node.right, result);  // Right
        return result;
    }

    _computeInOrder(node, result = []) {
        if (!node) return result;
        this._computeInOrder(node.left, result);    // Left
        result.push(node.id);               // Root
        this._computeInOrder(node.right, result);   // Right
        return result;
    }

    _computePostOrder(node, result = []) {
        if (!node) return result;
        this._computePostOrder(node.left, result);  // Left
        this._computePostOrder(node.right, result); // Right
        result.push(node.id);               // Root
        return result;
    }

    // ==========================================
    // CHALLENGE MANAGEMENT
    // ==========================================
    _initChallenges() {
        this.challenges = [
            {
                type: 'pre-order',
                title: 'Pre-Order Traversal',
                rule: 'Sequence: Root ➔ Left Subtree ➔ Right Subtree',
                getExpected: () => this._computePreOrder(this.root)
            },
            {
                type: 'in-order',
                title: 'In-Order Traversal',
                rule: 'Sequence: Left Subtree ➔ Root ➔ Right Subtree',
                getExpected: () => this._computeInOrder(this.root)
            },
            {
                type: 'post-order',
                title: 'Post-Order Traversal',
                rule: 'Sequence: Left Subtree ➔ Right Subtree ➔ Root',
                getExpected: () => this._computePostOrder(this.root)
            }
        ];
    }

    _loadRandomChallenge() {
        const randomIndex = Math.floor(Math.random() * this.challenges.length);
        this.currentChallenge = this.challenges[randomIndex];
        this.playerSequence = [];

        this.challengeTitle.textContent = this.currentChallenge.title;
        this.challengeRule.textContent = this.currentChallenge.rule;
        this._renderTree();
        this._updateUI();
    }

    // ==========================================
    // RENDERING & INTERACTION
    // ==========================================
    _renderTree() {
        // Render binary tree in a hierarchical pyramid layout across 3 levels
        this.treeContainer.innerHTML = `
            <!-- Level 0: Root -->
            <div class="flex justify-center w-full">
                ${this._renderNodeHTML(this.root)}
            </div>
            <!-- Level 1: Children -->
            <div class="flex justify-center gap-12 w-full">
                ${this._renderNodeHTML(this.root.left)}
                ${this._renderNodeHTML(this.root.right)}
            </div>
            <!-- Level 2: Grandchildren -->
            <div class="flex justify-center gap-4 sm:gap-8 w-full">
                ${this._renderNodeHTML(this.root.left.left)}
                ${this._renderNodeHTML(this.root.left.right)}
                ${this._renderNodeHTML(this.root.right.left)}
                ${this._renderNodeHTML(this.root.right.right)}
            </div>
        `;

        // Bind click events to rendered nodes
        this.treeContainer.querySelectorAll('.orchid-node-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const nodeId = btn.getAttribute('data-id');
                this._handleNodeClick(nodeId);
            });
        });
    }

    _renderNodeHTML(node) {
        const isClicked = this.playerSequence.includes(node.id);
        const clickIndex = this.playerSequence.indexOf(node.id);
        
        const baseStyle = "orchid-node-btn px-4 py-3 rounded-2xl border-2 font-bold shadow transition active:scale-95 cursor-pointer flex flex-col items-center min-w-[90px]";
        const stateStyle = isClicked 
            ? "bg-purple-600 text-white border-purple-700 shadow-inner scale-95 opacity-90" 
            : "bg-white text-purple-900 border-purple-300 hover:bg-purple-100";

        return `
            <button class="${baseStyle} ${stateStyle}" data-id="${node.id}">
                <span class="text-lg">${node.id === 'A' ? '🔮' : '🌸'}</span>
                <span class="text-xs mt-1 font-mono">${node.label}</span>
                ${isClicked ? `<span class="text-[9px] bg-purple-800 text-purple-200 px-1.5 rounded mt-0.5">#${clickIndex + 1}</span>` : ''}
            </button>
        `;
    }

    _handleNodeClick(nodeId) {
        // Prevent duplicate clicks in same sequence
        if (this.playerSequence.includes(nodeId)) return;

        this.playerSequence.push(nodeId);
        this._renderTree();
        this._updateUI();

        // Check if sequence length matches total nodes (7 nodes)
        if (this.playerSequence.length === 7) {
            this._validateSequence();
        }
    }

    _validateSequence() {
        const expected = this.currentChallenge.getExpected();
        const isCorrect = JSON.stringify(this.playerSequence) === JSON.stringify(expected);

        if (isCorrect) {
            const reward = 50;
            this.harvestScore += reward;
            this.harvestScoreBadge.textContent = `Nectar Harvested: ${this.harvestScore}`;
            
            this.domeStatusBadge.textContent = "✨ Harvest Successful! Perfect Bloom!";
            this.domeStatusBadge.className = "text-xs font-mono bg-emerald-200 text-emerald-900 px-3 py-1 rounded-md font-bold animate-bounce";

            // Broadcast success globally via event bus
            if (this.app && this.app.events) {
                this.app.events.emit('tree_harvested', {
                    room: this.id,
                    challenge: this.currentChallenge.type,
                    earnedNectar: reward,
                    totalScore: this.harvestScore
                });
            }

            // Automatically load next challenge after brief delay
            setTimeout(() => {
                this.domeStatusBadge.textContent = "Dome Status: Active Bloom";
                this.domeStatusBadge.className = "text-xs font-mono bg-purple-200 text-purple-900 px-3 py-1 rounded-md font-bold";
                this._loadRandomChallenge();
            }, 1800);
        } else {
            this.domeStatusBadge.textContent = "⚠️ Incorrect Traversal! Petals Withered.";
            this.domeStatusBadge.className = "text-xs font-mono bg-rose-200 text-rose-900 px-3 py-1 rounded-md font-bold animate-pulse";
            
            setTimeout(() => {
                this.domeStatusBadge.textContent = "Dome Status: Active Bloom";
                this.domeStatusBadge.className = "text-xs font-mono bg-purple-200 text-purple-900 px-3 py-1 rounded-md font-bold";
                this.playerSequence = [];
                this._renderTree();
                this._updateUI();
            }, 1500);
        }
    }

    _updateUI() {
        if (this.playerSequence.length === 0) {
            this.playerSeqDisplay.innerHTML = `<span class="text-slate-600 italic">Waiting for first node click...</span>`;
        } else {
            this.playerSeqDisplay.textContent = this.playerSequence.join(' ➔ ');
        }
    }

    destroy() {
        this.root = null;
        super.destroy();
    }
}

