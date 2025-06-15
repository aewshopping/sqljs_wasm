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
    dataRows: [[''], ['value1', 'value2'], ['']] // Empty line becomes [''] if first col kept, same for trailing newline
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
    dataRows: [['value1', 'value2'], ['']] // Trailing newline results in a row with an empty cell if first col kept
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


QUnit.module('parseTSV - Column Exclusion');

QUnit.test('no exclusion - should parse all columns', function(assert) {
  const tsvText = 'name\tage\tcity\nAlice\t30\tNew York';
  const expected = {
    headers: ['name', 'age', 'city'],
    dataRows: [['Alice', '30', 'New York']]
  };
  assert.deepEqual(parseTSV(tsvText), expected, 'No exclusion: Parses all columns');
});

QUnit.test('exclude a single existing column', function(assert) {
  const tsvText = 'name\tage\tcity\nAlice\t30\tNew York\nBob\t25\tChicago';
  const excludedColumns = ['age'];
  const expected = {
    headers: ['name', 'city'],
    dataRows: [['Alice', 'New York'], ['Bob', 'Chicago']]
  };
  assert.deepEqual(parseTSV(tsvText, excludedColumns), expected, 'Exclude single column: "age"');
});

QUnit.test('exclude multiple existing columns', function(assert) {
  const tsvText = 'name\tage\tcity\tcountry\nAlice\t30\tNew York\tUSA\nBob\t25\tChicago\tUSA';
  const excludedColumns = ['age', 'country'];
  const expected = {
    headers: ['name', 'city'],
    dataRows: [['Alice', 'New York'], ['Bob', 'Chicago']]
  };
  assert.deepEqual(parseTSV(tsvText, excludedColumns), expected, 'Exclude multiple columns: "age", "country"');
});

QUnit.test('exclude a non-existent column', function(assert) {
  const tsvText = 'name\tage\tcity\nAlice\t30\tNew York';
  const excludedColumns = ['occupation'];
  const expected = {
    headers: ['name', 'age', 'city'],
    dataRows: [['Alice', '30', 'New York']]
  };
  assert.deepEqual(parseTSV(tsvText, excludedColumns), expected, 'Exclude non-existent column: "occupation"');
});

QUnit.test('exclude a mix of existing and non-existent columns', function(assert) {
  const tsvText = 'name\tage\tcity\nAlice\t30\tNew York';
  const excludedColumns = ['age', 'occupation'];
  const expected = {
    headers: ['name', 'city'],
    dataRows: [['Alice', 'New York']]
  };
  assert.deepEqual(parseTSV(tsvText, excludedColumns), expected, 'Exclude mix: "age" (exists), "occupation" (non-existent)');
});

QUnit.test('exclude all columns', function(assert) {
  const tsvText = 'name\tage\tcity\nAlice\t30\tNew York\nBob\t25\tChicago';
  const excludedColumns = ['name', 'age', 'city'];
  const expected = {
    headers: [],
    dataRows: [[], []]
  };
  assert.deepEqual(parseTSV(tsvText, excludedColumns), expected, 'Exclude all columns');
});

QUnit.test('pass an empty array for excludedColumns', function(assert) {
  const tsvText = 'name\tage\tcity\nAlice\t30\tNew York';
  const excludedColumns = [];
  const expected = {
    headers: ['name', 'age', 'city'],
    dataRows: [['Alice', '30', 'New York']]
  };
  assert.deepEqual(parseTSV(tsvText, excludedColumns), expected, 'Exclude with empty array: no columns excluded');
});

QUnit.test('pass null for excludedColumns', function(assert) {
  const tsvText = 'name\tage\tcity\nAlice\t30\tNew York';
  const excludedColumns = null;
  const expected = {
    headers: ['name', 'age', 'city'],
    dataRows: [['Alice', '30', 'New York']]
  };
  assert.deepEqual(parseTSV(tsvText, excludedColumns), expected, 'Exclude with null: no columns excluded');
});

QUnit.test('pass undefined for excludedColumns (implicitly by not passing)', function(assert) {
  const tsvText = 'name\tage\tcity\nAlice\t30\tNew York';
  const expected = {
    headers: ['name', 'age', 'city'],
    dataRows: [['Alice', '30', 'New York']]
  };
  assert.deepEqual(parseTSV(tsvText), expected, 'Exclude with undefined (argument not passed): no columns excluded');
});
