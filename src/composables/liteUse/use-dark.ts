import { computed, ref, watch, watchEffect } from "vue";
import { usePrefersDark } from "./use-prefers-dark";
import { useLocalStorage } from "./use-local-storage";

type BasicColorScheme = "light" | "dark";
type ColorSchema = BasicColorScheme | "auto";

export function useDark() {
  const colorSchema = useLocalStorage<ColorSchema>("color-schema", "auto");

  const { prefersDark } = usePrefersDark();
  const system = computed(
    (): BasicColorScheme => (prefersDark.value ? "dark" : "light")
  );

  const isDark = computed(() =>
    colorSchema.value === "auto"
      ? prefersDark.value
      : colorSchema.value === "dark"
  );

  watch(
    isDark,
    () => {
      if (isDark.value) {
        window!.document.documentElement.classList.add("dark");
      } else {
        window!.document.documentElement.classList.remove("dark");
      }
    },
    {
      immediate: true,
      flush: "post",
    }
  );

  return {
    colorSchema,
    system,
    isDark,
  };
}
