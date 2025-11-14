// ===== Vocabulary Quiz App =====

class VocabularyQuiz {
    constructor() {
        this.vocabularies = [];
        this.quizQuestions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.selectedAnswers = [];
        this.totalQuestions = 0;
        this.init();
    }

    // Initialize the app
    init() {
        this.loadVocabularies();
        this.setupQuizOptions();
        this.updateVocabCount();
    }

    // Load vocabularies from localStorage
    loadVocabularies() {
        try {
            const stored = localStorage.getItem('vocabularies');
            if (stored) {
                this.vocabularies = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading vocabularies:', error);
            this.vocabularies = [];
        }
    }

    // Update vocabulary count display
    updateVocabCount() {
        const countElement = document.getElementById('totalVocabCount');
        if (countElement) {
            countElement.textContent = this.vocabularies.length;
        }
    }

    // Setup quiz option buttons
    setupQuizOptions() {
        const optionButtons = document.querySelectorAll('.quiz-option-btn');
        
        optionButtons.forEach(button => {
            const questionCount = parseInt(button.dataset.questions);
            
            // Disable button if not enough vocabularies
            if (this.vocabularies.length < questionCount) {
                button.disabled = true;
                button.classList.add('disabled');
                button.title = `ต้องมีคำศัพท์อย่างน้อย ${questionCount} คำ`;
            } else {
                button.addEventListener('click', () => this.startQuiz(questionCount));
            }
        });

        // Show warning if vocabularies are insufficient
        if (this.vocabularies.length < 5) {
            document.getElementById('insufficientVocabWarning').style.display = 'flex';
            document.getElementById('minRequiredVocab').textContent = '5';
            document.querySelector('.quiz-options').style.display = 'none';
        }
    }

    // Start quiz with selected number of questions
    startQuiz(questionCount) {
        this.totalQuestions = questionCount;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.selectedAnswers = [];
        
        // Generate quiz questions
        this.generateQuestions(questionCount);
        
        // Hide setup screen and show quiz screen
        document.getElementById('quizSetup').style.display = 'none';
        document.getElementById('quizScreen').style.display = 'block';
        
        // Show first question
        this.showQuestion();
    }

    // Generate quiz questions
    generateQuestions(count) {
        // Shuffle vocabularies and pick random ones
        const shuffled = [...this.vocabularies].sort(() => Math.random() - 0.5);
        const selectedVocabs = shuffled.slice(0, count);
        
        this.quizQuestions = selectedVocabs.map(vocab => {
            // Get wrong answers from other vocabularies
            const wrongAnswers = this.getWrongAnswers(vocab, 3);
            
            // Create all options (1 correct + 3 wrong)
            const allOptions = [
                { text: vocab.thaiMeaning, isCorrect: true },
                ...wrongAnswers.map(wa => ({ text: wa, isCorrect: false }))
            ];
            
            // Shuffle options so correct answer isn't always first
            const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
            
            return {
                englishWord: vocab.englishWord,
                correctAnswer: vocab.thaiMeaning,
                options: shuffledOptions,
                id: vocab.id
            };
        });
    }

    // Get wrong answers from other vocabularies
    getWrongAnswers(currentVocab, count) {
        const otherVocabs = this.vocabularies.filter(v => v.id !== currentVocab.id);
        const shuffled = otherVocabs.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count).map(v => v.thaiMeaning);
    }

