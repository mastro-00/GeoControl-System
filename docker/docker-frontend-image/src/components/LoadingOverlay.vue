<script lang="ts" setup>
import { isLoading } from "@services/loading";

const props = defineProps({ target: { type: String, default: "global" } });
</script>

<template>
  <div
    v-if="isLoading(props.target)"
    class="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center"
    style="z-index: 1050"
  >
    <div class="spinner-border text-light" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>
