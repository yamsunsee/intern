const BASE_URL = "https://api4interns.vercel.app/api/v1/questions";

const quizElement = document.querySelector("#quiz");
const resultsElement = document.querySelector("#results");

const startElement = document.querySelector("#start-game");
const questionElement = document.querySelector("#question");
const answerButtons = document.querySelectorAll('.answer-button');

const questionCounterElement = document.querySelector('#question-couter');
const timerElement = document.querySelector('#time-out');

const nextButton = document.querySelector('#btn-next');
const exitButton = document.querySelector('#btn-exit');
const nextQuiz = document.querySelector("#js-btn-next");

// Khởi tạo các biến tạm thời -------------------------------------------------------------------------------------------------------
let currentQuestionIndex = 0;
let data = []; // Biến toàn cục lưu trữ dữ liệu từ link API
let timer; // Biến đếm thời gian
let nextQuestionTimeout; // Biến lưu trữ thời gian câu tiếp theo hiện ra
let answeredQuestionsCount = 0; // Biến số câu đã trả lời
let correctAnswersCount = 0; // Bến đếm số câu đúng

// Thiết lập kết nối API -------------------------------------------------------------------------------------------------------------
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

// Hàm để xáo trộn một mảng sử dụng thuật toán Fisher-Yates --------------------------------------------------------------------------
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Thiết lập thời gian đếm ngược cho mỗi câu hỏi -------------------------------------------------------------------------------------
const startTimer = (duration) => {
    let time = duration;
    timerElement.textContent = `Time left: ${time} seconds`;
  
    timer = setInterval(() => {
      time--;
      timerElement.textContent = `Time left: ${time} seconds`;
  
      if (time <= 0) {
        clearInterval(timer);
        nextQuestion();
      }
    }, 1000);
};


// Hàm hiển thị câu hỏi và các đáp án ------------------------------------------------------------------------------------------------

const displayQuestion = (questionData) => {

  // Đặt lại bộ đếm thời gian
  clearInterval(timer);
  clearTimeout(nextQuestionTimeout);
    
  // Xáo trộn bộ câu hỏi
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
          answeredQuestionsCount++;
          if (answer === questionData.correctAnswer) {
            button.classList.add('answer-button-correct');
            correctAnswersCount++;
            console.log(correctAnswersCount);
          } else {
            button.classList.add('answer-button-wrong');
            showResults();
        }
        nextQuestionTimeout = setTimeout(nextQuestion, 2000);
      };
    }
  });

  // Cập nhật số thứ tự câu hỏi
  if (questionCounterElement) {
    questionCounterElement.textContent = `Question ${currentQuestionIndex + 1} of ${data.length}`;
  }
  startTimer(15);
};

// Hàm xử lý giá trị hiển thị tạo trang Result ---------------------------------------------------------------------------------------

const displayResults = (results) => {
  const resultSummary = document.querySelector("#result-summary");
  if (resultSummary) {
    resultSummary.innerHTML = `
      <p style="font-size: 20px; margin-bottom: 20px;">Total Questions: ${results.totalQuestions}</p>
      <p style="font-size: 20px; margin-bottom: 20px;">Correct Answers: ${results.correctAnswers}</p>
      <p style="font-size: 20px; margin-bottom: 20px;">Wrong Answers: ${results.wrongAnswers}</p>
    `;
  }
};

const displayScore = (scores) => {
  const resultScore = document.querySelector("#result-score");
  if (resultScore) {
    resultScore.innerHTML = `<p style="font-size: 20px; margin-bottom: 20px;">Your Score: ${scores.score}</p>`;
  }
};


// Các hàm chuyển trang -------------------------------------------------------------------------------------------------------------

const nextQuestion = () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < data.length) {
    displayQuestion(data[currentQuestionIndex]);
  } else {
    showResults();
    
  }
};

const exitQuestion = () => {
  showResults();
};

const showResults = () => {
  quizElement.classList.remove('open');
  resultsElement.classList.remove('hidden');
  startElement.classList.add('hidden');

  // Hàm hiển thị kết quả
  const totalQuestions = data.length;
  const wrongAnswers = answeredQuestionsCount - correctAnswersCount;
  const score = correctAnswersCount*10;
  console.log(score);

  const userResults = {
    totalQuestions: totalQuestions,
    correctAnswers: correctAnswersCount,
    wrongAnswers: wrongAnswers,
  };
  const userScore = {
    score: score,
  };

  // Hiển thị kết quả khi trang được tải
  displayResults(userResults);
  displayScore(userScore);
};

const showQuiz = () => {
  quizElement.classList.add('open');
  resultsElement.classList.add('hidden');
  startElement.classList.add('hidden');

  currentQuestionIndex = 0;
  correctAnswersCount = 0;  
  answeredQuestionsCount = 0; 
  displayQuestion(data[currentQuestionIndex]);
};


// Hàm chính để khởi tạo và xử lý dữ liệu -------------------------------------------------------------------------------------------

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