/**
 * ============================================================================
 * ROOM 3: THE HYBRID LAB (EXPERIMENTAL BOTANY & GENETICS)
 * ============================================================================
 * Zero cross-room dependencies. Manages hybrid cross-breeding, gene sequence 
 * comparisons, and emits completion signals via Central EventManager.
 */

import { BaseRoom } from './CentralManager.js';

export class LabRoom extends BaseRoom {
    constructor() {
        const container = document.createElement('div');
        // h-auto min-h-full allows natural height expansion and scrolling
        container.className = 'room lab-room w-full h-auto min-h-full p-6 bg-slate-50 text-slate-800 font-sans flex flex-col box-border';
        container.innerHTML = `
            <div class="lab-header mb-4 shrink-0">
                <h2 class="text-2xl font-extrabold text-indigo-900 flex items-center gap-2">
                    🔬 Room 3: The Hybrid Botany Lab
                </h2>
                <p class="text-sm text-slate-600 mt-1">
                    Splice plant genes and run hybrid experiments to produce resilient high-yield strains!
                </p>
            </div>

            <div class="lab-workspace grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12 flex-1">
                <!-- Left/Center Panel: Gene Splicing Chamber -->
                <div class="splicing-panel lg:col-span-2 p-6 border-2 border-dashed border-indigo-300 rounded-2xl bg-indigo-50/50 shadow-sm flex flex-col justify-between min-h-[340px]">
                    <div class="w-full flex justify-between items-center mb-4">
                        <span id="lab-status-badge" class="text-xs font-mono bg-indigo-200 text-indigo-900 px-3 py-1 rounded-md font-bold">
                            Chamber Status: Ready
                        </span>
                        <span id="purity-badge" class="text-xs font-mono bg-slate-200 text-slate-800 px-3 py-1 rounded-md font-bold">
                            Hybrid Stability: 100%
                        </span>
                    </div>

                    <!-- Gene Splicer Display -->
                    <div class="w-full bg-slate-900 rounded-2xl p-6 my-auto flex flex-col items-center justify-center shadow-inner text-white min-h-[200px]">
                        <div class="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-4">🧬 Gene Sequence Analyzer</div>
                        
                        <div class="flex items-center justify-center gap-6 flex-wrap">
                            <div id="parent-a" class="flex flex-col items-center p-3 bg-slate-800 rounded-xl border border-slate-700 min-w-[90px]">
                                <span class="text-3xl mb-1">🌽</span>
                                <span class="text-xs font-bold text-slate-200">Strain Alpha</span>
                                <span class="text-[10px] font-mono text-emerald-400 mt-1">ATCG-99</span>
                            </div>

                            <span class="text-xl font-bold text-indigo-400 animate-pulse">+</span>

                            <div id="parent-b" class="flex flex-col items-center p-3 bg-slate-800 rounded-xl border border-slate-700 min-w-[90px]">
                                <span class="text-3xl mb-1">🍇</span>
                                <span class="text-xs font-bold text-slate-200">Strain Beta</span>
                                <span class="text-[10px] font-mono text-indigo-400 mt-1">GCTA-42</span>
                            </div>

                            <span class="text-xl font-bold text-indigo-400">=</span>

                            <div id="hybrid-result" class="flex flex-col items-center p-3 bg-indigo-950/80 border-2 border-indigo-500/50 rounded-xl min-w-[100px] shadow-lg">
                                <span id="hybrid-icon" class="text-3xl mb-1">❓</span>
                                <span id="hybrid-name" class="text-xs font-bold text-indigo-200">Unknown</span>
                                <span id="hybrid-code" class="text-[10px] font-mono text-slate-400 mt-

