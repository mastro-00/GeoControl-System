<template>
  <form @submit.prevent="$emit('update', network)">
    <div class="mb-3">
      <label class="form-label">Code</label>
      <input v-model="network.code" class="form-control" required />
    </div>

    <div class="mb-3">
      <label class="form-label">Name</label>
      <input v-model="network.name" class="form-control" />
    </div>

    <div class="mb-3">
      <label class="form-label">Description</label>
      <input v-model="network.description" class="form-control" />
    </div>

    <button type="submit" class="btn btn-primary">Save</button>
  </form>
</template>

<script lang="ts" setup>
import type { Network } from "@models/Network";

defineProps<{
  network: Network;
}>();

defineEmits<{
  (e: "update", network: Network): void;
}>();
</script>
