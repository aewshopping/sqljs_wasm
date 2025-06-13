# SQL.js CSV Reader

This project is a web application that loads CSV data into an in-browser SQL database (SQL.js) and allows users to query it.

## Features

*   Loads CSV data from predefined URLs.
*   Stores data in an in-browser SQL database using SQL.js.
*   Allows users to execute custom SQL queries against the loaded data.
*   Displays query results dynamically on the web page.

## How it Works

The application is structured as follows:

*   `index.html`: Provides the main HTML structure for the web page.
*   `style.css`: Contains the CSS styles for the application.
*   `js/main.js`: The main entry point of the JavaScript application. It initializes the database and handles user interactions.
*   `js/db.js`: Manages the SQL.js database, including its initialization and loading data from CSV sources.
*   `js/csvParser.js`: Includes a utility function to parse CSV text into headers and data rows.
*   `js/csvSources.js`: Defines an array of URLs pointing to the CSV files that are loaded on startup.
*   `js/query.js`: Handles the execution of SQL queries entered by the user and uses `resultsDisplay.js` to show the output.
*   `js/ui/resultsDisplay.js`: Responsible for rendering the query results in the HTML.
*   `js/ui/statusUpdater.js`: Updates status messages displayed on the UI (e.g., "Initializing SQL.js...").

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