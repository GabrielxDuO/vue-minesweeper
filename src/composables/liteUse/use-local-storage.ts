import { ref, watch, type Ref } from "vue";

export function useLocalStorage<T>(key: string, defaultValue: T | Ref<T>) {
  const data = ref(defaultValue);

  const rawValue = localStorage.getItem(key);
  if (rawValue !== null) {
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
