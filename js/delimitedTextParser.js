/**
 * Internal function to parse delimited text.
 * @param {string} text - The raw delimited text.
 * @param {string} delimiter - The delimiter character or string.
 * @returns {{headers: string[], dataRows: string[][]}} An object containing headers and dataRows.
 */
function _parseDelimitedText(text, delimiter) {
    const trimmedText = text.trim();

    // Requirement 1: If text.trim() is empty, return { headers: [], dataRows: [] }
    if (trimmedText === '') {
        return { headers: [], dataRows: [] };
    }

    const lines = trimmedText.split('\n');

    // Extract initial headers from the first line.
    // If lines[0] is undefined (e.g., for an empty trimmedText, though caught above), this would error.
    let allHeaders = lines[0].split(delimiter).map(header => header.trim());

    const finalHeaders = [...allHeaders];

    // Requirement 2: Process data lines, handling empty lines specifically
    const dataRows = lines.slice(1).map(line => {
        const trimmedLine = line.trim();
        if (trimmedLine === '') {
            // For an empty line, return an array of empty strings, one for each header.
            return finalHeaders.map(() => '');
        } else {
            const rowCells = trimmedLine.split(delimiter).map(cell => cell.trim());
            // Ensure the row has a value for each header, padding with empty strings if necessary.
            // This is important if a line has fewer delimiters than expected.
            return finalHeaders.map((_, index) => rowCells[index] || '');
        }
    });

    return { headers: finalHeaders, dataRows };
}

export { _parseDelimitedText };
