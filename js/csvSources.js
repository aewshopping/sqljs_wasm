export const fileSources = [ // Renamed from csvFileSources for clarity
    { url: 'https://raw.githubusercontent.com/fivethirtyeight/data/master/college-majors/majors-list.csv', type: 'csv' },
    { url: 'https://raw.githubusercontent.com/fivethirtyeight/data/master/college-majors/women-stem.csv', type: 'csv' },
    { url: 'https://raw.githubusercontent.com/plotly/datasets/master/auto-mpg.csv', type: 'csv' },
    // Example TSV file (replace with a real one if available, or a small inline one for testing if necessary)
    // For now, let's use a known public TSV file for demonstration.
    // This one is a list of institutes from an EBI GWAS catalog.
    { url: 'https://www.ebi.ac.uk/gwas/api/search/downloads/trait_mappings', type: 'tsv' },
    { url: 'https://example.com/nonexistent.csv', type: 'csv' } // Keep the example of a potentially failing URL
];
