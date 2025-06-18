const fileSources = [
    { url: 'https://raw.githubusercontent.com/aewshopping/history_books/refs/heads/main/data_csv/books-tags.csv', type: 'csv', tableName: 'BookTags_Custom' },
    { url: 'https://raw.githubusercontent.com/aewshopping/history_books/refs/heads/main/data_csv/cats.csv', type: 'csv' }, // No tableName, should default
    { url: 'https://raw.githubusercontent.com/aewshopping/history_books/refs/heads/main/data_csv/popular-history-books.csv', type: 'csv', tableName: 'PopularHistoryBooks' },
    { url: 'https://raw.githubusercontent.com/aewshopping/history_books/refs/heads/main/data_csv/tags.csv', type: 'csv', tableName: 'All_Tags' },
    { url: 'https://raw.githubusercontent.com/aewshopping/history_books/refs/heads/main/data_tsv/quotes.tsv', type: 'tsv', tableName: 'Quotes_TSV' }
];

export { fileSources };
