
//Hàm setup notification cho ô nhập tên
function start_game() {
    const name = document.getElementById('name').value;
    if (name) {
        show_notification(`Xin chào, ${name}! Hãy cùng thử thách trí tuệ nào!`);
        click_start(); 
    } else {
        show_notification('Vui lòng nhập tên!');
    }
}

//Hàm hiện notification
function show_notification(message) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification_message');
    notificationMessage.innerText = message;
    notification.classList.remove('hidden');
}

//Hàm đóng notification 
function close_notification() {
    const notification = document.getElementById('notification');
    notification.classList.add('hidden');
    const notificationButton = document.querySelector('.notification button');
    notificationButton.onclick = close_notification; 
}

//Hiển thị start_screen khi vừa bắt đầu
function on_start() {
    var screenElements = document.getElementsByClassName('screen');
    for (var i = 0; i < screenElements.length; i++) {
        screenElements[i].style.display = 'none';
    }
    var start_screenElement = document.getElementById('start_screen');
    start_screenElement.style.display = 'block';
}

//Hàm hiển thị level_screen
function click_start() {
    var screenElements = document.getElementsByClassName('screen');
    for (var i = 0; i < screenElements.length; i++) {
        screenElements[i].style.display = 'none';
    }
    var level_screenElement = document.getElementById('level_screen');
    level_screenElement.style.display = 'block';
}

//Hàm hiển thị game_screen
function show_game_screen() {
    document.querySelectorAll('.screen').forEach(screen => screen.style.display = 'none');
    document.getElementById('game_screen').style.display = 'block';
}

const BASE_URL = "https://api4interns.vercel.app/api/v1/questions";
let questions = []; //Câu hỏi
let total_questions = 0;
let current_question_index = 1; //Chỉ số câu hỏi
let countdown_interval; //Đếm thời gian cho từng câu hỏi
let question_time_limit = 30; // Thời gian mặc định là hard (30 giây)
let answered = false; // Biến cờ để kiểm tra đã trả lời câu hỏi hiện tại hay chưa
let correct_count = 0; //Số câu đúng
let incorrect_count = 0; //Số câu sai
let notanswer_count = 0; //Số câu chưa trả lời

const questionElement = document.getElementById('question');
const answersElement = document.getElementById('answers');
const next_button = document.getElementById('next_btn');
const stop_button = document.getElementById('stop_btn');
const call_button = document.getElementById('goi_btn');



const question_award = [
    "Câu hỏi số 1", "Câu hỏi số 2", "Câu hỏi số 3", "Câu hỏi số 4", "Câu hỏi số 5",
    "Câu hỏi số 6", "Câu hỏi số 7", "Câu hỏi số 8", "Câu hỏi số 9", "Câu hỏi số 10", "Câu hỏi số 11",
    "Câu hỏi số 12","Câu hỏi số 13","Câu hỏi số 14", "Câu hỏi số 15", "Câu hỏi số 16","Câu hỏi số 17",
    "Câu hỏi số 18","Câu hỏi số 19","Câu hỏi số 20"
];

const get_money_award = [
    "1.000.000", "2.000.000", "3.000.000", "4.000.000", "5.000.000",
    "6.000.000", "7.000.000", "8.000.000", "9.000.000", "10.000.000",
    "11.000.000", "12.000.000", "13.000.000", "14.000.000", "15.000.000", "16.000.000",
    "17.000.000", "18.000.000", "19.000.000", "20.000.000"
];

let info_table = document.getElementById('info_table');

for (let i = 0; i < question_award.length; i++) {
    let row = document.createElement('tr'); 
    let question_awardCell = document.createElement('td');
    question_awardCell.textContent = question_award[i];
    row.appendChild(question_awardCell); 
    let get_money_awardCell = document.createElement('td');
    get_money_awardCell.textContent = get_money_award[i];
    row.appendChild(get_money_awardCell); 
    row.id = `row${i + 1}`;
    info_table.appendChild(row);
}

// Hàm xử lý thêm lớp money_current cho hàng hiện tại và loại bỏ lớp khỏi hàng trước đó
function handle_answer(current_question_index) {
    var previousIndex = current_question_index - 1;
    var currentRow = document.getElementById(`row${current_question_index}`);
    var previousRow = document.getElementById(`row${previousIndex}`);
    if (currentRow) {
        currentRow.classList.add('money_current');
    }
    if (previousRow) {
        previousRow.classList.remove('money_current');
    }
}   


//Hàm chọn level và set thời gian đếm ngược theo level
function choose_level(level) {
    switch (level) {
        case 'easy':
            question_time_limit = 30;
            break;
        case 'medium':
            question_time_limit = 20;
            break;
        case 'hard':
            question_time_limit = 10;
            break;
        default:
            question_time_limit = 30; 
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
            shuffle_question();
            current_question_index = 0;
            show_game_screen();
            load_next_question();
            handle_answer(1);
        } else {
            show_notification('Không thể tải câu hỏi!');
        }
    } catch (error) {
        console.error('Error fetching questions:', error);
        show_notification('Lỗi kết nối với API!');
    }
}

function shuffle_question() {
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
    let timeLeft = question_time_limit;
    const timerElement = document.getElementById('timer');
    function updateTimer() {
        timerElement.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdown_interval);
            show_notification('Bạn đã hết thời gian trả lời câu hỏi!');
            const answers = document.querySelectorAll('#answers button');
            answers.forEach(btn => {
                btn.disabled = true;
                next_button.disabled = true;
                stop_button.disabled = true;
            });
            const notificationButton = document.querySelector('.notification button');
            notificationButton.onclick = function() {
                close_notification();
                showResultScreen();
            };
        } else {
            timeLeft--;
        }
    }
    updateTimer();
    countdown_interval = setInterval(updateTimer, 1000);
}

