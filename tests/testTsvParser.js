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
  const expected = {
    headers: ['header1', 'header2'],
    dataRows: [['', ''], ['value1', 'value2'], ['', '']] // Empty line becomes an array of empty strings
  };
  assert.deepEqual(parseTSV(tsvText), expected, 'Handles empty lines by creating rows with empty string cells for each header');
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
    dataRows: [['value1', 'value2'], ['', '']] // Trailing newline results in a row of empty strings
  };
  assert.deepEqual(parseTSV(tsvText), expected, 'Correctly handles TSV with trailing newline');
});

QUnit.test('should handle empty string input', function(assert) {
  const tsvText = '';
  const expected = {
    headers: [''], // _parseDelimitedText returns [''] for headers if trimmed input is empty
    dataRows: []
  };
  assert.deepEqual(parseTSV(tsvText), expected, 'Handles empty string input');
});

QUnit.test('should handle input as newline character', function(assert) {
  const tsvText = '\n';
  const expected = {
    headers: [''], // _parseDelimitedText returns [''] for headers if trimmed input is empty
    dataRows: []   // And empty dataRows, as '' input does not imply presence of a data line.
  };
  assert.deepEqual(parseTSV(tsvText), expected, 'Handles input as newline character');
});
