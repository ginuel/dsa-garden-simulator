export const pythonCode = `
# Tree Traversal algorithms implementation (BFS, DFS Preorder, Postorder)
class TreeTraversal:
    @staticmethod
    def bfs(root):
        if not root: return []
        res, q = [], [root]
        while q:
            curr = q.pop(0)
            res.append(curr)
            if hasattr(curr, 'children') and curr.children:
                q.extend(curr.children)
        return res

    @staticmethod
    def preorder(node, res=None):
        if res is None: res = []
        if not node: return res
        res.append(node)
        if hasattr(node, 'children') and node.children:
            for c in node.children:
                TreeTraversal.preorder(c, res)
        return res
`;

export function getBFSSequence(root) {
  if (!root) return [];
  let res = [], q = [root];
  while (q.length > 0) {
    let curr = q.shift(); res.push(curr);
    if (curr.children) q.push(...curr.children);
  }
  return res;
}

export function getPreorderSequence(node, res = []) {
  if (!node) return res;
  res.push(node);
  if (node.children) { for (let c of node.children) getPreorderSequence(c, res); }
  return res;
}

export function getPostorderSequence(node, res = []) {
  if (!node) return res;
  if (node.children) { for (let c of node.children) getPostorderSequence(c, res); }
  res.push(node);
  return res;
}

export function getInorderSequence(node, res = []) {
  if (!node) return res;
  if (!node.children || node.children.length === 0) { res.push(node); return res; }
  getInorderSequence(node.children[0], res);
  res.push(node);
  for (let i = 1; i < node.children.length; i++) { getInorderSequence(node.children[i], res); }
  return res;
}

