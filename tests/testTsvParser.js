import { parseTSV } from '../js/tsvParser.js';

QUnit.module('parseTSV');

QUnit.test('should parse a simple TSV string', function(assert) {
  const tsvText = 'header1\theader2\nvalue1\tvalue2';
  const expected = {
    headers: ['header1', 'header2'],
    dataRows: [['value1', 'value2']]
  };
  assert.deepEqual(parseTSV(tsvText), expected, 'Correctly parses simple TSV');
});

QUnit.test('should handle extra spaces around headers and values', function(assert) {
  const tsvText = ' header1 \t header2 \n value1 \t value2 ';
  const expected = {
    headers: ['header1', 'header2'],
    dataRows: [['value1', 'value2']]
  };
  assert.deepEqual(parseTSV(tsvText), expected, 'Correctly trims spaces');
});

QUnit.test('should handle empty lines in TSV input', function(assert) {
  const tsvText = 'header1\theader2\n\nvalue1\tvalue2\n';
  // Similar to CSV, empty lines will likely become rows with empty strings
  const expected = {
    headers: ['header1', 'header2'],
    dataRows: [[''], ['value1', 'value2'], ['']] // "" for middle empty line, "" for trailing newline
  };
  assert.deepEqual(parseTSV(tsvText), expected, 'Handles empty lines by creating rows with empty string cells');
});

QUnit.test('should parse TSV with only headers and no data rows', function(assert) {
  const tsvText = 'header1\theader2';
  const expected = {
    headers: ['header1', 'header2'],
    dataRows: []
  };
  assert.deepEqual(parseTSV(tsvText), expected, 'Correctly parses TSV with only headers');
});

QUnit.test('should handle TSV with trailing newline', function(assert) {
  const tsvText = 'header1\theader2\nvalue1\tvalue2\n';
  const expected = {
    headers: ['header1', 'header2'],
    dataRows: [['value1', 'value2'], ['']] // Trailing newline results in a row with an empty cell
  };
  assert.deepEqual(parseTSV(tsvText), expected, 'Correctly handles TSV with trailing newline');
});
