import { parseTSV } from './tsvParser.js';
import { parseCSV } from './csvParser.js';
import { updateStatus } from './ui/statusUpdater.js';

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
 * @param {string[][]} dataRows - Array of data row arrays (pre-parsed values).
 */
async function insertData(dbInstance, headers, dataRows) {
    const placeholders = headers.map(() => '?').join(', ');
    const insertSql = `INSERT INTO csv_data VALUES (${placeholders});`;
    const stmt = dbInstance.prepare(insertSql);

    dbInstance.run('BEGIN TRANSACTION;');
    try {
        dataRows.forEach(row => { // dataRows is now string[][]
            if (row.length === headers.length) {
                stmt.run(row); // Use the row directly
            } else {
                // console.warn still useful but the 'line' variable is now 'row' (an array)
                console.warn('Skipping malformed row (header/value count mismatch):', row.join(','));
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
 * Initializes the SQL.js database and loads data from external sources.
 * @async
 * @param {{url: string, type: 'csv' | 'tsv'}[]} sources - Array of source objects, each specifying a URL and file type.
 * @returns {Promise<SQL.Database>} The initialized SQL.js database instance.
 */
async function initializeDatabase(sources) { // Parameter changed
    try {
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
        });
        db = new SQL.Database();
        updateStatus('SQL.js initialized.');

        let tableHeaders = null;

        for (const source of sources) { // Loop through sources array
            try {
                updateStatus(`Fetching data from ${source.url} (type: ${source.type})...`, false, true);
                const response = await fetch(source.url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const textData = await response.text();
                updateStatus(`Data fetched successfully from ${source.url}.`, false, true);

                let parsedData;
                if (source.type === 'csv') {
                    parsedData = parseCSV(textData);
                } else if (source.type === 'tsv') {
                    parsedData = parseTSV(textData);
                } else {
                    console.warn(`Unsupported file type: ${source.type} for URL ${source.url}. Skipping.`);
                    updateStatus(`Unsupported file type: ${source.type} for ${source.url}. Skipping.`, true);
                    continue;
                }

                const { headers: currentHeaders, dataRows } = parsedData;

                if (dataRows.length === 0) {
                    updateStatus(`No data rows found in ${source.type.toUpperCase()} from ${source.url}. Skipping.`, false, true);
                    continue;
                }

                if (tableHeaders === null) {
                    tableHeaders = currentHeaders;
                    // createTable function does not need delimiter parameter
                    await createTable(db, tableHeaders);
                    // insertData now expects dataRows as string[][]
                    await insertData(db, tableHeaders, dataRows);
                    updateStatus(`Data from ${source.url} loaded.`, false, true);
                } else {
                    if (JSON.stringify(currentHeaders) === JSON.stringify(tableHeaders)) {
                        // insertData now expects dataRows as string[][]
                        await insertData(db, tableHeaders, dataRows);
                        updateStatus(`Data from ${source.url} loaded.`, false, true);
                    } else {
                        console.warn(`Skipping ${source.type.toUpperCase()} with non-matching headers: ${source.url}. Expected ${JSON.stringify(tableHeaders)}, got ${JSON.stringify(currentHeaders)}`);
                        updateStatus(`Skipping ${source.type.toUpperCase()} from ${source.url} due to non-matching headers.`, true);
                    }
                }

            } catch (fetchError) {
                console.error(`Error processing ${source.type.toUpperCase()} from ${source.url}: `, fetchError);
                updateStatus(`Failed to process ${source.type.toUpperCase()} data from ${source.url}: ${fetchError.message}`, true);
            }
        }

        updateStatus('All data processing finished. Database ready for queries!', false, true);
        return db;

    } catch (error) {
        // General error handling for initializeDatabase scope (e.g., SQL.js init failure)
        const errorMessage = "Initialization failed: " + error.message;
        updateStatus(errorMessage, true);
        console.error("Initialization error details:", error);
        throw error; // Re-throw if this error should also be handled by a higher-level caller
    }
}

// Exports remain the same:
export { initializeDatabase, createTable, insertData };
export { db };
