// ===== Vocabulary App - Main JavaScript =====

class VocabularyApp {
    constructor() {
        this.vocabularies = [];
        this.filteredVocabularies = [];
        this.init();
    }

    // Initialize the app
    init() {
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.updateStats();
    }

    // Setup all event listeners
    setupEventListeners() {
        // Form submission
        const form = document.getElementById('addWordForm');
        form.addEventListener('submit', (e) => this.handleAddWord(e));
    }

    // Handle adding new word
    handleAddWord(e) {
        e.preventDefault();

        const englishWord = document.getElementById('englishWord').value.trim();
        const thaiMeaning = document.getElementById('thaiMeaning').value.trim();

        // Create vocabulary object
        const vocabulary = {
            id: Date.now(),
            englishWord,
            thaiMeaning,
            createdAt: new Date().toISOString()
        };

        // Add to vocabularies array
        this.vocabularies.unshift(vocabulary);

        // Save to Local Storage
        this.saveToLocalStorage();

        // Reset form
        e.target.reset();

        // Update stats
        this.updateStats();

        // Show success toast
        this.showToast(`เพิ่มคำว่า "${englishWord}" เรียบร้อยแล้ว! ✨`);
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

    // Export data to JSON (for backup)
    exportToJSON() {
        const dataStr = JSON.stringify(this.vocabularies, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vocab-backup-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showToast('ส่งออกข้อมูลเรียบร้อยแล้ว! 📦');
    }

    // Import data from JSON
    importFromJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    this.vocabularies = imported;
                    this.saveToLocalStorage();
                    this.renderVocabularies();
                    this.updateStats();
                    this.showToast('นำเข้าข้อมูลเรียบร้อยแล้ว! 📥');
                }
            } catch (error) {
                console.error('Error importing data:', error);
                this.showToast('เกิดข้อผิดพลาดในการนำเข้าข้อมูล ❌');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new VocabularyApp();
});

// Add some sample data for first-time users (optional)
window.addEventListener('load', () => {
    const stored = localStorage.getItem('vocabularies');
    if (!stored || JSON.parse(stored).length === 0) {
        // Add sample vocabularies
        const sampleVocabs = [
            {
                id: Date.now() + 1,
                englishWord: 'Serendipity',
                thaiMeaning: 'การพบเจอสิ่งดีๆ โดยบังเอิญ',
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 2,
                englishWord: 'Ephemeral',
                thaiMeaning: 'ชั่วคราว, ไม่ยั่งยืน',
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 3,
                englishWord: 'Leverage',
                thaiMeaning: 'ใช้ประโยชน์, ใช้ให้เกิดประสิทธิภาพสูงสุด',
                createdAt: new Date().toISOString()
            }
        ];

        localStorage.setItem('vocabularies', JSON.stringify(sampleVocabs));
        location.reload();
    }
});