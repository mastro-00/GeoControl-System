<template>
  <div class="card app-bg h-100">
    <div class="card-body d-flex flex-column">
      <h5 class="card-title">{{ network.name }}</h5>
      <p class="card-text flex-grow-1">
        {{ network.description }}
      </p>

      <div class="mt-2">
        <button
          class="btn btn-primary me-2 mb-2"
          @click="$emit('monitor', network.code)"
        >
          Monitor
        </button>
        <button
          v-if="canEdit"
          class="btn btn-outline-secondary me-2 mb-2"
          @click="$emit('edit', network.code)"
        >
          Edit
        </button>
        <button
          v-if="canEdit"
          class="btn btn-danger mb-2"
          @click="$emit('delete', network.code)"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Network } from "@models/Network";
import { UserType } from "@models/UserType";
import { userHasRole } from "@services/auth";

const canEdit = userHasRole([UserType.Admin, UserType.Operator]);

defineProps<{
  network: Network;
}>();

defineEmits(["monitor", "edit", "delete"]);
</script>
