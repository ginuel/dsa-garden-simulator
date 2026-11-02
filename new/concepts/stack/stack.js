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
