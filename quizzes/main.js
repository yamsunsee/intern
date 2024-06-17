
const BASE_URL = "https://api4interns.vercel.app/api/v1/questions";

const questions = document.querySelector("#questions");

const handleFetchData = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status) return data.data;
    else throw new Error("Failed to fetch data!");
  } catch (error) {
    window.alert(error);
    return [];
  }
};

const main = async () => {
  const data = await handleFetchData(BASE_URL);
  questions.innerText = JSON.stringify(data);
};

main();
