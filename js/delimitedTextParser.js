/**
 * Internal function to parse delimited text.
 * @param {string} text - The raw delimited text.
 * @param {string} delimiter - The delimiter character or string.
 * @param {string[]} [excludedColumns] - Optional. An array of column names to exclude.
 * @returns {{headers: string[], dataRows: string[][]}} An object containing headers and dataRows.
 */
function _parseDelimitedText(text, delimiter, excludedColumns) {
    const trimmedText = text.trim();

    // Requirement 1: If text.trim() is empty, return { headers: [''], dataRows: [] }
    if (trimmedText === '') {
        return { headers: [''], dataRows: [] };
    }

    const lines = trimmedText.split('\n');

    // Extract initial headers from the first line.
    // If lines[0] is undefined (e.g., for an empty trimmedText, though caught above), this would error.
    let allHeaders = lines[0].split(delimiter).map(header => header.trim());

    let keptHeaderIndices = [];
    let finalHeaders; // These are the headers after exclusion

    if (excludedColumns && Array.isArray(excludedColumns) && excludedColumns.length > 0) {
        finalHeaders = [];
        allHeaders.forEach((header, index) => {
            if (!excludedColumns.includes(header)) {
                finalHeaders.push(header);
                keptHeaderIndices.push(index);
            }
        });
    } else {
        // No exclusion, or invalid/empty excludedColumns array
        finalHeaders = [...allHeaders]; // Use a copy
        keptHeaderIndices = allHeaders.map((_, index) => index);
    }

    // Requirement 2: Process data lines, handling empty lines specifically
    const dataRows = lines.slice(1).map(line => {
        const trimmedLine = line.trim();
        if (trimmedLine === '') {
            // If an empty line is encountered:
            // - If the first column (index 0) is among the kept columns, represent this line as [''].
            // - Otherwise (if the first column is excluded), represent this line as [].
            return keptHeaderIndices.includes(0) ? [''] : [];
        } else {
            const initialRow = trimmedLine.split(delimiter).map(cell => cell.trim());
            // For non-empty lines, map based on kept original indices.
            return keptHeaderIndices.map(index => {
                const cellValue = initialRow[index];
                return typeof cellValue === 'string' ? cellValue : '';
            });
        }
    });

    return { headers: finalHeaders, dataRows };
}

export { _parseDelimitedText };
