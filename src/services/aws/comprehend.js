// AWS Comprehend service for text analysis and sentiment detection
import {
  ComprehendClient,
  DetectSentimentCommand,
  DetectEntitiesCommand,
  DetectKeyPhrasesCommand,
} from "@aws-sdk/client-comprehend";

// Initialize the AWS SDK with your credentials
// In a production environment, these should be stored securely and not in the code
const getComprehendClient = () => {
  return new ComprehendClient({
    region: import.meta.env.VITE_AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    },
  });
};

/**
 * Detect the sentiment of a text
 * @param {string} text - The text to analyze
 * @param {string} languageCode - The language code (default: en)
 * @returns {Promise} - Promise resolving to sentiment analysis results
 */
export const detectSentiment = async (text, languageCode = "en") => {
  try {
    const client = getComprehendClient();

    const command = new DetectSentimentCommand({
      Text: text,
      LanguageCode: languageCode,
    });

    return await client.send(command);
  } catch (error) {
    console.error("Error detecting sentiment:", error);
    throw error;
  }
};

/**
 * Detect entities in a text (people, places, organizations, etc.)
 * @param {string} text - The text to analyze
 * @param {string} languageCode - The language code (default: en)
 * @returns {Promise} - Promise resolving to entity detection results
 */
export const detectEntities = async (text, languageCode = "en") => {
  try {
    const client = getComprehendClient();

    const command = new DetectEntitiesCommand({
      Text: text,
      LanguageCode: languageCode,
    });

    return await client.send(command);
  } catch (error) {
    console.error("Error detecting entities:", error);
    throw error;
  }
};

/**
 * Detect key phrases in a text
 * @param {string} text - The text to analyze
 * @param {string} languageCode - The language code (default: en)
 * @returns {Promise} - Promise resolving to key phrase detection results
 */
export const detectKeyPhrases = async (text, languageCode = "en") => {
  try {
    const client = getComprehendClient();

    const command = new DetectKeyPhrasesCommand({
      Text: text,
      LanguageCode: languageCode,
    });

    return await client.send(command);
  } catch (error) {
    console.error("Error detecting key phrases:", error);
    throw error;
  }
};

/**
 * Analyze visitor notes for potential security concerns
 * @param {string} notes - The visitor notes to analyze
 * @returns {Promise} - Promise resolving to analysis results
 */
export const analyzeVisitorNotes = async (notes) => {
  try {
    // Combine multiple analyses for a comprehensive view
    const [sentimentResult, entitiesResult, keyPhrasesResult] =
      await Promise.all([
        detectSentiment(notes),
        detectEntities(notes),
        detectKeyPhrases(notes),
      ]);

    // Look for potential security concerns
    const securityConcerns = [];

    // Check for negative sentiment
    if (
      sentimentResult.Sentiment === "NEGATIVE" &&
      sentimentResult.SentimentScore.Negative > 0.7
    ) {
      securityConcerns.push("Highly negative sentiment detected");
    }

    // Check for specific entity types that might be of concern
    const sensitiveEntityTypes = [
      "ORGANIZATION",
      "LOCATION",
      "PERSON",
      "COMMERCIAL_ITEM",
    ];
    const sensitiveEntities = entitiesResult.Entities.filter(
      (entity) =>
        sensitiveEntityTypes.includes(entity.Type) && entity.Score > 0.8
    );

    if (sensitiveEntities.length > 0) {
      securityConcerns.push(
        `Sensitive entities detected: ${sensitiveEntities
          .map((e) => e.Text)
          .join(", ")}`
      );
    }

    return {
      sentiment: sentimentResult,
      entities: entitiesResult,
      keyPhrases: keyPhrasesResult,
      securityConcerns: securityConcerns.length > 0 ? securityConcerns : null,
    };
  } catch (error) {
    console.error("Error analyzing visitor notes:", error);
    throw error;
  }
};

export default {
  detectSentiment,
  detectEntities,
  detectKeyPhrases,
  analyzeVisitorNotes,
};
