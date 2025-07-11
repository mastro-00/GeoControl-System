import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { SensorRepository } from "@repositories/SensorRepository";
import { NotFoundError } from "@models/errors/NotFoundError";

describe("Sensor End-to-End Tests", () => {
  let adminToken: string;
  let operatorToken: string;
  let viewerToken: string;
  const networkRepository = new NetworkRepository();
  const gatewayRepository = new GatewayRepository();
  const sensorRepository = new SensorRepository();

  const networkCode = "TEST_NET";
  const gatewayMac = "AA:BB:CC:DD:EE:FF";
  const sensorMac = "11:22:33:44:55:66";
  const sensorName = "Test Sensor";
  const sensorDescription = "Test Description";
  const sensorVariable = "temperature";
  const sensorUnit = "°C";

  beforeAll(async () => {
    await beforeAllE2e();
    adminToken = generateToken(TEST_USERS.admin);
    operatorToken = generateToken(TEST_USERS.operator);
    viewerToken = generateToken(TEST_USERS.viewer);
    
    await networkRepository.createNetwork(networkCode, "Test Network", "Description");
    await gatewayRepository.createGateway(networkCode, gatewayMac, "Test Gateway", "Description");
  });

  afterAll(async () => {
    await afterAllE2e();
  });


  describe("POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors", () => {
    it("should create a new sensor (admin only)", async () => {
      const newSensor = {
        macAddress: sensorMac,
        name: sensorName,
        description: sensorDescription,
        variable: sensorVariable,
        unit: sensorUnit
      };

      const res = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newSensor);

      expect(res.status).toBe(201);


      // Verify in database
      const created = await sensorRepository.getSensorByMac(networkCode, gatewayMac, sensorMac);
      expect(created.name).toBe(sensorName);
    });
  });

  describe("GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors", () => {
    it("should return all sensors in a gateway", async () => {
      await sensorRepository.createSensor(
        networkCode,
        gatewayMac,
        "AA:BB:CC:DD:EE:FF",
        "Sensor 1",
        "Desc 1",
        "temperature",
        "°C"
      );
      const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].macAddress).toBe("11:22:33:44:55:66");
      expect(res.body[1].macAddress).toBe("AA:BB:CC:DD:EE:FF");
    });

    it("should be accessible to all user types", async () => {
      const adminRes = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(adminRes.status).toBe(200);

      const operatorRes = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
        .set("Authorization", `Bearer ${operatorToken}`);
      expect(operatorRes.status).toBe(200);

      const viewerRes = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
        .set("Authorization", `Bearer ${viewerToken}`);
      expect(viewerRes.status).toBe(200);
    });
  });

  describe("GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac", () => {
    it("should return a specific sensor", async () => {
      const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.macAddress).toBe(sensorMac);
      expect(res.body.name).toBe(sensorName);
    });

    it("should return 404 for non-existent sensor", async () => {
      const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/NON_EXISTENT`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac", () => {
    it("should update sensor details (admin only)", async () => {
      const updates = {
        macAddress: "FF:FF:FF:FF:FF:FF", 
        name: "Updated Sensor",
        description: "Updated Description",
        variable: "humidity",
        unit: "%"
      };

      const res = await request(app)
        .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updates);

      expect(res.status).toBe(204);
      const updated = await sensorRepository.getSensorByMac(networkCode, gatewayMac, updates.macAddress);
      expect(updated.name).toBe(updates.name);
      expect(updated.description).toBe(updates.description);
      expect(updated.variable).toBe(updates.variable);
      expect(updated.unit).toBe(updates.unit);
    });
  });

  describe("DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac", () => {
    it("should delete a sensor (admin only)", async () => {
      await sensorRepository.createSensor(
        networkCode,
        gatewayMac,
        "TEMP_MAC",
        "Temp Sensor",
        "To be deleted",
        "pressure",
        "hPa"
      );
    

      const res = await request(app)
        .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/TEMP_MAC`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(204);

      await expect(sensorRepository.getSensorByMac(networkCode, gatewayMac, "TEMP_MAC"))
        .rejects.toThrow(NotFoundError);
    });
  });
});