export class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

export class BinaryTree {
  constructor() {
    this.root = null;
    this.nodes = new Set();
  }

  /* ================= INSERT ================= */

  insert(val) {
    if (this.nodes.has(val)) return false;

    const newNode = new TreeNode(val);
    this.nodes.add(val);

    if (!this.root) {
      this.root = newNode;
      return true;
    }

    let current = this.root;

    while (true) {
      if (val < current.val) {
        if (!current.left) {
          current.left = newNode;
          return true;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          return true;
        }
        current = current.right;
      }
    }
  }

  /* ================= DELETE ================= */

  delete(val) {
    if (!this.nodes.has(val)) return false;

    this.root = this._deleteNode(this.root, val);
    this.nodes.delete(val);
    return true;
  }

  _deleteNode(node, val) {
    if (!node) return null;

    if (val < node.val) {
      node.left = this._deleteNode(node.left, val);
    } 
    else if (val > node.val) {
      node.right = this._deleteNode(node.right, val);
    } 
    else {
      // Case 1: No child
      if (!node.left && !node.right) {
        return null;
      }

      // Case 2: One child
      if (!node.left) return node.right;
      if (!node.right) return node.left;

      // Case 3: Two children
      let successor = node.right;
      while (successor.left) {
        successor = successor.left;
      }

      node.val = successor.val;
      node.right = this._deleteNode(node.right, successor.val);
    }

    return node;
  }

  /* ================= CLONE ================= */

  clone() {
    const newTree = new BinaryTree();
    newTree.root = this._deepClone(this.root);
    newTree.nodes = new Set(this.nodes);
    return newTree;
  }

  _deepClone(node) {
    if (!node) return null;

    const newNode = new TreeNode(node.val);
    newNode.left = this._deepClone(node.left);
    newNode.right = this._deepClone(node.right);
    return newNode;
  }

  /* ================= TRAVERSALS ================= */

  preorder() { return this._traverse(this.root, 'pre'); }
  inorder() { return this._traverse(this.root, 'in'); }
  postorder() { return this._traverse(this.root, 'post'); }
  levelorder() { return this._levelOrder(this.root); }
  morrisInorder() { return this._morrisInorder(this.root); }

  _traverse(node, type, result = []) {
    if (!node) return result;

    if (type === 'pre') result.push(node.val);
    this._traverse(node.left, type, result);
    if (type === 'in') result.push(node.val);
    this._traverse(node.right, type, result);
    if (type === 'post') result.push(node.val);

    return result;
  }

  _levelOrder(root) {
    if (!root) return [];

    const result = [];
    const queue = [root];

    while (queue.length) {
      const node = queue.shift();
      result.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    return result;
  }

  _morrisInorder(root) {
    const result = [];
    let current = root;

    while (current) {
      if (!current.left) {
        result.push(current.val);
        current = current.right;
      } else {
        let pred = current.left;

        while (pred.right && pred.right !== current) {
          pred = pred.right;
        }

        if (!pred.right) {
          pred.right = current;
          current = current.left;
        } else {
          pred.right = null;
          result.push(current.val);
          current = current.right;
        }
      }
    }

    return result;
  }
}