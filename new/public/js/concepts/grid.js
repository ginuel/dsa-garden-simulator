// Grid Concept Module (8x8 land, 3x3 free start, buy land, action states with rotating icons)
// Sequence: Buy -> Soil -> Plant -> Water -> Grow (auto after water) -> Push (Harvest)

const GRID_SIZE = 8;
const gridData = [];

// Initialize 8x8 land, top-left 3x3 (rows 0-2, cols 0-2) given free from start
for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
        const isFree = r < 3 && c < 3;
        gridData.push({
            row: r,
            col: c,
            unlocked: isFree,
            cost: 75,
            state: isFree ? 'empty' : 'locked', // locked, empty, soiled, planted, watered, growing, harvestable
            activeAction: null, // 'soiling', 'planting', 'watering', 'growing', 'harvesting'
            actionIcon: null,
            plantType: null
        });
    }
}

export function registerConcept(api) {
    // Grid background timer or state updater if required
}

export function getInterface() {
    return {
        getGridData: () => gridData,
        clickCell: (index, goldAvailable, weatherMultiplier, onHarvestReady, requestRender) => {
            const cell = gridData[index];
            if (!cell.unlocked) {
                if (goldAvailable >= cell.cost) {
                    return { action: 'buy', cost: cell.cost };
                }
                return { action: 'error', message: 'Not enough gold to buy land!' };
            }

            if (cell.activeAction) return { action: 'busy' };

            // Sequential state transitions with rotating action icons
            if (cell.state === 'empty') {
                cell.activeAction = 'soiling';
                cell.actionIcon = '⛏️';
                setTimeout(() => {
                    cell.state = 'soiled';
                    cell.activeAction = null;
                    requestRender();
                }, 1500);
            } else if (cell.state === 'soiled') {
                cell.activeAction = 'planting';
                cell.actionIcon = '🌱';
                setTimeout(() => {
                    cell.state = 'planted';
                    cell.plantType = { name: 'Golden Crop', goldValue: 45 };
                    cell.activeAction = null;
                    requestRender();
                }, 1500);
            } else if (cell.state === 'planted') {
                cell.activeAction = 'watering';
                cell.actionIcon = '💧';
                setTimeout(() => {
                    cell.state = 'watered';
                    cell.activeAction = null;
                    
                    // Automatically trigger grow after water (duration scaled by weather multiplier)
                    cell.activeAction = 'growing';
                    cell.actionIcon = '⏳';
                    const growDuration = Math.round(2500 * (weatherMultiplier || 1.0));
                    setTimeout(() => {
                        cell.state = 'harvestable';
                        cell.activeAction = null;
                        requestRender();
                    }, growDuration);
                    requestRender();
                }, 1500);
            } else if (cell.state === 'harvestable') {
                cell.activeAction = 'harvesting';
                cell.actionIcon = '🌾';
                setTimeout(() => {
                    const harvestedItem = { ...cell.plantType };
                    cell.state = 'empty';
                    cell.plantType = null;
                    cell.activeAction = null;
                    if (onHarvestReady) onHarvestReady(harvestedItem);
                    requestRender();
                }, 1500);
            }
            return { action: 'started' };
        },
        unlockCell: (index) => {
            const cell = gridData[index];
            cell.unlocked = true;
            cell.state = 'empty';
        },
        renderUI: (container, orchestratorAPI) => {
            container.innerHTML = `
                <div class="concept-card">
                    <h2>Farm Grid (8x8 Land)</h2>
                    <div id="farm-grid-container" class="farm-grid-8x8"></div>
                </div>
            `;

            const gridContainer = container.querySelector('#farm-grid-container');
            gridData.forEach((cell, idx) => {
                const div = document.createElement('div');
                div.className = 'grid-cell';

                if (!cell.unlocked) {
                    div.classList.add('locked');
                    div.innerHTML = `Buy Land<br><strong>${cell.cost}G</strong>`;
                } else {
                    div.classList.add(cell.state);
                    if (cell.activeAction) {
                        div.innerHTML = `<span class="rotating-icon">${cell.actionIcon}</span><br><small>${cell.activeAction}</small>`;
                    } else if (cell.state === 'empty') {
                        div.innerHTML = `Soil (${idx + 1})`;
                    } else if (cell.state === 'soiled') {
                        div.innerHTML = `Plant (${idx + 1})`;
                    } else if (cell.state === 'planted') {
                        div.innerHTML = `Water (${idx + 1})`;
                    } else if (cell.state === 'growing') {
                        div.innerHTML = `Growing...`;
                    } else if (cell.state === 'harvestable') {
                        div.innerHTML = `Harvest! (${idx + 1})`;
                    }
                }

                div.addEventListener('click', () => {
                    orchestratorAPI.handleCellClick(idx);
                });

                gridContainer.appendChild(div);
            });
        }
    };
}
