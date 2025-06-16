import { _parseDelimitedText } from './delimitedTextParser.js';

/**
 * Parses TSV text into headers and data rows.
 * @param {string} tsvText - The raw TSV string.
 * @returns {{headers: string[], dataRows: string[][]}} An object containing headers and dataRows (as an array of arrays of strings).
 */
function parseTSV(tsvText) {
  // Ensure tsvText is a string, default to empty if null/undefined
  const textToParse = typeof tsvText === 'string' ? tsvText : '';
  return _parseDelimitedText(textToParse, '\t');
}

export { parseTSV };
