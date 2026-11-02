(function() {
    Orchestrator.register({
        name: 'queue',
        items: [], types: [{name:'Rain', days:1, mult:1.5}, {name:'Storm', days:1, mult:2.0}], counter: 1, randomInterval: null,
        init(orch) {
            this.orch = orch;
            document.getElementById('queue-root').innerHTML = `
                <div><b>Weather Queue</b></div>
                <div class="debug-ui" style="margin-bottom: 5px;"><button id="q-add">Enqueue Weather</button></div>
                <div id="q-disp" class="q-list"><em>Sunny</em></div>
            `;
            document.getElementById('q-add').onclick = () => this.enqueue();
            
            const vars = this.orch.getModule('variables');
            if(vars) {
                vars.subscribe(() => this.onDayPass());
            }
        },
        startRandomEnqueue() {
            if (this.randomInterval) clearInterval(this.randomInterval);
            this.randomInterval = setInterval(() => {
                this.enqueue();
            }, Math.random() * 15000 + 15000);
        },
        enqueue() {
            const t = this.types[Math.floor(Math.random() * this.types.length)];
            this.items.push({ ordinal: this.counter++, name: t.name, days: t.days, mult: t.mult, leftDays: t.days });
            this.update();
            this.syncWeather();
        },
        onDayPass() {
            if (this.items.length > 0) {
                this.items[0].leftDays--;
                if (this.items[0].leftDays <= 0) {
                    this.items.shift();
                }
                this.update();
                this.syncWeather();
            }
        },
        syncWeather() {
            const vars = this.orch.getModule('variables');
            if (!vars) return;
            if (this.items.length === 0) {
                vars.setWeather('Sunny');
            } else {
                vars.setWeather(this.items[0].name);
            }
        },
        getCurrentMultiplier() {
            if (this.items.length === 0) return 1.0;
            return this.items[0].mult;
        },
        update() {
            const el = document.getElementById('q-disp');
            if (!el) return;
            if (!this.items.length) { el.innerHTML = '<em>Sunny</em>'; return; }
            el.innerHTML = this.items.map(i => `<div class="q-item">#${i.ordinal} ${i.name} (${i.leftDays}d left)</div>`).join('');
        }
    });
})();
