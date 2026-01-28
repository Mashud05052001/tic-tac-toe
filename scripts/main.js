// Main JavaScript for Home Page

document.addEventListener('DOMContentLoaded', function () {
    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    const themeText = themeToggle.querySelector('span');

    themeToggle.addEventListener('click', function () {
        document.body.classList.toggle('dark-theme');

        if (document.body.classList.contains('dark-theme')) {
            themeIcon.className = 'fas fa-moon';
            themeText.textContent = 'Dark Mode';
        } else {
            themeIcon.className = 'fas fa-sun';
            themeText.textContent = 'Light Mode';
        }

        // Save theme preference
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
        themeIcon.className = 'fas fa-sun';
        themeText.textContent = 'Light Mode';
    }

    // Settings Panel
    const openSettingsBtn = document.getElementById('openSettings');
    const closeSettingsBtn = document.querySelector('.btn-close-settings');
    const settingsPanel = document.getElementById('settingsPanel');
    const saveSettingsBtn = document.getElementById('saveSettings');
    const resetSettingsBtn = document.getElementById('resetSettings');

    openSettingsBtn.addEventListener('click', function () {
        settingsPanel.classList.add('active');
        loadSettings();
    });

    closeSettingsBtn.addEventListener('click', function () {
        settingsPanel.classList.remove('active');
    });

    // Close settings when clicking outside
    document.addEventListener('click', function (event) {
        if (!settingsPanel.contains(event.target) && !openSettingsBtn.contains(event.target) && settingsPanel.classList.contains('active')) {
            settingsPanel.classList.remove('active');
        }
    });

    // Load settings from localStorage
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('ultimateTicTacToeSettings')) || {};

        // Player names
        document.getElementById('player1Name').value = settings.player1Name || 'Player 1';
        document.getElementById('player2Name').value = settings.player2Name || 'Player 2';
        document.getElementById('aiName').value = settings.aiName || 'AI Agent';

        // AI difficulty
        const difficulty = settings.aiDifficulty || 'medium';
        document.getElementById(`difficulty${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`).checked = true;

        // Game options
        document.getElementById('highlightMoves').checked = settings.highlightMoves !== false;
        document.getElementById('showHints').checked = settings.showHints || false;
        document.getElementById('animations').checked = settings.animations !== false;
        document.getElementById('soundEffects').checked = settings.soundEffects !== false;

        // Theme color
        const color = settings.themeColor || 'default';
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.color === color) {
                option.classList.add('active');
            }
        });

        // Update AI name visibility based on mode
        updateAINameVisibility();
    }

    // Update AI name visibility
    function updateAINameVisibility() {
        const aiNameGroup = document.getElementById('aiNameGroup');
        // This will be updated when game mode is selected
        // For now, show it by default
        aiNameGroup.style.display = 'block';
    }

    // Save settings
    saveSettingsBtn.addEventListener('click', function () {
        const settings = {
            player1Name: document.getElementById('player1Name').value,
            player2Name: document.getElementById('player2Name').value,
            aiName: document.getElementById('aiName').value,
            aiDifficulty: document.querySelector('input[name="difficulty"]:checked').value,
            highlightMoves: document.getElementById('highlightMoves').checked,
            showHints: document.getElementById('showHints').checked,
            animations: document.getElementById('animations').checked,
            soundEffects: document.getElementById('soundEffects').checked,
            themeColor: document.querySelector('.color-option.active').dataset.color
        };

        localStorage.setItem('ultimateTicTacToeSettings', JSON.stringify(settings));

        // Apply theme color
        applyThemeColor(settings.themeColor);

        // Show success message
        showNotification('Settings saved successfully!', 'success');

        // Close settings panel after a delay
        setTimeout(() => {
            settingsPanel.classList.remove('active');
        }, 1000);
    });

    // Reset settings
    resetSettingsBtn.addEventListener('click', function () {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            localStorage.removeItem('ultimateTicTacToeSettings');
            loadSettings();
            showNotification('Settings reset to default.', 'info');
        }
    });

    // Apply theme color
    function applyThemeColor(color) {
        const root = document.documentElement;

        switch (color) {
            case 'green':
                root.style.setProperty('--primary-color', '#00b09b');
                root.style.setProperty('--secondary-color', '#96c93d');
                break;
            case 'blue':
                root.style.setProperty('--primary-color', '#2575fc');
                root.style.setProperty('--secondary-color', '#6a11cb');
                break;
            case 'red':
                root.style.setProperty('--primary-color', '#ff416c');
                root.style.setProperty('--secondary-color', '#ff4b2b');
                break;
            case 'orange':
                root.style.setProperty('--primary-color', '#ff7e5f');
                root.style.setProperty('--secondary-color', '#feb47b');
                break;
            case 'purple':
                root.style.setProperty('--primary-color', '#8a2be2');
                root.style.setProperty('--secondary-color', '#4a00e0');
                break;
            default:
                root.style.setProperty('--primary-color', '#6a11cb');
                root.style.setProperty('--secondary-color', '#2575fc');
        }
    }

    // Color palette selection
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function () {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Load saved theme color
    const savedSettings = JSON.parse(localStorage.getItem('ultimateTicTacToeSettings')) || {};
    if (savedSettings.themeColor) {
        applyThemeColor(savedSettings.themeColor);
    }

    // Game mode selection
    const pvpMode = document.getElementById('pvpMode');
    const pveMode = document.getElementById('pveMode');

    pvpMode.addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-play') || e.target.closest('.btn-play')) {
            // Save game mode
            localStorage.setItem('gameMode', 'pvp');
            // Redirect to game page
            window.location.href = 'game.html';
        }
    });

    pveMode.addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-play') || e.target.closest('.btn-play')) {
            // Save game mode
            localStorage.setItem('gameMode', 'pve');
            // Redirect to game page
            window.location.href = 'game.html';
        }
    });

    // Help Modal
    const openHelpBtn = document.getElementById('openHelp');
    const helpModal = document.getElementById('helpModal');
    const closeHelpBtns = document.querySelectorAll('.btn-close-modal');

    openHelpBtn.addEventListener('click', function () {
        helpModal.classList.add('active');
    });

    closeHelpBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            helpModal.classList.remove('active');
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function (event) {
        if (event.target === helpModal) {
            helpModal.classList.remove('active');
        }
    });

    // Notification function
    function showNotification(message, type) {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="btn-close-notification"><i class="fas fa-times"></i></button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            min-width: 300px;
            max-width: 400px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;

        // Set background color based on type
        if (type === 'success') {
            notification.style.backgroundColor = '#00b09b';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#ff416c';
        } else {
            notification.style.backgroundColor = '#2575fc';
        }

        // Add close button styles
        const closeBtn = notification.querySelector('.btn-close-notification');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 1rem;
        `;

        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        // Add to document
        document.body.appendChild(notification);

        // Close button functionality
        closeBtn.addEventListener('click', function () {
            notification.remove();
        });

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
});