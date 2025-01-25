const words = [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'companion', 'passion','sinister', 'crash','santa', 'fantastic', 'their', 'what'
];

class TypingTest {
    constructor() {
        this.textDisplay = document.getElementById('text-display');
        this.input = document.getElementById('input');
        this.wpmDisplay = document.getElementById('wpm');
        this.accuracyDisplay = document.getElementById('accuracy');
        this.timeDisplay = document.getElementById('time');
        this.restartBtn = document.getElementById('restart');
        
        this.currentWordIndex = 0;
        this.correctCharacters = 0;
        this.totalCharacters = 0;
        this.startTime = null;
        this.timeLeft = 60;
        this.isRunning = false;
        this.overlay = document.querySelector('.overlay');
        
        this.init();
    }

    init() {
        this.generateText();
        this.addEventListeners();
    }

    generateText() {
        const shuffledWords = [...words].sort(() => Math.random() - 0.5);
        const selectedWords = shuffledWords.slice(0, 10);
        
        // Generate all characters wrapped in spans from the start
        this.textDisplay.innerHTML = selectedWords.map((word, index) => {
            const chars = word.split('').map(char => 
                `<span class="char">${char}</span>`
            ).join('');
            return `<span class="${index === 0 ? 'current' : ''}">${chars}</span>`;
        }).join(' ');
    }

    startTest() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startTime = Date.now();
            this.timer = setInterval(() => this.updateTimer(), 1000);
            this.input.focus();
        }
    }

    updateTimer() {
        this.timeLeft--;
        this.timeDisplay.textContent = this.timeLeft + 's';
        
        if (this.timeLeft <= 0) {
            this.endTest();
        }
    }

    calculateWPM() {
        const timeElapsed = (Date.now() - this.startTime) / 1000 / 60;
        return Math.round((this.correctCharacters / 5) / timeElapsed);
    }

    calculateAccuracy() {
        return Math.round((this.correctCharacters / this.totalCharacters) * 100) || 0;
    }

    endTest() {
        clearInterval(this.timer);
        this.isRunning = false;
        this.input.disabled = true;
        
        const finalWpm = this.calculateWPM();
        const finalAccuracy = this.calculateAccuracy();
        
        const resultsOverlay = document.createElement('div');
        resultsOverlay.className = 'results-overlay';
        resultsOverlay.innerHTML = `
            <div class="results-content">
                <h2>Test Complete!</h2>
                <div class="results-stats">
                    <div class="result-item">
                        <span class="result-label">WPM</span>
                        <span class="result-value">${finalWpm}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Accuracy</span>
                        <span class="result-value">${finalAccuracy}%</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Time</span>
                        <span class="result-value">${60 - this.timeLeft}s</span>
                    </div>
                </div>
                <button class="restart-btn">Try Again</button>
                <div class="shortcuts">
                    <span>Tab + Enter - restart test</span>
                </div>
            </div>
        `;

        // Add event listener for the restart button in results
        const restartBtn = resultsOverlay.querySelector('.restart-btn');
        restartBtn.addEventListener('click', () => {
            document.body.removeChild(resultsOverlay);
            this.restartTest();
        });

        // Add keyboard shortcut listener for the results screen
        const handleResultsKeydown = (e) => {
            if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault();
                document.body.removeChild(resultsOverlay);
                this.restartTest();
                document.removeEventListener('keydown', handleResultsKeydown);
            }
        };
        document.addEventListener('keydown', handleResultsKeydown);
        
        document.body.appendChild(resultsOverlay);
    }

    restartTest() {
        clearInterval(this.timer);
        this.currentWordIndex = 0;
        this.correctCharacters = 0;
        this.totalCharacters = 0;
        this.timeLeft = 60;
        this.isRunning = false;
        this.startTime = null;
        this.input.value = '';
        this.input.disabled = false;
        this.timeDisplay.textContent = '60s';
        this.wpmDisplay.textContent = '0';
        this.accuracyDisplay.textContent = '0%';
        this.textDisplay.classList.remove('test-completed'); // Remove completion class
        this.generateText();
        this.input.focus();
        if (this.overlay) {
            this.overlay.classList.remove('hidden');
        }
    }

    addEventListeners() {
        document.addEventListener('keydown', (e) => {
            // Tab + Enter to restart
            if (e.key === 'Enter' && e.shiftKey) {  // Changed to Shift+Enter
                e.preventDefault();
                this.restartTest();
            }
            // Tab to start/remove overlay
            else if (e.key === 'Tab') {
                e.preventDefault();
                if (this.overlay && !this.overlay.classList.contains('hidden')) {
                    this.overlay.classList.add('hidden');
                    this.input.focus();
                }
            }
            else if (e.key === 'Escape') {
                this.restartTest();
                if (this.overlay) {
                    this.overlay.classList.remove('hidden');
                }
            }
        });

        this.input.addEventListener('input', () => {
            if (!this.isRunning) this.startTest();
            this.checkInput();
        });

        this.restartBtn.addEventListener('click', () => {
            this.restartTest();
            if (this.overlay) {
                this.overlay.classList.remove('hidden');
            }
        });
    }

    checkInput() {
        const words = this.textDisplay.children;
        const currentWord = words[this.currentWordIndex];
        const inputValue = this.input.value;
        const characters = currentWord.querySelectorAll('.char');
        const currentWordText = Array.from(characters).map(span => span.textContent).join('');

        // Check each character
        for (let i = 0; i < characters.length; i++) {
            if (i < inputValue.length) {
                if (inputValue[i] === currentWordText[i]) {
                    characters[i].className = 'char correct';
                } else {
                    characters[i].className = 'char incorrect';
                }
            } else {
                characters[i].className = 'char';
            }
        }

        // Handle word completion
        if (inputValue.endsWith(' ') && inputValue.trim().length === currentWordText.length) {
            this.totalCharacters += currentWordText.length;
            
            if (inputValue.trim() === currentWordText) {
                this.correctCharacters += currentWordText.length;
                currentWord.classList.add('word-correct');
            } else {
                currentWord.classList.add('word-incorrect');
            }

            currentWord.classList.remove('current');
            this.currentWordIndex++;
            
            if (this.currentWordIndex < words.length) {
                words[this.currentWordIndex].classList.add('current');
                this.input.value = '';
                this.updateStats();
            } else {
                // End test when last word is completed
                this.endTest();
            }
        }
    }

    updateStats() {
        this.wpmDisplay.textContent = this.calculateWPM();
        this.accuracyDisplay.textContent = this.calculateAccuracy() + '%';
    }
}

// Initialize the typing test when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TypingTest();
}); 