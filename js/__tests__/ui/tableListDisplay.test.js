import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { addTableToList, clearTableList } from '../../ui/tableListDisplay.js';

describe('tableListDisplay.js', () => {
  let mockTableList;

  beforeEach(() => {
    mockTableList = {
      innerHTML: '',
      children: [],
      appendChild: jest.fn(child => mockTableList.children.push(child)),
      removeChild: jest.fn(child => {
        const index = mockTableList.children.indexOf(child);
        if (index > -1) mockTableList.children.splice(index, 1);
      }),
      get firstChild() { // Getter for firstChild
        return mockTableList.children.length > 0 ? mockTableList.children[0] : null;
      }
    };
    global.document = {
      getElementById: jest.fn(id => (id === 'loaded-tables-list' ? mockTableList : null)),
      createElement: jest.fn(tagName => ({ tagName, textContent: '' })),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.document;
  });

  test('addTableToList should run without error', () => {
    expect(() => addTableToList('new_table')).not.toThrow();
    expect(global.document.createElement).toHaveBeenCalledWith('li');
    expect(mockTableList.appendChild).toHaveBeenCalled();
    // Check if the mock child has the correct textContent
    const mockChild = mockTableList.appendChild.mock.calls[0][0];
    expect(mockChild.textContent).toBe('new_table');
  });
  test('clearTableList should run without error', () => {
    // Add a child to simulate existing list items
    const mockChildElement = global.document.createElement('li');
    mockTableList.children.push(mockChildElement);

    expect(() => clearTableList()).not.toThrow();
    expect(mockTableList.removeChild).toHaveBeenCalledWith(mockChildElement);
  });
   test('clearTableList should handle being called when list is already empty', () => {
    expect(() => clearTableList()).not.toThrow();
    expect(mockTableList.removeChild).not.toHaveBeenCalled();
  });
});
