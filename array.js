export const pythonCode = `
# Static/Dynamic Array & 2D Matrix concept for spatial grid management
class GridMatrix:
    def __init__(self, rows=3, cols=3):
        self.rows = rows
        self.cols = cols
        self.grid = [[{"status": "Empty", "timer": 0} for _ in range(cols)] for _ in range(rows)]

    def get_cell(self, r, c):
        return self.grid[r][c]

    def set_cell(self, r, c, status):
        self.grid[r][c]["status"] = status
`;

export function createEmptyPlotMatrix() {
  return Array(3).fill(null).map(() => 
    Array(3).fill(null).map(() => ({ status: "Empty", timer: 0, timerId: null, hasPlant: false, isWatered: false, activeCrop: null }))
  );
}

export function renderStackBox(history_stack) {
  if (history_stack.length === 0) return "Empty";
  return history_stack.map(i => `<div>(${i.r},${i.c}) - ${i.act}</div>`).join('');
}

