import { parseTSV } from './tsvParser.js';
import { parseCSV } from './csvParser.js';
import { updateStatus } from './ui/statusUpdater.js';
import { addTableToList, clearTableList } from './ui/tableListDisplay.js';

let db = null;

/**
 * Sanitizes a given string to be a valid SQL table name.
 * @param {string} name - The proposed table name.
 * @returns {string} The sanitized table name.
 */
function sanitizeTableName(name) {
    // Replace non-alphanumeric characters (except underscores) with underscores
    let sanitizedName = name.replace(/[^a-zA-Z0-9_]/g, '_');

    // Condense multiple underscores into one
    sanitizedName = sanitizedName.replace(/_+/g, '_');

    // Remove leading/trailing underscores that might have resulted from original leading/trailing special chars
    // or from the multiple underscore condensation. But don't remove if it's the *only* character.
    if (sanitizedName.length > 1) {
        sanitizedName = sanitizedName.replace(/^_+|_+$/g, '');
    }

    // If, after all this, the name is empty or just an underscore (which might happen if original was all special chars)
    // or if it became empty after stripping leading/trailing underscores, treat as invalid.
    if (!sanitizedName || sanitizedName === '_') {
        return "default_table_name"; // Fallback for completely invalid or purely special char names
    }

    // Ensure the name starts with a letter or underscore (if not already handled by above)
    if (/^[0-9]/.test(sanitizedName)) {
        sanitizedName = "table_" + sanitizedName;
    }

    // Final check for empty or underscore-only name after potential prefixing (e.g. if name was "1")
    if (!sanitizedName || sanitizedName === '_' || sanitizedName === 'table_') {
        return "default_table_name";
    }

    return sanitizedName;
}

/**
 * Generates a sanitized table name from a URL or uses a custom name if provided.
 * @param {string} url - The URL to generate a table name from (used as fallback).
 * @param {string} [customTableName] - An optional custom table name.
 * @returns {string} The sanitized table name.
 */
function generateTableNameFromUrl(url, customTableName) {
    if (customTableName && typeof customTableName === 'string' && customTableName.trim() !== '') {
        return sanitizeTableName(customTableName.trim());
    }

    // Fallback to URL-based generation
    let filename = url.substring(url.lastIndexOf('/') + 1);
    filename = filename.replace(/\.[^/.]+$/, ""); // Remove file extension
    return sanitizeTableName(filename);
}

/**
 * Creates a table in the database.
 * @param {SQL.Database} dbInstance - The initialized SQL.js database instance.
 * @param {string} tableName - The name of the table to create.
 * @param {string[]} headers - Array of header strings for table columns.
 * @param {Array<{ "column-name": string, "column-type": string }>} [columnTypes] - Optional array of column type specifications.
 */
function createTable(dbInstance, tableName, headers, columnTypes = []) {
    const columnTypeMap = new Map(columnTypes.map(ct => [ct['column-name'], ct['column-type']]));
    const headerSet = new Set(headers);

    // Warn about column types specified for non-existent columns
    columnTypeMap.forEach((type, columnName) => {
        if (!headerSet.has(columnName)) {
            console.warn(`Warning: Column "${columnName}" specified in columnTypes for table "${tableName}" does not exist in the CSV headers. This type definition will be ignored.`);
        }
    });

    const columnDefinitions = headers.map(h => {
        const type = columnTypeMap.get(h);
        // SQLite is flexible with type names. If a type is specified, use it. Otherwise, default to TEXT.
        return `"${h}" ${type ? type.toUpperCase() : 'TEXT'}`;
    }).join(', ');

    const createTableSql = `CREATE TABLE "${tableName}" (${columnDefinitions});`;
    dbInstance.run(createTableSql);
    updateStatus(`Table "${tableName}" created with schema: (${columnDefinitions}).`, false, true);
}

/**
 * Inserts data rows into the specified table.
 * @async
 * @param {SQL.Database} dbInstance - The initialized SQL.js database instance.
 * @param {string} tableName - The name of the table to insert data into.
 * @param {string[]} headers - Array of header strings for table columns (used for validation).
 * @param {string[][]} dataRows - Array of data row arrays (pre-parsed values).
 */
async function insertData(dbInstance, tableName, headers, dataRows) {
    const placeholders = headers.map(() => '?').join(', ');
    const insertSql = `INSERT INTO "${tableName}" VALUES (${placeholders});`;
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
        updateStatus(`Inserted ${dataRows.length} rows into "${tableName}".`, false, true);
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

        clearTableList(); // Clear the list before loading new data

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
                    updateStatus(`No data rows found in ${source.type.toUpperCase()} from ${source.url}. Skipping table creation.`, false, true);
                    continue;
                }

                const tableName = generateTableNameFromUrl(source.url, source.tableName); // Pass custom table name if available
                await createTable(db, tableName, currentHeaders, source.columnTypes); // Pass columnTypes
                await insertData(db, tableName, currentHeaders, dataRows);
                addTableToList(tableName); // Add table name to UI list
                updateStatus(`Data from ${source.url} loaded into table "${tableName}".`, false, true);

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
export { initializeDatabase, createTable, insertData, generateTableNameFromUrl };
export { db };
