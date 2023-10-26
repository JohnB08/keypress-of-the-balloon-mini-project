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
const highScoreTracker = document.createElement("h2");
scoreContainer.appendChild(highScoreTracker);
const heartContainer = document.createElement("div");
heartContainer.classList.add("heartcontainer");
let startGameBtn = document.createElement("button");
startGameBtn.classList.add("btn");
startGameBtn.textContent = "Start Game!";
balloonContainer.appendChild(startGameBtn);
let score = 0;
let highScore = 0;
highScoreTracker.textContent = `Highscore: ${highScore}`;
let balloonSpawner = null;
let life = 5;
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
startGameBtn.addEventListener("click", (event) => {
  life = 5;
  score = 0;
  scoreCount.textContent = `Score: ${score}`;
  startGameBtn.remove("");
  balloonSpawner = setInterval(spawnBalloon, 500);
  scoreContainer.appendChild(heartContainer);
  lifeCount();
});
document.addEventListener("keydown", (event) => {
  let balloons = document.querySelectorAll(".balloon");
  let letters = document.querySelectorAll("p");
  let prevScore = score;
  for (let i = 0; i < balloons.length; i++) {
    if (event.code === `Key${letters[i].textContent}`) {
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
  if (life === 0) {
    clearInterval(balloonSpawner);
    let ballons = document.querySelectorAll(".balloon");
    for (let ballon of ballons) {
      ballon.remove();
    }
    if (score > highScore) {
      highScore = score;
      highScoreTracker.textContent = `HighScore: ${highScore}`;
    }
    balloonContainer.appendChild(startGameBtn);
  }
});
