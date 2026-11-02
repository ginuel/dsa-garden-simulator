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
