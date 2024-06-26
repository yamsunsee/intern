//Hàm setup notification cho ô nhập tên-----------------------------------------------------------------------------------------------
function start_game() {
    const name = document.getElementById('name').value;
    if (name) {
        show_notification(`Xin chào, ${name}! Hãy cùng thử thách trí tuệ nào!`);
        click_start(); 
    } else {
        show_notification('Vui lòng nhập tên!');
    }
}

//Hàm hiện notification-----------------------------------------------------------------------------------------------
function show_notification(message) {
    const notification = document.getElementById('notification');
    const notification_message = document.getElementById('notification_message');
    notification_message.innerText = message;
    notification.classList.remove('hidden');
}
function show_notification_confirm(message) {
    const notification = document.getElementById('notification_confirm');
    const notification_message = document.getElementById('notification_message_confirm');
    notification_message.innerText = message;
    notification.classList.remove('hidden');
}

//Hàm đóng notification -----------------------------------------------------------------------------------------------
function close_notification() {
    const notification = document.getElementById('notification');
    notification.classList.add('hidden');
    const notification_button = document.querySelector('.notification button');
    notification_button.onclick = close_notification; 
}
function continue_work() {
    const notification = document.getElementById('notification_confirm');
    notification.classList.add('hidden');
}
function cancel() {
    const notification = document.getElementById('notification_confirm');
    notification.classList.add('hidden');
    document.getElementById('add_question_form').classList.add('hidden');
}
//Hiển thị start_screen khi vừa bắt đầu-----------------------------------------------------------------------------------------------
function on_start() {
    var screen_elements = document.getElementsByClassName('screen');
    for (var i = 0; i < screen_elements.length; i++) {
        screen_elements[i].style.display = 'none';
    }
    var start_screen_element = document.getElementById('login_screen');
    start_screen_element.style.display = 'block';
}

//Hàm hiển thị level_screen-----------------------------------------------------------------------------------------------
function click_start() {
    var screen_elements = document.getElementsByClassName('screen');
    for (var i = 0; i < screen_elements.length; i++) {
        screen_elements[i].style.display = 'none';
    }
    var level_screen_element = document.getElementById('level_screen');
    level_screen_element.style.display = 'block';
}

//Hàm hiển thị game_screen-----------------------------------------------------------------------------------------------
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

const question_element = document.getElementById('question');
const answers_element = document.getElementById('answers');
const next_button = document.getElementById('next_btn');
const stop_button = document.getElementById('stop_btn');
const call_button = document.getElementById('call_btn');
const audience_button = document.getElementById ('audience_btn');
const fifty_button = document.getElementById ('fifty_btn')
const question_index_element = document.getElementById ('question_index');



const question_award = [
    "1", "2", "3", "4", "5",
    "6", "7", "8", "9", "10",
    "11","12","13","14", "15", 
    "16","17","18","19","20"
];

const get_money_award = [
    "1.000.000", "2.000.000", "3.000.000", "4.000.000", "5.000.000",
    "6.000.000", "7.000.000", "8.000.000", "9.000.000", "10.000.000",
    "11.000.000", "12.000.000", "13.000.000", "14.000.000", "15.000.000", "16.000.000",
    "17.000.000", "18.000.000", "19.000.000", "20.000.000"
];

//Tạo bảng phần thưởng-----------------------------------------------------------------------------------------------
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

// Hàm xử lý thêm lớp money_current cho hàng hiện tại và loại bỏ lớp khỏi hàng trước đó-----------------------------------------------------------------------------------------------
function change_money(current_question_index) {
    var previous_index = current_question_index - 1;
    var current_row = document.getElementById(`row${current_question_index}`);
    var previous_row = document.getElementById(`row${previous_index}`);
    if (current_row) {
        current_row.classList.add('money_current');
    }
    if (previous_row) {
        previous_row.classList.remove('money_current');
    }
}   


//Hàm chọn level và set thời gian đếm ngược theo level-----------------------------------------------------------------------------------------------
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
    fetch_questions();
}

