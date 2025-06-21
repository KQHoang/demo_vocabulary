// Vocabulary Quiz Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load vocabulary data
    fetch('vocabulary/family_vocabulary.json')
        .then(response => response.json())
        .then(data => {
            initializeQuiz(data);
        })
        .catch(error => console.error('Error loading vocabulary data:', error));
});

let vocabularyData = [];
let usedWords = [];
let missedWords = [];
let currentWord = null;
let showEnglish = false;
let isReviewMode = false;

function initializeQuiz(data) {
    vocabularyData = data;
    loadNextWord();
    document.getElementById('continue-btn').addEventListener('click', validateAnswer);
    document.getElementById('quiz-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            validateAnswer();
        }
    });
    document.getElementById('pronunciation-btn').addEventListener('click', playPronunciation);
}

function playPronunciation() {
    if (currentWord) {
        const utterance = new SpeechSynthesisUtterance(currentWord.english);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    }
}

function loadNextWord() {
    if (usedWords.length === vocabularyData.length) {
        if (missedWords.length > 0 && !isReviewMode) {
            showFeedback('warning', 'Bạn đã hoàn thành vòng đầu tiên. Bây giờ chúng ta sẽ ôn lại các từ bạn đã trả lời sai.');
            isReviewMode = true;
            vocabularyData = missedWords.slice();
            usedWords = [];
            missedWords = [];
            updateProgress();
        } else if (missedWords.length === 0 && isReviewMode) {
            showFeedback('success', 'Chúc mừng! Bạn đã hoàn thành tất cả từ vựng, kể cả các từ ôn lại.');
            document.getElementById('quiz-term').textContent = 'Hoàn thành!';
            document.getElementById('quiz-input').value = '';
            document.getElementById('continue-btn').disabled = true;
            updateProgress();
            return;
        } else if (missedWords.length === 0) {
            showFeedback('success', 'Chúc mừng! Bạn đã hoàn thành tất cả từ vựng.');
            document.getElementById('quiz-term').textContent = 'Hoàn thành!';
            document.getElementById('quiz-input').value = '';
            document.getElementById('continue-btn').disabled = true;
            updateProgress();
            return;
        }
    }

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * vocabularyData.length);
    } while (usedWords.includes(randomIndex));

    usedWords.push(randomIndex);
    currentWord = vocabularyData[randomIndex];
    showEnglish = Math.random() < 0.5;

    document.getElementById('quiz-term').textContent = showEnglish ? currentWord.english : currentWord.vietnamese;
    document.getElementById('quiz-input').value = '';
    document.getElementById('feedback').innerHTML = '';
    document.getElementById('continue-btn').disabled = false;
    updateProgress();
}

function validateAnswer() {
    const userAnswer = document.getElementById('quiz-input').value.trim().toLowerCase();
    const correctAnswer = showEnglish ? currentWord.vietnamese.toLowerCase() : currentWord.english.toLowerCase();

    if (userAnswer === '') {
        showFeedback('warning', 'Vui lòng nhập câu trả lời.');
        return;
    }

    if (userAnswer === correctAnswer) {
        showFeedback('success', 'Đúng! Chuyển sang từ tiếp theo.');
        setTimeout(loadNextWord, 1000);
    } else {
        showFeedback('danger', 'Sai! Câu trả lời đúng là: ' + correctAnswer + '. Từ này sẽ được ôn lại sau.');
        if (!missedWords.some(word => word.english === currentWord.english && word.vietnamese === currentWord.vietnamese)) {
            missedWords.push(currentWord);
        }
        setTimeout(loadNextWord, 2000);
    }
}

function showFeedback(type, message) {
    const feedbackDiv = document.getElementById('feedback');
    feedbackDiv.innerHTML = '<div class="alert alert-' + type + '" role="alert">' + message + '</div>';
}

function updateProgress() {
    const progress = document.getElementById('progress');
    if (isReviewMode) {
        progress.textContent = "Ôn lại: " + usedWords.length + "/" + vocabularyData.length + " từ sai";
    } else {
        progress.textContent = "Hoàn thành: " + usedWords.length + "/" + vocabularyData.length;
    }
}
