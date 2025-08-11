// script.js
// DOM Elements
const splashScreen = document.getElementById('splash-screen');
const mainScreen = document.getElementById('main-screen');
const boxes = document.querySelectorAll('.box');
const chantScreenTemplate = document.getElementById('chant-screen-template');
const saveModal = document.getElementById('save-modal');
const resetModal = document.getElementById('reset-modal');
const confirmBtn = document.querySelector('.confirm-btn');
const cancelBtn = document.querySelectorAll('.cancel-btn');
const langToggleMain = document.getElementById('lang-toggle-main');

// Current chant data
let currentChant = null;
let currentCounter = 0;
let currentHistory = [];
let currentLanguage = 'hi'; // Default to Hindi

// Translations
const translations = {
    hi: {
        radha: "राधा",
        ram: "जय श्रीराम / राम",
        hanuman: "जय हनुमान",
        ganesh: "ॐ गं गणपतये नमः",
        krishna: "ॐ नमो भगवते वासुदेवाय",
        narayan: "ॐ नमो नारायणाय",
        shiva: "ॐ नमः शिवाय",
        saraswati: "ॐ ऐं सरस्वती नमः",
        comingSoon: "जल्द आ रहा है",
        saveHistory: "इतिहास सहेजें",
        resetHistory: "इतिहास रीसेट करें",
        historySaved: "इतिहास सहेजा गया",
        saveSuccess: "आपका जप इतिहास सफलतापूर्वक सहेजा गया है!",
        confirmReset: "रीसेट की पुष्टि करें",
        resetWarning: "क्या आप वाकई इतिहास रीसेट करना चाहते हैं? यह इस जप के लिए सभी सहेजे गए रिकॉर्ड साफ़ कर देगा।",
        yesReset: "हाँ, रीसेट करें",
        cancel: "रद्द करें",
        ok: "ठीक है",
        chantingHistory: "जप इतिहास",
        dateTime: "दिनांक और समय",
        count: "गिनती",
        chantTitle: "जप का नाम",
        counterName: "जप का नाम"
    },
    en: {
        radha: "Radha",
        ram: "Jai Shri Ram / Ram",
        hanuman: "Jai Hanuman",
        ganesh: "Om Gam Ganapataye Namah",
        krishna: "Om Namo Bhagavate Vasudevaya",
        narayan: "Om Namo Narayanaya",
        shiva: "Om Namah Shivaya",
        saraswati: "Om Aim Saraswatyai Namah",
        comingSoon: "Coming Soon",
        saveHistory: "Save History",
        resetHistory: "Reset History",
        historySaved: "History Saved",
        saveSuccess: "Your chanting history has been saved successfully!",
        confirmReset: "Confirm Reset",
        resetWarning: "Are you sure you want to reset the history? This will clear all saved records for this chant.",
        yesReset: "Yes, Reset",
        cancel: "Cancel",
        ok: "OK",
        chantingHistory: "Chanting History",
        dateTime: "Date & Time",
        count: "Count",
        chantTitle: "Chant Name",
        counterName: "Chant Name"
    }
};

// Show splash screen on load
window.addEventListener('load', () => {
    // Add touch/click event to splash screen
    splashScreen.addEventListener('click', startApp);
    splashScreen.addEventListener('touchstart', startApp);
});

// Start the application
function startApp() {
    splashScreen.style.opacity = '0';
    setTimeout(() => {
        splashScreen.style.display = 'none';
        mainScreen.style.display = 'flex';
    }, 500);
}

// Language toggle
langToggleMain.addEventListener('click', toggleLanguage);

function toggleLanguage() {
    currentLanguage = currentLanguage === 'hi' ? 'en' : 'hi';
    langToggleMain.textContent = currentLanguage === 'hi' ? 'HI' : 'EN';
    updateTranslations();
}

function updateTranslations() {
    const t = translations[currentLanguage];
    
    // Update main screen boxes
    document.querySelectorAll('.box-title').forEach(el => {
        const key = el.getAttribute('data-key');
        if (key && t[key]) {
            el.textContent = t[key];
        }
    });
    
    // Update current chant screen if open
    const chantScreen = document.querySelector('.chant-screen');
    if (chantScreen && chantScreen.style.display !== 'none') {
        // Update all elements with data-key attributes
        chantScreen.querySelectorAll('[data-key]').forEach(el => {
            const key = el.getAttribute('data-key');
            if (key && t[key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = t[key];
                } else {
                    el.textContent = t[key];
                }
            }
        });
    }
    
    // Update modal texts
    document.querySelectorAll('#save-modal [data-key], #reset-modal [data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (key && t[key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = t[key];
            } else {
                el.textContent = t[key];
            }
        }
    });
}

// Box click handlers
boxes.forEach(box => {
    box.addEventListener('click', () => {
        const chantName = box.getAttribute('data-name');
        openChantScreen(chantName);
    });
});

