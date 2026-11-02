const link = document.createElement("link"); link.rel = "stylesheet"; link.href = "concepts/matrix/matrix.css"; document.head.appendChild(link);

export const ConceptInterface = {
  id: "matrix",
  render(container, pyodide) {
    const section = document.createElement("section");
    section.className = "bg-slate-800 border border-slate-700 p-3 rounded space-y-2 shadow-md";
    section.innerHTML = `
      <div class="flex justify-between items-center">
        <h2 class="font-bold text-emerald-300">3. Grid Matrix (8x8 Land)</h2>
        <button id="btn-worker" class="bg-emerald-700 text-white px-2.5 py-1 rounded font-bold text-[11px]">Hire Worker (50G)</button>
      </div>
      <div id="grid-box" class="grid grid-cols-8 gap-1.5 w-fit mx-auto bg-slate-950 p-2 rounded border border-slate-700"></div>
    `;
    container.appendChild(section);

    section.querySelector("#btn-worker").addEventListener("click", () => {
      let g = parseInt(pyodide.runPython("var_engine.gold").toJs());
      let w = parseInt(pyodide.runPython("var_engine.workers").toJs());
      if (g >= 50) {
        pyodide.runPython(`var_engine.set_val("gold", ${g - 50})`);
        pyodide.runPython(`var_engine.set_val("workers", ${w + 1})`);
        window.dispatchEvent(new Event("refresh-variables"));
        alert("Worker hired!");
      } else { alert("Not enough gold!"); }
    });
    window.addEventListener("refresh-variables", () => this.updateUI(pyodide));
  },
  updateUI(pyodide) {
    let grid = pyodide.runPython("grid_engine.get_grid()").toJs({ dict_converter: Object.fromEntries });
    const box = document.getElementById("grid-box");
    if (!box) return;
    box.innerHTML = "";

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        let st = grid[r][c], btn = document.createElement("button");
        let locked = st === "Locked", active = st.includes("...");
        btn.className = `w-12 h-12 rounded text-[8px] font-bold border flex flex-col items-center justify-center p-0.5 ${locked ? 'bg-slate-900 text-slate-400 border-slate-700' : 'bg-emerald-900 text-emerald-100 border-emerald-700'}`;
        btn.innerHTML = locked ? `Buy Land<br><span class="text-[8px] text-amber-400">20G</span>` : `${active ? '<span class="spin-icon">⏳</span>' : ''}${st}`;
        btn.onclick = () => this.clickCell(r, c, st, pyodide);
        box.appendChild(btn);
      }
    }
  },
  clickCell(r, c, st, pyodide) {
    if (st === "Locked") {
      let g = parseInt(pyodide.runPython("var_engine.gold").toJs());
      if (g >= 20) {
        pyodide.runPython(`var_engine.set_val("gold", ${g - 20})`);
        pyodide.runPython(`grid_engine.set_cell(${r}, ${c}, "Empty")`);
        window.dispatchEvent(new Event("refresh-variables"));
        this.updateUI(pyodide);
      } else { alert("Not enough gold!"); }
      return;
    }
    if (st === "Empty") {
      pyodide.runPython(`grid_engine.set_cell(${r}, ${c}, "Soiling...")`);
      this.updateUI(pyodide);
      setTimeout(() => { pyodide.runPython(`grid_engine.set_cell(${r}, ${c}, "Soiled")`); this.updateUI(pyodide); }, 1000);
    } else if (st === "Soiled") {
      pyodide.runPython(`grid_engine.set_cell(${r}, ${c}, "Planting...")`);
      this.updateUI(pyodide);
      setTimeout(() => { pyodide.runPython(`grid_engine.set_cell(${r}, ${c}, "Planted")`); this.updateUI(pyodide); }, 1000);
    } else if (st === "Planted") {
      pyodide.runPython(`grid_engine.set_cell(${r}, ${c}, "Watering...")`);
      this.updateUI(pyodide);
      setTimeout(() => {
        pyodide.runPython(`grid_engine.set_cell(${r}, ${c}, "Growing...")`);
        this.updateUI(pyodide);
        setTimeout(() => { pyodide.runPython(`grid_engine.set_cell(${r}, ${c}, "Harvest (15 Gold)")`); this.updateUI(pyodide); }, 3000);
      }, 1000);
    } else if (st.includes("Harvest")) {
      pyodide.runPython(`grid_engine.set_cell(${r}, ${c}, "Harvesting...")`);
      this.updateUI(pyodide);
      setTimeout(() => {
        pyodide.runPython(`stack_engine.push("${st}")`);
        pyodide.runPython(`grid_engine.set_cell(${r}, ${c}, "Empty")`);
        this.updateUI(pyodide);
        window.dispatchEvent(new Event("refresh-stack"));
      }, 800);
    }
  }
};
