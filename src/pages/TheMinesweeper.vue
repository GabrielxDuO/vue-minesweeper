<script setup lang="ts">
import { computed, watchEffect } from "vue";
import MinesweeperCell from "@/components/MinesweeperCell.vue";
import { colorSchema, Minesweeper, switchColorSchema } from "@/composables";
import IconLightSchema from "~icons/tabler/sun";
import IconDarkSchema from "~icons/tabler/moon";
import IconAutoSchema from "~icons/tabler/device-desktop";
import IconMoodNormal from "~icons/tabler/mood-smile";
import IconMoodWon from "~icons/tabler/mood-nerd";
import IconMoodLost from "~icons/tabler/mood-sad-dizzy";
import { useLocalStorage, useNow } from "@/composables/liteUse";

const ms = new Minesweeper(9, 9, 10);

useLocalStorage("minesweeper-state", ms.state);

const now = useNow();
const timer = computed(() => {
  if (ms.status === "ready") return 0;
  else if (ms.status === "playing")
    return Math.floor((+now.value - ms.state.value.startMS!) / 1000);
  else
    return Math.floor((ms.state.value.endMS! - ms.state.value.startMS!) / 1000);
});

watchEffect(() => {
  ms.checkGameState();
});
</script>

<template>
  <div class="panel">
    <div class="header unshakeable-center">
      <div class="left-group">
        <div class="counter">{{ ms.restMines }}</div>
      </div>
      <div class="center-group header-controls">
        <button
          class="reset"
          @click="
            ms.reset(ms.difficulty, {
              width: ms.width,
              height: ms.height,
              mines: ms.mines,
            })
          "
        >
          <IconMoodWon
            style="color: var(--icon-color-mood-won)"
            v-if="ms.status === 'won'"
          />
          <IconMoodLost
            style="color: var(--icon-color-mood-lost)"
            v-else-if="ms.status === 'lost'"
          />
          <IconMoodNormal v-else />
        </button>
      </div>
      <div class="right-group">
        <div class="counter">{{ timer }}</div>
      </div>
    </div>

    <div class="controls unshakeable-center">
      <div class="left-group"></div>
      <div class="center-group">
        <button
          class="difficulty-button"
          :class="{ active: ms.difficulty === 'beginner' }"
          @click="ms.reset('beginner')"
        >
          初级
        </button>
        <button
          class="difficulty-button"
          :class="{ active: ms.difficulty === 'intermediate' }"
          @click="ms.reset('intermediate')"
        >
          中级
        </button>
        <button
          class="difficulty-button"
          :class="{ active: ms.difficulty === 'expert' }"
          @click="ms.reset('expert')"
        >
          高级
        </button>
        <!-- <button
          class="difficulty-button"
          :class="{ active: ms.difficulty === 'custom' }"
        >
          自定义
        </button> -->
      </div>
      <div class="right-group">
        <button class="theme-toggle" @click="switchColorSchema">
          <IconLightSchema v-if="colorSchema === 'light'" />
          <IconDarkSchema v-else-if="colorSchema === 'dark'" />
          <IconAutoSchema v-else />
        </button>
      </div>
    </div>

    <div class="board-container">
      <div class="board">
        <template class="row" v-for="(cells, i) in ms.board" :key="i">
          <MinesweeperCell
            v-for="(cell, j) in cells"
            :key="i * ms.width + j"
            :cell
            @click="ms.openCell(cell)"
            @contextmenu.prevent="ms.flagCell(cell)"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.unshakeable-center {
  display: grid;
  grid-template-columns: 1fr auto 1fr;

  .left-group {
    display: flex;
  }

  .center-group {
    display: flex;
  }

  .right-group {
    display: flex;
    flex-direction: row-reverse;
  }
}

.panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: max-content;
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
  background-color: var(--panel-color-bg);
  border-radius: 12px;
  box-shadow: 0 10px 25px var(--color-shadow);
  transition: all 0.3s ease;

  .header {
    column-gap: 12px;
    padding: 16px;
    background-color: var(--color-primary);
    color: var(--counter-color-text);
    width: 100%;
    transition: background-color 0.3s ease;

    .counter {
      background-color: var(--counter-color-bg);
      padding: 8px 12px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 1.2rem;
      font-weight: bold;
      min-width: 70px;
      text-align: center;
      color: var(--counter-color-text);
      transition:
        background-color 0.3s ease,
        color 0.3s ease;
    }

    .header-controls {
      align-items: center;

      .reset {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: var(--color-button-bg);
        border: none;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.5rem;
        box-shadow: 0 2px 5px var(--color-shadow);
        transition:
          all 0.2s ease,
          background-color 0.3s ease,
          color 0.3s ease;
        color: var(--color-button-text);

        &:hover {
          transform: scale(1.05);
          box-shadow: 0 3px 8px var(--color-shadow);
        }

        &:active {
          transform: scale(0.95);
          box-shadow: 0 1px 3px var(--color-shadow);
        }
      }
    }
  }

  .controls {
    column-gap: 16px;
    padding: 16px;
    width: 100%;
    background-color: var(--color-primary-brighter);
    transition: background-color 0.3s ease;

    .center-group {
      justify-content: center;
      gap: 10px;

      .difficulty-button {
        padding: 8px 16px;
        background-color: var(--color-button-bg);
        color: var(--color-button-text);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition:
          all 0.2s ease,
          background-color 0.3s ease,
          color 0.3s ease;

        &:hover {
          background-color: var(--cell-color-bg-hover);
        }

        &.active {
          background-color: var(--color-primary-dimmer);
          color: var(--counter-color-text);
        }
      }
    }

    .theme-toggle {
      aspect-ratio: 1;
      border-radius: 50%;
      background-color: var(--color-button-bg);
      border: none;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 1.2rem;
      box-shadow: 0 2px 5px var(--color-shadow);
      transition:
        all 0.2s ease,
        background-color 0.3s ease,
        color 0.3s ease;
      color: var(--color-button-text);

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 3px 8px var(--color-shadow);
      }

      &:active {
        transform: scale(0.95);
        box-shadow: 0 1px 3px var(--color-shadow);
      }
    }
  }

  .board-container {
    padding: 20px;
    background-color: var(--color-secondary);
    width: 100%;
    overflow: auto;
    display: flex;
    justify-content: center;
    flex-grow: 1;
    transition: background-color 0.3s ease;

    .board {
      display: grid;
      grid-template-columns: repeat(v-bind("ms.width"), var(--cell-size));
      grid-template-rows: repeat(v-bind("ms.height"), var(--cell-size));
      gap: 2px;
    }
  }
}
</style>
