export const pythonCode = `
# Stack concept: LIFO (Last-In, First-Out) structure for action history and undo operations
class Stack:
    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)

    def pop(self):
        if not self.is_empty():
            return self.items.pop()
        return None

    def peek(self):
        if not self.is_empty():
            return self.items[-1]
        return None

    def is_empty(self):
        return len(self.items) == 0
`;

export function undoLastAction(history_stack, plot_matrix, execution_queue) {
  let filtered = history_stack.filter(item => {
    let p = plot_matrix[item.r][item.c];
    return p.status !== 'Growing...' && p.status !== 'Gold Harvestable!';
  });
  if (filtered.length === 0) return { success: false, message: "Nothing valid to undo!" };
  
  let lastTask = filtered.pop();
  let { r, c, act } = lastTask;
  let plot = plot_matrix[r][c];

  if (act === 'Plant' || act === 'Water') {
    if (act === 'Plant') { plot.hasPlant = false; plot.activeCrop = null; }
    if (act === 'Water') plot.isWatered = false;
    if (plot.hasPlant) plot.status = 'Soil + Plant';
    else if (plot.isWatered) plot.status = 'Watered Soil';
    else plot.status = 'Soil';
  } else if (act === 'Soil') {
    if (plot.timerId) clearInterval(plot.timerId);
    plot_matrix[r][c] = { status: 'Empty', timer: 0, timerId: null, hasPlant: false, isWatered: false, activeCrop: null };
  }

  let updatedQueue = execution_queue.filter(i => i !== lastTask);
  return { success: true, history_stack: filtered, execution_queue: updatedQueue };
}

