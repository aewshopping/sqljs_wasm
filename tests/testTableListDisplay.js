import { addTableToList, clearTableList } from '../js/ui/tableListDisplay.js';

QUnit.module('tableListDisplay', {
  beforeEach: function() {
    // Append a ul element for the table list to the QUnit fixture
    const fixture = document.getElementById('qunit-fixture');
    this.tableListUL = document.createElement('ul');
    this.tableListUL.id = 'loaded-tables-list';
    fixture.appendChild(this.tableListUL);
  },
  afterEach: function() {
    // Clean up the fixture
    const fixture = document.getElementById('qunit-fixture');
    fixture.innerHTML = '';
  }
});

QUnit.test('addTableToList should add a table name to the list', function(assert) {
  const tableName = 'my_test_table';
  addTableToList(tableName);
  assert.equal(this.tableListUL.children.length, 1, 'One item should be in the list');
  assert.equal(this.tableListUL.querySelector('li').textContent, tableName, 'List item should contain the table name');
});

QUnit.test('addTableToList should add multiple table names to the list', function(assert) {
  addTableToList('table1');
  addTableToList('table2');
  assert.equal(this.tableListUL.children.length, 2, 'Two items should be in the list');
  assert.equal(this.tableListUL.children[0].textContent, 'table1', 'First item is table1');
  assert.equal(this.tableListUL.children[1].textContent, 'table2', 'Second item is table2');
});

QUnit.test('clearTableList should remove all table names from the list', function(assert) {
  addTableToList('tableA');
  addTableToList('tableB');
  clearTableList();
  assert.equal(this.tableListUL.children.length, 0, 'List should be empty after clearTableList');
});

QUnit.test('clearTableList should work on an empty list', function(assert) {
  clearTableList(); // Call on an already empty list
  assert.equal(this.tableListUL.children.length, 0, 'List should remain empty');
});

QUnit.test('addTableToList should handle special characters in table name (textContent encoding)', function(assert) {
  const tableName = 'table_with_<>&"_chars';
  addTableToList(tableName);
  assert.equal(this.tableListUL.querySelector('li').textContent, tableName, 'List item displays special characters correctly as textContent');
});
