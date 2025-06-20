import { initializeDatabase, db } from './db.js'; // Import db, removed generateTableNameFromUrl as it's no longer used here
import { executeQuery } from './query.js';
// import { fileSources } from './csvSources.js'; // Removed: No longer loading from CSV sources defined here
import { initializeCopyButton } from './ui/copyButton.js';
import { startTimer, stopTimer, displayTime } from './ui/timer.js';

const executeButton = document.getElementById('execute-button');
const downloadDbButton = document.getElementById('download-db-button');

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
                a.download = 'database.db';
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

initializeCopyButton();

startTimer();

const dbUrl = "https://github.com/aewshopping/history-books-lite/raw/refs/heads/main/data.db";

initializeDatabase(dbUrl)
    .then(() => {
        // Database is initialized from the .db URL.
        // Set an initial query.
        try {
            const sqlInput = document.getElementById('sql-input');
            if (db && sqlInput) {
                // Attempt to get the first table name from the loaded database
                const tablesResult = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' LIMIT 1;");
                if (tablesResult.length > 0 && tablesResult[0].values && tablesResult[0].values.length > 0) {
                    const firstTableName = tablesResult[0].values[0][0];
                    sqlInput.value = `SELECT * FROM "${firstTableName}" LIMIT 5;`;
                    console.log(`Initial query set for table: ${firstTableName}`);
                } else {
                    // Fallback if no tables are found or db structure is unexpected
                    sqlInput.value = `SELECT 'No tables found or unable to determine first table.' AS Info;`;
                    console.warn("No tables found in the database to set an initial query, or db is not as expected.");
                }
            }
        } catch (error) {
            console.error(`Could not dynamically set initial query: ${error.message}`);
            const sqlInput = document.getElementById('sql-input');
            if (sqlInput) {
                sqlInput.value = `SELECT 'Error setting initial query.' AS Error;`;
            }
        }
        console.log("Database initialized. Executing initial query (if set)...");
        executeQuery(); // Execute initial query
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
