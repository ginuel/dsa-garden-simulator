(function() {
    Orchestrator.register({
        name: 'variables',
        state: { name: 'Ginuel', gold: 0, day: 0, weather: 'Sunny', progress: 50, isDebugSpeed: false },
        listeners: [],
        init(orch) {
            this.orch = orch;
            document.getElementById('variables-root').innerHTML = `
                <div><b>${this.state.name}</b> | Gold: <span id="v-gold">0</span>G | Day: <span id="v-day">0</span> | Weather: <span id="v-weather">Sunny</span></div>
                <div class="celestial"><div id="sun" class="body" style="display:none">☀️</div><div id="moon" class="body" style="left:50%">🌙</div></div>
            `;
            setInterval(() => this.tick(), 100);
        },
        tick() {
            const dayDurationMs = (this.state.isDebugSpeed && document.getElementById('global-exit-debug-btn').style.display !== 'none') ? 6000 : 60000;
            const increment = (100 / (dayDurationMs / 100));
            
            this.state.progress += increment;
            if (this.state.progress >= 100) this.state.progress = 0;
            
            const sun = document.getElementById('sun'), moon = document.getElementById('moon');
            if (!sun || !moon) return;
            if (this.state.progress < 50) {
                sun.style.display = 'flex'; moon.style.display = 'none';
                sun.style.left = `${(this.state.progress / 50) * 85}%`;
            } else {
                sun.style.display = 'none'; moon.style.display = 'flex';
                const prev = this.state.progress;
                const mLeft = ((this.state.progress - 50) / 50) * 85;
                moon.style.left = `${mLeft}%`;
                if (prev - increment < 75 && prev >= 75) {
                    this.state.day++;
                    document.getElementById('v-day').innerText = this.state.day;
                    this.notifyListeners();
                }
            }
        },
        addGold(amt) {
            this.state.gold += amt;
            document.getElementById('v-gold').innerText = this.state.gold;
        },
        setWeather(w) {
            this.state.weather = w;
            document.getElementById('v-weather').innerText = w;
        },
        subscribe(cb) { this.listeners.push(cb); },
        notifyListeners() { this.listeners.forEach(cb => cb()); }
    });
})();
