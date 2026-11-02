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
