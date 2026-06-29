// Vocabulary Quiz Functionality
// Initialization is triggered from index.html after DOM elements are created

let quizzes = {}; // Object to store quiz data for each topic
// Success sound will be created dynamically each time to avoid state issues
let isAudioInitialized = false; // Flag to track if audio has been initialized after user interaction
let successSoundInitialized = null; // Holder for initialized audio object
let wrongSoundInitialized = null; // Holder for initialized wrong audio object

function normalizeText(text) {
    if (typeof text !== 'string') return '';

    // Remove diacritics, keep letters/numbers and normalize spacing
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

function getAnswerOptions(text) {
    const cleanedText = text.replace(/\([^)]*\)/g, ' ');
    return cleanedText
        .split(/[,\/]/)
        .map(option => normalizeText(option))
        .filter(option => option.length > 0);
}

function initializeQuizzes() {
    const savedTopicId = localStorage.getItem('activeTopicId');
    const initialTopicId = topics.some(topic => topic.id === savedTopicId) ? savedTopicId : topics[0].id;
    topics.forEach(topic => {
        quizzes[topic.id] = {
            vocabularyData: [],
            fullVocabularyData: [], // Store the complete dataset
            usedWords: [],
            missedWords: [],
            currentWord: null,
            answerMode: 'english',
            isReviewMode: false,
            isInitialized: false,
            currentSegment: 'all' // Default to loading all da
        };
        
        // Add event listener for first user interaction to initialize audio
        const initAudioOnInteraction = () => {
            if (!isAudioInitialized) {
                successSoundInitialized = new Audio('assets/sound/success.wav');
                wrongSoundInitialized = new Audio('assets/sound/wrong2.mp3');
                isAudioInitialized = true;
                // Remove the event listener after initialization
                document.removeEventListener('click', initAudioOnInteraction);
            }
        };
        document.addEventListener('click', initAudioOnInteraction);
        
        // Load vocabulary data for this topic
        fetch(`vocabulary/${topic.fileName}`)
            .then(response => response.json())
            .then(data => {
                quizzes[topic.id].fullVocabularyData = data;
                quizzes[topic.id].vocabularyData = data; // Initially load all data
                quizzes[topic.id].isInitialized = true;
                createSegmentButtons(topic.id, data.length);
                if (topic.id === initialTopicId) {
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
        document.querySelectorAll(`input[name="quiz-mode-${topic.id}"]`).forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    quizzes[topic.id].answerMode = radio.value;
                    updateQuizPrompt(topic.id);
                }
            });
        });
    });
    
    // Add event listener for tab changes to load quiz data for the selected topic
    document.getElementById('topicSidebar').addEventListener('click', function(e) {
        if (e.target.classList.contains('nav-link')) {
            const topicId = e.target.id.split('-')[0];
            localStorage.setItem('activeTopicId', topicId);
            if (quizzes[topicId] && quizzes[topicId].isInitialized && quizzes[topicId].usedWords.length === 0) {
                loadNextWord(topicId);
            }
        }
    });
}

// Function to create segment buttons based on vocabulary length
function createSegmentButtons(topicId, dataLength) {
    const segmentContainer = document.getElementById(`segment-buttons-${topicId}`);
    segmentContainer.innerHTML = ''; // Clear any existing buttons

    // Create "Tất cả" button (default active)
    const allButton = document.createElement('button');
    allButton.type = 'button';
    allButton.className = 'btn btn-outline-primary active';
    allButton.textContent = 'Tất cả';
    allButton.onclick = () => loadSegment(topicId, 'all');
    segmentContainer.appendChild(allButton);

    // Calculate number of segments (10 words per segment)
    const segmentSize = 10;
    const numSegments = Math.ceil(dataLength / segmentSize);
    
    // Create buttons for each segment
    for (let i = 0; i < numSegments; i++) {
        const start = i * segmentSize + 1;
        const end = Math.min((i + 1) * segmentSize, dataLength);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-outline-primary';
        button.textContent = `${start} - ${end}`;
        button.onclick = () => loadSegment(topicId, i);
        segmentContainer.appendChild(button);
    }
}

// Function to load a specific segment of vocabulary data
function loadSegment(topicId, segmentIndex) {
    const quiz = quizzes[topicId];
    quiz.currentSegment = segmentIndex;
    quiz.usedWords = [];
    quiz.missedWords = [];
    quiz.isReviewMode = false;

    // Reset to full data if "all" is selected
    if (segmentIndex === 'all') {
        quiz.vocabularyData = quiz.fullVocabularyData;
    } else {
        // Load specific segment (10 words per segment)
        const segmentSize = 10;
        const startIndex = segmentIndex * segmentSize;
        const endIndex = Math.min(startIndex + segmentSize, quiz.fullVocabularyData.length);
        quiz.vocabularyData = quiz.fullVocabularyData.slice(startIndex, endIndex);
    }

    // Update active button
    const segmentContainer = document.getElementById(`segment-buttons-${topicId}`);
    const buttons = segmentContainer.getElementsByTagName('button');
    for (let button of buttons) {
        button.classList.remove('active');
    }
    if (segmentIndex === 'all') {
        buttons[0].classList.add('active');
    } else {
        buttons[segmentIndex + 1].classList.add('active');
    }

    loadNextWord(topicId);
}

