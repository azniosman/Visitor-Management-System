const {
  sendEmail,
  sendWelcomeEmail,
  sendNotificationEmail,
} = require("../../../src/utils/email");
const nodemailer = require("nodemailer");

// Mock dependencies
jest.mock("nodemailer");

describe("Email Utility", () => {
  let mockTransporter;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock environment variables
    process.env.EMAIL_HOST = "smtp.example.com";
    process.env.EMAIL_PORT = "587";
    process.env.EMAIL_SECURE = "false";
    process.env.EMAIL_USERNAME = "test@example.com";
    process.env.EMAIL_PASSWORD = "password";
    process.env.EMAIL_FROM_NAME = "Test Sender";
    process.env.EMAIL_FROM_ADDRESS = "noreply@example.com";

    // Mock nodemailer transporter
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: "mock-message-id" }),
    };

    nodemailer.createTransport.mockReturnValue(mockTransporter);
  });

  describe("sendEmail", () => {
    it("should send an email with the correct options", async () => {
      // Setup
      const emailOptions = {
        to: "recipient@example.com",
        subject: "Test Subject",
        text: "Test plain text content",
        html: "<p>Test HTML content</p>",
      };

      // Execute
      const result = await sendEmail(emailOptions);

      // Assert
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: "smtp.example.com",
        port: "587",
        secure: false,
        auth: {
          user: "test@example.com",
          pass: "password",
        },
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: "Test Sender <noreply@example.com>",
        to: "recipient@example.com",
        subject: "Test Subject",
        text: "Test plain text content",
        html: "<p>Test HTML content</p>",
      });

      expect(result).toEqual({ messageId: "mock-message-id" });
    });

    it("should handle errors", async () => {
      // Setup
      const emailOptions = {
        to: "recipient@example.com",
        subject: "Test Subject",
        text: "Test content",
      };

      mockTransporter.sendMail.mockRejectedValue(new Error("SMTP error"));

      // Execute and Assert
      await expect(sendEmail(emailOptions)).rejects.toThrow("SMTP error");
    });
  });

  describe("sendWelcomeEmail", () => {
    it("should send a welcome email to a new user", async () => {
      // Setup
      const user = {
        name: "Test User",
        email: "user@example.com",
      };

      // Mock sendEmail function
      jest
        .spyOn(require("../../../src/utils/email"), "sendEmail")
        .mockResolvedValue({ messageId: "mock-message-id" });

      // Execute
      await sendWelcomeEmail(user);

      // Assert
      expect(sendEmail).toHaveBeenCalledWith({
        to: "user@example.com",
        subject: "Welcome to Elisa Secure Access",
        text: expect.stringContaining(
          "Welcome to Elisa Secure Access, Test User"
        ),
        html: expect.stringContaining("Welcome to Elisa Secure Access"),
      });

      // Restore original mock
      jest.restoreAllMocks();
    });
  });

  describe("sendNotificationEmail", () => {
    it("should send a notification email", async () => {
      // Setup
      const options = {
        recipient: {
          name: "Test User",
          email: "user@example.com",
        },
        subject: "Test Notification",
        message: "This is a test notification",
      };

      // Mock sendEmail function
      jest
        .spyOn(require("../../../src/utils/email"), "sendEmail")
        .mockResolvedValue({ messageId: "mock-message-id" });

      // Execute
      await sendNotificationEmail(options);

      // Assert
      expect(sendEmail).toHaveBeenCalledWith({
        to: "user@example.com",
        subject: "Test Notification",
        text: "This is a test notification",
        html: expect.stringContaining("This is a test notification"),
      });

      // Restore original mock
      jest.restoreAllMocks();
    });
  });
});
