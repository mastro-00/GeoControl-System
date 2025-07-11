import { ref, onMounted } from "vue";
import { CONFIG } from "@config";
import getApi from "@services/api";
import Chart from "chart.js/auto";
import { executeWithLoading } from "@services/loading";
import { setError } from "@services/error";
import { encodeDate } from "@services/date";
import annotationPlugin from "chartjs-plugin-annotation";
import LoadingOverlay from "./LoadingOverlay.vue";
Chart.register(annotationPlugin);
const props = defineProps();
const startDate = ref("");
const endDate = ref("");
const stats = ref(null);
const chartCanvas = ref(null);
let chartInstance = null;
async function fetchMeasurements() {
    if (!props.sensor.macAddress)
        return;
    const params = {};
    if (startDate.value)
        params.startDate = encodeDate(startDate.value);
    if (endDate.value)
        params.endDate = encodeDate(endDate.value);
    const path = CONFIG.ROUTES.V1_MEASUREMENTS.replace(":networkCode", props.networkCode)
        .replace(":gatewayMac", props.gatewayMac)
        .replace(":sensorMac", props.sensor.macAddress);
    await executeWithLoading(async () => {
        const res = await getApi().get(path, {
            params
        });
        stats.value = res.data.stats ?? null;
        updateChart(props.sensor, res.data.measurements ?? []);
    }, (error) => setError(`Failed to load measurements for sensor ${props.sensor.macAddress}`), props.sensor.macAddress);
}
function updateChart(sensor, measurements) {
    const labels = measurements.map((m) => new Date(m.createdAt).toLocaleString());
    const data = measurements.map((m) => m.value);
    const outliers = measurements.map((m) => (m.isOutlier ? m.value : null));
    if (chartInstance)
        chartInstance.destroy();
    chartInstance = new Chart(chartCanvas.value, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Value",
                    data,
                    borderWidth: 2
                },
                {
                    label: "Outliers",
                    data: outliers,
                    borderColor: "red",
                    backgroundColor: "red",
                    showLine: false,
                    pointRadius: 5
                },
                {
                    label: "Mean",
                    data: [], // <- dataset vuoto, solo per la legenda
                    borderColor: "blue",
                    borderWidth: 1,
                    borderDash: [],
                    pointStyle: false
                },
                {
                    label: "Threshold",
                    data: [],
                    borderColor: "orange",
                    borderWidth: 1,
                    borderDash: [5, 5],
                    pointStyle: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: `${sensor.variable} [${sensor.unit}]`
                    }
                }
            },
            plugins: {
                annotation: {
                    annotations: stats.value
                        ? {
                            meanLine: {
                                type: "line",
                                yMin: stats.value.mean,
                                yMax: stats.value.mean,
                                borderColor: "blue",
                                borderWidth: 1
                            },
                            upperThreshold: {
                                type: "line",
                                yMin: stats.value.upperThreshold,
                                yMax: stats.value.upperThreshold,
                                borderColor: "orange",
                                borderWidth: 1,
                                borderDash: [5, 5]
                            },
                            lowerThreshold: {
                                type: "line",
                                yMin: stats.value.lowerThreshold,
                                yMax: stats.value.lowerThreshold,
                                borderColor: "orange",
                                borderWidth: 1,
                                borderDash: [5, 5]
                            }
                        }
                        : undefined
                }
            }
        }
    });
}
onMounted(() => {
    const now = new Date();
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);
    fetchMeasurements();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card app-bg mb-4 position-relative" },
});
/** @type {[typeof LoadingOverlay, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(LoadingOverlay, new LoadingOverlay({
    target: (__VLS_ctx.sensor.macAddress),
}));
const __VLS_1 = __VLS_0({
    target: (__VLS_ctx.sensor.macAddress),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-body" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({
    ...{ class: "card-title" },
});
(__VLS_ctx.sensor.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "row mb-3" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "col-md-5 mb-2" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "form-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "datetime-local",
    ...{ class: "form-control" },
});
(__VLS_ctx.startDate);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "col-md-5 mb-2" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "form-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "datetime-local",
    ...{ class: "form-control" },
});
(__VLS_ctx.endDate);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "col-md-2 mb-2 d-flex align-items-end" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.fetchMeasurements) },
    ...{ class: "btn btn-primary w-100" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "bi bi-arrow-repeat" },
});
if (__VLS_ctx.stats) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.stats.mean.toFixed(2));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.stats.variance.toFixed(2));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.stats.upperThreshold.toFixed(2));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.stats.lowerThreshold.toFixed(2));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.canvas, __VLS_intrinsicElements.canvas)({
    ref: "chartCanvas",
    ...{ style: {} },
});
/** @type {typeof __VLS_ctx.chartCanvas} */ ;
/** @type {[typeof LoadingOverlay, typeof LoadingOverlay, ]} */ ;
// @ts-ignore
const __VLS_3 = __VLS_asFunctionalComponent(LoadingOverlay, new LoadingOverlay({}));
const __VLS_4 = __VLS_3({}, ...__VLS_functionalComponentArgsRest(__VLS_3));
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['app-bg']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['position-relative']} */ ;
/** @type {__VLS_StyleScopedClasses['card-body']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-5']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-5']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-items-end']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['w-100']} */ ;
/** @type {__VLS_StyleScopedClasses['bi']} */ ;
/** @type {__VLS_StyleScopedClasses['bi-arrow-repeat']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            LoadingOverlay: LoadingOverlay,
            startDate: startDate,
            endDate: endDate,
            stats: stats,
            chartCanvas: chartCanvas,
            fetchMeasurements: fetchMeasurements,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=SensorChart.vue.js.map