// Vocabulary Quiz Functionality
    // Initialization is triggered from index.html after DOM elements are created

let quizzes = {}; // Object to store quiz data for each topic

function initializeQuizzes() {
    topics.forEach(topic => {
        quizzes[topic.id] = {
            vocabularyData: [],
            usedWords: [],
            missedWords: [],
            currentWord: null,
            showEnglish: false,
            isReviewMode: false,
            isInitialized: false
        };
        
        // Load vocabulary data for this topic
        fetch(`vocabulary/${topic.fileName}`)
            .then(response => response.json())
            .then(data => {
                quizzes[topic.id].vocabularyData = data;
                quizzes[topic.id].isInitialized = true;
                if (topic.id === topics[0].id) {
                    loadNextWord(topic.id);
                }
            })
            .catch(error => console.error(`Error loading vocabulary data for ${topic.id}:`, error));
        
        // Add event listeners for this topic's quiz elements
        document.getElementById(`continue-btn-${topic.id}`).addEventListener('click', () => validateAnswer(topic.id));
        document.getElementById(`quiz-input-${topic.id}`).addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                validateAnswer(topic.id);
            }
        });
        document.getElementById(`pronunciation-btn-${topic.id}`).addEventListener('click', () => playPronunciation(topic.id));
    });
    
    // Add event listener for tab changes to load quiz data for the selected topic
    document.getElementById('topicSidebar').addEventListener('click', function(e) {
        if (e.target.classList.contains('nav-link')) {
            const topicId = e.target.id.split('-')[0];
            if (quizzes[topicId] && quizzes[topicId].isInitialized && quizzes[topicId].usedWords.length === 0) {
                loadNextWord(topicId);
            }
        }
    });
}

function playPronunciation(topicId) {
    const currentWord = quizzes[topicId].currentWord;
    if (currentWord) {
        const utterance = new SpeechSynthesisUtterance(currentWord.english);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    }
}

function loadNextWord(topicId) {
    const quiz = quizzes[topicId];
    if (quiz.usedWords.length === quiz.vocabularyData.length) {
        if (quiz.missedWords.length > 0 && !quiz.isReviewMode) {
            showFeedback(topicId, 'warning', 'Bạn đã hoàn thành vòng đầu tiên. Bây giờ chúng ta sẽ ôn lại các từ bạn đã trả lời sai.');
            quiz.isReviewMode = true;
            quiz.vocabularyData = quiz.missedWords.slice();
            quiz.usedWords = [];
            quiz.missedWords = [];
            updateProgress(topicId);
        } else if (quiz.missedWords.length === 0 && quiz.isReviewMode) {
            showFeedback(topicId, 'success', 'Chúc mừng! Bạn đã hoàn thành tất cả từ vựng, kể cả các từ ôn lại.');
            document.getElementById(`quiz-term-${topicId}`).textContent = 'Hoàn thành!';
            document.getElementById(`quiz-input-${topicId}`).value = '';
            document.getElementById(`continue-btn-${topicId}`).disabled = true;
            updateProgress(topicId);
            return;
        } else if (quiz.missedWords.length === 0) {
            showFeedback(topicId, 'success', 'Chúc mừng! Bạn đã hoàn thành tất cả từ vựng.');
            document.getElementById(`quiz-term-${topicId}`).textContent = 'Hoàn thành!';
            document.getElementById(`quiz-input-${topicId}`).value = '';
            document.getElementById(`continue-btn-${topicId}`).disabled = true;
            updateProgress(topicId);
            return;
        }
    }

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * quiz.vocabularyData.length);
    } while (quiz.usedWords.includes(randomIndex));

    quiz.usedWords.push(randomIndex);
    quiz.currentWord = quiz.vocabularyData[randomIndex];
    quiz.showEnglish = Math.random() < 0.5;

    document.getElementById(`quiz-term-${topicId}`).textContent = quiz.showEnglish ? quiz.currentWord.english : quiz.currentWord.vietnamese;
    document.getElementById(`quiz-input-${topicId}`).value = '';
    document.getElementById(`feedback-${topicId}`).innerHTML = '';
    document.getElementById(`continue-btn-${topicId}`).disabled = false;
    updateProgress(topicId);
}

function validateAnswer(topicId) {
    const quiz = quizzes[topicId];
    const userAnswer = document.getElementById(`quiz-input-${topicId}`).value.trim().toLowerCase();
    const correctAnswer = quiz.showEnglish ? quiz.currentWord.vietnamese.toLowerCase() : quiz.currentWord.english.toLowerCase();

    if (userAnswer === '') {
        showFeedback(topicId, 'warning', 'Vui lòng nhập câu trả lời.');
        return;
    }

    if (userAnswer === correctAnswer) {
        showFeedback(topicId, 'success', 'Đúng! Chuyển sang từ tiếp theo.');
        setTimeout(() => loadNextWord(topicId), 1000);
    } else {
        showFeedback(topicId, 'danger', 'Sai! Câu trả lời đúng là: ' + correctAnswer + '. Từ này sẽ được ôn lại sau.');
        if (!quiz.missedWords.some(word => word.english === quiz.currentWord.english && word.vietnamese === quiz.currentWord.vietnamese)) {
            quiz.missedWords.push(quiz.currentWord);
        }
        setTimeout(() => loadNextWord(topicId), 2000);
    }
}

function showFeedback(topicId, type, message) {
    const feedbackDiv = document.getElementById(`feedback-${topicId}`);
    feedbackDiv.innerHTML = '<div class="alert alert-' + type + '" role="alert">' + message + '</div>';
}

function updateProgress(topicId) {
    const quiz = quizzes[topicId];
    const progress = document.getElementById(`progress-${topicId}`);
    if (quiz.isReviewMode) {
        progress.textContent = "Ôn lại: " + quiz.usedWords.length + "/" + quiz.vocabularyData.length + " từ sai";
    } else {
        progress.textContent = "Hoàn thành: " + quiz.usedWords.length + "/" + quiz.vocabularyData.length;
    }
}
