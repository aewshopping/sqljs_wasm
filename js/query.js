import { db } from './db.js'; // Imports the live binding of the db instance
import { displayResults, displayQueryError, clearResults } from './uiUpdater.js';

/**
 * Executes the SQL query from the input field and displays results.
 */
function executeQuery() {
    const sqlInput = document.getElementById('sql-input'); // Still need to get the query value
    // const resultsDiv = document.getElementById('results'); // No longer directly used for innerHTML changes

    clearResults(); // Clear previous results first

    if (!db) { // db here refers to the imported db instance
        displayQueryError('Database not initialized yet. Please wait.');
        return;
    }

    const query = sqlInput.value;

    try {
        const stmtResult = db.exec(query);

        // stmtResult is an array of objects, each object has 'columns' and 'values'
        // If stmtResult is empty (e.g. for 'CREATE TABLE'), or if columns/values are undefined/empty,
        // allResultsJson will become an empty array or an array of {message: ...}
        // displayResults is designed to handle these cases.

        const allResultsJson = stmtResult.map(resultSet => {
            // Check if resultSet itself is undefined or lacks columns/values, which can happen.
            if (!resultSet || !resultSet.columns || !resultSet.values) {
                return { message: "Query executed, but it did not return structured data (e.g., it might be a DDL/DML statement without output, or an issue with the query)." };
            }
            if (resultSet.values.length === 0) {
                 return { message: "Query executed successfully, but no rows were returned for this statement." };
            }

            const columns = resultSet.columns;
            const values = resultSet.values;

            // Map rows to objects using column names as keys
            return values.map(row => {
                const rowObject = {};
                columns.forEach((col, index) => {
                    rowObject[col] = row[index];
                });
                return rowObject;
            });
        });

        // If all statements resulted in messages (e.g. no actual data),
        // allResultsJson might be like [[{message:...}],[{message:...}]] or [{message:...}] if only one statement.
        // displayResults should ideally handle this. The current displayResults expects an array of row objects or a single message object.
        // If allResultsJson is an array of arrays, we might need to flatten it or adjust displayResults.
        // For now, let's assume allResultsJson will be an array of objects or an array of arrays of objects.
        // If it's an array of arrays, and there's only one result set, take the first element.
        let finalResultsToShow = allResultsJson;
        if (Array.isArray(allResultsJson) && allResultsJson.length === 1 && Array.isArray(allResultsJson[0])) {
            finalResultsToShow = allResultsJson[0];
        } else if (Array.isArray(allResultsJson) && allResultsJson.every(item => Array.isArray(item) && item.length === 1 && item[0].message)) {
            // This is for multiple statements each returning a message, e.g. multiple DDL.
            // We'll display messages joined.
            const messages = allResultsJson.map(item => item[0].message).join('<br>');
            displayQueryError(messages); // Using displayQueryError to show these messages, could be a new function.
            return;
        }


        // The original code had a check:
        // if (stmtResult.length === 0 || (stmtResult[0].columns === undefined && stmtResult[0].values === undefined))
        // This is now implicitly handled by the mapping. If stmtResult is empty, allResultsJson is empty.
        // displayResults will show "No results found..." for an empty allResultsJson.
        displayResults(finalResultsToShow);

    } catch (error) {
        displayQueryError('SQL Error: ' + error.message);
        console.error("SQL Query Error:", error);
    }
}

export { executeQuery };
