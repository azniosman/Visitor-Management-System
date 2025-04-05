const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 * @returns {Promise} - Promise resolving to the mongoose connection
 */
exports.connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Close the MongoDB connection
 * @returns {Promise} - Promise resolving when the connection is closed
 */
exports.closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error(`Error closing MongoDB connection: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Create indexes for all models
 * This should be called after connecting to the database
 */
exports.createIndexes = async () => {
  try {
    // Get all models
    const models = mongoose.modelNames();
    
    // Create indexes for each model
    for (const modelName of models) {
      const model = mongoose.model(modelName);
      await model.createIndexes();
    }
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error(`Error creating database indexes: ${error.message}`);
  }
};
