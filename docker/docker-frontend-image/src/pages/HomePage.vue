<template>
  <div class="container mt-4">
    <div class="mb-3">
      <h2>Networks</h2>
      <div v-if="userHasRole([UserType.Admin, UserType.Operator])" class="mt-2">
        <button class="btn btn-success" @click="openModal">
          Create Network
        </button>
      </div>
    </div>

    <div class="row">
      <div
        v-for="network in networks"
        :key="network.code"
        class="col-12 col-md-6 col-lg-4 mb-4"
      >
        <NetworkCard
          :network="network"
          @monitor="goToMonitor"
          @edit="editNetwork"
          @delete="() => confirmDeleteNetwork(network)"
        />
      </div>
    </div>

    <ConfirmModal
      :show="showConfirm"
      type="network"
      :name="networkToDelete?.name ?? ''"
      :code="networkToDelete?.code ?? ''"
      :onConfirm="deleteNetwork"
      @update:show="showConfirm = $event"
    />

    <div
      class="modal fade"
      id="createNetworkModal"
      tabindex="-1"
      aria-labelledby="createNetworkModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="createNetworkModalLabel">
              Create Network
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <NetworkForm :network="newNetwork" @submit="createNetwork" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import type { Network } from "@models/Network";
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
const networks = ref<Network[]>([]);
const newNetwork = ref<Network>({
  code: "",
  name: "",
  description: ""
});
const showConfirm = ref(false);
const networkToDelete = ref<Network | null>(null);

const goToMonitor = (code: string) => router.push(`/monitor/${code}`);
const editNetwork = (code: string) => router.push(`/edit/${code}`);

const confirmDeleteNetwork = (network: Network) => {
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
  await executeWithLoading(
    async () => {
      const response = await getApi().get<Network[]>(CONFIG.ROUTES.V1_NETWORKS);
      networks.value = response.data;
    },
    (error) => setError("Failed to load networks")
  );
};

const deleteNetwork = async () => {
  if (!networkToDelete.value) return;
  await executeWithLoading(
    async () => {
      await getApi().delete(
        `${CONFIG.ROUTES.V1_NETWORKS}/${networkToDelete.value!.code}`
      );
      await loadNetworks();
      networkToDelete.value = null;
    },
    (error) => setError("Delete failed")
  );
};

const createNetwork = async () => {
  await executeWithLoading(
    async () => {
      await getApi().post(CONFIG.ROUTES.V1_NETWORKS, newNetwork.value);
      await loadNetworks();
      newNetwork.value = { code: "", name: "", description: "" };

      const modal = document.getElementById("createNetworkModal");
      if (modal) {
        bootstrap.Modal.getOrCreateInstance(modal).hide();
      }
    },
    (error) => setError("Create failed")
  );
};

onMounted(loadNetworks);
</script>
