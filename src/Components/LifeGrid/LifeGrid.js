import React, { useState, useRef, useEffect, useCallback } from "react";
import "./LifeGrid.scss";

/***************************** RULES OF CONWAY'S GAME OF LIFE: **********************************
  1. Any live cell with two or three live neighbours survives.
  2. Any dead cell with three live neighbours becomes a live cell.
  3. All other live cells die in the next generation. Similarly, all other dead cells stay dead.
*************************************************************************************************/

const GRID_WIDTH = 32;
const GRID_HEIGHT = 18;
const CELL_FILL_DEAD = { fill: 'rgb(0,75,150)' };

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

  const setCellColor = (x, y, r, g, b) => {
    if (
      indexGrid.current[x] !== undefined &&
      indexGrid.current[x][y] !== undefined
    ) {
      divGrid.current[x][y].children[0].style.fill = `rgb(${r}, ${g}, ${b})`;
    }
  };

  const toggleCellState = useCallback(
    (cell) => {
      const rgb = (numAlive.current / (GRID_HEIGHT * GRID_WIDTH)) * 500;
      const x = parseInt(cell.getAttribute("row"));
      const y = parseInt(cell.getAttribute("col"));
      cell.classList.toggle("alive");
      if(!cell.classList.contains("alive")){
        cell.children[0].style = CELL_FILL_DEAD
      }
      // cell.children[0].style.fill = `rgb(${rgb}, ${126}, ${
      //   126
      // })`;
      // cell.classList.toggle("dead");
    },
    [numAlive]
  );

  const handleCellClick = useCallback(
    (e) => {
      const x = parseInt(e.target.getAttribute("row"));
      const y = parseInt(e.target.getAttribute("col"));
      if (
        divGrid.current[x] !== undefined &&
        divGrid.current[x][y] !== undefined
      ) {
        toggleCellState(divGrid.current[x][y]);
        indexGrid.current[x][y] = !indexGrid.current[x][y];
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
            onMouseEnter={(e) => handleCellClick(e)}
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
      tickInterval.current = setInterval(() => updateGrid(), 500);
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
    const red = (count / 7) * 255;
    // const bias = (numAlive.current / (GRID_HEIGHT * GRID_WIDTH)) * 150;
    console.log(numAlive.current);
    setCellColor(x, y, red, red + 100, 150);
    return count;
  };

  return (
    <div className="life-grid-root">
      {/* <div className="button-container">
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
      </div> */}
      <div className="grid-wrapper" ref={gridWrapper}>
        {grid}
      </div>
    </div>
  );
}
