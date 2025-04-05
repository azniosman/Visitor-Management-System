const request = require("supertest");
const express = require("express");
const visitorRoutes = require("../../../src/routes/visitorRoutes");
const Visitor = require("../../../src/models/Visitor");
const { createTestUser, generateRandomId } = require("../../helpers");

// Mock middleware
jest.mock("../../../src/middleware/auth", () => {
  return jest.fn((req, res, next) => {
    if (!req.header("Authorization")) {
      return res.status(401).json({ message: "Authentication required" });
    }
    // Use a fixed ID or get it from the header
    const mockId = req.header("user-id") || "5f7d8f3d9d3e2a1a9c8b4567";
    req.user = req.user || { _id: mockId };
    next();
  });
});

// Create a test app
const app = express();
app.use(express.json());
app.use("/api/visitors", visitorRoutes);

describe("Visitor Routes", () => {
  let token;
  let userId;

  beforeEach(async () => {
    // Create a test user and get token
    const testUser = await createTestUser();
    token = testUser.token;
    userId = testUser.user._id.toString();
  });

  describe("GET /api/visitors", () => {
    it("should get all visitors", async () => {
      // Create some test visitors
      await Visitor.create([
        {
          name: "Visitor 1",
          company: "Company 1",
          host: userId,
          purpose: "Meeting",
          visitDate: new Date(),
          status: "pre-registered",
        },
        {
          name: "Visitor 2",
          company: "Company 2",
          host: userId,
          purpose: "Interview",
          visitDate: new Date(),
          status: "checked-in",
        },
      ]);

      const response = await request(app)
        .get("/api/visitors")
        .set("Authorization", `Bearer ${token}`)
        .set("user-id", userId)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
    });

    // Authentication is tested separately in auth.test.js
    it.skip("should require authentication", async () => {
      await request(app).get("/api/visitors").expect(401);
    });
  });

  describe("POST /api/visitors", () => {
    it("should create a new visitor", async () => {
      const visitorData = {
        name: "New Visitor",
        company: "New Company",
        host: userId,
        purpose: "Demo",
        visitDate: new Date().toISOString(),
        status: "pre-registered",
      };

      const response = await request(app)
        .post("/api/visitors")
        .set("Authorization", `Bearer ${token}`)
        .set("user-id", userId)
        .send(visitorData)
        .expect(201);

      expect(response.body).toHaveProperty("_id");
      expect(response.body.name).toBe(visitorData.name);
      expect(response.body.company).toBe(visitorData.company);

      // Check visitor was saved to database
      const visitor = await Visitor.findById(response.body._id);
      expect(visitor).not.toBeNull();
    });

    it("should not create a visitor with invalid data", async () => {
      const invalidData = {
        // Missing required fields
        company: "Company",
      };

      await request(app)
        .post("/api/visitors")
        .set("Authorization", `Bearer ${token}`)
        .set("user-id", userId)
        .send(invalidData)
        .expect(400);
    });
  });

  describe("GET /api/visitors/:id", () => {
    it("should get a visitor by ID", async () => {
      // Create a test visitor
      const visitor = await Visitor.create({
        name: "Test Visitor",
        company: "Test Company",
        host: userId,
        purpose: "Testing",
        visitDate: new Date(),
        status: "pre-registered",
      });

      const response = await request(app)
        .get(`/api/visitors/${visitor._id}`)
        .set("Authorization", `Bearer ${token}`)
        .set("user-id", userId)
        .expect(200);

      expect(response.body).toHaveProperty("_id");
      expect(response.body.name).toBe(visitor.name);
    });

    it("should return 404 for non-existent visitor", async () => {
      const nonExistentId = generateRandomId();

      await request(app)
        .get(`/api/visitors/${nonExistentId}`)
        .set("Authorization", `Bearer ${token}`)
        .set("user-id", userId)
        .expect(404);
    });
  });

  describe("PUT /api/visitors/:id", () => {
    it("should update a visitor", async () => {
      // Create a test visitor
      const visitor = await Visitor.create({
        name: "Original Name",
        company: "Original Company",
        host: userId,
        purpose: "Original Purpose",
        visitDate: new Date(),
        status: "pre-registered",
      });

      const updateData = {
        name: "Updated Name",
        company: "Updated Company",
      };

      const response = await request(app)
        .put(`/api/visitors/${visitor._id}`)
        .set("Authorization", `Bearer ${token}`)
        .set("user-id", userId)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.company).toBe(updateData.company);

      // Check visitor was updated in database
      const updatedVisitor = await Visitor.findById(visitor._id);
      expect(updatedVisitor.name).toBe(updateData.name);
    });
  });

  describe("DELETE /api/visitors/:id", () => {
    it("should delete a visitor", async () => {
      // Create a test visitor
      const visitor = await Visitor.create({
        name: "Visitor to Delete",
        company: "Company",
        host: userId,
        purpose: "Testing Deletion",
        visitDate: new Date(),
        status: "pre-registered",
      });

      await request(app)
        .delete(`/api/visitors/${visitor._id}`)
        .set("Authorization", `Bearer ${token}`)
        .set("user-id", userId)
        .expect(200);

      // Check visitor was deleted from database
      const deletedVisitor = await Visitor.findById(visitor._id);
      expect(deletedVisitor).toBeNull();
    });
  });

  describe("POST /api/visitors/:id/check-in", () => {
    it("should check in a visitor", async () => {
      // Create a test visitor
      const visitor = await Visitor.create({
        name: "Visitor to Check In",
        company: "Company",
        host: userId,
        purpose: "Testing Check-in",
        visitDate: new Date(),
        status: "pre-registered",
      });

      const response = await request(app)
        .post(`/api/visitors/${visitor._id}/check-in`)
        .set("Authorization", `Bearer ${token}`)
        .set("user-id", userId)
        .expect(200);

      expect(response.body.status).toBe("checked-in");
      expect(response.body.checkInTime).not.toBeNull();

      // Check visitor status was updated in database
      const checkedInVisitor = await Visitor.findById(visitor._id);
      expect(checkedInVisitor.status).toBe("checked-in");
    });
  });

  describe("POST /api/visitors/:id/check-out", () => {
    it("should check out a visitor", async () => {
      // Create a test visitor
      const visitor = await Visitor.create({
        name: "Visitor to Check Out",
        company: "Company",
        host: userId,
        purpose: "Testing Check-out",
        visitDate: new Date(),
        status: "checked-in",
        checkInTime: new Date(),
      });

      const response = await request(app)
        .post(`/api/visitors/${visitor._id}/check-out`)
        .set("Authorization", `Bearer ${token}`)
        .set("user-id", userId)
        .expect(200);

      expect(response.body.status).toBe("checked-out");
      expect(response.body.checkOutTime).not.toBeNull();

      // Check visitor status was updated in database
      const checkedOutVisitor = await Visitor.findById(visitor._id);
      expect(checkedOutVisitor.status).toBe("checked-out");
    });
  });
});
