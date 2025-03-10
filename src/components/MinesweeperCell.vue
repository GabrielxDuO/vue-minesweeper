<script setup lang="ts">
import { isDev, type CellState } from "@/composables";
import IconMine from "~icons/mdi/mine";
import IconExploded from "~icons/fluent-emoji-high-contrast/collision";
import IconFlag from "~icons/tabler/pennant-2-filled";

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
    <template v-if="cell.isRevealed || isDev">
      <IconExploded
        v-if="cell.isExploded"
        style="color: var(--icon-color-exploded)"
      />
      <IconMine v-else-if="cell.isMine" style="color: var(--icon-color-mine)" />
      <span
        v-else-if="cell.clue > 0"
        class="clue"
        :style="{ color: `var(--cell-color-num-${cell.clue})` }"
      >
        {{ cell.clue }}
      </span>
    </template>
    <IconFlag
      v-else-if="cell.isFlagged"
      style="color: var(--icon-color-flag)"
    />
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
  font-size: 1.4rem;
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
  }

  &.revealed {
    background-color: var(--cell-color-bg-revealed);
    border-radius: 4px;
    border-color: var(--color-border);
    font-size: 1.2rem;
  }

  &.question::after {
    content: "?";
    color: var(--color-primary);
    font-size: 1.3rem;
  }

  &.mine {
    background-color: var(--mine-color-bg);
    border-color: var(--mine-color-border);

    &.exploded {
      background-color: var(--mine-color-bg-exploded);
      border-color: var(--mine-color-border-exploded);
    }
  }
}
</style>
