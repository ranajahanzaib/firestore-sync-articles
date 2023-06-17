const { v4: uuidv4 } = require("uuid"); // Import the uuid package for generating random IDs
const he = require("he");

/**
 * Applies multiple middleware functions to modify the given data.
 *
 * @param {object} data - The data to be modified.
 * @param {...Function} middlewares - The middleware functions to be applied.
 * @returns {object} - The modified data.
 */
function applyMiddleware(data, ...middlewares) {
  let modifiedData = data;

  for (const middleware of middlewares) {
    modifiedData = middleware(modifiedData);
  }

  return modifiedData;
}

/**
 * Generates and returns a unique document ID based on the provided data.
 *
 * @param {object} data - The data used to generate the document ID.
 * @returns {object} - The modified data with the generated document ID.
 */
function getDocId(data) {
  const brand = data.brand ? data.brand.toLowerCase() : "";
  let documentName = data.name ? data.name.trim().toLowerCase() : "";

  if (!documentName && brand) {
    documentName = uuidv4(); // Generate random ID if brand exists but name doesn't
  } else if (!documentName && !brand) {
    documentName = uuidv4(); // Generate random ID if both brand and name don't exist
  }

  const modifiedDocumentName = brand
    ? `${brand}-${documentName}`.replace(/\s+/g, "-")
    : documentName.replace(/\s+/g, "-");

  return { ...data, firestoreDocId: modifiedDocumentName };
}

/**
 * Validates that the file has the expected extension.
 *
 * @param {string} expectedExtension - The expected file extension.
 * @returns {Function} - The middleware function that validates the file extension.
 */
function validateFileType(expectedExtension) {
  /**
   * Middleware function that validates the file extension.
   *
   * @param {object} data - The data object.
   * @returns {object} - The unmodified data object if the file extension is valid.
   * @throws {Error} - If the file extension is not valid.
   */
  return function (data) {
    const filePath = data.filePath;
    const fileExtension = filePath.substring(filePath.lastIndexOf(".") + 1);

    if (fileExtension.toLowerCase() !== expectedExtension.toLowerCase()) {
      throw new Error(
        `File '${filePath}' does not appear to be a '${expectedExtension}' file.`
      );
    }

    return data;
  };
}

/**
 * Generates and returns a unique document ID based on the provided data.
 *
 * @param {object} data - The data used to generate the document ID.
 * @param {string} data.filePath - The file path.
 * @returns {object} - The modified data object with the generated document ID.
 */
function filenameToDocId(data) {
  const filePath = data.filePath;
  const fileName = filePath.split("/").pop();
  const documentId = fileName
    .substring(0, fileName.lastIndexOf("."))
    .toLowerCase();
  return { ...data, firestoreDocId: documentId };
}

/**
 * Replaces special characters in the content with their corresponding HTML entities.
 *
 * @param {object} data - The data object containt the `content` string property.
 * @returns {object} - The modified data object with the replaced special characters.
 */
function replaceSpecialChars(data) {
  /**
   * Replaces newline characters with HTML entity "&#10;".
   * Replaces tab characters with HTML entity "&#9;".
   * Encodes the content using HTML entities.
   */
  let { content } = data;
  content = content.replace(/\n/g, "&#10;");
  content = content.replace(/\t/g, "&#9;");
  const modifiedContent = he.encode(content);

  // Return the modified data object with the replaced special characters
  return { ...data, content: modifiedContent };
}

/**
 * Clears specified fields from the data object.
 *
 * @param {...string} fields - The fields to be cleared from the data object.
 * @returns {Function} - The middleware function that clears the specified fields.
 */
function clearFields(...fields) {
  /**
   * Middleware function that clears specified fields from the data object.
   *
   * @param {object} data - The data object.
   * @returns {object} - The modified data object with the specified fields cleared.
   */
  return function (data) {
    const modifiedData = { ...data };
    for (const field of fields) {
      delete modifiedData[field];
    }
    return modifiedData;
  };
}

module.exports = {
  applyMiddleware,
  getDocId,
  validateFileType,
  filenameToDocId,
  replaceSpecialChars,
  clearFields,
};
