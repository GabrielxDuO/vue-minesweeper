<script setup lang="ts">
import TheMinesweeper from "@/pages/TheMinesweeper.vue";
</script>

<template>
  <TheMinesweeper />
</template>

<style>
#app {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif;
  background-color: var(--color-bg);
  color: var(--color-text);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 100vh;
  padding: 20px;
  transition: background-color 0.3s ease;
}
</style>