//Lấy data API-----------------------------------------------------------------------------------------------
async function fetch_questions() {
    try {
        const response = await fetch(BASE_URL);
        const data = await response.json();
        if (data.status) {
            questions = data.data;
            shuffle_question();
            current_question_index = 0;
            show_game_screen();
            load_next_question();
            change_money(1);
        } else {
            show_notification('Không thể tải câu hỏi!');
        }
    } catch (error) {
        console.error('Error fetching questions:', error);
        show_notification('Lỗi kết nối với API!');
    }
}

//Hàm trộn câu hỏi ngẫu nhiên-----------------------------------------------------------------------------------------------
function shuffle_question() {
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
}

//Hàm hiển thị câu hỏi và các câu trả lời-----------------------------------------------------------------------------------------------
function display_question(question_data) {
    question_index_element.textContent = `Câu hỏi ${current_question_index + 1}`;
    question_element.innerText = question_data.question;
    answers_element.innerHTML = '';
    question_data.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer;
        button.classList.add('answer');
        button.onclick = () => select_answer(button, answer, question_data.correctAnswer);
        answers_element.appendChild(button);
    });
}

//Hàm đếm ngược-----------------------------------------------------------------------------------------------
function start_countdown() {
    let time_left = question_time_limit;
    const timer_element = document.getElementById('timer');
    function update_timer() {
        timer_element.innerText = time_left;
        if (time_left <= 0) {
            clearInterval(countdown_interval);
            show_notification('Bạn đã hết thời gian trả lời câu hỏi!');
            const answers = document.querySelectorAll('#answers button');
            answers.forEach(btn => {
                btn.disabled = true;
                next_button.disabled = true;
                stop_button.disabled = true;
            });
            const notification_button = document.querySelector('.notification button');
            notification_button.onclick = function() {
                close_notification();
                show_result_screen();
            };
        } else {
            time_left--;
        }
    }
    update_timer();
    countdown_interval = setInterval(update_timer, 1000);
}

//Hàm xử lý khi chọn câu trả lời-----------------------------------------------------------------------------------------------
function select_answer(button, selected_answer, correctAnswer) {
    clearInterval(countdown_interval); 
    const answers = document.querySelectorAll('#answers button');
    answers.forEach(btn => btn.disabled = true);
    button.classList.add('selected');
    answered = true; 
    setTimeout(() => {
        if (selected_answer === correctAnswer) {
            button.classList.add('correct');
            next_button.disabled = false;
            stop_button.disabled = false;
            next_button.addEventListener('click', next_button_click);
            correct_count++;
        } else {
            button.classList.add('incorrect');
            incorrect_count++;
            next_button.disabled = false;
            next_button.addEventListener('click', next_button_click);
            answers.forEach(btn => {
                if (btn.innerText === correctAnswer) btn.classList.add('correct');
            });
            button.classList.remove('selected');
            show_notification('Bạn đã thua cuộc!');
            const notification_button = document.querySelector('.notification button');
            notification_button.onclick = function() {
                close_notification();
                show_result_screen();
            };
            next_button.disabled = true;
            stop_button.disabled = true;
        }
    }, 2000);
}

//Hàm lấy đáp án đúng của câu hỏi hiện tại-----------------------------------------------------------------------------------------------
function get_correct_answer() {
    if (current_question_index >= 0 && current_question_index < questions.length) {
        return questions[current_question_index].correctAnswer;
    }
    return null;
}

//Hàm vô hiệu hóa button-----------------------------------------------------------------------------------------------
function disable_button(button) {
    button.disabled = true;
    button.classList.add('used');
}

//Hàm xử lí các nút hỗ trợ-----------------------------------------------------------------------------------------------
function use_call() {
    const correct_answer = get_correct_answer();
    show_notification(`Người thân của bạn chọn đáp án: ${correct_answer}`);
    disable_button(call_button);
}
function use_audience() {
    const correct_answer = get_correct_answer();
    show_notification (`Phần lớn khán giả chọn đáp án: ${correct_answer}`);
    disable_button(audience_button);
}
function use_fifty() {
    const correct_answer = get_correct_answer();
    const answers = Array.from(document.querySelectorAll('#answers button'));
    let used_count = 0;
    answers.forEach(btn => {
        if (btn.innerText !== correct_answer && used_count < 2) {
            btn.style.display = 'none'; 
            used_count++;
        }
    });
    disable_button(fifty_button);
}

