const words = [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what'
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
        
        this.init();
    }

    init() {
        this.generateText();
        this.addEventListeners();
    }

    generateText() {
        const shuffledWords = [...words].sort(() => Math.random() - 0.5);
        const selectedWords = shuffledWords.slice(0, 50);
        
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
        
        // Add completion animation
        this.textDisplay.classList.add('test-completed');
        
        // Show final results
        const finalWpm = this.calculateWPM();
        const finalAccuracy = this.calculateAccuracy();
        
        // Optional: Show a completion message
        setTimeout(() => {
            alert(`Test completed!\nWPM: ${finalWpm}\nAccuracy: ${finalAccuracy}%`);
        }, 1000);
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
    }

    addEventListeners() {
        this.input.addEventListener('input', () => {
            if (!this.isRunning) this.startTest();
            this.checkInput();
        });

        this.restartBtn.addEventListener('click', () => this.restartTest());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.restartTest();
            }
            if (e.key === 'Escape') {
                this.restartTest();
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

        // Only move to next word if space is pressed and the word is complete
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
            }
            
            this.input.value = '';
            this.updateStats();
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