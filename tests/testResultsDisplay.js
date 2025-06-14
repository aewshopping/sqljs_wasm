import { displayResults, displayQueryError, clearResults } from '../js/ui/resultsDisplay.js';

QUnit.module('resultsDisplay', {
  beforeEach: function() {
    // Append a results div to the QUnit fixture area before each test
    const fixture = document.getElementById('qunit-fixture');
    this.resultsDiv = document.createElement('div');
    this.resultsDiv.id = 'results';
    fixture.appendChild(this.resultsDiv);
  },
  afterEach: function() {
    // Clean up the fixture area by removing the results div
    const fixture = document.getElementById('qunit-fixture');
    fixture.innerHTML = '';
  }
});

QUnit.test('displayResults should show "No results" message for empty array', function(assert) {
  displayResults([]);
  assert.ok(this.resultsDiv.innerHTML.includes('No results found or query did not return data'), 'Displays no results message for empty array');
});

QUnit.test('displayResults should show "No results" message for null input', function(assert) {
  displayResults(null);
  assert.ok(this.resultsDiv.innerHTML.includes('No results found or query did not return data'), 'Displays no results message for null input');
});

QUnit.test('displayResults should display a custom message object', function(assert) {
  const message = { message: "This is a custom message." };
  displayResults(message);
  assert.equal(this.resultsDiv.textContent.trim(), message.message, 'Displays the custom message');
});

QUnit.test('displayResults should display an array of message objects', function(assert) {
  const messages = [{ message: "Message 1." }, { message: "Message 2." }];
  displayResults(messages);
  assert.equal(this.resultsDiv.textContent.trim(), "Message 1.Message 2.", 'Displays concatenated messages');
});

QUnit.test('displayResults should display JSON string for data array', function(assert) {
  const data = [{ id: 1, name: 'Test' }, { id: 2, name: 'Data' }];
  displayResults(data);
  assert.ok(this.resultsDiv.querySelector('h3').textContent.includes('Raw JSON Output'), 'Displays JSON header');
  assert.ok(this.resultsDiv.querySelector('pre').textContent.includes(JSON.stringify(data, null, 2)), 'Displays stringified JSON data');
});

QUnit.test('displayQueryError should display error message', function(assert) {
  const errorMessage = "Test error occurred.";
  displayQueryError(errorMessage);
  assert.ok(this.resultsDiv.innerHTML.includes('SQL Error: Test error occurred.'), 'Displays the error message');
  assert.ok(this.resultsDiv.querySelector('p').classList.contains('error'), 'Error message has "error" class');
});

QUnit.test('clearResults should clear the results div', function(assert) {
  this.resultsDiv.innerHTML = '<p>Some initial content</p>';
  clearResults();
  assert.equal(this.resultsDiv.innerHTML, '', 'Results div is cleared');
});

QUnit.test('displayResults should handle resultsArray being an object with a message key (and other keys)', function(assert) {
    // This scenario is not explicitly handled by the current displayResults to pick out .message
    // if other keys exist. It would fall into the JSON stringify case.
    // The condition is `(typeof resultsArray === 'object' && resultsArray.message && Object.keys(resultsArray).length === 1)`
    // Let's test the boundary of that.
    const messageObject = { message: "Specific message", otherKey: "value" };
    displayResults(messageObject);
    // Expected: falls through to JSON.stringify(messageObject, null, 2)
    const expectedJSON = JSON.stringify(messageObject, null, 2);
    assert.ok(this.resultsDiv.querySelector('pre').textContent.includes(expectedJSON), 'Displays stringified JSON for object with message and other keys');
});

QUnit.test('displayResults should handle array of non-message objects correctly', function(assert) {
    const data = [{id: 1, value: "A"}, {id: 2, value: "B"}];
    displayResults(data);
    const expectedJSON = JSON.stringify(data, null, 2);
    assert.ok(this.resultsDiv.querySelector('pre').textContent.includes(expectedJSON), 'Displays stringified JSON for array of non-message objects');
});
