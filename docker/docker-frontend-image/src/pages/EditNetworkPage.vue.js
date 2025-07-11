import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import * as bootstrap from "bootstrap";
import getApi from "@services/api";
import { CONFIG } from "@config";
import { executeWithLoading } from "@services/loading";
import NetworkForm from "@components/NetworkForm.vue";
import GatewayForm from "@components/GatewayForm.vue";
import SensorForm from "@components/SensorForm.vue";
import ItemList from "@components/ItemList.vue";
import ConfirmModal from "@components/ConfirmModal.vue";
import { setError } from "@services/error";
import router from "@router/index";
const route = useRoute();
let code = route.params.code;
const network = ref(null);
const gateways = ref([]);
const sensors = ref([]);
const selectedGateway = ref(null);
const selectedSensor = ref(null);
const showGatewayConfirm = ref(false);
const gatewayToDelete = ref(null);
const showSensorConfirm = ref(false);
const sensorToDelete = ref(null);
const modalType = ref("gateway");
let originalGatewayMacAddress;
let originalSensorMacAddress;
const newGateway = ref({
    macAddress: "",
    name: "",
    description: "",
    sensors: []
});
const newSensor = ref({
    macAddress: "",
    name: "",
    description: "",
    variable: "",
    unit: ""
});
const openModal = (type) => {
    modalType.value = type;
    if (type === "gateway") {
        newGateway.value = {
            macAddress: "",
            name: "",
            description: "",
            sensors: []
        };
    }
    else {
        newSensor.value = {
            macAddress: "",
            name: "",
            description: "",
            variable: "",
            unit: ""
        };
    }
    const modal = document.getElementById("createModal");
    if (modal)
        bootstrap.Modal.getOrCreateInstance(modal).show();
};
const closeModal = () => {
    const modal = document.getElementById("createModal");
    if (modal)
        bootstrap.Modal.getInstance(modal)?.hide();
};
const loadAll = async () => {
    await executeWithLoading(async () => {
        const res = await getApi().get(`${CONFIG.ROUTES.V1_NETWORKS}/${code}`);
        network.value = res.data;
        gateways.value = res.data.gateways || [];
        selectedGateway.value = null;
        sensors.value = [];
    }, (error) => setError(`Failed to load network: ${error}`));
};
const loadGateways = async (clickedGateway) => {
    await executeWithLoading(async () => {
        const res = await getApi().get(CONFIG.ROUTES.V1_GATEWAYS.replace(":networkCode", code));
        gateways.value = res.data || [];
        selectedGateway.value = gateways.value.find((g) => g.macAddress == clickedGateway.macAddress);
        originalGatewayMacAddress = selectedGateway.value.macAddress;
        sensors.value = selectedGateway.value.sensors;
        selectedSensor.value = null;
    }, (error) => setError(`Failed to load gateways: ${error}`));
};
const loadSensors = async (clickedSensor) => {
    await executeWithLoading(async () => {
        const res = await getApi().get(CONFIG.ROUTES.V1_SENSORS.replace(":networkCode", code).replace(":gatewayMac", selectedGateway.value?.macAddress));
        sensors.value = res.data;
        selectedSensor.value = sensors.value.find((s) => s.macAddress == clickedSensor.macAddress);
        originalSensorMacAddress = selectedSensor.value.macAddress;
    }, (error) => setError(`Failed to load sensors: ${error}`));
};
const updateNetwork = async () => {
    await executeWithLoading(async () => {
        await getApi().patch(`${CONFIG.ROUTES.V1_NETWORKS}/${code}`, network.value);
        code = network.value.code;
        router.replace({ params: { code: code } });
    }, async (error) => {
        setError(`Failed to update network: ${error}`);
        await loadAll();
    });
};
const updateGateway = async () => {
    if (!selectedGateway.value)
        return;
    await executeWithLoading(async () => {
        await getApi().patch(`${CONFIG.ROUTES.V1_GATEWAYS.replace(":networkCode", code)}/${originalGatewayMacAddress}`, selectedGateway.value);
        originalGatewayMacAddress = selectedGateway.value?.macAddress;
    }, async (error) => {
        setError(`Failed to update gateway: ${error}`);
        await loadAll();
    });
};
const askDeleteGateway = (gateway) => {
    gatewayToDelete.value = gateway;
    showGatewayConfirm.value = true;
};
const deleteGateway = async () => {
    if (!gatewayToDelete.value)
        return;
    await executeWithLoading(async () => {
        await getApi().delete(`${CONFIG.ROUTES.V1_GATEWAYS.replace(":networkCode", code)}/${gatewayToDelete.value.macAddress}`);
        gatewayToDelete.value = null;
        await loadAll();
    }, async (error) => {
        setError(`Failed to delete gateway: ${error}`);
        await loadAll();
    });
};
const createGateway = async () => {
    await executeWithLoading(async () => {
        await getApi().post(CONFIG.ROUTES.V1_GATEWAYS.replace(":networkCode", code), newGateway.value);
        closeModal();
        loadGateways(newGateway.value);
    }, async (error) => {
        setError(`Failed to create gateway: ${error}`);
        closeModal();
        await loadAll();
    });
};
const updateSensor = async () => {
    if (!selectedGateway.value || !selectedSensor.value)
        return;
    await executeWithLoading(async () => {
        const url = CONFIG.ROUTES.V1_SENSORS.replace(":networkCode", code).replace(":gatewayMac", selectedGateway.value.macAddress);
        await getApi().patch(`${url}/${originalSensorMacAddress}`, selectedSensor.value);
        originalSensorMacAddress = selectedSensor.value?.macAddress;
    }, async (error) => {
        setError(`Failed to update sensor: ${error}`);
        await loadAll();
    });
};
const askDeleteSensor = (sensor) => {
    sensorToDelete.value = sensor;
    showSensorConfirm.value = true;
};
const deleteSensor = async () => {
    if (!selectedGateway.value || !sensorToDelete.value)
        return;
    await executeWithLoading(async () => {
        const url = CONFIG.ROUTES.V1_SENSORS.replace(":networkCode", code).replace(":gatewayMac", selectedGateway.value.macAddress);
        await getApi().delete(`${url}/${sensorToDelete.value.macAddress}`);
        sensorToDelete.value = null;
        await loadAll();
    }, async (error) => {
        setError(`Failed to delete sensor: ${error}`);
        await loadAll();
    });
};
const createSensor = async () => {
    if (!selectedGateway.value)
        return;
    await executeWithLoading(async () => {
        const url = CONFIG.ROUTES.V1_SENSORS.replace(":networkCode", code).replace(":gatewayMac", selectedGateway.value.macAddress);
        await getApi().post(url, newSensor.value);
        closeModal();
        loadSensors(newSensor.value);
    }, async (error) => {
        setError(`Failed to create sensor: ${error}`);
        closeModal();
        await loadAll();
    });
};
onMounted(loadAll);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "container mt-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card app-bg mb-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-body" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({
    ...{ class: "card-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "col-12 col-md-6" },
});
if (__VLS_ctx.network) {
    /** @type {[typeof NetworkForm, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(NetworkForm, new NetworkForm({
        ...{ 'onUpdate': {} },
        network: (__VLS_ctx.network),
    }));
    const __VLS_1 = __VLS_0({
        ...{ 'onUpdate': {} },
        network: (__VLS_ctx.network),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    let __VLS_3;
    let __VLS_4;
    let __VLS_5;
    const __VLS_6 = {
        onUpdate: (__VLS_ctx.updateNetwork)
    };
    var __VLS_2;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card app-bg mb-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-body" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({
    ...{ class: "card-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "col-12 col-md-6 mb-2" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.openModal('gateway');
        } },
    ...{ class: "btn btn-success btn-sm" },
});
/** @type {[typeof ItemList, ]} */ ;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent(ItemList, new ItemList({
    ...{ 'onSelect': {} },
    selected: (__VLS_ctx.selectedGateway),
    items: (__VLS_ctx.gateways),
    keyFn: ((g) => g.macAddress),
    displayFn: ((g) => `${g.macAddress} - ${g.name}`),
    ...{ class: "mt-3" },
}));
const __VLS_8 = __VLS_7({
    ...{ 'onSelect': {} },
    selected: (__VLS_ctx.selectedGateway),
    items: (__VLS_ctx.gateways),
    keyFn: ((g) => g.macAddress),
    displayFn: ((g) => `${g.macAddress} - ${g.name}`),
    ...{ class: "mt-3" },
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
let __VLS_10;
let __VLS_11;
let __VLS_12;
const __VLS_13 = {
    onSelect: (__VLS_ctx.loadGateways)
};
var __VLS_9;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "col-12 col-md-6" },
});
if (__VLS_ctx.selectedGateway) {
    /** @type {[typeof GatewayForm, ]} */ ;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent(GatewayForm, new GatewayForm({
        ...{ 'onSubmit': {} },
        ...{ 'onDelete': {} },
        gateway: (__VLS_ctx.selectedGateway),
    }));
    const __VLS_15 = __VLS_14({
        ...{ 'onSubmit': {} },
        ...{ 'onDelete': {} },
        gateway: (__VLS_ctx.selectedGateway),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    let __VLS_17;
    let __VLS_18;
    let __VLS_19;
    const __VLS_20 = {
        onSubmit: (__VLS_ctx.updateGateway)
    };
    const __VLS_21 = {
        onDelete: (() => __VLS_ctx.askDeleteGateway(__VLS_ctx.selectedGateway))
    };
    var __VLS_16;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card app-bg mb-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-body" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({
    ...{ class: "card-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "col-12 col-md-6 mb-2" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.openModal('sensor');
        } },
    ...{ class: "btn btn-success btn-sm" },
    disabled: (!__VLS_ctx.selectedGateway),
});
/** @type {[typeof ItemList, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(ItemList, new ItemList({
    ...{ 'onSelect': {} },
    selected: (__VLS_ctx.selectedSensor),
    items: (__VLS_ctx.sensors),
    keyFn: ((s) => s.macAddress),
    displayFn: ((s) => `${s.macAddress} - ${s.name}`),
    ...{ class: "mt-3" },
}));
const __VLS_23 = __VLS_22({
    ...{ 'onSelect': {} },
    selected: (__VLS_ctx.selectedSensor),
    items: (__VLS_ctx.sensors),
    keyFn: ((s) => s.macAddress),
    displayFn: ((s) => `${s.macAddress} - ${s.name}`),
    ...{ class: "mt-3" },
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
let __VLS_25;
let __VLS_26;
let __VLS_27;
const __VLS_28 = {
    onSelect: (__VLS_ctx.loadSensors)
};
var __VLS_24;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "col-12 col-md-6" },
});
if (__VLS_ctx.selectedSensor) {
    /** @type {[typeof SensorForm, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(SensorForm, new SensorForm({
        ...{ 'onSubmit': {} },
        ...{ 'onDelete': {} },
        sensor: (__VLS_ctx.selectedSensor),
    }));
    const __VLS_30 = __VLS_29({
        ...{ 'onSubmit': {} },
        ...{ 'onDelete': {} },
        sensor: (__VLS_ctx.selectedSensor),
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    let __VLS_32;
    let __VLS_33;
    let __VLS_34;
    const __VLS_35 = {
        onSubmit: (__VLS_ctx.updateSensor)
    };
    const __VLS_36 = {
        onDelete: (() => __VLS_ctx.askDeleteSensor(__VLS_ctx.selectedSensor))
    };
    var __VLS_31;
}
/** @type {[typeof ConfirmModal, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(ConfirmModal, new ConfirmModal({
    ...{ 'onUpdate:show': {} },
    show: (__VLS_ctx.showGatewayConfirm),
    type: "gateway",
    name: (__VLS_ctx.gatewayToDelete?.name ?? ''),
    code: (__VLS_ctx.gatewayToDelete?.macAddress ?? ''),
    onConfirm: (__VLS_ctx.deleteGateway),
}));
const __VLS_38 = __VLS_37({
    ...{ 'onUpdate:show': {} },
    show: (__VLS_ctx.showGatewayConfirm),
    type: "gateway",
    name: (__VLS_ctx.gatewayToDelete?.name ?? ''),
    code: (__VLS_ctx.gatewayToDelete?.macAddress ?? ''),
    onConfirm: (__VLS_ctx.deleteGateway),
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
let __VLS_40;
let __VLS_41;
let __VLS_42;
const __VLS_43 = {
    'onUpdate:show': (...[$event]) => {
        __VLS_ctx.showGatewayConfirm = $event;
    }
};
var __VLS_39;
/** @type {[typeof ConfirmModal, ]} */ ;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent(ConfirmModal, new ConfirmModal({
    ...{ 'onUpdate:show': {} },
    show: (__VLS_ctx.showSensorConfirm),
    type: "sensor",
    name: (__VLS_ctx.sensorToDelete?.name ?? ''),
    code: (__VLS_ctx.sensorToDelete?.macAddress ?? ''),
    onConfirm: (__VLS_ctx.deleteSensor),
}));
const __VLS_45 = __VLS_44({
    ...{ 'onUpdate:show': {} },
    show: (__VLS_ctx.showSensorConfirm),
    type: "sensor",
    name: (__VLS_ctx.sensorToDelete?.name ?? ''),
    code: (__VLS_ctx.sensorToDelete?.macAddress ?? ''),
    onConfirm: (__VLS_ctx.deleteSensor),
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
let __VLS_47;
let __VLS_48;
let __VLS_49;
const __VLS_50 = {
    'onUpdate:show': (...[$event]) => {
        __VLS_ctx.showSensorConfirm = $event;
    }
};
var __VLS_46;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal fade" },
    id: "createModal",
    tabindex: "-1",
    'aria-hidden': "true",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal-dialog modal-lg" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({
    ...{ class: "modal-title" },
});
(__VLS_ctx.modalType === "gateway" ? "Create Gateway" : "Create Sensor");
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    type: "button",
    ...{ class: "btn-close" },
    'data-bs-dismiss': "modal",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modal-body" },
});
if (__VLS_ctx.modalType === 'gateway') {
    /** @type {[typeof GatewayForm, ]} */ ;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(GatewayForm, new GatewayForm({
        ...{ 'onSubmit': {} },
        gateway: (__VLS_ctx.newGateway),
        editable: (true),
    }));
    const __VLS_52 = __VLS_51({
        ...{ 'onSubmit': {} },
        gateway: (__VLS_ctx.newGateway),
        editable: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    let __VLS_54;
    let __VLS_55;
    let __VLS_56;
    const __VLS_57 = {
        onSubmit: (__VLS_ctx.createGateway)
    };
    var __VLS_53;
}
if (__VLS_ctx.modalType === 'sensor') {
    /** @type {[typeof SensorForm, ]} */ ;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(SensorForm, new SensorForm({
        ...{ 'onSubmit': {} },
        sensor: (__VLS_ctx.newSensor),
        editable: (true),
    }));
    const __VLS_59 = __VLS_58({
        ...{ 'onSubmit': {} },
        sensor: (__VLS_ctx.newSensor),
        editable: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    let __VLS_61;
    let __VLS_62;
    let __VLS_63;
    const __VLS_64 = {
        onSubmit: (__VLS_ctx.createSensor)
    };
    var __VLS_60;
}
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['app-bg']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['card-body']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['col-12']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-6']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['app-bg']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['card-body']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['col-12']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-6']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-success']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['col-12']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-6']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['app-bg']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['card-body']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['col-12']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-6']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-success']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['col-12']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-6']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['fade']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-title']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            NetworkForm: NetworkForm,
            GatewayForm: GatewayForm,
            SensorForm: SensorForm,
            ItemList: ItemList,
            ConfirmModal: ConfirmModal,
            network: network,
            gateways: gateways,
            sensors: sensors,
            selectedGateway: selectedGateway,
            selectedSensor: selectedSensor,
            showGatewayConfirm: showGatewayConfirm,
            gatewayToDelete: gatewayToDelete,
            showSensorConfirm: showSensorConfirm,
            sensorToDelete: sensorToDelete,
            modalType: modalType,
            newGateway: newGateway,
            newSensor: newSensor,
            openModal: openModal,
            loadGateways: loadGateways,
            loadSensors: loadSensors,
            updateNetwork: updateNetwork,
            updateGateway: updateGateway,
            askDeleteGateway: askDeleteGateway,
            deleteGateway: deleteGateway,
            createGateway: createGateway,
            updateSensor: updateSensor,
            askDeleteSensor: askDeleteSensor,
            deleteSensor: deleteSensor,
            createSensor: createSensor,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=EditNetworkPage.vue.js.map