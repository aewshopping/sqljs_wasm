const copyButtonHTML = '<button id="copy-button" class="copy-button">Copy</button>';

/**
 * Displays query results in the results area.
 * @param {Array<Object>|Object} resultsArray - The array of result objects or a single object indicating no results/message.
 */
function displayResults(resultsArray) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) {
        console.error("Results display element not found.");
        return;
    }
    // resultsDiv.innerHTML = ''; // Clear previous results - now handled by prepending copyButtonHTML

    // Check for specific message objects or empty arrays
    if (!resultsArray || resultsArray.length === 0 ||
        (typeof resultsArray === 'object' && resultsArray.message && Object.keys(resultsArray).length === 1) ||
        (Array.isArray(resultsArray) && resultsArray.every(item => typeof item === 'object' && item.message))) {

        let message = "No results found or query did not return data (e.g., INSERT, UPDATE, CREATE statements or no matching data).";
        // If resultsArray contains a message, use it
        if (typeof resultsArray === 'object' && resultsArray.message) {
            message = resultsArray.message;
        } else if (Array.isArray(resultsArray) && resultsArray.length > 0 && resultsArray[0].message) {
            // Handle case where it's an array of message objects (as produced by current query.js)
            message = resultsArray.map(r => r.message || JSON.stringify(r)).join('<br>');
        }
        resultsDiv.innerHTML = `${copyButtonHTML}<p>${message}</p>`;
        return;
    }

    // Display the raw JSON in a <pre> tag for readability.
    // This assumes resultsArray is an array of result sets, and each has columns/values
    // or it's the direct array of row objects.
    // The current query.js wraps this in an outer array: allResultsJson = stmtResult.map(...)
    // So, resultsArray here is expected to be that allResultsJson.
    resultsDiv.innerHTML = `${copyButtonHTML}
        <h3>Raw JSON Output:</h3>
        <pre>${JSON.stringify(resultsArray, null, 2)}</pre>
    `;
}

/**
 * Displays an error message in the query results area.
 * @param {string} errorMessage - The error message to display.
 */
function displayQueryError(errorMessage) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) {
        console.error("Results display element not found.");
        return;
    }
    resultsDiv.innerHTML = `${copyButtonHTML}<p class="error">SQL Error: ${errorMessage}</p>`;
}

/**
 * Clears the content of the results area.
 */
function clearResults() {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) {
        console.error("Results display element not found.");
        return;
    }
    resultsDiv.innerHTML = copyButtonHTML;
}

export { displayResults, displayQueryError, clearResults };
