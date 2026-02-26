// Global state
let currentDomain = '';
let activeTechFilter = 'all';
let activeVulnFilter = 'all';
let searchTerm = '';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    renderDorks();
    updateStats();
});

// Initialize application
function initializeApp() {
    // Check if there's a saved domain in localStorage
    const savedDomain = localStorage.getItem('targetDomain');
    if (savedDomain) {
        document.getElementById('domain').value = savedDomain;
        currentDomain = savedDomain;
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Domain input handlers
    document.getElementById('applyDomain').addEventListener('click', applyDomain);
    document.getElementById('clearDomain').addEventListener('click', clearDomain);
    document.getElementById('domain').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyDomain();
        }
    });

    // Tech filter handler (dropdown)
    document.getElementById('techFilter').addEventListener('change', function() {
        activeTechFilter = this.value;
        filterDorks();
        updateStats();
    });

    // Vuln filter handler (dropdown)
    document.getElementById('vulnFilter').addEventListener('change', function() {
        activeVulnFilter = this.value;
        filterDorks();
        updateStats();
    });

    // Search handler
    document.getElementById('searchDorks').addEventListener('input', function() {
        searchTerm = this.value.toLowerCase();
        filterDorks();
        updateStats();
    });
}

// Apply domain to all dorks
function applyDomain() {
    const domainInput = document.getElementById('domain').value.trim();
    
    if (!domainInput) {
        showToast('Please enter a domain', 'error');
        return;
    }

    // Clean the domain (remove http://, https://, www., trailing slash)
    let cleanDomain = domainInput
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '');

    currentDomain = cleanDomain;
    localStorage.setItem('targetDomain', cleanDomain);
    
    renderDorks();
    showToast(`Domain applied: ${cleanDomain}`);
}

// Clear domain
function clearDomain() {
    document.getElementById('domain').value = '';
    currentDomain = '';
    localStorage.removeItem('targetDomain');
    renderDorks();
    showToast('Domain cleared');
}

// Render all dorks
function renderDorks() {
    const container = document.getElementById('dorksContainer');
    container.innerHTML = '';

    dorksDatabase.forEach((dork, index) => {
        const dorkCard = createDorkCard(dork, index);
        container.appendChild(dorkCard);
    });

    filterDorks();
    updateStats();
    
    // Restore last-searched state if it exists
    const lastSearchedIndex = localStorage.getItem('lastSearchedDork');
    if (lastSearchedIndex !== null) {
        const cards = document.querySelectorAll('.dork-card');
        if (cards[lastSearchedIndex]) {
            cards[lastSearchedIndex].classList.add('last-searched');
        }
    }
}

// Create a dork card element
function createDorkCard(dork, index) {
    const card = document.createElement('div');
    card.className = 'dork-card';
    card.style.position = 'relative';
    card.dataset.index = index;

    // Replace {DOMAIN} with actual domain
    const query = currentDomain 
        ? dork.query.replace(/{DOMAIN}/g, currentDomain)
        : dork.query;

    // Build tags
    const techTags = dork.tech.map(t => 
        `<span class="tag tech">${t.toUpperCase()}</span>`
    ).join('');
    
    const vulnTags = dork.vuln.map(v => 
        `<span class="tag vuln">${formatVulnName(v)}</span>`
    ).join('');

    const allTags = techTags + vulnTags;

    card.innerHTML = `
        <div class="dork-content">
            <div class="dork-title">${dork.title}</div>
            <div class="dork-query">${escapeHtml(query)}</div>
            <div class="dork-tags">
                ${allTags || '<span class="tag">General</span>'}
            </div>
        </div>
        <div class="dork-actions">
            <button class="btn-copy" onclick="copyDork(${index})">Copy</button>
            <button class="btn-search" onclick="searchGoogle(${index})">Search</button>
        </div>
    `;

    return card;
}

// Filter dorks based on active filters and search term
function filterDorks() {
    const cards = document.querySelectorAll('.dork-card');
    
    cards.forEach((card, index) => {
        const dork = dorksDatabase[index];
        let shouldShow = true;

        // Tech filter
        if (activeTechFilter !== 'all') {
            shouldShow = shouldShow && dork.tech.includes(activeTechFilter);
        }

        // Vuln filter
        if (activeVulnFilter !== 'all') {
            shouldShow = shouldShow && dork.vuln.includes(activeVulnFilter);
        }

        // Search filter
        if (searchTerm) {
            const searchableText = (
                dork.title + ' ' + 
                dork.query + ' ' + 
                dork.tech.join(' ') + ' ' + 
                dork.vuln.join(' ')
            ).toLowerCase();
            
            shouldShow = shouldShow && searchableText.includes(searchTerm);
        }

        if (shouldShow) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// Update statistics
function updateStats() {
    const totalDorks = dorksDatabase.length;
    const visibleDorks = document.querySelectorAll('.dork-card:not(.hidden)').length;

    document.getElementById('totalDorks').textContent = totalDorks;
    document.getElementById('visibleDorks').textContent = visibleDorks;
}

// Copy a single dork
function copyDork(index) {
    const dork = dorksDatabase[index];
    const query = currentDomain 
        ? dork.query.replace(/{DOMAIN}/g, currentDomain)
        : dork.query;

    copyToClipboard(query);
    showToast('Dork copied to clipboard!');
}

// Search on Google
function searchGoogle(index) {
    const dork = dorksDatabase[index];
    let query = dork.query;

    if (!currentDomain && query.includes('{DOMAIN}')) {
        showToast('Please set a domain first!', 'error');
        return;
    }

    query = currentDomain 
        ? query.replace(/{DOMAIN}/g, currentDomain)
        : query;

    // Mark this card as last searched
    markLastSearched(index);

    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(googleUrl, '_blank');
}

// Mark a dork card as last searched
function markLastSearched(index) {
    // Remove last-searched class from all cards
    document.querySelectorAll('.dork-card').forEach(card => {
        card.classList.remove('last-searched');
    });

    // Add last-searched class to the clicked card
    const cards = document.querySelectorAll('.dork-card');
    if (cards[index]) {
        cards[index].classList.add('last-searched');
        // Store in localStorage
        localStorage.setItem('lastSearchedDork', index);
    }
}

// Copy to clipboard utility
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.background = type === 'error' ? '#ef4444' : '#10b981';
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Format vulnerability name
function formatVulnName(vuln) {
    const names = {
        'sqli': 'SQL Injection',
        'xss': 'XSS',
        'lfi': 'LFI/RFI',
        'openredirect': 'Open Redirect',
        'ssrf': 'SSRF',
        'rce': 'RCE',
        'idor': 'IDOR',
        'disclosure': 'Info Disclosure',
        'upload': 'File Upload',
        'backup': 'Backup Files',
        'config': 'Config Files',
        'login': 'Login Pages',
        'admin': 'Admin Panels',
        'api': 'API',
        'subdomain': 'Subdomains',
        'filetype': 'File Types'
    };
    
    return names[vuln] || vuln.toUpperCase();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
