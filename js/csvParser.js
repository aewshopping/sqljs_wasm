import { _parseDelimitedText } from './delimitedTextParser.js';

/**
 * Parses CSV text into headers and data rows.
 * @param {string} csvText - The raw CSV string.
 * @returns {{headers: string[], dataRows: string[][]}} An object containing headers and dataRows (as an array of arrays of strings).
 */
function parseCSV(csvText) {
    // Ensure csvText is a string before passing it to _parseDelimitedText
    // If csvText is null or undefined, treat as empty string.
    const textToParse = typeof csvText === 'string' ? csvText : '';
    return _parseDelimitedText(textToParse, ',');
}

export { parseCSV };
