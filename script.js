
let currentSection = 1;
let timerInterval = null;
let timeRemaining = 20 * 60; 
let sectionAnswers = {
    1: {},
    2: {},
    3: {}
};
let completedSections = [];

const sectionQuestions = {
    1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    2: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
    3: [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]
};

const correctAnswers = {
    "1": "candlewax",
    "2": "synthetic",
    "3": "chemistry",
    "4": "novalak",
    "5": "fillers",
    "6": "hexa",
    "7": "raw",
    "8": "pressure",
    "9": ["B", "C"],
    "10": ["B", "C"],
    "11": "TRUE",
    "12": "FALSE",
    "13": "FALSE",
    "14": "FALSE",
    "15": "NOT GIVEN",
    "16": "TRUE",
    "17": "FALSE",
    "18": "TRUE",
    "19": "NOT GIVEN",
    "20": "TRUE",
    "21": "problem solving",
    "22": "temporal lobes",
    "23": "evaluating information",
    "24": "C",
    "25": "A",
    "26": "F",
    "27": "D",
    "28": "latin",
    "29": "doctors",
    "30": "technical vocabulary",
    "31": "grammatical resources",
    "32": "royal society",
    "33": "german",
    "34": "industrial revolution",
    "35": "NOT GIVEN",
    "36": "NO",
    "37": "YES",
    "38": "popular",
    "39": ["principia", "the principia", "newton's principia", "mathematical treatise"],
    "40": ["local", "more local", "local audience"]
};

document.addEventListener('DOMContentLoaded', () => {
    initializeSectionNavigation();
    initializeTimer();
    initializeHighlighting();
    showSection(1);
});

function initializeSectionNavigation() {
    const submitButtons = document.querySelectorAll('.section-submit-btn');
    submitButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = parseInt(btn.getAttribute('data-section'));
            handleSectionSubmit(section);
        });
    });
    
    const navButtons = document.querySelectorAll('.section-nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = parseInt(btn.getAttribute('data-section'));
            if (!btn.disabled) {
                showSection(section);
            }
        });
    });
}

function showSection(sectionNumber) {
    currentSection = sectionNumber;
    
    document.querySelectorAll('.section-content').forEach(el => {
        el.classList.add('hidden');
    });
    document.querySelectorAll('.section-questions').forEach(el => {
        el.classList.add('hidden');
    });
    
    document.querySelector(`.section-content[data-section="${sectionNumber}"]`).classList.remove('hidden');
    document.querySelector(`.section-questions[data-section="${sectionNumber}"]`).classList.remove('hidden');
    
    document.querySelectorAll('.section-nav-btn').forEach(btn => {
        const btnSection = parseInt(btn.getAttribute('data-section'));
        btn.classList.remove('active');
        if (btnSection === sectionNumber) {
            btn.classList.add('active');
        }
    });
    
    document.getElementById('readingPanel').scrollTop = 0;
    document.getElementById('questionsPanel').scrollTop = 0;
    
    resetTimer();
    startTimer();
}

function handleSectionSubmit(section) {
    saveCurrentSectionAnswers(section);
    
    stopTimer();
    
    if (!completedSections.includes(section)) {
        completedSections.push(section);
    }
    
    const navBtn = document.querySelector(`.section-nav-btn[data-section="${section}"]`);
    navBtn.classList.add('completed');
    
    showResultsModal(section);
}

function showResultsModal(section) {
    const modal = document.getElementById('resultsModal');
    const title = document.getElementById('resultsModalTitle');
    const scoreDisplay = document.getElementById('resultsScore');
    const answersList = document.getElementById('resultsAnswersList');
    const btnContinue = document.getElementById('btnContinue');
    
    title.textContent = `Результаты Секции ${section}`;
    
    const questions = sectionQuestions[section];
    const studentAnswers = sectionAnswers[section];
    
    let correctCount = 0;
    let answersHtml = '';
    
    questions.forEach(qNum => {
        const studentAnswer = studentAnswers[qNum] || '';
        const correctAnswer = getCorrectAnswer(qNum);
        const isCorrect = checkAnswer(studentAnswer, correctAnswer);
        
        if (isCorrect && studentAnswer) {
            correctCount++;
        }
        
        let statusClass = 'unanswered';
        if (studentAnswer) {
            statusClass = isCorrect ? 'correct' : 'incorrect';
        }
        
        const displayCorrectAnswer = Array.isArray(correctAnswer) 
            ? correctAnswer.join(' / ')
            : correctAnswer;
        
        answersHtml += `
            <div class="result-answer-item ${statusClass}">
                <span class="result-question-num">${qNum}</span>
                <span class="result-student-answer">${studentAnswer || 'Нет ответа'}</span>
                <span class="result-correct-answer">${displayCorrectAnswer}</span>
            </div>
        `;
    });
    
    scoreDisplay.textContent = `Правильных ответов: ${correctCount} из ${questions.length}`;
    
    answersList.innerHTML = answersHtml;
    
    btnContinue.onclick = () => {
        modal.classList.remove('visible');
        
        if (section < 3) {
            const nextNavBtn = document.querySelector(`.section-nav-btn[data-section="${section + 1}"]`);
            nextNavBtn.disabled = false;
            
            showSection(section + 1);
        } else {
            showFinalResults();
        }
    };
    
    modal.classList.add('visible');
}

