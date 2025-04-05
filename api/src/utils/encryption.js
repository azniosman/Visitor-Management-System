const crypto = require("crypto");

/**
 * Utility for encrypting and decrypting sensitive data
 * This implementation uses AES-256-GCM encryption
 */

// The encryption key and initialization vector should be stored securely
// In a production environment, these should be stored in environment variables
// or a secure key management service (like AWS KMS)
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "a-32-character-key-for-aes-256-gcm"; // 32 bytes
const IV_LENGTH = 16; // For AES, this is always 16 bytes
const AUTH_TAG_LENGTH = 16; // GCM auth tag length

/**
 * Encrypt a string
 * @param {string} text - The text to encrypt
 * @returns {string} - The encrypted text as a hex string
 */
exports.encrypt = (text) => {
  if (!text) return text;

  try {
    // Generate a random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create a cipher using AES-256-GCM
    const cipher = crypto.createCipheriv(
      "aes-256-gcm",
      Buffer.from(ENCRYPTION_KEY),
      iv
    );

    // Encrypt the text
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Get the authentication tag
    const authTag = cipher.getAuthTag();

    // Return the IV, encrypted text, and auth tag as a combined hex string
    return iv.toString("hex") + ":" + encrypted + ":" + authTag.toString("hex");
  } catch (error) {
    console.error("Encryption error:", error);
    return text; // Return the original text if encryption fails
  }
};

/**
 * Decrypt a string
 * @param {string} encrypted - The encrypted text
 * @returns {string} - The decrypted text
 */
exports.decrypt = (encrypted) => {
  if (!encrypted || !encrypted.includes(":")) return encrypted;

  try {
    // Split the encrypted text into IV, ciphertext, and auth tag
    const parts = encrypted.split(":");
    if (parts.length !== 3) return encrypted;

    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = parts[1];
    const authTag = Buffer.from(parts[2], "hex");

    // Create a decipher
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      Buffer.from(ENCRYPTION_KEY),
      iv
    );
    decipher.setAuthTag(authTag);

    // Decrypt the text
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return encrypted; // Return the original encrypted text if decryption fails
  }
};

/**
 * Create a mongoose plugin for field encryption
 * @param {Array} fields - Array of field names to encrypt
 * @returns {Function} - Mongoose plugin function
 */
exports.fieldEncryption = (fields) => {
  return function (schema) {
    // Add a hook to encrypt fields before saving
    schema.pre("save", function (next) {
      for (const field of fields) {
        if (this[field]) {
          this[field] = exports.encrypt(this[field]);
        }
      }
      next();
    });

    // Add a hook to decrypt fields after retrieving from database
    schema.post("find", function (docs) {
      if (!Array.isArray(docs)) return;

      for (const doc of docs) {
        for (const field of fields) {
          if (doc[field]) {
            doc[field] = exports.decrypt(doc[field]);
          }
        }
      }
    });

    schema.post("findOne", function (doc) {
      if (!doc) return;

      for (const field of fields) {
        if (doc[field]) {
          doc[field] = exports.decrypt(doc[field]);
        }
      }
    });
  };
};

// Utility function to test if the encryption key is valid
exports.testEncryption = () => {
  const testString = "This is a test string";
  const encrypted = exports.encrypt(testString);
  const decrypted = exports.decrypt(encrypted);

  if (decrypted !== testString) {
    console.error("Encryption test failed: keys are not valid!");
    return false;
  }

  return true;
};
