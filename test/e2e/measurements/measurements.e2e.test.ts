import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { SensorRepository } from "@repositories/SensorRepository";
import { MeasurementRepository } from "@repositories/MeasurementRepository";

describe("Measurement End-to-End Tests", () => {
  let adminToken: string;
  let operatorToken: string;
  let viewerToken: string;
  const networkRepository = new NetworkRepository();
  const gatewayRepository = new GatewayRepository();
  const sensorRepository = new SensorRepository();
  const measurementRepository = new MeasurementRepository();

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
    await sensorRepository.createSensor(
      networkCode,
      gatewayMac,
      sensorMac,
      sensorName,
      sensorDescription,
      sensorVariable,
      sensorUnit
    );
  });

  afterAll(async () => {
    await afterAllE2e();
  });


describe("POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements", () => {
  it("should create a new measurement (operator and admin only)", async () => {
    const newMeasurement = [{
      value: 25.5,
      createdAt: new Date().toISOString(),
      isOutlier: false
    }];

    const adminRes = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(newMeasurement);

    expect(adminRes.status).toBe(201);

    const operatorRes = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
      .set("Authorization", `Bearer ${operatorToken}`)
      .send(newMeasurement);

    expect(operatorRes.status).toBe(201);
  });

  it("should prevent viewer from creating measurements", async () => {
    const newMeasurement = [{
      value: 25.5,
      createdAt: new Date().toISOString(),
      isOutlier: false
    }];

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
      .set("Authorization", `Bearer ${viewerToken}`)
      .send(newMeasurement);

    expect(res.status).toBe(403);
  });

  it("should return 404 for non-existent sensor", async () => {
    const newMeasurement = [{
      value: 25.5,
      createdAt: new Date().toISOString(),
      isOutlier: false
    }];

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/NON_EXISTENT/measurements`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(newMeasurement);

    expect(res.status).toBe(404);
  });
});

  describe("GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/measurements", () => {
    it("should return measurements for a sensor with stats", async () => {
      const testDate = new Date("2023-01-01T12:00:00Z");
      await measurementRepository.createMeasurement(
        networkCode,
        gatewayMac,
        sensorMac,
        testDate,
        25.5
      );

      const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.sensorMacAddress).toBe(sensorMac);
      expect(res.body.measurements.length).toBe(3);
      expect(res.body.measurements[0].value).toBe(25.5);
      expect(res.body.stats).toBeDefined();
    });

    it("should be accessible to all user types", async () => {
      const adminRes = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(adminRes.status).toBe(200);

      const operatorRes = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
        .set("Authorization", `Bearer ${operatorToken}`);
      expect(operatorRes.status).toBe(200);

      const viewerRes = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`)
        .set("Authorization", `Bearer ${viewerToken}`);
      expect(viewerRes.status).toBe(200);
    });
  });

  describe("GET /api/v1/networks/:networkCode/measurements", () => {
    it("should return measurements for all sensors in network", async () => {
      await measurementRepository.createMeasurement(
        networkCode,
        gatewayMac,
        sensorMac,
        new Date(),
        25.5
      );

      const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/measurements`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].sensorMacAddress).toBe(sensorMac);
    });
  });

  describe("GET /api/v1/networks/:networkCode/stats", () => {
    it("should return statistics for all measurements in network", async () => {
      await measurementRepository.createMeasurement(
        networkCode,
        gatewayMac,
        sensorMac,
        new Date(),
        10
      );
      await measurementRepository.createMeasurement(
        networkCode,
        gatewayMac,
        sensorMac,
        new Date(),
        20
      );

      const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/stats`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/networks/:networkCode/outliers", () => {
    it("should return outlier measurements for network", async () => {
      await measurementRepository.createMeasurement(
        networkCode,
        gatewayMac,
        sensorMac,
        new Date(),
        10
      );
      await measurementRepository.createMeasurement(
        networkCode,
        gatewayMac,
        sensorMac,
        new Date(),
        100 // This should be an outlier
      );

      const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/outliers`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].measurements[0].value).toBe(100);
      expect(res.body[0].measurements[0].isOutlier).toBe(true);
    });
  });

  describe("GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/stats", () => {
    it("should return statistics for a specific sensor", async () => {
      await measurementRepository.createMeasurement(
        networkCode,
        gatewayMac,
        sensorMac,
        new Date(),
        10
      );
      await measurementRepository.createMeasurement(
        networkCode,
        gatewayMac,
        sensorMac,
        new Date(),
        20
      );

      const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/stats`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac/outliers", () => {
    it("should return outlier measurements for a specific sensor", async () => {
      await measurementRepository.createMeasurement(
        networkCode,
        gatewayMac,
        sensorMac,
        new Date(),
        10
      );
      await measurementRepository.createMeasurement(
        networkCode,
        gatewayMac,
        sensorMac,
        new Date(),
        100 
      );

      const res = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/outliers`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });
});