import fetch from 'node-fetch';

async function main() {
    console.log('node-fetch imported successfully.');
    try {
        const response = await fetch('https://www.google.com');
        console.log('Fetch to google.com status:', response.status);
        console.log('Minimal fetch test passed.');
        process.exit(0);
    } catch (error) {
        console.error('Minimal fetch test failed:', error);
        process.exit(1);
    }
}

main();
