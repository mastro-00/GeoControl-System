import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as gatewayController from "@controllers/gatewayController";
import { Gateway as GatewayDTO } from "@models/dto/Gateway";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import exp from "constants";

jest.mock("@services/authService");
jest.mock("@controllers/gatewayController");

const token = "Bearer faketoken";
const networkCode = "NET-001";
const gatewayMac = "94:3F:BE:4C:4A:79";

afterEach(() => jest.clearAllMocks());

describe("get all gateways - GatewayRoutes integration", () => {
  it("get all gateways: 200", async () => {
    const gateways: GatewayDTO[] = [{ macAddress: gatewayMac, name: "GW01", description: "desc" }];
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.getGatewaysByNetwork as jest.Mock).mockResolvedValue(gateways);

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways`)
      .set("Authorization", token);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(gateways);
  });

  it("get all gateways: 401 UnauthorizedError", async () => {
  const res = await request(app)
    .get(`/api/v1/networks/${networkCode}/gateways`)
    .set("Authorization", "invalid");

  expect(res.status).toBe(401);
  expect(res.body.message).toMatch("Authorization header with scheme 'Bearer' required");
  });

  it("get all gateways: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.getGatewaysByNetwork as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Entity not found");
    });

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways`)
      .set("Authorization", token);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/Entity not found/)
  });
});

describe("create a gateway for a network - GatewayRoutes integration", () => {
  const newGateway: GatewayDTO = {
    macAddress: gatewayMac,
    name: "New Gateway",
    description: "New description"
  };

  it("create a gateway for a network: 201", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.createGateway as jest.Mock).mockResolvedValue(newGateway);

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways`)
      .send(newGateway)
      .set("Authorization", token);

    expect(res.status).toBe(201);
  });

  it("create a gateway for a network: 400 Bad Request", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(token);

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways`)
      .send({}) 
      .set("Authorization", token);

       expect(res.body).toMatchObject({
        code: 400,
        name: "Bad Request",
        message: "request/body must have required property 'macAddress'"
      });
  });

  it("create a gateway for a network: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways`)
      .send(newGateway)
      .set("Authorization", "invalid");

    expect(res.status).toBe(401);
  });

  it("create a gateway for a network: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden");
    });

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways`)
      .send({ macAddress: gatewayMac })
      .set("Authorization", token);

    expect(res.status).toBe(403);
  });

  it("create a gateway for a network: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.createGateway as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Entity not found");
    });

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways`)
      .send(newGateway)
      .set("Authorization", token);

    expect(res.status).toBe(404);
  });

  it("create a gateway for a network: 409 ConflictError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.createGateway as jest.Mock).mockImplementation(() => {
      throw new ConflictError("Conflict");
    });

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways`)
      .send(newGateway)
      .set("Authorization", token);

    expect(res.status).toBe(409);
  });
});

describe("get gateway by gateway MAC - GatewayRoutes integration", () => {
  it("200: returns a gateway", async () => {
    const gateway: GatewayDTO = {
      macAddress: gatewayMac,
      name: "GW01",
      description: "desc"
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.getGateway as jest.Mock).mockResolvedValue(gateway);

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
      .set("Authorization", token);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(gateway);
  });

  it("401: UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
      .set("Authorization", "invalid");

    expect(res.status).toBe(401);
  });

  it("404: NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.getGateway as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Entity not found");
    });

    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
      .set("Authorization", token);

    expect(res.status).toBe(404);
  });
});

describe("patch gateway - GatewayRoutes integration", () => {
  const updateBody = {
    macAddress: gatewayMac,
    name: "Updated Name",
    description: "Updated Description"
  };

  it("204: updates a gateway successfully", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.updateGateway as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app)
      .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
      .send(updateBody)
      .set("Authorization", token);

    expect(res.status).toBe(204);
  });

  it("400: Invalid Input Data", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(token); 
    
    const res = await request(app)
      .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
      .send({macAddress:13})
      .set("Authorization", token);

     expect(res.status).toBe(400)
  });

  it("401: UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const res = await request(app)
      .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
      .send(updateBody)
      .set("Authorization", "invalid");

    expect(res.status).toBe(401);
  });

  it("403: InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden");
    });

    const res = await request(app)
      .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
      .send(updateBody)
      .set("Authorization", token);

    expect(res.status).toBe(403);
  });

  it("404: NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.updateGateway as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Entity not found");
    });

    const res = await request(app)
      .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
      .send(updateBody)
      .set("Authorization", token);

    expect(res.status).toBe(404);
  });

  it("409: ConflictError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.updateGateway as jest.Mock).mockImplementation(() => {
      throw new ConflictError("Conflict");
    });

    const res = await request(app)
      .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
      .send(updateBody)
      .set("Authorization", token);

    expect(res.status).toBe(409);
  });
});

describe("delete gateway - GatewayRoutes integration", () => {
  it("204: gateway deleted", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.deleteGateway as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app)
      .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
      .set("Authorization", token);

    expect(res.status).toBe(204);
  });

  it("401: UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const res = await request(app)
      .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
      .set("Authorization", "invalid");

    expect(res.status).toBe(401);
  });

  it("403: InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden");
    });

    const res = await request(app)
      .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
      .set("Authorization", token);

    expect(res.status).toBe(403);
  });

  it("404: NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.deleteGateway as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Entity not found");
    });

    const res = await request(app)
      .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
      .set("Authorization", token);

    expect(res.status).toBe(404);
  });
});
