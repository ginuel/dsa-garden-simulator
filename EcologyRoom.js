/**
 * ============================================================================
 * ROOM 4: LINKED LIST & HIERARCHICAL TREE (ECOLOGY & PRUNING SIMULATOR)
 * Updated with horizontal scrollability and click-to-reveal action buttons.
 * ============================================================================
 */

import { BaseRoom } from './CentralManager.js';

// --- DATA STRUCTURE: Doubly Linked List Node (Invasive Vines) ---
class VineNode {
    constructor(id, name, strain) {
        this.id = id;
        this.name = name;
        this.strain = strain;
        this.prev = null;
        this.next = null;
    }
}

// --- DATA STRUCTURE: Hierarchical Tree Node (Mother Tree Branches) ---
class TreeNode {
    constructor(id, name, type) {
        this.id = id;
        this.name = name;
        this.type = type; // 'root', 'branch', 'leaf'
        this.parent = null;
        this.children = [];
    }
}

export class EcologyRoom extends BaseRoom {
    constructor() {
        const container = document.createElement('div');
        container.className = 'room ecology-room w-full h-full p-6 bg-slate-50 text-slate-800 font-sans flex flex-col';
        container.innerHTML = `
            <div class="ecology-header mb-4">
                <h2 class="text-2xl font-extrabold text-teal-800 flex items-center gap-2">
                    🌳 Room 4: Ecology Simulator (Doubly Linked List & Hierarchical Tree)
                </h2>
                <p class="text-sm text-slate-600 mt-1">
                    Manage vine pointer chains and hierarchical trees. <strong>Click</strong> any node to reveal <strong>Sprout</strong> and <strong>Prune</strong> action buttons!
                </p>
            </div>

            <div class="ecology-workspace grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-y-auto">
                <!-- Left Panel: Doubly Linked List (Invasive Vines) -->
                <div class="vine-panel p-5 border-2 border-dashed border-teal-400 rounded-2xl bg-teal-50/60 shadow-sm flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-center mb-3">
                            <h3 class="text-sm font-bold text-teal-900 uppercase tracking-wide">Invasive Vine Chain</h3>
                            <span id="vine-count-badge" class="text-xs font-mono bg-teal-200 text-teal-900 px-2 py-0.5 rounded">Nodes: 4</span>
                        </div>
                        <p class="text-xs text-slate-600 mb-4">
                            Doubly linked list pointer chain. Pruning a middle node bridges <code class="bg-teal-100 px-1 rounded">prev</code> and <code class="bg-teal-100 px-1 rounded">next</code>.
                        </p>

                        <div id="vine-list-container" class="space-y-2 mb-4 max-h-[220px] overflow-y-auto pr-1">
                            <!-- Injected via JS -->
                        </div>
                    </div>

                    <div class="space-y-2 pt-2 border-t border-teal-200">
                        <button id="add-vine-btn" class="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow transition active:scale-95 cursor-pointer">
                            ➕ Append New Vine Node
                        </button>
                    </div>
                </div>

                <!-- Right Panel: Hierarchical Tree (Mother Tree Canopy) -->
                <div class="tree-panel p-5 border-2 border-dashed border-emerald-400 rounded-2xl bg-emerald-50/60 shadow-sm flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-center mb-3">
                            <h3 class="text-sm font-bold text-emerald-900 uppercase tracking-wide">Mother Tree Canopy (Hierarchical Tree)</h3>
                            <span id="tree-status-badge" class="text-xs font-mono bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">Status: Stable</span>
                        </div>
                        <p class="text-xs text-slate-600 mb-4">
                            Computer-science tree layout. Scroll horizontally to view deep child names. Click node for options.
                        </p>

                        <!-- Visual Tree Hierarchy Container (Horizontally Scrollable) -->
                        <div id="tree-hierarchy-container" class="p-4 bg-white border border-emerald-200 rounded-xl shadow-inner max-h-[240px] overflow-auto font-mono text-xs space-y-1">
                            <!-- Injected via JS -->
                        </div>
                    </div>

                    <div class="text-[11px] text-slate-500 text-center italic mt-2">
                        💡 Tip: Click any node to show Sprout & Prune options below it!
                    </div>
                </div>
            </div>
        `;

        super('ecology_room', container);

        this.vineHead = null;
        this.vineTail = null;
        this.vineCount = 0;
        this.treeRoot = null;
        this.activeSelectedNodeId = null; // Track which node has action buttons open

        this._initDoublyLinkedList();
        this._initHierarchicalTree();
    }

    init(appContext) {
        super.init(appContext);
        this._cacheDOM();
        this._bindEvents();
        this._renderVines();
        this._renderTree();
    }

    _cacheDOM() {
        this.vineContainer = this.container.querySelector('#vine-list-container');
        this.vineCountBadge = this.container.querySelector('#vine-count-badge');
        this.addVineBtn = this.container.querySelector('#add-vine-btn');

        this.treeContainer = this.container.querySelector('#tree-hierarchy-container');
        this.treeStatusBadge = this.container.querySelector('#tree-status-badge');
    }

