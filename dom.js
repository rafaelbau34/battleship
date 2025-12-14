export const DOM = {
  boardsContainer: document.getElementById("boards-container"),
  playerBoardDiv: document.getElementById("player-board"),
  computerBoardDiv: document.getElementById("computer-board"),
  messageLog: document.getElementById("message-log"),
  shipDock: document.getElementById("ship-dock"),
  rotateBtn: document.getElementById("rotate-btn"),

  renderGrid(gameboard, owner, cellCallback = null) {
    const container =
      owner === "player" ? this.playerBoardDiv : this.computerBoardDiv;
    container.innerHTML = "";

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const cell = document.createElement("div");
        cell.dataset.x = x;
        cell.dataset.y = y;
        cell.dataset.owner = owner;

        cell.className = `
          w-8 h-8 md:w-10 md:h-10 border border-slate-700 transition-colors duration-200
          flex items-center justify-center cursor-pointer select-none
        `;

        const gridData = gameboard.grid[y][x];

        if (gridData && gridData.ship) {
          if (owner === "player" || gridData.ship.isSunk()) {
            cell.classList.add("bg-slate-500");
            cell.classList.add("border-slate-400");
            if (gridData.ship.isSunk()) {
              cell.classList.add("opacity-50"); // Dim sunk ships
            }
          }
        } else {
          cell.classList.add("bg-slate-800/50");
        }

        if (gridData && gridData.hit) {
          cell.classList.remove("bg-slate-500", "bg-slate-800/50");
          cell.classList.add("bg-red-500"); // Hit!
          cell.innerHTML = "✕";
        }

        const isMiss = gameboard.missedAttacks.some(
          (m) => m.x === x && m.y === y
        );
        if (isMiss) {
          cell.classList.remove("bg-slate-800/50");
          cell.classList.add("bg-cyan-900"); // Miss
          cell.innerHTML = "•";
        }

        if (owner === "computer" && cellCallback) {
          cell.addEventListener("click", () => cellCallback(x, y));
          if (!gridData?.hit && !isMiss) {
            cell.classList.add("hover:bg-red-900/50");
          }
        }

        if (owner === "player" && cellCallback) {
          cell.addEventListener("dragover", (e) => e.preventDefault());
          cell.addEventListener("drop", (e) => {
            e.preventDefault();
            const shipName = e.dataTransfer.getData("text/plain");
            cellCallback(x, y, shipName);
          });
        }

        container.appendChild(cell);
      }
    }
  },

  renderFleetDock(ships) {
    this.shipDock.innerHTML = "";
    ships.forEach((ship) => {
      const shipDiv = document.createElement("div");
      shipDiv.draggable = true;
      shipDiv.dataset.name = ship.name;
      shipDiv.dataset.length = ship.length;

      shipDiv.className = `
            bg-slate-600 border border-slate-400 p-2 cursor-grab active:cursor-grabbing
            text-xs font-bold text-center rounded shadow-lg hover:bg-slate-500
        `;
      shipDiv.style.width = `${ship.length * 2.5}rem`; // rough visual scaling
      shipDiv.innerText = `${ship.name} (${ship.length})`;

      shipDiv.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", ship.name);
        shipDiv.classList.add("opacity-50");
      });

      shipDiv.addEventListener("dragend", () => {
        shipDiv.classList.remove("opacity-50");
      });

      this.shipDock.appendChild(shipDiv);
    });
  },

  updateMessage(msg, type = "info") {
    this.messageLog.textContent = msg;
    this.messageLog.className = "text-center text-lg font-bold min-h-[2rem] ";

    if (type === "error") this.messageLog.classList.add("text-red-400");
    else if (type === "success")
      this.messageLog.classList.add("text-green-400");
    else this.messageLog.classList.add("text-slate-200");
  },

  toggleScreen(screenName) {
    const setupScreen = document.getElementById("setup-controls");
    const gameScreen = document.getElementById("game-controls");
    const dock = document.getElementById("dock-container");

    if (screenName === "setup") {
      setupScreen.classList.remove("hidden");
      gameScreen.classList.add("hidden");
      dock.classList.remove("hidden");
    } else {
      setupScreen.classList.add("hidden");
      gameScreen.classList.remove("hidden");
      dock.classList.add("hidden");
    }
  },
};
