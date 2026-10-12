import { pythonCode as nodePy, findNodeWithParent } from './node.js';
import { pythonCode as stackPy, undoLastAction } from './stack.js';
import { pythonCode as queuePy, renderQueue } from './queue.js';
import { pythonCode as arrayPy, createEmptyPlotMatrix, renderStackBox } from './array.js';
import { pythonCode as treePy, syncTreeEffects } from './tree.js';
import { pythonCode as traversalPy, getBFSSequence, getPreorderSequence, getPostorderSequence, getInorderSequence } from './traversal.js';
import { pythonCode as bstPy } from './bst.js';

// Global state variables
window.py = null;
window.selectedCell = null;
window.timerRunning = false;
window.gold = 50;
window.history_stack = [];
window.execution_queue = [];
window.plot_matrix = createEmptyPlotMatrix();
window.speeds = { Soil: 2.0, Water: 1.0, Plant: 3.0 };
window.growthTime = 5;
window.treeRoot = null;
window.gmcRoot = null;
window.selectedGMCId = "origin_gmc";
window.currentSelectedGMC = { name: "Origin Crop", growth_time: 5, yield_val: 15 };

window.currentTraversalMode = 'bfs';
window.traversalSequence = [];
window.traversalIndex = 0;
window.traversalActive = false;

// Populate individual textareas in the tabbed workbench
document.getElementById('py-node').value = nodePy.trim();
document.getElementById('py-stack').value = stackPy.trim();
document.getElementById('py-queue').value = queuePy.trim();
document.getElementById('py-array').value = arrayPy.trim();
document.getElementById('py-tree').value = treePy.trim();
document.getElementById('py-traversal').value = traversalPy.trim();
document.getElementById('py-bst').value = bstPy.trim();

// Combine all Python snippets together for runtime execution efficacy
function getCombinedPythonCode() {
  return [
    document.getElementById('py-node').value,
    document.getElementById('py-stack').value,
    document.getElementById('py-queue').value,
    document.getElementById('py-array').value,
    document.getElementById('py-tree').value,
    document.getElementById('py-traversal').value,
    document.getElementById('py-bst').value
  ].join("\n\n");
}

async function start() {
  window.py = await loadPyodide();
  await runPython();
  document.getElementById('status').innerText = "Pyodide Active";
  document.getElementById('status').className = "text-amber-800 font-semibold";
  drawGrid();
  updateGoldUI();
  lucide.createIcons();
}

// async function runPython() {
//   try {
//     let combinedCode = getCombinedPythonCode();
//     await window.py.runPythonAsync(combinedCode);
//     let rawTree = window.py.runPython("tree");
//     window.treeRoot = rawTree.toJs({ dict_converter: Object.fromEntries });
//
//     let rawGmc = window.py.runPython("gmc_data");
//     window.gmcRoot = rawGmc ? rawGmc.toJs({ dict_converter: Object.fromEntries }) : null;
//
//     syncAndUpdateEffects();
//     drawTree();
//     drawGMCTree();
//     window.resetTraversalState();
//   } catch (err) { alert("Python Error: " + err); }
// }
async function runPython() {
  try {
    let combinedCode = getCombinedPythonCode();
    
    // Check if the user emptied all fields
    if (!combinedCode.trim()) {
      throw new Error("Workbench code is completely empty! Provide valid Python code.");
    }

    // Clear previous Python workspace globals to prevent ghost/persisted states
    window.py.runPython(`
for _k in list(globals().keys()):
    if not _k.startswith('_'):
        del globals()[_k]
    `);

    // Execute the combined workbench code with error wrapping
    await window.py.runPythonAsync(`
try:
    ${combinedCode.split('\n').map(line => '    ' + line).join('\n')}
except Exception as e:
    import traceback
    raise RuntimeError(f"Python Runtime Error:\\n{traceback.format_exc()}")
    `);

    // Pull updated state from Pyodide
    let rawTree = window.py.runPython("tree");
    window.treeRoot = rawTree.toJs({ dict_converter: Object.fromEntries });

    let rawGmc = window.py.runPython("gmc_data");
    window.gmcRoot = rawGmc ? rawGmc.toJs({ dict_converter: Object.fromEntries }) : null;

    syncAndUpdateEffects();
    drawTree();
    drawGMCTree();
    window.resetTraversalState();
  } catch (err) {
    console.error(err);
    alert("Python Execution Failed:\n" + err.message);
  }
}

