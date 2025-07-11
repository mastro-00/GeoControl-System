<template>
  <ul class="list-group" @click.self="clearSelection">
    <li
      v-for="item in items"
      :key="keyFn(item)"
      class="list-group-item list-group-item-action"
      :class="{ active: selected && keyFn(selected) === keyFn(item) }"
      @click.stop="select(item)"
    >
      {{ displayFn(item) }}
    </li>
  </ul>
</template>

<script lang="ts" setup>
const props = defineProps<{
  items: any[];
  keyFn: (item: any) => string;
  displayFn: (item: any) => string;
}>();

const selected = defineModel<any>("selected");

const emit = defineEmits<{
  (e: "select", item: any): void;
  (e: "clear"): void;
}>();

function select(item: any) {
  if (selected.value && props.keyFn(selected.value) === props.keyFn(item)) {
    return;
  }
  selected.value = item;
  emit("select", item);
}

function clearSelection() {
  selected.value = null;
  emit("clear");
}
</script>
