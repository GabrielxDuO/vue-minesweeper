import { readonly, ref } from "vue";

export function usePrefersDark() {
  const prefersDark = ref(false);

  const mediaQueryList = window!.matchMedia("(prefers-color-scheme: dark)");

  prefersDark.value = mediaQueryList.matches;

  const handler = (event: MediaQueryListEvent) => {
    prefersDark.value = event.matches;
  };

  mediaQueryList.addEventListener("change", handler);

  return {
    prefersDark: readonly(prefersDark),
  };
}