function getCorrectAnswer(questionNum) {
    return correctAnswers[String(questionNum)] || '';
}

function checkAnswer(studentAnswer, correctAnswer) {
    if (!studentAnswer) return false;
    
    const normalizedStudent = studentAnswer.toString().toLowerCase().trim();
    
    if (Array.isArray(correctAnswer)) {
        return correctAnswer.some(ans => 
            normalizedStudent === ans.toString().toLowerCase().trim()
        );
    }
    
    return normalizedStudent === correctAnswer.toString().toLowerCase().trim();
}

function showFinalResults() {
    let totalCorrect = 0;
    let totalQuestions = 0;
    
    [1, 2, 3].forEach(section => {
        const questions = sectionQuestions[section];
        const studentAnswers = sectionAnswers[section];
        
        questions.forEach(qNum => {
            totalQuestions++;
            const studentAnswer = studentAnswers[qNum] || '';
            const correctAnswer = getCorrectAnswer(qNum);
            if (checkAnswer(studentAnswer, correctAnswer)) {
                totalCorrect++;
            }
        });
    });
    
    alert(`Тест завершён!\n\nОбщий результат: ${totalCorrect} из ${totalQuestions}\n\nСпасибо за прохождение теста IELTS Reading!`);
    console.log('All Section Answers:', sectionAnswers);
}

function saveCurrentSectionAnswers(section) {
    const answers = {};
    
    const sectionQuestions = document.querySelector(`.section-questions[data-section="${section}"]`);
    
    const textInputs = sectionQuestions.querySelectorAll('.answer-input');
    textInputs.forEach(input => {
        const question = input.getAttribute('data-question');
        const value = input.value.trim();
        if (value) {
            answers[question] = value;
        }
    });
    
    const selects = sectionQuestions.querySelectorAll('.answer-select');
    selects.forEach(select => {
        const question = select.getAttribute('data-question');
        const value = select.value;
        if (value) {
            answers[question] = value;
        }
    });
    
    const radios = sectionQuestions.querySelectorAll('input[type="radio"]:checked');
    radios.forEach(radio => {
        const question = radio.getAttribute('data-question');
        const value = radio.value;
        if (value) {
            answers[question] = value;
        }
    });
    
    sectionAnswers[section] = answers;
}

function initializeTimer() {
}

function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            handleTimerExpired();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function resetTimer() {
    stopTimer();
    timeRemaining = 20 * 60; 
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const timeText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    const timerElement = document.getElementById('timerDisplay');
    const timerText = document.getElementById('timerText');
    
    timerText.textContent = timeText;
    
    timerElement.classList.remove('warning', 'danger');
    if (timeRemaining <= 60) { 
        timerElement.classList.add('danger');
    } else if (timeRemaining <= 300) { 
        timerElement.classList.add('warning');
    }
}

function handleTimerExpired() {
    stopTimer();
    alert(`Time's up for Section ${currentSection}!\n\nYour section will be automatically submitted.`);
    handleSectionSubmit(currentSection);
}

const leftPanel = document.querySelector('.left-panel');
const rightPanel = document.querySelector('.right-panel');
const divider = document.querySelector('.split-divider');

if (divider && leftPanel && rightPanel) {
    let isResizing = false;
    
    divider.addEventListener('mousedown', () => {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const container = document.querySelector('.split-container');
        const containerRect = container.getBoundingClientRect();
        const newWidth = containerRect.right - e.clientX;
        const minWidth = 300;
        const maxWidth = containerRect.width - 400;
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
            const percentage = (newWidth / containerRect.width) * 100;
            rightPanel.style.width = percentage + '%';
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });
}

