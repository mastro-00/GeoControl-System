import { ref } from "vue";
export const globalError = ref(null);
export function setError(msg) {
    globalError.value = msg;
}
export function clearError() {
    globalError.value = null;
}
//# sourceMappingURL=error.js.map