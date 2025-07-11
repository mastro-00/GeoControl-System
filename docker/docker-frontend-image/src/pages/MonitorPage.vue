<template>
  <div class="container mt-4">
    <h2 class="mb-4">Network {{ network.name }}</h2>

    <template
      v-for="gateway in network.gateways || []"
      :key="gateway.macAddress"
    >
      <div v-if="gateway.sensors && gateway.sensors.length > 0" class="mb-4">
        <div class="card" style="background-color: transparent">
          <div class="card-body">
            <h5 class="card-title mb-3">Gateway {{ gateway.name }}</h5>

            <div class="row g-4">
              <div
                class="col-12 col-md-6"
                v-for="sensor in gateway.sensors || []"
                :key="sensor.macAddress"
              >
                <SensorChart
                  :networkCode="code"
                  :gatewayMac="gateway.macAddress!"
                  :sensor="sensor"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import getApi from "@services/api";
import { CONFIG } from "@config";
import type { Network } from "@models/Network";
import SensorChart from "@components/SensorChart.vue";
import { executeWithLoading } from "@services/loading";
import { setError } from "@services/error";

const route = useRoute();
const code = route.params.code as string;

const network = ref<Network>({});

const loadNetwork = async () => {
  await executeWithLoading(
    async () => {
      const response = await getApi().get<Network>(
        `${CONFIG.ROUTES.V1_NETWORKS}/${code}`
      );
      network.value = response.data;
    },
    (err) => setError(`Failed to load network: ${err}`)
  );
};

onMounted(loadNetwork);
</script>