function initializeHighlighting() {
    const readingPanel = document.getElementById('readingPanel');
    const toolbar = document.getElementById('highlightToolbar');
    const highlightRedBtn = document.getElementById('highlightRed');
    const highlightRemoveBtn = document.getElementById('highlightRemove');
    
    let selectedRange = null;
    
    readingPanel.addEventListener('mouseup', (e) => {
        setTimeout(() => {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            
            if (selectedText && selection.rangeCount > 0) {
                selectedRange = selection.getRangeAt(0);
                
                const container = selectedRange.commonAncestorContainer;
                const isInReadingPanel = readingPanel.contains(container.nodeType === 3 ? container.parentNode : container);
                
                if (isInReadingPanel) {
                    const rect = selectedRange.getBoundingClientRect();
                    
                    let topPos = rect.top - 50;
                    let leftPos = rect.left + rect.width / 2;
                    
                    if (topPos < 10) {
                        topPos = rect.bottom + 10;
                    }
                    
                    if (leftPos < 60) leftPos = 60;
                    if (leftPos > window.innerWidth - 60) leftPos = window.innerWidth - 60;
                    
                    toolbar.style.left = `${leftPos}px`;
                    toolbar.style.top = `${topPos}px`;
                    
                    toolbar.classList.add('visible');
                } else {
                    hideToolbar();
                }
            } else {
                hideToolbar();
            }
        }, 10);
    });
    
    document.addEventListener('mousedown', (e) => {
        if (!toolbar.contains(e.target)) {
            if (!readingPanel.contains(e.target)) {
                hideToolbar();
            }
        }
    });
    
    highlightRedBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (selectedRange) {
            highlightSelection(selectedRange);
            hideToolbar();
        }
    });
    
    highlightRemoveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (selectedRange) {
            removeHighlightFromSelection(selectedRange);
            hideToolbar();
        }
    });
    
    function hideToolbar() {
        toolbar.classList.remove('visible');
        selectedRange = null;
    }
}

function highlightSelection(range) {
    const selection = window.getSelection();
    
    const textNodes = getTextNodesInRange(range);
    
    textNodes.forEach(({ node, start, end }) => {
        const text = node.textContent;
        const parent = node.parentNode;
        
        if (parent.classList && parent.classList.contains('highlighted-text')) {
            return;
        }
        
        const fragment = document.createDocumentFragment();
        
        if (start > 0) {
            fragment.appendChild(document.createTextNode(text.substring(0, start)));
        }
        
        const highlightSpan = document.createElement('span');
        highlightSpan.className = 'highlighted-text';
        highlightSpan.textContent = text.substring(start, end);
        fragment.appendChild(highlightSpan);
        
        if (end < text.length) {
            fragment.appendChild(document.createTextNode(text.substring(end)));
        }
        
        parent.replaceChild(fragment, node);
    });
    
    selection.removeAllRanges();
}

function getTextNodesInRange(range) {
    const textNodes = [];
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    
    if (startContainer === endContainer && startContainer.nodeType === Node.TEXT_NODE) {
        textNodes.push({
            node: startContainer,
            start: range.startOffset,
            end: range.endOffset
        });
        return textNodes;
    }
    
    const walker = document.createTreeWalker(
        range.commonAncestorContainer,
        NodeFilter.SHOW_TEXT,
        null
    );
    
    let inRange = false;
    let node;
    
    while (node = walker.nextNode()) {
        if (node === startContainer) {
            inRange = true;
            textNodes.push({
                node: node,
                start: range.startOffset,
                end: node.textContent.length
            });
        } else if (node === endContainer) {
            textNodes.push({
                node: node,
                start: 0,
                end: range.endOffset
            });
            break;
        } else if (inRange) {
            textNodes.push({
                node: node,
                start: 0,
                end: node.textContent.length
            });
        }
    }
    
    return textNodes;
}

function removeHighlightFromSelection(range) {
    const selection = window.getSelection();
    const commonAncestor = range.commonAncestorContainer;
    let container = commonAncestor.nodeType === 3 ? commonAncestor.parentElement : commonAncestor;
    
    const highlightsToRemove = [];
    
    const parentHighlight = container.closest('.highlighted-text');
    if (parentHighlight) {
        highlightsToRemove.push(parentHighlight);
    }
    
    const highlightedSpans = container.querySelectorAll('.highlighted-text');
    highlightedSpans.forEach(span => {
        if (range.intersectsNode(span)) {
            highlightsToRemove.push(span);
        }
    });
    
    highlightsToRemove.forEach(highlight => {
        const parent = highlight.parentNode;
        const text = highlight.textContent;
        const textNode = document.createTextNode(text);
        parent.replaceChild(textNode, highlight);
        parent.normalize();
    });
    
    selection.removeAllRanges();
}
