<script setup lang="ts">
import type { CellState } from "@/types";
import { isDev } from "@/composables";
import { CLUE_COLORS } from "@/constants";

defineProps<{ cell: CellState }>();

function getCellClass(cell: CellState) {
  if (!cell.isRevealed)
    return {
      covered: true,
      flagged: cell.isFlagged,
    };
  if (cell.isMine)
    return {
      mine: true,
      exploded: cell.isExploded,
    };
  return "revealed";
}
</script>

<template>
  <button class="cell" :class="getCellClass(cell)">
    <span
      v-if="(cell.isRevealed && cell.clue > 0) || isDev"
      class="clue"
      :style="{ color: `var(--color-num-${cell.clue})` }"
    >
      {{ cell.clue }}
    </span>
  </button>
</template>

<style scoped>
.cell {
  width: var(--cell-size);
  height: var(--cell-size);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 1.2rem;
  user-select: none;
  border-width: 1px;
  border-style: solid;
  transition:
    all 0.15s ease,
    background-color 0.3s ease,
    color 0.3s ease,
    border 0.3s ease;

  &.covered {
    background-color: var(--cell-color-bg);
    border-radius: 4px;
    border-color: var(--color-border);
    cursor: pointer;

    &:hover {
      background-color: var(--cell-color-bg-hover);
      transform: scale(0.97);
    }

    &:active {
      transform: scale(0.93);
    }

    &.flagged::after {
      content: "🚩";
      font-size: 1rem;
    }
  }

  &.revealed {
    background-color: var(--cell-color-bg-revealed);
    border-radius: 4px;
    border-color: var(--color-border);
  }

  &.question::after {
    content: "?";
    color: var(--color-primary);
    font-size: 1.3rem;
  }

  &.mine {
    background-color: var(--mine-color-bg);
    border-color: var(--mine-color-border);

    &::after {
      content: "💣";
      font-size: 1rem;
    }

    &.exploded {
      background-color: var(--mine-color-bg-exploded);
      border-color: var(--mine-color-border-exploded);

      &::after {
        content: "💥";
      }
    }
  }
}
</style>
