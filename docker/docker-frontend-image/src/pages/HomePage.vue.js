import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { CONFIG } from "@config";
import getApi from "@services/api";
import { UserType } from "@models/UserType";
import * as bootstrap from "bootstrap";
import NetworkCard from "@components/NetworkCard.vue";
import NetworkForm from "@components/NetworkForm.vue";
import ConfirmModal from "@components/ConfirmModal.vue";
import { userHasRole } from "@services/auth";
import { executeWithLoading } from "@services/loading";
import { setError } from "@services/error";
const router = useRouter();
const networks = ref([]);
const newNetwork = ref({
    code: "",
    name: "",
    description: ""
});
const showConfirm = ref(false);
const networkToDelete = ref(null);
const goToMonitor = (code) => router.push(`/monitor/${code}`);
const editNetwork = (code) => router.push(`/edit/${code}`);
const confirmDeleteNetwork = (network) => {
    networkToDelete.value = network;
    showConfirm.value = true;
};
const openModal = () => {
    const modal = document.getElementById("createNetworkModal");
    if (modal) {
        bootstrap.Modal.getOrCreateInstance(modal).show();
    }
};
const loadNetworks = async () => {
    await executeWithLoading(async () => {
        const response = await getApi().get(CONFIG.ROUTES.V1_NETWORKS);
        networks.value = response.data;
    }, (error) => setError("Failed to load networks"));
};
const deleteNetwork = async () => {
    if (!networkToDelete.value)
        return;
    await executeWithLoading(async () => {
        await getApi().delete(`${CONFIG.ROUTES.V1_NETWORKS}/${networkToDelete.value.code}`);
        await loadNetworks();
        networkToDelete.value = null;
    }, (error) => setError("Delete failed"));
};
const createNetwork = async () => {
    await executeWithLoading(async () => {
        await getApi().post(CONFIG.ROUTES.V1_NETWORKS, newNetwork.value);
        await loadNetworks();
        newNetwork.value = { code: "", name: "", description: "" };
        const modal = document.getElementById("createNetworkModal");
        if (modal) {
            bootstrap.Modal.getOrCreateInstance(modal).hide();
        }
    }, (error) => setError("Create failed"));
};
onMounted(loadNetworks);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "container mt-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mb-3" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
if (__VLS_ctx.userHasRole([__VLS_ctx.UserType.Admin, __VLS_ctx.UserType.Operator])) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "mt-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.openModal) },
        ...{ class: "btn btn-success" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "row" },
});
for (const [network] of __VLS_getVForSourceType((__VLS_ctx.networks))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (network.code),
        ...{ class: "col-12 col-md-6 col-lg-4 mb-4" },
    });
    /** @type {[typeof NetworkCard, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(NetworkCard, new NetworkCard({
        ...{ 'onMonitor': {} },
        ...{ 'onEdit': {} },
        ...{ 'onDelete': {} },
        network: (network),
    }));
    const __VLS_1 = __VLS_0({
        ...{ 'onMonitor': {} },
        ...{ 'onEdit': {} },
        ...{ 'onDelete': {} },
        network: (network),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    let __VLS_3;
    let __VLS_4;
    let __VLS_5;
    const __VLS_6 = {
        onMonitor: (__VLS_ctx.goToMonitor)
    };
    const __VLS_7 = {
        onEdit: (__VLS_ctx.editNetwork)
    };
    const __VLS_8 = {
        onDelete: (() => __VLS_ctx.confirmDeleteNetwork(network))
    };
    var __VLS_2;
}
/** @type {[typeof ConfirmModal, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(ConfirmModal, new ConfirmModal({
    ...{ 'onUpdate:show': {} },
    show: (__VLS_ctx.showConfirm),
    type: "network",
    name: (__VLS_ctx.networkToDelete?.name ?? ''),
    code: (__VLS_ctx.networkToDelete?.code ?? ''),
    onConfirm: (__VLS_ctx.deleteNetwork),
}));
const __VLS_10 = __VLS_9({
    ...{ 'onUpdate:show': {} },
    show: (__VLS_ctx.showConfirm),
    type: "network",
    name: (__VLS_ctx.networkToDelete?.name ?? ''),
    code: (__VLS_ctx.networkToDelete?.code ?? ''),
    onConfirm: (__VLS_ctx.deleteNetwork),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    'onUpdate:show': (...[$event]) => {
        __VLS_ctx.showConfirm = $event;
    }
};
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal fade" },
    id: "createNetworkModal",
    tabindex: "-1",
    'aria-labelledby': "createNetworkModalLabel",
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
    id: "createNetworkModalLabel",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    type: "button",
    ...{ class: "btn-close" },
    'data-bs-dismiss': "modal",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal-body" },
});
/** @type {[typeof NetworkForm, ]} */ ;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(NetworkForm, new NetworkForm({
    ...{ 'onSubmit': {} },
    network: (__VLS_ctx.newNetwork),
}));
const __VLS_17 = __VLS_16({
    ...{ 'onSubmit': {} },
    network: (__VLS_ctx.newNetwork),
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
let __VLS_19;
let __VLS_20;
let __VLS_21;
const __VLS_22 = {
    onSubmit: (__VLS_ctx.createNetwork)
};
var __VLS_18;
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-success']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['col-12']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-6']} */ ;
/** @type {__VLS_StyleScopedClasses['col-lg-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
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
            UserType: UserType,
            NetworkCard: NetworkCard,
            NetworkForm: NetworkForm,
            ConfirmModal: ConfirmModal,
            userHasRole: userHasRole,
            networks: networks,
            newNetwork: newNetwork,
            showConfirm: showConfirm,
            networkToDelete: networkToDelete,
            goToMonitor: goToMonitor,
            editNetwork: editNetwork,
            confirmDeleteNetwork: confirmDeleteNetwork,
            openModal: openModal,
            deleteNetwork: deleteNetwork,
            createNetwork: createNetwork,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=HomePage.vue.js.map