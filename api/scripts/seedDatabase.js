const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const dotenv = require("dotenv");
const User = require("../src/models/User");
const Visitor = require("../src/models/Visitor");
const Shipment = require("../src/models/Shipment");
const Key = require("../src/models/Key");
const { testEncryption } = require("../src/utils/encryption");

// Load environment variables
dotenv.config();

// Set the encryption key for the seed script if not already set
if (!process.env.ENCRYPTION_KEY) {
  process.env.ENCRYPTION_KEY = crypto.randomBytes(32).toString("hex");
  console.log("Generated a random encryption key for this session");
}

// Connect to MongoDB directly
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI ||
      "mongodb://admin:password@mongodb:27017/elisa-secure-access?authSource=admin";

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Test encryption functionality
    if (!testEncryption()) {
      console.error("Encryption test failed. Please check your configuration.");
      process.exit(1);
    }
    console.log("Encryption test passed successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
    process.exit(1);
  }
};

// Sample data
const users = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "Admin123!",
    role: "Admin",
    department: "IT",
    phone: "+1234567890",
    status: "active",
    notificationPreferences: {
      email: true,
      sms: false,
      slack: true,
      teams: false,
    },
  },
  {
    name: "Reception Staff",
    email: "reception@example.com",
    password: "Reception123!",
    role: "Reception",
    department: "Front Desk",
    phone: "+1987654321",
    status: "active",
    notificationPreferences: {
      email: true,
      sms: true,
      slack: false,
      teams: true,
    },
  },
  {
    name: "Security Officer",
    email: "security@example.com",
    password: "Security123!",
    role: "Security",
    department: "Security",
    phone: "+1122334455",
    status: "active",
    notificationPreferences: {
      email: true,
      sms: true,
      slack: true,
      teams: false,
    },
  },
  {
    name: "Regular Employee",
    email: "employee@example.com",
    password: "Employee123!",
    role: "Employee",
    department: "Marketing",
    phone: "+1567890123",
    status: "active",
    notificationPreferences: {
      email: true,
      sms: false,
      slack: true,
      teams: true,
    },
  },
];

const getRandomFutureDate = (daysAhead = 7) => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead));
  return date;
};

const getRandomPastDate = (daysBack = 7) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date;
};

