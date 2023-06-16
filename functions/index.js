const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Storage } = require("@google-cloud/storage");
const { applyMiddleware, getDocId } = require("./middlewares");

admin.initializeApp();

const storage = new Storage();

const DEFAULT_COLLECTION_NAME = "unsorted-data";

/**
 * Creates a storage event trigger that executes a callback function only if the uploaded file is in one of the allowed folders.
 *
 * @param {string[]} allowedFolders - An array of allowed folder names.
 * @param {Function} callback - The callback function to be executed when the file meets the condition.
 * @returns {functions.CloudFunction} - The Cloud Function trigger.
 */
function createStorageEvent(allowedFolders, callback) {
  return functions.storage.object().onFinalize(async (object) => {
    const filePath = object.name;
    const parentFolderName = getParentFolderName(filePath);

    if (!allowedFolders.includes(parentFolderName)) {
      console.log(
        `File uploaded to ${parentFolderName} is not allowed. Skipping.`
      );
      return;
    }

    await callback(filePath, object);
  });
}

/**
 * Cloud Function that processes an uploaded JSON file and uploads it to Firestore.
 *
 * @param {string} filePath - The path of the uploaded file.
 * @param {object} object - The object containing information about the uploaded file.
 * @returns {Promise<void>}
 */
async function handleUploadedFile(filePath, object) {
  const bucket = storage.bucket(object.bucket);
  const file = bucket.file(filePath);

  try {
    const [fileContent] = await file.download();
    const json = JSON.parse(fileContent.toString());

    // Apply your middleware logic to modify the JSON data as needed
    const modifiedData = applyMiddleware(json, getDocId);

    const firestore = admin.firestore();
    const collectionName =
      getParentFolderName(filePath) || DEFAULT_COLLECTION_NAME;
    const collectionRef = firestore.collection(collectionName);

    const documentId = modifiedData.firestoreDocId;
    delete modifiedData.firestoreDocId;

    await collectionRef.doc(documentId).set(modifiedData);

    console.log(
      `Uploaded modified JSON data from ${filePath} to Firestore collection "${collectionName}"`
    );
  } catch (error) {
    console.error("Error uploading JSON to Firestore:", error);
  }
}

/**
 * Helper function to extract the parent folder name from the file path.
 *
 * @param {string} filePath - The path of the file.
 * @returns {string} - The parent folder name.
 */
function getParentFolderName(filePath) {
  const parentPath = filePath.substring(0, filePath.lastIndexOf("/"));
  const parentFolderName = parentPath.substring(
    parentPath.lastIndexOf("/") + 1
  );
  return parentFolderName;
}

exports.handleStorageEvent = createStorageEvent(
  ["mobiles", "laptops"],
  handleUploadedFile
);
