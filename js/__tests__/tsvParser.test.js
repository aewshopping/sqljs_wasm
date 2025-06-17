import { parseTSV } from '../tsvParser.js';

describe('parseTSV', () => {
  test('should correctly parse a simple TSV string', () => {
    const tsvText = 'Header1\tHeader2\nValue1\tValue2';
    const result = parseTSV(tsvText);
    expect(result.headers).toEqual(['Header1', 'Header2']);
    expect(result.dataRows).toEqual([['Value1', 'Value2']]);
  });

  test('should return empty headers and dataRows for an empty string', () => {
    const result = parseTSV('');
    expect(result.headers).toEqual([]);
    expect(result.dataRows).toEqual([]);
  });

  test('should return empty headers and dataRows for a string with only whitespace', () => {
    const result = parseTSV('   \n   ');
    expect(result.headers).toEqual([]);
    expect(result.dataRows).toEqual([]);
  });

  test('should handle TSV text with empty lines, producing rows with empty strings', () => {
    const tsvText = 'H1\tH2\nVal1\tVal2\n\nVal3\tVal4';
    const result = parseTSV(tsvText);
    expect(result.headers).toEqual(['H1', 'H2']);
    expect(result.dataRows).toEqual([
      ['Val1', 'Val2'],
      ['', ''],
      ['Val3', 'Val4'],
    ]);
  });

  test('should handle null input by treating it as an empty string', () => {
    const result = parseTSV(null);
    expect(result.headers).toEqual([]);
    expect(result.dataRows).toEqual([]);
  });

  test('should handle undefined input by treating it as an empty string', () => {
    const result = parseTSV(undefined);
    expect(result.headers).toEqual([]);
    expect(result.dataRows).toEqual([]);
  });

  test('should parse headers correctly when only headers are present', () => {
    const result = parseTSV('Header1\tHeader2\tHeader3');
    expect(result.headers).toEqual(['Header1', 'Header2', 'Header3']);
    expect(result.dataRows).toEqual([]);
  });

  test('should trim whitespace from headers and data cells', () => {
    const tsvText = '  Name  \t Age \n  Alice  \t 30  ';
    const result = parseTSV(tsvText);
    expect(result.headers).toEqual(['Name', 'Age']);
    expect(result.dataRows).toEqual([['Alice', '30']]);
  });
});