    _bindEvents() {
        this.addVineBtn.addEventListener('click', () => this._appendVineNode());

        // Close selected node popup when clicking outside tree container
        this.container.addEventListener('click', (e) => {
            if (!e.target.closest('.tree-node-wrapper')) {
                if (this.activeSelectedNodeId !== null) {
                    this.activeSelectedNodeId = null;
                    this._renderTree();
                }
            }
        });
    }

    // ==========================================
    // LINKED LIST LOGIC
    // ==========================================
    _initDoublyLinkedList() {
        const node1 = new VineNode('v1', 'Kudzu Alpha', 'Alpha');
        const node2 = new VineNode('v2', 'Bramble Beta', 'Beta');
        const node3 = new VineNode('v3', 'Thorn Gamma', 'Gamma');

        this.vineHead = node1;
        node1.next = node2;
        node2.prev = node1;
        node2.next = node3;
        node3.prev = node2;
        this.vineTail = node3;
        this.vineCount = 3;
    }

    _appendVineNode() {
        const id = 'v_' + Math.random().toString(36).substring(2, 6);
        const newNode = new VineNode(id, `Vine Node (${id})`, 'Delta');

        if (!this.vineHead) {
            this.vineHead = newNode;
            this.vineTail = newNode;
        } else {
            this.vineTail.next = newNode;
            newNode.prev = this.vineTail;
            this.vineTail = newNode;
        }
        this.vineCount++;

        this._renderVines();
        this._emitGlobalEvent('ecology:vine_appended', { nodeId: id, totalVines: this.vineCount });
    }

    _pruneVineNode(nodeId) {
        let curr = this.vineHead;
        while (curr && curr.id !== nodeId) curr = curr.next;
        if (!curr) return;

        if (curr.prev) curr.prev.next = curr.next;
        else this.vineHead = curr.next;

        if (curr.next) curr.next.prev = curr.prev;
        else this.vineTail = curr.prev;

        this.vineCount--;
        this._renderVines();
        this._emitGlobalEvent('ecology:vine_pruned', { prunedId: nodeId, remaining: this.vineCount });
    }

    _renderVines() {
        this.vineCountBadge.textContent = `Nodes: ${this.vineCount}`;
        if (this.vineCount === 0) {
            this.vineContainer.innerHTML = `<p class="text-xs text-slate-500 italic p-3 text-center bg-white rounded-xl">Vine chain is cleared!</p>`;
            return;
        }

        let html = '';
        let curr = this.vineHead;
        let index = 0;

        while (curr) {
            const prevId = curr.prev ? curr.prev.id : 'null (HEAD)';
            const nextId = curr.next ? curr.next.id : 'null (TAIL)';

            html += `
                <div class="p-3 bg-white border border-teal-200 rounded-xl shadow-sm text-xs flex justify-between items-center">
                    <div>
                        <div class="font-bold text-teal-900">${curr.name} <span class="text-[10px] text-slate-400 font-mono">[Node #${index}]</span></div>
                        <div class="text-[10px] text-slate-500 font-mono mt-0.5">
                            prev: <span class="text-teal-700">${prevId}</span> ➔ next: <span class="text-teal-700">${nextId}</span>
                        </div>
                    </div>
                    <button class="prune-vine-btn px-2.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-[10px] shadow transition active:scale-95 cursor-pointer" data-id="${curr.id}">
                        ✂️ Prune
                    </button>
                </div>
            `;
            curr = curr.next;
            index++;
        }

        this.vineContainer.innerHTML = html;
        this.vineContainer.querySelectorAll('.prune-vine-btn').forEach(btn => {
            btn.addEventListener('click', () => this._pruneVineNode(btn.getAttribute('data-id')));
        });
    }

    // ==========================================
    // HIERARCHICAL TREE LOGIC
    // ==========================================
    _initHierarchicalTree() {
        this.treeRoot = new TreeNode('root_0', 'Mother Oak', 'root');
        
        const branch1 = new TreeNode('b_1', 'Canopy East', 'branch');
        const branch2 = new TreeNode('b_2', 'Canopy West', 'branch');
        
        this.treeRoot.children.push(branch1, branch2);
        branch1.parent = this.treeRoot;
        branch2.parent = this.treeRoot;

        const leaf1 = new TreeNode('l_1', 'Sun Leaf Alpha', 'leaf');
        const leaf2 = new TreeNode('l_2', 'Sun Leaf Beta', 'leaf');
        branch1.children.push(leaf1, leaf2);
        leaf1.parent = branch1;
        leaf2.parent = branch1;
    }

    _sproutTreeChild(targetParentId) {
        const findAndSprout = (node) => {
            if (node.id === targetParentId) {
                const id = 'n_' + Math.random().toString(36).substring(2, 6);
                const isLeafTarget = node.type === 'leaf';
                const newNode = new TreeNode(id, isLeafTarget ? `Leaf Sprout (${id.substring(0,4)})` : `Branch Sprout (${id.substring(0,4)})`, isLeafTarget ? 'leaf' : 'branch');
                
                node.children.push(newNode);
                newNode.parent = node;
                return true;
            }
            for (const child of node.children) {
                if (findAndSprout(child)) return true;
            }
            return false;
        };

        findAndSprout(this.treeRoot);
        this.activeSelectedNodeId = null; // Close menu after action
        this._renderTree();
        this._emitGlobalEvent('ecology:branch_sprouted', { parentId: targetParentId });
    }