//Hàm chức năng button "Câu tiếp theo"-----------------------------------------------------------------------------------------------
function load_next_question() {
    clearInterval(countdown_interval);
    if (current_question_index < questions.length) {
        const question_data = questions[current_question_index];
        display_question(question_data);
        answered = false; 
        start_countdown(); 
        next_button.disabled = true;
        stop_button.disabled = true;

    } else {
        show_notification('Bạn đã hoàn thành trò chơi!');
        const notification_button = document.querySelector('.notification button');
        notification_button.onclick = function() {
            close_notification();
            show_result_screen();
        };
    }
    change_money(current_question_index+1);
}

//Hàm tính số tiền nhận được-----------------------------------------------------------------------------------------------
function update_money(correct_count, incorrect_count) {
    console.log(`Câu hỏi hiện tại: ${correct_count}`);
    let money_element = document.getElementById('money_award');
    let money_element_fix = document.getElementById('money_award_fix');
    if (money_element && money_element_fix) {
        if (incorrect_count == 1) {
            money_element.textContent = `Số tiền bạn nhận được: 0đ`;
            money_element_fix.textContent = `Số tiền bạn nhận được: 0đ`;
        } else {
            if (correct_count == 0) {
                money_element.textContent = `Số tiền bạn nhận được: 0đ`;
                money_element_fix.textContent = `Số tiền bạn nhận được: 0đ`;
            } else {
                money_element.textContent = `Số tiền bạn nhận được: ${get_money_award[correct_count - 1]}`;
                money_element_fix.textContent = `Số tiền bạn nhận được: ${get_money_award[correct_count - 1]}`;
            }
        }
    }
}


//Hàm hiển thị resultScreen-----------------------------------------------------------------------------------------------
function show_result_screen()
{
    update_money(correct_count, incorrect_count);
    const total_questions = questions.length;    
    const notanswer_count = total_questions - correct_count - incorrect_count;
    document.getElementById('game_screen').style.display = 'none';
    const result_screen = document.getElementById('result_screen');
    result_screen.style.display = 'flex';
    document.getElementById('correct_count').innerText = `Số câu đúng: ${correct_count}`;
    document.getElementById('incorrect_count').innerText = `Số câu sai: ${incorrect_count}`;
    document.getElementById('notanswer_count').innerText = `Số câu chưa làm: ${notanswer_count}`;
    draw_pie_chart(correct_count, incorrect_count, notanswer_count);
}


