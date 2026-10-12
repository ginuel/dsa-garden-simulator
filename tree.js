export const pythonCode = `
# Skills & Growth Tree instantiation
root = Node("root", "Base Skill Hub", cost=0)
root.unlocked = True

s1 = Node("soil_1", "Soil Mastery I", "Soil", 1.5, cost=10)
s2 = Node("soil_2", "Soil Mastery II", "Soil", 1.0, cost=20)
s3 = Node("soil_3", "Soil Mastery III", "Soil", 0.5, cost=35)
root.children.append(s1); s1.children.append(s2); s2.children.append(s3)

w1 = Node("water_1", "Hydro Mastery I", "Water", 0.8, cost=10)
w2 = Node("water_2", "Hydro Mastery II", "Water", 0.4, cost=20)
w3 = Node("water_3", "Hydro Mastery III", "Water", 0.2, cost=35)
root.children.append(w1); w1.children.append(w2); w2.children.append(w3)

g1 = Node("growth_1", "Rapid Growth I", growth_time=4, cost=15)
g2 = Node("growth_2", "Rapid Growth II", growth_time=3, cost=25)
g3 = Node("growth_3", "Rapid Growth III", growth_time=1, cost=40)
root.children.append(g1); g1.children.append(g2); g2.children.append(g3)

def serialize(node):
    return {
        "id": node.id, "name": node.name, "action": node.action,
        "speed": node.speed, "growth_time": node.growth_time,
        "cost": node.cost, "unlocked": node.unlocked,
        "children": [serialize(c) for c in node.children]
    }

tree = serialize(root)
`;

export function syncTreeEffects(treeRoot, speeds) {
  if (!treeRoot) return { speeds, growthTime: 5 };
  let q = [treeRoot];
  let gTime = 5;
  while (q.length > 0) {
    let curr = q.shift();
    if (curr.unlocked) {
      if (curr.action && curr.speed != null && !isNaN(Number(curr.speed))) speeds[curr.action] = Number(curr.speed);
      if (curr.growth_time != null && !isNaN(Number(curr.growth_time))) gTime = Number(curr.growth_time);
    }
    if (curr.children) q.push(...curr.children);
  }
  return { speeds, growthTime: gTime };
}

