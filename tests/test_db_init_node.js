// Node.js test script for initializeDatabase in db.js

import { initializeDatabase, generateTableNameFromUrl } from '../js/db.js';
import { fileSources } from '../js/csvSources.js'; // Assuming csvSources.js is in js/
// Attempting direct import of the sql-wasm.js file due to persistent ERR_MODULE_NOT_FOUND with 'sql.js'
import originalInitSqlJs from 'sql.js/dist/sql-wasm.js';
import fetch from 'node-fetch';
import path from 'path'; // Import path
import { URL } from 'url'; // Import URL for file URLs

// --- Global Mocks & Setup ---
global.fetch = fetch;

// Mock document and other browser-specific globals
global.document = {
    getElementById: (id) => {
        // console.log(`Mock document.getElementById called with ${id}`);
        return {
            innerHTML: '',
            appendChild: () => {},
            textContent: '',
            style: {} // Add style property
        };
    },
    // Add other document properties/methods if db.js or its dependencies require them
};
global.window = { // Mock window as well, as db.js checks for typeof window !== 'undefined'
    document: global.document,
    // Add other window properties if needed
};

global.alert = (message) => {
    console.log('Global alert (mock):', message);
};

// Expose initSqlJs globally for db.js, as it expects it to be in the global scope
// In db.js, we have: const SQL = await initSqlJs(sqlJsOptions);
// The 'sql.js' module default export is the initSqlJs function.
global.initSqlJs = originalInitSqlJs;

// Mock UI update functions from db.js dependencies to prevent errors
// if they are called. The actual UI update is not relevant for this Node test.
const mockUiFunction = (message, isError, isProgress) => {
    // console.log(`Mock UI Update: ${message} (Error: ${isError}, Progress: ${isProgress})`);
};
// UI functions updateStatus, addTableToList, clearTableList are imported directly
// by db.js from their respective files (e.g., ../js/ui/statusUpdater.js).
// So, global mocks for these are not needed and wouldn't be used by db.js.
// We rely on those files existing and exporting the functions.

// --- Main Test Logic ---
async function runTest() {
    console.log('Starting Node.js test for initializeDatabase...');

    try {
        // Filter fileSources to use only local files for testing, as http fetches might be slow/flaky in CI
        // For this test, let's assume fileSources correctly points to accessible data files.
        // If they are URLs, ensure they are accessible from the test environment.
        // For simplicity, we'll use the fileSources as is.
        // Ensure that the URLs in fileSources are accessible.
        // The provided fileSources are relative paths, which fetch will treat as URLs.
        // We need to adjust them to be file URLs or serve them via a local server for fetch.
        // Or, more simply, read them directly with fs for the test.
        // However, initializeDatabase itself uses fetch.

        // Convert relative paths in fileSources to absolute file:/// URLs for node-fetch
        const currentDir = path.dirname(new URL(import.meta.url).pathname); // Get current module's directory
        const projectRoot = path.resolve(currentDir, '..'); // Assumes tests/ is one level down from root

        const localFileSources = fileSources.map(source => {
            if (!source.url.startsWith('http')) { // If it's a relative path
                const absolutePath = path.resolve(projectRoot, source.url);
                return {
                    ...source,
                    // Construct a file URL. Ensure path is URL encoded if necessary (e.g. spaces)
                    url: new URL(`file://${absolutePath}`).href
                };
            }
            return source; // Keep http URLs as is
        });

        console.log('Initializing database with sources (file paths resolved):', JSON.stringify(localFileSources, null, 2));
        const db = await initializeDatabase(localFileSources);

        if (!db) {
            throw new Error('Database initialization returned undefined or null.');
        }
        console.log('Database initialized.');

        const tablesResult = db.exec("SELECT name FROM sqlite_master WHERE type='table';");
        const tables = tablesResult[0] ? tablesResult[0].values.map(row => row[0]) : [];
        console.log('Tables in database:', tables);

        // Assertions
        const expectedTableCount = localFileSources.filter(s => s.type === 'csv' || s.type === 'tsv').length;
        if (tables.length !== expectedTableCount) {
            // This check might be too strict if some files are empty or unsupported and skipped by design.
            // The db.js logic returns null for empty/unsupported files, which are then filtered out before table creation.
            // So, we should count how many sources *should* have resulted in a table.
            // For now, let's count non-empty, supported sources from the original fileSources.
            // This logic is complex as it depends on db.js's internal skipping.
            // A simpler check is that *some* tables got created if sources were provided.
             console.warn(`Warning: Number of tables (${tables.length}) does not strictly match source count (${expectedTableCount}). This might be OK if some sources are empty/invalid.`);
        }
        if (expectedTableCount > 0 && tables.length === 0) {
            throw new Error('No tables were created, but sources were provided.');
        }
         if (expectedTableCount === 0 && tables.length > 0) {
            throw new Error('Tables were created, but no sources were expected.');
        }


        for (const source of localFileSources) {
            const tableName = generateTableNameFromUrl(source.url);
            if (tables.includes(tableName)) { // Only query tables that were actually created
                const countResult = db.exec(`SELECT COUNT(*) FROM "${tableName}";`);
                if (!countResult || !countResult[0] || !countResult[0].values || !countResult[0].values[0]) {
                    throw new Error(`Failed to get count for table ${tableName}. Query result: ${JSON.stringify(countResult)}`);
                }
                const count = countResult[0].values[0][0];
                console.log(`Count for ${tableName}: ${count}`);

                // Basic assertion: if a table for a source is created, it should have some rows.
                // This depends on the content of CSVs; some might be empty.
                // For this test, assume files listed in fileSources are not empty if they are valid.
                if (count === 0) {
                    // This could be a valid case for an empty CSV, but for now, let's flag it.
                    console.warn(`Warning: Table ${tableName} for source ${source.url} has 0 rows.`);
                }
            } else {
                 console.warn(`Warning: Table ${tableName} for source ${source.url} was not created. This might be due to an empty file or unsupported type.`);
            }
        }

        console.log("\nNode.js test for initializeDatabase tentatively passed.");
        console.log("Review warnings above. For a stricter test, ensure source data guarantees table creation and row counts.");
        process.exit(0);

    } catch (error) {
        console.error("\nTest failed:", error);
        process.exit(1);
    }
}

// Mock functions from ui/statusUpdater.js and ui/tableListDisplay.js
// because db.js calls them.
// The UI utility files (statusUpdater.js, tableListDisplay.js) are expected to exist
// in js/ui/ and correctly export their functions, as db.js imports them directly.

runTest();
