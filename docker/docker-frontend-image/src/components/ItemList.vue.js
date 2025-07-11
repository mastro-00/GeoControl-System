const props = defineProps();
const selected = defineModel("selected");
const emit = defineEmits();
function select(item) {
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
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_defaults = {};
const __VLS_modelEmit = defineEmits();
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
    ...{ onClick: (__VLS_ctx.clearSelection) },
    ...{ class: "list-group" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.items))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.select(item);
            } },
        key: (__VLS_ctx.keyFn(item)),
        ...{ class: "list-group-item list-group-item-action" },
        ...{ class: ({ active: __VLS_ctx.selected && __VLS_ctx.keyFn(__VLS_ctx.selected) === __VLS_ctx.keyFn(item) }) },
    });
    (__VLS_ctx.displayFn(item));
}
/** @type {__VLS_StyleScopedClasses['list-group']} */ ;
/** @type {__VLS_StyleScopedClasses['list-group-item']} */ ;
/** @type {__VLS_StyleScopedClasses['list-group-item-action']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            selected: selected,
            select: select,
            clearSelection: clearSelection,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=ItemList.vue.js.map