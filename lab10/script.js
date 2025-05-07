const nicknameContainer = document.getElementById("nickname-container");
const gameContainer = document.getElementById("game-container");
const gameOverContainer = document.getElementById("game-over");
const scoreboardContainer = document.getElementById("scoreboard");
const playerNameSpan = document.getElementById("player-name");
const wordDisplay = document.getElementById("word-display");
const keyboardDiv = document.getElementById("keyboard");
const scoreValue = document.getElementById("score-value");
const timeLeft = document.getElementById("time-left");
const scoreList = document.getElementById("score-list");

let words = [];
let currentWord = "";
let guessedLetters = [];
let wrongGuessCount = 0;
let score = 0;
let timer;

document.getElementById("start-btn").onclick = () => {
  const nickname = document.getElementById("nickname-input").value.trim();
  if (!nickname) return alert("Нэрээ оруулна уу!");
  document.cookie = `nickname=${nickname}`;
  playerNameSpan.textContent = nickname;
  nicknameContainer.classList.add("hidden");
  gameContainer.classList.remove("hidden");
  startGame();
};

document.getElementById("restart-btn").onclick = () => {
  location.reload();
};

function loadWords() {
  return fetch("words.json")
    .then((res) => res.json())
    .then((data) => (words = data.words));
}

function pickRandomWord() {
  const index = Math.floor(Math.random() * words.length);
  const entry = words[index];
  const question = Object.keys(entry)[0];
  const answer = entry[question].toUpperCase(); // үгийг том үсгээр

  document.getElementById("question").textContent = question; // HTML дээр асуулт харуулах

  return answer;
}

function displayWord() {
  wordDisplay.innerHTML = "";
  for (let letter of currentWord) {
    const span = document.createElement("span");
    span.textContent = guessedLetters.includes(letter) ? letter : "";
    wordDisplay.appendChild(span);
  }
}

function drawHangman() {
  const canvas = document.getElementById("hangman-canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (wrongGuessCount > 0) {
    ctx.beginPath();
    ctx.arc(100, 40, 20, 0, Math.PI * 2); // (x, y, radius, startAngle, endAngle)
    ctx.stroke(); // хүрээтэй дугуй
    ctx.fill(); // хэрвээ дотор нь дүүргэмээр байвал
  }
  if (wrongGuessCount > 1) ctx.fillRect(95, 60, 10, 40); // Body
  if (wrongGuessCount > 2) ctx.fillRect(75, 60, 20, 10); // Left Arm
  if (wrongGuessCount > 3) ctx.fillRect(105, 60, 20, 10); // Right Arm
  if (wrongGuessCount > 4) ctx.fillRect(85, 100, 10, 30); // Left Leg
  if (wrongGuessCount > 5) ctx.fillRect(100, 100, 10, 30); // Right Leg

  if (wrongGuessCount >= 6) {
    gameOver();
  }
}

// function createKeyboard() {
//   keyboardDiv.innerHTML = "";
//   for (let i = 65; i <= 90; i++) {
//     const btn = document.createElement("button");
//     btn.textContent = String.fromCharCode(i);
//     btn.onclick = () => handleGuess(btn.textContent);
//     keyboardDiv.appendChild(btn);
//   }
// }

function createKeyboard() {
  const mongolLetters = [
    "А",
    "Б",
    "В",
    "Г",
    "Д",
    "Е",
    "Ё",
    "Ж",
    "З",
    "И",
    "Й",
    "К",
    "Л",
    "М",
    "Н",
    "О",
    "Ө",
    "П",
    "Р",
    "С",
    "Т",
    "У",
    "Ү",
    "Ф",
    "Х",
    "Ц",
    "Ч",
    "Ш",
    "Щ",
    "Ъ",
    "Ь",
    "Ы",
    "Э",
    "Ю",
    "Я",
  ];

  keyboardDiv.innerHTML = "";
  for (let letter of mongolLetters) {
    const btn = document.createElement("button");
    btn.textContent = letter;
    btn.onclick = () => handleGuess(letter);
    keyboardDiv.appendChild(btn);
    console.log("letter : ", letter);
  }
}

function handleGuess(letter) {
  if (guessedLetters.includes(letter)) return;
  guessedLetters.push(letter);

  if (currentWord.includes(letter)) {
    displayWord();
    if (currentWord.split("").every((l) => guessedLetters.includes(l))) {
      score++;
      scoreValue.textContent = score;
      setTimeout(() => nextWord(), 1000);
    }
  } else {
    wrongGuessCount++;
    drawHangman();
  }
}

function startTimer() {
  let time = 60;
  timer = setInterval(() => {
    time--;
    timeLeft.textContent = time;
    if (time === 0) {
      clearInterval(timer);
      endGame();
    }
  }, 1000);
}

function startGame() {
  score = 0;
  wrongGuessCount = 0;
  guessedLetters = [];
  loadWords().then(() => {
    createKeyboard();
    nextWord();
    startTimer();
  });
}

// function nextWord() {
//   currentWord = pickRandomWord();
//   guessedLetters = [];
//   wrongGuessCount = 0;
//   drawHangman();
//   displayWord();
// }

function nextWord() {
  // Enable all letter buttons again
  document.querySelectorAll("#keyboard button").forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove("guessed-correct", "guessed-wrong");
  });

  currentWord = pickRandomWord();
  guessedLetters = [];
  wrongGuessCount = 0;
  drawHangman();
  displayWord();
}

function endGame() {
  alert("Тоглоом дууслаа!");
  const nickname = document.cookie
    .split("; ")
    .find((r) => r.startsWith("nickname"))
    .split("=")[1];
  const saved = JSON.parse(localStorage.getItem("topPlayers") || "[]");
  saved.push({ nickname, score });
  saved.sort((a, b) => b.score - a.score);
  const top10 = saved.slice(0, 10);
  localStorage.setItem("topPlayers", JSON.stringify(top10));

  if (top10.find((p) => p.nickname === nickname)) {
    alert("Баяр хүргэе! Та топ 10-д орлоо.");
  }

  showScoreboard(top10);
}

function gameOver() {
  clearInterval(timer);
  gameContainer.classList.add("hidden");
  gameOverContainer.classList.remove("hidden");
}

function showScoreboard(players) {
  scoreboardContainer.classList.remove("hidden");
  scoreList.innerHTML = "";
  players.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = `${p.nickname} — ${p.score}`;
    scoreList.appendChild(li);
  });
}

function handleGuess(letter) {
  if (guessedLetters.includes(letter)) return;
  guessedLetters.push(letter);

  const buttons = document.querySelectorAll("#keyboard button");
  buttons.forEach((btn) => {
    if (btn.textContent === letter) {
      btn.disabled = true;
      if (currentWord.includes(letter)) {
        btn.classList.add("guessed-correct");
      } else {
        btn.classList.add("guessed-wrong");
      }
    }
  });

  if (currentWord.includes(letter)) {
    displayWord();
    if (currentWord.split("").every((l) => guessedLetters.includes(l))) {
      score++;
      scoreValue.textContent = score;
      setTimeout(() => nextWord(), 1000);
    }
  } else {
    wrongGuessCount++;
    drawHangman();
  }
}
