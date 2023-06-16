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

  const modifiedDocumentName = `${brand}-${documentName}`.replace(/\s+/g, "-");

  return { ...data, firestoreDocId: modifiedDocumentName };
}

module.exports = {
  applyMiddleware,
  getDocId,
};
