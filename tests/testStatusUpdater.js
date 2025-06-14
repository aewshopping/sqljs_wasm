import { updateStatus } from '../js/ui/statusUpdater.js';

QUnit.module('statusUpdater', {
  beforeEach: function() {
    // Append a status div to the QUnit fixture area before each test
    const fixture = document.getElementById('qunit-fixture');
    this.statusDiv = document.createElement('div');
    this.statusDiv.id = 'status';
    fixture.appendChild(this.statusDiv);
  },
  afterEach: function() {
    // Clean up the fixture area by removing the status div
    const fixture = document.getElementById('qunit-fixture');
    fixture.innerHTML = '';
  }
});

QUnit.test('updateStatus should display a simple message', function(assert) {
  const message = "Process initiated.";
  updateStatus(message);
  assert.equal(this.statusDiv.innerHTML, message, 'Displays the simple message');
});

QUnit.test('updateStatus should display an error message with error class', function(assert) {
  const errorMessage = "An error occurred.";
  updateStatus(errorMessage, true);
  assert.equal(this.statusDiv.querySelector('p').textContent, errorMessage, 'Displays the error message text');
  assert.ok(this.statusDiv.querySelector('p').classList.contains('error'), 'Error message <p> has "error" class');
});

QUnit.test('updateStatus should overwrite existing message by default', function(assert) {
  this.statusDiv.innerHTML = "Initial status.";
  const newMessage = "New status updated.";
  updateStatus(newMessage);
  assert.equal(this.statusDiv.innerHTML, newMessage, 'Overwrites existing message');
});

QUnit.test('updateStatus should append message when append is true', function(assert) {
  const initialMessage = "System ready.";
  updateStatus(initialMessage); // Set initial message
  const appendedMessage = " Additional info.";
  updateStatus(appendedMessage, false, true);
  // Expected: "System ready.<br> Additional info." (or similar if no <br> on first append)
  // The logic is: currentContent + (currentContent ? '<br>' : '') + formattedMessage
  // If initialMessage was "System ready.", currentContent is "System ready."
  // formattedMessage is " Additional info."
  // Result: "System ready.<br> Additional info."
  assert.equal(this.statusDiv.innerHTML, initialMessage + '<br>' + appendedMessage, 'Appends new message with <br>');
});

QUnit.test('updateStatus should append error message correctly', function(assert) {
  const initialMessage = "Loading data...";
  updateStatus(initialMessage);
  const appendedErrorMessage = "Failed to load module X.";
  updateStatus(appendedErrorMessage, true, true);
  const expectedHTML = initialMessage + '<br>' + `<p class="error">${appendedErrorMessage}</p>`;
  assert.equal(this.statusDiv.innerHTML, expectedHTML, 'Appends error message with formatting and <br>');
});

QUnit.test('updateStatus should append to empty status div correctly', function(assert) {
  const message = "First message.";
  updateStatus(message, false, true);
  // currentContent is '', (currentContent ? '<br>' : '') is ''
  // Result: message
  assert.equal(this.statusDiv.innerHTML, message, 'Appends to empty status div without leading <br>');
});

QUnit.test('updateStatus should append error to empty status div correctly', function(assert) {
  const errorMessage = "Critical failure.";
  updateStatus(errorMessage, true, true);
  const expectedHTML = `<p class="error">${errorMessage}</p>`;
  // currentContent is '', (currentContent ? '<br>' : '') is ''
  // Result: formattedMessage
  assert.equal(this.statusDiv.innerHTML, expectedHTML, 'Appends error to empty status div without leading <br>');
});
