/**
 * Parses CSV text into headers and data rows.
 * @param {string} csvText - The raw CSV string.
 * @returns {{headers: string[], dataRows: string[][]}} An object containing headers and dataRows (as an array of arrays of strings).
 */
function parseCSV(csvText) {
    const trimmedText = csvText.trim();
    const lines = trimmedText.split('\n');

    // Extract headers from the first line.
    // Split by comma and trim each header.
    const headers = lines[0].split(',').map(header => header.trim());

    // Extract data rows from the subsequent lines.
    // Each line is split by comma, and each cell is trimmed.
    const dataRows = lines.slice(1).map(line => {
        return line.split(',').map(cell => cell.trim());
    });

    return { headers, dataRows };
}

export { parseCSV };
