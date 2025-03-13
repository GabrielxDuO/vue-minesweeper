<script setup lang="ts">
import {
  computed,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  useTemplateRef,
  watchEffect,
  type Reactive,
} from "vue";
import MinesweeperCell from "@/components/MinesweeperCell.vue";
import {
  colorSchema,
  Minesweeper,
  switchColorSchema,
  type GameSettings,
} from "@/composables";
import IconLightSchema from "~icons/tabler/sun";
import IconDarkSchema from "~icons/tabler/moon";
import IconAutoSchema from "~icons/tabler/device-desktop";
import IconMoodNormal from "~icons/tabler/mood-smile";
import IconMoodWon from "~icons/tabler/mood-nerd";
import IconMoodLost from "~icons/tabler/mood-sad-dizzy";
import { useLocalStorage, useNow } from "@/composables/liteUse";
import { randomInt } from "@/utils";

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
}

const activeCustomSettings = ref(false);
const customSettings = reactive({
  width: ms.width,
  height: ms.height,
  mines: ms.mines,
}) as Reactive<GameSettings>;

function onCustomizingSettings() {
  activeCustomSettings.value = true;
  customSettings.width = ms.width;
  customSettings.height = ms.height;
  customSettings.mines = ms.mines;
}

function onCustomizedSettings() {
  validCustomSettings();
  ms.reset("custom", customSettings);
  activeCustomSettings.value = false;
}

function validCustomSettings() {
  // Provide a random try when receiving invalid values XD
  if (customSettings.width < 3 || customSettings.width > 100) {
    customSettings.width = randomInt(3, 100);
  }
  if (customSettings.height < 3 || customSettings.height > 100) {
    customSettings.height = randomInt(3, 100);
  }
  if (
    customSettings.mines < 1 ||
    customSettings.mines > customSettings.width * customSettings.height - 1
  ) {
    customSettings.mines = randomInt(
      1,
      customSettings.width * customSettings.height
    );
  }
}

const cellSize = 40;
const cellSizePx = computed(() => cellSize + "px");
const fullscreen = ref(false);
const panelHeader = useTemplateRef("panelHeader");
const panelControls = useTemplateRef("panelControls");
const windowWidth = ref(window.innerWidth);
const windowHeight = ref(window.innerHeight);

function onResize() {
  windowWidth.value = window.innerWidth;
  windowHeight.value = window.innerHeight;
}

onMounted(() => {
  window.addEventListener("resize", onResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
});

function shouldFullScreenEffect() {
  // Proximate calculation
  const boardWidth = (ms.width + 2) /* Gap size */ * cellSize;
  const boardHeight = (ms.height + 2) /* Gap size */ * cellSize;
  const controlsHeight =
    (panelHeader.value?.getBoundingClientRect().height || 0) +
    (panelControls.value?.getBoundingClientRect().height || 0);

  if (
    boardWidth > windowWidth.value * 0.9 ||
    boardHeight + controlsHeight > windowHeight.value * 0.9
  ) {
    fullscreen.value = true;
  } else {
    fullscreen.value = false;
  }
}

watchEffect(shouldFullScreenEffect);
</script>

<template>
  <div class="panel" :class="{ fullscreen }">
    <div class="header unshakeable-center" ref="panelHeader">
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

    <div class="controls unshakeable-center" ref="panelControls">
      <div class="left-group"></div>
      <div class="center-group">
        <button
          class="control-button"
          :class="{ active: ms.difficulty === 'beginner' }"
          @click="ms.reset('beginner')"
        >
          初级
        </button>
        <button
          class="control-button"
          :class="{ active: ms.difficulty === 'intermediate' }"
          @click="ms.reset('intermediate')"
        >
          中级
        </button>
        <button
          class="control-button"
          :class="{ active: ms.difficulty === 'expert' }"
          @click="ms.reset('expert')"
        >
          高级
        </button>
        <button
          class="control-button"
          :class="{ active: ms.difficulty === 'custom' }"
          @click="onCustomizingSettings"
        >
          自定义
        </button>
      </div>
      <div class="right-group">
        <button class="theme-toggle" @click="switchColorSchema">
          <IconLightSchema v-if="colorSchema === 'light'" />
          <IconDarkSchema v-else-if="colorSchema === 'dark'" />
          <IconAutoSchema v-else />
        </button>
      </div>
      <div class="custom-settings" :class="{ active: activeCustomSettings }">
        <form id="custom-form" class="custom-settings-form">
          <div class="custom-form-group">
            <label for="width">宽度（3〜100）：</label>
            <input
              type="number"
              id="width"
              v-model="customSettings.width"
              required
            />
          </div>
          <div class="custom-form-group">
            <label for="height">高度（3〜100）：</label>
            <input
              type="number"
              id="height"
              v-model="customSettings.height"
              required
            />
          </div>
          <div class="custom-form-group">
            <label for="mines">地雷数量：</label>
            <input
              type="number"
              id="mines"
              min="1"
              v-model="customSettings.mines"
              required
            />
          </div>
          <div class="custom-form-actions">
            <button
              type="button"
              class="control-button"
              @click.prevent="activeCustomSettings = false"
            >
              取消
            </button>
            <button
              type="submit"
              class="control-button"
              @click.prevent="onCustomizedSettings"
            >
              确定
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="board-container">
      <div class="board" @contextmenu.prevent>
        <template class="row" v-for="(cells, i) in ms.board" :key="i">
          <MinesweeperCell
            v-for="(cell, j) in cells"
            :key="i * ms.width + j"
            :cell
            @open="ms.openCell(cell)"
            @flag="ms.flagCell(cell)"
            @chording="ms.chording(cell)"
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
  background-color: var(--color-secondary);
  box-shadow: 0 10px 25px var(--color-shadow);
  transition: all 0.3s ease-in-out;

  &.fullscreen {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }

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
    }

    .control-button {
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

    .custom-settings {
      grid-column: 1 / -1;
      margin-top: 0;
      width: 100%;
      max-height: 0;
      border-radius: 6px;
      background-color: var(--color-primary-dimmer);
      overflow: hidden;
      transition:
        max-height 0.3s ease-in-out,
        margin-top 0.3s ease-in-out;

      &.active {
        margin-top: 15px;
        max-height: 300px;
      }

      .custom-settings-form {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin: 15px;
      }

      .custom-form-group {
        display: flex;
        flex-direction: column;
      }

      .custom-form-group label {
        margin-bottom: 2px;
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--counter-color-text);
      }

      .custom-form-group input {
        height: 34px;
        padding: 0 8px;
        border-radius: 4px;
        border: 1px solid var(--input-color-border);
        background-color: var(--input-color-bg);
        color: var(--text);
      }

      .custom-form-group input:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px var(--color-primary-brighter);
      }

      .custom-form-actions {
        display: flex;
        justify-content: flex-end;
        align-items: flex-end;
        gap: 10px;

        .control-button {
          height: 34px;
        }
      }
    }
  }

  .board-container {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    padding: 20px;
    overflow: auto;
    background-color: var(--color-secondary);
    transition: background-color 0.3s ease;

    .board {
      display: grid;
      grid-template-columns: repeat(v-bind("ms.width"), v-bind("cellSizePx"));
      grid-template-rows: repeat(v-bind("ms.height"), v-bind("cellSizePx"));
      gap: 2px;
    }
  }
}
</style>
