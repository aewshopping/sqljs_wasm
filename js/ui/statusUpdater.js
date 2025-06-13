/**
 * Updates the status message display.
 * @param {string} message - The message to display.
 * @param {boolean} [isError=false] - True if the message is an error.
 * @param {boolean} [append=false] - True to append to existing messages, false to overwrite.
 */
function updateStatus(message, isError = false, append = false) {
    const statusDiv = document.getElementById('status');
    if (!statusDiv) {
        console.error("Status display element not found.");
        return;
    }

    let formattedMessage = message;
    if (isError) {
        formattedMessage = `<p class="error">${message}</p>`;
    }

    if (append) {
        const currentContent = statusDiv.innerHTML;
        statusDiv.innerHTML = currentContent + (currentContent ? '<br>' : '') + formattedMessage;
    } else {
        if (isError) {
            statusDiv.innerHTML = formattedMessage;
        } else {
            // Use innerText for non-error, non-appended messages to avoid HTML injection
            // unless message itself is intended to be HTML.
            // For simplicity and consistency with error handling, using innerHTML here.
            // If message could contain user input, sanitization or using innerText would be safer.
            statusDiv.innerHTML = message; // Or statusDiv.innerText = message if no HTML is intended.
        }
    }
}

export { updateStatus };
