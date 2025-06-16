import { initializeDatabase, generateTableNameFromUrl } from './db.js';
import { executeQuery } from './query.js';
import { fileSources } from './csvSources.js'; // Import the updated sources
import { initializeCopyButton } from './ui/copyButton.js';

const executeButton = document.getElementById('execute-button');

// Attach event listener to the execute button.
if (executeButton) {
    executeButton.addEventListener('click', executeQuery);
} else {
    console.error("Execute button not found.");
}

initializeCopyButton(); // Initialize the copy button functionality

// Initialize the database with the imported array of sources and then execute an initial query.
initializeDatabase(fileSources) // Use the updated fileSources
    .then(() => {
        // Database is initialized (or attempted to initialize with data from URLs), and db instance in db.js is set.
        // executeQuery (imported from query.js) will use that db instance.
        try {
            if (fileSources && fileSources.length > 0) {
                const firstFileSource = fileSources[0];
                if (firstFileSource && firstFileSource.url) {
                    let firstTableName = generateTableNameFromUrl(firstFileSource.url);
                    console.log(`First table name determined: ${firstTableName}`);

                    const sqlInput = document.getElementById('sql-input');
                    if (firstTableName && sqlInput) {
                        sqlInput.value = `SELECT * FROM ${firstTableName} LIMIT 5;`;
                    }
                }
            }
        } catch (error) {
            console.error(`Could not dynamically set initial query: ${error.message}`);
        }
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
