/**
 * Parses CSV text into headers and data rows.
 * @param {string} csvText - The raw CSV string.
 * @returns {{headers: string[], dataRows: string[]}} An object containing headers and dataRows.
 */
function parseCSV(csvText) {
    const trimmedText = csvText.trim();
    const lines = trimmedText.split('\n');

    // Extract headers from the first line.
    // Split by comma and trim each header.
    const headers = lines[0].split(',').map(header => header.trim());

    // Extract data rows from the subsequent lines.
    const dataRows = lines.slice(1);

    return { headers, dataRows };
}

export { parseCSV };
