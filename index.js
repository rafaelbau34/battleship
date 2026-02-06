// index.js
import { Player, Ship, Gameboard } from "./classes.js";
import { DOM } from "./dom.js";

const SHIP_TYPES = [
  { name: "Carrier", length: 5 },
  { name: "Battleship", length: 4 },
  { name: "Cruiser", length: 3 },
  { name: "Submarine", length: 3 },
  { name: "Destroyer", length: 2 },
];

let state = {
  player: new Player("REAL"),
  computer: new Player("COMPUTER"),
  isGameOver: false,
  isVertical: false,
  cheatMode: false,
  placedShipNames: [],
};

function init() {
  state = {
    player: new Player("REAL"),
    computer: new Player("COMPUTER"),
    isGameOver: false,
    isVertical: false,
    cheatMode: false,
    placedShipNames: [],
  };

  DOM.toggleScreen("setup");
  DOM.updateMessage("Deploy your fleet into friendly waters.");
  DOM.startBtn.disabled = true;
  DOM.startBtn.classList.add("opacity-50", "cursor-not-allowed");

  // Reset the restart button text to default
  const restartBtn = document.getElementById("restart-btn");
  restartBtn.innerText = "Abort Mission";
  restartBtn.classList.remove("bg-green-700", "hover:bg-green-600");
  restartBtn.classList.add("bg-red-900/40", "hover:bg-red-800");

  refreshUI();
}

function refreshUI() {
  DOM.renderGrid(state.player.gameboard, "player", {
    onDrop: handleDrop,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
  });
  DOM.renderGrid(
    state.computer.gameboard,
    "computer",
    {
      onClick: handleAttack,
    },
    { isGameOver: state.isGameOver, cheatMode: state.cheatMode }
  );
  DOM.renderFleetDock(SHIP_TYPES, state.placedShipNames);
}

// --- SETUP HANDLERS ---

function handleDragOver(x, y) {
  // Clear previous highlights
  handleDragLeave();

  const activeShipName = document.querySelector(".opacity-50")?.innerText;
  if (!activeShipName) return;

  const shipDef = SHIP_TYPES.find((s) => s.name === activeShipName);
  const isValid = state.player.gameboard.isValidPlacement(
    shipDef.length,
    x,
    y,
    state.isVertical
  );

  for (let i = 0; i < shipDef.length; i++) {
    const cx = state.isVertical ? x : x + i;
    const cy = state.isVertical ? y + i : y;
    const cell = document.querySelector(
      `#player-board [data-x="${cx}"][data-y="${cy}"]`
    );
    if (cell) {
      cell.classList.add(isValid ? "bg-sky-400/50" : "bg-red-500/50");
    }
  }
}

function handleDragLeave() {
  document.querySelectorAll("#player-board div").forEach((el) => {
    el.classList.remove("bg-sky-400/50", "bg-red-500/50");
  });
}

function handleDrop(x, y, shipName) {
  handleDragLeave();
  const shipDef = SHIP_TYPES.find((s) => s.name === shipName);
  if (!shipDef || state.placedShipNames.includes(shipName)) return;

  const newShip = new Ship(shipDef.name, shipDef.length);
  if (state.player.gameboard.placeShip(newShip, x, y, state.isVertical)) {
    state.placedShipNames.push(shipName);
    if (state.placedShipNames.length === SHIP_TYPES.length) {
      DOM.startBtn.disabled = false;
      DOM.startBtn.classList.remove("opacity-50", "cursor-not-allowed");
      DOM.updateMessage("Deployment complete. Engage!", "success");
    }
    refreshUI();
  } else {
    DOM.updateMessage("Invalid deployment zone!", "error");
  }
}

document.getElementById("rotate-btn").onclick = () => {
  state.isVertical = !state.isVertical;
  document.getElementById("rotate-btn").innerText = `Axis: ${
    state.isVertical ? "Vertical" : "Horizontal"
  }`;
};

document.getElementById("random-btn").onclick = () => {
  state.player.reset();
  state.placedShipNames = [];
  SHIP_TYPES.forEach((def) => {
    let placed = false;
    while (!placed) {
      const x = Math.floor(Math.random() * 10);
      const y = Math.floor(Math.random() * 10);
      const orient = Math.random() > 0.5;
      placed = state.player.gameboard.placeShip(
        new Ship(def.name, def.length),
        x,
        y,
        orient
      );
    }
    state.placedShipNames.push(def.name);
  });
  DOM.startBtn.disabled = false;
  DOM.startBtn.classList.remove("opacity-50", "cursor-not-allowed");
  DOM.updateMessage("Fleet randomized and ready.", "success");
  refreshUI();
};

document.getElementById("start-btn").onclick = () => {
  SHIP_TYPES.forEach((def) => {
    let placed = false;
    while (!placed) {
      const x = Math.floor(Math.random() * 10);
      const y = Math.floor(Math.random() * 10);
      const orient = Math.random() > 0.5;
      placed = state.computer.gameboard.placeShip(
        new Ship(def.name, def.length),
        x,
        y,
        orient
      );
    }
  });
  DOM.toggleScreen("game");
  DOM.updateMessage("Main Batteries Hot. Attack!");
  refreshUI();
};

// --- GAME HANDLERS ---

function handleAttack(x, y) {
  if (state.isGameOver) return;
  const result = state.computer.gameboard.receiveAttack(x, y);
  if (!result) return;

  refreshUI();
  if (state.computer.gameboard.allShipsSunk()) {
    endGame("VICTORY! Enemy fleet annihilated.");
    return;
  }

  DOM.updateMessage(
    result === "SUNK"
      ? "Target Destroyed!"
      : result === "HIT"
      ? "Direct Hit!"
      : "Splash. Miss.",
    result === "MISS" ? "info" : "success"
  );

  state.isGameOver = true; // Lock
  setTimeout(enemyTurn, 600);
}

function enemyTurn() {
  const attack = state.computer.randomAttack(state.player.gameboard);
  state.isGameOver = false; // Unlock
  refreshUI();

  if (state.player.gameboard.allShipsSunk()) {
    endGame("DEFEAT. Friendly fleet lost.");
    return;
  }

  if (attack.result !== "MISS")
    DOM.updateMessage("Damage Report! We've been hit!", "error");
}

function endGame(msg) {
  state.isGameOver = true;
  DOM.updateMessage(msg, msg.includes("VICTORY") ? "success" : "error");

  // Change button text to New Game
  const restartBtn = document.getElementById("restart-btn");
  restartBtn.innerText = "New Game";
  restartBtn.classList.remove("bg-red-900/40", "hover:bg-red-800");
  restartBtn.classList.add("bg-green-700", "hover:bg-green-600");

  refreshUI();
}

document.getElementById("cheat-btn").onclick = () => {
  state.cheatMode = !state.cheatMode;
  document.getElementById("cheat-btn").classList.toggle("bg-amber-600");
  refreshUI();
};

document.getElementById("restart-btn").onclick = init;

init();
