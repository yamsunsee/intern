
//Hàm setup notification cho ô nhập tên
function StartGame() {
    const username = document.getElementById('username').value;
    if (username) {
        showNotification(`Xin chào, ${username}! Hãy cùng thử thách trí tuệ nào!`);
        ClickStart(); 
    } else {
        showNotification('Vui lòng nhập tên :<');
    }
}

//Hàm hiện notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    notificationMessage.innerText = message;
    notification.classList.remove('hidden');
}

//Hàm đóng notification 
function closeNotification() {
    const notification = document.getElementById('notification');
    notification.classList.add('hidden');
    const notificationButton = document.querySelector('.notification button');
    notificationButton.onclick = closeNotification; 
}

//Hiển thị startscreen khi vừa bắt đầu
function OnStart() {
    var screenElements = document.getElementsByClassName('screen');
    for (var i = 0; i < screenElements.length; i++) {
        screenElements[i].style.display = 'none';
    }
    var startScreenElement = document.getElementById('startscreen');
    startScreenElement.style.display = 'block';
}

//Hàm hiển thị levelscreen
function ClickStart() {
    var screenElements = document.getElementsByClassName('screen');
    for (var i = 0; i < screenElements.length; i++) {
        screenElements[i].style.display = 'none';
    }
    var levelScreenElement = document.getElementById('levelscreen');
    levelScreenElement.style.display = 'block';
}

//Hàm hiển thị gamescreen
function showGameScreen() {
    document.querySelectorAll('.screen').forEach(screen => screen.style.display = 'none');
    document.getElementById('gamescreen').style.display = 'block';
}

const BASE_URL = "https://api4interns.vercel.app/api/v1/questions";
let questions = []; //Câu hỏi
let totalQuestions = 0;
let currentQuestionIndex = 1; //Chỉ số câu hỏi
let countdownInterval; //Đếm thời gian cho từng câu hỏi
let QUESTION_TIME_LIMIT = 30; // Thời gian mặc định là hard (30 giây)
let answered = false; // Biến cờ để kiểm tra đã trả lời câu hỏi hiện tại hay chưa
let correctCount = 0; //Số câu đúng
let incorrectCount = 0; //Số câu sai
let notanswerCount = 0; //Số câu chưa trả lời

const questionElement = document.getElementById('question');
const answersElement = document.getElementById('answers');
const nextButton = document.getElementById('next-btn');
const stopButton = document.getElementById('stop-btn');


const cauhoi = [
    "Câu hỏi số 1", "Câu hỏi số 2", "Câu hỏi số 3", "Câu hỏi số 4", "Câu hỏi số 5",
    "Câu hỏi số 6", "Câu hỏi số 7", "Câu hỏi số 8", "Câu hỏi số 9", "Câu hỏi số 10", "Câu hỏi số 11",
    "Câu hỏi số 12","Câu hỏi số 13","Câu hỏi số 14", "Câu hỏi số 15", "Câu hỏi số 16","Câu hỏi số 17",
    "Câu hỏi số 18","Câu hỏi số 19","Câu hỏi số 20"
];

const tienthuong = [
    "1.000.000", "2.000.000", "3.000.000", "4.000.000", "5.000.000",
    "6.000.000", "7.000.000", "8.000.000", "9.000.000", "10.000.000",
    "11.000.000", "12.000.000", "13.000.000", "14.000.000", "15.000.000", "16.000.000",
    "17.000.000", "18.000.000", "19.000.000", "20.000.000"
];

let infoTable = document.getElementById('info-table');

for (let i = 0; i < cauhoi.length; i++) {
    let row = document.createElement('tr'); 
    let cauhoiCell = document.createElement('td');
    cauhoiCell.textContent = cauhoi[i];
    row.appendChild(cauhoiCell); 
    let tienthuongCell = document.createElement('td');
    tienthuongCell.textContent = tienthuong[i];
    row.appendChild(tienthuongCell); 
    row.id = `row${i + 1}`;
    infoTable.appendChild(row);
}

// Hàm xử lý thêm lớp moneycurrent cho hàng hiện tại và loại bỏ lớp khỏi hàng trước đó
function handleAnswer(currentQuestionIndex) {
    var previousIndex = currentQuestionIndex - 1;
    var currentRow = document.getElementById(`row${currentQuestionIndex}`);
    var previousRow = document.getElementById(`row${previousIndex}`);

    if (currentRow) {
        currentRow.classList.add('moneycurrent');
    }
    if (previousRow) {
        previousRow.classList.remove('moneycurrent');
    }
}   


//Hàm chọn level và set thời gian đếm ngược theo level
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
            QUESTION_TIME_LIMIT = 30; 
            break;
    }
    fetchQuestions();
}

//Lấy data API
async function fetchQuestions() {
    try {
        const response = await fetch(BASE_URL);
        const data = await response.json();
        if (data.status) {
            questions = data.data;
            shuffleQuestions();
            currentQuestionIndex = 0;
            showGameScreen();
            loadNextQuestion();
            handleAnswer(1);
        } else {
            showNotification('Không thể tải câu hỏi!');
        }
    } catch (error) {
        console.error('Error fetching questions:', error);
        showNotification('Lỗi kết nối với API!');
    }
}

function shuffleQuestions() {
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
}

//Hàm hiển thị câu hỏi và các câu trả lời
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

