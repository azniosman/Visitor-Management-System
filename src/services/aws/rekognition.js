// AWS Rekognition service for facial recognition and ID verification

import AWS from 'aws-sdk';

// Initialize the AWS SDK with your credentials
// In a production environment, these should be stored securely and not in the code
const initializeAWS = () => {
  AWS.config.update({
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
  });
};

// Create a Rekognition service object
const getRekognitionClient = () => {
  initializeAWS();
  return new AWS.Rekognition();
};

/**
 * Compare a face in a source image to faces in a target image
 * @param {Buffer} sourceImageBuffer - Source image buffer
 * @param {Buffer} targetImageBuffer - Target image buffer
 * @returns {Promise} - Promise resolving to comparison results
 */
export const compareFaces = async (sourceImageBuffer, targetImageBuffer) => {
  try {
    const rekognition = getRekognitionClient();
    
    const params = {
      SourceImage: {
        Bytes: sourceImageBuffer
      },
      TargetImage: {
        Bytes: targetImageBuffer
      },
      SimilarityThreshold: 70 // Minimum similarity threshold (0-100)
    };
    
    return await rekognition.compareFaces(params).promise();
  } catch (error) {
    console.error('Error comparing faces:', error);
    throw error;
  }
};

/**
 * Detect faces in an image and analyze attributes
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise} - Promise resolving to face detection results
 */
export const detectFaces = async (imageBuffer) => {
  try {
    const rekognition = getRekognitionClient();
    
    const params = {
      Image: {
        Bytes: imageBuffer
      },
      Attributes: ['ALL'] // Return all facial attributes
    };
    
    return await rekognition.detectFaces(params).promise();
  } catch (error) {
    console.error('Error detecting faces:', error);
    throw error;
  }
};

/**
 * Extract text from an ID document
 * @param {Buffer} imageBuffer - Image buffer of the ID document
 * @returns {Promise} - Promise resolving to text detection results
 */
export const analyzeIDDocument = async (imageBuffer) => {
  try {
    const rekognition = getRekognitionClient();
    
    const params = {
      Image: {
        Bytes: imageBuffer
      }
    };
    
    // First detect text in the document
    const textDetectionResult = await rekognition.detectText(params).promise();
    
    // Then analyze the document
    const documentResult = await rekognition.analyzeID(params).promise();
    
    return {
      textDetection: textDetectionResult,
      documentAnalysis: documentResult
    };
  } catch (error) {
    console.error('Error analyzing ID document:', error);
    throw error;
  }
};

/**
 * Check if a person is on a watchlist (using custom labels)
 * @param {Buffer} imageBuffer - Image buffer
 * @param {string} projectVersionArn - ARN of the trained model
 * @returns {Promise} - Promise resolving to detection results
 */
export const checkWatchlist = async (imageBuffer, projectVersionArn) => {
  try {
    const rekognition = getRekognitionClient();
    
    const params = {
      Image: {
        Bytes: imageBuffer
      },
      ProjectVersionArn: projectVersionArn,
      MinConfidence: 80 // Minimum confidence threshold (0-100)
    };
    
    return await rekognition.detectCustomLabels(params).promise();
  } catch (error) {
    console.error('Error checking watchlist:', error);
    throw error;
  }
};

export default {
  compareFaces,
  detectFaces,
  analyzeIDDocument,
  checkWatchlist
};
