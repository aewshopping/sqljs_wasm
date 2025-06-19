const fileSources = [
    {
        url: 'https://raw.githubusercontent.com/aewshopping/history-books-lite/refs/heads/main/data/books-tags.csv',
        type: 'csv'
    },
    {
        url: 'https://raw.githubusercontent.com/aewshopping/history-books-lite/refs/heads/main/data/cats.csv',
        type: 'csv'
    },
    {
        url: 'https://raw.githubusercontent.com/aewshopping/history-books-lite/refs/heads/main/data/books.tsv',
        type: 'tsv',
        tableName: 'books'
    },
    {
        url: 'https://raw.githubusercontent.com/aewshopping/history-books-lite/refs/heads/main/data/tags.csv',
        type: 'csv'
    },
    {
        url: 'https://raw.githubusercontent.com/aewshopping/history-books-lite/refs/heads/main/data/quotes.tsv',
        type: 'tsv'
    }
];

export { fileSources };
