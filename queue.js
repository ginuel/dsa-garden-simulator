export const pythonCode = `
from collections import deque

# Queue concept: FIFO (First-In, First-Out) structure for task execution pipelines
class Queue:
    def __init__(self):
        self.items = deque()

    def enqueue(self, item):
        self.items.append(item)

    def dequeue(self, item):
        if not self.is_empty():
            return self.items.popleft()
        return None

    def is_empty(self):
        return len(self.items) == 0
`;

export function renderQueue(execution_queue) {
  if (execution_queue.length === 0) return "Idle";
  return execution_queue.map((i, idx) => `<div>${idx === 0 ? '▶' : '•'} (${i.r},${i.c}): ${i.act} (${i.time}s)</div>`).join('');
}

