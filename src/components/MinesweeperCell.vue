<script setup lang="ts">
import type { CellState } from "@/types";
import { isDev } from "@/composables";
import { CLUE_COLORS } from "@/constants";

defineProps<{ cell: CellState }>();

function getCellClass(cell: CellState) {
  return {
    opened: cell.isOpened,
    mine: cell.isOpened && cell.isMine,
    flag: !cell.isOpened && cell.isFlagged,
    revealed: cell.isRevealed,
  };
}
</script>

<template>
  <button class="cell" :class="getCellClass(cell)">
    <span v-if="cell.isFlagged">`</span>
    <template v-else-if="cell.isOpened || cell.isRevealed || isDev">
      <span v-if="cell.isMine">*</span>
      <span v-else :style="{ color: CLUE_COLORS[cell.clue] }">
        {{ cell.clue }}
      </span>
    </template>
  </button>
</template>

<style scoped>
.cell {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  background-color: var(--surface-color);
  border: 4px solid;
  border-color: var(--highlight-color) var(--shadow-color) var(--shadow-color)
    var(--highlight-color);
  font-size: 1em;
  font-family: minesweeper;

  &:active {
    background-color: var(--surface-color);
    border: 2px solid;
    border-color: var(--shadow-color) var(--surface-color) var(--surface-color)
      var(--shadow-color);
  }

  &.revealed,
  &.opened {
    border: 2px solid var(--shadow-color);
  }

  &.opened.mine {
    background-color: var(--danger-color);
  }

  &.mine > span::after {
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
</style>
