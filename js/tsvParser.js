/**
 * Parses TSV text into headers and data rows.
 * @param {string} tsvText - The raw TSV string.
 * @returns {{headers: string[], dataRows: string[][]}} An object containing headers and dataRows (as an array of arrays of strings).
 */
function parseTSV(tsvText) {
    const trimmedText = tsvText.trim();
    const lines = trimmedText.split('\n');

    // Extract headers from the first line.
    // Split by tab and trim each header.
    const headers = lines[0].split('\t').map(header => header.trim());

    // Extract data rows from the subsequent lines.
    const dataRows = lines.slice(1).map(line => {
        return line.split('\t').map(cell => cell.trim());
    });

    return { headers, dataRows };
}

export { parseTSV };
