// Queue Concept Module (FIFO weather queue with ordinal numbering and duration effects)

const weatherTypes = [
    { name: "Sunny", durationDays: 1, multiplier: 1.0 },
    { name: "Rainy", durationDays: 1, multiplier: 0.6 },
    { name: "Drought", durationDays: 2, multiplier: 1.8 },
    { name: "Windy", durationDays: 1, multiplier: 1.2 }
];

const weatherQueue = [];

export function registerConcept(api) {
    // Queue internal event or periodic tick can be attached here if needed
}

export function getInterface() {
    return {
        enqueueRandom: () => {
            const template = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
            const item = { ...template, id: Date.now() };
            weatherQueue.push(item);
            return item;
        },
        dequeue: () => {
            if (weatherQueue.length === 0) return null;
            return weatherQueue.shift();
        },
        peek: () => (weatherQueue.length > 0 ? weatherQueue[0] : null),
        getItems: () => [...weatherQueue],
        renderUI: (container, orchestratorAPI) => {
            container.innerHTML = `
                <div class="concept-card">
                    <h2>Weather Queue</h2>
                    <div style="margin-bottom: 10px;">
                        <button id="enqueue-weather-btn" class="action-btn">Enqueue Random Weather</button>
                    </div>
                    <ul id="queue-list" class="ord-list"></ul>
                </div>
            `;

            const listEl = container.querySelector('#queue-list');
            if (weatherQueue.length === 0) {
                listEl.innerHTML = `<li style="color:#777; justify-content:center;">Queue is empty (Defaulting to Sunny)</li>`;
            } else {
                weatherQueue.forEach((item, index) => {
                    const li = document.createElement('li');
                    li.innerHTML = `<span><strong>${ordinal(index + 1)}:</strong> ${item.name}</span><span>(${item.durationDays} day duration)</span>`;
                    listEl.appendChild(li);
                });
            }

            container.querySelector('#enqueue-weather-btn').addEventListener('click', () => {
                orchestratorAPI.enqueueWeather();
            });
        }
    };
}

function ordinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