//Hàm đếm ngược
function startCountdown() {
    let timeLeft = QUESTION_TIME_LIMIT;
    const timerElement = document.getElementById('timer');
    function updateTimer() {
        timerElement.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            showNotification('Bạn đã hết thời gian trả lời câu hỏi!');
            const answers = document.querySelectorAll('#answers button');
            answers.forEach(btn => {
                btn.disabled = true;
                nextButton.disabled = true;
                stopButton.disabled = true;
            });
            const notificationButton = document.querySelector('.notification button');
            notificationButton.onclick = function() {
                closeNotification();
                showResultScreen();
            };
        } else {
            timeLeft--;
        }
    }
    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
}

//Hàm xử lý khi chọn câu trả lời
function selectAnswer(button, selectedAnswer, correctAnswer) {
    clearInterval(countdownInterval); 
    const answers = document.querySelectorAll('#answers button');
    answers.forEach(btn => btn.disabled = true);
    button.classList.add('selected');
    answered = true; 
    setTimeout(() => {
        if (selectedAnswer === correctAnswer) {
            button.classList.add('correct');
            nextButton.disabled = false;
            stopButton.disabled = false;
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
            button.classList.remove('selected');
            showNotification('Bạn đã thua cuộc!');
            const notificationButton = document.querySelector('.notification button');
            notificationButton.onclick = function() {
                closeNotification();
                showResultScreen();
            };
            nextButton.disabled = true;
            stopButton.disabled = true;
        }

         
    }, 2000);
}

//Hàm chức năng button "Câu tiếp theo"
function loadNextQuestion() {
    clearInterval(countdownInterval);
    if (currentQuestionIndex < questions.length) {
        const questionData = questions[currentQuestionIndex];
        displayQuestion(questionData);
        answered = false; 
        startCountdown(); 
        nextButton.disabled = true;
        stopButton.disabled = true;
    } else {
        showNotification('Bạn đã hoàn thành trò chơi!');
        const notificationButton = document.querySelector('.notification button');
        notificationButton.onclick = function() {
            closeNotification();
            showResultScreen();
        };
    }
    handleAnswer(currentQuestionIndex+1);
}

// Đoạn mã sẽ được đặt sau khi xử lý câu trả lời của người dùng, để cập nhật số tiền nhận được
function updateTienThuong(correctCount,incorrectCount) {
    console.log(`Câu hỏi hiện tại: ${correctCount}`);
    let tienThuongElement = document.getElementById('tienthuongnhanduoc');
    if (tienThuongElement) {
        if (incorrectCount == 1) {
            tienThuongElement.textContent = `Số tiền bạn nhận được: 0đ`;
        }
        else{
            if (correctCount == 0) {
                tienThuongElement.textContent = `Số tiền bạn nhận được: 0đ`;
            } else {
                tienThuongElement.textContent = `Số tiền bạn nhận được: ${tienthuong[correctCount-1]}`;
            }
        }
    }
}

//Hàm hiển thị resultScreen
function showResultScreen()
{
    updateTienThuong(correctCount, incorrectCount);
    const totalQuestions = questions.length;    
    const notanswerCount = totalQuestions - correctCount - incorrectCount;
    document.getElementById('gamescreen').style.display = 'none';
    const resultScreen = document.getElementById('resultScreen');
    resultScreen.style.display = 'flex';
    document.getElementById('correctCount').innerText = `Số câu đúng: ${correctCount}`;
    document.getElementById('incorrectCount').innerText = `Số câu sai: ${incorrectCount}`;
    document.getElementById('notanswerCount').innerText = `Số câu chưa làm: ${notanswerCount}`;
    drawPieChart(correctCount, incorrectCount, notanswerCount);
}


//Hàm xử lý khi click button "Câu tiếp theo"
function handleNextButtonClick() {
    currentQuestionIndex++;
    const totalQuestions = questions.length;
    console.log(`Tổng số câu hỏi: ${totalQuestions}`);
    console.log(`Câu hỏi hiện tại: ${currentQuestionIndex}`);
    const answers = document.querySelectorAll('#answers button');
    answers.forEach(btn => {
        if (currentQuestionIndex < totalQuestions) {
            btn.classList.remove('correct', 'incorrect');
            btn.disabled = false;
        }
        else 
        {btn.disabled = true;}
    });
    loadNextQuestion();
    nextButton.disabled = true;
}

//Hàm xử lý button "Dừng cuộc chơi"
function stopGame() {
    clearInterval(countdownInterval);
    showNotification('Bạn đã dừng cuộc chơi!');
    const notificationButton = document.querySelector('.notification button');
    notificationButton.onclick = function() {
        closeNotification();
        showResultScreen();
    };
}


//Hàm xử lý button "Chơi lại"
function restartGame() {
    var screenElements = document.getElementsByClassName('screen');
    for (var i = 0; i < screenElements.length; i++) {
        screenElements[i].style.display = 'none';
    }
    var levelScreenElement = document.getElementById('levelscreen');
    levelScreenElement.style.display = 'block';
    currentQuestionIndex = 0;  
    correctCount = 0;
    incorrectCount = 0;
    notanswerCount = 0;
    var infoTableRows = document.querySelectorAll('#info-table tr');
    infoTableRows.forEach(function(row) {
        row.classList.remove('moneycurrent');
    });
}

//Hàm vẽ biểu đồ tròn
function drawPieChart(correctCount, incorrectCount, notanswerCount) {
    const resultCanvas = document.getElementById('resultChart').getContext('2d');
    new Chart(resultCanvas, {
        type: 'pie',
        data: {
            labels: ['Số câu đúng', 'Số câu sai', 'Số câu chưa làm'],
            datasets: [{
                label: 'Kết quả',
                data: [correctCount, incorrectCount, notanswerCount],
                backgroundColor: ['#4CAF50', '#F44336', '#FFC107'],
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