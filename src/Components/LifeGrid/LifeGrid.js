import React, { useState, useRef, useMemo, useEffect } from "react";
import "./LifeGrid.scss";

const GRID_WIDTH = 64;
const GRID_HEIGHT = 64;

const CellStatus = {
  ALIVE: true,
  DEAD: false,
};

export default function LifeGrid() {
  const gridWrapper = useRef();
  const indexGrid = useRef();
  const divGrid = useRef();
  const tickInterval = useRef();
  const [autoTick, setAutoTick] = useState(false);
  const [grid, setGrid] = useState();

  const toggleCellState = (e) => {
    const x = parseInt(e.target.getAttribute("row"));
    const y = parseInt(e.target.getAttribute("col"));
    divGrid.current[x][y].classList.toggle("alive");
    indexGrid.current[x][y] = !indexGrid.current[x][y];
  };

  const initGrid = () => {
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
            onClick={(e) => toggleCellState(e)}
          />
        );
      }
      row.push(col);
      col = [];
    }
    setGrid(row);
  };

  useEffect(() => {
    initGrid();
  }, []);

  useEffect(() => {
    if(autoTick){
      tickInterval.current = setInterval(() => updateGrid(), 200)
    } else {
      clearInterval(tickInterval.current);
    }
    return () => {
      clearInterval(tickInterval.current);
    }
  }, [autoTick])

  const updateGrid = () => {
    let newIndexGrid = JSON.parse(JSON.stringify(indexGrid.current));
    newIndexGrid.forEach((col, x) => {
      col.forEach((_, y) => {
        const liveNeighbours = numLiveNeighbours(x, y);
        if (isAlive(x, y)) {
          if (liveNeighbours < 2 || liveNeighbours > 3) {
            newIndexGrid[x][y] = CellStatus.DEAD;
            divGrid.current[x][y].classList.remove("alive");
          }
        } else {
          if (liveNeighbours === 3) {
            newIndexGrid[x][y] = CellStatus.ALIVE;
            divGrid.current[x][y].classList.add("alive");
          }
        }
      });
    });
    indexGrid.current = JSON.parse(JSON.stringify(newIndexGrid));
  };

  const isAlive = (x, y) => {
    if (
      indexGrid.current[x] !== undefined &&
      indexGrid.current[x][y] !== undefined
    ) {
      return indexGrid.current[x][y];
    }
    return false;
  };

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

  return (
    <div>
      <div className="button next-generation" onClick={updateGrid}>
        Next generation
      </div>
      <div className="button auto-tick" onClick={() => setAutoTick(!autoTick)}>
        Auto tick
      </div>
      <div className="grid-wrapper" ref={gridWrapper}>
        {grid}
      </div>
    </div>
  );
}
