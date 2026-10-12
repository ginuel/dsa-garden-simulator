export const pythonCode = `
# Node concept: Fundamental building block for hierarchical trees
class Node:
    def __init__(self, id_str, name, action=None, speed=None, growth_time=None, cost=10):
        self.id = id_str
        self.name = name
        self.action = action
        self.speed = speed
        self.growth_time = growth_time
        self.cost = cost
        self.unlocked = False
        self.children = []

    def add_child(self, child_node):
        self.children.append(child_node)
`;

export function findNodeWithParent(node, id, parent = null) {
  if (!node) return null;
  if (node.id === id) return { node, parent };
  if (node.children) {
    for (let c of node.children) {
      let found = findNodeWithParent(c, id, node);
      if (found) return found;
    }
  }
  return null;
}

