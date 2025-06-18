// Mock initSqlJs and its Database constructor
const mockDbRun = jest.fn();
const mockDbPrepare = jest.fn(() => ({ run: jest.fn(), free: jest.fn() })); // Mock prepare and its methods
const mockSQL = {
    Database: jest.fn(() => ({
        run: mockDbRun,
        prepare: mockDbPrepare,
        exec: jest.fn(() => [{ values: [] }]), // Mock exec for potential schema checks
        close: jest.fn()
    }))
};
// Attempt to mock sql.js. Given the environment issues, this might be a point of failure.
// Using a simplified mock structure if the previous one caused issues.
jest.mock('sql.js', () => {
    return {
        __esModule: true, // This is important for ES modules
        default: jest.fn().mockResolvedValue(mockSQL) // Mock the default export
    };
}, { virtual: true });


// Mock UI functions
jest.mock('../ui/statusUpdater', () => ({
    updateStatus: jest.fn()
}));
jest.mock('../ui/tableListDisplay', () => ({
    addTableToList: jest.fn(),
    clearTableList: jest.fn()
}));

// Import the functions to be tested
import { createTable, initializeDatabase } from '../db'; // Removed generateTableNameFromUrl as it's not directly tested here
// import { fileSources as originalFileSources } from '../csvSources'; // Commented out, not strictly needed for these unit tests

// Mock console.warn
let consoleWarnSpy;

describe('databaseBuilder - createTable', () => {
    let dbInstance;

    beforeEach(() => {
        // Create a new mock db instance for each test
        // dbInstance = new mockSQL.Database(); // This line would re-execute the mock constructor
        // Instead, we can directly use a fresh mock object or ensure the mockSQL.Database itself returns a fresh object.
        // For simplicity, let's assume mockSQL.Database() correctly provides a fresh mock for each call if needed,
        // or rely on jest.clearAllMocks() if using a shared instance.
        // Let's ensure our mock setup is clean.
        mockSQL.Database.mockClear();
        mockDbRun.mockClear();
        mockDbPrepare.mockClear();
        dbInstance = mockSQL.Database(); // Get a fresh instance from the mock

        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
    });

    test('should create table with TEXT type for columns by default', () => {
        const headers = ['id', 'name', 'value'];
        createTable(dbInstance, 'test_table', headers);
        expect(mockDbRun).toHaveBeenCalledWith(
            'CREATE TABLE "test_table" ("id" TEXT, "name" TEXT, "value" TEXT);'
        );
    });

    test('should use specified column type from columnTypes', () => {
        const headers = ['id', 'name', 'age', 'city'];
        const columnTypes = [
            { "column-name": "age", "column-type": "integer" },
            { "column-name": "id", "column-type": "PRIMARY KEY" }
        ];
        createTable(dbInstance, 'typed_table', headers, columnTypes);
        expect(mockDbRun).toHaveBeenCalledWith(
            'CREATE TABLE "typed_table" ("id" PRIMARY KEY, "name" TEXT, "age" INTEGER, "city" TEXT);'
        );
    });

    test('should default to TEXT if column type is not specified for a header', () => {
        const headers = ['product_id', 'product_name', 'price'];
        const columnTypes = [
            { "column-name": "price", "column-type": "REAL" }
        ];
        createTable(dbInstance, 'partial_typed_table', headers, columnTypes);
        expect(mockDbRun).toHaveBeenCalledWith(
            'CREATE TABLE "partial_typed_table" ("product_id" TEXT, "product_name" TEXT, "price" REAL);'
        );
    });

    test('should log a warning if column-name in columnTypes does not exist in headers', () => {
        const headers = ['name', 'email'];
        const columnTypes = [
            { "column-name": "address", "column-type": "TEXT" },
            { "column-name": "name", "column-type": "VARCHAR(255)" }
        ];
        createTable(dbInstance, 'warning_table', headers, columnTypes);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'Warning: Column "address" specified in columnTypes for table "warning_table" does not exist in the CSV headers. This type definition will be ignored.'
        );
        expect(mockDbRun).toHaveBeenCalledWith(
            'CREATE TABLE "warning_table" ("name" VARCHAR(255), "email" TEXT);'
        );
    });

    test('should handle empty columnTypes array gracefully (all TEXT)', () => {
        const headers = ['colA', 'colB'];
        createTable(dbInstance, 'empty_types_table', headers, []);
        expect(mockDbRun).toHaveBeenCalledWith(
            'CREATE TABLE "empty_types_table" ("colA" TEXT, "colB" TEXT);'
        );
    });

    test('should handle undefined columnTypes gracefully (all TEXT)', () => {
        const headers = ['colX', 'colY'];
        createTable(dbInstance, 'undefined_types_table', headers, undefined);
        expect(mockDbRun).toHaveBeenCalledWith(
            'CREATE TABLE "undefined_types_table" ("colX" TEXT, "colY" TEXT);'
        );
    });

    test('should correctly use "PINTEGER" as type and let SQLite handle it', () => {
        const headers = ['id', 'data'];
        const columnTypes = [
            { "column-name": "data", "column-type": "PINTEGER" }
        ];
        createTable(dbInstance, 'pinteger_table', headers, columnTypes);
        expect(mockDbRun).toHaveBeenCalledWith(
            'CREATE TABLE "pinteger_table" ("id" TEXT, "data" PINTEGER);'
        );
    });

    test('should correctly apply "integer" type to "pages" column for a books-like table', () => {
        const bookHeaders = ['title', 'author', 'pages', 'year', 'isbn'];
        const columnTypes = [
            { "column-name": "pages", "column-type": "integer" }
        ];
        createTable(dbInstance, 'books_example', bookHeaders, columnTypes);
        expect(mockDbRun).toHaveBeenCalledWith(
            'CREATE TABLE "books_example" ("title" TEXT, "author" TEXT, "pages" INTEGER, "year" TEXT, "isbn" TEXT);'
        );
    });

    test('should create table schema even if headers array is empty', () => {
        const headers = [];
        createTable(dbInstance, 'empty_headers_table', headers, []);
        expect(mockDbRun).toHaveBeenCalledWith(
            'CREATE TABLE "empty_headers_table" ();'
        );
    });
});

