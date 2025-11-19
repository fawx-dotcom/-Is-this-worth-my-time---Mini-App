document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('decisionForm');
    const historyList = document.getElementById('historyList');
    const clearBtn = document.getElementById('clearHistory');
    const STORAGE_KEY = 'decision_filter_history';

    // Load history on startup
    loadHistory();

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form values
        const formData = new FormData(form);
        const closerToGoal = formData.get('closerToGoal');
        const energy = formData.get('energy');
        const alternative = formData.get('alternative');

        if (!closerToGoal || !energy || !alternative.trim()) {
            alert('Please fill out all fields.');
            return;
        }

        const decision = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            closerToGoal,
            energy,
            alternative: alternative.trim()
        };

        saveDecision(decision);
        form.reset();
        loadHistory(); // Refresh list
    });

    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your history?')) {
            localStorage.removeItem(STORAGE_KEY);
            loadHistory();
        }
    });

    function saveDecision(decision) {
        const history = getHistory();
        history.unshift(decision); // Add new to the top
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }

    function getHistory() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    function loadHistory() {
        const history = getHistory();
        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = '<div class="empty-state">No decisions recorded yet. Start filtering!</div>';
            clearBtn.style.display = 'none';
            return;
        }

        clearBtn.style.display = 'block';

        history.forEach(item => {
            const date = new Date(item.timestamp).toLocaleString('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            const itemEl = document.createElement('div');
            itemEl.className = 'history-item';
            
            // Determine tag classes
            const goalClass = item.closerToGoal === 'Yes' ? 'yes' : 'no';
            const energyClass = item.energy === 'Energized' ? 'energized' : 'drained';

            itemEl.innerHTML = `
                <div class="history-header">
                    <span>${date}</span>
                </div>
                <div class="history-tags">
                    <span class="tag ${goalClass}">Goal: ${item.closerToGoal}</span>
                    <span class="tag ${energyClass}">${item.energy}</span>
                </div>
                <div class="history-content">
                    <strong>Alternative:</strong> ${escapeHtml(item.alternative)}
                </div>
            `;
            
            historyList.appendChild(itemEl);
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
