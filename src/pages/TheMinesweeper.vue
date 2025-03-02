<script setup lang="ts">
import { computed, watchEffect } from "vue";
import MinesweeperCell from "@/components/MinesweeperCell.vue";
import { isDev, toggleDev } from "@/composables";
import { Minesweeper } from "@/composables/minesweeper";

const ms = new Minesweeper(10, 10);
const board = computed(() => ms.board.value);
const state = computed(() => ms.state.value);
watchEffect(() => {
  ms.checkGameState();
});
</script>

<template>
  <div class="container">
    <h1>Vue Minesweeper</h1>
    <div class="panel">
      <div class="board control">
        <button class="state" @click="ms.reset">
          <template v-if="state === 'won'">😎</template>
          <template v-else-if="state === 'lost'">😵</template>
          <template v-else>🙂</template>
        </button>
      </div>
      <div class="board">
        <div class="row" v-for="(cells, i) in board" :key="i">
          <MinesweeperCell
            v-for="(cell, j) in cells"
            :key="j"
            :cell
            @click="ms.openCell(cell)"
            @contextmenu.prevent="ms.flagCell(cell)"
          />
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
      }

      &.control {
        flex-direction: row;
        justify-content: center;
        padding: 6px;

        button {
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: var(--surface-color);
          border: 4px solid;
          border-color: var(--highlight-color) var(--shadow-color)
            var(--shadow-color) var(--highlight-color);

          font-size: 1.6em;

          &:active {
            background-color: var(--surface-color);
            border: solid var(--shadow-color);
            border-width: 5px 3px 3px 5px;
          }

          &.state {
            margin: 0 auto;
            width: 40px;
            height: 40px;
          }
        }
      }
    }
  }
}
</style>
