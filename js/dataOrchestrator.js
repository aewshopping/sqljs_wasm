// This module is responsible for orchestrating data fetching, parsing, and storage.
// It uses sqliteService for database operations and dataSourceFetcher for fetching data.
// UI updates are handled via a progressCallback.

import { initializeDb, getDb, generateTableNameFromUrl, createTable, insertData } from './database/sqliteService.js';
import { fetchTextData } from './data/dataSourceFetcher.js';
import { parseCSV } from './csvParser.js';
import { parseTSV } from './tsvParser.js';

/**
 * Initializes data sources: fetches data, parses it, creates tables, and inserts data.
 * @async
 * @param {{url: string, type: 'csv' | 'tsv'}[]} sources - Array of source objects.
 * @param {Function} progressCallback - Callback function to report progress and UI updates.
 *        It accepts an object e.g., { type: 'status'|'tableAdded'|'clearList'|'error', message: '...', tableName: '...' }
 * @returns {Promise<SQL.Database>} The initialized SQL.js database instance.
 */
async function initializeDataSources(sources, progressCallback) {
    if (!progressCallback || typeof progressCallback !== 'function') {
        console.warn('progressCallback is not provided or not a function. UI updates will be skipped.');
        // Provide a dummy callback to prevent errors if not passed
        progressCallback = (update) => {
            // console.log(`Dummy progress: type=${update.type}, msg=${update.message}, table=${update.tableName}`);
        };
    }

    try {
        progressCallback({ type: 'clearList' });

        // Initialize the database using sqliteService
        // Pass null or an empty object for sqlJsConfig to use default behavior in sqliteService
        await initializeDb({});
        const dbInstance = getDb();
        progressCallback({ type: 'status', message: 'SQL.js database initialized.' });

        const dataProcessingPromises = sources.map(async (source) => {
            try {
                progressCallback({ type: 'status', message: `Fetching data from ${source.url} (type: ${source.type})...`, isProgress: true });
                const textData = await fetchTextData(source.url);
                progressCallback({ type: 'status', message: `Data fetched successfully from ${source.url}.`, isProgress: true });

                let parsedData;
                if (source.type === 'csv') {
                    parsedData = parseCSV(textData);
                } else if (source.type === 'tsv') {
                    parsedData = parseTSV(textData);
                } else {
                    console.warn(`Unsupported file type: ${source.type} for URL ${source.url}. Skipping.`);
                    progressCallback({ type: 'status', message: `Unsupported file type: ${source.type} for ${source.url}. Skipping.`, isError: false });
                    return null;
                }

                const { headers: currentHeaders, dataRows } = parsedData;

                if (dataRows.length === 0) {
                    progressCallback({ type: 'status', message: `No data rows found in ${source.type.toUpperCase()} from ${source.url}. Skipping table creation.`, isError: false });
                    return null;
                }

                const tableName = generateTableNameFromUrl(source.url); // From sqliteService
                return { tableName, currentHeaders, dataRows, sourceUrl: source.url, sourceType: source.type };
            } catch (fetchParseError) {
                console.error(`Error processing data source ${source.url}: `, fetchParseError);
                progressCallback({ type: 'error', message: `Failed to process ${source.type.toUpperCase()} data from ${source.url}: ${fetchParseError.message}` });
                // Do not re-throw here if Promise.allSettled is not used, to allow other sources to process.
                // However, the original code used Promise.all which would fail fast.
                // To maintain fail-fast for critical sources, we re-throw.
                // If some sources are non-critical, Promise.allSettled would be better.
                throw fetchParseError;
            }
        });

        // Wait for all fetching and parsing to complete
        // Promise.all will reject if any promise in dataProcessingPromises rejects.
        const results = await Promise.all(dataProcessingPromises);

        for (const result of results) {
            if (result) { // Process only successful and supported fetches/parses
                const { tableName, currentHeaders, dataRows, sourceUrl, sourceType } = result;
                try {
                    await createTable(dbInstance, tableName, currentHeaders); // From sqliteService
                    progressCallback({ type: 'status', message: `Table "${tableName}" created with headers: ${currentHeaders.join(', ')}.` });

                    const insertedRowCount = await insertData(dbInstance, tableName, currentHeaders, dataRows); // From sqliteService
                    if (insertedRowCount > 0) {
                         progressCallback({ type: 'status', message: `Inserted ${insertedRowCount} rows into "${tableName}".` });
                    } else {
                         progressCallback({ type: 'status', message: `No valid rows inserted into "${tableName}".` });
                    }

                    progressCallback({ type: 'tableAdded', tableName: tableName });
                    progressCallback({ type: 'status', message: `Data from ${sourceUrl} loaded into table "${tableName}".` });

                } catch (dbError) {
                    console.error(`Error creating table or inserting data for ${tableName} from ${sourceUrl}: `, dbError);
                    progressCallback({ type: 'error', message: `Database error for ${tableName} (${sourceType.toUpperCase()} from ${sourceUrl}): ${dbError.message}` });
                    // Depending on desired behavior, you might want to re-throw or continue
                }
            }
        }

        progressCallback({ type: 'status', message: 'All data processing finished. Database ready for queries!', isProgress: false });
        return dbInstance;

    } catch (error) {
        // General error handling (e.g., SQL.js init failure, Promise.all rejection from fetch/parse phase)
        const errorMessage = "Data initialization failed: " + (error.message || String(error));
        progressCallback({ type: 'error', message: errorMessage });
        console.error("Data initialization error details:", error);
        throw error;
    }
}

export { initializeDataSources };
