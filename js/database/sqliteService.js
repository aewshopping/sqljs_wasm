import initSqlJs from 'sql.js';

let db = null;

// Function to initialize SQL.js and the database instance
async function initializeDb(sqlJsConfig) {
    if (db) {
        console.warn("Database already initialized in sqliteService.");
        return db;
    }
    try {
        let config = sqlJsConfig;
        if (!config) { // If no specific config is passed
            if (typeof window === 'undefined') { // Node.js like environment
                // In Node, sql.js often finds its own wasm file if installed via npm
                config = {};
            } else { // Browser environment
                config = { locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}` };
            }
        }
        // If config was passed, it's used as is. This allows caller to specify wasm location.

        const SQL = await initSqlJs(config);
        db = new SQL.Database();
        console.log("SQL.js database initialized in sqliteService.");
        return db;
    } catch (error) {
        console.error("Error initializing SQL.js in sqliteService:", error);
        throw error;
    }
}

// Function to get the database instance
function getDb() {
    if (!db) {
        throw new Error("Database not initialized in sqliteService. Call initializeDb first.");
    }
    return db;
}

/**
 * Generates a sanitized table name from a URL.
 * (Copied from js/db.js)
 * @param {string} url - The URL to generate a table name from.
 * @returns {string} The sanitized table name.
 */
function generateTableNameFromUrl(url) {
    // Extract filename from URL
    let filename = url.substring(url.lastIndexOf('/') + 1);
    // Remove file extension
    filename = filename.replace(/\.[^/.]+$/, "");
    // Replace non-alphanumeric characters (except underscores) with underscores
    filename = filename.replace(/[^a-zA-Z0-9_]/g, '_');
    // Ensure the name starts with a letter or underscore
    if (/^[0-9]/.test(filename)) {
        filename = "table_" + filename;
    }
    return filename;
}

/**
 * Creates a table in the database.
 * (Copied from js/db.js and modified to remove updateStatus)
 * @param {SQL.Database} dbInstance - The initialized SQL.js database instance.
 * @param {string} tableName - The name of the table to create.
 * @param {string[]} headers - Array of header strings for table columns.
 */
function createTable(dbInstance, tableName, headers) {
    const createTableSql = `CREATE TABLE "${tableName}" (${headers.map(h => `"${h}" TEXT`).join(', ')});`;
    try {
        dbInstance.run(createTableSql);
        // console.log(`Table "${tableName}" created with headers: ${headers.join(', ')}.`);
        return true; // Indicate success
    } catch (error) {
        console.error(`Error creating table "${tableName}":`, error);
        throw error; // Re-throw for the caller to handle
    }
}

/**
 * Inserts data rows into the specified table.
 * (Copied from js/db.js and modified to remove updateStatus)
 * @param {SQL.Database} dbInstance - The initialized SQL.js database instance.
 * @param {string} tableName - The name of the table to insert data into.
 * @param {string[]} headers - Array of header strings for table columns (used for validation).
 * @param {string[][]} dataRows - Array of data row arrays (pre-parsed values).
 */
async function insertData(dbInstance, tableName, headers, dataRows) {
    if (dataRows.length === 0) {
        // console.log(`No data to insert into "${tableName}".`);
        return 0; // No rows inserted
    }

    const escapeSqlString = (val) => String(val).replace(/'/g, "''");

    const validRows = dataRows.filter(row => {
        if (row.length === headers.length) {
            return true;
        }
        console.warn(`Skipping malformed row in table ${tableName} (header/value count mismatch):`, row.join(','));
        return false;
    });

    if (validRows.length === 0) {
        // console.log(`No valid data rows to insert into "${tableName}" after filtering.`);
        return 0; // No rows inserted
    }

    const valuesString = validRows
        .map(row =>
            `(${row.map(val => `'${escapeSqlString(val)}'`).join(', ')})`
        )
        .join(', ');

    const insertSql = `INSERT INTO "${tableName}" VALUES ${valuesString};`;

    dbInstance.run('BEGIN TRANSACTION;');
    try {
        dbInstance.run(insertSql);
        dbInstance.run('COMMIT;');
        // console.log(`Inserted ${validRows.length} rows into "${tableName}".`);
        return validRows.length; // Return number of inserted rows
    } catch (transactionError) {
        dbInstance.run('ROLLBACK;');
        console.error(`Transaction error during data insertion into "${tableName}":`, transactionError);
        throw transactionError; // Re-throw for the caller to handle
    }
}

export { initializeDb, getDb, generateTableNameFromUrl, createTable, insertData };