//Hàm xử lý khi chọn câu trả lời
function selectAnswer(button, selectedAnswer, correctAnswer) {
    clearInterval(countdown_interval); 
    const answers = document.querySelectorAll('#answers button');
    answers.forEach(btn => btn.disabled = true);
    button.classList.add('selected');
    answered = true; 
    setTimeout(() => {
        if (selectedAnswer === correctAnswer) {
            button.classList.add('correct');
            next_button.disabled = false;
            stop_button.disabled = false;
            next_button.addEventListener('click', handleNextButtonClick);
            correct_count++;
        } else {
            button.classList.add('incorrect');
            incorrect_count++;
            next_button.disabled = false;
            next_button.addEventListener('click', handleNextButtonClick);
            answers.forEach(btn => {
                if (btn.innerText === correctAnswer) btn.classList.add('correct');
            });
            button.classList.remove('selected');
            show_notification('Bạn đã thua cuộc!');
            const notificationButton = document.querySelector('.notification button');
            notificationButton.onclick = function() {
                close_notification();
                showResultScreen();
            };
            next_button.disabled = true;
            stop_button.disabled = true;
        }
    }, 2000);
}

function getCorrectAnswer() {
    if (current_question_index >= 0 && current_question_index < questions.length) {
        return questions[current_question_index].correctAnswer;
    }
    return null;
}

function use_goi() {
    const correctAnswer = getCorrectAnswer(); // Giả định có hàm để lấy đáp án đúng hiện tại
    show_notification(`Người thân của bạn chọn đáp án: ${correctAnswer}`);
    call_button.disable = true;

}

//Hàm chức năng button "Câu tiếp theo"
function load_next_question() {
    clearInterval(countdown_interval);
    if (current_question_index < questions.length) {
        const questionData = questions[current_question_index];
        displayQuestion(questionData);
        answered = false; 
        startCountdown(); 
        next_button.disabled = true;
        stop_button.disabled = true;
    } else {
        show_notification('Bạn đã hoàn thành trò chơi!');
        const notificationButton = document.querySelector('.notification button');
        notificationButton.onclick = function() {
            close_notification();
            showResultScreen();
        };
    }
    handle_answer(current_question_index+1);
}

//Hàm tính số tiền nhận được
function updateTienThuong(correct_count,incorrect_count) {
    console.log(`Câu hỏi hiện tại: ${correct_count}`);
    let tienThuongElement = document.getElementById('money_award');
    if (tienThuongElement) {
        if (incorrect_count == 1) {
            tienThuongElement.textContent = `Số tiền bạn nhận được: 0đ`;
        }
        else{
            if (correct_count == 0) {
                tienThuongElement.textContent = `Số tiền bạn nhận được: 0đ`;
            } else {
                tienThuongElement.textContent = `Số tiền bạn nhận được: ${get_money_award[correct_count-1]}`;
            }
        }
    }
}

//Hàm hiển thị resultScreen
function showResultScreen()
{
    updateTienThuong(correct_count, incorrect_count);
    const total_questions = questions.length;    
    const notanswer_count = total_questions - correct_count - incorrect_count;
    document.getElementById('game_screen').style.display = 'none';
    const result_screen = document.getElementById('result_screen');
    result_screen.style.display = 'flex';
    document.getElementById('correct_count').innerText = `Số câu đúng: ${correct_count}`;
    document.getElementById('incorrect_count').innerText = `Số câu sai: ${incorrect_count}`;
    document.getElementById('notanswer_count').innerText = `Số câu chưa làm: ${notanswer_count}`;
    drawPieChart(correct_count, incorrect_count, notanswer_count);
}


//Hàm xử lý khi click button "Câu tiếp theo"
function handleNextButtonClick() {
    current_question_index++;
    const total_questions = questions.length;
    console.log(`Tổng số câu hỏi: ${total_questions}`);
    console.log(`Câu hỏi hiện tại: ${current_question_index}`);
    const answers = document.querySelectorAll('#answers button');
    answers.forEach(btn => {
        if (current_question_index < total_questions) {
            btn.classList.remove('correct', 'incorrect');
            btn.disabled = false;
        }
        else 
        {btn.disabled = true;}
    });
    load_next_question();
    next_button.disabled = true;
}

//Hàm xử lý button "Dừng cuộc chơi"
function stop_game() {
    clearInterval(countdown_interval);
    show_notification('Bạn đã dừng cuộc chơi!');
    const notificationButton = document.querySelector('.notification button');
    notificationButton.onclick = function() {
        close_notification();
        showResultScreen();
    };
}


//Hàm xử lý button "Chơi lại"
function restart_game() {
    var screenElements = document.getElementsByClassName('screen');
    for (var i = 0; i < screenElements.length; i++) {
        screenElements[i].style.display = 'none';
    }
    var level_screenElement = document.getElementById('level_screen');
    level_screenElement.style.display = 'block';
    current_question_index = 0;  
    correct_count = 0;
    incorrect_count = 0;
    notanswer_count = 0;
    var infoTableRows = document.querySelectorAll('#info_table tr');
    infoTableRows.forEach(function(row) {
        row.classList.remove('money_current');
    });
}

//Hàm vẽ biểu đồ tròn
function drawPieChart(correct_count, incorrect_count, notanswer_count) {
    const resultCanvas = document.getElementById('result_chart').getContext('2d');
    if (resultCanvas.chart) {
        resultCanvas.chart.destroy();
    }
    new Chart(resultCanvas, {
        type: 'pie',
        data: {
            labels: ['Số câu đúng', 'Số câu sai', 'Số câu chưa làm'],
            datasets: [{
                label: 'Kết quả',
                data: [correct_count, incorrect_count, notanswer_count],
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