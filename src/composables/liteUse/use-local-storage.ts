import { ref, watch, type Ref } from "vue";

export type UseLocalStorageOptions<T> = {
  defaultValue: T | Ref<T>;
  replaceOnInit?: boolean;
};

export function useLocalStorage<T>(
  key: string,
  options: UseLocalStorageOptions<T>
) {
  const { defaultValue, replaceOnInit = false } = options;

  const data = ref(defaultValue);

  const rawValue = localStorage.getItem(key);
  if (rawValue !== null && !replaceOnInit) {
    const value = JSON.parse(rawValue);
    data.value = value;
  } else {
    localStorage.setItem(key, JSON.stringify(data.value));
  }

  watch(
    data,
    () => {
      if (data.value === null || data.value === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(data.value));
      }
    },
    { deep: true }
  );

  return data;
}