window.confirmAndRunPython = async function() {
  let userConfirmed = confirm("Applying and running combined Python workbench code. Continue?");
  if (!userConfirmed) return;
  window.gold = 50; window.history_stack = []; window.execution_queue = []; window.selectedCell = null;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (window.plot_matrix[r][c].timerId) clearInterval(window.plot_matrix[r][c].timerId);
    }
  }
  window.plot_matrix = createEmptyPlotMatrix();
  document.getElementById('controls').classList.add('hidden');
  await runPython();
  drawGrid(); drawStack(); drawQueue(); updateGoldUI();
};

function updateGoldUI() { document.getElementById('gold-val').innerText = window.gold; }

window.undoAction = function() {
  let res = undoLastAction(window.history_stack, window.plot_matrix, window.execution_queue);
  if (!res.success) { alert(res.message); return; }
  window.history_stack = res.history_stack;
  window.execution_queue = res.execution_queue;
  drawStack(); drawQueue(); drawGrid();
};

window.doAction = function(act) {
  if (!window.selectedCell) return;
  let r = window.selectedCell.r, c = window.selectedCell.c, plot = window.plot_matrix[r][c];
  if (act === 'Soil' && plot.status !== 'Empty' && plot.status !== 'Gold Harvestable!') return alert("Plot already has soil or crops!");
  if (act === 'Plant') {
    if (plot.status === 'Empty') return alert("Cannot plant without soil first!");
    if (plot.hasPlant) return alert("Plot already has a plant!");
    plot.activeCrop = { ...window.currentSelectedGMC };
  }
  if (act === 'Water') {
    if (plot.status === 'Empty') return alert("Cannot water empty land!");
    if (plot.isWatered) return alert("Plot already watered!");
  }
  let task = { r, c, act, time: window.speeds[act] };
  window.history_stack.push(task); window.execution_queue.push(task);
  drawStack(); drawQueue();
  if (!window.timerRunning) runWorker();
};

function runWorker() {
  if (window.execution_queue.length === 0) { window.timerRunning = false; drawQueue(); return; }
  window.timerRunning = true;
  let task = window.execution_queue[0];
  drawQueue();
  setTimeout(() => {
    let done = window.execution_queue.shift();
    if (done) applyPlotChange(done.r, done.c, done.act);
    drawGrid(); drawQueue(); runWorker();
  }, task.time * 1000);
}

function applyPlotChange(r, c, act) {
  let plot = window.plot_matrix[r][c];
  if (act === 'Soil') {
    if (plot.timerId) clearInterval(plot.timerId);
    window.plot_matrix[r][c] = { status: 'Soil', timer: 0, timerId: null, hasPlant: false, isWatered: false, activeCrop: null };
  } else if (act === 'Plant') {
    plot.hasPlant = true;
    if (plot.isWatered) startGrowthTimer(plot);
    else plot.status = 'Soil + Plant';
  } else if (act === 'Water') {
    plot.isWatered = true;
    if (plot.hasPlant) startGrowthTimer(plot);
    else plot.status = 'Watered Soil';
  }
}

function startGrowthTimer(plot) {
  plot.status = 'Growing...';
  let cropGrowthTime = plot.activeCrop ? plot.activeCrop.growth_time : window.growthTime;
  plot.timer = typeof cropGrowthTime === 'number' && !isNaN(cropGrowthTime) ? cropGrowthTime : 5;
  if (plot.timerId) clearInterval(plot.timerId);
  plot.timerId = setInterval(() => {
    plot.timer--;
    if (plot.timer <= 0) {
      clearInterval(plot.timerId); plot.timerId = null; plot.status = 'Gold Harvestable!';
    }
    drawGrid();
  }, 1000);
}

function harvestGold(r, c) {
  let plot = window.plot_matrix[r][c];
  let yieldReward = plot.activeCrop ? plot.activeCrop.yield_val : 15;
  window.gold += yieldReward; updateGoldUI();
  window.plot_matrix[r][c] = { status: 'Soil', timer: 0, timerId: null, hasPlant: false, isWatered: false, activeCrop: null };
  drawGrid();
}

