<template>
  <div class="d-flex justify-content-center align-items-center vh-100">
    <div
      class="card app-bg shadow-sm p-4"
      style="min-width: 300px; max-width: 400px; width: 100%"
    >
      <h3 class="text-center mb-4">GeoControl</h3>
      <form @submit.prevent="getToken">
        <div class="mb-3">
          <label class="form-label">Username</label>
          <input v-model="username" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <input
            type="password"
            v-model="password"
            class="form-control"
            required
          />
        </div>
        <button class="btn btn-primary w-100">Login</button>
        <p v-if="error" class="text-danger mt-3 text-center">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { CONFIG } from "@config";
import type { Token } from "@models/Token";
import getApi from "@services/api";
import { login } from "@services/auth";

const username = ref("");
const password = ref("");
const error = ref("");
const router = useRouter();

const getToken = async () => {
  try {
    const response = await getApi().post<Token>(CONFIG.ROUTES.V1_AUTH, {
      username: username.value,
      password: password.value
    });
    login(response.data.token);
    router.push("/");
  } catch {
    console.error(error);
    error.value = "Invalid credentials";
  }
};
</script>
