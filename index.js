import { Player, Ship, Gameboard } from "./classes";
import { DOM } from "./dom";

const state = {
  player: new Player("REAL"),
  computer: new Player("COMPUTER"),
  isGameOver: false,
  isVertical: false,
  shipsToPlace: [
    { name: "Carrier", length: 5 },
    { name: "Battleship", length: 4 },
    { name: "Cruiser", length: 3 },
    { name: "Submarine", length: 3 },
    { name: "Destroyer", length: 2 },
  ],
  placedShips: [],
};

function init() {
  state.player.reset();
  state.computer.reset();
  state.isGameOver = false;
  state.placedShips = [];

  DOM.toggleScreen("setup");
  DOM.updateMessage("Place your fleet! Drag ships to the board.", "info");

  DOM.renderGrid(state.player.gameboard, "player", handleDrop);
  DOM.renderGrid(state.computer.gameboard, "computer");
  DOM.renderFleetDock(state.shipsToPlace);
}

document.getElementById("rotate-btn").addEventListener("click", () => {
  state.isVertical = !state.isVertical;
  const btn = document.getElementById("rotate-btn");
  btn.textContent = state.isVertical ? "Axis: Vertical" : "Axis: Horizontal";
  btn.classList.toggle("bg-slate-600");
  btn.classList.toggle("bg-blue-600");
});

document.getElementById("random-btn").addEventListener("click", () => {
  placeRandomly(state.player);
  state.placedShips = [...state.shipsToPlace];
  DOM.renderGrid(state.player.gameboard, "player", handleDrop);
  DOM.renderFleetDock([]);
  checkSetupComplete();
});

function handleDrop(x, y, shipName) {
  const shipDef = state.shipsToPlace.findLast((s) => s.name === shipName);
  if (!shipDef) return;

  const newShip = new Ship(shipDef.name, shipDef.length);

  const success = state.player.gameboard.placeShip(
    newShip,
    x,
    y,
    state.isVertical
  );

  if (success) {
    state.placedShips.push(shipDef);
    const remaining = state.shipsToPlace.filter(
      (s) => !state.placedShips.includes(s)
    );

    DOM.renderGrid(state.player.gameboard, "player", handleDrop);
    DOM.renderFleetDock(remaining);
    checkSetupComplete();
  } else {
    DOM.updateMessage("Invalid placement! Overlap or out of bounds.", "error");
    setTimeout(
      () => DOM.updateMessage("Place your fleet! Drag ships to the board."),
      2000
    );
  }
}

function checkSetupComplete() {
  if (state.placedShips.length === state.shipsToPlace.length) {
    document.getElementById("start-btn").disabled = false;
    document
      .getElementById("start-btn")
      .classList.remove("opacity-50", "cursor-not-allowed");
    DOM.updateMessage("Fleet ready! Press Start.", "success");
  }
}

document.getElementById("start-btn").addEventListener("click", () => {
  placeRandomly(state.computer);

  DOM.toggleScreen("game");
  DOM.updateMessage("Combat Started! Attack the enemy waters");

  DOM.renderGrid(state.computer.gameboard, "computer", handlePlayerAttack);
});

function handlePlayerAttack(x, y) {
  if (state.isGameOver) return;
  const result = state.computer.gameboard.receiveAttack(x, y);

  if (result === false) {
    return;
  }

  DOM.renderGrid(state.computer.gameboard, "computer", handlePlayerAttack);

  if (state.computer.gameboard.allShipsSunk()) {
    endGame("YOU WON!");
    return;
  }

  if (result === "SUNK") DOM.updateMessage("You SUNK an enemy ship!", "succes");
  else if (result === "HIT") DOM.updateMessage("It's a HIT, 'success");
  else DOM.updateMessage("You missed.", "info");

  state.isGameOver = true;
  setTimeout(computerTurn, 800);
}

function computerTurn() {
  const attackData = state.computer.randomAttack(state.player.gameboard);

  DOM.renderGrid(state.player.gameboard, "player", handleDrop);

  if (state.player.gameboard.allShipsSunk()) {
    endGame("COMPUTER WON!");
    return;
  }

  state.isGameOver = false;
  DOM.updateMessage(
    attackData.result === "MISS"
      ? "Enemy missed! Your turn"
      : "Enemy HIT your ship!",
    attackData.result !== "MISS" ? "error" : "info"
  );
}

function endGame(winnerMsg) {
  state.isGameOver = true;
  DOM.updateMessage(
    `GAME OVER! ${winnerMsg}`,
    winnerMsg.includes("YOU") ? "success" : "error"
  );
}

document.getElementById("restart-btn").addEventListener("click", () => {
  window.location.reload();
});

function placeRandomly(player) {
  player.gameboard = new Gameboard();

  const ships = [
    new Ship("Carrier", 5),
    new Ship("Battleship", 4),
    new Ship("Cruiser", 3),
    new Ship("Submarine", 3),
    new Ship("Destroyer", 2),
  ];

  ships.forEach((ship) => {
    let placed = false;
    while (!placed) {
      const x = Math.floor(Math.random() * 10);
      const y = Math.floor(Math.random() * 10);
      const isVertical = Math.random() < 0.5;
      placed = player.gameboard.placeShip(ship, x, y, isVertical);
    }
  });
}

init();
