import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as sensorController from "@controllers/sensorController";
import { Sensor as SensorDTO } from "@models/dto/Sensor";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

jest.mock("@services/authService");
jest.mock("@controllers/sensorController");

const token = "Bearer faketoken";
const networkCode = "NET-001";
const gatewayMac = "94:3F:BE:4C:4A:79";
const sensorMAC = "14:32:AC:5D:1B:63";

afterEach(() => jest.clearAllMocks());

describe("get all sensors - SensorRoutes integration", () => {
  it("200: returns all sensors", async () => {
    const sensors: SensorDTO[] = [{ macAddress: sensorMAC, name: "Sensor1", description: "desc", variable:"temperature" , unit:"C" }];
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.getSensorsByGateway as jest.Mock).mockResolvedValue(sensors);

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .set("Authorization", token);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(sensors);
  });

  it("401: UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .set("Authorization", "invalid");

    expect(res.status).toBe(401);
  });

  it("404: NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.getSensorsByGateway as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Not found");
    });

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .set("Authorization", token);

    expect(res.status).toBe(404);
  });
});

describe("create a sensor - SensorRoutes integration", () => {
  const newSensor: SensorDTO = {
    macAddress: sensorMAC,
    name: "SensorX",
    description: "A new sensor"
  };

  it("201: sensor created", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.createSensor as jest.Mock).mockResolvedValue(newSensor);

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .send(newSensor)
      .set("Authorization", token);

    expect(res.status).toBe(201);
  });

  it("400: Invalid body", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .send({})
      .set("Authorization", token);

      expect(res.body).toMatchObject({
        code: 400,
        name: "Bad Request",
        message: "request/body must have required property 'macAddress'"
      });
  });

  it("401: UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .send(newSensor)
      .set("Authorization", "invalid");

    expect(res.status).toBe(401);
  });

  it("403: InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden");
    });

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .send(newSensor)
      .set("Authorization", token);

    expect(res.status).toBe(403);
  });

  it("404: NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.createSensor as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Not found");
    });

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .send(newSensor)
      .set("Authorization", token);

    expect(res.status).toBe(404);
  });

  it("409: ConflictError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.createSensor as jest.Mock).mockImplementation(() => {
      throw new ConflictError("Conflict");
    });

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .send(newSensor)
      .set("Authorization", token);

    expect(res.status).toBe(409);
  });
});

describe("get a sensor - SensorRoutes integration", () => {
  it("200: returns sensor", async () => {
    const sensor: SensorDTO = { macAddress: sensorMAC, name: "Sensor1", description: "desc" };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.getSensorByMac as jest.Mock).mockResolvedValue(sensor);

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMAC}`)
      .set("Authorization", token);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(sensor);
  });

  it("401: UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMAC}`)
      .set("Authorization", "invalid");

    expect(res.status).toBe(401);
  });

  it("404: NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.getSensorByMac as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Not found");
    });

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMAC}`)
      .set("Authorization", token);

    expect(res.status).toBe(404);
  });
});

describe("update a sensor - SensorRoutes integration", () => {
  const updateData = {
    macAddress: sensorMAC,
    name: "Updated Sensor",
    description: "Updated Desc"
  };

  it("204: update successful", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.updateSensor as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app)
      .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMAC}`)
      .send(updateData)
      .set("Authorization", token);

    expect(res.status).toBe(204);
  });

  it("400: invalid input", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(token);
    (sensorController.updateSensor as jest.Mock).mockResolvedValue(undefined)
    const res = await request(app)
      .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMAC}`)
      .send({macAddress:1})
      .set("Authorization", token);

      expect(res.status).toBe(400)
  });

  it("401: UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const res = await request(app)
      .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMAC}`)
      .send(updateData)
      .set("Authorization", "invalid");

    expect(res.status).toBe(401);
  });

  it("403: InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden");
    });

    const res = await request(app)
      .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMAC}`)
      .send(updateData)
      .set("Authorization", token);

    expect(res.status).toBe(403);
  });

  it("404: NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.updateSensor as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Not found");
    });

    const res = await request(app)
      .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMAC}`)
      .send(updateData)
      .set("Authorization", token);

    expect(res.status).toBe(404);
  });

  it("409: ConflictError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.updateSensor as jest.Mock).mockImplementation(() => {
      throw new ConflictError("Conflict");
    });

    const res = await request(app)
      .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMAC}`)
      .send(updateData)
      .set("Authorization", token);

    expect(res.status).toBe(409);
  });
});

describe("delete a sensor - SensorRoutes integration", () => {
  it("204: sensor deleted", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.deleteSensor as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app)
      .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMAC}`)
      .set("Authorization", token);

    expect(res.status).toBe(204);
  });

  it("401: UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const res = await request(app)
      .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMAC}`)
      .set("Authorization", "invalid");

    expect(res.status).toBe(401);
  });

  it("403: InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden");
    });

    const res = await request(app)
      .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMAC}`)
      .set("Authorization", token);

    expect(res.status).toBe(403);
  });

  it("404: NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.deleteSensor as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Not found");
    });

    const res = await request(app)
      .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMAC}`)
      .set("Authorization", token);

    expect(res.status).toBe(404);
  });
});
