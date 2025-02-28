<script setup lang="ts">
import { ref, watchEffect } from "vue";
import type { CellState } from "@/types";

const WIDTH = 10;
const HEIGHT = 10;
const isDev = false;
let MINES_GENERATED = false;

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
const CLUE_COLORS = [
  "transparent",
  "#0211ef",
  "#3a741c",
  "#d3391b",
  "#00047c",
  "#721a09",
  "#3f7d7f",
  "#000000",
  "#707070",
];

const board = ref<CellState[][]>(
  Array.from({ length: HEIGHT }, (_, x) =>
    Array.from(
      { length: WIDTH },
      (_, y) => ({ x, y, isMine: false, clue: 0 }) as CellState
    )
  )
);

function generateMines(curr: CellState): void {
  for (const row of board.value) {
    for (const cell of row) {
      if (curr.x == cell.x && curr.y == cell.y) continue;

      cell.isMine = Math.random() < 0.2;
    }
  }

  updateClues();
}

function updateClues() {
  board.value.forEach(row =>
    row.forEach(cell => {
      if (cell.isMine) return;

      cell.clue = getNeighbors(cell).reduce(
        (accu, curr) => accu + Number(curr.isMine),
        0
      );
    })
  );
}

function openCell(cell: CellState) {
  // TODO: what should happen if cells are flagged before the mines are generated?
  // 1. generate mines immediately after the first cell is flagged
  // 2. do not generate mines until the first cell is opened
  // 3. just blow up the whole board
  if (cell.isOpened || cell.isFlagged) return;

  if (!MINES_GENERATED) {
    generateMines(cell);
    MINES_GENERATED = true;
  }

  cell.isOpened = true;
  openSafeNeighbors(cell);
}

function openSafeNeighbors(curr: CellState) {
  if (curr.clue) return;

  getNeighbors(curr).forEach(neighbor => {
    if (neighbor.isOpened || neighbor.isFlagged) return;
    // `neighbor` will never be a mine (DFS stops when reaching the first cell that clue > 0)
    neighbor.isOpened = true;

    openSafeNeighbors(neighbor);
  });
}

function getNeighbors(curr: CellState): CellState[] {
  const neighbors: CellState[] = [];

  for (const [dx, dy] of DIRECTIONS) {
    const x = curr.x + dx;
    const y = curr.y + dy;

    if (x >= 0 && x < HEIGHT && y >= 0 && y < WIDTH) {
      neighbors.push(board.value[x][y]);
    }
  }

  return neighbors;
}

function flagCell(cell: CellState) {
  if (cell.isOpened) return;

  cell.isFlagged = !cell.isFlagged;
}

function getCellClass(cell: CellState) {
  return {
    opened: cell.isOpened,
    mine: cell.isOpened && cell.isMine,
    flag: !cell.isOpened && cell.isFlagged,
  };
}

function checkGameState() {
  const cellState = board.value.flat();

  if (cellState.some(cell => cell.isOpened && cell.isMine)) {
    alert("You lost.");
    return;
  }

  if (cellState.every(cell => cell.isOpened || cell.isMine)) {
    alert("You won!");
  }
}

watchEffect(checkGameState);
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
            :class="getCellClass(cell)"
            @contextmenu.prevent="flagCell(cell)"
          >
            <span v-if="cell.isFlagged">`</span>
            <template v-else-if="cell.isOpened || isDev">
              <span v-if="cell.isMine">*</span>
              <span v-else :style="{ color: CLUE_COLORS[cell.clue] }">
                {{ cell.clue }}
              </span>
            </template>
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
    --danger-color: #e43e1f;

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
          font-size: 1em;
          font-family: minesweeper;

          &:active {
            background-color: var(--surface-color);
            border: 2px solid;
            border-color: var(--shadow-color) var(--surface-color)
              var(--surface-color) var(--shadow-color);
          }

          &.opened {
            border: 2px solid var(--shadow-color);

            &.mine {
              background-color: var(--danger-color);

              & > span::after {
                /* use a white element to fill the transparent highlight */
                position: absolute;
                z-index: -1;
                top: 6px;
                left: 6px;
                width: 4px;
                height: 4px;
                background-color: #ffffff;
                content: "";
              }
            }
          }

          &.flag {
            &:active {
              background-color: var(--surface-color);
              border: 4px solid;
              border-color: var(--highlight-color) var(--shadow-color)
                var(--shadow-color) var(--highlight-color);
            }

            & > span {
              /* make the flag two-colored */
              background-image: linear-gradient(
                to bottom,
                var(--danger-color) 50%,
                /* first half */ #000000 50% /* last half */
              );
              -webkit-background-clip: text;
              background-clip: text;
              color: transparent;
            }
          }

          span {
            transform: translate(1px, 1px);
          }
        }
      }
    }
  }
}
</style>
