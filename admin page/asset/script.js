// const BASE_URL = "http://192.168.9.78:3107/api/v1/questions";
const BASE_URL = "https://api4interns.vercel.app/api/v1/questions";
let data = [];
let filteredData = [];
let editIndex = -1;
let deleteIndex = -1;

document.addEventListener('DOMContentLoaded', async () => {
    await fetchData();
    renderQuestions();

    const addQuestionBtn = document.querySelector('#btn-add-question');
    const modal = document.querySelector('#question-modal');
    const closeModalBtn = document.querySelector('.close');
    const closemodalConfirm = document.querySelector('#btn-cancel');
    const questionForm = document.querySelector('#question-form');
    const searchBtn = document.querySelector('#search-btn');
    const okBtn = document.querySelector('#btn-ok');
    const searchInput = document.querySelector('#search-input');

    addQuestionBtn.addEventListener('click', () => {
        editIndex = -1;
        openModal();
    });

    closeModalBtn.addEventListener('click', closeModal);
    closemodalConfirm.addEventListener('click', closeModalConfirm);

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeModal();
        }
    });

    okBtn.addEventListener('click', async () => {
        await deleteQuestion(deleteIndex);
        closeModalConfirm();
    });

    questionForm.addEventListener('submit', handleFormSubmit);

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('input', handleSearch);
});

const fetchData = async () => {
    try {
        const response = await fetch(BASE_URL);
        const responseData = await response.json();
        if (responseData.status) {
            data = responseData.data;
            filteredData = data;
        } else {
            throw new Error("Failed to fetch data!");
        }
    } catch (error) {
        window.alert(error);
    }
};

const renderQuestions = () => {
    const questionsList = document.querySelector('#questions-list');
    questionsList.innerHTML = '';

    filteredData.forEach((question, index) => {
        const questionItem = document.createElement('div');
        questionItem.className = 'question-item';
        questionItem.id = `question-${question.id}`;
        questionItem.innerHTML = `
            <p><strong>Câu hỏi:</strong> ${question.question}</p>
            <div class="answers">
                ${question.answers.map((answer, i) => `<p class="answer-item">${i + 1}. ${answer}</p>`).join('')}
            </div>
            <p><strong>Câu trả lời:</strong> ${question.correctAnswer}</p>
            <button class="edit" onclick="editQuestion(${index})">Chỉnh sửa</button>
            <button class="delete" onclick="openModalConfirm(${index})">Xóa</button>
        `;
        questionsList.appendChild(questionItem);
    });
};

const openModal = () => {
    const modal = document.querySelector('#question-modal');
    const modalTitle = document.querySelector('#modal-title');
    const questionForm = document.querySelector('#question-form');

    modalTitle.textContent = editIndex === -1 ? 'Tạo câu hỏi mới' : 'Chỉnh sửa câu hỏi';
    questionForm.reset();

    if (editIndex !== -1) {
        const question = data[editIndex];
        document.querySelector('#question-text').value = question.question;
        document.querySelectorAll('.answer').forEach((input, i) => {
            input.value = question.answers[i];
        });
        document.querySelector('#correct-answer').value = question.correctAnswer;
    }

    modal.style.display = "block";
};

const closeModal = () => {
    const modal = document.querySelector('#question-modal');
    modal.style.display = "none";
};

const openModalConfirm = (index) => {
    deleteIndex = index;
    const modal = document.querySelector('#confirm-modal');
    modal.style.display = "block";
};

const closeModalConfirm = () => {
    const modal = document.querySelector('#confirm-modal');
    modal.style.display = "none";
};

const handleFormSubmit = async (event) => {
    event.preventDefault();

    const questionText = document.querySelector('#question-text').value;
    const answers = Array.from(document.querySelectorAll('.answer')).map(input => input.value);
    const correctAnswerIndex = document.querySelector('#correct-answer').value;
    const correctAnswers = answers[correctAnswerIndex];

    const questionData = {
        question: questionText,
        answers: answers,
        correctAnswer: correctAnswers
    };

    if (editIndex === -1) {
        await addQuestion(questionData);
    } else {
        await updateQuestion(editIndex, questionData);
    }

    closeModal();
    await fetchData();
    renderQuestions();
};

const addQuestion = async (questionData) => {
    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(questionData)
        });
        const responseData = await response.json();
        if (!responseData.status) {
            throw new Error("Failed to add question!");
        }
    } catch (error) {
        window.alert(error);
    }
};

const updateQuestion = async (index, questionData) => {
    try {
        const response = await fetch(`${BASE_URL}/${data[index].id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(questionData)
        });
        const responseData = await response.json();
        if (!responseData.status) {
            throw new Error("Failed to update question!");
        }
    } catch (error) {
        window.alert(error);
    }
};

const deleteQuestion = async (index) => {
    try {
        const response = await fetch(`${BASE_URL}/${data[index].id}`, {
            method: 'DELETE'
        });
        const responseData = await response.json();
        if (!responseData.status) {
            throw new Error("Failed to delete question!");
        }
        await fetchData();
        renderQuestions();
    } catch (error) {
        window.alert(error);
    }
};

const editQuestion = (index) => {
    editIndex = index;
    openModal();
};

const handleSearch = () => {
    const searchTerm = document.querySelector('#search-input').value.toLowerCase();
    if (searchTerm === '') {
        filteredData = data; // Đặt lại giá trị ban đầu của data nếu ô input rỗng
    } else {
        filteredData = data.filter(question => question.question ? question.question.toLowerCase().includes(searchTerm) : false);
    }
    renderQuestions();

    // Lướt đến chỗ câu hỏi cần tìm
    if (filteredData.length > 0) {
        const firstQuestionId = `question-${filteredData[0].id}`; // đảm bảo mỗi câu hỏi đều có id
        const firstQuestionElement = document.getElementById(firstQuestionId);
        if (firstQuestionElement) {
            firstQuestionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } else {
        // Đưa về đầu trang
        const questionsList = document.querySelector('#questions-list');
        questionsList.scrollTop = 0;
    }
};