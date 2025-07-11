import { jwtDecode } from "jwt-decode";
import type { User } from "@models/User";
import type { UserType } from "@models/UserType";
import { computed, ref } from "vue";

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const getCurrentUser = (): User | null => {
  const token = getToken();
  if (!token) return null;
  try {
    return jwtDecode<User>(token);
  } catch {
    return null;
  }
};

export const currentUser = ref<User | null>(getCurrentUser());

export const isAuthenticated = computed((): boolean => {
  return currentUser.value !== null;
});

export const userHasRole = (roles: UserType[]): boolean => {
  return currentUser.value ? roles.includes(currentUser.value.type!) : false;
};

export function login(token: string) {
  localStorage.setItem("token", token);
  currentUser.value = getCurrentUser();
}

export function logout() {
  localStorage.removeItem("token");
  currentUser.value = null;
}
