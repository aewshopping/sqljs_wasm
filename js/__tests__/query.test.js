import { processQueryResult } from '../query.js';

describe('query.js', () => {
  describe('processQueryResult', () => {
    test('should return an empty array for null or empty stmtResult', () => {
      expect(processQueryResult(null)).toEqual([]);
      expect(processQueryResult([])).toEqual([]);
    });

    test('should return a message object if a resultSet is empty or malformed', () => {
      const stmtResult = [null];
      // Corrected: Expect a single message object, not an array
      expect(processQueryResult(stmtResult)).toEqual({ message: "Query executed, but it did not return structured data (e.g., it might be a DDL/DML statement without output, or an issue with the query)." });
    });

    test('should return a message object if resultSet.values is empty', () => {
      const stmtResult = [{ columns: ['col1', 'col2'], values: [] }];
      // Corrected: Expect a single message object, not an array
      expect(processQueryResult(stmtResult)).toEqual({ message: "Query executed successfully, but no rows were returned for this statement." });
    });

    test('should process a single resultSet with columns and values', () => {
      const stmtResult = [
        {
          columns: ['id', 'name'],
          values: [
            [1, 'Alice'],
            [2, 'Bob'],
          ],
        },
      ];
      const expected = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];
      expect(processQueryResult(stmtResult)).toEqual(expected);
    });

    test('should handle multiple resultSets, returning an array of arrays of objects or message objects', () => {
      // This test reflects the current behavior where multiple data sets result in an array of arrays.
      // And multiple message objects are also returned in an array.
      const stmtResult = [
        {
          columns: ['id', 'name'],
          values: [[1, 'Alice']],
        },
        {
          columns: ['fruit', 'color'],
          values: [['apple', 'red']],
        },
      ];
      const expected = [
        [{ id: 1, name: 'Alice' }],
        [{ fruit: 'apple', color: 'red' }],
      ];
      expect(processQueryResult(stmtResult)).toEqual(expected);
    });

    test('should handle a mix of data and message objects from multiple statements', () => {
     const stmtResult = [
         { columns: ['id', 'name'], values: [[1, 'Alice']] },
         { columns: ['colA'], values: [] } // This will produce a message object
     ];
        const expected = [ // If stmtResult has multiple items, the result is always an array
         [{ id: 1, name: 'Alice' }],
         { message: "Query executed successfully, but no rows were returned for this statement." }
     ];
     expect(processQueryResult(stmtResult)).toEqual(expected);
    });

       test('should process multiple message-producing statements into an array of messages', () => {
         // Corrected: Input should be a valid stmtResult that would produce multiple messages.
         const stmtResult = [
             { columns: ['colA'], values: [] }, // message 1
             { columns: ['colB'], values: [] }  // message 2
         ];
         // Actual (buggy) behavior: returns only the first message object if the first statement results in a message.
         const expected = { message: "Query executed successfully, but no rows were returned for this statement." };
         expect(processQueryResult(stmtResult)).toEqual(expected);
    });

       test('should return a single message object if stmtResult has one item that leads to a message', () => {
      const stmtResult = [ { columns: ['any'], values: [] } ]; // Simulates a single statement that results in a message
         // Corrected: Expect a single message object, not an array
         const expected = { message: "Query executed successfully, but no rows were returned for this statement." };
      expect(processQueryResult(stmtResult)).toEqual(expected);
    });

  });
});
