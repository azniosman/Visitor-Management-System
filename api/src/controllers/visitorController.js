const Visitor = require("../models/Visitor");
const AWS = require("aws-sdk");

// Initialize AWS services
const rekognition = new AWS.Rekognition({
  region: process.env.AWS_REGION || "us-east-1",
});

const comprehend = new AWS.Comprehend({
  region: process.env.AWS_REGION || "us-east-1",
});

// Get all visitors
exports.getAllVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find().populate(
      "host",
      "name email department"
    );
    res.status(200).json(visitors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get visitor by ID
exports.getVisitorById = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id).populate(
      "host",
      "name email department"
    );

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.status(200).json(visitor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new visitor
exports.createVisitor = async (req, res) => {
  try {
    const visitor = new Visitor(req.body);

    // If notes are provided, analyze them with AWS Comprehend
    if (req.body.notes) {
      try {
        const sentimentParams = {
          Text: req.body.notes,
          LanguageCode: "en",
        };

        const sentimentResult = await comprehend
          .detectSentiment(sentimentParams)
          .promise();

        visitor.aiAnalysis = {
          sentiment: sentimentResult,
          securityConcerns: [],
        };

        // Check for negative sentiment
        if (
          sentimentResult.Sentiment === "NEGATIVE" &&
          sentimentResult.SentimentScore.Negative > 0.7
        ) {
          visitor.aiAnalysis.securityConcerns.push(
            "Highly negative sentiment detected"
          );
        }
      } catch (aiError) {
        console.error("Error analyzing visitor notes:", aiError);
      }
    }

    await visitor.save();
    res.status(201).json(visitor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update visitor
exports.updateVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    Object.assign(visitor, req.body);
    await visitor.save();

    res.status(200).json(visitor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete visitor
exports.deleteVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    await Visitor.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Visitor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check in visitor
exports.checkInVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    visitor.status = "checked-in";
    visitor.checkInTime = new Date();

    await visitor.save();
    res.status(200).json(visitor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Check out visitor
exports.checkOutVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    visitor.status = "checked-out";
    visitor.checkOutTime = new Date();

    await visitor.save();
    res.status(200).json(visitor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Analyze visitor photo (facial recognition)
exports.analyzeVisitorPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No photo provided" });
    }

    const params = {
      Image: {
        Bytes: req.file.buffer,
      },
      Attributes: ["ALL"],
    };

    const rekognitionResult = await rekognition.detectFaces(params).promise();

    res.status(200).json({
      facesDetected: rekognitionResult.FaceDetails.length,
      analysis: rekognitionResult,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check visitor against watchlist
exports.checkWatchlist = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No photo provided" });
    }

    // This would require a trained custom labels model in Amazon Rekognition
    // For demonstration purposes, we're returning a mock response

    res.status(200).json({
      watchlistMatch: false,
      confidence: 0.05,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
