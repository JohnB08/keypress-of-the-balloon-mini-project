//Henter inn fra HTML det jeg trenger.
const scoreContainer = document.querySelector(".scorecontainer");

const scoreCount = document.querySelector(".scorecontainer h1");

const balloonContainer = document.querySelector(".ballooncontainer");

const highScoreTracker = document.createElement("h2");

const heartContainer = document.createElement("div");

const startGameBtn = document.createElement("button");

const difficultySelector = document.createElement("select");

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
//lager et objektarray for vanskelighetsgrad. Ved å legge til et nytt objekt her, legges en ny vanskelighetsgrad til automatisk.
const difficultySelection = [
  {
    maxLife: 5,
    time: 1000,
    maxBalloon: 50,
    text: "Easy",
  },
  {
    maxLife: 5,
    time: 500,
    maxBalloon: 50,
    text: "Medium",
  },
  {
    maxLife: 3,
    time: 250,
    maxBalloon: 50,
    text: "Hard",
  },
  {
    maxLife: 1,
    time: 250,
    maxBalloon: 25,
    text: "Very Hard",
  },
];

//Her Lager jeg difficultyselection + alle options i en loop.
for (let i = 0; i < difficultySelection.length; i++) {
  difficultySelector.innerHTML += `<option value="${i}">${difficultySelection[i].text}</option>`;
}

//Appender det som skal appendes.
scoreContainer.appendChild(highScoreTracker);

scoreContainer.appendChild(heartContainer);

showMenu();

//adder styling til det som trenger styling.
heartContainer.classList.add("heartcontainer");

startGameBtn.classList.add("btn");

startGameBtn.textContent = "Start Game!";

difficultySelector.classList.add("selector");

//predefinerer variabler jeg trenger til spillet.
let score = 0;
scoreCount.textContent = `Score: ${score}`;
let highScore = 0;
let balloonSpawner = null;
let life = 5;
let maxBalloon = 50;
//bruker stopped variabelen så ingen kode blir kjørt av tastetrykk før spillet starter.
let stopped = true;

//prøver å hente highscore fra local storage.
//experimenterer med å få localStorage til å virke, har ikke helt fått det til.
if (!localStorage.getItem("highScore")) {
  highScoreTracker.textContent = `HighScore: ${highScore}`;
} else {
  let savedHighScore = JSON.parse(localStorage.getItem("highScore"));
  highScoreTracker.textContent = `HighScore: ${savedHighScore}`;
  highScore = savedHighScore;
}
//spawnBalloon funksjon. Lager en firkant med tekst i, og plasserer den en tilfeldig plass i balooncontainer elementet.
const spawnBalloon = () => {
  let balloon = document.createElement("div");
  balloon.classList.add("balloon");
  //plasserer de randomly i balloonContainer. men alltid med litt luft til kanten.
  balloon.style.top = `${Math.floor(Math.random() * 80) + 5}%`;
  balloon.style.left = `${Math.floor(Math.random() * 80) + 5}%`;
  //lager innholdet i ballongen.
  let balloonLetter = document.createElement("p");
  balloonLetter.textContent =
    alphabet[Math.floor(Math.random() * alphabet.length)];
  //legger balloon inn i ballooncontainer
  balloonContainer.appendChild(balloon);
  //legger bokstaven inn i balloon
  balloon.appendChild(balloonLetter);
};

//ved å gjøre balloon animation async, så kan balloonRemover "promise" en "resolve" før balloonAnimation er ferdig.
async function balloonAnimation(balloon) {
  balloon.classList.add("popped");
  score++;
  scoreCount.textContent = `Score: ${score}`;
  //her setter eg await balloonRemover, sånn at funksjonen "pauses" til balloonRemover sender "resolve"
  await balloonRemover(balloon);
  return;
}
//balloonRemover funksjonen sender et "promise to resolve" ut sånn at balloonAnimation vet når setTimeout er ferdig.
balloonRemover = (balloon) => {
  new Promise((resolve) => {
    //set timeout som arrow function sånn at eg kan ha flere argumenter som skal bli kjørt når delayet er over.
    setTimeout(() => {
      balloon.remove();
      resolve();
    }, 300);
  });
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
};
const saveHighScore = () => {
  //arrow functions har implied return når de er ferdig.
  highScore = score;
  localStorage.removeItem("highScore");
  localStorage.setItem("highScore", JSON.stringify(highScore));
  highScoreTracker.textContent = `HighScore: ${highScore}`;
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
//denne funksjonen kjører kun når life har blitt 0
const noLife = () => {
  if (life !== 0) return;
  else {
    //her stopper jeg begge intervallene.
    clearInterval(balloonSpawner);
    clearInterval(lifeTimer);
    //jeg fjerner alle balloon
    let balloons = document.querySelectorAll(".balloon");
    for (let balloon of balloons) {
      balloon.remove();
    }
    //skjekker om det er kommet en ny high score.
    if (score > highScore) saveHighScore();
    //resetter knapp og difficulty selection.
    showMenu();
    stopped = true;
  }
};
function reset() {
  let difficulty = difficultySelection[difficultySelector.value];
  life = difficulty.maxLife;
  maxBalloon = difficulty.maxBalloon;
  time = difficulty.time;
}
function showMenu() {
  balloonContainer.appendChild(startGameBtn);
  balloonContainer.appendChild(difficultySelector);
}
//denne funksjonen kjører når spillet starter.
const gameStart = () => {
  reset();
  //setter life, time og maxballoons til det som er bestemt av vanskelighetsgraden
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
//hovedfunksjon for spillet. Skjekker om ballonger fjernes osv.
function gameEvent(keyStroke) {
  if (stopped) return;
  //skjekker om det finnes en balloon, og skjekker hva innholdet er.
  let balloons = document.querySelectorAll(".balloon");
  let letters = document.querySelectorAll("p");
  //lager en prevScore variabel jeg bruker senere å se om score går opp.
  //lager en loop som looper gjennom alle balloons som finnes når en knapp blir trykket.
  for (let i = 0; i < balloons.length; i++) {
    //skjekker om knappen som ble trykket i eventet ovenfor er ligt .code til tastaturknappene til bokstaver.
    if (keyStroke.code === `Key${letters[i].textContent}`) {
      //endringer hvis dette stemmer, fjerner balloon dette stemmer for, og score går opp.
      //disse to gjør ingenting enda.
      balloonAnimation(balloons[i]);
      return;
    }
  }
  removeLife();
  //skjekker på slutten av funksjonen om man er død.
  noLife();
}

//bruker knappen for å starte spillet.
startGameBtn.addEventListener("click", (event) => {
  stopped = false;
  gameStart();
});
//legger på en event listener som input til spillet.
document.addEventListener("keydown", (keyStroke) => {
  if (keyStroke.code === "Enter") {
    //bruker stopped her for å passe på at enter tasten ikke influerer spillet.
    if (stopped) {
      stopped = false;
      gameStart();
    }
  } else {
    //legger keyStroke inn som parrameter, dermed kan keyStroke.code brukes i gameEvent.
    gameEvent(keyStroke);
  }
});
