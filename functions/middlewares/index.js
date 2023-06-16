const { v4: uuidv4 } = require("uuid"); // Import the uuid package for generating random IDs

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

function validateFileType(expectedExtension) {
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

function filenameToDocId(data) {
  const filePath = data.filePath;
  const fileName = filePath.split("/").pop();
  const documentId = fileName
    .substring(0, fileName.lastIndexOf("."))
    .toLowerCase();
  return { ...data, firestoreDocId: documentId };
}

function replaceSpecialChars(data) {
  const { content } = data;
  const modifiedContent = content.replace(/[\n\t]/g, (match) => {
    switch (match) {
      case "\n":
        return "\\n";
      case "\t":
        return "\\t";
      // Add more cases for other special characters if needed
      default:
        return match;
    }
  });
  return { ...data, content: modifiedContent };
}

module.exports = {
  applyMiddleware,
  getDocId,
  validateFileType,
  filenameToDocId,
  replaceSpecialChars,
};
