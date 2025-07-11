import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import getApi from "@services/api";
import { CONFIG } from "@config";
import SensorChart from "@components/SensorChart.vue";
import { executeWithLoading } from "@services/loading";
import { setError } from "@services/error";
const route = useRoute();
const code = route.params.code;
const network = ref({});
const loadNetwork = async () => {
    await executeWithLoading(async () => {
        const response = await getApi().get(`${CONFIG.ROUTES.V1_NETWORKS}/${code}`);
        network.value = response.data;
    }, (err) => setError(`Failed to load network: ${err}`));
};
onMounted(loadNetwork);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "container mt-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "mb-4" },
});
(__VLS_ctx.network.name);
for (const [gateway] of __VLS_getVForSourceType((__VLS_ctx.network.gateways || []))) {
    (gateway.macAddress);
    if (gateway.sensors && gateway.sensors.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "mb-4" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-body" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({
            ...{ class: "card-title mb-3" },
        });
        (gateway.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "row g-4" },
        });
        for (const [sensor] of __VLS_getVForSourceType((gateway.sensors || []))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "col-12 col-md-6" },
                key: (sensor.macAddress),
            });
            /** @type {[typeof SensorChart, ]} */ ;
            // @ts-ignore
            const __VLS_0 = __VLS_asFunctionalComponent(SensorChart, new SensorChart({
                networkCode: (__VLS_ctx.code),
                gatewayMac: (gateway.macAddress),
                sensor: (sensor),
            }));
            const __VLS_1 = __VLS_0({
                networkCode: (__VLS_ctx.code),
                gatewayMac: (gateway.macAddress),
                sensor: (sensor),
            }, ...__VLS_functionalComponentArgsRest(__VLS_0));
        }
    }
}
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-body']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['g-4']} */ ;
/** @type {__VLS_StyleScopedClasses['col-12']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-6']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            SensorChart: SensorChart,
            code: code,
            network: network,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=MonitorPage.vue.js.map