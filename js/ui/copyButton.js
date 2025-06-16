export function initializeCopyButton() {
    const resultsDiv = document.getElementById('results');

    if (resultsDiv) {
        resultsDiv.addEventListener('click', (event) => {
            if (event.target.id === 'copy-button') {
                const copyButton = event.target; // This is the clicked button
                const preTag = resultsDiv.querySelector('pre');
                let textToCopy = '';

                if (preTag) {
                    textToCopy = preTag.textContent || '';
                }

                navigator.clipboard.writeText(textToCopy).then(() => {
                    const originalText = copyButton.textContent;
                    copyButton.textContent = 'Copied!';
                    setTimeout(() => {
                        copyButton.textContent = originalText;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    // Visual feedback for error
                    const originalText = copyButton.textContent;
                    copyButton.textContent = 'Failed!';
                    setTimeout(() => {
                        copyButton.textContent = originalText;
                    }, 2000);
                });
            }
        });
    } else {
        console.error('Results div not found for copy button initialization.');
    }
}
