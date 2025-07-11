<template>
  <div
    class="modal fade"
    tabindex="-1"
    :class="{ show: show }"
    style="display: block"
    v-if="show"
    aria-modal="true"
    role="dialog"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Confirm deletion</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body">
          <p>
            Do you want to delete
            {{ type }} {{ code }} <strong>{{ name }}</strong
            >?
          </p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">
            Cancel
          </button>
          <button type="button" class="btn btn-danger" @click="confirm">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps<{
  show: boolean;
  type: string;
  code: string;
  name: string;
  onConfirm: () => void;
}>();

const emit = defineEmits(["update:show"]);

function close() {
  emit("update:show", false);
}

function confirm() {
  props.onConfirm();
  close();
}
</script>
