// javascript-astar 0.4.1
// http://github.com/bgrins/javascript-astar
// Freely distributable under the MIT License.
// Implements the astar search algorithm in javascript using a Binary Heap.

// Includes Binary Heap (with modifications) from Marijn Haverbeke.
// http://eloquentjavascript.net/appendix2.htmlimport

// Updated to typescript by Silent Echo

import type { Point, Vector2 } from "./vector2";

export const pathTo = (node: GridNode) => {
  let curr = node;
  let path: GridNode[] = [];
  while (curr.parent) {
    path.unshift(curr);
    curr = curr.parent;
  }
  console.log("pathTo output", path);
  return path;
};

export const aStar = {
  /**
  * Perform an A* Search on a graph given a start and end node.
  * @param {Graph} graph
  * @param {GridNode} start
  * @param {GridNode} end
  * @param {Object} [options]
  * @param {bool} [options.closest] Specifies whether to return the
             path to the closest node if the target is unreachable.
  * @param {Function} [options.heuristic] Heuristic function (see
  *          astar.heuristics).
  */
  search: (
    graph: Graph,
    start: GridNode,
    end: GridNode,
    options: {
      closest?: boolean;
      heuristic?: (pos0: Point, pos1: Point) => number;
    } = {}
  ) => {
    graph.cleanDirty();
    let heuristic = options?.heuristic || aStar.heuristics.manhattan;
    let closest = options?.closest || false;
    let openHeap = BinaryHeap.getHeap();
    let closestNode = start; // set the start node to be the closest if required

    console.log(
      "search input",
      graph,
      heuristic,
      "closest:",
      closest,
      openHeap,
      closestNode
    );
    start.h = heuristic(start, end);
    graph.markDirty(start);

    openHeap.push(start);

    while (openHeap.size() > 0) {
      console.log(`Next loop. ${openHeap.size()} remaining on heap.`);
      // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
      var currentNode = openHeap.pop();

      console.log(
        `Check end case. current: ${currentNode.toString()} target: ${end.toString()}`
      );
      // End case -- result has been found, return the traced path.
      if (currentNode === end) {
        console.log("result: end case");
        return pathTo(currentNode);
      }

      // Normal case -- move currentNode from open to closed, process each of its neighbors.
      currentNode.closed = true;
      console.log(
        `Normal case. Node ${currentNode.toString()} closed. Looking for neighbors.`
      );

      // Find all neighbors for the current node.
      let neighbors = graph.neighbors(currentNode);

      for (var i = 0, il = neighbors.length; i < il; ++i) {
        let neighbor = neighbors[i];

        if (neighbor.closed || neighbor.isWall()) {
          // Not a valid node to process, skip to next neighbor.
          continue;
        }

        // The g score is the shortest distance from start to current node.
        // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
        let gScore = currentNode.g + neighbor.getCost(currentNode);
        let beenVisited = neighbor.visited;

        if (!beenVisited || gScore < neighbor.g) {
          // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
          neighbor.visited = true;
          neighbor.parent = currentNode;
          neighbor.h = neighbor.h || heuristic(neighbor, end);
          neighbor.g = gScore;
          neighbor.f = neighbor.g + neighbor.h;
          graph.markDirty(neighbor);
          if (closest) {
            // If the neighbor is closer than the current closestNode or if it's equally close but has
            // a cheaper path than the current closest node then it becomes the closest node
            if (
              neighbor.h < closestNode.h ||
              (neighbor.h === closestNode.h && neighbor.g < closestNode.g)
            ) {
              closestNode = neighbor;
            }
          }

          if (!beenVisited) {
            // Pushing to heap will put it in proper place based on the 'f' value.
            openHeap.push(neighbor);
          } else {
            // Already seen the node, but since it has been re-scored we need to reorder it in the heap
            openHeap.rescoreElement(neighbor);
          }
        }
      }
    }

    if (closest) {
      console.log("result: closest");
      return pathTo(closestNode);
    }

    console.log("result: none");
    // No result was found - empty array signifies failure to find path.
    return [];
  },
  heuristics: {
    manhattan: function (pos0: Point, pos1: Point): number {
      var d1 = Math.abs(pos1.x - pos0.x);
      var d2 = Math.abs(pos1.y - pos0.y);
      return d1 + d2;
    },
    diagonal: function (pos0: Point, pos1: Point): number {
      var D = 1;
      var D2 = Math.sqrt(2);
      var d1 = Math.abs(pos1.x - pos0.x);
      var d2 = Math.abs(pos1.y - pos0.y);
      return D * (d1 + d2) + (D2 - 2 * D) * Math.min(d1, d2);
    },
  },
};

