<script setup lang="ts">
import TheMinesweeper from "@/pages/TheMinesweeper.vue";
</script>

<template>
  <TheMinesweeper />
</template>

<style>
#app {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--color-bg);
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif;
  color: var(--color-text);
  transition: background-color 0.3s ease;
}
</style>
