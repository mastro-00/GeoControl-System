import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";

describe("User CRUD Operations (e2e)", () => {
  let adminToken: string;
  let searchUsername: string;
  

  beforeAll(async () => {
    await beforeAllE2e();
    adminToken = generateToken(TEST_USERS.admin);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("GET /users - should get all users", async () => {
    const res = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);

    const usernames = res.body.map((u: any) => u.username).sort();
    const types = res.body.map((u: any) => u.type).sort();

    expect(usernames).toEqual(["admin", "operator", "viewer"]);
    expect(types).toEqual(["admin", "operator", "viewer"]);
  });

  it("POST /users - should create a new user", async () => {
    const newUser = {
      username: "newuser",
      password: "newpassword",
      type: "admin"
    };

    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(newUser);

    expect(res.status).toBe(201);
  });

  it("GET /users/:id - should get a single user", async () => {
    searchUsername = "newuser"
    const res = await request(app)
      .get(`/api/v1/users/${searchUsername}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.username).toBe(searchUsername);
    expect(res.body.type).toBe("admin");
  });

  it("DELETE /users/:id - should delete a user", async () => {
    searchUsername = "newuser"
    const getRes = await request(app)
      .get(`/api/v1/users/${searchUsername}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(getRes.status).toBe(200);

    const deleteRes = await request(app)
      .delete(`/api/v1/users/${searchUsername}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(deleteRes.status).toBe(204);

    const getAfterDelete = await request(app)
      .get(`/api/v1/users/${searchUsername}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(getAfterDelete.status).toBe(404);
  });

  it("should prevent non-admin users from creating users", async () => {
    const operatorToken = generateToken(TEST_USERS.operator);
    const newUser = {
      username: "unauthorized",
      password: "password",
      type: "operator"
    };

    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${operatorToken}`)
      .send(newUser);

    expect(res.status).toBe(403);
  });
});