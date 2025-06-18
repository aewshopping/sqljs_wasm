const fileSources = [
    {
        url: 'https://raw.githubusercontent.com/aewshopping/history_books/refs/heads/main/data_csv/books-tags.csv',
        type: 'csv'
    },
    {
        url: 'https://raw.githubusercontent.com/aewshopping/history_books/refs/heads/main/data_csv/cats.csv',
        type: 'csv'
    },
    {
        url: 'https://raw.githubusercontent.com/aewshopping/history_books/refs/heads/main/data_csv/popular-history-books.csv',
        type: 'csv',
        tableName: 'books',
        columnTypes: [
            { "column-name": "pages", "column-type": "integer" }
        ]
    },
    {
        url: 'https://raw.githubusercontent.com/aewshopping/history_books/refs/heads/main/data_csv/tags.csv',
        type: 'csv'
    },
    {
        url: 'https://raw.githubusercontent.com/aewshopping/history_books/refs/heads/main/data_tsv/quotes.tsv',
        type: 'tsv'
    }
];

export { fileSources };
