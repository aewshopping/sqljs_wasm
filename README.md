# SQL.js CSV Reader

This project is a web application that loads CSV data into an in-browser SQL database (SQL.js) and allows users to query it.

## Features

*   Loads CSV data from predefined URLs.
*   Stores data in an in-browser SQL database using SQL.js.
*   Allows users to execute custom SQL queries against the loaded data.
*   Displays query results dynamically on the web page.

## How it Works

The application is structured as follows:

*   `index.html`: This is the main webpage you see in your browser. It's like the blueprint that lays out where everything goes, such as the title, text boxes, and buttons. It's the skeleton of the application.

*   `style.css`: This file makes the webpage look good. It controls the colors, fonts, and layout, much like an interior designer decides how a room should look. It works directly with `index.html` to style the visual elements.

*   `js/main.js`:
    *   **Purpose**: This is the central coordinator for the application. It starts the process of loading data and sets up user interactions.
    *   **Key Functions/Inputs**: It doesn't export functions for other modules to call, but it orchestrates them. It calls `initializeDatabase` from `js/db.js` using the `fileSources` from `js/csvSources.js`. It also sets up event listeners for buttons in `index.html`, like the 'execute-button' (which calls `executeQuery` from `js/query.js`) and 'download-db-button'. It also initializes the copy button functionality using `initializeCopyButton` from `js/ui/copyButton.js` and manages the load timer using functions from `js/ui/timer.js`.
    *   **Interactions**:
        *   Uses `js/db.js` to initialize the database.
        *   Uses `js/csvSources.js` to get the list of data files.
        *   Uses `js/query.js` to execute SQL queries.
        *   Uses `js/ui/copyButton.js` to enable copying results.
        *   Uses `js/ui/timer.js` to measure and display load time.
        *   Manipulates HTML elements defined in `index.html` (e.g., 'sql-input', 'status').

*   `js/db.js`:
    *   **Purpose**: Manages the in-browser database. This includes setting it up, fetching data from external files, parsing it, and inserting it into database tables.
    *   **Key Functions/Inputs**:
        *   `initializeDatabase(sources)`: Takes an array of `sources` (from `js/csvSources.js`), each specifying a URL and data type ('csv' or 'tsv'). It fetches the data, uses `parseCSV` (from `js/csvParser.js`) or `parseTSV` (from `js/tsvParser.js`) to process it, creates tables, and inserts the data. It also uses `updateStatus` from `js/ui/statusUpdater.js` and `addTableToList` from `js/ui/tableListDisplay.js`.
        *   `generateTableNameFromUrl(url, customTableName)`: Takes a file URL and an optional custom table name. It creates a sanitized, safe name for the database table.
        *   Exports `db`: The actual SQL.js database instance, which is used by `js/query.js` to run queries and by `js/main.js` for the download functionality.
    *   **Interactions**:
        *   Uses `js/csvParser.js` (via `parseCSV`) to parse CSV data.
        *   Uses `js/tsvParser.js` (via `parseTSV`) to parse TSV data.
        *   Uses `js/ui/statusUpdater.js` to display progress messages.
        *   Uses `js/ui/tableListDisplay.js` to list loaded tables.
        *   Is used by `js/main.js` to start the database and download it.
        *   Is used by `js/query.js` to execute queries against the `db` instance.

*   `js/csvParser.js`:
    *   **Purpose**: Specifically handles Comma-Separated Values (CSV) data.
    *   **Key Functions/Inputs**:
        *   `parseCSV(csvText)`: Takes a string `csvText` (the content of a CSV file). It uses the general `_parseDelimitedText` function from `js/delimitedTextParser.js` with a comma as the separator. It returns an object with `headers` (an array of column names) and `dataRows` (an array of arrays, where each inner array is a row of data).
    *   **Interactions**:
        *   Uses `js/delimitedTextParser.js` to do the actual parsing logic.
        *   Is used by `js/db.js` when `initializeDatabase` encounters a source of type 'csv'.

*   `js/tsvParser.js`:
    *   **Purpose**: Specifically handles Tab-Separated Values (TSV) data.
    *   **Key Functions/Inputs**:
        *   `parseTSV(tsvText)`: Takes a string `tsvText` (the content of a TSV file). It uses the general `_parseDelimitedText` function from `js/delimitedTextParser.js` with a tab character as the separator. It returns an object with `headers` (an array of column names) and `dataRows` (an array of arrays, where each inner array is a row of data).
    *   **Interactions**:
        *   Uses `js/delimitedTextParser.js` to do the actual parsing logic.
        *   Is used by `js/db.js` when `initializeDatabase` encounters a source of type 'tsv'.

*   `js/delimitedTextParser.js`:
    *   **Purpose**: Provides a general utility to parse text data that is separated by a specific character (a delimiter).
    *   **Key Functions/Inputs**:
        *   `_parseDelimitedText(text, delimiter)`: This is an internal helper function (indicated by the underscore) but is exported for use by `csvParser.js` and `tsvParser.js`. It takes the raw `text` string and the `delimiter` character (e.g., a comma or a tab). It splits the text into lines, then splits each line by the delimiter to separate values. It returns an object containing `headers` (column names from the first line) and `dataRows` (the rest of the data, as an array of arrays of strings).
    *   **Interactions**:
        *   Is used by `js/csvParser.js` (provides `_parseDelimitedText`).
        *   Is used by `js/tsvParser.js` (provides `_parseDelimitedText`).

*   `js/csvSources.js`:
    *   **Purpose**: This file acts as a configuration list. It defines where the application should fetch its initial data from.
    *   **Key Functions/Inputs**:
        *   Exports `fileSources`: An array of objects. Each object represents a data file and contains its `url` (internet address), `type` ('csv' or 'tsv'), and optionally a `tableName` if a custom name is desired for the database table.
    *   **Interactions**:
        *   Is used by `js/main.js`, which passes `fileSources` to `js/db.js`'s `initializeDatabase` function.

