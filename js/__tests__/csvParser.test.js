import { parseCSV } from '../csvParser.js';

describe('parseCSV', () => {
  test('should return empty headers and data for empty input', () => {
    const result = parseCSV('');
    expect(result.headers).toEqual([]);
    expect(result.dataRows).toEqual([]);
  });

  test('should return headers and empty data for header-only input', () => {
    const result = parseCSV('header1,header2');
    expect(result.headers).toEqual(['header1', 'header2']);
    expect(result.dataRows).toEqual([]);
  });

  test('should parse simple CSV data correctly', () => {
    const csvText = 'header1,header2\nrow1col1,row1col2';
    const result = parseCSV(csvText);
    expect(result.headers).toEqual(['header1', 'header2']);
    expect(result.dataRows).toEqual([['row1col1', 'row1col2']]);
  });

  test('should handle null input gracefully', () => {
    const result = parseCSV(null);
    expect(result.headers).toEqual([]);
    expect(result.dataRows).toEqual([]);
  });

  test('should handle undefined input gracefully', () => {
    const result = parseCSV(undefined);
    expect(result.headers).toEqual([]);
    expect(result.dataRows).toEqual([]);
  });
});
