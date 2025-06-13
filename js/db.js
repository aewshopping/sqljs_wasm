import { parseCSV } from './csvParser.js';
import { updateStatus } from './uiUpdater.js';

let db = null;
const SMALL_CSV_URL = 'https://raw.githubusercontent.com/fivethirtyeight/data/master/college-majors/majors-list.csv';

/**
 * Creates a table and inserts data into the database.
 * @async
 * @param {SQL.Database} dbInstance - The initialized SQL.js database instance.
 * @param {string[]} headers - Array of header strings for table columns.
 * @param {string[]} dataRows - Array of data row strings (CSV lines).
 */
async function createTableAndInsertData(dbInstance, headers, dataRows) {
    // Create a table dynamically.
    const createTableSql = `CREATE TABLE csv_data (${headers.map(h => `"${h}" TEXT`).join(', ')});`;
    dbInstance.run(createTableSql);

    // Prepare an SQL INSERT statement.
    const placeholders = headers.map(() => '?').join(', ');
    const insertSql = `INSERT INTO csv_data VALUES (${placeholders});`;
    const stmt = dbInstance.prepare(insertSql);

    // Start a transaction for faster bulk inserts.
    dbInstance.run('BEGIN TRANSACTION;');
    try {
        dataRows.forEach(line => {
            const values = line.split(',').map(v => v.trim());
            if (values.length === headers.length) {
                stmt.run(values);
            } else {
                console.warn('Skipping malformed row:', line);
            }
        });
        dbInstance.run('COMMIT;');
    } catch (transactionError) {
        dbInstance.run('ROLLBACK;');
        console.error("Transaction error during data insertion:", transactionError);
        throw transactionError; // Re-throw to be caught by initializeDatabase
    } finally {
        stmt.free();
    }
}

/**
 * Initializes the SQL.js database and loads data from an external CSV.
 * @async
 * @returns {Promise<SQL.Database>} The initialized SQL.js database instance.
 */
async function initializeDatabase() {
    try {
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
        });
        db = new SQL.Database();
        updateStatus('SQL.js initialized.');

        updateStatus('Fetching CSV data...', false, true);
        const response = await fetch(SMALL_CSV_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        updateStatus('CSV data fetched successfully.', false, true);

        const { headers, dataRows } = parseCSV(csvText);

        // Call the new helper function to create table and insert data
        await createTableAndInsertData(db, headers, dataRows);

        updateStatus('CSV data loaded into "csv_data" table.', false, true);
        updateStatus('Database ready for queries!', false, true);

        return db;

    } catch (error) {
        // Ensure error message is specific to initialization phase
        const errorMessage = error.message.includes("Transaction error")
            ? "Failed during data transaction: " + error.message
            : "Initialization failed: " + error.message;
        updateStatus(errorMessage, true);
        console.error("Initialization error details:", error); // Log the original error object
        throw error;
    }
}

export { initializeDatabase };
export { db };
