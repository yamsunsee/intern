// const BASE_URL = "http://192.168.9.78:3107/api/v1/questions";
const BASE_URL = "https://api4interns.vercel.app/api/v1/questions";
let data = [];
let filteredData = [];
let editIndex = -1;

document.addEventListener('DOMContentLoaded', async () => {
    await fetchData();
    renderQuestions();

    const addQuestionBtn = document.querySelector('#btn-add-question');
    const modal = document.querySelector('#question-modal');
    const closeModalBtn = document.querySelector('.close');
    const questionForm = document.querySelector('#question-form');
    const searchInput = document.querySelector('#search-input');
    const searchBtn = document.querySelector('#search-btn');

    addQuestionBtn.addEventListener('click', () => {
        editIndex = -1;
        openModal();
    });

    closeModalBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeModal();
        }
    });

    questionForm.addEventListener('submit', handleFormSubmit);

    searchBtn.addEventListener('click', handleSearch);
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

    data.forEach((question, index) => {
        const questionItem = document.createElement('div');
        questionItem.className = 'question-item';
        questionItem.innerHTML = `
            <p><strong>Câu hỏi:</strong> ${question.question}</p>
            <div class="answers">
                ${question.answers.map((answer, i) => `<p class="answer-item">${i + 1}. ${answer}</p>`).join('')}
            </div>
            <p><strong>Câu trả lời:</strong> ${question.correctAnswer}</p>
            <button class="edit" onclick="editQuestion(${index})">Chỉnh sửa</button>
            <button class="delete" onclick="deleteQuestion(${index})">Xóa</button>
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
    filteredData = data.filter(question => question.question ? question.question.toLowerCase().includes(searchTerm) : false);
    console.log(filteredData);
    renderQuestions();
    scrollToQuestion();
};

const scrollToQuestion = () => {
    const firstQuestion = document.querySelector('.question-item');
    if (firstQuestion) {
        firstQuestion.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};