function updateQuizPrompt(topicId) {
    const quiz = quizzes[topicId];
    const isEnglishMode = quiz.answerMode === 'english';
    const instruction = document.getElementById(`quiz-instruction-${topicId}`);
    const answerLabel = document.getElementById(`quiz-answer-label-${topicId}`);
    const input = document.getElementById(`quiz-input-${topicId}`);

    if (instruction) {
        instruction.textContent = isEnglishMode ? 'Dịch từ sau sang tiếng Anh:' : 'Dịch từ sau sang tiếng Việt:';
    }
    if (answerLabel) {
        answerLabel.textContent = isEnglishMode ? 'Câu trả lời của bạn (tiếng Anh):' : 'Câu trả lời của bạn (tiếng Việt):';
    }
    if (input) {
        input.placeholder = isEnglishMode ? 'Nhập nghĩa tiếng Anh' : 'Nhập nghĩa tiếng Việt';
    }

    if (quiz.currentWord) {
        document.getElementById(`quiz-term-${topicId}`).textContent = isEnglishMode ? quiz.currentWord.vietnamese : quiz.currentWord.english;
    }
}

function playPronunciation(topicId) {
    const currentWord = quizzes[topicId].currentWord;
    if (currentWord) {
        const utterance = new SpeechSynthesisUtterance(currentWord.english);
        utterance.lang = 'en-US';

        // Try to pick a preferred voice and set rate/pitch for consistency
        const preferred = getPreferredVoice();
        if (preferred) utterance.voice = preferred;
        utterance.rate = 0.95;
        utterance.pitch = 1;

        window.speechSynthesis.speak(utterance);
    }
}

// Best-effort selection of a preferred voice from available voices.
function getPreferredVoice() {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;

    // Try stored preference first
    const stored = localStorage.getItem('preferredVoiceName');
    if (stored) {
        const found = voices.find(v => v.name === stored);
        if (found) return found;
    }

    const preferredNames = [
        'Google US English',
        'Google UK English Male',
        'Google UK English Female',
        'Microsoft Zira',
        'Samantha',
        'Alex',
        'Daniel'
    ];

    for (const name of preferredNames) {
        const v = voices.find(voice => voice.name && voice.name.includes(name));
        if (v) return v;
    }

    // Fallback to any English voice
    const en = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en'));
    return en || voices[0];
}

