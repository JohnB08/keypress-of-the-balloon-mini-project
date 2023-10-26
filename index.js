const scoreContainer = document.querySelector(".scorecontainer");
const scoreCount = document.querySelector(".scorecontainer h1");
const balloonContainer = document.querySelector(".ballooncontainer");
const alphabet = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];
const difficultySelection = [
  {
    maxLife: 5,
    time: 500,
    maxBalloon: 50,
  },
  {
    maxLife: 3,
    time: 250,
    maxBalloon: 50,
  },
  {
    maxLife: 1,
    time: 250,
    maxBalloon: 25,
  },
];
const highScoreTracker = document.createElement("h2");
scoreContainer.appendChild(highScoreTracker);
const heartContainer = document.createElement("div");
heartContainer.classList.add("heartcontainer");
const startGameBtn = document.createElement("button");
startGameBtn.classList.add("btn");
startGameBtn.textContent = "Start Game!";
const difficultySelector = document.createElement("select");
const easyDifficulty = document.createElement("option");
easyDifficulty.value = "0";
easyDifficulty.text = "Lett";
difficultySelector.add(easyDifficulty);
const mediumDifficulty = document.createElement("option");
mediumDifficulty.value = "1";
mediumDifficulty.text = "Medium";
difficultySelector.add(mediumDifficulty);
const hardDifficulty = document.createElement("option");
hardDifficulty.value = "2";
hardDifficulty.text = "Hard";
difficultySelector.add(hardDifficulty);
balloonContainer.appendChild(startGameBtn);
balloonContainer.appendChild(difficultySelector);
difficultySelector.classList.add("selector");
let score = 0;
let highScore = 0;
if (!localStorage.getItem("highscore")) {
  highScoreTracker.textContent = `highscore: ${highScore}`;
} else {
  let savedHighScore = JSON.parse(localStorage.getItem("highScore"));
  highScoreTracker.textContent = `Highscore: ${savedHighScore}`;
  highScore = number(savedHighScore);
}
let balloonSpawner = null;
let life = 5;
let maxBalloon = 50;
const spawnBalloon = () => {
  let balloon = document.createElement("div");
  balloon.classList.add("balloon");
  //ballongene spawner med minst 5% luft mot kanten av kontaineren.
  balloon.style.top = `${Math.floor(Math.random() * 85) + 5}%`;
  balloon.style.left = `${Math.floor(Math.random() * 85) + 5}%`;
  let balloonLetter = document.createElement("p");
  balloonLetter.textContent =
    alphabet[Math.floor(Math.random() * alphabet.length)];
  balloonContainer.appendChild(balloon);
  balloon.appendChild(balloonLetter);
};
const lifeCount = () => {
  for (let i = 0; i < life; i++) {
    const heart = document.createElement("img");
    heart.src = "./img/life.svg";
    heart.classList.add("heart");
    heartContainer.appendChild(heart);
  }
};
const balloonChecker = () => {
  let balloons = document.querySelectorAll(".balloon");
  console.log(balloons.length);
  if (balloons.length > maxBalloon) {
    let hearts = document.querySelectorAll(".heart");
    hearts[life - 1].remove();
    life--;
  }
  noLife();
};
const noLife = () => {
  if (life === 0) {
    clearInterval(balloonSpawner);
    clearInterval(lifeTimer);
    let ballons = document.querySelectorAll(".balloon");
    for (let ballon of ballons) {
      ballon.remove();
    }
    if (score > highScore) {
      highScore = score;
      localStorage.removeItem("highScore");
      localStorage.setItem("highScore", JSON.stringify(highScore));
      highScoreTracker.textContent = `HighScore: ${highScore}`;
    }
    balloonContainer.appendChild(startGameBtn);
    balloonContainer.appendChild(difficultySelector);
    console.log(localStorage.getItem("highScore"));
  }
};
const gameStart = () => {
  let difficulty = difficultySelection[difficultySelector.value];
  life = difficulty.maxLife;
  maxBalloon = difficulty.maxBalloon;
  score = 0;
  scoreCount.textContent = `Score: ${score}`;
  startGameBtn.remove();
  balloonSpawner = setInterval(spawnBalloon, difficulty.time);
  lifeTimer = setInterval(balloonChecker, difficulty.time);
  scoreContainer.appendChild(heartContainer);
  lifeCount();
  difficultySelector.remove();
  document.addEventListener("keydown", (keyStroke) => {
    let balloons = document.querySelectorAll(".balloon");
    let letters = document.querySelectorAll("p");
    let prevScore = score;
    for (let i = 0; i < balloons.length; i++) {
      if (keyStroke.code === `Key${letters[i].textContent}`) {
        balloons[i].remove();
        score++;
        scoreCount.textContent = `Score: ${score}`;
      }
    }
    if (prevScore === score) {
      let hearts = document.querySelectorAll(".heart");
      hearts[life - 1].remove();
      life--;
      console.log(life);
    }
    noLife();
  });
};
startGameBtn.addEventListener("click", (event) => {
  gameStart();
});
document.addEventListener("keydown", (event) => {
  let gameHasNotStarted = document.querySelector("button");
  if (gameHasNotStarted) gameStart();
});
