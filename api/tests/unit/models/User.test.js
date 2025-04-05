const User = require("../../../src/models/User");

describe("User Model", () => {
  describe("Validation", () => {
    it("should create a valid user", async () => {
      const userData = {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "SecureP@ss123",
        role: "Admin",
        department: "IT",
        status: "active",
      };

      const user = new User(userData);
      await expect(user.save()).resolves.not.toThrow();
    });

    it("should require name", async () => {
      const userData = {
        email: "john.doe@example.com",
        password: "SecureP@ss123",
        role: "Admin",
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it("should require email", async () => {
      const userData = {
        name: "John Doe",
        password: "SecureP@ss123",
        role: "Admin",
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it("should require valid email format", async () => {
      const userData = {
        name: "John Doe",
        email: "invalid-email",
        password: "SecureP@ss123",
        role: "Admin",
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it("should require password", async () => {
      const userData = {
        name: "John Doe",
        email: "john.doe@example.com",
        role: "Admin",
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it("should require role", async () => {
      const userData = {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "SecureP@ss123",
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it("should only allow valid roles", async () => {
      const userData = {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "SecureP@ss123",
        role: "InvalidRole",
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });
  });

  describe("Methods", () => {
    it("should hash password before saving", async () => {
      const userData = {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "SecureP@ss123",
        role: "Admin",
      };

      const user = new User(userData);
      await user.save();

      // Password should be hashed
      expect(user.password).not.toBe(userData.password);
    });

    it("should validate correct password", async () => {
      const userData = {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "SecureP@ss123",
        role: "Admin",
      };

      const user = new User(userData);
      await user.save();

      const isMatch = await user.isValidPassword("SecureP@ss123");
      expect(isMatch).toBe(true);
    });

    it("should not validate incorrect password", async () => {
      const userData = {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "SecureP@ss123",
        role: "Admin",
      };

      const user = new User(userData);
      await user.save();

      const isMatch = await user.isValidPassword("WrongPassword");
      expect(isMatch).toBe(false);
    });
  });
});
