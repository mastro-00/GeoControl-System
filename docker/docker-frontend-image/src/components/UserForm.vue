<template>
  <form @submit.prevent="$emit('submit', user as any)">
    <div class="mb-3">
      <label class="form-label">Username</label>
      <input v-model="user.username" class="form-control" required />
    </div>

    <div class="mb-3">
      <label class="form-label">User Type</label>
      <select v-model="user.type" class="form-select" required>
        <option disabled value="">Select type</option>
        <option :value="UserType.Admin">Admin</option>
        <option :value="UserType.Operator">Operator</option>
        <option :value="UserType.Viewer">Viewer</option>
      </select>
    </div>

    <div class="mb-3">
      <label class="form-label">Password</label>
      <div class="input-group">
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="user.password"
          class="form-control"
          required
        />
        <button
          type="button"
          class="btn btn-outline-secondary"
          @mousedown="showPassword = true"
          @mouseup="showPassword = false"
          @mouseleave="showPassword = false"
        >
          Show
        </button>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label">Confirm Password</label>
      <div class="input-group">
        <input
          :type="showConfirm ? 'text' : 'password'"
          v-model="confirmPassword"
          class="form-control"
          required
        />
        <button
          type="button"
          class="btn btn-outline-secondary"
          @mousedown="showConfirm = true"
          @mouseup="showConfirm = false"
          @mouseleave="showConfirm = false"
        >
          Show
        </button>
      </div>
    </div>

    <p v-if="passwordMismatch" class="text-danger">Passwords do not match</p>

    <button type="submit" class="btn btn-primary" :disabled="!formValid">
      Create
    </button>
  </form>
</template>

<script lang="ts" setup>
import { ref, computed, watchEffect } from "vue";
import { UserType } from "@models/UserType";
import type { User } from "@models/User";

const user = ref<User>({ username: "", type: "" as UserType, password: "" });
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirm = ref(false);

const passwordMismatch = computed(
  () => user.value.password !== confirmPassword.value
);
const formValid = computed(
  () =>
    user.value.username &&
    user.value.type &&
    user.value.password &&
    !passwordMismatch.value
);

defineEmits<{
  (
    e: "submit",
    user: { username: string; password: string; type: UserType }
  ): void;
}>();

watchEffect(() => {
  if (user.value.username) user.value.username = user.value.username.trim();
});
</script>
