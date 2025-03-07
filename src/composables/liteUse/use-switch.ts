import type { Ref } from "vue";

export function useSwitch<T>(state: Ref<T>, values: T[]) {
  if (!values || values.length === 0) {
    throw new Error("useSwitch: values array cannot be empty");
  }

  let currentIndex = values.indexOf(state.value);

  // Initial value not found in values array
  if (currentIndex === -1) {
    currentIndex = 0;
    state.value = values[0];
    console.warn(
      "useSwitch: initial value not found in values array, using the first value instead"
    );
  }

  function switchFn() {
    currentIndex = (currentIndex + 1) % values.length;
    state.value = values[currentIndex];
    return state.value;
  }

  return switchFn;
}
