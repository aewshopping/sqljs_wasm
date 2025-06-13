import { parseCSV } from './csvParser.js';
import { updateStatus } from './uiUpdater.js';

let db = null;

/**
 * Creates a table in the database.
 * @param {SQL.Database} dbInstance - The initialized SQL.js database instance.
 * @param {string[]} headers - Array of header strings for table columns.
 */
function createTable(dbInstance, headers) {
    const createTableSql = `CREATE TABLE csv_data (${headers.map(h => `"${h}" TEXT`).join(', ')});`;
    dbInstance.run(createTableSql);
    updateStatus(`Table "csv_data" created with headers: ${headers.join(', ')}.`, false, true);
}

/**
 * Inserts data rows into the "csv_data" table.
 * @async
 * @param {SQL.Database} dbInstance - The initialized SQL.js database instance.
 * @param {string[]} headers - Array of header strings for table columns (used for validation).
 * @param {string[]} dataRows - Array of data row strings (CSV lines).
 */
async function insertData(dbInstance, headers, dataRows) {
    // Prepare an SQL INSERT statement.
    const placeholders = headers.map(() => '?').join(', ');
    const insertSql = `INSERT INTO csv_data VALUES (${placeholders});`;
    const stmt = dbInstance.prepare(insertSql);

    // Start a transaction for faster bulk inserts.
    dbInstance.run('BEGIN TRANSACTION;');
    try {
        dataRows.forEach(line => {
            // Assuming parseCSV already split lines, but if dataRows are full lines, split here.
            // For this refactor, let's assume dataRows are arrays of values, matching parseCSV's output style if it were to return rows as arrays of values.
            // However, the original `createTableAndInsertData` expected `dataRows` as an array of strings (lines).
            // And `parseCSV` returns `dataRows` as an array of strings (lines).
            // So, the splitting logic is still needed here.
            const values = line.split(',').map(v => v.trim());
            if (values.length === headers.length) {
                stmt.run(values);
            } else {
                console.warn('Skipping malformed row (header/value count mismatch):', line);
            }
        });
        dbInstance.run('COMMIT;');
        updateStatus(`Inserted ${dataRows.length} rows into "csv_data".`, false, true);
    } catch (transactionError) {
        dbInstance.run('ROLLBACK;');
        console.error("Transaction error during data insertion:", transactionError);
        updateStatus(`Transaction error: ${transactionError.message}`, true);
        throw transactionError; // Re-throw to be caught by initializeDatabase
    } finally {
        stmt.free();
    }
}

/**
 * Initializes the SQL.js database and loads data from external CSVs.
 * @async
 * @param {string[]} csvUrls - Array of URLs to fetch CSV data from.
 * @returns {Promise<SQL.Database>} The initialized SQL.js database instance.
 */
async function initializeDatabase(csvUrls) {
    try {
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
        });
        db = new SQL.Database();
        updateStatus('SQL.js initialized.');

        let tableHeaders = null; // Initialize tableHeaders

        for (const url of csvUrls) {
            try {
                updateStatus(`Fetching CSV data from ${url}...`, false, true);
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const csvText = await response.text();
                // console.log(csvText); // Log fetched CSV text - can be removed or kept for debugging
                updateStatus(`CSV data fetched successfully from ${url}.`, false, true);

                const { headers: currentHeaders, dataRows } = parseCSV(csvText);

                if (dataRows.length === 0) {
                    updateStatus(`No data rows found in CSV from ${url}. Skipping.`, false, true);
                    continue; // Skip to the next URL if no data rows
                }

                if (tableHeaders === null) {
                    tableHeaders = currentHeaders;
                    await createTable(db, tableHeaders); // Create table with the headers from the first valid CSV
                    await insertData(db, tableHeaders, dataRows); // Insert data from the first valid CSV
                    updateStatus(`Data from ${url} loaded.`, false, true);
                } else {
                    if (JSON.stringify(currentHeaders) === JSON.stringify(tableHeaders)) {
                        await insertData(db, tableHeaders, dataRows); // Insert data if headers match
                        updateStatus(`Data from ${url} loaded.`, false, true);
                    } else {
                        console.warn(`Skipping CSV with non-matching headers: ${url}. Expected ${JSON.stringify(tableHeaders)}, got ${JSON.stringify(currentHeaders)}`);
                        updateStatus(`Skipping CSV from ${url} due to non-matching headers.`, true);
                    }
                }

            } catch (fetchError) {
                // Catch errors from fetch, parseCSV, createTable, or insertData
                console.error(`Error processing CSV from ${url}: `, fetchError);
                updateStatus(`Failed to process CSV data from ${url}: ${fetchError.message}`, true);
                // Decide if one failed fetch should stop the whole process or continue with other URLs
                // For now, we'll let it continue with other URLs.
            }
        }

        updateStatus('All CSV processing finished. Database ready for queries!', false, true);
        return db;

    } catch (error) {
        // General error handling for initializeDatabase scope (e.g., SQL.js init failure)
        const errorMessage = "Initialization failed: " + error.message;
        updateStatus(errorMessage, true);
        console.error("Initialization error details:", error);
        throw error; // Re-throw if this error should also be handled by a higher-level caller
    }
}

export { initializeDatabase, createTable, insertData }; // Export new functions
export { db };
