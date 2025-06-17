let startTime;
let endTime;

/**
 * Records the current time as the start time.
 */
function startTimer() {
    startTime = new Date();
}

/**
 * Records the current time as the end time and calculates the duration.
 */
function stopTimer() {
    endTime = new Date();
}

/**
 * Calculates the difference between startTime and endTime,
 * and updates the 'timer' div in index.html with the duration.
 * The time should be displayed in seconds with two decimal places (e.g., "Load time: 3.45s").
 */
function displayTime() {
    if (startTime && endTime) {
        const duration = (endTime - startTime) / 1000; // Duration in seconds
        const timerDiv = document.getElementById('timer');
        if (timerDiv) {
            timerDiv.innerText = `Load time: ${duration.toFixed(2)}s`;
        } else {
            console.error("Timer display element not found.");
        }
    } else {
        console.warn("Timer was not started or stopped correctly.");
        const timerDiv = document.getElementById('timer');
        if (timerDiv) {
            timerDiv.innerText = "Timer error.";
        }
    }
}

export { startTimer, stopTimer, displayTime };
