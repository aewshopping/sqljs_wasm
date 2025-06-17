import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { updateStatus } from '../../ui/statusUpdater.js';

describe('statusUpdater.js', () => {
  let mockStatusDiv;

  beforeEach(() => {
    mockStatusDiv = { innerHTML: '', textContent: '' };
    global.document = {
      getElementById: jest.fn(id => {
        if (id === 'status') {
          return mockStatusDiv;
        }
        return null;
      }),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.document;
  });

  test('updateStatus should run without error (non-error, no append)', () => {
    expect(() => updateStatus('Test status')).not.toThrow();
    expect(mockStatusDiv.innerHTML).toBe('Test status');
  });
  test('updateStatus should run without error (error, no append)', () => {
    expect(() => updateStatus('Test error', true)).not.toThrow();
    expect(mockStatusDiv.innerHTML).toContain('class="error">Test error</p>');
  });
  test('updateStatus should run without error (non-error, append)', () => {
    mockStatusDiv.innerHTML = 'Old status.';
    expect(() => updateStatus('New status', false, true)).not.toThrow();
    expect(mockStatusDiv.innerHTML).toBe('Old status.<br>New status');
  });
});
