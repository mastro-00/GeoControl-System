<template>
  <div class="container mt-4">
    <!-- Network -->
    <div class="card app-bg mb-4">
      <div class="card-body">
        <h5 class="card-title">Network</h5>
        <div class="row">
          <div class="col-12 col-md-6">
            <NetworkForm
              v-if="network"
              v-model:network="network"
              @update="updateNetwork"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Gateways -->
    <div class="card app-bg mb-4">
      <div class="card-body">
        <h5 class="card-title">Gateways</h5>
        <div class="row">
          <div class="col-12 col-md-6 mb-2">
            <button
              class="btn btn-success btn-sm"
              @click="openModal('gateway')"
            >
              Create Gateway
            </button>
            <ItemList
              v-model:selected="selectedGateway"
              :items="gateways"
              :keyFn="(g) => g.macAddress"
              :displayFn="(g) => `${g.macAddress} - ${g.name}`"
              @select="loadGateways"
              class="mt-3"
            />
          </div>
          <div class="col-12 col-md-6">
            <GatewayForm
              v-if="selectedGateway"
              v-model:gateway="selectedGateway"
              @submit="updateGateway"
              @delete="() => askDeleteGateway(selectedGateway!)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Sensors -->
    <div class="card app-bg mb-4">
      <div class="card-body">
        <h5 class="card-title">Sensors</h5>
        <div class="row">
          <div class="col-12 col-md-6 mb-2">
            <button
              class="btn btn-success btn-sm"
              :disabled="!selectedGateway"
              @click="openModal('sensor')"
            >
              Create Sensor
            </button>
            <ItemList
              v-model:selected="selectedSensor"
              :items="sensors"
              :keyFn="(s) => s.macAddress"
              :displayFn="(s) => `${s.macAddress} - ${s.name}`"
              @select="loadSensors"
              class="mt-3"
            />
          </div>
          <div class="col-12 col-md-6">
            <SensorForm
              v-if="selectedSensor"
              v-model:sensor="selectedSensor"
              @submit="updateSensor"
              @delete="() => askDeleteSensor(selectedSensor!)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Modals -->
    <ConfirmModal
      :show="showGatewayConfirm"
      type="gateway"
      :name="gatewayToDelete?.name ?? ''"
      :code="gatewayToDelete?.macAddress ?? ''"
      :onConfirm="deleteGateway"
      @update:show="showGatewayConfirm = $event"
    />
    <ConfirmModal
      :show="showSensorConfirm"
      type="sensor"
      :name="sensorToDelete?.name ?? ''"
      :code="sensorToDelete?.macAddress ?? ''"
      :onConfirm="deleteSensor"
      @update:show="showSensorConfirm = $event"
    />

    <!-- Create Modal -->
    <div class="modal fade" id="createModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ modalType === "gateway" ? "Create Gateway" : "Create Sensor" }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <GatewayForm
              v-if="modalType === 'gateway'"
              :gateway="newGateway"
              @submit="createGateway"
              :editable="true"
            />
            <SensorForm
              v-if="modalType === 'sensor'"
              :sensor="newSensor"
              @submit="createSensor"
              :editable="true"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import * as bootstrap from "bootstrap";

import type { Network } from "@models/Network";
import type { Gateway } from "@models/Gateway";
import type { Sensor } from "@models/Sensor";

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
let code = route.params.code as string;

const network = ref<Network | null>(null);
const gateways = ref<Gateway[]>([]);
const sensors = ref<Sensor[]>([]);

const selectedGateway = ref<Gateway | null>(null);
const selectedSensor = ref<Sensor | null>(null);

const showGatewayConfirm = ref(false);
const gatewayToDelete = ref<Gateway | null>(null);
const showSensorConfirm = ref(false);
const sensorToDelete = ref<Sensor | null>(null);

const modalType = ref<"gateway" | "sensor">("gateway");

let originalGatewayMacAddress: string | undefined;
let originalSensorMacAddress: string | undefined;

const newGateway = ref<Gateway>({
  macAddress: "",
  name: "",
  description: "",
  sensors: []
});
const newSensor = ref<Sensor>({
  macAddress: "",
  name: "",
  description: "",
  variable: "",
  unit: ""
});

const openModal = (type: "gateway" | "sensor") => {
  modalType.value = type;
  if (type === "gateway") {
    newGateway.value = {
      macAddress: "",
      name: "",
      description: "",
      sensors: []
    };
  } else {
    newSensor.value = {
      macAddress: "",
      name: "",
      description: "",
      variable: "",
      unit: ""
    };
  }
  const modal = document.getElementById("createModal");
  if (modal) bootstrap.Modal.getOrCreateInstance(modal).show();
};

const closeModal = () => {
  const modal = document.getElementById("createModal");
  if (modal) bootstrap.Modal.getInstance(modal)?.hide();
};

const loadAll = async () => {
  await executeWithLoading(
    async () => {
      const res = await getApi().get<Network>(
        `${CONFIG.ROUTES.V1_NETWORKS}/${code}`
      );
      network.value = res.data;
      gateways.value = res.data.gateways || [];
      selectedGateway.value = null;
      sensors.value = [];
    },
    (error) => setError(`Failed to load network: ${error}`)
  );
};