//Hàm xử lý khi click button "Câu tiếp theo"-----------------------------------------------------------------------------------------------
function next_button_click() {
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

//Hàm xử lý button "Dừng cuộc chơi"-----------------------------------------------------------------------------------------------
function stop_game() {
    clearInterval(countdown_interval);
    show_notification('Bạn đã dừng cuộc chơi!');
    const notification_button = document.querySelector('.notification button');
    notification_button.onclick = function() {
        close_notification();
        show_result_screen();
    };
}


//Hàm xử lý button "Chơi lại"-----------------------------------------------------------------------------------------------
function restart_game() {
    var screen_elements = document.getElementsByClassName('screen');
    for (var i = 0; i < screen_elements.length; i++) {
        screen_elements[i].style.display = 'none';
    }
    var level_screen_element = document.getElementById('level_screen');
    level_screen_element.style.display = 'block';
    current_question_index = 0;  
    correct_count = 0;
    incorrect_count = 0;
    notanswer_count = 0;
    var info_table_rows = document.querySelectorAll('#info_table tr');
    info_table_rows.forEach(function(row) {
        row.classList.remove('money_current');
    });
        const support_buttons = [call_button, audience_button, fifty_button];
    support_buttons.forEach(button => {
        button.disabled = false;
        button.classList.remove('used');
    });
}

// Hàm vẽ biểu đồ tròn-----------------------------------------------------------------------------------------------
function draw_pie_chart(correct_count, incorrect_count, notanswer_count) {
    const result_canvas = document.getElementById('result_chart').getContext('2d');
    if (result_canvas.chart) {
        result_canvas.chart.data.datasets[0].data = [correct_count, incorrect_count, notanswer_count];
        result_canvas.chart.update("active");
    }
    else {
        result_canvas.chart = new Chart(result_canvas, {
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
                        align: 'center',
                        labels: {
                            padding: 10, 
                            boxWidth: 20, 
                            boxHeight: 15, 
                            font: {
                                size: 14 
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.label + ': ' + tooltipItem.raw.toFixed(0);
                            }
                        }
                    }
                },
                layout: {
                    padding: {
                        top: 10,
                        bottom: 0
                    }
                },
                elements: {
                    arc: {
                        borderWidth: 0 
                    }
                }
            }
        });
    }
}
/* Bạn là người chơi thì vào start screen------------------------------------------------------------------------------------------------------------------*/
function login_as_player() {
    document.getElementById('login_screen').style.display = 'none';
    document.getElementById('start_screen').style.display = 'block';
}
/* Bạn là admin thì nhập mật khẩu------------------------------------------------------------------------------------------------------------------*/
function show_admin_login() {
    document.getElementById('admin_login').classList.remove('hidden');
}
/*Check mật khẩu--------------------------------------------------------------------------------------------------------------------*/
function login_as_admin() {
    const password = document.getElementById('admin_password').value;
    if (password === '123456') {
        document.getElementById('login_screen').style.display = 'none';
        document.getElementById('admin_screen').style.display = 'block';
    } else {
        document.getElementById('error_message').innerText = 'Sai mật khẩu. Vui lòng thử lại.';
    }
}
// Lấy dữ liệu trong màn hình admin---------------------------------------------------------------------------------------------
async function fetch_data_admin() {
    const loading = document.getElementById('loading');
    loading.classList.remove('hidden');
    try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const response = await fetch(BASE_URL);
        const data = await response.json();

        if (data.status) {
            questions = data.data;
            display_admin_data(questions);
            show_notification(`Số lượng câu hỏi hiện tại: ${questions.length}.`);
        } else {
            show_notification('Không thể tải câu hỏi!');
        }
    } catch (error) {
        console.error('Error fetching questions:', error);
        show_notification('Lỗi kết nối với API!');
    } finally {
        loading.classList.add('hidden');
    }
}

// Hiển thị dữ liệu trong màn hình admin-----------------------------------------------------------------------------------------------
function display_admin_data(questions) {
    const admin_data_container = document.getElementById('admin_data');
    admin_data_container.innerHTML = ''; 

    questions.forEach((question, index) => {
        const question_div = document.createElement('div');
        question_div.classList.add('question_item');
        question_div.setAttribute('data-id', question.id); 
        question_div.innerHTML = `
            <p><strong>ID:</strong> ${question.id}</p>  
            <p><strong>Câu hỏi: </strong>${question.question}</p>
            <p><strong>Đáp án:</strong></p>
            <ul>
                ${question.answers.map(answer => `<li>${answer}</li>`).join('')}
            </ul>
            <p><strong>Đáp án đúng:</strong> ${question.correctAnswer}</p>
            <button onclick="delete_question_confirm('${question.id}')">Xóa câu hỏi</button>
            <button onclick="edit_question('${question.id}')">Chỉnh sửa</button>
        `;
        admin_data_container.appendChild(question_div);
    });
}
// Hàm để tìm kiếm câu hỏi--------------------------------------------------------------------------------------------------------------
function search_question() {
    const search = document.getElementById('search_input').value.toLowerCase().trim();
    
    if (!search) {
        show_notification('Hãy nhập từ khóa cho câu hỏi cần tìm.');
        return;
    }

    const questions = document.querySelectorAll('.question_item');

    let found = false;
    questions.forEach(question => {
        const question_text_element = question.querySelector('p:nth-of-type(2)'); 
        if (question_text_element) {
            const question_text = question_text_element.textContent.toLowerCase();
            if (question_text.includes(search)) {
                question.scrollIntoView({ behavior: 'smooth', block: 'center' });
                question.style.backgroundColor = '#ffff99'; 
                found = true;
            } else {
                question.style.backgroundColor = ''; 
            }
        }
    });

    if (!found) {
        show_notification('Không tìm thấy câu hỏi nào phù hợp với từ khóa.');
    }
}

