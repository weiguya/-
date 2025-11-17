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
        this.createAlphabetFilter();
        this.renderVocabularies();
        this.updateStats();
        this.createEditModal();
    }

    // Create edit modal dynamically
    createEditModal() {
        const modalHTML = `
            <div class="modal-overlay" id="editModal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>✏️ แก้ไขคำศัพท์</h3>
                        <button class="modal-close" onclick="app.closeEditModal()">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="editEnglishWord">คำศัพท์ภาษาอังกฤษ</label>
                            <input 
                                type="text" 
                                id="editEnglishWord" 
                                placeholder="เช่น: Serendipity"
                                autocomplete="off"
                            >
                        </div>
                        <div class="form-group">
                            <label for="editThaiMeaning">ความหมาย (ไทย)</label>
                            <input 
                                type="text" 
                                id="editThaiMeaning" 
                                placeholder="เช่น: การพบเจอสิ่งดีๆ โดยบังเอิญ"
                            >
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="app.closeEditModal()">
                            ยกเลิก
                        </button>
                        <button class="btn btn-primary" onclick="app.saveEdit()">
                            <span class="btn-icon">💾</span>
                            บันทึก
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Setup all event listeners
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));

        // Close modal when clicking outside
        const modal = document.getElementById('editModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeEditModal();
                }
            });
        }

        // Handle Enter key in edit form
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('editModal');
            if (modal && modal.classList.contains('show')) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.saveEdit();
                } else if (e.key === 'Escape') {
                    this.closeEditModal();
                }
            }
        });
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
            const count = groupedVocabs[letter].length;
            html += `
                <div class="alphabet-section" id="letter-${letter}">
                    <div class="alphabet-letter">${letter}</div>
                    ${groupedVocabs[letter].map(vocab => this.createVocabItemHTML(vocab)).join('')}
                </div>
            `;
        });

        vocabList.innerHTML = html;

        // Update alphabet filter after rendering
        this.updateAlphabetFilter();
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

    // Edit vocabulary - open modal with current values
    editVocabulary(id) {
        const vocab = this.vocabularies.find(v => v.id === id);
        if (!vocab) return;

        // Store current editing ID
        this.currentEditId = id;

        // Fill form with current values
        document.getElementById('editEnglishWord').value = vocab.englishWord;
        document.getElementById('editThaiMeaning').value = vocab.thaiMeaning;

        // Show modal
        const modal = document.getElementById('editModal');
        modal.style.display = 'flex';
        modal.classList.add('show');

        // Focus on first input
        setTimeout(() => {
            document.getElementById('editEnglishWord').focus();
            document.getElementById('editEnglishWord').select();
        }, 100);
    }

    // Save edit from modal
    saveEdit() {
        const vocab = this.vocabularies.find(v => v.id === this.currentEditId);
        if (!vocab) return;

        const newEnglishWord = document.getElementById('editEnglishWord').value.trim();
        const newThaiMeaning = document.getElementById('editThaiMeaning').value.trim();

        // Validate inputs
        if (!newEnglishWord || !newThaiMeaning) {
            this.showToast('กรุณากรอกข้อมูลให้ครบถ้วน ⚠️');
            return;
        }

        // Update vocabulary
        vocab.englishWord = newEnglishWord;
        vocab.thaiMeaning = newThaiMeaning;

        // Save and re-render
        this.saveToLocalStorage();
        this.renderVocabularies();
        this.closeEditModal();
        this.showToast('แก้ไขคำศัพท์เรียบร้อยแล้ว ✏️');
    }

    // Close edit modal
    closeEditModal() {
        const modal = document.getElementById('editModal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300); // Wait for animation to finish
        this.currentEditId = null;
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

    // Create alphabet filter sidebar
    createAlphabetFilter() {
        const filterContainer = document.getElementById('alphabetFilter');
        if (!filterContainer) return;

        // Create A-Z buttons
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        let html = '';

        alphabet.forEach(letter => {
            html += `
                <button class="alphabet-btn" data-letter="${letter}">
                    <span class="letter">${letter}</span>
                    <span class="count">0</span>
                </button>
            `;
        });

        filterContainer.innerHTML = html;

        // Add click event listeners
        filterContainer.querySelectorAll('.alphabet-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const letter = btn.dataset.letter;
                this.scrollToLetter(letter);
            });
        });
    }

    // Update alphabet filter with counts
    updateAlphabetFilter() {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        
        // Count vocabularies for each letter
        const letterCounts = {};
        alphabet.forEach(letter => {
            letterCounts[letter] = 0;
        });

        this.vocabularies.forEach(vocab => {
            const firstLetter = vocab.englishWord.charAt(0).toUpperCase();
            if (letterCounts.hasOwnProperty(firstLetter)) {
                letterCounts[firstLetter]++;
            }
        });

        // Update button states
        alphabet.forEach(letter => {
            const btn = document.querySelector(`.alphabet-btn[data-letter="${letter}"]`);
            if (btn) {
                const count = letterCounts[letter];
                const countSpan = btn.querySelector('.count');
                countSpan.textContent = count;

                if (count === 0) {
                    btn.classList.add('disabled');
                    btn.disabled = true;
                } else {
                    btn.classList.remove('disabled');
                    btn.disabled = false;
                }
            }
        });
    }

    // Scroll to specific letter section
    scrollToLetter(letter) {
        const section = document.getElementById(`letter-${letter}`);
        if (section) {
            // Remove active class from all buttons
            document.querySelectorAll('.alphabet-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Add active class to clicked button
            const btn = document.querySelector(`.alphabet-btn[data-letter="${letter}"]`);
            if (btn) {
                btn.classList.add('active');
            }

            // Scroll to section
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Remove active class after scrolling
            setTimeout(() => {
                if (btn) btn.classList.remove('active');
            }, 1000);
        }
    }
}

// Initialize the app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new VocabularyListApp();
});
