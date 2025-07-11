<template>
  <form @submit.prevent="$emit('submit', sensor)">
    <div class="mb-3">
      <label class="form-label">MAC Address</label>
      <input v-model="sensor.macAddress" class="form-control" required />
    </div>

    <div class="mb-3">
      <label class="form-label">Name</label>
      <input v-model="sensor.name" class="form-control" />
    </div>

    <div class="mb-3">
      <label class="form-label">Description</label>
      <input v-model="sensor.description" class="form-control" />
    </div>

    <div class="mb-3">
      <label class="form-label">Variable</label>
      <input v-model="sensor.variable" class="form-control" />
    </div>

    <div class="mb-3">
      <label class="form-label">Unit</label>
      <input v-model="sensor.unit" class="form-control" />
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
import type { Sensor } from "@models/Sensor";

defineProps<{
  sensor: Sensor;
}>();

defineEmits<{
  (e: "submit", sensor: Sensor): void;
  (e: "update", sensor: Sensor): void;
  (e: "delete"): void;
}>();
</script>