export class GridNode {
  x: number;
  y: number;
  f?: number;
  g?: number;
  h?: number;
  closed?: boolean;
  visited?: boolean;
  parent: GridNode;

  weight: number;
  getCost: (fromNeighbor) => number;
  isWall: () => boolean;
  clean: () => void;

  constructor(x: number, y: number, weight: number) {
    this.x = x;
    this.y = y;
    this.weight = weight;
    this.toString = () => "[" + this.x + " " + this.y + "]";
    this.getCost = (fromNeighbor): number => {
      // Take diagonal weight into consideration.
      if (
        fromNeighbor &&
        fromNeighbor.x != this.x &&
        fromNeighbor.y != this.y
      ) {
        return this.weight * 1.41421;
      }
      return this.weight;
    };
    this.isWall = () => this.weight === 0;
    this.clean = () => {
      this.f = 0;
      this.g = 0;
      this.h = 0;
      this.visited = false;
      this.closed = false;
      this.parent = null;
    };
  }
}

export class BinaryHeap {
  content: any[];
  scoreFunction: (node: GridNode) => number;
  push: (node: GridNode) => void;
  pop: () => any;
  sinkDown: (n: number) => void;
  bubbleUp: (n: number) => void;
  remove: (node: GridNode) => void;
  size: () => number;
  rescoreElement: (node: GridNode) => void;

  constructor(scoreFunction) {
    this.content = [];
    this.scoreFunction = scoreFunction;
    this.push = (node) => {
      // Add the new element to the end of the array.
      this.content.push(node);

      // Allow it to sink down.
      this.sinkDown(this.content.length - 1);
    };
    this.pop = () => {
      // Store the first element so we can return it later.
      let result = this.content[0];

      // Get the element at the end of the array.
      let end = this.content.pop();

      // If there are any elements left, put the end element at the
      // start, and let it bubble up.
      if (this.content.length > 0) {
        this.content[0] = end;
        this.bubbleUp(0);
      }
      return result;
    };
    this.remove = (node) => {
      var i = this.content.indexOf(node);

      // When it is found, the process seen in 'pop' is repeated
      // to fill up the hole.
      var end = this.content.pop();

      if (i !== this.content.length - 1) {
        this.content[i] = end;

        if (this.scoreFunction(end) < this.scoreFunction(node)) {
          this.sinkDown(i);
        } else {
          this.bubbleUp(i);
        }
      }
    };
    this.size = () => this.content.length;
    this.rescoreElement = (node) => {
      this.sinkDown(this.content.indexOf(node));
    };
    this.sinkDown = (n: number) => {
      // Fetch the element that has to be sunk.
      let element = this.content[n];

      // When at 0, an element can not sink any further.
      while (n > 0) {
        // Compute the parent element's index, and fetch it.
        let parentN = ((n + 1) >> 1) - 1;
        let parent = this.content[parentN];

        // Swap the elements if the parent is greater.
        if (this.scoreFunction(element) < this.scoreFunction(parent)) {
          this.content[parentN] = element;
          this.content[n] = parent;

          // Update 'n' to continue at the new position.
          n = parentN;
        }
        // Found a parent that is less, no need to sink any further.
        else {
          break;
        }
      }
    };
    this.bubbleUp = (n: number) => {
      //Look up the target element and its score.
      let length = this.content.length;
      let element = this.content[n];
      let elemScore = this.scoreFunction(element);

      while (true) {
        //Compute the indices of the child elements.
        let child2N = (n + 1) << 1;
        let child1N = child2N - 1;

        //This is used to store the new position of the element, if any.
        let swap = null;
        let child1Score: number;

        // If the first child exists (is inside the array)...
        if (child1N < length) {
          // Look it up and compute its score.
          let child1 = this.content[child1N];
          child1Score = this.scoreFunction(child1);

          // If the score is less than our element's, we need to swap.
          if (child1Score < elemScore) {
            swap = child1N;
          }
        }

        // Do the same checks for the other child.
        if (child2N < length) {
          // Look it up and compute its score.
          let child2 = this.content[child2N];
          let child2Score = this.scoreFunction(child2);

          // If the score is less than our element's, we need to swap.
          if (child2Score < (swap === null ? elemScore : child1Score)) {
            swap = child2N;
          }
        }

        // If the element needs to be moved, swap it, and continue.
        if (swap !== null) {
          this.content[n] = this.content[swap];
          this.content[swap] = element;
          n = swap;
        }
        // Otherwise, we are done.
        else {
          break;
        }
      }
    };
  }

