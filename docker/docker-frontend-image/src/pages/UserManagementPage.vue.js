import { ref, onMounted } from "vue";
import getApi from "@services/api";
import { CONFIG } from "@config";
import { executeWithLoading } from "@services/loading";
import * as bootstrap from "bootstrap";
import UserForm from "@components/UserForm.vue";
import ItemList from "@components/ItemList.vue";
import ConfirmModal from "@components/ConfirmModal.vue";
import { setError } from "@services/error";
const users = ref([]);
const selectedUser = ref(null);
const showConfirm = ref(false);
const userToDelete = ref(null);
const loadUsers = async () => {
    await executeWithLoading(async () => {
        const res = await getApi().get(CONFIG.ROUTES.V1_USERS);
        users.value = res.data;
    }, (error) => setError(`Failed to load users: ${error}`));
};
const openModal = () => {
    const modal = document.getElementById("createUserModal");
    if (modal) {
        bootstrap.Modal.getOrCreateInstance(modal).show();
    }
};
const askDeleteUser = () => {
    if (!selectedUser.value)
        return;
    userToDelete.value = selectedUser.value;
    showConfirm.value = true;
};
const deleteUser = async () => {
    if (!userToDelete.value)
        return;
    await executeWithLoading(async () => {
        await getApi().delete(`${CONFIG.ROUTES.V1_USERS}/${userToDelete.value.username}`);
        userToDelete.value = null;
        selectedUser.value = null;
        await loadUsers();
    }, async (error) => {
        setError(`Delete failed: ${error}`);
    });
};
const createUser = async (user) => {
    await executeWithLoading(async () => {
        await getApi().post(CONFIG.ROUTES.V1_USERS, user);
        await loadUsers();
        const modal = document.getElementById("createUserModal");
        if (modal) {
            bootstrap.Modal.getOrCreateInstance(modal).hide();
        }
    }, async (error) => {
        setError(`Failed to create user: ${error}`);
        await loadUsers();
    });
};
onMounted(loadUsers);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "container mt-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "row justify-content-center" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "col-md-6" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "mb-3" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mb-3 d-flex gap-2" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.openModal) },
    ...{ class: "btn btn-success" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.askDeleteUser) },
    ...{ class: "btn btn-danger" },
    disabled: (!__VLS_ctx.selectedUser),
});
/** @type {[typeof ItemList, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(ItemList, new ItemList({
    selected: (__VLS_ctx.selectedUser),
    items: (__VLS_ctx.users),
    keyFn: ((u) => u.username),
    displayFn: ((u) => `${u.username} - ${u.type}`),
}));
const __VLS_1 = __VLS_0({
    selected: (__VLS_ctx.selectedUser),
    items: (__VLS_ctx.users),
    keyFn: ((u) => u.username),
    displayFn: ((u) => `${u.username} - ${u.type}`),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
/** @type {[typeof ConfirmModal, ]} */ ;
// @ts-ignore
const __VLS_3 = __VLS_asFunctionalComponent(ConfirmModal, new ConfirmModal({
    ...{ 'onUpdate:show': {} },
    show: (__VLS_ctx.showConfirm),
    type: "user",
    name: (__VLS_ctx.userToDelete?.username ?? ''),
    code: (__VLS_ctx.userToDelete?.type ?? ''),
    onConfirm: (__VLS_ctx.deleteUser),
}));
const __VLS_4 = __VLS_3({
    ...{ 'onUpdate:show': {} },
    show: (__VLS_ctx.showConfirm),
    type: "user",
    name: (__VLS_ctx.userToDelete?.username ?? ''),
    code: (__VLS_ctx.userToDelete?.type ?? ''),
    onConfirm: (__VLS_ctx.deleteUser),
}, ...__VLS_functionalComponentArgsRest(__VLS_3));
let __VLS_6;
let __VLS_7;
let __VLS_8;
const __VLS_9 = {
    'onUpdate:show': (...[$event]) => {
        __VLS_ctx.showConfirm = $event;
    }
};
var __VLS_5;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal fade" },
    id: "createUserModal",
    tabindex: "-1",
    'aria-labelledby': "createUserModalLabel",
    'aria-hidden': "true",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal-dialog" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({
    ...{ class: "modal-title" },
    id: "createUserModalLabel",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button)({
    type: "button",
    ...{ class: "btn-close" },
    'data-bs-dismiss': "modal",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal-body" },
});
/** @type {[typeof UserForm, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(UserForm, new UserForm({
    ...{ 'onSubmit': {} },
}));
const __VLS_11 = __VLS_10({
    ...{ 'onSubmit': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
let __VLS_13;
let __VLS_14;
let __VLS_15;
const __VLS_16 = {
    onSubmit: (__VLS_ctx.createUser)
};
var __VLS_12;
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-content-center']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-6']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-success']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-danger']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['fade']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-title']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            UserForm: UserForm,
            ItemList: ItemList,
            ConfirmModal: ConfirmModal,
            users: users,
            selectedUser: selectedUser,
            showConfirm: showConfirm,
            userToDelete: userToDelete,
            openModal: openModal,
            askDeleteUser: askDeleteUser,
            deleteUser: deleteUser,
            createUser: createUser,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=UserManagementPage.vue.js.map