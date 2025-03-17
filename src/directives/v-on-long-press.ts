import type { Directive } from "vue";

interface LongPressState {
  timer?: number;
  handler: (evt: PointerEvent) => void;
  delay: number;
  onPress: (evt: PointerEvent) => void;
  onRelease: (evt: PointerEvent) => void;
}

const elementStateMap = new WeakMap<HTMLElement, LongPressState>();

export const vOnLongPress: Directive<HTMLElement, any, `${number}`> = {
  mounted(el, binding) {
    const handler = binding.value;
    let delay = 500;

    const customDelay = Number(Object.keys(binding.modifiers)[0]);
    if (!Number.isNaN(customDelay)) delay = customDelay;

    const onPress = (evt: PointerEvent) => {
      const state = elementStateMap.get(el);
      if (!state) return;

      clearTimeout(state.timer);

      state.timer = setTimeout(() => {
        state.handler(evt);
      }, state.delay);
    };

    const onRelease = (_: PointerEvent) => {
      const state = elementStateMap.get(el);
      if (!state) return;

      clearTimeout(state.timer);
    };

    // 存储元素状态
    elementStateMap.set(el, {
      handler,
      delay,
      onPress,
      onRelease,
    });

    el.addEventListener("pointerdown", onPress);
    el.addEventListener("pointerup", onRelease);
    el.addEventListener("pointercancel", onRelease);
    el.addEventListener("pointerleave", onRelease);
  },

  beforeUnmount(el) {
    const state = elementStateMap.get(el);
    if (!state) return;

    el.removeEventListener("pointerdown", state.onPress);
    el.removeEventListener("pointerup", state.onRelease);
    el.removeEventListener("pointercancel", state.onRelease);
    el.removeEventListener("pointerleave", state.onRelease);

    clearTimeout(state.timer);
    elementStateMap.delete(el);
  },
};
