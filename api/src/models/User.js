const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const { fieldEncryption } = require("../utils/encryption");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error('Password cannot contain "password"');
        }
      },
    },
    role: {
      type: String,
      enum: ["Admin", "Reception", "Security", "Employee"],
      required: true,
    },
    department: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    phone: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
    },
    notificationPreferences: {
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
      slack: {
        type: Boolean,
        default: false,
      },
      teams: {
        type: Boolean,
        default: false,
      },
    },
    slackUserId: {
      type: String,
      trim: true,
    },
    teamsUserId: {
      type: String,
      trim: true,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Apply field encryption to PII fields
userSchema.plugin(fieldEncryption(["name", "phone"]));

// Hash the password before saving
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// Method to check if a password is valid
userSchema.methods.isValidPassword = async function (password) {
  const user = this;
  return await bcrypt.compare(password, user.password);
};

// Method to generate auth token is typically implemented here
// But it's not present in the original file

// Method to get public profile (removing sensitive information)
userSchema.methods.toJSON = function () {
  const user = this.toObject();

  delete user.password;
  delete user.tokens;

  return user;
};

// Add index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;