  static getHeap() {
    return new BinaryHeap((node: GridNode) => node.f);
  }
}

export class Graph {
  nodes: GridNode[];
  diagonal: boolean;
  grid: GridNode[][];
  dirtyNodes: GridNode[];
  cleanDirty: () => void;
  markDirty: (node: GridNode) => void;
  neighbors: (node: GridNode) => GridNode[];

  constructor(
    gridIn: number[][],
    options: { diagonal?: boolean } = { diagonal: false }
  ) {
    this.nodes = [];
    this.diagonal = !!options.diagonal;
    this.grid = [];
    for (var x = 0; x < gridIn.length; x++) {
      this.grid[x] = [];

      for (var y = 0, row = gridIn[x]; y < row.length; y++) {
        var node = new GridNode(x, y, row[y]);
        this.grid[x][y] = node;
        this.nodes.push(node);
      }
    }
    this.cleanDirty = () => {
      this.dirtyNodes.map((node) => node.clean());
    };
    this.markDirty = (node) => {
      this.dirtyNodes.push(node);
    };
    this.neighbors = (node) => {
      let arr: GridNode[] = [];
      let x = node.x;
      let y = node.y;
      let grid = this.grid;

      //West
      if (grid[x - 1] && grid[x - 1][y]) {
        arr.push(grid[x - 1][y]);
      }

      // East
      if (grid[x + 1] && grid[x + 1][y]) {
        arr.push(grid[x + 1][y]);
      }

      // South
      if (grid[x] && grid[x][y - 1]) {
        arr.push(grid[x][y - 1]);
      }

      // North
      if (grid[x] && grid[x][y + 1]) {
        arr.push(grid[x][y + 1]);
      }

      if (this.diagonal) {
        // Southwest
        if (grid[x - 1] && grid[x - 1][y - 1]) {
          arr.push(grid[x - 1][y - 1]);
        }

        // Southeast
        if (grid[x + 1] && grid[x + 1][y - 1]) {
          arr.push(grid[x + 1][y - 1]);
        }

        // Northwest
        if (grid[x - 1] && grid[x - 1][y + 1]) {
          arr.push(grid[x - 1][y + 1]);
        }

        // Northeast
        if (grid[x + 1] && grid[x + 1][y + 1]) {
          arr.push(grid[x + 1][y + 1]);
        }
      }

      return arr;
    };
    this.toString = () => {
      let graphString = [];
      let nodes = this.grid;
      for (let x = 0; x < nodes.length; x++) {
        let rowDebug = [];
        let row = nodes[x];
        for (var y = 0; y < row.length; y++) {
          rowDebug.push(row[y].weight);
        }
        graphString.push(rowDebug.join(" "));
      }
      return graphString.join("\n");
    };

    //init
    this.dirtyNodes = [];
    this.nodes.map((node) => node.clean());
  }
}