    // Show current question
    showQuestion() {
        const question = this.quizQuestions[this.currentQuestionIndex];
        
        // Update progress
        this.updateProgress();
        
        // Update question number
        document.getElementById('currentQuestionNumber').textContent = this.currentQuestionIndex + 1;
        document.getElementById('totalQuestions').textContent = this.totalQuestions;
        document.getElementById('currentScore').textContent = this.score;
        
        // Show question word
        document.getElementById('questionWord').textContent = question.englishWord;
        
        // Show answer options
        const optionsContainer = document.getElementById('answerOptions');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = option.text;
            button.onclick = () => this.selectAnswer(option, button);
            optionsContainer.appendChild(button);
        });
    }

    // Update progress bar
    updateProgress() {
        const progress = ((this.currentQuestionIndex) / this.totalQuestions) * 100;
        document.getElementById('progressBar').style.width = progress + '%';
    }

    // Handle answer selection
    selectAnswer(selectedOption, buttonElement) {
        const question = this.quizQuestions[this.currentQuestionIndex];
        const allButtons = document.querySelectorAll('.answer-btn');
        
        // Disable all buttons
        allButtons.forEach(btn => btn.disabled = true);
        
        // Store answer
        this.selectedAnswers.push({
            question: question.englishWord,
            correctAnswer: question.correctAnswer,
            selectedAnswer: selectedOption.text,
            isCorrect: selectedOption.isCorrect
        });
        
        // Update score if correct
        if (selectedOption.isCorrect) {
            this.score++;
            buttonElement.classList.add('correct');
        } else {
            buttonElement.classList.add('wrong');
            
            // Highlight correct answer
            allButtons.forEach(btn => {
                if (btn.textContent === question.correctAnswer) {
                    btn.classList.add('correct');
                }
            });
        }
        
        // Move to next question after delay
        setTimeout(() => {
            this.nextQuestion();
        }, 800)
    }

    // Move to next question
    nextQuestion() {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex < this.totalQuestions) {
            this.showQuestion();
        } else {
            this.showResults();
        }
    }

    // Show results screen
    showResults() {
        // Hide quiz screen and show results screen
        document.getElementById('quizScreen').style.display = 'none';
        document.getElementById('resultsScreen').style.display = 'block';
        
        // Calculate percentage
        const percentage = Math.round((this.score / this.totalQuestions) * 100);
        
        // Update results UI
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalTotal').textContent = this.totalQuestions;
        document.getElementById('scorePercentage').textContent = percentage + '%';
        document.getElementById('correctCount').textContent = this.score;
        document.getElementById('wrongCount').textContent = this.totalQuestions - this.score;
        
        // Set emoji and message based on score
        let emoji, title, subtitle;
        if (percentage === 100) {
            emoji = '🏆';
            title = 'สมบูรณ์แบบ!';
            subtitle = 'คุณเก่งมากเลย ทำคะแนนเต็ม!';
        } else if (percentage >= 80) {
            emoji = '🎉';
            title = 'ยอดเยี่ยม!';
            subtitle = 'คุณทำได้ดีมาก';
        } else if (percentage >= 60) {
            emoji = '👍';
            title = 'ดีมาก!';
            subtitle = 'คุณผ่านแล้ว พยายามต่อไป';
        } else if (percentage >= 40) {
            emoji = '💪';
            title = 'ดีนะ!';
            subtitle = 'ลองทบทวนแล้วทำใหม่นะ';
        } else {
            emoji = '📚';
            title = 'ต้องพยายามอีกนิด!';
            subtitle = 'ทบทวนคำศัพท์แล้วลองใหม่อีกครั้ง';
        }
        
        document.getElementById('resultsEmoji').textContent = emoji;
        document.getElementById('resultsTitle').textContent = title;
        document.getElementById('resultsSubtitle').textContent = subtitle;
        
        // Show review
        this.showReview();
    }

    // Show answer review
    showReview() {
        const reviewList = document.getElementById('reviewList');
        reviewList.innerHTML = '';
        
        this.selectedAnswers.forEach((answer, index) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = `review-item ${answer.isCorrect ? 'review-correct' : 'review-wrong'}`;
            
            reviewItem.innerHTML = `
                <div class="review-header">
                    <span class="review-number">${index + 1}.</span>
                    <span class="review-status">${answer.isCorrect ? '✅ ถูกต้อง' : '❌ ผิด'}</span>
                </div>
                <div class="review-question">
                    <strong>${this.escapeHtml(answer.question)}</strong>
                </div>
                <div class="review-answer">
                    <div class="review-correct-answer">
                        <span class="review-label">คำตอบที่ถูก:</span>
                        <span class="review-value">${this.escapeHtml(answer.correctAnswer)}</span>
                    </div>
                    ${!answer.isCorrect ? `
                        <div class="review-user-answer">
                            <span class="review-label">คุณตอบ:</span>
                            <span class="review-value">${this.escapeHtml(answer.selectedAnswer)}</span>
                        </div>
                    ` : ''}
                </div>
            `;
            
            reviewList.appendChild(reviewItem);
        });
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
}

// Initialize the quiz when DOM is ready
let quiz;
document.addEventListener('DOMContentLoaded', () => {
    quiz = new VocabularyQuiz();
});
