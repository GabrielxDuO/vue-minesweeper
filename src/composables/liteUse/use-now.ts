import { readonly, ref } from "vue";

export function useNow() {
  const now = ref(new Date());

  function update() {
    now.value = new Date();
  }

  (function f() {
    update();
    window.requestAnimationFrame(f);
  })();

  return readonly(now);
}
