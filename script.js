

function StartGame() {
    const username = document.getElementById('username').value;
    if (username) {
        showNotification(`Xin chào, ${username}! Hãy cùng thử thách trí tuệ nào!`);
        // Chuyển đến màn hình chọn level
        ClickStart(); // Thêm dòng này để khi start thành công sẽ chuyển sang màn hình level
    } else {
        showNotification('Vui lòng nhập tên :<');
    }
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    notificationMessage.innerText = message;
    notification.classList.remove('hidden');
}


function closeNotification() {
    const notification = document.getElementById('notification');
    notification.classList.add('hidden');
}

function OnStart() {
    // Ẩn tất cả các màn hình (các phần tử có class 'screen')
    var screenElements = document.getElementsByClassName('screen');
    for (var i = 0; i < screenElements.length; i++) {
        screenElements[i].style.display = 'none';
    }
    
    // Hiển thị màn hình start (có id 'startscreen')
    var startScreenElement = document.getElementById('startscreen');
    startScreenElement.style.display = 'block';
}

function ClickStart() {
    // Ẩn tất cả các màn hình (các phần tử có class 'screen')
    var screenElements = document.getElementsByClassName('screen');
    for (var i = 0; i < screenElements.length; i++) {
        screenElements[i].style.display = 'none';
    }
    
    // Hiển thị màn hình level (có id 'levelscreen')
    var levelScreenElement = document.getElementById('levelscreen');
    levelScreenElement.style.display = 'block';
}

function showGameScreen() {
    document.querySelectorAll('.screen').forEach(screen => screen.style.display = 'none');
    document.getElementById('gamescreen').style.display = 'block';
}

const BASE_URL = "https://api4interns.vercel.app/api/v1/questions";
let questions = [];
let currentQuestionIndex = 0;
let countdownInterval;
let QUESTION_TIME_LIMIT = 30; // Thời gian mặc định là hard (30 giây)
let answered = false; // Biến cờ để kiểm tra đã trả lời câu hỏi hiện tại hay chưa
let correctCount = 0;
let incorrectCount = 0;

const questionElement = document.getElementById('question');
const answersElement = document.getElementById('answers');
const nextButton = document.getElementById('next-btn');
const stopButton = document.getElementById('stop-btn');

function chooseLevel(level) {
    switch (level) {
        case 'easy':
            QUESTION_TIME_LIMIT = 30;
            break;
        case 'medium':
            QUESTION_TIME_LIMIT = 20;
            break;
        case 'hard':
            QUESTION_TIME_LIMIT = 10;
            break;
        default:
            QUESTION_TIME_LIMIT = 30; // Mặc định là hard nếu không có level hợp lệ
            break;
    }
    fetchQuestions();
}

async function fetchQuestions() {
    try {
        const response = await fetch(BASE_URL);
        const data = await response.json();
        if (data.status) {
            questions = data.data;
            currentQuestionIndex = 0;
            showGameScreen();
            loadNextQuestion();
        } else {
            showNotification('Không thể tải câu hỏi!');
        }
    } catch (error) {
        console.error('Error fetching questions:', error);
        showNotification('Lỗi kết nối với API!');
    }
}

function displayQuestion(questionData) {
    questionElement.innerText = questionData.question;
    answersElement.innerHTML = '';

    questionData.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer;
        button.classList.add('answer');
        button.onclick = () => selectAnswer(button, answer, questionData.correctAnswer);
        answersElement.appendChild(button);
    });
}

function startCountdown() {
    let timeLeft = QUESTION_TIME_LIMIT;
    const timerElement = document.getElementById('timer');

    function updateTimer() {
        timerElement.innerText = `Thời gian còn lại: ${timeLeft} giây`;
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            showNotification('Bạn đã hết thời gian trả lời câu hỏi!');
        } else {
            timeLeft--;
        }
    }
    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
}

function selectAnswer(button, selectedAnswer, correctAnswer) {

    clearInterval(countdownInterval);
    const answers = document.querySelectorAll('#answers button');
    answers.forEach(btn => btn.disabled = true); // Vô hiệu hóa tất cả các nút sau khi chọn
    button.classList.add('selected');
    answered = true; // Đã trả lời câu hỏi hiện tại
    setTimeout(() => {
        if (selectedAnswer === correctAnswer) {
            button.classList.add('correct');
            nextButton.disabled = false;
            nextButton.addEventListener('click', handleNextButtonClick);
            correctCount++;
        } else {
            button.classList.add('incorrect');
            incorrectCount++;
            nextButton.disabled = false;
            nextButton.addEventListener('click', handleNextButtonClick);
            answers.forEach(btn => {
                if (btn.innerText === correctAnswer) btn.classList.add('correct');
            });
        }
         button.classList.remove('selected');
    }, 2000);
}

function loadNextQuestion() {
    clearInterval(countdownInterval);
    if (currentQuestionIndex < questions.length) {
        const questionData = questions[currentQuestionIndex];
        displayQuestion(questionData);
        answered = false; // Reset biến cờ khi load câu hỏi mới
        startCountdown(); // Bắt đầu đếm ngược cho câu hỏi mới
        // Bật nút "Câu tiếp theo" và gán sự kiện click
        nextButton.disabled = true;
    } else {
        // Ẩn màn hình game
        document.getElementById('gamescreen').style.display = 'none';
        // Hiển thị màn hình kết quả
        const resultScreen = document.getElementById('resultScreen');
        resultScreen.style.display = 'flex'; // Hiển thị màn hình kết quả
        
        // Hiển thị kết quả số liệu
        document.getElementById('correctCount').innerText = `Số câu đúng: ${correctCount}`;
        document.getElementById('incorrectCount').innerText = `Số câu sai: ${incorrectCount}`;
        // Vẽ biểu đồ tròn
        drawPieChart(correctCount, incorrectCount);
    }
}


function stopGame() {
    clearInterval(countdownInterval);
    showNotification('Bạn đã dừng cuộc chơi!');
}

function handleNextButtonClick() {
    // Xóa các lớp CSS và enable lại các nút đáp án trước khi load câu hỏi mới
    const answers = document.querySelectorAll('#answers button');
    answers.forEach(btn => {
        btn.classList.remove('correct', 'incorrect');
        btn.disabled = false;
    });
    currentQuestionIndex++;
    loadNextQuestion();
    nextButton.disabled = true; // Vô hiệu hóa nút sau khi chuyển câu hỏi
}

function restartGame() {
    // Ẩn tất cả các màn hình (các phần tử có class 'screen')
    var screenElements = document.getElementsByClassName('screen');
    for (var i = 0; i < screenElements.length; i++) {
        screenElements[i].style.display = 'none';
    }
    // Hiển thị màn hình level (có id 'levelscreen')
    var levelScreenElement = document.getElementById('levelscreen');
    levelScreenElement.style.display = 'block';
    currentQuestionIndex = 0;
    correctCount = 0;
    incorrectCount = 0;
}

function drawPieChart(correctCount, incorrectCount) {
    const resultCanvas = document.getElementById('resultChart').getContext('2d');
    
    new Chart(resultCanvas, {
        type: 'pie',
        data: {
            labels: ['Số câu đúng', 'Số câu sai'],
            datasets: [{
                label: 'Kết quả',
                data: [correctCount, incorrectCount],
                backgroundColor: ['#4CAF50', '#F44336'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.label + ': ' + tooltipItem.raw.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}