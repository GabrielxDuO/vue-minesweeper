<script setup lang="ts">
import { ref, watchEffect } from "vue";
const WIDTH = 5;
const HEIGHT = 5;
let BOARD_GENERATED = false;
const DIRECTIONS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];
const NUMBER_COLORS = [
  undefined,
  "#0211ef",
  "#3a741c",
  "#d3391b",
  "#00047c",
  "#721a09",
  "#3f7d7f",
  "#000000",
  "#707070",
];
const isDev = ref<boolean>(false);

type CellState = {
  x: number;
  y: number;
  isMine?: boolean;
  isOpened?: boolean;
  isFlagged?: boolean;
  neighborMines?: number;
};

const board = ref<CellState[][]>(
  Array.from({ length: HEIGHT }, (_, x) =>
    Array.from({ length: WIDTH }, (_, y) => ({ x, y }) as CellState)
  )
);

function generateBoard(initialState: CellState): void {
  board.value.forEach(cells =>
    cells.forEach(cell => {
      if (
        Math.abs(initialState.x - cell.x) + Math.abs(initialState.y - cell.y) <=
        1
      )
        cell.isMine = false;
      else cell.isMine = Math.random() < 0.1;
    })
  );
}

function calculateNeighborMines() {
  board.value.forEach(cells =>
    cells.forEach(cell => {
      const neighbors = getNeighbors(cell);
      cell.neighborMines = neighbors.reduce(
        (count, cell) => count + (cell.isMine ? 1 : 0),
        0
      );
    })
  );
}

function openCell(cell: CellState) {
  if (cell.isOpened || cell.isFlagged) return;
  if (!BOARD_GENERATED) {
    generateBoard(cell);
    BOARD_GENERATED = true;
    calculateNeighborMines();
  }
  cell.isOpened = true;
  openSafeNeighbors(cell);
}

function openSafeNeighbors(cell: CellState) {
  if ((cell.neighborMines as number) > 0) return;
  const neighbors = getNeighbors(cell);
  neighbors.forEach(neighbor => {
    if (neighbor.isOpened || neighbor.isFlagged) return;
    if (!neighbor.isMine) neighbor.isOpened = true;
    openSafeNeighbors(neighbor);
  });
}

function getNeighbors(cell: CellState) {
  return DIRECTIONS.reduce((neighbors, [x, y]) => {
    const neighbor = board.value?.[cell.x + x]?.[cell.y + y];
    if (neighbor) neighbors.push(neighbor);
    return neighbors;
  }, [] as CellState[]);
}

function flagCell(cell: CellState) {
  if (cell.isOpened) return;
  cell.isFlagged = !cell.isFlagged;
}

watchEffect(() => {
  const cellState = board.value.flat();
  if (cellState.some(cell => cell.isOpened && cell.isMine)) {
    alert("You lost.");
    return;
  }
  if (
    cellState.every(cell => cell.isFlagged || cell.isOpened) ||
    cellState.every(cell => (!cell.isMine && cell.isOpened) || cell.isMine)
  ) {
    if (cellState.some(cell => !cell.isMine && !cell.isOpened)) return;
    alert("You won.");
  }
});
</script>

<template>
  <div class="container">
    <h1>Vue Minesweeper</h1>
    <div class="panel">
      <div class="board">
        <div class="row" v-for="(cells, i) in board" :key="i">
          <button
            class="cell"
            v-for="(cell, j) in cells"
            :key="j"
            @click="openCell(cell)"
            :class="{ opened: cell.isOpened }"
            :style="{ color: NUMBER_COLORS[cell.neighborMines as number] }"
            @contextmenu.prevent="flagCell(cell)"
          >
            {{
              cell.isOpened || isDev
                ? cell.isMine
                  ? "💣"
                  : (cell.neighborMines as number) > 0
                    ? cell.neighborMines
                    : ""
                : cell.isFlagged
                  ? "🚩"
                  : ""
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;

  .panel {
    --shadow-color: #7f7f7f;
    --highlight-color: #ffffff;
    --surface-color: #bfbfbf;

    border: 6px solid;
    border-color: var(--highlight-color) var(--shadow-color) var(--shadow-color)
      var(--highlight-color);
    box-shadow: -2px -2px 4px -2px rgb(0 0 0 / 0.1);

    .board {
      display: flex;
      flex-direction: column;
      background-color: var(--surface-color);
      border: 6px solid;
      border-color: var(--shadow-color) var(--highlight-color)
        var(--highlight-color) var(--shadow-color);
      margin: 10px;
      outline: 10px solid;
      outline-color: var(--surface-color);

      .row {
        display: flex;

        .cell {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 30px;
          height: 30px;
          background-color: var(--surface-color);
          border: 4px solid;
          border-color: var(--highlight-color) var(--shadow-color)
            var(--shadow-color) var(--highlight-color);
          font-size: 1.2em;

          &:active {
            background-color: var(--surface-color);
            border: 2px solid;
            border-color: var(--shadow-color) var(--surface-color)
              var(--surface-color) var(--shadow-color);
          }

          &.opened {
            font-weight: 900;
            border: 2px solid var(--shadow-color);
          }
        }
      }
    }
  }
}
</style>
