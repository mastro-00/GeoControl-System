import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as userController from "@controllers/userController";
import { UserType } from "@models/UserType";
import { User as UserDTO } from "@dto/User";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { closeTestDataSource, initializeTestDataSource, TestDataSource } from "@test/setup/test-datasource";

jest.mock("@services/authService");
jest.mock("@controllers/userController");

  beforeAll(async () => {
    await initializeTestDataSource();
  });

  afterAll(async () => {
    await closeTestDataSource();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });


const token = "Bearer faketoken";

const mockUser: UserDTO = {
  username: "newuser",
  password:"newpass",
  type: UserType.Admin
};

describe("get all users - UserRoutes integration", () => {
  afterEach(() => jest.clearAllMocks());

  it("get all users: 200", async () => {
    const mockUsers: UserDTO[] = [
      { username: "admin", type: UserType.Admin },
      { username: "viewer", type: UserType.Viewer }
    ];

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUsers);
    expect(authService.processToken).toHaveBeenCalledWith(token, [UserType.Admin]);
    expect(userController.getAllUsers).toHaveBeenCalled();
  });

  it("get all users: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("get all users: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden: Insufficient rights");
    });

    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", token);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });

});

describe("create new user - UserRoutes integration", () => {
  afterEach(() => jest.clearAllMocks());

  it("create new user: 201", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(token);
    (userController.createUser as jest.Mock).mockResolvedValue(mockUser);

    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", token)
      .send(mockUser);

    expect(response.status).toBe(201);
    expect(userController.createUser).toHaveBeenCalledWith(expect.anything());
  });

  
  it("create new user: 400 BadRequestError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(token);

    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", token)
      .send({  password:"newpass",
  type: UserType.Admin});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("request/body must have required property 'username'");
  });
  
  it("create new user: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", "Bearer invalid")
      .send(mockUser);

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("create new user: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden: Insufficient rights");
    });

    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", token)
      .send(mockUser);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });

  it("create new user: 409 ConflictError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.createUser as jest.Mock).mockRejectedValue(
      new ConflictError("User already exists")
    );

    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", token)
      .send(mockUser);

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("User already exists");
  });
});

describe("get user from userName - UserRoutes integration", () => {
  const token = "Bearer faketoken";
  const username = "admin";
  const user: UserDTO = { username, type: UserType.Admin };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("get user from userName: 200", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.getUser as jest.Mock).mockResolvedValue(user);

    const response = await request(app)
      .get(`/api/v1/users/${username}`)
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(user);
  });

  it("get user from userName: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const response = await request(app)
      .get(`/api/v1/users/${username}`)
      .set("Authorization", token);

    expect(response.status).toBe(401); 
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("get user from userName: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Insufficient rights");
    });

    const response = await request(app)
      .get(`/api/v1/users/${username}`)
      .set("Authorization", token);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });

  it("get user from userName: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.getUser as jest.Mock).mockRejectedValue(
      new NotFoundError("User not found")
    );

    const response = await request(app)
      .get(`/api/v1/users/${username}`)
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/User not found/);
  });
});

describe("delete user - UserRoutes integration", () => {
  const token = "Bearer faketoken";
  const username = "admin";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("delete user: 204", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.deleteUser as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .delete(`/api/v1/users/${username}`)
      .set("Authorization", token);

    expect(response.status).toBe(204);
    expect(userController.deleteUser).toHaveBeenCalledWith(username);
  });

  it("delete user: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized");
    });

    const response = await request(app)
      .delete(`/api/v1/users/${username}`)
      .set("Authorization", token);

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("delete user: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Insufficient rights");
    });

    const response = await request(app)
      .delete(`/api/v1/users/${username}`)
      .set("Authorization", token);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });

  it("delete user: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.deleteUser as jest.Mock).mockRejectedValue(
      new NotFoundError("User not found")
    );

    const response = await request(app)
      .delete(`/api/v1/users/${username}`)
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/User not found/);
  });
});