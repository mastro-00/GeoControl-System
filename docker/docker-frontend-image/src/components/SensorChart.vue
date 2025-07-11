<template>
  <div class="card app-bg mb-4 position-relative">
    <LoadingOverlay :target="sensor.macAddress" />
    <div class="card-body">
      <h5 class="card-title">
        {{ sensor.name }}
      </h5>

      <div class="row mb-3">
        <div class="col-md-5 mb-2">
          <label class="form-label">Start Date</label>
          <input
            type="datetime-local"
            v-model="startDate"
            class="form-control"
          />
        </div>
        <div class="col-md-5 mb-2">
          <label class="form-label">End Date</label>
          <input type="datetime-local" v-model="endDate" class="form-control" />
        </div>
        <div class="col-md-2 mb-2 d-flex align-items-end">
          <button class="btn btn-primary w-100" @click="fetchMeasurements">
            <i class="bi bi-arrow-repeat"></i>
          </button>
        </div>
      </div>

      <div class="mb-2" v-if="stats">
        <strong>Mean:</strong> {{ stats.mean.toFixed(2) }},
        <strong>Variance:</strong> {{ stats.variance.toFixed(2) }}
        <strong>Upper Threshold:</strong> {{ stats.upperThreshold.toFixed(2) }}
        <strong>Lower Threshold:</strong> {{ stats.lowerThreshold.toFixed(2) }}
      </div>

      <canvas ref="chartCanvas" style="max-height: 300px"></canvas>
    </div>
    <LoadingOverlay></LoadingOverlay>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import type { Sensor } from "@models/Sensor";
import type { Stats } from "@models/Stats";
import type { Measurement } from "@models/Measurement";
import type { Measurements } from "@models/Measurements";
import { CONFIG } from "@config";
import getApi from "@services/api";
import Chart from "chart.js/auto";
import { executeWithLoading } from "@services/loading";
import { setError } from "@services/error";
import { encodeDate } from "@services/date";
import annotationPlugin from "chartjs-plugin-annotation";
import LoadingOverlay from "./LoadingOverlay.vue";
Chart.register(annotationPlugin);

const props = defineProps<{
  sensor: Sensor;
  networkCode: string;
  gatewayMac: string;
}>();

const startDate = ref("");
const endDate = ref("");
const stats = ref<Stats | null>(null);
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

async function fetchMeasurements() {
  if (!props.sensor.macAddress) return;

  const params: Record<string, string> = {};
  if (startDate.value) params.startDate = encodeDate(startDate.value)!;
  if (endDate.value) params.endDate = encodeDate(endDate.value)!;

  const path = CONFIG.ROUTES.V1_MEASUREMENTS.replace(
    ":networkCode",
    props.networkCode
  )
    .replace(":gatewayMac", props.gatewayMac)
    .replace(":sensorMac", props.sensor.macAddress!);

  await executeWithLoading(
    async () => {
      const res = await getApi().get<Measurements>(path, {
        params
      });
      stats.value = res.data.stats ?? null;
      updateChart(props.sensor, res.data.measurements ?? []);
    },
    (error) =>
      setError(
        `Failed to load measurements for sensor ${props.sensor.macAddress}`
      ),
    props.sensor.macAddress
  );
}

function updateChart(sensor: Sensor, measurements: Measurement[]) {
  const labels = measurements.map((m) =>
    new Date(m.createdAt).toLocaleString()
  );
  const data = measurements.map((m) => m.value);
  const outliers = measurements.map((m) => (m.isOutlier ? m.value : null));

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(chartCanvas.value!, {
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
</script>