// Play a feedback sound (Audio element) then pronounce the current English word,
// and after pronunciation finishes, load the next word. If `audioEl` is null
// the function will immediately pronounce then proceed.
function proceedAfterFeedback(topicId, audioEl) {
    const quiz = quizzes[topicId];

    const pronounceAndNext = () => {
        if (!quiz || !quiz.currentWord) {
            // fallback: move to next immediately
            loadNextWord(topicId);
            return;
        }
        const utterance = new SpeechSynthesisUtterance(quiz.currentWord.english);
        utterance.lang = 'en-US';
        const preferred = getPreferredVoice();
        if (preferred) utterance.voice = preferred;
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.onend = () => {
            loadNextWord(topicId);
        };
        // If speak throws or is not available, fallback to next after 1.5s
        try {
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.error('Speech synthesis failed:', e);
            setTimeout(() => loadNextWord(topicId), 1500);
        }
    };

    if (audioEl) {
        // Listen for audio end; if it errors, fallback to pronounce immediately
        const onEnded = () => {
            audioEl.removeEventListener('ended', onEnded);
            pronounceAndNext();
        };
        audioEl.addEventListener('ended', onEnded);
        const playPromise = audioEl.play();
        if (playPromise && playPromise.catch) {
            playPromise.catch(err => {
                console.error('Audio play failed:', err);
                audioEl.removeEventListener('ended', onEnded);
                pronounceAndNext();
            });
        }
    } else {
        pronounceAndNext();
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
        } else {
            // Show completion message
            if (quiz.isReviewMode) {
                showFeedback(topicId, 'success', 'Chúc mừng! Bạn đã hoàn thành tất cả từ vựng, kể cả các từ ôn lại.');
            } else {
                showFeedback(topicId, 'success', 'Chúc mừng! Bạn đã hoàn thành tất cả từ vựng.');
            }
            document.getElementById(`quiz-term-${topicId}`).textContent = 'Hoàn thành!';
            document.getElementById(`quiz-input-${topicId}`).value = '';
            document.getElementById(`continue-btn-${topicId}`).disabled = true;
            updateProgress(topicId);

            // Always show 'Ôn lại từ đầu' button
            let feedbackArea = document.getElementById(`feedback-${topicId}`);
            let startOverButton = document.createElement('button');
            startOverButton.className = 'btn btn-primary mt-2';
            startOverButton.textContent = 'Ôn lại từ đầu';
            startOverButton.id = `start-over-btn-${topicId}`;
            startOverButton.onclick = () => {
                // Re-fetch the original data from the file to ensure all words are included
                fetch(`vocabulary/${topics.find(t => t.id === topicId).fileName}`)
                    .then(response => response.json())
                    .then(data => {
                        quiz.usedWords = [];
                        quiz.missedWords = [];
                        quiz.isReviewMode = false;
                        quiz.vocabularyData = data; // Reset to freshly loaded data
                        document.getElementById(`continue-btn-${topicId}`).disabled = false;
                        feedbackArea.innerHTML = ''; // Clear buttons
                        loadNextWord(topicId);
                    })
                    .catch(error => {
                        console.error(`Error reloading vocabulary data for ${topicId}:`, error);
                        showFeedback(topicId, 'danger', 'Có lỗi khi tải lại dữ liệu. Vui lòng thử lại.');
                    });
            };
            feedbackArea.appendChild(startOverButton);

            // Show 'Ôn lại các từ sai' button only if there are missed words in history
            // Store original missed words if needed
            if (!quiz.hasOwnProperty('originalMissedWords')) {
                quiz.originalMissedWords = quiz.missedWords.slice();
            }
            if (quiz.originalMissedWords.length > 0) {
                let reviewMissedButton = document.createElement('button');
                reviewMissedButton.className = 'btn btn-warning mt-2';
                reviewMissedButton.style.marginLeft = '12px'; // Set explicit margin for spacing
                reviewMissedButton.textContent = 'Ôn lại các từ sai';
                reviewMissedButton.id = `review-missed-btn-${topicId}`;
                reviewMissedButton.onclick = () => {
                    quiz.usedWords = [];
                    quiz.vocabularyData = quiz.originalMissedWords.slice();
                    quiz.isReviewMode = true;
                    document.getElementById(`continue-btn-${topicId}`).disabled = false;
                    feedbackArea.innerHTML = ''; // Clear buttons
                    loadNextWord(topicId);
                };
                feedbackArea.appendChild(reviewMissedButton);
            }
            return;
        }
    }

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * quiz.vocabularyData.length);
    } while (quiz.usedWords.includes(randomIndex));

    quiz.usedWords.push(randomIndex);
    quiz.currentWord = quiz.vocabularyData[randomIndex];

    updateQuizPrompt(topicId);
    document.getElementById(`quiz-input-${topicId}`).value = '';
    document.getElementById(`feedback-${topicId}`).innerHTML = '';
    document.getElementById(`continue-btn-${topicId}`).disabled = false;
    updateProgress(topicId);
}

function validateAnswer(topicId) {
    const quiz = quizzes[topicId];
    const rawAnswer = document.getElementById(`quiz-input-${topicId}`).value;
    const userAnswer = normalizeText(rawAnswer);

    if (userAnswer === '') {
        showFeedback(topicId, 'warning', 'Vui lòng nhập câu trả lời.');
        setTimeout(() => {
            document.getElementById(`feedback-${topicId}`).innerHTML = '';
        }, 3000);
        return;
    }

    const expectedAnswers = getAnswerOptions(quiz.answerMode === 'english' ? quiz.currentWord.english : quiz.currentWord.vietnamese);
    const displayAnswer = quiz.answerMode === 'english' ? quiz.currentWord.english : quiz.currentWord.vietnamese;

    if (expectedAnswers.includes(userAnswer)) {
        showFeedback(topicId, 'success', 'Đúng! (' + displayAnswer + ') Chuyển sang từ tiếp theo.');
        document.getElementById(`continue-btn-${topicId}`).disabled = true;
        let successAudioEl = (isAudioInitialized && successSoundInitialized) ? successSoundInitialized : new Audio('assets/sound/success.wav');
        proceedAfterFeedback(topicId, successAudioEl);
    } else {
        showFeedback(topicId, 'danger', 'Sai! Câu trả lời đúng là: ' + displayAnswer + '. Từ này sẽ được ôn lại sau.');
        if (!quiz.missedWords.some(word => word.english === quiz.currentWord.english && word.vietnamese === quiz.currentWord.vietnamese)) {
            quiz.missedWords.push(quiz.currentWord);
        }
        document.getElementById(`continue-btn-${topicId}`).disabled = true;
        let wrongAudioEl = (isAudioInitialized && wrongSoundInitialized) ? wrongSoundInitialized : new Audio('assets/sound/wrong2.mp3');
        proceedAfterFeedback(topicId, wrongAudioEl);
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
