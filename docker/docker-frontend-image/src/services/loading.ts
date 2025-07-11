import { ref } from "vue";
import { setError } from "@services/error";
import { GLOBAL_LOADING } from "@config";

export const globalLoading = ref(false);
export const sectionLoading = ref<Record<string, boolean>>({});

export function startLoading(key = GLOBAL_LOADING) {
  if (key === GLOBAL_LOADING) globalLoading.value = true;
  else sectionLoading.value[key] = true;
}

export function stopLoading(key = GLOBAL_LOADING) {
  if (key === GLOBAL_LOADING) globalLoading.value = false;
  else sectionLoading.value[key] = false;
}

export function isLoading(key = GLOBAL_LOADING) {
  return key === GLOBAL_LOADING
    ? globalLoading.value
    : sectionLoading.value[key] || false;
}

export async function executeWithLoading<T>(
  fn: () => T | Promise<T>,
  onError: (error: any) => void | Promise<void>,
  key: string = GLOBAL_LOADING
): Promise<T | undefined> {
  startLoading(key);
  try {
    return await Promise.resolve(fn());
  } catch (err) {
    console.error(err);
    await Promise.resolve(onError(err));
    return undefined;
  } finally {
    stopLoading(key);
  }
}
