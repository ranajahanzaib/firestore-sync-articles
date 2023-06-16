# Firestore Sync - Template Repository

Firestore Sync is an open-source project template that provides a Firebase Cloud Function for automatically importing data into Cloud Firestore based on Storage events.

## Overview

Firestore Sync allows you to easily set up a Cloud Function that monitors a specified storage bucket and automatically imports data files into Firestore as documents. You can define middleware functions to modify the data before uploading it to Firestore, making it flexible to adapt to your specific data structure and requirements.

## Features

- Automatically import data into Firestore based on Storage events.
- Apply middleware functions to modify the data before uploading to Firestore.
- Folder-based mapping: JSON files in specific folders are uploaded to corresponding collections in Firestore.
- Customizable document ID generation based on data fields or random IDs.
- Easy integration with Firebase projects.

## Getting Started

To get started with Firestore Sync, make sure you have the following requirements in place:

- Cloud Firestore API, Cloud Functions API, and Cloud Storage API should be enabled for your Google Cloud project.
- Default Project Resource Location should be configured for your project.

To configure Firestore Sync for your project, follow these steps:

1. Click the "Use this template" button to create a new repository based on this template.
2. Clone the newly created repository to your local machine.
3. Install the necessary dependencies by running `npm install` in the project directory.
4. Update the project ID in the `.firebaserc` file with your Firebase project ID.
5. Customize the middleware functions in the `middlewares` directory to suit your data processing needs.

### Testing Locally

You can test the Firestore Sync function locally using Firebase emulators. Follow these steps:

1. Make sure you have the Firebase CLI installed globally on your machine.
2. Run `firebase emulators:start` in the project directory.
3. The emulators will start, including the Firestore emulator and the Functions emulator.
4. Trigger the function locally by uploading a JSON file to your configured storage bucket.

### Adding More Functions

The `createStorageEvent` function allows you to create custom events for specific folders and define a callback function to process files after they are uploaded. You can use this function to create multiple events for different folders and process the files in different ways.

**Function:** `createStorageEvent(allowedFolders, callback)`
The `createStorageEvent` function creates a Cloud Function trigger that executes a callback function only if the uploaded file is in one of the allowed folders.

#### Parameters

- `allowedFolders` (array): An array of allowed folder names. The function will trigger the callback only if the uploaded file is in one of these folders.

- `callback` (function): The callback function to be executed when the file meets the condition. This function will receive the file's path as a parameter.

```js
// Import the required dependencies
const functions = require("firebase-functions");

// Define the callback function to process the uploaded file
function handleUploadedFile(filePath) {
  // Your custom logic to process the file
  console.log(`Processing file: ${filePath}`);
}

// Create a trigger for the "mobiles" and "laptops" folders
const storageEventTrigger = createStorageEvent(
  ["mobiles", "laptops"],
  handleUploadedFile
);

// Export the trigger
exports.uploadEvent = storageEventTrigger;
```

### Deployment

Deploy the Cloud Function to your Firebase project by running `firebase deploy --only functions`.

## Contributing

Contributions to Firestore Sync are welcome! If you would like to contribute to the project, please review the [contribution guidelines](CONTRIBUTING.md) for more information.

## License

Firestore Sync is released under the [MIT License](LICENSE).
