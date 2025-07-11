import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "@pages/LoginPage.vue";
import HomePage from "@pages/HomePage.vue";
import EditNetworkPage from "@pages/EditNetworkPage.vue";
import UserManagementPage from "@pages/UserManagementPage.vue";
import MonitorPage from "@pages/MonitorPage.vue";
import AccessDeniedPage from "@pages/AccessDeniedPage.vue";
import { UserType } from "@models/UserType";
import { userHasRole, isAuthenticated } from "@services/auth";
import NotFoundPage from "@pages/NotFoundPage.vue";

const routes = [
  { path: "/login", component: LoginPage },
  { path: "/", component: HomePage, meta: { requiresAuth: true } },
  {
    path: "/users",
    component: UserManagementPage,
    meta: { requiresAuth: true, roles: [UserType.Admin] }
  },
  {
    path: "/edit/:code",
    component: EditNetworkPage,
    meta: { requiresAuth: true, roles: [UserType.Admin, UserType.Operator] }
  },
  {
    path: "/monitor/:code",
    component: MonitorPage,
    meta: { requiresAuth: true }
  },
  { path: "/denied", component: AccessDeniedPage },
  { path: "/:pathMatch(.*)*", component: NotFoundPage }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth as boolean | undefined;
  const roles = to.meta.roles as UserType[] | undefined;

  if (!requiresAuth) return next();

  if (!isAuthenticated.value) {
    return next("/login");
  }

  if (roles && !userHasRole(roles)) {
    return next("/denied");
  }

  next();
});

export default router;
