/**
 * Updates the status message display.
 * @param {string} message - The message to display.
 * @param {boolean} [isError=false] - True if the message is an error.
 * @param {boolean} [append=false] - True to append to existing messages, false to overwrite.
 */
function updateStatus(message, isError = false, append = false) {
    const statusDiv = document.getElementById('status');
    if (!statusDiv) {
        console.error("Status display element not found.");
        return;
    }

    let formattedMessage = message;
    if (isError) {
        formattedMessage = `<p class="error">${message}</p>`;
    }

    if (append) {
        const currentContent = statusDiv.innerHTML;
        statusDiv.innerHTML = currentContent + (currentContent ? '<br>' : '') + formattedMessage;
    } else {
        if (isError) {
            statusDiv.innerHTML = formattedMessage;
        } else {
            // Use innerText for non-error, non-appended messages to avoid HTML injection
            // unless message itself is intended to be HTML.
            // For simplicity and consistency with error handling, using innerHTML here.
            // If message could contain user input, sanitization or using innerText would be safer.
            statusDiv.innerHTML = message; // Or statusDiv.innerText = message if no HTML is intended.
        }
    }
}

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
    resultsDiv.innerHTML = ''; // Clear previous results

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
        resultsDiv.innerHTML = `<p>${message}</p>`;
        return;
    }

    // Display the raw JSON in a <pre> tag for readability.
    // This assumes resultsArray is an array of result sets, and each has columns/values
    // or it's the direct array of row objects.
    // The current query.js wraps this in an outer array: allResultsJson = stmtResult.map(...)
    // So, resultsArray here is expected to be that allResultsJson.
    resultsDiv.innerHTML = `
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
    resultsDiv.innerHTML = `<p class="error">SQL Error: ${errorMessage}</p>`;
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
    resultsDiv.innerHTML = '';
}

export { updateStatus, displayResults, displayQueryError, clearResults };
