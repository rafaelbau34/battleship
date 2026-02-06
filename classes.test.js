import { Ship, Gameboard, Player } from "./classes.js";

describe("Ship Factory", () => {
  let ship;

  beforeEach(() => {
    ship = new Ship("Destroyer", 2);
  });

  test("should be initialized with correct length and name", () => {
    expect(ship.length).toBe(2);
    expect(ship.name).toBe("Destroyer");
    expect(ship.hits).toBe(0);
    expect(ship.sunk).toBe(false);
  });

  test("hit() should increment hits", () => {
    ship.hit();
    expect(ship.hits).toBe(1);
  });

  test("isSunk() should return false if hits < length", () => {
    ship.hit();
    expect(ship.isSunk()).toBe(false);
  });

  test("isSunk() should return true if hits >= length", () => {
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
    expect(ship.sunk).toBe(true);
  });
});

describe("Gameboard Factory", () => {
  let board;
  let ship;

  beforeEach(() => {
    board = new Gameboard();
    ship = new Ship("Cruiser", 3);
  });

  test("should place ship at specific coordinates horizontally", () => {
    const placed = board.placeShip(ship, 0, 0);
    expect(placed).toBe(true);
    expect(board.grid[0][0]).toEqual({ ship, hit: false });
    expect(board.grid[0][1]).toEqual({ ship, hit: false });
    expect(board.grid[0][2]).toEqual({ ship, hit: false });
  });

  test("should place ship at specific coordinates vertically", () => {
    const placed = board.placeShip(ship, 0, 0, true);
    expect(placed).toBe(true);
    expect(board.grid[0][0]).toEqual({ ship, hit: false });
    expect(board.grid[1][0]).toEqual({ ship, hit: false });
    expect(board.grid[2][0]).toEqual({ ship, hit: false });
  });

  test("should NOT place ship out of bounds", () => {
    const placed = board.placeShip(ship, 9, 0);
    expect(placed).toBe(false);
  });

  test("receiveAttack should record missed shot", () => {
    const result = board.receiveAttack(0, 0);
    expect(result).toBe("MISS");
    expect(board.missedAttacks).toContainEqual({ x: 0, y: 0 });
  });

  test("allShipsSunk should return true only when all ships are sunk", () => {
    const s1 = new Ship("S1", 1);
    board.placeShip(s1, 0, 0);
    expect(board.allShipsSunk()).toBe(false);
    board.receiveAttack(0, 0);
    expect(board.allShipsSunk()).toBe(true);
  });
});

describe("Player", () => {
  let player;
  let enemyBoard;

  beforeEach(() => {
    player = new Player("COMPUTER");
    enemyBoard = new Gameboard();
  });

  test("Computer should make a random legal move", () => {
    const resultObj = player.randomAttack(enemyBoard);
    expect(resultObj).toHaveProperty("x");
    expect(resultObj).toHaveProperty("y");
    expect(resultObj.result).toBe("MISS");
  });

  test("isValidMove should validate correctly", () => {
    expect(player.isValidMove(11, 0, enemyBoard)).toBe(false); // OOB
    enemyBoard.receiveAttack(0, 0);
    expect(player.isValidMove(0, 0, enemyBoard)).toBe(false); // Already attacked
    expect(player.isValidMove(0, 1, enemyBoard)).toBe(true); // Valid
  });
});