const loadGateways = async (clickedGateway: Gateway) => {
  await executeWithLoading(
    async () => {
      const res = await getApi().get<Gateway[]>(
        CONFIG.ROUTES.V1_GATEWAYS.replace(":networkCode", code)
      );
      gateways.value = res.data || [];
      selectedGateway.value = gateways.value.find(
        (g) => g.macAddress == clickedGateway.macAddress
      )!;
      originalGatewayMacAddress = selectedGateway.value.macAddress!;
      sensors.value = selectedGateway.value.sensors!;
      selectedSensor.value = null;
    },
    (error) => setError(`Failed to load gateways: ${error}`)
  );
};

const loadSensors = async (clickedSensor: Sensor) => {
  await executeWithLoading(
    async () => {
      const res = await getApi().get<Sensor[]>(
        CONFIG.ROUTES.V1_SENSORS.replace(":networkCode", code).replace(
          ":gatewayMac",
          selectedGateway.value?.macAddress!
        )
      );
      sensors.value = res.data;
      selectedSensor.value = sensors.value.find(
        (s) => s.macAddress == clickedSensor.macAddress
      )!;
      originalSensorMacAddress = selectedSensor.value.macAddress;
    },
    (error) => setError(`Failed to load sensors: ${error}`)
  );
};

const updateNetwork = async () => {
  await executeWithLoading(
    async () => {
      await getApi().patch(
        `${CONFIG.ROUTES.V1_NETWORKS}/${code}`,
        network.value
      );
      code = network.value!.code!;
      router.replace({ params: { code: code } });
    },
    async (error) => {
      setError(`Failed to update network: ${error}`);
      await loadAll();
    }
  );
};

const updateGateway = async () => {
  if (!selectedGateway.value) return;
  await executeWithLoading(
    async () => {
      await getApi().patch(
        `${CONFIG.ROUTES.V1_GATEWAYS.replace(
          ":networkCode",
          code
        )}/${originalGatewayMacAddress}`,
        selectedGateway.value
      );
      originalGatewayMacAddress = selectedGateway.value?.macAddress;
    },
    async (error) => {
      setError(`Failed to update gateway: ${error}`);
      await loadAll();
    }
  );
};

const askDeleteGateway = (gateway: Gateway) => {
  gatewayToDelete.value = gateway;
  showGatewayConfirm.value = true;
};

const deleteGateway = async () => {
  if (!gatewayToDelete.value) return;
  await executeWithLoading(
    async () => {
      await getApi().delete(
        `${CONFIG.ROUTES.V1_GATEWAYS.replace(":networkCode", code)}/${
          gatewayToDelete.value!.macAddress
        }`
      );
      gatewayToDelete.value = null;
      await loadAll();
    },
    async (error) => {
      setError(`Failed to delete gateway: ${error}`);
      await loadAll();
    }
  );
};

const createGateway = async () => {
  await executeWithLoading(
    async () => {
      await getApi().post(
        CONFIG.ROUTES.V1_GATEWAYS.replace(":networkCode", code),
        newGateway.value
      );
      closeModal();
      loadGateways(newGateway.value);
    },
    async (error) => {
      setError(`Failed to create gateway: ${error}`);
      closeModal();
      await loadAll();
    }
  );
};

const updateSensor = async () => {
  if (!selectedGateway.value || !selectedSensor.value) return;
  await executeWithLoading(
    async () => {
      const url = CONFIG.ROUTES.V1_SENSORS.replace(
        ":networkCode",
        code
      ).replace(":gatewayMac", selectedGateway.value!.macAddress!);
      await getApi().patch(
        `${url}/${originalSensorMacAddress}`,
        selectedSensor.value
      );
      originalSensorMacAddress = selectedSensor.value?.macAddress;
    },
    async (error) => {
      setError(`Failed to update sensor: ${error}`);
      await loadAll();
    }
  );
};

const askDeleteSensor = (sensor: Sensor) => {
  sensorToDelete.value = sensor;
  showSensorConfirm.value = true;
};

const deleteSensor = async () => {
  if (!selectedGateway.value || !sensorToDelete.value) return;
  await executeWithLoading(
    async () => {
      const url = CONFIG.ROUTES.V1_SENSORS.replace(
        ":networkCode",
        code
      ).replace(":gatewayMac", selectedGateway.value!.macAddress!);
      await getApi().delete(`${url}/${sensorToDelete.value!.macAddress}`);
      sensorToDelete.value = null;
      await loadAll();
    },
    async (error) => {
      setError(`Failed to delete sensor: ${error}`);
      await loadAll();
    }
  );
};

const createSensor = async () => {
  if (!selectedGateway.value) return;
  await executeWithLoading(
    async () => {
      const url = CONFIG.ROUTES.V1_SENSORS.replace(
        ":networkCode",
        code
      ).replace(":gatewayMac", selectedGateway.value!.macAddress!);
      await getApi().post(url, newSensor.value);
      closeModal();
      loadSensors(newSensor.value);
    },
    async (error) => {
      setError(`Failed to create sensor: ${error}`);
      closeModal();
      await loadAll();
    }
  );
};

onMounted(loadAll);
</script>
