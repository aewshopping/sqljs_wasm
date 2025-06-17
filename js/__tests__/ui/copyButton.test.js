import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { initializeCopyButton } from '../../ui/copyButton.js';

describe('copyButton.js', () => {
  let mockResultsDiv;
  let mockCopyButton;
  let mockPreTag;

  beforeEach(() => {
    mockCopyButton = {
      textContent: 'Copy',
      id: 'copy-button'
    };
    mockPreTag = { textContent: 'Text to copy' };
    mockResultsDiv = {
      addEventListener: jest.fn(),
      querySelector: jest.fn(selector => {
        if (selector === 'pre') return mockPreTag;
        return null;
      })
    };
    global.document = {
      getElementById: jest.fn(id => {
        if (id === 'results') return mockResultsDiv;
        return null;
      })
    };
    global.navigator = {
      clipboard: {
        writeText: jest.fn(() => Promise.resolve()),
      },
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.document;
    delete global.navigator;
  });

  test('initializeCopyButton should run without error and attach event listener', () => {
    expect(() => initializeCopyButton()).not.toThrow();
    expect(global.document.getElementById).toHaveBeenCalledWith('results');
    expect(mockResultsDiv.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });

  test('click handler should attempt to copy text when copy button is clicked', () => {
    initializeCopyButton();
    const clickCallback = mockResultsDiv.addEventListener.mock.calls[0][1];

    // Simulate click on the copy button
    clickCallback({ target: mockCopyButton });

    expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith('Text to copy');
  });
});
