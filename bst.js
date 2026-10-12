export const pythonCode = `
import random

# Genetically Modified Crops (GMC) tree and node mutation concept with random word generation
class GMCNode:
    def __init__(self, id_str, name, growth_time=5, yield_val=15, cost=10):
        self.id = id_str
        self.name = name
        self.growth_time = growth_time
        self.yield_val = yield_val
        self.cost = cost
        self.children = []

    def mutate_child(self, custom_name=None):
        adjectives = ["Quantum", "Astral", "Super", "Neon", "Void", "Solar", "Giga", "Bio", "Plasma", "Titan"]
        nouns = ["Sprout", "Root", "Vine", "Bloom", "Cluster", "Mutant", "Hybrid", "Stalk", "Flora", "Pod"]
        
        # Use custom name if provided, otherwise generate a random compound name
        mutant_name = custom_name if custom_name else f"{random.choice(adjectives)} {random.choice(nouns)}"

        time_delta = random.choice([-2, -1, 0, 1])
        yield_delta = random.choice([10, 15, 25])
        cost_delta = random.choice([5, 10, 20])
        
        new_growth = max(1, self.growth_time + time_delta)
        new_yield = self.yield_val + yield_delta
        new_cost = self.cost + cost_delta
        
        child_id = f"gmc_{random.randint(1000, 9999)}"
        child_node = GMCNode(child_id, mutant_name, new_growth, new_yield, new_cost)
        self.children.append(child_node)
        return child_node

gmc_root = GMCNode("origin_gmc", "Origin Crop", growth_time=5, yield_val=15, cost=0)

def serialize_gmc(node):
    if not node: return None
    return {
        "id": node.id, "name": node.name, "growth_time": node.growth_time,
        "yield_val": node.yield_val, "cost": node.cost,
        "children": [serialize_gmc(c) for c in node.children]
    }

gmc_data = serialize_gmc(gmc_root)
`;

export function searchBST(bstRoot, searchCost) {
  let curr = bstRoot;
  while (curr) {
    if (searchCost === curr.cost) return curr;
    if (searchCost < curr.cost) curr = curr.left;
    else curr = curr.right;
  }
  return null;
}

