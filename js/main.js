import { initializeDatabase } from './db.js'; // db import is not strictly needed here if not directly used
import { executeQuery } from './query.js';

const executeButton = document.getElementById('execute-button');

// Attach event listener to the execute button.
if (executeButton) {
    executeButton.addEventListener('click', executeQuery);
} else {
    console.error("Execute button not found.");
}

// Initialize the database and then execute an initial query.
initializeDatabase()
    .then(() => {
        // Database is initialized, and db instance in db.js is set.
        // executeQuery (imported from query.js) will use that db instance.
        console.log("Database initialized. Executing initial query...");
        executeQuery(); // Execute initial query to display data
    })
    .catch(error => {
        console.error("Failed to initialize the application:", error);
        const statusDiv = document.getElementById('status');
        if (statusDiv) {
            statusDiv.innerHTML = `<p class="error">Application initialization failed: ${error.message}</p>`;
        }
    });
