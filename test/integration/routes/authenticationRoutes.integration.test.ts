import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import { UserType } from "@models/UserType";
import { User as UserDTO } from "@dto/User";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";
import {
  initializeTestDataSource,
  closeTestDataSource,
  TestDataSource
} from "@test/setup/test-datasource"; 
import { UserDAO } from "@models/dao/UserDAO";

jest.mock("@services/authService");

  beforeAll(async () => {
    await initializeTestDataSource();
  });

  afterAll(async () => {
    await closeTestDataSource();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });


describe("AuthRoutes integration", () => {
  const mockWrongCredentials = {
    username: "s0123465",
    password: "wrongpassword",
  };

  const mockUser: UserDTO = {
    username: "s0123465",
    password: "FR90!5g@+ni",
    type: UserType.Admin
  };

  const mockDAO: UserDAO = {
    username: "s0123465",
    password: "FR90!5g@+ni",
    type: UserType.Admin
  };



  const mockToken = {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.dyt0CoTl4WoVjAHI9Q_CwSKhl6d_9rhM3NrXuJttkao",
    expiresIn: 3600
  };

  const bearerToken = `Bearer ${mockToken.token}`;

  describe("return bearer token - AuthRoutes integration", () => {
  
    it("should return token - success", async () => {
      (authService.generateToken as jest.Mock).mockReturnValue(mockToken.token);

      const userRepo = TestDataSource.getRepository(UserDAO);

      const newUser = userRepo.create({
        username: mockUser.username,
        password: mockUser.password,
        type: mockUser.type,
      });

      await userRepo.save(newUser);


      const response = await request(app)
          .post("/api/v1/auth")
          .send(mockUser)
          .expect(200);

      expect(response.body.token).toBe(mockToken.token);
      await userRepo.delete({ username: mockUser.username });
    });

    it("should return 400 BadRequestError", async () => {
      const response = await request(app)
        .post("/api/v1/auth")
        .send({password:"testpass"}) 
        .expect(400);

      expect(response.body).toMatchObject({
        code: 400,
        name: "Bad Request",
        message: expect.stringContaining("request/body must have required property 'username'")
      });
    });

    it("should return 401 UnauthorizedError", async () => {
      (authService.generateToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Invalid password");
      });

        const userRepo = TestDataSource.getRepository(UserDAO);

        const newUser = userRepo.create({
          username: mockUser.username,
          password: mockUser.password,
          type: mockUser.type,
        });

      await userRepo.save(newUser);

      const response = await request(app)
        .post("/api/v1/auth")
        .send(mockWrongCredentials)
        .expect(401);

      expect(response.body.message).toBe("Invalid password");
      await userRepo.delete({ username: mockUser.username });

    });

    it("should return 404 NotFoundError", async () => {
      (authService.generateToken as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("User with username '"+mockUser.username+"' not found");
      });

      const response = await request(app)
        .post("/api/v1/auth")
        .send(mockUser)
        .expect(404);

      expect(response.body).toMatchObject({
        code: 404,
        name:"NotFoundError",
        message: "User with username '"+mockUser.username+"' not found"
      });
    });
  });
});
