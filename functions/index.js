const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Storage } = require("@google-cloud/storage");
const {
  applyMiddleware,
  getDocId,
  filenameToDocId,
  validateFileType,
  replaceSpecialChars,
} = require("./middlewares");

admin.initializeApp();

const storage = new Storage();
const firestore = admin.firestore();

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

async function processMarkdownFile(filePath, object) {
  const bucket = storage.bucket(object.bucket);
  const file = bucket.file(filePath);

  try {
    const [fileContent] = await file.download();
    const markdownContent = fileContent.toString("utf8");

    // Apply the middleware to modify the data object
    const modifiedData = applyMiddleware(
      { filePath, content: markdownContent },
      validateFileType("md"),
      getDocId,
      replaceSpecialChars
      // filenameToDocId
    );

    // Upload the markdown content to Firestore
    const collectionName =
      getParentFolderName(filePath) || DEFAULT_COLLECTION_NAME;
    const collectionRef = firestore.collection(collectionName);
    const documentRef = collectionRef.doc(modifiedData.firestoreDocId);

    await documentRef.set({ content: markdownContent });

    console.log(
      `Uploaded Markdown content from ${filePath} to Firestore collection "${collectionName}" with document ID "${modifiedData.firestoreDocId}".`
    );
  } catch (error) {
    console.error("Error uploading Markdown content:", error);
  }
}

exports.handleStorageEvent = createStorageEvent(
  ["articles", "news"],
  processMarkdownFile
);
