<template>
  <form @submit.prevent="$emit('submit', gateway)">
    <div class="mb-3">
      <label class="form-label">MAC Address</label>
      <input v-model="gateway.macAddress" class="form-control" required />
    </div>

    <div class="mb-3">
      <label class="form-label">Name</label>
      <input v-model="gateway.name" class="form-control" />
    </div>

    <div class="mb-3">
      <label class="form-label">Description</label>
      <input v-model="gateway.description" class="form-control" />
    </div>

    <div class="d-flex justify-content-start gap-2 mt-3">
      <button type="submit" class="btn btn-primary">Save</button>
      <button type="button" class="btn btn-danger" @click="$emit('delete')">
        Delete
      </button>
    </div>
  </form>
</template>

<script lang="ts" setup>
import type { Gateway } from "@models/Gateway";

defineProps<{
  gateway: Gateway;
}>();

defineEmits<{
  (e: "submit", gateway: Gateway): void;
  (e: "update", gateway: Gateway): void;
  (e: "delete"): void;
}>();
</script>
