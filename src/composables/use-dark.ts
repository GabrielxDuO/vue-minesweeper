import { computed, ref, watchEffect } from "vue";
import { usePrefersDark } from "./use-prefers-dark";

type BasicColorScheme = "light" | "dark";
type ColorSchema = BasicColorScheme | "auto";

export function useDark() {
  const colorSchema = ref<ColorSchema>("auto");

  const { prefersDark } = usePrefersDark();
  const system = computed(
    (): BasicColorScheme => (prefersDark.value ? "dark" : "light")
  );

  const isDark = computed(() =>
    colorSchema.value === "auto"
      ? prefersDark.value
      : colorSchema.value === "dark"
  );

  watchEffect(
    () => {
      if (isDark.value) {
        window!.document.documentElement.classList.add("dark");
      } else {
        window!.document.documentElement.classList.remove("dark");
      }
    },
    {
      flush: "post",
    }
  );

  return {
    colorSchema,
    system,
    isDark,
  };
}
