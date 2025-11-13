// ===== Vocabulary List Page - A-Z View =====

class VocabularyListApp {
    constructor() {
        this.vocabularies = [];
        this.filteredVocabularies = [];
        this.init();
    }

    // Initialize the app
    init() {
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.renderVocabularies();
        this.updateStats();
    }

    // Setup all event listeners
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    // Handle search
    handleSearch(searchTerm) {
        this.applyFilters(searchTerm);
    }

    // Apply search filter
    applyFilters(searchTerm) {
        this.filteredVocabularies = this.vocabularies.filter(vocab => {
            const matchesSearch = searchTerm === '' || 
                vocab.englishWord.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vocab.thaiMeaning.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesSearch;
        });

        this.renderVocabularies();
    }

    // Delete vocabulary
    deleteVocabulary(id) {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบคำศัพท์นี้?')) {
            this.vocabularies = this.vocabularies.filter(vocab => vocab.id !== id);
            this.saveToLocalStorage();
            this.renderVocabularies();
            this.updateStats();
            this.showToast('ลบคำศัพท์เรียบร้อยแล้ว');
        }
    }

    // Render vocabularies in A-Z format
    renderVocabularies() {
        const vocabList = document.getElementById('vocabList');
        const emptyState = document.getElementById('emptyState');
        
        // Use filtered vocabularies if search is applied, otherwise use all
        const displayVocabularies = document.getElementById('searchInput').value
            ? this.filteredVocabularies
            : this.vocabularies;

        // Show empty state if no vocabularies
        if (displayVocabularies.length === 0) {
            vocabList.innerHTML = '';
            emptyState.classList.add('show');
            return;
        }

        emptyState.classList.remove('show');

        // Sort vocabularies alphabetically
        const sortedVocabs = [...displayVocabularies].sort((a, b) => 
            a.englishWord.toLowerCase().localeCompare(b.englishWord.toLowerCase())
        );

        // Group by first letter
        const groupedVocabs = {};
        sortedVocabs.forEach(vocab => {
            const firstLetter = vocab.englishWord.charAt(0).toUpperCase();
            if (!groupedVocabs[firstLetter]) {
                groupedVocabs[firstLetter] = [];
            }
            groupedVocabs[firstLetter].push(vocab);
        });

        // Generate HTML for each letter group
        let html = '';
        Object.keys(groupedVocabs).sort().forEach(letter => {
            html += `
                <div class="alphabet-section">
                    <div class="alphabet-letter">${letter}</div>
                    ${groupedVocabs[letter].map(vocab => this.createVocabItemHTML(vocab)).join('')}
                </div>
            `;
        });

        vocabList.innerHTML = html;
    }

    // Create vocab item HTML
    createVocabItemHTML(vocab) {
        return `
            <div class="vocab-item">
                <div class="vocab-header">
                    <div class="vocab-word">
                        <div class="english-word">${this.escapeHtml(vocab.englishWord)}</div>
                        <div class="thai-meaning">${this.escapeHtml(vocab.thaiMeaning)}</div>
                    </div>
                </div>
                
                <div class="vocab-footer">
                    <span class="vocab-date">📅 ${this.formatDate(vocab.createdAt)}</span>
                    <div class="vocab-actions">
                        <button class="icon-btn edit-btn" onclick="app.editVocabulary(${vocab.id})" title="แก้ไข">
                            ✏️
                        </button>
                        <button class="icon-btn delete-btn" onclick="app.deleteVocabulary(${vocab.id})" title="ลบ">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Edit vocabulary
    editVocabulary(id) {
        const vocab = this.vocabularies.find(v => v.id === id);
        if (!vocab) return;

        const newEnglishWord = prompt('แก้ไขคำศัพท์ภาษาอังกฤษ:', vocab.englishWord);
        if (newEnglishWord === null) return; // User cancelled
        
        const newThaiMeaning = prompt('แก้ไขความหมายภาษาไทย:', vocab.thaiMeaning);
        if (newThaiMeaning === null) return; // User cancelled

        // Update vocabulary
        vocab.englishWord = newEnglishWord.trim();
        vocab.thaiMeaning = newThaiMeaning.trim();

        // Save and re-render
        this.saveToLocalStorage();
        this.renderVocabularies();
        this.showToast('แก้ไขคำศัพท์เรียบร้อยแล้ว ✏️');
    }

    // Update statistics
    updateStats() {
        const totalWords = document.getElementById('totalWords');
        totalWords.textContent = this.vocabularies.length;
    }

    // Save to Local Storage
    saveToLocalStorage() {
        try {
            localStorage.setItem('vocabularies', JSON.stringify(this.vocabularies));
        } catch (error) {
            console.error('Error saving to Local Storage:', error);
            this.showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล ❌');
        }
    }

    // Load from Local Storage
    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('vocabularies');
            if (stored) {
                this.vocabularies = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading from Local Storage:', error);
            this.vocabularies = [];
        }
    }

    // Show toast notification
    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Format date to Thai format
    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return date.toLocaleDateString('th-TH', options);
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new VocabularyListApp();
});