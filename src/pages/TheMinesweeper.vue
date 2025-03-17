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
import { toValidNumberInRange, version } from "@/utils";
import {
  MAX_BOARD_HEIGHT,
  MAX_BOARD_WIDTH,
  MIN_BOARD_HEIGHT,
  MIN_BOARD_WIDTH,
  MIN_MINES,
} from "@/constants";

const ms = new Minesweeper(9, 9, 10);

const currentVersion = useLocalStorage("minesweeper-version", {
  defaultValue: version,
});
let replaceStateOnInit = false;
if (currentVersion.value !== version) {
  currentVersion.value = version;
  replaceStateOnInit = true;
}
useLocalStorage("minesweeper-state", {
  defaultValue: ms.state,
  replaceOnInit: replaceStateOnInit,
});

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
  ms.reset("custom", customSettings);
  activeCustomSettings.value = false;
}

const maxValidMines = computed(
  () => (customSettings.width || 3) * (customSettings.height || 3) - 1
);

function onCustomWidthChange(event: Event) {
  customSettings.width = toValidNumberInRange(
    (event.target as HTMLInputElement).value,
    MIN_BOARD_WIDTH,
    MAX_BOARD_WIDTH
  );
}

function onCustomHeightChange(event: Event) {
  customSettings.height = toValidNumberInRange(
    (event.target as HTMLInputElement).value,
    MIN_BOARD_HEIGHT,
    MAX_BOARD_HEIGHT
  );
}

function onCustomMinesChange(event: Event) {
  customSettings.mines = toValidNumberInRange(
    (event.target as HTMLInputElement).value,
    MIN_MINES,
    maxValidMines.value
  );
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

// TODO: Add a play guide and operation instructions section
// TODO: Display a notification when scrolling is needed to view the entire board
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
          data-first-char="初"
        >
          初级
          <!-- <span>初级</span> -->
        </button>
        <button
          class="control-button"
          :class="{ active: ms.difficulty === 'intermediate' }"
          @click="ms.reset('intermediate')"
          data-first-char="中"
        >
          中级
          <!-- <span>中级</span> -->
        </button>
        <button
          class="control-button"
          :class="{ active: ms.difficulty === 'expert' }"
          @click="ms.reset('expert')"
          data-first-char="高"
        >
          高级
          <!-- <span>高级</span> -->
        </button>
        <button
          class="control-button"
          :class="{ active: ms.difficulty === 'custom' }"
          @click="onCustomizingSettings"
          data-first-char="自"
        >
          自定义
          <!-- <span>自定义</span> -->
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
            <label for="custom-settings-width">宽度：</label>
            <input
              type="number"
              id="custom-settings-width"
              required
              :placeholder="`${MIN_BOARD_WIDTH} ~ ${MAX_BOARD_WIDTH}`"
              :value="customSettings.width"
              @change="onCustomWidthChange"
            />
          </div>
          <div class="custom-form-group">
            <label for="custom-settings-height">高度：</label>
            <input
              type="number"
              id="custom-settings-height"
              required
              :placeholder="`${MIN_BOARD_HEIGHT} ~ ${MAX_BOARD_HEIGHT}`"
              :value="customSettings.height"
              @change="onCustomHeightChange"
            />
          </div>
          <div class="custom-form-group">
            <label for="mines">地雷数量：</label>
            <input
              type="number"
              id="mines"
              required
              :placeholder="`${MIN_MINES} ~ ${maxValidMines}`"
              :value="customSettings.mines"
              @change="onCustomMinesChange"
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
          <div class="tip">提示：当输入值无效时，会在合法范围内随机</div>
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
      height: 36px;
      border: none;
      border-radius: 4px;
      padding: 0 16px;
      background-color: var(--color-button-bg);
      color: var(--color-button-text);
      font-weight: 500;
      cursor: pointer;
      overflow: hidden;
      line-height: 36px;
      word-wrap: break-word;
      interpolate-size: allow-keywords;
      transition:
        all 0.3s ease,
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

    @media screen and (max-width: 380px) {
      .center-group > .control-button {
        padding: 0 10px;
        width: 36px;

        &:hover,
        &.active {
          padding: 0 16px;
          width: auto;
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
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        margin: 15px;

        .custom-form-group {
          display: flex;
          flex-direction: column;

          label {
            margin-bottom: 2px;
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--counter-color-text);
          }

          input {
            border-radius: 4px;
            border: 1px solid var(--input-color-border);
            width: 100%;
            height: 34px;
            padding: 0 8px;
            background-color: var(--input-color-bg);
            color: var(--text);

            &:focus {
              outline: none;
              border-color: var(--color-primary);
              box-shadow: 0 0 0 2px var(--color-primary-brighter);
            }
          }
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

        .tip {
          grid-column: 1 / -1;
          font-size: 0.8rem;
          color: var(--counter-color-text);
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
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