function drawQueue() {
  document.getElementById('queue-box').innerHTML = renderQueue(window.execution_queue);
}

function drawStack() {
  document.getElementById('stack-box').innerHTML = renderStackBox(window.history_stack);
}

function drawGrid() {
  let box = document.getElementById('grid-box'); box.innerHTML = '';
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      let plot = window.plot_matrix[r][c], isSel = window.selectedCell && window.selectedCell.r === r && window.selectedCell.c === c;
      let isGold = plot.status === 'Gold Harvestable!', btn = document.createElement('button');
      btn.className = `w-16 h-16 rounded text-[10px] font-bold border flex flex-col items-center justify-center p-0.5 transition ${
        isSel ? 'border-amber-500 border-2' : 'border-gray-300'
      } ${
        isGold ? 'bg-amber-400 text-amber-950 animate-pulse' :
        plot.status.includes('Soil') ? 'bg-amber-800 text-amber-100' :
        plot.status.includes('Growing') ? 'bg-emerald-700 text-white' :
        plot.status === 'Watered Soil' ? 'bg-blue-600 text-white' : 'bg-amber-50 text-amber-900'
      }`;
      let subText = plot.status;
      if (plot.status === 'Growing...') subText = `⏳ (${plot.timer}s)`;
      if (isGold) subText = `💰 HARVEST!`;
      btn.innerHTML = `(${r},${c})<br><span class="text-[9px] font-normal">${subText}</span>`;
      btn.onclick = () => {
        if (isGold) return harvestGold(r, c);
        window.selectedCell = { r, c }; drawGrid();
        document.getElementById('controls').classList.remove('hidden');
        document.getElementById('target-label').innerText = `Selected Plot: (${r}, ${c})`;
        document.getElementById('active-crop-label').innerText = `Active Seed: ${window.currentSelectedGMC.name} (+${window.currentSelectedGMC.yield_val}g)`;
      };
      box.appendChild(btn);
    }
  }
}

function syncAndUpdateEffects() {
  let res = syncTreeEffects(window.treeRoot, window.speeds);
  window.speeds = res.speeds;
  window.growthTime = res.growthTime;
  document.getElementById('btn-soil').innerText = `Soil (${window.speeds.Soil}s)`;
  document.getElementById('btn-water').innerText = `Water (${window.speeds.Water}s)`;
  document.getElementById('btn-plant').innerText = `Plant (${window.speeds.Plant}s)`;
}

function clickUnlockNode(nodeId) {
  let res = findNodeWithParent(window.treeRoot, nodeId);
  if (!res) return;
  let targetNode = res.node;
  let parentNode = res.parent;

  if (targetNode.unlocked) return alert("Skill already unlocked!");
  if (parentNode && !parentNode.unlocked) return alert(`Dependency Error: You must unlock parent skill "${parentNode.name}" first!`);
  if (window.gold < targetNode.cost) return alert(`Need ${targetNode.cost} Gold to unlock skill.`);

  window.gold -= targetNode.cost;
  targetNode.unlocked = true;
  updateGoldUI();
  syncAndUpdateEffects();
  drawTree();
  if (window.traversalActive) updateNavDisplay();
}

function drawTree() {
  if (!window.treeRoot) return;
  let container = document.getElementById('tree-box'); container.innerHTML = '';
  let highlightedNodeId = (window.traversalActive && window.traversalSequence.length > 0) ? window.traversalSequence[window.traversalIndex].id : null;

  function render(node, level = 0) {
    let row = document.createElement('div'); row.style.paddingLeft = `${level * 16}px`; row.className = "my-0.5";
    let statusText = node.unlocked ? "[ON]" : "[OFF]";
    let effectText = node.speed ? ` (${node.speed}s act)` : node.growth_time ? ` (${node.growth_time}s growth)` : '';
    let costText = node.cost > 0 ? ` - ${node.cost}g` : ' - FREE';
    let isHighlighted = (node.id === highlightedNodeId);

    let btn = document.createElement('button');
    btn.className = `px-2 py-1 rounded text-left border font-mono text-[11px] transition ${
      isHighlighted ? 'ring-2 ring-amber-500 bg-amber-50 font-bold border-amber-600' :
      node.unlocked ? 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'
    }`;
    btn.innerHTML = `<b>${statusText}</b> ${node.name}${effectText}${costText}`;
    btn.onclick = () => clickUnlockNode(node.id);
    row.appendChild(btn); container.appendChild(row);
    if (node.children) { for (let c of node.children) render(c, level + 1); }
  }
  render(window.treeRoot);
}

