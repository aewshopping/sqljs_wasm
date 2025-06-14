import { generateTableNameFromUrl } from '../js/db.js';

QUnit.module('generateTableNameFromUrl');

QUnit.test('should generate table name from simple URL', function(assert) {
  const url = 'http://example.com/data.csv';
  const expected = 'data';
  assert.equal(generateTableNameFromUrl(url), expected, 'Simple URL to table name');
});

QUnit.test('should remove file extension', function(assert) {
  const url = 'http://example.com/archive.tar.gz';
  const expected = 'archive_tar'; // .gz is removed, then .tar is removed
  assert.equal(generateTableNameFromUrl(url), expected, 'Removes .tar.gz extension');
});

QUnit.test('should handle URLs with no file extension', function(assert) {
  const url = 'http://example.com/data';
  const expected = 'data';
  assert.equal(generateTableNameFromUrl(url), expected, 'URL with no extension');
});

QUnit.test('should replace special characters with underscores', function(assert) {
  const url = 'http://example.com/my-data-file_123.csv';
  const expected = 'my_data_file_123';
  assert.equal(generateTableNameFromUrl(url), expected, 'Replaces hyphens and keeps underscores');
});

QUnit.test('should prefix with "table_" if name starts with a number', function(assert) {
  const url = 'http://example.com/123data.csv';
  const expected = 'table_123data';
  assert.equal(generateTableNameFromUrl(url), expected, 'Prefixes number-starting names');
});

QUnit.test('should handle complex URLs', function(assert) {
  const url = 'https://www.example.co.uk/path/to/007-special_report.v2.txt?query=param#fragment';
  const expected = 'table_007_special_report_v2';
  assert.equal(generateTableNameFromUrl(url), expected, 'Handles complex URL with params and fragment');
});

QUnit.test('should handle file names with multiple dots', function(assert) {
    const url = 'http://example.com/some.file.name.with.dots.csv';
    const expected = 'some_file_name_with_dots';
    assert.equal(generateTableNameFromUrl(url), expected, 'Handles multiple dots in filename');
});

QUnit.test('should handle already sanitized names correctly', function(assert) {
    const url = 'http://example.com/already_sanitized_name.csv';
    const expected = 'already_sanitized_name';
    assert.equal(generateTableNameFromUrl(url), expected, 'Handles already sanitized name');
});