// Nút thêm câu hỏi hiện form thêm câu hỏi------------------------------------------------------------------------------------------------------------------
function show_add_question_form() {
    document.getElementById('add_question_form').classList.remove('hidden');
}

// Nút gửi câu hỏi muốn thêm------------------------------------------------------------------------------------------------------------------
async function add_new_question() {
    const new_question = document.getElementById('new_question').value;
    const answer_1 = document.getElementById('answer_1').value;
    const answer_2 = document.getElementById('answer_2').value;
    const answer_3 = document.getElementById('answer_3').value;
    const answer_4 = document.getElementById('answer_4').value;
    const correctAnswer = document.getElementById('correct_answer').value;

    if (!new_question || !answer_1 || !answer_2 || !answer_3 || !answer_4 || !correctAnswer) {
        show_notification('Vui lòng điền đầy đủ thông tin cho tất cả các ô.');
        return;
    }
    const answers = [answer_1, answer_2, answer_3, answer_4];
    const questionData = {
        question: new_question,
        answers: answers,
        correctAnswer: answers[correctAnswer.charCodeAt(0) - 65]  
    };
    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(questionData)
        });
        const result = await response.json();
        console.log(result);
        show_notification('Thêm câu hỏi thành công!');
        const notification_button = document.querySelector('.notification button');
        notification_button.onclick = function() {
            close_notification();
            document.getElementById('add_question_form').classList.add('hidden');
            fetch_data_admin();  
        };

    } catch (error) {
        console.error('Error posting admin data:', error);
    }
}
//Nút "Hủy" khi đang thêm câu hỏi----------------------------------------------------------------------------------------------------
function cancel_add_new_question() {
    show_notification_confirm('Bạn chắc chắn muốn hủy thêm câu hỏi này?');
    const no_button = document.getElementById('No');
    const yes_button = document.getElementById('Yes');

    no_button.onclick = function() {
        continue_work();
    };

    yes_button.onclick = function() {
        cancel();
    };
}
//Nhấn button xóa câu hỏi sẽ confirm việc xóa câu hỏi trước------------------------------------------------------------------------------------------------------------------
async function delete_question_confirm(id) {
    show_notification_confirm('Bạn chắc chắn muốn hủy thêm câu hỏi này?');
    const no_button = document.getElementById('No');
    const yes_button = document.getElementById('Yes');

    no_button.onclick = function() {
        continue_work();
    };

    yes_button.onclick = function() {
        cancel();
        delete_question(id);
    };
}
//Xác nhận Ok thì xóa câu hỏi-----------------------------------------------------------------------------------------------------------------------------
async function delete_question(id) {
    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        console.log(result);
        fetch_data_admin(); 
    } catch (error) {
        console.error('Error deleting admin data:', error); 
    }
}
// Nhấn nút chỉnh sửa câu hỏi
function edit_question(id) {
    const question_element = document.querySelector(`.question_item[data-id="${id}"]`);
    const question_text = question_element.querySelector('p:nth-of-type(2)').textContent.replace('Câu hỏi:', '').trim();
    const answers_list = Array.from(question_element.querySelectorAll('ul li')).map(li => li.textContent.trim());
    let correct_answer_element = null;
    const childNodes = question_element.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
        const node = childNodes[i];
        if (node.nodeName === 'P' && node.textContent.trim().startsWith('Đáp án đúng:')) {
            correct_answer_element = node;
            break;
        }
    }
    if (correct_answer_element) {
        const correct_answer = correct_answer_element.textContent.trim().replace('Đáp án đúng:', '');
        const edit_form = document.createElement('div');
        edit_form.innerHTML = `
            <h3>Chỉnh sửa câu hỏi</h3>
            <label for="edit_question_${id}">Câu hỏi:</label>
            <input type="text" id="edit_question_${id}" value="${question_text}">
            <label for="edit_answer_1_${id}">Đáp án A:</label>
            <input type="text" id="edit_answer_1_${id}" value="${answers_list[0]}">
            <label for="edit_answer_2_${id}">Đáp án B:</label>
            <input type="text" id="edit_answer_2_${id}" value="${answers_list[1]}">
            <label for="edit_answer_3_${id}">Đáp án C:</label>
            <input type="text" id="edit_answer_3_${id}" value="${answers_list[2]}">
            <label for="edit_answer_4_${id}">Đáp án D:</label>
            <input type="text" id="edit_answer_4_${id}" value="${answers_list[3]}">
            <label for="edit_correct_answer_${id}">Đáp án đúng:</label>
            <select id="edit_correct_answer_${id}" >
                <option value="${answers_list[0]}" ${correct_answer === answers_list[0] ? 'selected' : ''}>A</option>
                <option value="${answers_list[1]}" ${correct_answer === answers_list[1] ? 'selected' : ''}>B</option>
                <option value="${answers_list[2]}" ${correct_answer === answers_list[2] ? 'selected' : ''}>C</option>
                <option value="${answers_list[3]}" ${correct_answer === answers_list[3] ? 'selected' : ''}>D</option>
            </select>
            <div class="edit_button_container">
                <button id="save_button_${id}" onclick="save_edit_question_confirm('${id}')">Lưu</button>
                <button id="cancel_button_${id}" onclick="cancel_edit_question('${id}')">Hủy</button>
            </div>
        `;
        question_element.innerHTML = '';
        question_element.appendChild(edit_form);
    } else {
        console.error('Không tìm thấy phần tử chứa đáp án đúng.');
        show_notification('Có lỗi khi chỉnh sửa câu hỏi.');
    }
}