*   `js/query.js`:
    *   **Purpose**: Handles the execution of SQL queries that the user types in.
    *   **Key Functions/Inputs**:
        *   `executeQuery()`: This function is called when the user clicks the "Execute Query" button. It reads the SQL query text from the 'sql-input' element in `index.html`. It then uses the `db.exec(query)` method (from the `db` instance imported from `js/db.js`) to run the query against the database.
        *   `processQueryResult(stmtResult)`: Takes the raw `stmtResult` from `db.exec()`. It transforms this raw result into a more user-friendly format (an array of objects, where each object represents a row of data, or a message object).
    *   **Interactions**:
        *   Uses the `db` instance from `js/db.js` to run queries.
        *   Uses `js/ui/resultsDisplay.js` (functions `displayResults`, `displayQueryError`, `clearResults`) to show the query output or any errors to the user on the webpage.
        *   Is called by `js/main.js` when the execute button is clicked.

*   `js/ui/copyButton.js`:
    *   **Purpose**: Adds functionality to the "Copy" button that appears with query results, allowing users to copy the results. "UI" means User Interface.
    *   **Key Functions/Inputs**:
        *   `initializeCopyButton()`: Sets up an event listener on the 'results' area of the webpage. When a click occurs on an element with the ID 'copy-button' inside this area, it takes the text content of the query results (typically from a `<pre>` tag) and uses the browser's clipboard API (`navigator.clipboard.writeText`) to copy it.
    *   **Interactions**:
        *   Called by `js/main.js` during application setup.
        *   Interacts with HTML elements within the 'results' div (defined in `index.html` and populated by `js/ui/resultsDisplay.js`).

*   `js/ui/resultsDisplay.js`:
    *   **Purpose**: Responsible for showing the results of a SQL query (or error messages) on the webpage.
    *   **Key Functions/Inputs**:
        *   `displayResults(resultsArray)`: Takes `resultsArray` (the processed query results from `js/query.js`, usually an array of row objects or a message object). It formats this data as JSON and displays it within a `<pre>` tag inside the 'results' div in `index.html`. It also includes the copy button HTML.
        *   `displayQueryError(errorMessage)`: Takes an `errorMessage` string and displays it in the 'results' div, styled as an error.
        *   `clearResults()`: Clears any previous results from the 'results' div, leaving only the copy button structure.
    *   **Interactions**:
        *   Is used by `js/query.js` to show query outcomes.
        *   Manipulates the 'results' div in `index.html`.
        *   Includes HTML for the copy button, which `js/ui/copyButton.js` makes interactive.

*   `js/ui/statusUpdater.js`:
    *   **Purpose**: Provides feedback to the user about what the application is doing (e.g., loading data, initialization).
    *   **Key Functions/Inputs**:
        *   `updateStatus(message, isError = false, append = false)`: Takes a `message` string to display. The `isError` flag styles the message as an error if true. The `append` flag adds the message to existing status messages instead of replacing them.
    *   **Interactions**:
        *   Is used by `js/db.js` during the data loading and database initialization process.
        *   Manipulates the 'status' div in `index.html`.

*   `js/ui/tableListDisplay.js`:
    *   **Purpose**: Shows the user which data tables have been successfully loaded into the database.
    *   **Key Functions/Inputs**:
        *   `addTableToList(tableName)`: Takes a `tableName` string and adds it as a list item to the 'loaded-tables-list' element in `index.html`.
        *   `clearTableList()`: Removes all table names from the 'loaded-tables-list'.
    *   **Interactions**:
        *   Is used by `js/db.js` after a table is created and data is inserted.
        *   Manipulates the 'loaded-tables-list' unordered list element in `index.html`.

*   `js/ui/timer.js`:
    *   **Purpose**: Measures and displays the time it takes for the application to complete its initial data loading.
    *   **Key Functions/Inputs**:
        *   `startTimer()`: Records the current time as the process start time.
        *   `stopTimer()`: Records the current time as the process end time.
        *   `displayTime()`: Calculates the difference between start and end times and displays it in the 'timer' div in `index.html` (e.g., "Load time: 3.45s").
    *   **Interactions**:
        *   `startTimer`, `stopTimer`, and `displayTime` are called by `js/main.js` at the beginning and end of the database initialization process.
        *   Manipulates the 'timer' div in `index.html`.

## How to Use

1.  Open the `index.html` file in a web browser.
2.  The application will automatically attempt to load and parse CSV data from the predefined sources specified in `js/csvSources.js`.
3.  The status of the data loading process will be displayed on the page.
4.  Once the data is loaded, you can enter an SQL query into the text area. The data is loaded into a table named `csv_data`. For example, you can use a query like: `SELECT * FROM csv_data LIMIT 10;`
5.  Click the "Execute Query" button.
6.  The results of your query will be displayed below the button.

## Potential Enhancements

*   **User-Uploaded CSVs:** Allow users to upload their own CSV files directly through the browser.
*   **Advanced Error Handling:** Implement more detailed error messages and user feedback for issues like failed CSV fetching, parsing errors, or invalid SQL queries.
*   **Data Export:** Add functionality to export query results (e.g., as CSV or JSON).
*   **Persistent Storage:** Explore options like using browser local storage to save user queries or loaded data (though SQL.js itself is in-memory per session).
*   **UI/UX Improvements:** Enhance the user interface, perhaps with features like query history, auto-completion for SQL keywords, or a more interactive results table (sorting, filtering).
*   **Loading Multiple Tables:** Extend functionality to support loading multiple CSVs into distinct tables and querying across them.