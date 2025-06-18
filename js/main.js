import { initializeDatabase, generateTableNameFromUrl, db } from './db.js'; // Import db
import { executeQuery } from './query.js';
import { fileSources } from './csvSources.js'; // Import the updated sources
import { initializeCopyButton } from './ui/copyButton.js';
import { startTimer, stopTimer, displayTime } from './ui/timer.js';

const executeButton = document.getElementById('execute-button');
const downloadDbButton = document.getElementById('download-db-button'); // Get the download button

// Attach event listener to the execute button.
if (executeButton) {
    executeButton.addEventListener('click', executeQuery);
} else {
    console.error("Execute button not found.");
}

// Attach event listener to the download database button
if (downloadDbButton) {
    downloadDbButton.addEventListener('click', () => {
        if (db) {
            try {
                const data = db.export();
                const blob = new Blob([data], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'database.db'; // Set the desired filename
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                console.log("Database download initiated.");
            } catch (e) {
                console.error("Error exporting database:", e);
                alert("Error exporting database. See console for details.");
            }
        } else {
            console.error("Database not initialized. Cannot download.");
            alert("Database not yet initialized. Please wait or try reloading.");
        }
    });
} else {
    console.error("Download DB button not found.");
}

initializeCopyButton(); // Initialize the copy button functionality

startTimer();
// Initialize the database with the imported array of sources and then execute an initial query.
initializeDatabase(fileSources) // Use the updated fileSources
    .then(() => {
        // Database is initialized (or attempted to initialize with data from URLs), and db instance in db.js is set.
        // executeQuery (imported from query.js) will use that db instance.
        try {
            if (fileSources && fileSources.length > 0) {
                const firstFileSource = fileSources[0];
                if (firstFileSource && firstFileSource.url) {
                    // Use generateTableNameFromUrl, passing the custom name if available.
                    // The db.js version of generateTableNameFromUrl now handles sanitization and fallback.
                    let firstTableName = generateTableNameFromUrl(firstFileSource.url, firstFileSource.tableName);
                    console.log(`First table name for initial query: ${firstTableName}`);

                    const sqlInput = document.getElementById('sql-input');
                    if (firstTableName && sqlInput) {
                        sqlInput.value = `SELECT * FROM "${firstTableName}" LIMIT 5;`; // Enclose in double quotes
                    }
                }
            }
        } catch (error) {
            console.error(`Could not dynamically set initial query: ${error.message}`);
        }
        console.log("Database initialized. Executing initial query...");
        executeQuery(); // Execute initial query to display data
        stopTimer();
        displayTime();
    })
    .catch(error => {
        console.error("Failed to initialize the application:", error);
        const statusDiv = document.getElementById('status');
        if (statusDiv) {
            statusDiv.innerHTML = `<p class="error">Application initialization failed: ${error.message}</p>`;
        }
        stopTimer();
        displayTime();
    });