// Hủy chỉnh sửa câu hỏi
function cancel_edit_question(id) {
    show_notification_confirm('Bạn chắc chắn muốn hủy chỉnh sửa câu hỏi này?');
    const no_button = document.getElementById('No');
    const yes_button = document.getElementById('Yes');

    no_button.onclick = function() {
        continue_work();
    };

    yes_button.onclick = function() {
        cancel();
        fetch_data_admin();
    };
}

// Confirm trước khi lưu lại bản chỉnh sửa
async function save_edit_question_confirm(id) {
    show_notification_confirm('Bạn chắc chắn muốn lưu bản chỉnh sửa này?');
    const no_button = document.getElementById('No');
    const yes_button = document.getElementById('Yes');

    no_button.onclick = function() {
        continue_work();
    };

    yes_button.onclick = function() {
        cancel();
        save_edit_question(id);
    };
}

// Lưu lại bản vừa chỉnh sửa của câu hỏi
async function save_edit_question(id) {
    const edited_question = document.getElementById(`edit_question_${id}`).value;
    const edited_answer_1 = document.getElementById(`edit_answer_1_${id}`).value;
    const edited_answer_2 = document.getElementById(`edit_answer_2_${id}`).value;
    const edited_answer_3 = document.getElementById(`edit_answer_3_${id}`).value;
    const edited_answer_4 = document.getElementById(`edit_answer_4_${id}`).value;
    const edited_correct_answer = document.getElementById(`edit_correct_answer_${id}`).value;

    const editedAnswers = [edited_answer_1, edited_answer_2, edited_answer_3, edited_answer_4];
    const questionData = {
        question: edited_question,
        answers: editedAnswers,
        correctAnswer: edited_correct_answer
    };

    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(questionData)
        });
        const result = await response.json();
        console.log(result);
        fetch_data_admin();
    } catch (error) {
        console.error('Error updating question:', error);
        show_notification('Có lỗi xảy ra khi cập nhật câu hỏi.');
    }
}