window.promptMutateGMC = function() {
  let mutantName = prompt("Enter Name for Mutated GMC Child Seed:", "Super Hybrid X");
  if (!mutantName) return;

  window.py.globals.set("target_id", window.selectedGMCId);
  window.py.globals.set("mut_name", mutantName);
  window.py.runPython(`
def mutate_node_recursive(node, tid, name):
    if node.id == tid:
        return node.mutate_child(name)
    for c in node.children:
        res = mutate_node_recursive(c, tid, name)
        if res: return res
    return None

mutate_node_recursive(gmc_root, target_id, mut_name)
gmc_data = serialize_gmc(gmc_root)
  `);

  let rawGmc = window.py.runPython("gmc_data");
  window.gmcRoot = rawGmc ? rawGmc.toJs({ dict_converter: Object.fromEntries }) : null;
  drawGMCTree();
};

window.promptCopySiblingGMC = function() {
  if (window.selectedGMCId === "origin_gmc") return alert("Cannot duplicate the root Origin Crop!");
  let siblingName = prompt("Enter Name for Sibling Clone Seed:", "Clone Strain B");
  if (!siblingName) return;

  window.py.globals.set("target_id", window.selectedGMCId);
  window.py.globals.set("sib_name", siblingName);
  window.py.runPython(`
def copy_sibling_recursive(node, tid, name):
    for i, c in enumerate(node.children):
        if c.id == tid:
            dup_id = f"gmc_{random.randint(1000, 9999)}"
            dup_node = GMCNode(dup_id, name, c.growth_time, c.yield_val, c.cost)
            node.children.insert(i + 1, dup_node)
            return dup_node
        res = copy_sibling_recursive(c, tid, name)
        if res: return res
    return None

copy_sibling_recursive(gmc_root, target_id, sib_name)
gmc_data = serialize_gmc(gmc_root)
  `);

  let rawGmc = window.py.runPython("gmc_data");
  window.gmcRoot = rawGmc ? rawGmc.toJs({ dict_converter: Object.fromEntries }) : null;
  drawGMCTree();
};

function drawGMCTree() {
  let container = document.getElementById('gmc-box');
  if (!window.gmcRoot) { container.innerText = "Empty GMC Tree"; return; }
  container.innerHTML = '';

  function renderGMC(node, level = 0) {
    if (!node) return;
    let row = document.createElement('div'); row.style.paddingLeft = `${level * 16}px`; row.className = "my-0.5";
    let isSelected = (window.selectedGMCId === node.id);
    let isActive = (window.currentSelectedGMC.name === node.name);

    let btn = document.createElement('button');
    btn.className = `px-2 py-0.5 rounded border font-mono text-[11px] text-left transition ${
      isSelected ? 'ring-2 ring-purple-600 bg-purple-100 font-bold border-purple-700 text-purple-950' :
      'bg-purple-50 border-purple-300 text-purple-900 hover:bg-purple-100'
    }`;
    btn.innerHTML = `🧬 <b>${node.name}</b> (${node.growth_time}s growth, +${node.yield_val}g) ${isActive ? '👑 [ACTIVE]' : ''}`;
    btn.onclick = () => {
      window.selectedGMCId = node.id;
      window.currentSelectedGMC = { name: node.name, yield_val: node.yield_val, growth_time: node.growth_time };
      drawGMCTree();
      drawGrid();
    };
    row.appendChild(btn); container.appendChild(row);
    if (node.children) { for (let c of node.children) renderGMC(c, level + 1); }
  }
  renderGMC(window.gmcRoot);
}

