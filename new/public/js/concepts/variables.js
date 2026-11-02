// Variables Concept Module
// Manages player identity, gold, days, and Terraria-inspired celestial day progression.

const state = {
    playerName: "Ginuel",
    gold: 0,
    dayCount: 0,
    dayProgressTime: 0, // seconds elapsed in current day (0 to 60)
    dayDurationSec: 60, // each day needing 1 min
    currentWeather: "Sunny"
};

export function registerConcept(api) {
    // Start Terraria day timer loop (1 min per day)
    setInterval(() => {
        state.dayProgressTime += 1;
        if (state.dayProgressTime >= state.dayDurationSec) {
            state.dayProgressTime = 0;
            state.dayCount += 1;
        }
        api.requestRender();
    }, 1000);
}

export function getInterface() {
    return {
        getState: () => state,
        setWeather: (w) => { state.currentWeather = w; },
        addGold: (amount) => { state.gold += amount; },
        getGold: () => state.gold,
        renderHUD: (container) => {
            container.innerHTML = `
                <span>👤 <strong>${state.playerName}</strong></span>
                <span>🪙 <strong>${state.gold}G</strong></span>
                <span>📅 Day ${state.dayCount}</span>
                <span>☀️ ${state.currentWeather}</span>
                <span>⏳ ${Math.floor((state.dayProgressTime / state.dayDurationSec) * 100)}%</span>
            `;

            // Terraria sun/moon arc movement based on day progress ratio (0 to 1)
            const ratio = state.dayProgressTime / state.dayDurationSec;
            const celestial = document.getElementById('celestial-body');
            const skyHeader = document.getElementById('sky-header');
            
            if (celestial && skyHeader) {
                // Parabolic arc movement for sun/moon across sky header width (approx 0% to 90% left)
                const leftPos = ratio * 85; 
                // Height peak at ratio = 0.5
                const topPos = 15 + Math.sin(ratio * Math.PI) * -35; 
                celestial.style.left = `${leftPos}%`;
                celestial.style.top = `${Math.max(5, topPos)}px`;

                // Update sky background & celestial appearance based on time & weather
                if (ratio > 0.75 || ratio < 0.25) {
                    // Night / Twilight transition
                    celestial.style.background = '#e0e0e0';
                    celestial.style.boxShadow = '0 0 15px #e0e0e0';
                } else {
                    celestial.style.background = '#ffeb3b';
                    celestial.style.boxShadow = '0 0 25px #ffeb3b';
                }

                if (state.currentWeather === 'Rainy') {
                    skyHeader.style.background = 'var(--bg-sky-rainy)';
                } else if (state.currentWeather === 'Drought') {
                    skyHeader.style.background = 'var(--bg-sky-drought)';
                } else if (ratio > 0.75 || ratio < 0.25) {
                    skyHeader.style.background = 'var(--bg-sky-night)';
                } else {
                    skyHeader.style.background = 'var(--bg-sky-sunny)';
                }
            }
        }
    };
}