// Open chant screen
function openChantScreen(chantName) {
    // Hide main screen
    mainScreen.style.display = 'none';
    
    // Create new chant screen
    const chantScreen = chantScreenTemplate.cloneNode(true);
    chantScreen.id = `chant-screen-${chantName}`;
    chantScreen.style.display = 'flex';
    
    // Set chant name
    const chantTitle = chantScreen.querySelector('.chant-title');
    const counterName = chantScreen.querySelector('.counter-name');
    
    chantTitle.textContent = chantName;
    counterName.textContent = chantName;
    
    // Set current chant
    currentChant = chantName;
    
    // Load saved data
    loadChantData(chantName, chantScreen);
    
    // Add event listeners
    const counterValue = chantScreen.querySelector('.counter-value');
    const backButton = chantScreen.querySelector('.back-button');
    const saveButton = chantScreen.querySelector('.save-button');
    const resetButton = chantScreen.querySelector('.reset-button');
    const counterCircle = chantScreen.querySelector('.counter-circle');
    
    // Touch/click counter with debouncing
    let lastTap = 0;
    const tapThreshold = 300; // milliseconds
    
    function handleTap(e) {
        // Prevent default to avoid double tap zoom
        e.preventDefault();
        
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        // Only count if enough time has passed since last tap
        if (tapLength > tapThreshold || tapLength === 0) {
            currentCounter++;
            counterValue.textContent = currentCounter;
            lastTap = currentTime;
        }
    }
    
    // Add event listeners for both touch and click
    counterCircle.addEventListener('touchstart', handleTap, { passive: false });
    counterCircle.addEventListener('mousedown', handleTap);
    
    backButton.addEventListener('click', () => {
        // Remove event listeners
        counterCircle.removeEventListener('touchstart', handleTap);
        counterCircle.removeEventListener('mousedown', handleTap);
        
        chantScreen.remove();
        mainScreen.style.display = 'flex';
    });
    
    saveButton.addEventListener('click', () => {
        saveChantData();
        saveModal.style.display = 'flex';
    });
    
    resetButton.addEventListener('click', () => {
        resetModal.style.display = 'flex';
    });
    
    // Add to body
    document.body.appendChild(chantScreen);
    
    // Update translations for this screen
    updateTranslations();
}

// Load chant data from localStorage
function loadChantData(chantName, chantScreen) {
    const savedData = localStorage.getItem(`sanatan_power_${chantName}`);
    if (savedData) {
        const data = JSON.parse(savedData);
        currentCounter = data.counter || 0;
        currentHistory = data.history || [];
    } else {
        currentCounter = 0;
        currentHistory = [];
    }
    
    // Update UI
    chantScreen.querySelector('.counter-value').textContent = currentCounter;
    updateHistoryTable(chantScreen);
}

// Save chant data to localStorage
function saveChantData() {
    // Add current session to history
    const now = new Date();
    const session = {
        date: now.toLocaleDateString(currentLanguage === 'hi' ? 'hi-IN' : 'en-US'),
        time: now.toLocaleTimeString(currentLanguage === 'hi' ? 'hi-IN' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        count: currentCounter
    };
    
    // Add to history (keep only last 11 records)
    currentHistory.unshift(session);
    if (currentHistory.length > 11) {
        currentHistory = currentHistory.slice(0, 11);
    }
    
    // Save to localStorage
    const data = {
        counter: currentCounter,
        history: currentHistory
    };
    
    localStorage.setItem(`sanatan_power_${currentChant}`, JSON.stringify(data));
    
    // Update history table
    const chantScreen = document.querySelector(`#chant-screen-${currentChant}`);
    if (chantScreen) {
        updateHistoryTable(chantScreen);
    }
}

// Reset chant history
function resetChantHistory() {
    currentCounter = 0;
    currentHistory = [];
    
    // Update UI
    const chantScreen = document.querySelector(`#chant-screen-${currentChant}`);
    if (chantScreen) {
        chantScreen.querySelector('.counter-value').textContent = '0';
        updateHistoryTable(chantScreen);
    }
    
    // Save to localStorage
    const data = {
        counter: 0,
        history: []
    };
    localStorage.setItem(`sanatan_power_${currentChant}`, JSON.stringify(data));
}

// Update history table
function updateHistoryTable(chantScreen) {
    const tbody = chantScreen.querySelector('.history-table tbody');
    tbody.innerHTML = '';
    
    currentHistory.forEach(session => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${session.date} ${session.time}</td>
            <td>${session.count}</td>
        `;
        tbody.appendChild(row);
    });
}

// Modal event handlers
cancelBtn.forEach(btn => {
    btn.addEventListener('click', () => {
        saveModal.style.display = 'none';
        resetModal.style.display = 'none';
    });
});

confirmBtn.addEventListener('click', () => {
    resetChantHistory();
    resetModal.style.display = 'none';
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === saveModal) {
        saveModal.style.display = 'none';
    }
    if (e.target === resetModal) {
        resetModal.style.display = 'none';
    }
});
