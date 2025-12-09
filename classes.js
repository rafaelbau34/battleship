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

    ship.position = { x, y, isVertical };
    this.ships.push(ship);

    for (let i = 0; i < ship.length; i++) {
      const currentX = isVertical ? x : x + 1;
      const currentY = isVertical ? y + i : y;
      this.grid[currentY][currentX] = { ship: ship, hit: false };
    }
    return true;
  }

  receiveAttack(x, y) {
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) return false;

    const cell = this.grid[y][x];
    if (this.missedAttacks.some((coord) => coord.x === x && coord.y === y)) {
      return false;
    }

    if (cell && cell.hit) {
      return false;
    }

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
    return this.ships.length > 0 && this.ships.every((ship) => ship.isSunk());
  }
}
