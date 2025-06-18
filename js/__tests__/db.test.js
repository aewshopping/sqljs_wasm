import { generateTableNameFromUrl } from '../db.js'; // generateTableNameFromUrl now also handles sanitization

describe('db.js', () => {
  describe('generateTableNameFromUrl', () => {
    // Tests for URL-based generation (when customTableName is not provided)
    test('URL: should extract filename and remove .csv extension', () => {
      expect(generateTableNameFromUrl('https://example.com/data/my_data_file.csv')).toBe('my_data_file');
    });

    test('URL: should extract filename and remove .tsv extension', () => {
      expect(generateTableNameFromUrl('https://example.com/data/another-file.tsv')).toBe('another_file');
    });

    test('URL: should handle URLs with no extension', () => {
      expect(generateTableNameFromUrl('https://example.com/data/no_extension_here')).toBe('no_extension_here');
    });

    test('URL: should replace non-alphanumeric characters (except underscore) with underscore', () => {
      expect(generateTableNameFromUrl('https://example.com/data/file-with-hyphens&spaces 123.csv')).toBe('file_with_hyphens_spaces_123');
    });

    test('URL: should prefix with "table_" if name starts with a number', () => {
      expect(generateTableNameFromUrl('https://example.com/data/123_numeric_file.csv')).toBe('table_123_numeric_file');
    });

    test('URL: should handle complex URLs with query parameters and fragments', () => {
      expect(generateTableNameFromUrl('https://example.com/data/test_file.csv?param=value#fragment')).toBe('test_file');
    });

    test('URL: should handle URLs with mixed case and maintain original case for valid characters', () => {
      expect(generateTableNameFromUrl('https://example.com/data/MixedCaseFile.CSV')).toBe('MixedCaseFile');
    });

    test('URL: should handle file names with multiple dots', () => {
      // The logic is to remove the last extension, so .tar.gz becomes archive_tar
      expect(generateTableNameFromUrl('https://example.com/data/archive.tar.gz.csv')).toBe('archive_tar_gz');
    });

    test('URL: should return "default_table_name" if URL is empty or results in empty name after processing', () => {
      expect(generateTableNameFromUrl('')).toBe('default_table_name');
      expect(generateTableNameFromUrl('https://////')).toBe('default_table_name');
      expect(generateTableNameFromUrl('http://example.com/.csv')).toBe('default_table_name');
    });

    // Tests for customTableName
    test('CustomName: should use customTableName if provided and valid', () => {
      expect(generateTableNameFromUrl('https://example.com/ignored.csv', 'MyCustomTable')).toBe('MyCustomTable');
    });

    test('CustomName: should sanitize customTableName - spaces and special chars', () => {
      expect(generateTableNameFromUrl('https://example.com/ignored.csv', 'My Table Name!')).toBe('My_Table_Name_');
    });

    test('CustomName: should sanitize customTableName - leading numbers', () => {
      expect(generateTableNameFromUrl('https://example.com/ignored.csv', '123Table')).toBe('table_123Table');
    });

    test('CustomName: should sanitize customTableName - only special chars to default', () => {
      // '!@#$%^' -> '______' -> '_' -> removed as it is only remaining char -> '' -> 'default_table_name'
      expect(generateTableNameFromUrl('https://example.com/ignored.csv', '!@#$%^')).toBe('default_table_name');
    });

    test('CustomName: should sanitize customTableName - leading/trailing special chars', () => {
      expect(generateTableNameFromUrl('https://example.com/ignored.csv', '___MyTable---')).toBe('MyTable');
      expect(generateTableNameFromUrl('https://example.com/ignored.csv', '!!!MyTable!!!')).toBe('MyTable');
    });

    test('CustomName: should sanitize customTableName - multiple internal special chars', () => {
      expect(generateTableNameFromUrl('https://example.com/ignored.csv', 'My---Table___Name')).toBe('My_Table_Name');
    });

    test('CustomName: should fall back to URL if custom name becomes empty after sanitization (e.g. "   ")', () => {
      expect(generateTableNameFromUrl('https://example.com/fallback.csv', '')).toBe('fallback');
      expect(generateTableNameFromUrl('https://example.com/fallback.csv', '   ')).toBe('fallback');
    });

    test('CustomName: should fall back to URL if custom name becomes default_table_name trigger after sanitization (e.g. "___")', () => {
      expect(generateTableNameFromUrl('https://example.com/fallback.csv', '___')).toBe('fallback');
      expect(generateTableNameFromUrl('https://example.com/fallback.csv', '#$%')).toBe('fallback');
    });

    test('CustomName: should use customTableName even if URL is weird, if custom name is valid', () => {
      expect(generateTableNameFromUrl('!@#$', 'ValidCustomName')).toBe('ValidCustomName');
    });

    test('CustomName: should handle mixed case for custom names correctly', () => {
      expect(generateTableNameFromUrl('https://ignored.com/file.csv', 'Custom_TableName_123')).toBe('Custom_TableName_123');
    });

    test('CustomName: should return "default_table_name" if custom name ("!!!") and URL (e.g. ".csv") both sanitize to empty/invalid', () => {
        // Custom '!!!' -> '___' -> '_' -> '' -> 'default_table_name' (passed to sanitize)
        // URL '.csv' -> '' -> 'default_table_name'
        // Since custom name was provided but sanitized to a default trigger, and URL also to default, this specific case in generateTableNameFromUrl
        // where customTableName.trim() !== '' but sanitizeTableName(custom) IS 'default_table_name'
        // will still try to use it. The test is for sanitizeTableName's behavior mostly.
        // The generateTableNameFromUrl will take '!!!', sanitize it to 'default_table_name', and use that.
        expect(generateTableNameFromUrl('http://example.com/.csv', '!!!')).toBe('default_table_name');
    });

    test('URL: sanitizes to default if name becomes only underscores', () => {
      expect(generateTableNameFromUrl('http://example.com/____.csv')).toBe('default_table_name');
    });

  });

  // TODO: Add tests for createTable and insertData if feasible with mocking.
  // For now, focusing on generateTableNameFromUrl and sanitizeTableName.
  // Tests for initializeDatabase would be more involved, requiring mocks for fetch, SQL.js, etc.
});
