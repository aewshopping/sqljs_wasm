// Main application entry point. Initializes data sources and sets up UI interactions.

import { initializeDataSources } from './dataOrchestrator.js';
import { generateTableNameFromUrl } from './database/sqliteService.js'; // For initial query example
import { executeQuery, setDbInstance } from './query.js';
import { fileSources } from './csvSources.js';
import { initializeCopyButton } from './ui/copyButton.js';
import { updateStatus } from './ui/statusUpdater.js';
import { addTableToList, clearTableList } from './ui/tableListDisplay.js';

const executeButton = document.getElementById('execute-button');
const sqlInput = document.getElementById('sql-input');

// Attach event listener to the execute button.
if (executeButton) {
    executeButton.addEventListener('click', executeQuery);
} else {
    console.error("Execute button not found.");
}

initializeCopyButton(); // Initialize the copy button functionality

/**
 * Handles progress updates from the data orchestrator.
 * @param {object} progress - The progress object from initializeDataSources.
 *        Example: { type: 'status'|'tableAdded'|'clearList'|'error', message: '...', tableName: '...', isError: false, isProgress: false }
 */
function handleDataProgress(progress) {
    // console.log('Progress Update:', progress);
    switch (progress.type) {
        case 'status':
            // isProgress maps to 'append' in updateStatus if we want to show ongoing messages.
            // The original updateStatus in db.js used 'isProgress' for the append flag.
            // Let's assume 'isProgress' from orchestrator means append=true, non-error.
            // And 'isPersistent' is not a param of updateStatus.
            // The third param of updateStatus is 'append'.
            updateStatus(progress.message, progress.isError || false, progress.isProgress || false);
            break;
        case 'tableAdded':
            if (progress.tableName) {
                addTableToList(progress.tableName);
            }
            break;
        case 'clearList':
            clearTableList();
            break;
        case 'error':
            updateStatus(progress.message, true, false); // Errors overwrite previous status
            break;
        default:
            console.warn('Unknown progress type:', progress.type);
            updateStatus(progress.message || `Unknown progress event: ${progress.type}`, progress.isError || false, false);
            break;
    }
}


// Initialize data sources and then set up the application.
initializeDataSources(fileSources, handleDataProgress)
    .then(dbInstance => {
        // Database is initialized. Make the db instance available to query.js
        setDbInstance(dbInstance);

        // Set up an initial query example if sources are available
        try {
            if (fileSources && fileSources.length > 0) {
                const firstFileSource = fileSources.find(s => s.url && (s.type === 'csv' || s.type === 'tsv')); // Find a valid source
                if (firstFileSource) {
                    let firstTableName = generateTableNameFromUrl(firstFileSource.url);
                    console.log(`First table name for initial query: ${firstTableName}`);
                    if (sqlInput) {
                        sqlInput.value = `SELECT * FROM "${firstTableName}" LIMIT 5;`;
                    }
                } else {
                    console.warn("No valid file sources found to set initial query example.");
                    if (sqlInput) sqlInput.value = "SELECT 'No tables loaded, please check data sources configuration.';";
                }
            } else {
                 if (sqlInput) sqlInput.value = "SELECT 'No data sources configured.';";
            }
        } catch (error) {
            console.error(`Could not dynamically set initial query: ${error.message}`);
             if (sqlInput) sqlInput.value = "SELECT 'Error setting initial query.';";
        }

        console.log("Data sources initialized. Executing initial query example...");
        executeQuery(); // Execute initial query to display data or message
    })
    .catch(error => {
        console.error("Failed to initialize data sources and application:", error);
        // The error should have already been displayed by handleDataProgress if it came from initializeDataSources.
        // This catch is for errors outside initializeDataSources or if progressCallback itself fails.
        updateStatus(`Application initialization failed: ${error.message}`, true, false);
    });
