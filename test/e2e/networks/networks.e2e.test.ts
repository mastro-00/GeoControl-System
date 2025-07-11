import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { UserType } from "@models/UserType";
import { NotFoundError } from "@models/errors/NotFoundError";

describe("Network End-to-End Tests", () => {
  let adminToken: string;
  let operatorToken: string;
  let viewerToken: string;
  const networkRepository = new NetworkRepository();
  const gatewayRepository = new GatewayRepository();

  beforeAll(async () => {
    await beforeAllE2e();
    adminToken = generateToken(TEST_USERS.admin);
    operatorToken = generateToken(TEST_USERS.operator);
    viewerToken = generateToken(TEST_USERS.viewer);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  describe("POST /api/v1/networks", () => {
    it("should create a new network (admin only)", async () => {
      const newNetwork = {
        code: "NET-001",
        name: "Test Network",
        description: "Test Description"
      };

      const res = await request(app)
        .post("/api/v1/networks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newNetwork);

      expect(res.status).toBe(201);
    });

    it("should reject duplicate network codes", async () => {
      const duplicateNetwork = {
        code: "NET-001",
        name: "Duplicate Network",
        description: "Should fail"
      };

      const res = await request(app)
        .post("/api/v1/networks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(duplicateNetwork);

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/already exists/i);
    });

  });

  describe("GET /api/v1/networks", () => {
    beforeAll(async () => {
      await networkRepository.createNetwork("NET-002", "Network 2", "Description 2");
    });

    it("should return all networks", async () => {
      const res = await request(app)
        .get("/api/v1/networks")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].code).toBe("NET-001");
      expect(res.body[1].code).toBe("NET-002");
    });

    it("should be accessible to all user types", async () => {
      const adminRes = await request(app)
        .get("/api/v1/networks")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(adminRes.status).toBe(200);

      const operatorRes = await request(app)
        .get("/api/v1/networks")
        .set("Authorization", `Bearer ${operatorToken}`);
      expect(operatorRes.status).toBe(200);

      const viewerRes = await request(app)
        .get("/api/v1/networks")
        .set("Authorization", `Bearer ${viewerToken}`);
      expect(viewerRes.status).toBe(200);
    });
  });

  describe("GET /api/v1/networks/:code", () => {
    it("should return a specific network", async () => {
      const res = await request(app)
        .get("/api/v1/networks/NET-001")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe("NET-001");
      expect(res.body.name).toBe("Test Network");
    });

    it("should return 404 for non-existent network", async () => {
      const res = await request(app)
        .get("/api/v1/networks/NON-EXISTENT")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/v1/networks/:code", () => {
    it("should update network details (admin only)", async () => {
      const updates = {
        name: "Updated Network Name",
        description: "Updated Description"
      };

      const res = await request(app)
        .patch("/api/v1/networks/NET-001")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updates);

      expect(res.status).toBe(204);

      const updated = await networkRepository.getNetworkByCode("NET-001");
      expect(updated.name).toBe(updates.name);
      expect(updated.description).toBe(updates.description);
    });
  });

  describe("DELETE /api/v1/networks/:code", () => {
    it("should delete a network (admin only)", async () => {
      await networkRepository.createNetwork("TEMP-NET", "Temp Network", "To be deleted");

      const res = await request(app)
        .delete("/api/v1/networks/TEMP-NET")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(204);

      await expect(networkRepository.getNetworkByCode("TEMP-NET"))
        .rejects.toThrow(NotFoundError);
    });
  });
});