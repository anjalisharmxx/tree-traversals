import { useState, useEffect, useRef, useCallback } from 'react';
import { BinaryTree } from './Tree';
import './App.css';

function App() {
  const [tree, setTree] = useState(new BinaryTree());
  const [inputValue, setInputValue] = useState('');
  const [isInserting, setIsInserting] = useState(false);
  const [result, setResult] = useState([]);
  const [traversal, setTraversal] = useState('');
  const [path, setPath] = useState([]);
  const [activeNode, setActiveNode] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(600);
  const [stats, setStats] = useState({ nodes: 0, height: 0 });

  const svgRef = useRef(null);

  /* ================= INSERT ================= */

  const addNodeWithAnimation = useCallback(async () => {
    if (!inputValue.trim() || isInserting || isAnimating) return;
    const val = parseInt(inputValue);
    if (isNaN(val) || tree.nodes.has(val)) return;

    setIsInserting(true);

    const insertionPath = [];
    let current = tree.root;

    while (current) {
      insertionPath.push(current.val);
      if (val < current.val) {
        if (!current.left) break;
        current = current.left;
      } else {
        if (!current.right) break;
        current = current.right;
      }
    }

    setPath(insertionPath);
    await new Promise(res => setTimeout(res, 800));

    const newTree = tree.clone();
    newTree.insert(val);

    setTree(newTree);
    updateStats(newTree.root);

    setPath([]);
    setInputValue('');
    setIsInserting(false);
  }, [tree, inputValue, isInserting, isAnimating]);

  /* ================= DELETE ================= */

  const deleteNodeWithAnimation = useCallback(async () => {
    const val = parseInt(inputValue);
    if (isNaN(val) || !tree.nodes.has(val) || isAnimating) return;

    setIsAnimating(true);
    setActiveNode(val);

    await new Promise(res => setTimeout(res, 800));

    const newTree = tree.clone();
    newTree.delete(val);

    setTree(newTree);
    updateStats(newTree.root);

    setActiveNode(null);
    setInputValue('');
    setIsAnimating(false);
  }, [tree, inputValue, isAnimating]);

  /* ================= TRAVERSAL ANIMATION ================= */

  const runTraversal = useCallback(async (type) => {
    if (isAnimating) return;

    const methods = {
      pre: () => tree.preorder(),
      in: () => tree.inorder(),
      post: () => tree.postorder(),
      level: () => tree.levelorder(),
      morris: () => tree.morrisInorder()
    };

    const traversalResult = methods[type]();

    setTraversal(type);
    setResult([]);
    setIsAnimating(true);

    for (let value of traversalResult) {
      setActiveNode(value);
      setResult(prev => [...prev, value]);
      await new Promise(res => setTimeout(res, animationSpeed));
    }

    setActiveNode(null);
    setIsAnimating(false);

  }, [tree, animationSpeed, isAnimating]);

  /* ================= STATS ================= */

  const updateStats = useCallback((root) => {
    const countNodes = (node) =>
      node ? 1 + countNodes(node.left) + countNodes(node.right) : 0;

    const getHeight = (node) =>
      node ? 1 + Math.max(getHeight(node.left), getHeight(node.right)) : 0;

    setStats({
      nodes: countNodes(root),
      height: getHeight(root)
    });
  }, []);

  const sampleTree = useCallback(() => {
    const t = new BinaryTree();
    [50, 30, 70, 20, 40, 60, 80, 25].forEach(val => t.insert(val));
    setTree(t);
    updateStats(t.root);
  }, [updateStats]);

  /* ================= DRAW TREE ================= */

  const drawTree = useCallback(() => {
    if (!tree.root || !svgRef.current) return;

    const svg = svgRef.current;
    svg.innerHTML = '';

    const drawNode = (node, x, y, dx) => {
      if (!node) return;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', 28);

      const fillColor =
        node.val === activeNode
          ? '#ff4757'
          : path.includes(node.val)
          ? '#ffd700'
          : '#667eea';

      circle.setAttribute('fill', fillColor);
      circle.setAttribute('stroke', 'white');
      circle.setAttribute('stroke-width', '3');
      svg.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', y + 6);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', 'white');
      text.setAttribute('font-weight', 'bold');
      text.textContent = node.val;
      svg.appendChild(text);

      if (node.left) {
        const childX = x - dx / 2;
        const childY = y + 90;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', y + 28);
        line.setAttribute('x2', childX);
        line.setAttribute('y2', childY - 28);
        line.setAttribute('stroke', '#4fc3f7');
        svg.appendChild(line);

        drawNode(node.left, childX, childY, dx / 2);
      }

      if (node.right) {
        const childX = x + dx / 2;
        const childY = y + 90;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', y + 28);
        line.setAttribute('x2', childX);
        line.setAttribute('y2', childY - 28);
        line.setAttribute('stroke', '#4fc3f7');
        svg.appendChild(line);

        drawNode(node.right, childX, childY, dx / 2);
      }
    };

    drawNode(tree.root, 500, 60, 350);

  }, [tree.root, path, activeNode]);

  useEffect(() => {
    sampleTree();
  }, []);

  useEffect(() => {
    drawTree();
  }, [drawTree]);

  /* ================= UI ================= */

  return (
    <div className="app-wrapper">

      <div className="control-panel">
        <div className="input-section">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value"
            className="input-field"
          />
          <button onClick={addNodeWithAnimation} className="add-button">Insert</button>
          <button onClick={deleteNodeWithAnimation} className="reset-button">Delete</button>
          <button onClick={sampleTree} className="reset-button">Reset</button>
        </div>

        <div>
          Speed:
          <input
            type="range"
            min="200"
            max="1500"
            step="100"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="tree-container">
        <div className="svg-container">
          <svg ref={svgRef} width="1000" height="500" />
        </div>
      </div>

      <div className="traversal-panel">
        {['pre', 'in', 'post', 'level', 'morris'].map((type) => (
          <button
            key={type}
            onClick={() => runTraversal(type)}
            disabled={isAnimating}
            className="traversal-btn"
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {traversal && (
        <div className="result-panel">
          <h3>{traversal.toUpperCase()} Result:</h3>
          <div className="result-list">
            {result.map((val, i) => (
              <span key={i} className="result-item">{val}</span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default App;