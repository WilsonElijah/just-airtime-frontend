document.addEventListener('DOMContentLoaded', () => {
    const flightLogList = document.getElementById('flight-log-list');

    // 1. Fetch and display sessions
    async function fetchSessions() {
        try {
            const response = await fetch('https://just-airtime-api.onrender.com/api/sessions');
            const sessions = await response.json();

            // If the database is empty, show a message
            if (sessions.length === 0) {
                flightLogList.innerHTML = '<p class="no-flights">No flights recorded yet. Time to get some airtime!</p>';
                return;
            }

            // Loop through the data and build the HTML for each card
            flightLogList.innerHTML = sessions.map(session => `
                <div class="flight-card" data-id="${session._id}">
                    <div class="flight-card-left">
                        <div class="flight-card-date">${new Date(session.date).toLocaleDateString()}</div>
                        <div class="flight-card-dunk">${session.dunkType}</div>
                        ${session.notes ? `<div class="flight-card-notes">"${session.notes}"</div>` : ''}
                    </div>
                    <div class="flight-card-right">
                        <div>
                            <span class="flight-card-height">${session.verticalHeight}</span>
                            <span class="flight-card-unit">in</span>
                        </div>
                        <button class="delete-btn" data-id="${session._id}">Delete</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error("Error fetching sessions:", error);
            flightLogList.innerHTML = '<p class="no-flights" style="color: var(--alert-red);">Failed to load flight logs. Is your backend server running?</p>';
        }
    }

    // 2. Listen for clicks on the Delete buttons
    flightLogList.addEventListener('click', async (e) => {
        // Check if the thing we clicked was actually a delete button
        if (e.target.classList.contains('delete-btn')) {
            const button = e.target;
            const id = button.getAttribute('data-id'); // Grab the database ID
            const card = button.closest('.flight-card'); // Find the specific card to animate

            // Brief visual feedback so the user knows it's working
            button.textContent = '...';
            button.style.opacity = '0.5';

            try {
                // Send the kill command to our new backend route
                const response = await fetch(`https://just-airtime-api.onrender.com/api/sessions/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    // Success! Smoothly fade the card out before removing it completely
                    card.style.transform = 'scale(0.9)';
                    card.style.opacity = '0';

                    setTimeout(() => {
                        card.remove();
                        // If we just deleted the very last card, show the empty message
                        if (flightLogList.children.length === 0) {
                            flightLogList.innerHTML = '<p class="no-flights">No flights recorded yet. Time to get some airtime!</p>';
                        }
                    }, 300);
                } else {
                    console.error("Failed to delete on backend");
                    button.textContent = 'Delete';
                    button.style.opacity = '1';
                }
            } catch (error) {
                console.error("Error deleting session:", error);
                button.textContent = 'Error';
            }
        }
    });

    // Run the fetch function as soon as the page loads
    fetchSessions();
});