//Henter inn fra HTML det jeg trenger.
const scoreContainer = document.querySelector(".scorecontainer");
const scoreCount = document.querySelector(".scorecontainer h1");
const balloonContainer = document.querySelector(".ballooncontainer");
//Lager array av hele alfabetet på engelsk.
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
//lager et objektarray for vanskelighetsgrad.
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

//Lager alle elementene jeg trenger for å kjøre spillet.
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

//predefinerer variabler jeg trenger til spillet.
let score = 0;
let highScore = 0;
let balloonSpawner = null;
let life = 5;
let maxBalloon = 50;
let dead = true;
//experimenterer med å få localStorage til å virke, har ikke helt fått det til.
if (!localStorage.getItem("highscore")) {
  highScoreTracker.textContent = `highscore: ${highScore}`;
} else {
  let savedHighScore = JSON.parse(localStorage.getItem("highScore"));
  highScoreTracker.textContent = `Highscore: ${savedHighScore}`;
  highScore = number(savedHighScore);
}
//spawnBalloon funksjon. Lager en firkant med tekst i, og plasserer den en tilfeldig plass i balooncontainer elementet.
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

//Displayer hjerteSVG over balooncontainer basert på hvor mange liv man starter med.
const lifeCount = () => {
  for (let i = 0; i < life; i++) {
    const heart = document.createElement("img");
    heart.src = "./img/life.svg";
    heart.classList.add("heart");
    heartContainer.appendChild(heart);
  }
};
//funksjon som fjerner liv og hjerter.
const removeLife = () => {
  let hearts = document.querySelectorAll(".heart");
  hearts[life - 1].remove();
  life--;
  console.log(life);
};
//Skjekker hvor mange balloons som er laget, og fjerner liv hvis antallet går over et treshhold.
const balloonChecker = () => {
  let balloons = document.querySelectorAll(".balloon");
  if (balloons.length > maxBalloon) {
    removeLife();
  }
  //kjører no-life for å se om man er død.
  noLife();
};
//denne funksjonen kjører kunn når life har blitt 0
const noLife = () => {
  if (life === 0) {
    //her stopper jeg begge intervallene.
    clearInterval(balloonSpawner);
    clearInterval(lifeTimer);
    //jeg fjerner alle balloon
    let ballons = document.querySelectorAll(".balloon");
    for (let ballon of ballons) {
      ballon.remove();
    }
    //skjekker om det er kommet en ny high score.
    if (score > highScore) {
      highScore = score;
      //igjen har ikke fått localStorage til å virke
      localStorage.removeItem("highScore");
      localStorage.setItem("highScore", JSON.stringify(highScore));
      highScoreTracker.textContent = `HighScore: ${highScore}`;
    }
    //resetter knapp og difficulty selection.
    balloonContainer.appendChild(startGameBtn);
    balloonContainer.appendChild(difficultySelector);
    console.log(localStorage.getItem("highScore"));
    dead = true;
  }
};
function reset() {
  let difficulty = difficultySelection[difficultySelector.value];
  console.log(difficultySelector.value);
  console.log(difficulty.maxLife);
  life = difficulty.maxLife;
  maxBalloon = difficulty.maxBalloon;
  time = difficulty.time;
}
//denne funksjonen kjører når spillet starter.
const gameStart = () => {
  reset();
  //setter life, time og maxballoons til det som er bestemt av vanskelighetsgraden
  scoreContainer.appendChild(heartContainer);
  lifeCount();
  //fjerner startknappen og difficulty selector
  startGameBtn.remove();
  difficultySelector.remove();
  //resetter score til 0
  score = 0;
  scoreCount.textContent = `Score: ${score}`;
  //starter balloonspawner og den som skjekker anntallet.
  balloonSpawner = setInterval(spawnBalloon, time);
  lifeTimer = setInterval(balloonChecker, time);
};

//bruker knappen for å starte spillet.
startGameBtn.addEventListener("click", (event) => {
  dead = false;
  gameStart();
});
//legger på en event listener som input til spillet.
document.addEventListener("keydown", (keyStroke) => {
  if (keyStroke.code === "Enter") {
    let hasNotStarted = document.querySelector("button");
    if (hasNotStarted) {
      dead = false;
      gameStart();
    }
  }
  if (dead) return;
  //skjekker om det finnes en balloon, og skjekker hva innholdet er.
  let balloons = document.querySelectorAll(".balloon");
  let letters = document.querySelectorAll("p");
  //lager en prevScore variabel jeg bruker senere å se om score går opp.
  let prevScore = score;
  //lager en loop som looper gjennom alle balloons som finnes når en knapp blir trykket.
  for (let i = 0; i < balloons.length; i++) {
    //skjekker om knappen som ble trykket i eventet ovenfor er ligt .code til tastaturknappene til bokstaver.
    if (keyStroke.code === `Key${letters[i].textContent}`) {
      //endringer hvis dette stemmer, fjerner balloon dette stemmer for, og score går opp.
      balloons[i].remove();
      score++;
      scoreCount.textContent = `Score: ${score}`;
    }
  }
  //hvis en knapp blir trykket på, men score ikke har endra seg, så blir et liv fjerna.
  if (prevScore === score) {
    removeLife();
  }
  //skjekker på slutten av eventet om man er død.
  noLife();
});
