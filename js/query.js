import { db } from './db.js';
import { displayResults, displayQueryError, clearResults } from './ui/resultsDisplay.js';

export function processQueryResult(stmtResult) {
    if (!stmtResult || stmtResult.length === 0) {
        // This case leads to displayResults showing "No results to display" or similar.
        // It's equivalent to an empty allResultsJson in the original logic.
        return [];
    }

    const allResultsJson = stmtResult.map(resultSet => {
        if (!resultSet || !resultSet.columns || !resultSet.values) {
            return { message: "Query executed, but it did not return structured data (e.g., it might be a DDL/DML statement without output, or an issue with the query)." };
        }
        if (resultSet.values.length === 0) {
             return { message: "Query executed successfully, but no rows were returned for this statement." };
        }

        const columns = resultSet.columns;
        const values = resultSet.values;

        return values.map(row => {
            const rowObject = {};
            columns.forEach((col, index) => {
                rowObject[col] = row[index];
            });
            return rowObject;
        });
    });

    // Handle different structures of allResultsJson
    // (e.g. array of arrays of objects, or array of message objects)
    if (Array.isArray(allResultsJson) && allResultsJson.length === 1 && Array.isArray(allResultsJson[0])) {
        return allResultsJson[0]; // Single result set, return its rows/objects
    } else if (Array.isArray(allResultsJson) && allResultsJson.every(item => Array.isArray(item) && item.length === 1 && item[0].message)) {
        // This is for multiple statements each returning a message (e.g. multiple DDLs).
        // Return an object that signals this condition, perhaps with the joined messages.
        return { multipleMessages: true, messages: allResultsJson.map(item => item[0].message).join('<br>') };
    } else if (Array.isArray(allResultsJson) && allResultsJson.length > 0 && allResultsJson[0].message) {
        // Single statement that returned a message object (e.g. no rows)
        return allResultsJson[0];
    }

    // Default case: might be an array of row objects if only one resultSet was processed by map,
    // or array of arrays of row objects if multiple resultSets.
    // The original code didn't explicitly handle multiple actual data result sets well for displayResults.
    // For now, if it's an array of arrays of objects (multiple results with data), we'll return it as is.
    // displayResults might need adjustment if it's not expecting an array of arrays of objects.
    // However, sql.js usually returns one result set object per query string, even with multiple statements.
    // Each object in stmtResult corresponds to one statement.
    // So allResultsJson will be an array where each element is either array of row objects or a message object.
    // If multiple statements yield data, allResultsJson could be [ [{row1obj}, {row2obj}], [{rowAobj}, {rowBobj}] ]
    // This scenario needs clarification for how displayResults should handle it.
    // Let's assume for now that if it's not a single set or messages, it's complex and returned as is.
    // A simple scenario with multiple statements is multiple DDLs, handled by `multipleMessages`.
    // If it's one statement returning rows, it's `allResultsJson[0]` (handled).
    // If it's one statement returning a message, it's `allResultsJson[0]` (handled).
    // This covers most common cases.
    return allResultsJson; // Fallback, might be an array of (row-arrays or message-objects)
}

/**
 * Executes the SQL query from the input field and displays results.
 */
function executeQuery() {
    const sqlInput = document.getElementById('sql-input');
    clearResults();

    if (!db) {
        displayQueryError('Database not initialized yet. Please wait.');
        return;
    }

    const query = sqlInput.value;

    try {
        const stmtResult = db.exec(query); // This is an array of result objects
        const processedResult = processQueryResult(stmtResult);

        if (processedResult.multipleMessages) {
            displayQueryError(processedResult.messages); // Using displayQueryError for these combined messages
        } else {
            // displayResults expects an array of row objects, or a single message object.
            // If processedResult is an array of arrays (e.g. from multiple SELECTs),
            // we might need to display them iteratively or pick one.
            // For now, assume typical case is single SELECT or DDL.
            // If processQueryResult returns an array like [ [{row1},{row2}] ], this will be an issue.
            // Let's adjust processQueryResult and this call.
            // If processQueryResult returns an array and first element is an array, assume multiple data sets.
            if (Array.isArray(processedResult) && processedResult.length > 0 && Array.isArray(processedResult[0])) {
                // Multiple result sets with data. Display them one by one or concatenate.
                // For simplicity, let's display "Multiple results, showing first:"
                // Or join them if displayResults can handle it.
                // Current displayResults expects array of objects or single message object.
                // Let's just display the first result set if multiple data sets are returned.
                displayResults(processedResult[0]);
                if(processedResult.length > 1) {
                    // Maybe append a message using status updater? For now, just log.
                    console.warn("Multiple result sets returned by query, displaying only the first.");
                }
            } else {
                 displayResults(processedResult);
            }
        }

    } catch (error) {
        displayQueryError('SQL Error: ' + error.message);
        console.error("SQL Query Error:", error);
    }
}

export { executeQuery }; // executeQuery was already exported
