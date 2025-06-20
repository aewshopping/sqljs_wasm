// import { parseTSV } from './tsvParser.js'; // Not needed for SQLite loading
// import { parseCSV } from './csvParser.js'; // Not needed for SQLite loading
import { updateStatus } from './ui/statusUpdater.js';
import { addTableToList, clearTableList } from './ui/tableListDisplay.js';

let db = null;

// /**
//  * Sanitizes a given string to be a valid SQL table name.
//  * @param {string} name - The proposed table name.
//  * @returns {string} The sanitized table name.
//  */
// function sanitizeTableName(name) {
//     // Replace non-alphanumeric characters (except underscores) with underscores
//     let sanitizedName = name.replace(/[^a-zA-Z0-9_]/g, '_');
//     // Condense multiple underscores into one
//     sanitizedName = sanitizedName.replace(/_+/g, '_');
//     // Remove leading/trailing underscores
//     if (sanitizedName.length > 1) {
//         sanitizedName = sanitizedName.replace(/^_+|_+$/g, '');
//     }
//     // Fallback for empty or invalid names
//     if (!sanitizedName || sanitizedName === '_') {
//         return "default_table_name";
//     }
//     // Ensure name starts with a letter or underscore
//     if (/^[0-9]/.test(sanitizedName)) {
//         sanitizedName = "table_" + sanitizedName;
//     }
//     if (!sanitizedName || sanitizedName === '_' || sanitizedName === 'table_') {
//         return "default_table_name";
//     }
//     return sanitizedName;
// }

// /**
//  * Generates a sanitized table name from a URL or uses a custom name if provided.
//  * @param {string} url - The URL to generate a table name from (used as fallback).
//  * @param {string} [customTableName] - An optional custom table name.
//  * @returns {string} The sanitized table name.
//  */
// function generateTableNameFromUrl(url, customTableName) {
//     if (customTableName && typeof customTableName === 'string' && customTableName.trim() !== '') {
//         return sanitizeTableName(customTableName.trim());
//     }
//     let filename = url.substring(url.lastIndexOf('/') + 1);
//     filename = filename.replace(/\.[^/.]+$/, ""); // Remove file extension
//     return sanitizeTableName(filename);
// }

// /**
//  * Creates a table in the database.
//  * @param {SQL.Database} dbInstance - The initialized SQL.js database instance.
//  * @param {string} tableName - The name of the table to create.
//  * @param {string[]} headers - Array of header strings for table columns.
//  */
// function createTable(dbInstance, tableName, headers) {
//     const createTableSql = `CREATE TABLE "${tableName}" (${headers.map(h => `"${h}" TEXT`).join(', ')});`;
//     dbInstance.run(createTableSql);
//     updateStatus(`Table "${tableName}" created with headers: ${headers.join(', ')}.`, false, true);
// }

// /**
//  * Inserts data rows into the specified table.
//  * @async
//  * @param {SQL.Database} dbInstance - The initialized SQL.js database instance.
//  * @param {string} tableName - The name of the table to insert data into.
//  * @param {string[]} headers - Array of header strings for table columns (used for validation).
//  * @param {string[][]} dataRows - Array of data row arrays (pre-parsed values).
//  */
// async function insertData(dbInstance, tableName, headers, dataRows) {
//     const placeholders = headers.map(() => '?').join(', ');
//     const insertSql = `INSERT INTO "${tableName}" VALUES (${placeholders});`;
//     const stmt = dbInstance.prepare(insertSql);
//     dbInstance.run('BEGIN TRANSACTION;');
//     try {
//         dataRows.forEach(row => {
//             if (row.length === headers.length) {
//                 stmt.run(row);
//             } else {
//                 console.warn('Skipping malformed row (header/value count mismatch):', row.join(','));
//             }
//         });
//         dbInstance.run('COMMIT;');
//         updateStatus(`Inserted ${dataRows.length} rows into "${tableName}".`, false, true);
//     } catch (transactionError) {
//         dbInstance.run('ROLLBACK;');
//         console.error("Transaction error during data insertion:", transactionError);
//         updateStatus(`Transaction error: ${transactionError.message}`, true);
//         throw transactionError;
//     } finally {
//         stmt.free();
//     }
// }

/**
 * Initializes the SQL.js database from a given SQLite database URL.
 * @async
 * @param {string} dbUrl - The URL of the SQLite database file.
 * @returns {Promise<SQL.Database>} The initialized SQL.js database instance.
 */
async function initializeDatabase(dbUrl) {
    try {
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
        });
        updateStatus('SQL.js initialized.');

        updateStatus(`Fetching database from ${dbUrl}...`, false, true);
        const response = await fetch(dbUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} while fetching ${dbUrl}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        updateStatus(`Database fetched successfully from ${dbUrl}.`, false, true);

        db = new SQL.Database(new Uint8Array(arrayBuffer));
        updateStatus('Database loaded successfully.', false, true);

        clearTableList(); // Clear the list before populating

        // Populate table list from the loaded database
        const tablesResult = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
        if (tablesResult.length > 0 && tablesResult[0].values) {
            tablesResult[0].values.forEach(row => {
                const tableName = row[0];
                addTableToList(tableName);
            });
            updateStatus('Table list populated.', false, true);
        } else {
            updateStatus('No tables found in the loaded database.', false, true);
        }

        updateStatus('Database ready for queries!', false, true);
        return db;

    } catch (error) {
        const errorMessage = `Database initialization failed: ${error.message}`;
        updateStatus(errorMessage, true);
        console.error("Database initialization error details:", error);
        throw error;
    }
}

// Export initializeDatabase and the db instance.
// Other functions like createTable, insertData, generateTableNameFromUrl are no longer needed for this approach.
export { initializeDatabase };
export { db };
