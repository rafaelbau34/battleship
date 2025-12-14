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
