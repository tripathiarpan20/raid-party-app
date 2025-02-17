import {Node} from './Node.js';
import {DiagonalMovement} from './DiagonalMovement.js';

class Grid {
  /**
   * The Grid class, which serves as the encapsulation of the layout of the nodes.
   * @param {number|Array<Array<(number|boolean)>>} width_or_matrix Number of columns of the grid, or matrix
   * @param {number} height Number of rows of the grid.
   * @param {Array<Array<(number|boolean)>>} [matrix] - A 0-1 matrix
   *     representing the walkable status of the nodes(0 or false for walkable).
   *     If the matrix is not supplied, all the nodes will be walkable.  */
  constructor(width_or_matrix, height, matrix) {
    let width;
    if (typeof width_or_matrix !== 'object') {
      width = width_or_matrix;
    } else {
      height = width_or_matrix.length;
      width = width_or_matrix[0].length;
      matrix = width_or_matrix;
    }

    /**
     * The number of columns of the grid.
     * @type number
     */
    this.width = width;
    /**
     * The number of rows of the grid.
     * @type number
     */
    this.height = height;

    /**
     * A 2D array of nodes.
     */
    this.nodes = this._buildNodes(width, height, matrix);
  }

  /**
   * Build and return the nodes.
   * @private
   * @param {number} width
   * @param {number} height
   * @param {Array<Array<number|boolean>>} [matrix] - A 0-1 matrix representing
   *     the walkable status of the nodes.
   * @see Grid
   */
  _buildNodes(width, height, matrix) {
    let i;
    let j;
    const nodes = new Array(height);

    for (i = 0; i < height; ++i) {
      nodes[i] = new Array(width);
      for (j = 0; j < width; ++j) {
        nodes[i][j] = new Node(j, i);
      }
    }

    if (matrix === undefined) {
      return nodes;
    }

    if (matrix.length !== height || matrix[0].length !== width) {
      throw new Error('Matrix size does not fit');
    }

    for (i = 0; i < height; ++i) {
      for (j = 0; j < width; ++j) {
        if (matrix[i][j]) {
          // 0, false, null will be walkable
          // while others will be un-walkable
          nodes[i][j].walkable = false;
        }
      }
    }

    return nodes;
  }

  getNodeAt(x, y) {
    return this.nodes[y][x];
  }

  /**
   * Determine whether the node at the given position is walkable.
   * (Also returns false if the position is outside the grid.)
   * @param {number} x - The x coordinate of the node.
   * @param {number} y - The y coordinate of the node.
   * @return {boolean} - The walkability of the node.
   */
  isWalkableAt(x, y) {
    return this.isInside(x, y) && this.nodes[y][x].walkable;
  }

  /**
   * Determine whether the position is inside the grid.
   * XXX: `grid.isInside(x, y)` is wierd to read.
   * It should be `(x, y) is inside grid`, but I failed to find a better
   * name for this method.
   * @param {number} x
   * @param {number} y
   * @return {boolean}
   */
  isInside(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /**
   * Set whether the node on the given position is walkable.
   * NOTE: throws exception if the coordinate is not inside the grid.
   * @param {number} x - The x coordinate of the node.
   * @param {number} y - The y coordinate of the node.
   * @param {boolean} walkable - Whether the position is walkable.
   */
  setWalkableAt(x, y, walkable) {
    this.nodes[y][x].walkable = walkable;
  }

  /**
   * Get the neighbors of the given node.
   *
   *     offsets      diagonalOffsets:
   *  +---+---+---+    +---+---+---+
   *  |   | 0 |   |    | 0 |   | 1 |
   *  +---+---+---+    +---+---+---+
   *  | 3 |   | 1 |    |   |   |   |
   *  +---+---+---+    +---+---+---+
   *  |   | 2 |   |    | 3 |   | 2 |
   *  +---+---+---+    +---+---+---+
   *
   *  When allowDiagonal is true, if offsets[i] is valid, then
   *  diagonalOffsets[i] and
   *  diagonalOffsets[(i + 1) % 4] is valid.
   * @param {Node} node
   * @param {DiagonalMovement} diagonalMovement
   */
  getNeighbors(node, diagonalMovement) {
    const x = node.x;
    const y = node.y;
    const neighbors = [];
    let s0 = false;
    let d0 = false;
    let s1 = false;
    let d1 = false;
    let s2 = false;
    let d2 = false;
    let s3 = false;
    let d3 = false;
    const nodes = this.nodes;

    // ↑
    if (this.isWalkableAt(x, y - 1)) {
      neighbors.push(nodes[y - 1][x]);
      s0 = true;
    }
    // →
    if (this.isWalkableAt(x + 1, y)) {
      neighbors.push(nodes[y][x + 1]);
      s1 = true;
    }
    // ↓
    if (this.isWalkableAt(x, y + 1)) {
      neighbors.push(nodes[y + 1][x]);
      s2 = true;
    }
    // ←
    if (this.isWalkableAt(x - 1, y)) {
      neighbors.push(nodes[y][x - 1]);
      s3 = true;
    }

    if (diagonalMovement === DiagonalMovement.Never) {
      return neighbors;
    }

    if (diagonalMovement === DiagonalMovement.OnlyWhenNoObstacles) {
      d0 = s3 && s0;
      d1 = s0 && s1;
      d2 = s1 && s2;
      d3 = s2 && s3;
    } else if (diagonalMovement === DiagonalMovement.IfAtMostOneObstacle) {
      d0 = s3 || s0;
      d1 = s0 || s1;
      d2 = s1 || s2;
      d3 = s2 || s3;
    } else if (diagonalMovement === DiagonalMovement.Always) {
      d0 = true;
      d1 = true;
      d2 = true;
      d3 = true;
    } else {
      throw new Error('Incorrect value of diagonalMovement');
    }

    // ↖
    if (d0 && this.isWalkableAt(x - 1, y - 1)) {
      neighbors.push(nodes[y - 1][x - 1]);
    }
    // ↗
    if (d1 && this.isWalkableAt(x + 1, y - 1)) {
      neighbors.push(nodes[y - 1][x + 1]);
    }
    // ↘
    if (d2 && this.isWalkableAt(x + 1, y + 1)) {
      neighbors.push(nodes[y + 1][x + 1]);
    }
    // ↙
    if (d3 && this.isWalkableAt(x - 1, y + 1)) {
      neighbors.push(nodes[y + 1][x - 1]);
    }

    return neighbors;
  }

  /**
   * Get a clone of this grid.
   * @return {Grid} Cloned grid.
   */
  clone() {
    let i;
    let j;
    const width = this.width;
    const height = this.height;
    const thisNodes = this.nodes;
    const newGrid = new Grid(width, height);
    const newNodes = new Array(height);

    for (i = 0; i < height; ++i) {
      newNodes[i] = new Array(width);
      for (j = 0; j < width; ++j) {
        newNodes[i][j] = new Node(j, i, thisNodes[i][j].walkable);
      }
    }

    newGrid.nodes = newNodes;

    return newGrid;
  }
}

export {Grid};
