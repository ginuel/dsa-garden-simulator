from collections import deque

class Variables:
    def __init__(self, name="Ginuel", gold=0, day=0):
        self.name = name
        self.gold = gold
        self.day = day

    def set_val(self, key, val):
        if key == "name": self.name = val
        elif key == "gold": self.gold = val
        elif key == "day": self.day = val
        return {"name": self.name, "gold": self.gold, "day": self.day}

    def get_vals(self):
        return {"name": self.name, "gold": self.gold, "day": self.day}


class Stack:
    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)
        return self.items

    def pop(self):
        if self.items:
            return self.items.pop()
        return None

    def get_items(self):
        return self.items


class Queue:
    def __init__(self):
        self.items = deque()

    def enqueue(self, item):
        self.items.append(item)
        return list(self.items)

    def dequeue(self):
        if self.items:
            self.items.popleft()
        return list(self.items)

    def get_items(self):
        return list(self.items)


class GridMatrix:
    def __init__(self, rows=8, cols=8):
        self.rows = rows
        self.cols = cols
        self.grid = [["Locked" for _ in range(cols)] for _ in range(rows)]
        for r in range(3):
            for c in range(3):
                self.grid[r][c] = "Empty"

    def set_cell(self, r, c, val):
        if 0 <= r < self.rows and 0 <= c < self.cols:
            self.grid[r][c] = val
        return self.grid

    def get_grid(self):
        return self.grid


# Pure global data structure instances exposed for interop
var_engine = Variables("Ginuel", 0, 0)
stack_engine = Stack()
queue_engine = Queue()
grid_engine = GridMatrix(8, 8)
