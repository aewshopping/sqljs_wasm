let db = null;
// Publicly accessible CSV file for demonstration.
// This URL points to a small, publicly available CSV from fivethirtyeight.
// Content (first few lines):
// Major,Major_Category,Total,Men,Women,ShareWomen,Median,P25th,P75th,Rank
// PETROLEUM ENGINEERING,Engineering,2339,2057,282,0.120564344,110000,95000,125000,1
// MINING AND MINERAL ENGINEERING,Engineering,756,679,77,0.1018518519,75000,55000,90000,2
// METALLURGICAL ENGINEERING,Engineering,856,725,131,0.1530373832,73000,50000,105000,3
const SMALL_CSV_URL = 'https://raw.githubusercontent.com/fivethirtyeight/data/master/college-majors/majors-list.csv';

/**
 * Initializes the SQL.js database and loads data from an external CSV.
 * @async
 */
async function initSqlJsAndLoadCsv() {
    const statusDiv = document.getElementById('status');
    try {
        // Initialize the SQL.js module.
        // The locateFile option is crucial for the script to find the .wasm binary.
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
        });
        db = new SQL.Database(); // Create an in-memory database
        statusDiv.innerText = 'SQL.js initialized.';

        // Fetch the CSV file from the specified URL.
        statusDiv.innerText += '\nFetching CSV data...';
        const response = await fetch(SMALL_CSV_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        statusDiv.innerText += '\nCSV data fetched successfully.';

        // Parse CSV text: split into lines, then extract headers and data rows.
        // This is a basic parser. For more robust parsing,
        // especially with complex CSVs (commas in data, quoted fields, etc.),
        // consider using a dedicated CSV parser library like Papaparse.
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const dataRows = lines.slice(1);

        // Create a table dynamically. Column names are derived from CSV headers.
        // Quoting headers (`"${h}"`) ensures compatibility with SQLite, even for names with spaces.
        const createTableSql = `CREATE TABLE csv_data (${headers.map(h => `"${h}" TEXT`).join(', ')});`;
        db.run(createTableSql);

        // Prepare an SQL INSERT statement for efficient bulk insertion.
        const placeholders = headers.map(() => '?').join(', ');
        const insertSql = `INSERT INTO csv_data VALUES (${placeholders});`;
        const stmt = db.prepare(insertSql);

        // Start a transaction for faster bulk inserts.
        db.run('BEGIN TRANSACTION;');
        try {
            dataRows.forEach(line => {
                const values = line.split(',').map(v => v.trim());
                // Only insert if the row has the correct number of columns
                if (values.length === headers.length) {
                    stmt.run(values);
                } else {
                    console.warn('Skipping malformed row:', line);
                }
            });
            db.run('COMMIT;'); // Commit the transaction on success
        } catch (transactionError) {
            db.run('ROLLBACK;'); // Rollback on error
            throw transactionError; // Re-throw to be caught by the outer catch
        } finally {
            stmt.free(); // Ensure the statement is freed
        }


        statusDiv.innerText += '\nCSV data loaded into "csv_data" table.';
        statusDiv.innerText += '\nDatabase ready for queries!';

        // Execute the initial query to show some data immediately.
        executeQuery();

    } catch (error) {
        // Display any errors during initialization or data loading.
        statusDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        console.error("Initialization error:", error);
    }
}

/**
 * Executes the SQL query from the input field and displays results as raw JSON.
 */
function executeQuery() {
    const sqlInput = document.getElementById('sql-input');
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Clear previous results

    // Check if the database is initialized.
    if (!db) {
        resultsDiv.innerHTML = '<p class="error">Database not initialized yet. Please wait.</p>';
        return;
    }

    const query = sqlInput.value;

    try {
        // db.exec() executes SQL and returns an array of result sets (for multiple statements).
        const stmtResult = db.exec(query);

        // Handle cases where no results are returned (e.g., DML statements or no matching rows).
        if (stmtResult.length === 0 || (stmtResult[0].columns === undefined && stmtResult[0].values === undefined)) {
            resultsDiv.innerHTML = '<p>No results found or query did not return data (e.g., INSERT, UPDATE, CREATE statements or no matching data).</p>';
            return;
        }

        // Process each result set and convert to an array of JSON objects.
        const allResultsJson = stmtResult.map(resultSet => {
            const columns = resultSet.columns;
            const values = resultSet.values;

            if (!columns || !values || values.length === 0) {
                return { message: "Query executed, but no rows returned for this statement." };
            }

            // Map rows to objects using column names as keys
            return values.map(row => {
                const rowObject = {};
                columns.forEach((col, index) => {
                    rowObject[col] = row[index];
                });
                return rowObject;
            });
        });

        // Display the raw JSON in a <pre> tag for readability.
        resultsDiv.innerHTML = `
            <h3>Raw JSON Output:</h3>
            <pre>${JSON.stringify(allResultsJson, null, 2)}</pre>
        `;

    } catch (error) {
        // Display any SQL execution errors.
        resultsDiv.innerHTML = `<p class="error">SQL Error: ${error.message}</p>`;
        console.error("SQL Query Error:", error);
    }
}

// Attach event listener to the execute button.
document.getElementById('execute-button').addEventListener('click', executeQuery);

// Start the database initialization and CSV loading process when the page loads.
initSqlJsAndLoadCsv();
