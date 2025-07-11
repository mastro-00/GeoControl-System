import { ref } from "vue";

export const globalError = ref<string | null>(null);

export function setError(msg: string) {
  globalError.value = msg;
}

export function clearError() {
  globalError.value = null;
}