// Check if database already has data
const checkIfDataExists = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(
        `Database already has data (found ${userCount} users), skipping seed process.`
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error checking if data exists:", error);
    return false;
  }
};

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if database already has data
    const hasData = await checkIfDataExists();
    if (hasData) {
      await closeDB();
      return;
    }

    // Clear existing data
    await User.deleteMany({});
    await Visitor.deleteMany({});
    await Shipment.deleteMany({});
    await Key.deleteMany({});

    console.log("Database cleared");

    // Create users
    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);

      // We don't need to hash the password manually here as it's handled by the User model's pre-save hook

      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`Created user: ${userData.name}`);
    }

    // Create visitors
    const visitors = [
      {
        name: "John Doe",
        email: "john.doe@example.com",
        company: "ABC Corp",
        phone: "+1234567890",
        host: createdUsers[3]._id, // Regular Employee
        purpose: "Project Meeting",
        visitDate: getRandomFutureDate(3),
        status: "pre-registered",
        notes: "Discussing Q3 marketing strategy",
      },
      {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        company: "XYZ Industries",
        phone: "+1987654321",
        host: createdUsers[0]._id, // Admin
        purpose: "Interview",
        visitDate: new Date(),
        status: "checked-in",
        checkInTime: new Date(Date.now() - 3600000), // 1 hour ago
        notes: "Candidate for Senior Developer position",
      },
      {
        name: "Robert Johnson",
        email: "robert@example.com",
        company: "Acme Ltd",
        phone: "+1122334455",
        host: createdUsers[2]._id, // Security
        purpose: "Security Audit",
        visitDate: getRandomPastDate(2),
        status: "checked-out",
        checkInTime: getRandomPastDate(2),
        checkOutTime: getRandomPastDate(2),
        notes: "Annual security compliance review",
      },
      {
        name: "Sarah Williams",
        email: "sarah@example.com",
        company: "Tech Solutions",
        phone: "+1567890123",
        host: createdUsers[1]._id, // Reception
        purpose: "Equipment Delivery",
        visitDate: getRandomFutureDate(1),
        status: "approved",
        notes: "Delivering new reception desk computers",
      },
    ];

    for (const visitorData of visitors) {
      const visitor = new Visitor(visitorData);
      await visitor.save();
      console.log(`Created visitor: ${visitorData.name}`);
    }

    // Create shipments
    const shipments = [
      {
        trackingNumber: "SHIP001",
        carrier: "FedEx",
        sender: "Office Supplies Inc.",
        recipient: createdUsers[0]._id,
        type: "Package",
        status: "delivered",
        receivedTime: getRandomPastDate(5),
        deliveredTime: getRandomPastDate(3),
        notes: "Office supplies for IT department",
        weight: 3.5,
        dimensions: {
          length: 40,
          width: 30,
          height: 20,
        },
        createdBy: createdUsers[1]._id,
      },
      {
        trackingNumber: "SHIP002",
        carrier: "UPS",
        sender: "Tech Hardware Co.",
        recipient: createdUsers[3]._id,
        type: "Package",
        status: "in-transit",
        receivedTime: getRandomPastDate(2),
        notes: "New laptops for marketing team",
        weight: 8.2,
        dimensions: {
          length: 50,
          width: 40,
          height: 15,
        },
        createdBy: createdUsers[1]._id,
      },
      {
        trackingNumber: "SHIP003",
        carrier: "DHL",
        sender: "Legal Partners LLP",
        recipient: createdUsers[0]._id,
        type: "Document",
        status: "received",
        receivedTime: new Date(),
        notes: "Confidential legal documents",
        weight: 0.5,
        dimensions: {
          length: 30,
          width: 21,
          height: 1,
        },
        createdBy: createdUsers[1]._id,
      },
    ];

    for (const shipmentData of shipments) {
      const shipment = new Shipment(shipmentData);
      await shipment.save();
      console.log(`Created shipment: ${shipmentData.trackingNumber}`);
    }

    // Create keys
    const keys = [
      {
        keyName: "Server Room",
        keyNumber: "KEY001",
        area: "IT Department",
        status: "available",
        accessLevel: "High",
        authorizedRoles: ["Admin", "Security"],
        location: "Security Office",
        createdBy: createdUsers[0]._id,
      },
      {
        keyName: "Main Office",
        keyNumber: "KEY002",
        area: "Administration",
        status: "checked-out",
        assignedTo: createdUsers[0]._id,
        checkoutTime: getRandomPastDate(1),
        expectedReturnTime: getRandomFutureDate(1),
        accessLevel: "Medium",
        authorizedRoles: ["Admin", "Security", "Employee"],
        location: "Reception",
        createdBy: createdUsers[0]._id,
      },
      {
        keyName: "Storage Room",
        keyNumber: "KEY003",
        area: "Warehouse",
        status: "available",
        accessLevel: "Low",
        authorizedRoles: ["Admin", "Security", "Employee", "Reception"],
        location: "Reception",
        notes: "General access key for office supplies",
        createdBy: createdUsers[0]._id,
      },
      {
        keyName: "Executive Office",
        keyNumber: "KEY004",
        area: "Management Suite",
        status: "available",
        accessLevel: "Critical",
        authorizedRoles: ["Admin"],
        location: "Security Office",
        notes: "Restricted access - authorization required",
        createdBy: createdUsers[0]._id,
      },
    ];

    for (const keyData of keys) {
      const key = new Key(keyData);
      await key.save();
      console.log(`Created key: ${keyData.keyName}`);
    }

    console.log("Database seeded successfully");

    // Close database connection
    await closeDB();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
