export const ConceptsOrchestrator = {
  pyodide: null,
  concepts: [],

  async init(containerId, workbenchId) {
    this.pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/" });
    const code = await (await fetch("concepts/concept.py")).text();
    if (workbenchId) document.getElementById(workbenchId).value = code.trim();
    await this.pyodide.runPythonAsync(code);

    for (const name of ["variables"]) {
      try {
        const mod = await import(`./${name}/${name}.js`);
        if (mod.ConceptInterface) this.concepts.push(mod.ConceptInterface);
      } catch (e) { console.warn(`Skipped ${name}:`, e); }
    }

    const container = document.getElementById(containerId);
    container.innerHTML = "";
    this.refreshAll();
    container.classList.remove("hidden");
    if (window.lucide) lucide.createIcons();
  },

  refreshAll() {
    const container = document.getElementById("concepts-container");
    this.concepts.forEach(c => {
      if (!document.getElementById(c.id)) c.render(container, this.pyodide);
      c.updateUI(this.pyodide);
    });
  },

  async runCustomPython(code) {
    await this.pyodide.runPythonAsync(code);
    this.refreshAll();
  }
};
