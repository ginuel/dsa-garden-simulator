// Stack Concept Module (Harvest stack, push from grid, pop sells harvest and adds gold, ordinal numbering)

const harvestStack = [];

export function registerConcept(api) {
    // Stack background registration hook
}

export function getInterface() {
    return {
        push: (item) => {
            harvestStack.push(item);
        },
        pop: () => {
            if (harvestStack.length === 0) return null;
            return harvestStack.pop();
        },
        getItems: () => [...harvestStack],
        renderUI: (container, orchestratorAPI) => {
            container.innerHTML = `
                <div class="concept-card">
                    <h2>Harvest Stack</h2>
                    <div style="margin-bottom: 10px;">
                        <button id="pop-stack-btn" class="action-btn action-btn-secondary">Pop & Sell Harvest</button>
                    </div>
                    <ul id="stack-list" class="ord-list"></ul>
                </div>
            `;

            const listEl = container.querySelector('#stack-list');
            if (harvestStack.length === 0) {
                listEl.innerHTML = `<li style="color:#777; justify-content:center;">Stack is empty</li>`;
            } else {
                // Display stack items with ordinal numbering and coin display beside them (top of stack at bottom/top view)
                harvestStack.forEach((item, index) => {
                    const li = document.createElement('li');
                    li.innerHTML = `<span><strong>${ordinal(index + 1)}:</strong> ${item.name}</span><span>🪙 ${item.goldValue}G</span>`;
                    listEl.appendChild(li);
                });
            }

            container.querySelector('#pop-stack-btn').addEventListener('click', () => {
                orchestratorAPI.popStack();
            });
        }
    };
}

function ordinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
