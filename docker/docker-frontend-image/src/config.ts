const SERVER_V1_BASE_URL = "/api/v1";
const URL_AUTH = "/auth";
const URL_USERS = "/users";
const URL_NETWORKS = "/networks";
const URL_GATEWAYS = "/:networkCode/gateways";
const URL_SENSORS = "/:gatewayMac/sensors";
const URL_MEASUREMENTS = "/:sensorMac/measurements";

export const GLOBAL_LOADING = "global";

export const CONFIG = {
  APP_PORT: import.meta.env.FRONTEND_PORT || 5173,
  SERVER_PORT: import.meta.env.SERVER_PORT || 5000,
  SERVER_HOST: import.meta.env.SERVER_HOST || "localhost",

  ROUTES: {
    V1_AUTH: URL_AUTH,
    V1_USERS: URL_USERS,
    V1_NETWORKS: URL_NETWORKS,
    V1_GATEWAYS: URL_NETWORKS + URL_GATEWAYS,
    V1_SENSORS: URL_NETWORKS + URL_GATEWAYS + URL_SENSORS,
    V1_MEASUREMENTS:
      URL_NETWORKS + URL_GATEWAYS + URL_SENSORS + URL_MEASUREMENTS
  }
};

let SERVER_BASE_URL = `http://${CONFIG.SERVER_HOST}:${CONFIG.SERVER_PORT}${SERVER_V1_BASE_URL}`;

export function getServerUrl(): string {
  return SERVER_BASE_URL;
}

export async function loadRuntimeConfig(): Promise<void> {
  try {
    const response = await fetch(window.location.origin + "/config.json", {
      cache: "no-store"
    });
    if (response.ok) {
      const runtimeConfig = await response.json();

      if (runtimeConfig.FRONTEND_PORT)
        CONFIG.APP_PORT = Number(runtimeConfig.FRONTEND_PORT);
      if (runtimeConfig.SERVER_PORT)
        CONFIG.SERVER_PORT = Number(runtimeConfig.SERVER_PORT);
      if (runtimeConfig.SERVER_HOST)
        CONFIG.SERVER_HOST = runtimeConfig.SERVER_HOST;

      console.log(`server port: ${runtimeConfig.SERVER_PORT}`);

      SERVER_BASE_URL = `http://${CONFIG.SERVER_HOST}:${CONFIG.SERVER_PORT}${SERVER_V1_BASE_URL}`;
      console.log(SERVER_BASE_URL);
    } else {
      console.warn("config.json not found, using defaults");
    }
  } catch (e) {
    console.error(e);
    console.warn("Could not load config.json, using defaults");
  }
}