    _pruneTreeNode(nodeId) {
        if (this.treeRoot.id === nodeId) {
            this._flashTreeStatus("⚠️ Cannot delete Mother Root!");
            return;
        }

        const removeRecursive = (parent, id) => {
            const idx = parent.children.findIndex(c => c.id === id);
            if (idx !== -1) {
                parent.children.splice(idx, 1);
                return true;
            }
            for (const child of parent.children) {
                if (removeRecursive(child, id)) return true;
            }
            return false;
        };

        removeRecursive(this.treeRoot, nodeId);
        this.activeSelectedNodeId = null; // Close menu after action
        this._renderTree();
        this._emitGlobalEvent('ecology:branch_pruned', { prunedId: nodeId });
    }

    /**
     * Renders tree with horizontal scrollability and click-to-reveal Action Buttons (Sprout & Prune)
     */
    _renderTree() {
        this.treeContainer.innerHTML = '';

        const traverse = (node, depth = 0, isLast = true) => {
            const indentPixels = depth * 28; 
            const connector = depth === 0 ? '' : (isLast ? '└── ' : '├── ');
            const isSelected = this.activeSelectedNodeId === node.id;
            
            // Outer wrapper container for node + dropdown action buttons
            const wrapperEl = document.createElement('div');
            wrapperEl.className = 'tree-node-wrapper my-1 inline-block w-full min-w-max';
            
            // Node main pill
            const nodeEl = document.createElement('div');
            nodeEl.className = `flex items-center py-2 px-3 bg-white hover:bg-emerald-50 border ${isSelected ? 'border-emerald-500 shadow-md ring-2 ring-emerald-200' : 'border-emerald-100'} rounded-xl transition cursor-pointer select-none group shadow-sm`;
            nodeEl.style.marginLeft = `${indentPixels}px`;
            
            nodeEl.innerHTML = `
                <div class="flex items-center gap-1.5 pointer-events-none">
                    <span class="text-emerald-600 font-mono font-bold">${connector}</span>
                    <span class="font-semibold text-slate-800 group-hover:text-emerald-900">${node.name}</span>
                    <span class="text-[10px] text-slate-400 font-mono ml-2">(${node.children.length} children)</span>
                </div>
            `;

            // Click node to toggle action menu
            nodeEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.activeSelectedNodeId = isSelected ? null : node.id;
                this._renderTree();
            });

            wrapperEl.appendChild(nodeEl);

            // If selected, render Sprout and Prune buttons directly below the node
            if (isSelected) {
                const actionsEl = document.createElement('div');
                actionsEl.className = 'flex items-center gap-2 py-1.5 px-3 bg-emerald-50/90 border border-emerald-300 rounded-xl shadow-md my-1 z-10';
                // Indented to match node alignment
                actionsEl.style.marginLeft = `${indentPixels + 20}px`;
                
                actionsEl.innerHTML = `
                    <span class="text-[10px] font-bold text-emerald-800 mr-1">Action:</span>
                    <button class="sprout-btn px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] shadow transition active:scale-95 cursor-pointer flex items-center gap-1">
                        🌱 Sprout Child
                    </button>
                    ${node.type !== 'root' ? `
                        <button class="prune-btn px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-[10px] shadow transition active:scale-95 cursor-pointer flex items-center gap-1">
                            ✂️ Prune Node
                        </button>
                    ` : ''}
                `;

                actionsEl.querySelector('.sprout-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this._sproutTreeChild(node.id);
                });

                if (node.type !== 'root') {
                    actionsEl.querySelector('.prune-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        this._pruneTreeNode(node.id);
                    });
                }

                wrapperEl.appendChild(actionsEl);
            }

            this.treeContainer.appendChild(wrapperEl);

            // Recursively render children
            node.children.forEach((child, index) => {
                traverse(child, depth + 1, index === node.children.length - 1);
            });
        };

        traverse(this.treeRoot, 0, true);
    }

    _flashTreeStatus(msg) {
        const original = this.treeStatusBadge.textContent;
        this.treeStatusBadge.textContent = msg;
        this.treeStatusBadge.className = 'text-xs font-mono bg-rose-200 text-rose-900 px-2 py-0.5 rounded font-bold animate-pulse';
        setTimeout(() => {
            this.treeStatusBadge.textContent = original;
            this.treeStatusBadge.className = 'text-xs font-mono bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded';
        }, 1500);
    }

    _emitGlobalEvent(eventName, payload) {
        if (this.app && this.app.events) {
            this.app.events.emit(eventName, { room: this.id, ...payload });
        }
    }

    destroy() {
        this.vineHead = null;
        this.vineTail = null;
        this.treeRoot = null;
        super.destroy();
    }
}

