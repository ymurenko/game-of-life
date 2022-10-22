import React, { useState, useRef, useEffect, useCallback } from "react";
import "./LifeGrid.scss";
import gliderGun from "../../Constructs/gliderGun.json";

/***************************** RULES OF CONWAY'S GAME OF LIFE: **********************************
  1. Any live cell with two or three live neighbours survives.
  2. Any dead cell with three live neighbours becomes a live cell.
  3. All other live cells die in the next generation. Similarly, all other dead cells stay dead.
*************************************************************************************************/

const GRID_WIDTH = 40;
const GRID_HEIGHT = 20;
const CELL_FILL_DEAD = { fill: "rgb(0,75,120)" };

const CellStatus = {
  ALIVE: true,
  DEAD: false,
};

export default function LifeGrid() {
  const gridWrapper = useRef();
  const indexGrid = useRef();
  const divGrid = useRef();
  const numAlive = useRef(0);
  const tickInterval = useRef();
  const [autoTick, setAutoTick] = useState(true);
  const [grid, setGrid] = useState();

  // Check if a cell is alive on the currently rendered grid
  const isAlive = (x, y) => {
    if (
      indexGrid.current[x] !== undefined &&
      indexGrid.current[x][y] !== undefined
    ) {
      return indexGrid.current[x][y];
    }
    return false;
  };

  const setCellColor = (count, x, y) => {
    const bias = count / 7;
    const red = bias * 255;
    if (
      indexGrid.current[x] !== undefined &&
      indexGrid.current[x][y] !== undefined
    ) {
      divGrid.current[x][y].children[0].style.fill = `rgb(${red}, ${
        red + 75
      }, ${120})`;
      if (!isAlive(x, y)) {
        divGrid.current[x][y].children[0].style.width = "35%";
        divGrid.current[x][y].children[0].style.height = "35%";
      } else {
        divGrid.current[x][y].children[0].style.width = `${35 + bias * 100}%`;
        divGrid.current[x][y].children[0].style.height = `${35 + bias * 100}%`;
      }
    }
  };

  const toggleCellState = useCallback(
    (cell) => {
      // const rgb = (numAlive.current / (GRID_HEIGHT * GRID_WIDTH)) * 500;
      const x = parseInt(cell.getAttribute("row"));
      const y = parseInt(cell.getAttribute("col"));
      cell.classList.toggle("alive");
      if (
        indexGrid.current[x] !== undefined &&
        indexGrid.current[x][y] !== undefined
      ) {
        if(isAlive(x,y)){
          divGrid.current[x][y].children[0].style.width = "100%";
          divGrid.current[x][y].children[0].style.height = "100%";
        } else {
          divGrid.current[x][y].children[0].style.width = "35%";
          divGrid.current[x][y].children[0].style.height = "35%";
        }
      }
      // if(!cell.classList.contains("alive")){
      //   cell.children[0].style = CELL_FILL_DEAD
      // }
      // cell.children[0].style.fill = `rgb(${rgb}, ${126}, ${
      //   126
      // })`;
      // cell.classList.toggle("dead");
    },
    []
  );

  const handleCellClick = useCallback(
    (e) => {
      const x = parseInt(e.target.getAttribute("row"));
      const y = parseInt(e.target.getAttribute("col"));
      if (
        divGrid.current[x] !== undefined &&
        divGrid.current[x][y] !== undefined
      ) {
        indexGrid.current[x][y] = !indexGrid.current[x][y];
        toggleCellState(divGrid.current[x][y]);
      }
    },
    [toggleCellState]
  );

  const initGrid = useCallback(() => {
    numAlive.current = 0;
    indexGrid.current = [...Array(GRID_HEIGHT)].map(() =>
      Array(GRID_WIDTH).fill(CellStatus.DEAD)
    );
    divGrid.current = [...Array(GRID_HEIGHT)].map(() => Array(GRID_WIDTH));
    let col = [];
    let row = [];
    for (let x = 0; x < GRID_HEIGHT; x++) {
      for (let y = 0; y < GRID_WIDTH; y++) {
        col.push(
          <div
            key={`${x}, ${y}`}
            className={"grid-item"}
            row={x}
            col={y}
            ref={(ref) => (divGrid.current[x][y] = ref)}
            onMouseOver={(e) => handleCellClick(e)}
          >
            <svg
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
              style={CELL_FILL_DEAD}
            >
              <circle cx="50" cy="50" r="50" />
            </svg>
          </div>
        );
      }
      row.push(col);
      col = [];
    }
    setGrid(row);
  }, [handleCellClick]);

  useEffect(() => {
    initGrid();
  }, []);

  useEffect(() => {
    if (autoTick) {
      tickInterval.current = setInterval(() => updateGrid(), 250);
    } else {
      clearInterval(tickInterval.current);
    }
    return () => {
      clearInterval(tickInterval.current);
    };
  }, [autoTick]);

  // Uses a deep copy of the grid and calculates the next generation
  const updateGrid = () => {
    let newIndexGrid = JSON.parse(JSON.stringify(indexGrid.current));
    newIndexGrid.forEach((col, x) => {
      col.forEach((_, y) => {
        const liveNeighbours = numLiveNeighbours(x, y);
        setCellColor(liveNeighbours, x, y);
        if (isAlive(x, y)) {
          if (liveNeighbours < 2 || liveNeighbours > 3) {
            newIndexGrid[x][y] = CellStatus.DEAD;
            toggleCellState(divGrid.current[x][y]);
          }
        } else {
          if (liveNeighbours === 3) {
            newIndexGrid[x][y] = CellStatus.ALIVE;
            toggleCellState(divGrid.current[x][y]);
          }
        }
      });
    });
    indexGrid.current = JSON.parse(JSON.stringify(newIndexGrid));
  };

  // Check how many living neighbours a cell has
  const numLiveNeighbours = (x, y) => {
    let count = 0;
    if (isAlive(x - 1, y - 1)) {
      count++;
    }
    if (isAlive(x - 1, y)) {
      count++;
    }
    if (isAlive(x - 1, y + 1)) {
      count++;
    }
    if (isAlive(x, y - 1)) {
      count++;
    }
    if (isAlive(x, y + 1)) {
      count++;
    }
    if (isAlive(x + 1, y - 1)) {
      count++;
    }
    if (isAlive(x + 1, y)) {
      count++;
    }
    if (isAlive(x + 1, y + 1)) {
      count++;
    }
    return count;
  };

  const exportGrid = () => {
      let a = document.createElement("a");
      let file = new Blob([JSON.stringify(indexGrid.current)], { type: "application/json" });
      a.href = URL.createObjectURL(file);
      a.download = "grid.json";
      a.click();
  }

  return (
    <div className="life-grid-root">
      <div className="button-container">
        <button
          className="button tick-once"
          disabled={autoTick}
          onClick={updateGrid}
        >
          Tick once
        </button>
        <button
          className={`button auto-tick ${autoTick ? "enabled" : ""}`}
          onClick={() => setAutoTick(!autoTick)}
        >
          Auto tick
        </button>
        <button
          className={`button`}
          onClick={exportGrid}
        >
          Export grid
        </button>
        <button
          className={`button`}
          onClick={() => {
            indexGrid.current = JSON.parse(JSON.stringify(gliderGun));
          }}
        >
          Load glider gun
        </button>
      </div>
      <div className="grid-wrapper" ref={gridWrapper}>
        {grid}
      </div>
    </div>
  );
}
