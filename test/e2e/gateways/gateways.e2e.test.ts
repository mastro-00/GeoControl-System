import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { SensorRepository } from "@repositories/SensorRepository";
import { NotFoundError } from "@models/errors/NotFoundError";

describe("Gateway End-to-End Tests", () => {
  let adminToken: string;
  let operatorToken: string;
  let viewerToken: string;
  const networkRepository = new NetworkRepository();
  const gatewayRepository = new GatewayRepository();
  const sensorRepository = new SensorRepository();

  const networkCode = "TEST_NET";
  const gatewayMac = "AA:BB:CC:DD:EE:FF";
  const gatewayName = "Test Gateway";
  const gatewayDescription = "Test Description";

  beforeAll(async () => {
    await beforeAllE2e();
    adminToken = generateToken(TEST_USERS.admin);
    operatorToken = generateToken(TEST_USERS.operator);
    viewerToken = generateToken(TEST_USERS.viewer);
    
    await networkRepository.createNetwork(networkCode, "Test Network", "Description");
  });

  afterAll(async () => {
    await afterAllE2e();
  });



  describe("POST /api/v1/networks/:networkCode/gateways", () => {
    it("should create a new gateway (admin only)", async () => {
      const newGateway = {
        macAddress: gatewayMac,
        name: gatewayName,
        description: gatewayDescription
      };

      const res = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newGateway);

      expect(res.status).toBe(201);
    });

    it("should reject duplicate MAC addresses", async () => {

      const duplicateGateway = {
        macAddress: gatewayMac, 
        name: "Duplicate Gateway",
        description: "Should fail"
      };

      const res = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(duplicateGateway);

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch("Gateway with mac '"+duplicateGateway.macAddress+"' already exists");
    });


  });

  describe("GET /api/v1/networks/:networkCode/gateways", () => {
    it("should return all gateways in a network", async () => {
      await gatewayRepository.createGateway(networkCode, "11:22:33:44:55:66", "Gateway 2", "Desc 2");

      const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].macAddress).toBe("AA:BB:CC:DD:EE:FF");
      expect(res.body[1].macAddress).toBe("11:22:33:44:55:66");
    });

    it("should be accessible to all user types", async () => {
      const adminRes = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(adminRes.status).toBe(200);

      const operatorRes = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", `Bearer ${operatorToken}`);
      expect(operatorRes.status).toBe(200);

      const viewerRes = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", `Bearer ${viewerToken}`);
      expect(viewerRes.status).toBe(200);
    });
  });

  describe("GET /api/v1/networks/:networkCode/gateways/:gatewayMac", () => {
    it("should return a specific gateway", async () => {

      const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.macAddress).toBe(gatewayMac);
      expect(res.body.name).toBe(gatewayName);
    });

    it("should return 404 for non-existent gateway", async () => {
      const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/NON_EXISTENT`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac", () => {
    beforeEach(async () => {
    });

    it("should update gateway details (admin only)", async () => {
      const updates = {
        macAddress: "FF:FF:FF:FF:FF:FF", 
        name: "Updated Name",
        description: "Updated Description"
      };

      const res = await request(app)
        .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updates);

      expect(res.status).toBe(204);

      const updated = await gatewayRepository.getGatewayByMac(networkCode, updates.macAddress);
      expect(updated.name).toBe(updates.name);
      expect(updated.description).toBe(updates.description);
    });

  });

  describe("DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac", () => {
    it("should delete a gateway (admin only)", async () => {
        await gatewayRepository.createGateway(networkCode, "TEMP_MAC", "Temp Gateway", "To be deleted");

      const res = await request(app)
        .delete(`/api/v1/networks/${networkCode}/gateways/TEMP_MAC`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(204);

      await expect(gatewayRepository.getGatewayByMac(networkCode, "TEMP_MAC"))
        .rejects.toThrow(NotFoundError);
    });

  });
});