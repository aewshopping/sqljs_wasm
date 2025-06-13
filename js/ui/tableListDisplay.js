/**
 * Adds a table name to the list of loaded tables in the UI.
 * @param {string} tableName - The name of the table to add.
 */
function addTableToList(tableName) {
    const tableList = document.getElementById('loaded-tables-list');
    if (!tableList) {
        console.error('Error: Element with ID "loaded-tables-list" not found.');
        return;
    }
    const listItem = document.createElement('li');
    listItem.textContent = tableName;
    tableList.appendChild(listItem);
}

/**
 * Clears all table names from the list of loaded tables in the UI.
 */
function clearTableList() {
    const tableList = document.getElementById('loaded-tables-list');
    if (tableList) {
        // Remove all children
        while (tableList.firstChild) {
            tableList.removeChild(tableList.firstChild);
        }
    } else {
        console.warn('Warning: Element with ID "loaded-tables-list" not found when trying to clear list. This might be expected if no tables have been loaded yet or the page is still initializing.');
    }
}

export { addTableToList, clearTableList };
