// dom.js
export const DOM = {
  playerBoardDiv: document.getElementById("player-board"),
  computerBoardDiv: document.getElementById("computer-board"),
  messageLog: document.getElementById("message-log"),
  shipDock: document.getElementById("ship-dock"),
  startBtn: document.getElementById("start-btn"),

  renderGrid(gameboard, owner, handlers = {}, state = {}) {
    const container =
      owner === "player" ? this.playerBoardDiv : this.computerBoardDiv;
    container.innerHTML = "";

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const cell = document.createElement("div");
        cell.dataset.x = x;
        cell.dataset.y = y;
        cell.className = `w-8 h-8 md:w-10 md:h-10 border border-slate-700 flex items-center justify-center transition-all duration-150`;

        const data = gameboard.grid[y][x];
        const isMiss = gameboard.missedAttacks.some(
          (m) => m.x === x && m.y === y
        );

        // Styling logic
        if (data && data.ship) {
          const isRevealed =
            owner === "player" || state.cheatMode || data.ship.isSunk();
          if (isRevealed) {
            cell.classList.add(
              data.ship.isSunk() ? "bg-slate-700" : "bg-slate-500"
            );
          } else {
            cell.classList.add("bg-slate-800/50");
          }
          if (data.hit) {
            cell.classList.add("bg-red-600", "text-white");
            cell.innerHTML = "✕";
          }
        } else if (isMiss) {
          cell.classList.add("bg-cyan-950");
          cell.innerHTML =
            '<div class="w-2 h-2 rounded-full bg-cyan-500"></div>';
        } else {
          cell.classList.add("bg-slate-800/50");
        }

        // Interaction Handlers
        if (owner === "computer" && handlers.onClick && !state.isGameOver) {
          if (!data?.hit && !isMiss) {
            cell.classList.add("cursor-crosshair", "hover:bg-red-900/40");
            cell.onclick = () => handlers.onClick(x, y);
          }
        }

        if (owner === "player" && handlers.onDrop) {
          cell.ondragover = (e) => {
            e.preventDefault();
            handlers.onDragOver(x, y);
          };
          cell.ondragleave = () => handlers.onDragLeave();
          cell.ondrop = (e) => {
            e.preventDefault();
            const name = e.dataTransfer.getData("text/plain");
            handlers.onDrop(x, y, name);
          };
        }

        container.appendChild(cell);
      }
    }
  },

  renderFleetDock(ships, placedNames) {
    this.shipDock.innerHTML = "";
    ships
      .filter((s) => !placedNames.includes(s.name))
      .forEach((ship) => {
        const shipDiv = document.createElement("div");
        shipDiv.draggable = true;
        // Fixed alignment with flex items-center justify-center and whitespace-nowrap
        shipDiv.className =
          "bg-sky-700 border border-sky-400 p-2 cursor-grab active:cursor-grabbing text-xs font-bold rounded shadow hover:bg-sky-600 transition-colors flex items-center justify-center whitespace-nowrap overflow-hidden";
        shipDiv.style.width = `${ship.length * 3}rem`; // Slightly wider for better text fit
        shipDiv.innerText = ship.name;
        shipDiv.ondragstart = (e) => {
          e.dataTransfer.setData("text/plain", ship.name);
          shipDiv.classList.add("opacity-50");
        };
        shipDiv.ondragend = () => shipDiv.classList.remove("opacity-50");
        this.shipDock.appendChild(shipDiv);
      });
  },

  updateMessage(msg, type = "info") {
    this.messageLog.textContent = msg;
    const colors = {
      error: "text-red-400",
      success: "text-green-400",
      info: "text-slate-300",
    };
    this.messageLog.className = `text-center text-lg font-bold min-h-[2rem] ${
      colors[type] || colors.info
    }`;
  },

  toggleScreen(screenName) {
    document
      .getElementById("setup-controls")
      .classList.toggle("hidden", screenName !== "setup");
    document
      .getElementById("game-controls")
      .classList.toggle("hidden", screenName !== "game");
    document
      .getElementById("dock-container")
      .classList.toggle("hidden", screenName !== "setup");
  },
};
