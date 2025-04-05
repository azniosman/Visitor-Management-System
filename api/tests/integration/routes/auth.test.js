const request = require("supertest");
const express = require("express");
const authRoutes = require("../../../src/routes/authRoutes");
const User = require("../../../src/models/User");
const { createTestUser } = require("../../helpers");

// Create a test app
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Auth Routes", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const userData = {
        name: "New User",
        email: "newuser@example.com",
        password: "SecureP@ss123",
        role: "Employee",
        department: "Marketing",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      // Check response
      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("token");
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty("password");

      // Check user was saved to database
      const user = await User.findOne({ email: userData.email });
      expect(user).not.toBeNull();
    });

    it("should not register a user with existing email", async () => {
      // Create a user first
      await createTestUser({
        email: "existing@example.com",
      });

      // Try to register with the same email
      const userData = {
        name: "Another User",
        email: "existing@example.com",
        password: "SecureP@ss123",
        role: "Employee",
      };

      await request(app).post("/api/auth/register").send(userData).expect(400);
    });

    it("should not register a user with invalid data", async () => {
      const userData = {
        name: "Invalid User",
        email: "invalid-email",
        password: "short",
        role: "InvalidRole",
      };

      await request(app).post("/api/auth/register").send(userData).expect(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login an existing user", async () => {
      // Create a user first
      const { user } = await createTestUser({
        email: "login@example.com",
        password: "SecureL0gin123",
      });

      // Login with the user
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "login@example.com",
          password: "SecureL0gin123",
        })
        .expect(200);

      // Check response
      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("token");
      expect(response.body.user.email).toBe(user.email);
    });

    it("should not login with incorrect password", async () => {
      // Create a user first
      await createTestUser({
        email: "login@example.com",
        password: "C0rrectP@ss123",
      });

      // Try to login with wrong password
      await request(app)
        .post("/api/auth/login")
        .send({
          email: "login@example.com",
          password: "Wr0ngP@ss123",
        })
        .expect(401);
    });

    it("should not login with non-existent email", async () => {
      await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "SecureP@ss123",
        })
        .expect(401);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout a logged in user", async () => {
      // Create a user and get token
      const { token } = await createTestUser();

      // Logout
      await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Try to use the same token again
      await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${token}`)
        .expect(401);
    });

    it("should not logout without authentication", async () => {
      await request(app).post("/api/auth/logout").expect(401);
    });
  });
});
