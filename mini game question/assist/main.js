const BASE_URL = "https://api4interns.vercel.app/api/v1/questions";

const quizElement = document.querySelector("#quiz");
const resultsElement = document.querySelector("#results");
const startElement = document.querySelector("#start-game");
const resultsMessageElement = document.querySelector("#resultsMessage");
const questionElement = document.querySelector("#question");
const answerButtons = document.querySelectorAll('.answer-button');
const nextButton = document.querySelector('#btn-next');
const exitButton = document.querySelector('#btn-exit');
const questionCounterElement = document.querySelector('#question-couter');
const timerElement = document.querySelector('#time-out');
const nextQuiz = document.querySelector("#js-btn-next");

let currentQuestionIndex = 0;
let data = []; // Global variable to store fetched data
let timer; // Variable to store the timer interval
let nextQuestionTimeout; // Variable to store the next question timeout

const handleFetchData = async (url) => {
  try {
    const response = await fetch(url);
    const responseData = await response.json();
    if (responseData.status) return responseData.data;
    else throw new Error("Failed to fetch data!");
  } catch (error) {
    window.alert(error);
    return [];
  }
};

// Hàm để xáo trộn một mảng sử dụng thuật toán Fisher-Yates
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

//Set up timer 
const startTimer = (duration) => {
    let time = duration;
    timerElement.textContent = `Time left: ${time} seconds`;
  
    timer = setInterval(() => {
      time--;
      timerElement.textContent = `Time left: ${time} seconds`;
  
      if (time <= 0) {
        clearInterval(timer);
        alert("Time's up!");
        nextQuestion();
      }
    }, 1000);
};


// Hàm hiển thị câu hỏi và các đáp án
const displayQuestion = (questionData) => {

    // Clear any existing timers
    clearInterval(timer);
    clearTimeout(nextQuestionTimeout);

    const shuffledData = shuffleArray(data);

    questionData = shuffledData[0]; 

  if (questionElement) {
    questionElement.textContent = questionData.question;
  }

  // Xáo trộn mảng các đáp án
  const shuffledAnswers = shuffleArray(questionData.answers);

  shuffledAnswers.forEach((answer, index) => {
    const button = answerButtons[index];
    if (button) {
        button.textContent = answer;
        button.classList.remove('answer-button-correct', 'answer-button-wrong');
  
        button.onclick = () => {
          if (answer === questionData.correctAnswer) {
            button.classList.add('answer-button-correct');
          } else {
            button.classList.add('answer-button-wrong');
        }
        nextQuestionTimeout = setTimeout(nextQuestion, 2000);
      };
    }
  });

  // Cập nhật số thứ tự câu hỏi
  if (questionCounterElement) {
    questionCounterElement.textContent = `Question ${currentQuestionIndex + 1} of ${data.length}`;
  }
//   startTimer(15);
};

// Hàm chuyển sang câu hỏi tiếp theo
const nextQuestion = () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < data.length) {
    displayQuestion(data[currentQuestionIndex]);
  } else {
    showResults();
  }
};

// Hàm thoat den man hinh het qua
const exitQuestion = () => {
    showResults();
};

const showResults = () => {
    quizElement.classList.remove('open');
    resultsElement.classList.remove('hidden');
    startElement.classList.add('hidden');
    resultsMessageElement.textContent = "Quiz is over. Here are your results!";
};

const showQuiz = () => {
    quizElement.classList.add('open');
    resultsElement.classList.add('hidden');
    startElement.classList.add('hidden');
};


// Hàm chính để khởi tạo và xử lý dữ liệu
const main = async () => {
  try {
    data = await handleFetchData(BASE_URL);

    if (data.length > 0) {
      displayQuestion(data[currentQuestionIndex]);
    } else {
      alert("No questions available!");
      // Có thể xử lý khi không có câu hỏi nào
    }

    if (nextButton) {
      nextButton.addEventListener('click', nextQuestion);
    }
    if (exitButton) {
      exitButton.addEventListener('click', exitQuestion);
    }
    if (nextQuiz) {
        nextQuiz.addEventListener('click', showQuiz);
    }
  } catch (error) {
    console.error('Error fetching or processing data:', error);
  }
};

main();