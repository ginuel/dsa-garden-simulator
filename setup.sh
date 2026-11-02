#!/usr/bin/env bash

mkdir -p concepts/variables
mkdir -p concepts/queue
mkdir -p concepts/grid
mkdir -p concepts/stack
mkdir -p concepts/python

# ------------------------------------------------------------------------------
# 1. INDEX.HTML
# ------------------------------------------------------------------------------
cat << 'EOF' > index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Minimal Modular Farming</title>
    <script src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"></script>
    <style>
        body { font-family: sans-serif; background: #1e272e; color: #f5f6fa; margin: 0; padding: 10px; }
        #game-container { display: none; max-width: 500px; margin: 0 auto; background: #2f3640; padding: 10px; border-radius: 6px; }
        .concept-section { border: 1px solid #718093; padding: 8px; margin-bottom: 8px; border-radius: 4px; }
        .debug-ui { display: none; }
        .debug-exit-btn { background: #e74c3c; color: #fff; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px; font-weight: bold; margin-bottom: 8px; width: 100%; display: none; }
    </style>
</head>
<body>
    <div id="python-root"></div>
    <div id="game-container">
        <button id="global-toggle-debug-btn" style="background:#3498db; color:#fff; border:none; padding:5px 10px; cursor:pointer; border-radius:3px; font-weight:bold; margin-bottom:8px; width:100%;">Toggle Debug Mode</button>
        <button id="global-exit-debug-btn" class="debug-exit-btn">Exit Debug Mode</button>
        <div id="variables-root" class="concept-section"></div>
        <div id="queue-root" class="concept-section"></div>
        <div id="grid-root" class="concept-section"></div>
        <div id="stack-root" class="concept-section"></div>
    </div>
    <script src="orchestrator.js"></script>
    <script src="script.js"></script>
</body>
</html>
EOF

# ------------------------------------------------------------------------------
# 2. SCRIPT.JS
# ------------------------------------------------------------------------------
cat << 'EOF' > script.js
document.addEventListener('DOMContentLoaded', () => {
    Orchestrator.init();
});
EOF

# ------------------------------------------------------------------------------
# 3. ORCHESTRATOR.JS
# ------------------------------------------------------------------------------
cat << 'EOF' > orchestrator.js
const Orchestrator = {
    modules: [],
    register(mod) { this.modules.push(mod); },
    async init() {
        const list = ['python', 'variables', 'queue', 'grid', 'stack'];
        for (const name of list) {
            await new Promise(res => {
                const link = document.createElement('link');
                link.rel = 'stylesheet'; link.href = `concepts/${name}/${name}.css`;
                document.head.appendChild(link);
                const script = document.createElement('script');
                script.src = `concepts/${name}/${name}.js`;
                script.onload = res; script.onerror = res;
                document.head.appendChild(script);
            });
        }
        const py = this.getModule('python');
        if (py && py.init) await py.init(this);
    },
    onPyodideReady() {
        document.getElementById('game-container').style.display = 'block';
        for (const mod of this.modules) {
            if (mod.name !== 'python' && mod.init) mod.init(this);
        }
        
        const toggleBtn = document.getElementById('global-toggle-debug-btn');
        const exitBtn = document.getElementById('global-exit-debug-btn');

        if (toggleBtn && exitBtn) {
            toggleBtn.addEventListener('click', () => {
                document.querySelectorAll('.debug-ui').forEach(el => el.style.display = 'block');
                exitBtn.style.display = 'block';
                toggleBtn.style.display = 'none';
                const vars = this.getModule('variables');
                if(vars) vars.state.isDebugSpeed = true;
            });

            exitBtn.addEventListener('click', () => {
                document.querySelectorAll('.debug-ui').forEach(el => el.style.display = 'none');
                exitBtn.style.display = 'none';
                toggleBtn.style.display = 'block';
                const vars = this.getModule('variables');
                if(vars) vars.state.isDebugSpeed = false;
                const queue = this.getModule('queue');
                if(queue) queue.startRandomEnqueue();
            });
        }
    },
    getModule(name) { return this.modules.find(m => m.name === name); }
};
EOF

# ------------------------------------------------------------------------------
# 4. PYTHON CONCEPT
# ------------------------------------------------------------------------------
cat << 'EOF' > concepts/python/python.css
#python-root { max-width: 400px; margin: 40px auto; font-family: monospace; }
.status-banner { padding: 10px; text-align: center; background: #353b48; border: 2px solid #00a8ff; border-radius: 4px; }
.status-banner.error { border-color: #e84118; background: #c23616; }
.status-banner.success { border-color: #4cd137; background: #44bd32; }
EOF

cat << 'EOF' > concepts/python/concept.py
def calculate_sale(base_val, weather_mult, is_debug):
    if is_debug:
        return 100
    return int(base_val * weather_mult)
EOF

cat << 'EOF' > concepts/python/python.js
(function() {
    let pyInstance = null;
    Orchestrator.register({
        name: 'python',
        async init(orchestrator) {
            const root = document.getElementById('python-root');
            root.innerHTML = `<div id="status-banner" class="status-banner">Loading Pyodide...</div>`;
            const banner = document.getElementById('status-banner');
            try {
                pyInstance = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/" });
                const res = await fetch('concepts/python/concept.py');
                if(!res.ok) throw new Error("Failed fetching concept.py");
                await pyInstance.runPythonAsync(await res.text());
                banner.className = 'status-banner success';
                banner.innerText = 'Pyodide Ready!';
                setTimeout(() => root.style.display = 'none', 1000);
                orchestrator.onPyodideReady();
            } catch(e) {
                banner.className = 'status-banner error';
                banner.innerText = `Pyodide Error: ${e.message}`;
            }
        },
        run(code) { return pyInstance.runPython(code); }
    });
})();
EOF

# ------------------------------------------------------------------------------
# 5. VARIABLES CONCEPT
# ------------------------------------------------------------------------------
cat << 'EOF' > concepts/variables/variables.css
.celestial { position: relative; width: 100%; height: 30px; background: #1e272e; border-radius: 15px; margin-top: 5px; overflow: hidden; }
.body { position: absolute; top: 4px; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; }
#sun { background: #fbc531; }
#moon { background: #f5f6fa; }
EOF

cat << 'EOF' > concepts/variables/variables.js
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
EOF

# ------------------------------------------------------------------------------
# 6. QUEUE CONCEPT
# ------------------------------------------------------------------------------
cat << 'EOF' > concepts/queue/queue.css
.q-list { display: flex; gap: 5px; margin-top: 5px; overflow-x: auto; }
.q-item { background: #8e44ad; padding: 3px 6px; border-radius: 3px; font-size: 11px; white-space: nowrap; }
EOF

cat << 'EOF' > concepts/queue/queue.js
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
EOF

# ------------------------------------------------------------------------------
# 7. GRID CONCEPT
# ------------------------------------------------------------------------------
cat << 'EOF' > concepts/grid/grid.css
.grid { display: grid; grid-template-columns: repeat(8, 30px); gap: 2px; margin-top: 5px; overflow-x: auto; }
.box { width: 30px; height: 30px; background: #7f8c8d; font-size: 7px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; text-align: center; }
.box.locked { background: #2c3e50; border: 1px dashed #7f8c8d; color: #b2bec3; }
.box.soiled { background: #d35400; }
.box.planted { background: #27ae60; }
.box.watered { background: #2980b9; }
.box.ready { background: #f1c40f; color: #000; font-weight: bold; }
.spin { animation: s 1s linear infinite; display: inline-block; }
@keyframes s { 100% { transform: rotate(360deg); } }
EOF

cat << 'EOF' > concepts/grid/grid.js
(function() {
    Orchestrator.register({
        name: 'grid',
        workers: 1, activeW: 0, landCost: 1000, workerCost: 500, data: [],
        init(orch) {
            this.orch = orch;
            for(let r=0; r<8; r++) {
                this.data[r] = [];
                for(let c=0; c<8; c++) {
                    this.data[r][c] = { unlocked: (r < 3 && c < 3), state: 'empty', busy: false, icon: '', growthDaysLeft: 0 };
                }
            }
            document.getElementById('grid-root').innerHTML = `
                <div><b>Grid</b> (Workers: <span id="w-cnt">1/1</span>)</div>
                <div class="debug-ui" style="margin-top: 5px;"><button id="g-worker">Add Worker (0G Debug)</button></div>
                <div style="margin-top: 5px;"><button id="g-worker-normal">Add Worker (500G)</button></div>
                <div id="g-board" class="grid"></div>
            `;
            document.getElementById('g-worker').onclick = () => {
                this.workers++;
                this.updateWorkers();
            };
            document.getElementById('g-worker-normal').onclick = () => {
                const vars = this.orch.getModule('variables');
                if(vars.state.gold >= this.workerCost) {
                    vars.addGold(-this.workerCost);
                    this.workers++;
                    this.updateWorkers();
                } else {
                    alert("Not enough gold! Need 500G.");
                }
            };
            
            const vars = this.orch.getModule('variables');
            if (vars) {
                vars.subscribe(() => this.onDayPass());
            }

            this.render();
        },
        updateWorkers() {
            document.getElementById('w-cnt').innerText = `${this.workers - this.activeW}/${this.workers}`;
        },
        render() {
            const board = document.getElementById('g-board');
            if(!board) return;
            board.innerHTML = '';
            for(let r=0; r<8; r++) {
                for(let c=0; c<8; c++) {
                    const cell = this.data[r][c];
                    const div = document.createElement('div');
                    div.className = `box ${cell.unlocked ? cell.state : 'locked'}`;
                    if(!cell.unlocked) {
                        div.innerHTML = `Buy<br>${this.landCost}G`;
                    } else if(cell.busy) {
                        div.innerHTML = `<span class="spin">${cell.icon}</span>`;
                    } else if(cell.state === 'watered') {
                        div.innerHTML = `⏳<br>${cell.growthDaysLeft}d`;
                    } else {
                        div.innerText = cell.state.toUpperCase();
                    }
                    div.onclick = () => this.clickCell(r, c);
                    board.appendChild(div);
                }
            }
        },
        onDayPass() {
            let updated = false;
            for(let r=0; r<8; r++) {
                for(let c=0; c<8; c++) {
                    const cell = this.data[r][c];
                    if (cell.state === 'watered' && cell.growthDaysLeft > 0) {
                        cell.growthDaysLeft--;
                        updated = true;
                        if (cell.growthDaysLeft <= 0) {
                            cell.state = 'ready';
                        }
                    }
                }
            }
            if (updated) this.render();
        },
        clickCell(r, c) {
            const cell = this.data[r][c];
            const vars = this.orch.getModule('variables');

            if(!cell.unlocked) {
                if(this.activeW >= this.workers) return;
                if(vars.state.gold >= this.landCost) {
                    vars.addGold(-this.landCost);
                    cell.unlocked = true;
                    this.render();
                }
                return;
            }

            if(this.activeW >= this.workers || cell.busy) return;

            const baseDuration = 5000;
            const debugDuration = 500;
            
            const getDuration = () => {
                const isDebug = vars.state.isDebugSpeed && document.getElementById('global-exit-debug-btn').style.display !== 'none';
                return isDebug ? debugDuration : baseDuration;
            };

            const getGrowthDuration = () => {
                const queueMod = this.orch.getModule('queue');
                const mult = queueMod ? queueMod.getCurrentMultiplier() : 1.0;
                return getDuration() / mult;
            };

            if(cell.state === 'empty') {
                this.runAction(r, c, '⛏️', getDuration, () => cell.state = 'soiled');
            } else if(cell.state === 'soiled') {
                this.runAction(r, c, '🌱', getDuration, () => cell.state = 'planted');
            } else if(cell.state === 'planted') {
                this.runAction(r, c, '💧', getDuration, () => {
                    cell.state = 'watered';
                    const queueMod = this.orch.getModule('queue');
                    const mult = queueMod ? queueMod.getCurrentMultiplier() : 1.0;
                    cell.growthDaysLeft = Math.max(1, Math.round(2 / mult));
                    this.render();
                });
            } else if(cell.state === 'ready') {
                this.runAction(r, c, '🌾', getDuration, () => {
                    cell.state = 'empty';
                    const queueMod = this.orch.getModule('queue');
                    const mult = queueMod ? queueMod.getCurrentMultiplier() : 1.0;
                    this.orch.getModule('stack').pushCrop('Wheat', 20, mult);
                });
            }
        },
        runAction(r, c, icon, getDurationFn, cb) {
            const cell = this.data[r][c];
            this.activeW++; cell.busy = true; cell.icon = icon;
            this.updateWorkers(); this.render();

            setTimeout(() => {
                cb();
                cell.busy = false; this.activeW--;
                this.updateWorkers(); this.render();
            }, getDurationFn());
        }
    });
})();
EOF

# ------------------------------------------------------------------------------
# 8. STACK CONCEPT
# ------------------------------------------------------------------------------
cat << 'EOF' > concepts/stack/stack.css
.s-list { display: flex; flex-direction: column-reverse; gap: 3px; max-height: 100px; overflow-y: auto; margin-top: 5px; }
.s-item { background: #e67e22; padding: 4px; display: flex; justify-content: space-between; font-size: 11px; border-radius: 3px; }
EOF

cat << 'EOF' > concepts/stack/stack.js
(function() {
    Orchestrator.register({
        name: 'stack',
        items: [], counter: 1,
        init(orch) {
            this.orch = orch;
            document.getElementById('stack-root').innerHTML = `
                <div><b>Stack</b></div>
                <div style="margin-top: 5px;"><button id="s-pop">Pop & Sell</button></div>
                <div id="s-disp" class="s-list"><em>Empty</em></div>
            `;
            document.getElementById('s-pop').onclick = () => this.pop();
        },
        pushCrop(name, val, mult) {
            this.items.push({ ordinal: this.counter++, name, val, mult });
            this.update();
        },
        pop() {
            if(!this.items.length) return;
            const item = this.items.pop();
            const py = this.orch.getModule('python');
            const vars = this.orch.getModule('variables');
            const isDebug = vars && vars.state.isDebugSpeed && document.getElementById('global-exit-debug-btn').style.display !== 'none';
            
            let val = item.val;
            if(py) {
                val = py.run(`calculate_sale(${item.val}, ${item.mult}, ${isDebug ? 'True' : 'False'})`);
            }
            vars.addGold(val);
            this.update();
        },
        update() {
            const el = document.getElementById('s-disp');
            if(!el) return;
            if(!this.items.length) { el.innerHTML = '<em>Empty</em>'; return; }
            el.innerHTML = this.items.map(i => `<div class="s-item"><span>#${i.ordinal} ${i.name}</span><span>🪙 ${i.val}G</span></div>`).join('');
        }
    });
})();
EOF

echo "Modular minimal farming game ready with 100g sell values in debug mode!"


