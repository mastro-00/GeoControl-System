<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <router-link
        class="navbar-brand position-absolute start-50 translate-middle-x"
        to="/"
        >GeoControl</router-link
      >

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarContent"
        aria-controls="navbarContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div
        class="collapse navbar-collapse justify-content-end"
        id="navbarContent"
      >
        <ul class="navbar-nav mb-2 mb-lg-0 align-items-center">
          <li class="nav-item me-3">
            <span class="badge bg-light text-dark">
              Welcome {{ user?.username }}
              <template v-if="!userHasRole([UserType.Viewer])">
                ({{ user?.type }})</template
              >
            </span>
          </li>

          <li class="nav-item me-2" v-if="userHasRole([UserType.Admin])">
            <button
              class="btn btn-outline-light"
              @click="router.push('/users')"
            >
              Manage Users
            </button>
          </li>

          <li class="nav-item">
            <button class="btn btn-outline-danger" @click="logoutAndRedirect">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import { logout, userHasRole, getCurrentUser } from "@services/auth";
import { UserType } from "@models/UserType";

const router = useRouter();
const user = getCurrentUser();

const logoutAndRedirect = () => {
  logout();
  router.push("/login");
};
</script>
