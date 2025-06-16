// js/data/dataSourceFetcher.js
async function fetchTextData(sourceUrl) {
    try {
        const response = await fetch(sourceUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for URL: ${sourceUrl}`);
        }
        const textData = await response.text();
        return textData;
    } catch (error) {
        console.error(`Failed to fetch data from ${sourceUrl}:`, error);
        throw error; // Re-throw to be handled by the caller
    }
}

export { fetchTextData };
