<template>
  <div>
    <AppNavbar v-if="isAuthenticated" />
    <LoadingOverlay />
    <div class="container mt-3">
      <div
        v-if="globalError"
        class="alert alert-danger alert-dismissible fade show"
        role="alert"
      >
        {{ globalError }}
        <button
          type="button"
          class="btn-close"
          aria-label="Close"
          @click="clearError"
        ></button>
      </div>
      <router-view />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { globalError, clearError } from "@services/error";
import { isAuthenticated } from "@services/auth";
import AppNavbar from "@components/AppNavbar.vue";
import LoadingOverlay from "@components/LoadingOverlay.vue";
</script>
