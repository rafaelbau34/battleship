// classes.js
export class Ship {
  constructor(name, length) {
    this.name = name;
    this.length = length;
    this.hits = 0;
    this.sunk = false;
  }

  hit() {
    this.hits++;
    this.isSunk();
  }

  isSunk() {
    this.sunk = this.hits >= this.length;
    return this.sunk;
  }
}

export class Gameboard {
  constructor(size = 10) {
    this.size = size;
    this.grid = Array(size)
      .fill(null)
      .map(() => Array(size).fill(null));
    this.missedAttacks = [];
    this.ships = [];
  }

  placeShip(ship, x, y, isVertical = false) {
    if (!this.isValidPlacement(ship.length, x, y, isVertical)) {
      return false;
    }

    this.ships.push(ship);
    for (let i = 0; i < ship.length; i++) {
      const currentX = isVertical ? x : x + i;
      const currentY = isVertical ? y + i : y;
      this.grid[currentY][currentX] = { ship: ship, hit: false };
    }
    return true;
  }

  isValidPlacement(length, x, y, isVertical) {
    for (let i = 0; i < length; i++) {
      const curX = isVertical ? x : x + i;
      const curY = isVertical ? y + i : y;

      if (curX < 0 || curX >= this.size || curY < 0 || curY >= this.size)
        return false;
      if (this.grid[curY][curX] !== null) return false;
    }
    return true;
  }

  receiveAttack(x, y) {
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) return false;

    const cell = this.grid[y][x];
    if (cell && cell.hit) return false;
    if (this.missedAttacks.some((m) => m.x === x && m.y === y)) return false;

    if (cell === null) {
      this.missedAttacks.push({ x, y });
      return "MISS";
    } else {
      cell.hit = true;
      cell.ship.hit();
      return cell.ship.sunk ? "SUNK" : "HIT";
    }
  }

  allShipsSunk() {
    return this.ships.length > 0 && this.ships.every((s) => s.isSunk());
  }
}

export class Player {
  constructor(type = "REAL") {
    this.type = type;
    this.gameboard = new Gameboard();
    this.previousHits = [];
  }

  reset() {
    this.gameboard = new Gameboard();
    this.previousHits = [];
  }

  randomAttack(enemyBoard) {
    let x, y, result;
    let found = false;

    // Smart targeting: check neighbors of last hit
    if (this.previousHits.length > 0) {
      const last = this.previousHits[this.previousHits.length - 1];
      const neighbors = [
        { x: last.x + 1, y: last.y },
        { x: last.x - 1, y: last.y },
        { x: last.x, y: last.y + 1 },
        { x: last.x, y: last.y - 1 },
      ].sort(() => Math.random() - 0.5);

      for (const n of neighbors) {
        if (this.isValidMove(n.x, n.y, enemyBoard)) {
          x = n.x;
          y = n.y;
          found = true;
          break;
        }
      }
    }

    if (!found) {
      do {
        x = Math.floor(Math.random() * 10);
        y = Math.floor(Math.random() * 10);
      } while (!this.isValidMove(x, y, enemyBoard));
    }

    result = enemyBoard.receiveAttack(x, y);
    if (result === "HIT") this.previousHits.push({ x, y });
    if (result === "SUNK") this.previousHits = [];
    return { x, y, result };
  }

  isValidMove(x, y, board) {
    if (x < 0 || x >= 10 || y < 0 || y >= 10) return false;
    if (board.missedAttacks.some((m) => m.x === x && m.y === y)) return false;
    if (board.grid[y][x] && board.grid[y][x].hit) return false;
    return true;
  }
}