const mockParseCSV = jest.fn();
jest.mock('../csvParser', () => ({
    parseCSV: mockParseCSV
}));

describe('databaseBuilder - initializeDatabase integration for columnTypes', () => {
    let originalFetch;
    let dbInstanceForInit; // Separate instance management for these tests if needed

    beforeEach(async () => {
        jest.clearAllMocks(); // Clear all mocks to ensure clean state

        // Re-setup mock for sql.js default function for each test to ensure isolation
        // if it was somehow retaining state or if clearAllMocks isn't enough.
        // This might be redundant if jest.mock at the top level handles it well.
        const sqlModule = await import('sql.js');
        sqlModule.default.mockImplementation(() => Promise.resolve(mockSQL));

        dbInstanceForInit = mockSQL.Database(); // Get a fresh instance

        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        originalFetch = global.fetch;
        global.fetch = jest.fn();
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
        global.fetch = originalFetch;
    });

    test('initializeDatabase should pass columnTypes to createTable', async () => {
        const mockSources = [
            {
                url: 'test.csv',
                type: 'csv',
                tableName: 'my_data',
                columnTypes: [{ "column-name": "value", "column-type": "INTEGER" }]
            }
        ];

        global.fetch.mockResolvedValueOnce({
            ok: true,
            text: () => Promise.resolve("header1,value\ndata1,123")
        });
        mockParseCSV.mockReturnValueOnce({ headers: ['header1', 'value'], dataRows: [['data1', '123']] });

        await initializeDatabase(mockSources);

        // mockSQL.Database() was called by initializeDatabase.
        // The run command is on the instance returned by that.
        // Need to ensure we are checking the mockDbRun associated with *that* instance.
        // The global mockDbRun should capture this if mockSQL.Database always returns the same mock runner object.
        expect(mockDbRun).toHaveBeenCalledWith(
            'CREATE TABLE "my_data" ("header1" TEXT, "value" INTEGER);'
        );
    });

    test('initializeDatabase should result in warning if columnType references non-existent header', async () => {
        const mockSources = [
            {
                url: 'another.csv',
                type: 'csv',
                tableName: 'another_table',
                columnTypes: [{ "column-name": "non_existent_col", "column-type": "INTEGER" }]
            }
        ];

        global.fetch.mockResolvedValueOnce({
            ok: true,
            text: () => Promise.resolve("id,name\n1,test")
        });
        mockParseCSV.mockReturnValueOnce({ headers: ['id', 'name'], dataRows: [['1', 'test']] });

        await initializeDatabase(mockSources);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'Warning: Column "non_existent_col" specified in columnTypes for table "another_table" does not exist in the CSV headers. This type definition will be ignored.'
        );
        expect(mockDbRun).toHaveBeenCalledWith(
            'CREATE TABLE "another_table" ("id" TEXT, "name" TEXT);'
        );
    });
});
