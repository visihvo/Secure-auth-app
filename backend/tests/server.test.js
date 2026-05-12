const request = require("supertest");
const { app, startServer, redisClient } = require("../server");

let server;

beforeAll(async () => {
    server = await startServer();
});

afterAll(async () => {
    await redisClient.quit();

    if (server) {
        server.close();
    }
});

describe("API Tests", () => {
  test("GET /api/csrf-token should return token", async () => {
    const res = await request(app).get("/api/csrf-token");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("csrfToken");
  });
});

describe("Auth routes", () => {
  test("POST /api/auth/login should respond (not crash)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "password123"
      });

    expect([200, 400, 401]).toContain(res.statusCode);
  });
});

describe("Protected routes", () => {
    test("GET /api/user/profile should reject unauthenticated request", async () => {
        const res = await request(app).get("/api/user/profile");
        expect([401, 403]).toContain(res.statusCode);
    });
});