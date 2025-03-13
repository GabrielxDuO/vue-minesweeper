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

function onResetGame() {
  ms.reset(ms.difficulty, {
    width: ms.width,
    height: ms.height,
    mines: ms.mines,
  });
  // For layout testing
  // ms.reset("custom", {
  //   width: 3,
  //   height: 3,
  //   mines: 1,
  // });
}
</script>

<template>
  <div class="panel">
    <div class="header unshakeable-center">
      <div class="left-group">
        <div class="counter">{{ ms.restMines }}</div>
      </div>
      <div class="center-group header-controls">
        <button class="reset" @click="onResetGame()">
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
.panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  border-radius: 12px;
  background-color: var(--panel-color-bg);
  box-shadow: 0 10px 25px var(--color-shadow);
  transition: all 0.3s ease;

  .header {
    column-gap: 12px;
    width: 100%;
    padding: 16px;
    background-color: var(--color-primary);
    transition: background-color 0.3s ease;

    .counter {
      display: flex;
      justify-content: center;
      align-items: center;
      min-width: 70px;
      height: 44px;
      border-radius: 6px;
      padding: 0 12px;
      background-color: var(--counter-color-bg);
      font-family: monospace;
      font-size: 1.2rem;
      font-weight: bold;
      color: var(--counter-color-text);
      transition:
        background-color 0.3s ease,
        color 0.3s ease;
    }

    .header-controls {
      align-items: center;

      .reset {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 50%;
        background-color: var(--color-button-bg);
        box-shadow: 0 2px 5px var(--color-shadow);
        font-size: 1.5rem;
        color: var(--color-button-text);
        cursor: pointer;
        transition:
          all 0.2s ease,
          background-color 0.3s ease,
          color 0.3s ease;

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
      column-gap: 10px;

      .difficulty-button {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 36px;
        border: none;
        border-radius: 4px;
        padding: 0 16px;
        background-color: var(--color-button-bg);
        color: var(--color-button-text);
        font-weight: 500;
        cursor: pointer;
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
      display: flex;
      justify-content: center;
      align-items: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background-color: var(--color-button-bg);
      font-size: 1rem;
      color: var(--color-button-text);
      box-shadow: 0 2px 5px var(--color-shadow);
      cursor: pointer;
      transition:
        all 0.2s ease,
        background-color 0.3s ease,
        color 0.3s ease;

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
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 20px;
    overflow: auto;
    background-color: var(--color-secondary);
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
