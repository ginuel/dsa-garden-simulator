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