window.setTraversalMode = function(mode) {
  window.currentTraversalMode = mode;
  ['bfs', 'preorder', 'inorder', 'postorder'].forEach(m => {
    let btn = document.getElementById(`btn-${m}`);
    if (btn) btn.className = m === mode ? "px-2 py-0.5 border rounded font-semibold bg-emerald-700 text-white" : "px-2 py-0.5 border rounded font-semibold bg-gray-100 text-gray-800";
  });
  window.resetTraversalState();
};

window.resetTraversalState = function() {
  window.traversalActive = false; window.traversalSequence = []; window.traversalIndex = 0;
  document.getElementById('nav-display').innerText = `Mode: ${window.currentTraversalMode.toUpperCase()}. Click "Traverse" to start.`;
  let prevBtn = document.getElementById('nav-prev');
  let nextBtn = document.getElementById('nav-next');
  let unlockBtn = document.getElementById('nav-unlock');
  if(prevBtn) { prevBtn.disabled = true; prevBtn.className = "bg-gray-400 text-white px-2 py-0.5 rounded font-bold cursor-not-allowed"; }
  if(nextBtn) { nextBtn.disabled = true; nextBtn.className = "bg-gray-400 text-white px-2 py-0.5 rounded font-bold cursor-not-allowed"; }
  if(unlockBtn) { unlockBtn.disabled = true; unlockBtn.className = "bg-gray-400 text-white px-3 py-0.5 rounded font-bold cursor-not-allowed"; }
  drawTree();
};

window.startTraversal = function() {
  window.traversalActive = true;
  if (window.currentTraversalMode === 'bfs') window.traversalSequence = getBFSSequence(window.treeRoot);
  else if (window.currentTraversalMode === 'preorder') window.traversalSequence = getPreorderSequence(window.treeRoot);
  else if (window.currentTraversalMode === 'postorder') window.traversalSequence = getPostorderSequence(window.treeRoot);
  else window.traversalSequence = getInorderSequence(window.treeRoot);

  window.traversalIndex = 0;
  let prevBtn = document.getElementById('nav-prev');
  let nextBtn = document.getElementById('nav-next');
  let unlockBtn = document.getElementById('nav-unlock');
  if(prevBtn) { prevBtn.disabled = false; prevBtn.className = "bg-gray-700 text-white px-2 py-0.5 rounded font-bold hover:bg-gray-800"; }
  if(nextBtn) { nextBtn.disabled = false; nextBtn.className = "bg-gray-700 text-white px-2 py-0.5 rounded font-bold hover:bg-gray-900"; }
  if(unlockBtn) { unlockBtn.disabled = false; unlockBtn.className = "bg-emerald-700 text-white px-3 py-0.5 rounded font-bold hover:bg-emerald-800"; }

  updateNavDisplay();
  drawTree();
};

window.traversalNext = function() {
  if (!window.traversalActive || window.traversalSequence.length === 0) return;
  if (window.traversalIndex < window.traversalSequence.length - 1) { window.traversalIndex++; updateNavDisplay(); drawTree(); }
};

window.traversalPrev = function() {
  if (!window.traversalActive || window.traversalSequence.length === 0) return;
  if (window.traversalIndex > 0) { window.traversalIndex--; updateNavDisplay(); drawTree(); }
};

function updateNavDisplay() {
  let box = document.getElementById('nav-display');
  if (!window.traversalActive || window.traversalSequence.length === 0) return;
  let currNode = window.traversalSequence[window.traversalIndex];
  let statusText = currNode.unlocked ? "[UNLOCKED]" : "[LOCKED]";

  box.innerHTML = `
    <div class="flex justify-between text-gray-500 font-bold">
      <span>Mode: ${window.currentTraversalMode.toUpperCase()}</span>
      <span>Step ${window.traversalIndex + 1} of ${window.traversalSequence.length}</span>
    </div>
    <div class="text-emerald-900 font-bold text-xs mt-1">
      🧭 Traversing Skill Track: ${currNode.name} <span class="font-normal text-gray-600">${statusText}</span>
    </div>
  `;
}

window.unlockHighlightedNode = function() {
  if (!window.traversalActive || window.traversalSequence.length === 0) return;
  let currNode = window.traversalSequence[window.traversalIndex];
  clickUnlockNode(currNode.id);
  updateNavDisplay();
};

start();

