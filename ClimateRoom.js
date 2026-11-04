/**
 * ============================================================================
 * ROOM 2: CLIMATE CONTROL ROOM (QUEUE-BASED TASKS)
 * ============================================================================
 */

import { BaseRoom } from './CentralManager.js';

export class ClimateRoom extends BaseRoom {
    constructor() {
        const container = document.createElement('div');
        container.className = 'room climate-room w-full h-auto min-h-full p-6 bg-slate-50 text-slate-800 font-sans flex flex-col justify-start gap-6 pb-12';
        container.innerHTML = `
            <div class="climate-header shrink-0">
                <h2 class="text-2xl font-extrabold text-sky-800 flex items-center gap-2">
                    🌡️ Room 2: Climate Control Chamber (FIFO Task Queue)
                </h2>
                <p class="text-sm text-slate-600 mt-1">
                    Enqueue environmental adjustments into the execution pipeline (First-In, First-Out).
                </p>
            </div>

            <div class="control-grid grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Action Queueing Panel -->
                <div class="p-6 border-2 border-dashed border-sky-400 rounded-2xl bg-sky-50/50 shadow-sm flex flex-col justify-between gap-4">
                    <span class="text-xs font-bold text-sky-900 uppercase tracking-wider">Enqueue Adjustment Task</span>
                    <div class="grid grid-cols-2 gap-3">
                        <button id="cmd-heat" class="p-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer active:scale-95">🔥 Heat (Increase Temp)</button>
                        <button id="cmd-cool" class="p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer active:scale-95">❄️ Cool (Decrease Temp)</button>
                        <button id="cmd-mist" class="p-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer active:scale-95">🌧️ Mist (Increase Humid)</button>
                        <button id="cmd-vent" class="p-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer active:scale-95">💨 Vent (Air Flow)</button>
                    </div>
                    <button id="btn-process" class="w-full py-3 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer active:scale-95 mt-2">
                        ▶️ Process Next Queued Task (Dequeue)
                    </button>
                </div>

                <!-- Live Task Feed -->
                <div class="p-5 bg-slate-900 text-slate-100 rounded-2xl shadow-lg font-mono text-xs flex flex-col justify-between">
                    <div class="flex justify-between items-center border-b border-slate-700 pb-3 mb-3">
                        <span class="text-xs font-bold text-sky-400 uppercase tracking-wide">Pending FIFO Queue</span>
                        <span id="queue-count" class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">0 Tasks</span>
                    </div>
                    <div id="queue-list" class="flex flex-col gap-2 max-h-[160px] overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                        <div class="text-slate-600 italic text-center py

