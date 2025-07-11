import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as networkController from "@controllers/networkController";
import { UserType } from "@models/UserType";
import { Network as NetworkDTO } from "@models/dto/Network";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";

jest.mock("@services/authService");
jest.mock("@controllers/networkController");

const token = "Bearer faketoken";
const netcode = "NET123";
const mockNetwork: NetworkDTO = {
  code: netcode,
  name: "Test Network",
  gateways: [],
};

describe("get all networks - NetworkRoutes integration", () => {
  afterEach(() => jest.clearAllMocks());

  it("get all networks: 200", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getAllNetworks as jest.Mock).mockResolvedValue([mockNetwork]);

    const res = await request(app).get("/api/v1/networks").set("Authorization", token);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([mockNetwork]);
  });

  it("get all networks: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const res = await request(app).get("/api/v1/networks").set("Authorization", token);
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Unauthorized/);
  });
});

describe("create a new network - NetworkRoutes integration", () => {
  afterEach(() => jest.clearAllMocks());

  it("create network: 201", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.createNetwork as jest.Mock).mockResolvedValue(mockNetwork);

    const res = await request(app)
      .post("/api/v1/networks")
      .set("Authorization", token)
      .send(mockNetwork);

    expect(res.status).toBe(201);
  });

  it("create network: 400 BadRequestError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app).post("/api/v1/networks").set("Authorization", token).send({});

   expect(res.body).toMatchObject({
        code: 400,
        name: "Bad Request",
        message: expect.stringContaining("request/body must have required property 'code'")
      });
  });

  it("create network: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const res = await request(app).post("/api/v1/networks").set("Authorization", token).send(mockNetwork);
    expect(res.status).toBe(401);
  });

  it("create network: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden");
    });

    const res = await request(app).post("/api/v1/networks").set("Authorization", token).send(mockNetwork);
    expect(res.status).toBe(403);
  });

  it("create network: 409 ConflictError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.createNetwork as jest.Mock).mockRejectedValue(new ConflictError("Already exists"));

    const res = await request(app).post("/api/v1/networks").set("Authorization", token).send(mockNetwork);
    expect(res.status).toBe(409);
  });
});

describe("get a network by netCode - NetworkRoutes integration", () => {
  afterEach(() => jest.clearAllMocks());

  it("get network: 200", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getNetwork as jest.Mock).mockResolvedValue(mockNetwork);

    const res = await request(app).get(`/api/v1/networks/${netcode}`).set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockNetwork);
  });

  it("get network: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const res = await request(app).get(`/api/v1/networks/${netcode}`).set("Authorization", token);
    expect(res.status).toBe(401);
  });

  it("get network: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getNetwork as jest.Mock).mockRejectedValue(new NotFoundError("Not found"));

    const res = await request(app).get(`/api/v1/networks/${netcode}`).set("Authorization", token);
    expect(res.status).toBe(404);
  });
});

describe("patch a network - NetworkRoutes integration", () => {
  afterEach(() => jest.clearAllMocks());

  it("network updated: 204", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.updateNetwork as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app)
      .patch(`/api/v1/networks/${netcode}`)
      .set("Authorization", token)
      .send({ name: "Updated Name" });

    expect(res.status).toBe(204);
  });

  
    it("network updated: 400 Invalid Input Data", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(token); 
      const res = await request(app)
        .patch(`/api/v1/networks/${netcode}`)
        .send({code:13})
        .set("Authorization", token);
  
       expect(res.status).toBe(400)
    });
  

  it("network updated: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const res = await request(app).patch(`/api/v1/networks/${netcode}`).set("Authorization", token).send({});
    expect(res.status).toBe(401);
  });

  it("network updated: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden");
    });

    const res = await request(app).patch(`/api/v1/networks/${netcode}`).set("Authorization", token).send({});
    expect(res.status).toBe(403);
  });

  it("network updated: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.updateNetwork as jest.Mock).mockRejectedValue(new NotFoundError("Not found"));

    const res = await request(app).patch(`/api/v1/networks/${netcode}`).set("Authorization", token).send({});
    expect(res.status).toBe(404);
  });

  it("network updated: 409 ConflictError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.updateNetwork as jest.Mock).mockRejectedValue(new ConflictError("Conflict"));

    const res = await request(app).patch(`/api/v1/networks/${netcode}`).set("Authorization", token).send({});
    expect(res.status).toBe(409);
  });
});

describe("delete a network - NetworkRoutes integration", () => {
  afterEach(() => jest.clearAllMocks());

  it("network deleted: 204", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.deleteNetwork as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app).delete(`/api/v1/networks/${netcode}`).set("Authorization", token);
    expect(res.status).toBe(204);
  });

  it("network deleted: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const res = await request(app).delete(`/api/v1/networks/${netcode}`).set("Authorization", token);
    expect(res.status).toBe(401);
  });

  it("network deleted: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden");
    });

    const res = await request(app).delete(`/api/v1/networks/${netcode}`).set("Authorization", token);
    expect(res.status).toBe(403);
  });

  it("network deleted: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.deleteNetwork as jest.Mock).mockRejectedValue(new NotFoundError("Not found"));

    const res = await request(app).delete(`/api/v1/networks/${netcode}`).set("Authorization", token);
    expect(res.status).toBe(404);
  });
});
