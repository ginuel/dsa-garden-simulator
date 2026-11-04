/**
 * ============================================================================
 * ROOM 1: GARDEN PLOT SIMULATOR (STACK-BASED UNDO)
 * ============================================================================
 */

import { BaseRoom } from './CentralManager.js';

export class GardenRoom extends BaseRoom {
    constructor() {
        const container = document.createElement('div');
        container.className = 'room garden-room w-full h-auto min-h-full p-6 bg-slate-50 text-slate-800 font-sans flex flex-col justify-start gap-6 pb-12';
        container.innerHTML = `
            <!-- Room Header -->
            <div class="garden-header shrink-0">
                <h2 class="text-2xl font-extrabold text-emerald-800 flex items-center gap-2">
                    🌿 Room 1: Garden Plot Simulator (Stack-based Undo)
                </h2>
                <p class="text-sm text-slate-600 mt-1">
                    Perform actions on the test plot. Each action is pushed onto a local LIFO Stack.
                </p>
            </div>

            <!-- Plot Interaction Area -->
            <div class="plot-panel p-6 border-2 border-dashed border-emerald-400 rounded-2xl bg-emerald-50/50 shadow-sm flex flex-col items-center justify-center gap-4 min-h-[260px]">
                <div class="text-xs font-bold text-emerald-900 uppercase tracking-wider">Test Plot State</div>
                <div id="plot-visual" class="w-24 h-24 rounded-2xl bg-amber-800 shadow-inner flex items-center justify-center text-3xl transition-all duration-300">
                    🟫
                </div>
                <div id="plot-status" class="text-sm font-semibold text-slate-700">Status: Empty Plot (Dirt)</div>

                <!-- Action Controls -->
                <div class="flex flex-wrap justify-center gap-2.5 mt-2">
                    <button id="btn-till" class="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer active:scale-95">🚜 Till Soil</button>
                    <button id="btn-plant" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer active:scale-95">🌱 Plant Seed</button>
                    <button id="btn-water" class="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer active:scale-95">💧 Water</button>
                    <button id="btn-prune" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer active:scale-95">✂️ Prune</button>
                </div>

                <button id="btn-undo" class="px-6 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer active:scale-95 mt-1 flex items-center gap-2">
                    ⮌ Regret / Undo Action
                </button>
            </div>

            <!-- Action Stack Container (Bottom Drawer) -->
            <div class="stack-panel p-5 bg-slate-900 text-slate-100 rounded-2xl shadow-lg font-mono text-xs flex flex-col justify-between shrink-0">
                <div class="flex justify-between items-center border-b border-slate-700 pb-3 mb-3">
                    <span class="text-xs font-bold text-emerald-400 uppercase tracking-wide">LIFO Action Stack</span>
                    <span id="stack-depth" class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Depth: 0</span>
                </div>
                <div id="stack-list" class="flex flex-col-reverse gap-2 max-h-[160px] overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <div class="text-slate-600 italic text-center py-2 text-xs">Stack is empty...</div>
                </div>
            </div>
        `;

        super('garden_room', container);
        this.actionStack = [];
    }

    init(appContext) {
        super.init(appContext);
        this._cacheDOM();
        this._bindEvents();
    }

    _cacheDOM() {
        this.visual = this.container.querySelector('#plot-visual');
        this.status = this.container.querySelector('#plot-status');
        this.stackList = this.container.querySelector('#stack-list');
        this.stackDepth = this.container.querySelector('#stack-depth');
        this.btnTill = this.container.querySelector('#btn-till');
        this.btnPlant = this.container.querySelector('#btn-plant');
        this.btnWater = this.container.querySelector('#btn-water');
        this.btnPrune = this.container.querySelector('#btn-prune');
        this.btnUndo = this.container.querySelector('#btn-undo');
    }

    _bindEvents() {
        this.btnTill.addEventListener('click', () => this._pushAction('Tilled', '🚜', 'bg-amber-800'));
        this.btnPlant.addEventListener('click', () => this._pushAction('Planted', '🌱', 'bg-emerald-700'));
        this.btnWater.addEventListener('click', () => this._pushAction('Watered', '💧', 'bg-sky-600'));
        this.btnPrune.addEventListener('click', () => this._pushAction('Pruned', '✂️', 'bg-rose-700'));
        this.btnUndo.addEventListener('click', () => this._popAction());
    }

    _pushAction(name, icon, bgClass) {
        this.actionStack.push({ name, icon, bgClass });
        this._updateUI();
    }

    _popAction() {
        if (this.actionStack.length > 0) {
            this.actionStack.pop();
            this._updateUI();
        }
    }

    _updateUI() {
        this.stackDepth.textContent = `Depth: ${this.actionStack.length}`;
        if (this.actionStack.length === 0) {
            this.visual.textContent = '🟫';
            this.visual.className = 'w-24 h-24 rounded-2xl bg-amber-800 shadow-inner flex items-center justify-center text-3xl transition-all duration-300';
            this.status.textContent = 'Status: Empty Plot (Dirt)';
            this.stackList.innerHTML = `<div class="text-slate-600 italic text-center py-2 text-xs">Stack is empty...</div>`;
            return;
        }

        const current = this.actionStack[this.actionStack.length - 1];
        this.visual.textContent = current.icon;
        this.visual.className = `w-24 h-24 rounded-2xl ${current.bgClass} shadow-inner flex items-center justify-center text-3xl transition-all duration-300`;
        this.status.textContent = `Status: ${current.name}`;

        this.stackList.innerHTML = this.actionStack.map((act, i) => `
            <div class="flex justify-between items-center bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-300 text-xs">
                <span>[${i + 1}] ${act.icon}${act.name}</span>
                <span class="text-[10px] text-slate-500 font-mono">TOP</span>
            </div>
        `).join('');
    }
}

