import { ref } from "vue";
import { GLOBAL_LOADING } from "@config";
export const globalLoading = ref(false);
export const sectionLoading = ref({});
export function startLoading(key = GLOBAL_LOADING) {
    if (key === GLOBAL_LOADING)
        globalLoading.value = true;
    else
        sectionLoading.value[key] = true;
}
export function stopLoading(key = GLOBAL_LOADING) {
    if (key === GLOBAL_LOADING)
        globalLoading.value = false;
    else
        sectionLoading.value[key] = false;
}
export function isLoading(key = GLOBAL_LOADING) {
    return key === GLOBAL_LOADING
        ? globalLoading.value
        : sectionLoading.value[key] || false;
}
export async function executeWithLoading(fn, onError, key = GLOBAL_LOADING) {
    startLoading(key);
    try {
        return await Promise.resolve(fn());
    }
    catch (err) {
        console.error(err);
        await Promise.resolve(onError(err));
        return undefined;
    }
    finally {
        stopLoading(key);
    }
}
//# sourceMappingURL=loading.js.map