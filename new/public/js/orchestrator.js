// Orchestrator: Dynamically registers and connects concept modules via their standard interfaces exclusively.
// Central files (index.html, script.js / orchestrator.js) contain zero game concepts, ensuring complete modularity.

import * as variablesModule from './concepts/variables.js';
import * as queueModule from './concepts/queue.js';
import * as gridModule from './concepts/grid.js';
import * as stackModule from './concepts/stack.js';

const concepts = {
    variables: variablesModule.getInterface(),
    queue: queueModule.getInterface(),
    grid: gridModule.getInterface(),
    stack: stackModule.getInterface()
};

// Expose orchestrator actions for concept UI bindings
const orchestratorAPI = {
    requestRender: () => renderAll(),
    enqueueWeather: () => {
        concepts.queue.enqueueRandom();
        const nextW = concepts.queue.peek();
        if (nextW) {
            concepts.variables.setWeather(nextW.name);
        }
        renderAll();
    },
    popStack: () => {
        const popped = concepts.stack.pop();
        if (popped) {
            concepts.variables.addGold(popped.goldValue);
            renderAll();
        }
    },
    handleCellClick: (idx) => {
        const currentGold = concepts.variables.getGold();
        const currentW = concepts.queue.peek();
        const weatherMultiplier = currentW ? currentW.multiplier : 1.0;

        const res = concepts.grid.clickCell(
            idx, 
            currentGold, 
            weatherMultiplier, 
            (harvestedItem) => {
                // Harvesting pushes harvested plant onto Stack
                concepts.stack.push(harvestedItem);
                renderAll();
            },
            () => renderAll()
        );

        if (res.action === 'buy') {
            if (currentGold >= res.cost) {
                concepts.variables.addGold(-res.cost);
                concepts.grid.unlockCell(idx);
                renderAll();
            }
        }
        renderAll();
    }
};

// Register all modules
variablesModule.registerConcept(orchestratorAPI);
queueModule.registerConcept(orchestratorAPI);
gridModule.registerConcept(orchestratorAPI);
stackModule.registerConcept(orchestratorAPI);

function renderAll() {
    // Render HUD in header
    const hudMount = document.getElementById('central-hud-mount');
    if (hudMount && concepts.variables.renderHUD) {
        concepts.variables.renderHUD(hudMount);
    }

    // Render concept cards into main viewport grid
    const gridMount = document.getElementById('concepts-grid-mount');
    if (gridMount) {
        gridMount.innerHTML = '';
        
        // Left Column: Grid Concept
        const gridCardDiv = document.createElement('div');
        if (concepts.grid.renderUI) {
            concepts.grid.renderUI(gridCardDiv, orchestratorAPI);
        }
        gridMount.appendChild(gridCardDiv);

        // Right Column: Management (Queue & Stack Concepts)
        const managementDiv = document.createElement('div');
        managementDiv.style.display = 'flex';
        managementDiv.style.flexDirection = 'column';
        managementDiv.style.gap = '20px';

        const queueCardDiv = document.createElement('div');
        if (concepts.queue.renderUI) {
            concepts.queue.renderUI(queueCardDiv, orchestratorAPI);
        }
        managementDiv.appendChild(queueCardDiv);

        const stackCardDiv = document.createElement('div');
        if (concepts.stack.renderUI) {
            concepts.stack.renderUI(stackCardDiv, orchestratorAPI);
        }
        managementDiv.appendChild(stackCardDiv);

        gridMount.appendChild(managementDiv);
    }
}

// Initial Render
renderAll();
