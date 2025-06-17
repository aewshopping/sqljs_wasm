import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { displayResults, displayQueryError, clearResults } from '../../ui/resultsDisplay.js';

describe('resultsDisplay.js', () => {
  let mockResultsDiv;

  beforeEach(() => {
    mockResultsDiv = { innerHTML: '' };
    global.document = {
      getElementById: jest.fn(id => {
        if (id === 'results') {
          return mockResultsDiv;
        }
        return null;
      }),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Clean up mocks
    delete global.document; // Remove global document mock
  });

  describe('displayResults', () => {
    test('should run without error when called with an empty array', () => {
      expect(() => displayResults([])).not.toThrow();
      expect(mockResultsDiv.innerHTML).toContain('No results found');
    });
    test('should run without error when called with a message object', () => {
      expect(() => displayResults({ message: 'Test message' })).not.toThrow();
      expect(mockResultsDiv.innerHTML).toContain('Test message');
    });
    test('should run without error when called with an array of data objects', () => {
      expect(() => displayResults([{ col1: 'data1' }])).not.toThrow();
      expect(mockResultsDiv.innerHTML).toContain('Raw JSON Output');
    });
  });

  describe('displayQueryError', () => {
    test('should run without error and set error message', () => {
      expect(() => displayQueryError('Test error')).not.toThrow();
      expect(mockResultsDiv.innerHTML).toContain('SQL Error: Test error');
    });
  });

  describe('clearResults', () => {
    test('should run without error and clear content (leaving copy button)', () => {
      expect(() => clearResults()).not.toThrow();
      expect(mockResultsDiv.innerHTML).toContain('copy-button');
    });
  });
});
