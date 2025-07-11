import { jwtDecode } from "jwt-decode";
import { computed, ref } from "vue";
export const getToken = () => {
    return localStorage.getItem("token");
};
export const getCurrentUser = () => {
    const token = getToken();
    if (!token)
        return null;
    try {
        return jwtDecode(token);
    }
    catch {
        return null;
    }
};
export const currentUser = ref(getCurrentUser());
export const isAuthenticated = computed(() => {
    return currentUser.value !== null;
});
export const userHasRole = (roles) => {
    return currentUser.value ? roles.includes(currentUser.value.type) : false;
};
export function login(token) {
    localStorage.setItem("token", token);
    currentUser.value = getCurrentUser();
}
export function logout() {
    localStorage.removeItem("token");
    currentUser.value = null;
}
//# sourceMappingURL=auth.js.map