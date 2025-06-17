import { _parseDelimitedText } from '../delimitedTextParser.js';

describe('_parseDelimitedText', () => {
  test('should return empty headers and dataRows for empty text', () => {
    const result = _parseDelimitedText('', ',');
    expect(result.headers).toEqual([]);
    expect(result.dataRows).toEqual([]);
  });

  test('should return empty headers and dataRows for text with only whitespace', () => {
    const result = _parseDelimitedText('   \n   ', ',');
    expect(result.headers).toEqual([]);
    expect(result.dataRows).toEqual([]);
  });

  test('should parse headers correctly when only headers are present', () => {
    const result = _parseDelimitedText('Header1,Header2,Header3', ',');
    expect(result.headers).toEqual(['Header1', 'Header2', 'Header3']);
    expect(result.dataRows).toEqual([]);
  });

  test('should trim whitespace from headers', () => {
    const result = _parseDelimitedText('  Header1  , Header2,Header3  ', ',');
    expect(result.headers).toEqual(['Header1', 'Header2', 'Header3']);
  });

  test('should parse headers and data rows correctly with comma delimiter', () => {
    const text = 'Name,Age,City\nAlice,30,New York\nBob,24,Los Angeles';
    const result = _parseDelimitedText(text, ',');
    expect(result.headers).toEqual(['Name', 'Age', 'City']);
    expect(result.dataRows).toEqual([
      ['Alice', '30', 'New York'],
      ['Bob', '24', 'Los Angeles'],
    ]);
  });

  test('should parse headers and data rows correctly with tab delimiter', () => {
    const text = 'Name\tAge\tCity\nAlice\t30\tNew York\nBob\t24\tLos Angeles';
    const result = _parseDelimitedText(text, '\t');
    expect(result.headers).toEqual(['Name', 'Age', 'City']);
    expect(result.dataRows).toEqual([
      ['Alice', '30', 'New York'],
      ['Bob', '24', 'Los Angeles'],
    ]);
  });

  test('should handle empty lines in data, producing rows with empty strings', () => {
    const text = 'H1,H2\nVal1,Val2\n\nVal3,Val4';
    const result = _parseDelimitedText(text, ',');
    expect(result.headers).toEqual(['H1', 'H2']);
    expect(result.dataRows).toEqual([
      ['Val1', 'Val2'],
      ['', ''],
      ['Val3', 'Val4'],
    ]);
  });

  test('should trim whitespace from data cells', () => {
    const text = 'Name,Age\n  Alice  , 30  ';
    const result = _parseDelimitedText(text, ',');
    expect(result.dataRows).toEqual([['Alice', '30']]);
  });

  test('should handle rows with fewer columns than headers, padding with empty strings', () => {
    const text = 'H1,H2,H3\nVal1,Val2\nValA';
    const result = _parseDelimitedText(text, ',');
    expect(result.headers).toEqual(['H1', 'H2', 'H3']);
    expect(result.dataRows).toEqual([
      ['Val1', 'Val2', ''],
      ['ValA', '', ''],
    ]);
  });

  test('should handle rows with more columns than headers, extra columns are ignored by current logic but row length matches header length', () => {
    // The current implementation of _parseDelimitedText implicitly truncates rows
    // that have more cells than headers because finalHeaders.map((_, index) => rowCells[index] || '')
    // will only iterate up to finalHeaders.length.
    const text = 'H1,H2\nVal1,Val2,ExtraVal';
    const result = _parseDelimitedText(text, ',');
    expect(result.headers).toEqual(['H1', 'H2']);
    expect(result.dataRows).toEqual([['Val1', 'Val2']]);
  });

  test('should handle text with leading/trailing newlines around content', () => {
     const text = '\nName,Age\nAlice,30\nBob,24\n';
     const result = _parseDelimitedText(text, ',');
     expect(result.headers).toEqual(['Name', 'Age']);
     expect(result.dataRows).toEqual([
         ['Alice', '30'],
         ['Bob', '24']
     ]);
  });

  test('should handle delimiter being a semicolon', () => {
     const text = 'FieldA;FieldB\nData1A;Data1B\nData2A;Data2B';
     const result = _parseDelimitedText(text, ';');
     expect(result.headers).toEqual(['FieldA', 'FieldB']);
     expect(result.dataRows).toEqual([
         ['Data1A', 'Data1B'],
         ['Data2A', 'Data2B']
     ]);
  });
});
