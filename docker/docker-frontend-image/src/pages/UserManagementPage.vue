<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <h2 class="mb-3">Users</h2>

        <div class="mb-3 d-flex gap-2">
          <button class="btn btn-success" @click="openModal">
            Create User
          </button>
          <button
            class="btn btn-danger"
            :disabled="!selectedUser"
            @click="askDeleteUser"
          >
            Delete Selected
          </button>
        </div>

        <ItemList
          v-model:selected="selectedUser"
          :items="users"
          :keyFn="(u) => u.username"
          :displayFn="(u) => `${u.username} - ${u.type}`"
        />
      </div>
    </div>

    <!-- Confirm Modal -->
    <ConfirmModal
      :show="showConfirm"
      type="user"
      :name="userToDelete?.username ?? ''"
      :code="userToDelete?.type ?? ''"
      :onConfirm="deleteUser"
      @update:show="showConfirm = $event"
    />

    <!-- Create User Modal -->
    <div
      class="modal fade"
      id="createUserModal"
      tabindex="-1"
      aria-labelledby="createUserModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="createUserModalLabel">Create User</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" />
          </div>
          <div class="modal-body">
            <UserForm @submit="createUser" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import type { User } from "@models/User";
import getApi from "@services/api";
import { CONFIG } from "@config";
import { executeWithLoading } from "@services/loading";
import * as bootstrap from "bootstrap";

import UserForm from "@components/UserForm.vue";
import ItemList from "@components/ItemList.vue";
import ConfirmModal from "@components/ConfirmModal.vue";
import { setError } from "@services/error";

const users = ref<User[]>([]);
const selectedUser = ref<User | null>(null);
const showConfirm = ref(false);
const userToDelete = ref<User | null>(null);

const loadUsers = async () => {
  await executeWithLoading(
    async () => {
      const res = await getApi().get<User[]>(CONFIG.ROUTES.V1_USERS);
      users.value = res.data;
    },
    (error) => setError(`Failed to load users: ${error}`)
  );
};

const openModal = () => {
  const modal = document.getElementById("createUserModal");
  if (modal) {
    bootstrap.Modal.getOrCreateInstance(modal).show();
  }
};

const askDeleteUser = () => {
  if (!selectedUser.value) return;
  userToDelete.value = selectedUser.value;
  showConfirm.value = true;
};

const deleteUser = async () => {
  if (!userToDelete.value) return;
  await executeWithLoading(
    async () => {
      await getApi().delete(
        `${CONFIG.ROUTES.V1_USERS}/${userToDelete.value!.username}`
      );
      userToDelete.value = null;
      selectedUser.value = null;
      await loadUsers();
    },
    async (error) => {
      setError(`Delete failed: ${error}`);
    }
  );
};

const createUser = async (user: {
  username: string;
  password: string;
  type: string;
}) => {
  await executeWithLoading(
    async () => {
      await getApi().post(CONFIG.ROUTES.V1_USERS, user);
      await loadUsers();
      const modal = document.getElementById("createUserModal");
      if (modal) {
        bootstrap.Modal.getOrCreateInstance(modal).hide();
      }
    },
    async (error) => {
      setError(`Failed to create user: ${error}`);
      await loadUsers();
    }
  );
};

onMounted(loadUsers);
</script>
