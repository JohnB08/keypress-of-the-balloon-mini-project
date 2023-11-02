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
    maxBalloon: 25,
    text: "Easy",
  },
  {
    maxLife: 5,
    time: 500,
    maxBalloon: 25,
    text: "Medium",
  },
  {
    maxLife: 3,
    time: 500,
    maxBalloon: 25,
    text: "Hard",
  },
  {
    maxLife: 3,
    time: 350,
    maxBalloon: 25,
    text: "Very Hard",
  },
  {
    maxLife: 1,
    time: 350,
    maxBalloon: 25,
    text: "Apocalypse Mode",
  },
];

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
let maxBalloon = 0;
//bruker stopped variabelen så ingen kode blir kjørt av tastetrykk før spillet starter.
let stopped = true;
let balloonCount = 0;

//Funksjon som lager element, tar in to ting:
//string som er hvilken type element, og et object array med propertynavn -> property value.
const makeElement = (type, properties) => {
  const element = document.createElement(type);

  //tar alle keys og values og gjør de om til key/value arrays.
  const elementProperties = Object.entries(properties);
  elementProperties.forEach((property) => {
    //dekonstrukter hvert key/value array til to variabler:
    const [propertyName, propertyValue] = property;
    //setter hver property til elementet:
    //bruker bracketnotations, siden bracketnotation tar in en string i steden for et keyword
    //da kan vi bruke propertyName variablen, siden den alltid vil være en string.
    element[propertyName] = propertyValue;
  });
  return element;
};

//Her Lager jeg difficultyselection + alle options i en for Each loop.
difficultySelection.forEach((difficulty) => {
  let difficultyChoice = makeElement("option", {
    textContent: difficulty.text,
    value: difficultySelection.indexOf(difficulty),
  });
  difficultySelector.appendChild(difficultyChoice);
});

//prøver å hente highscore fra local storage.
//experimenterer med å få localStorage til å virke.
if (!localStorage.getItem("highScore")) {
  highScoreTracker.textContent = `HighScore: ${highScore}`;
} else {
  let savedHighScore = JSON.parse(localStorage.getItem("highScore"));
  highScoreTracker.textContent = `HighScore: ${savedHighScore}`;
  highScore = savedHighScore;
}

//sammenligner score og highscore, printer ny highscore hvis den finner.
//bruker denne funksjonen på slutten av spillet.
const saveHighScore = () => {
  //arrow functions har implied return når de er ferdig.
  highScore = score;
  localStorage.removeItem("highScore");
  localStorage.setItem("highScore", JSON.stringify(highScore));
  highScoreTracker.textContent = `HighScore: ${highScore}`;
};

//spawnBalloon funksjon. Lager en firkant med tekst i, og plasserer den en tilfeldig plass i balooncontainer elementet.
const spawnBalloon = () => {
  //velger en random bokstav fra alfabet arrayet.
  let randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
  //genererer en random x koordinat
  let xCoordinate = Math.floor(Math.random() * 80) + 5;
  //genererer en random y coordinat
  //passer på at det alltid er litt luft fra kanten.
  let yCoordinate = Math.floor(Math.random() * 80) + 5;
  //kjører makeElement funksjonen, og gir div class balloon, og random x/y coordinater.
  let balloon = makeElement("div", {
    style: `top: ${yCoordinate}%; left: ${xCoordinate}%;`,
    textContent: randomLetter,
  });
  balloon.classList.add("balloon");
  balloonContainer.appendChild(balloon);
  balloonCount++;
  //legger bokstaven inn i balloon
};

//ved å gjøre balloon animation async, så kan balloonRemover "promise" en "resolve" før balloonAnimation er ferdig.
//tar inn en ballong som parrameter.
async function balloonAnimation(balloon) {
  balloon.classList.add("popped");
  score++;
  scoreCount.textContent = `Score: ${score}`;
  //her setter eg await balloonRemover, sånn at funksjonen "pauses" til balloonRemover sender "resolve"
  //sender samme ballongen videre inn i balloonRemover.
  await balloonRemover(balloon);
  return;
}

//balloonRemover funksjonen sender et "promise to resolve" ut sånn at balloonAnimation vet når setTimeout er ferdig.
//dette betyr at animasjonen som er knytta til popped classen blir spilt i 300ms før balloon fjernes.
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
    let heart = makeElement("img", { src: "./img/life.svg" });
    heart.classList.add("heart");
    heartContainer.appendChild(heart);
  }
};

//funksjon som fjerner liv og hjerter.
const removeLife = () => {
  //skjekker om vi har ta
  let hearts = document.querySelectorAll(".heart");
  hearts[life - 1].remove();
  life--;
  if (life === 0) noLife();
};

//Skjekker hvor mange balloons som er laget, og fjerner liv hvis antallet går over et treshhold.
const balloonChecker = () => {
  if (balloonCount > maxBalloon) {
    removeLife();
  }
  //kjører no-life for å se om man er død.
};

//denne funksjonen kjører kun når life har blitt 0
const noLife = () => {
  //her stopper jeg begge intervallene.
  clearInterval(balloonSpawner);
  clearInterval(lifeTimer);
  //jeg fjerner alle balloon
  let balloons = document.querySelectorAll(".balloon");
  balloons.forEach((balloon) => balloon.remove());
  //skjekker om det er kommet en ny high score.
  if (score > highScore) saveHighScore();
  //resetter knapp og setter stopped til true, sånn at alle keypress utenom enter blir ignorert.
  showMenu();
  stopped = true;
};

//setter life, time og maxBalloon basert på difficulty objekt.
function reset() {
  let difficulty = difficultySelection[difficultySelector.value];
  life = difficulty.maxLife;
  maxBalloon = difficulty.maxBalloon;
  time = difficulty.time;
  //resetter score til 0, i tilfelle
  score = 0;
  scoreCount.textContent = `Score: ${score}`;
  //starter balloonspawner og den som skjekker anntallet balloons.
  balloonSpawner = setInterval(spawnBalloon, time);
  lifeTimer = setInterval(balloonChecker, time);
}

//setter knapp og select inn på skjermen.
function showMenu() {
  balloonContainer.appendChild(startGameBtn);
  balloonContainer.appendChild(difficultySelector);
}

//fjerner knapper og select fra skjermen.
function removeMenu() {
  startGameBtn.remove();
  difficultySelector.remove();
}

//denne funksjonen kjører når spillet blir startet.
const gameStart = () => {
  reset();
  //setter life, time og maxballoons til det som er bestemt av vanskelighetsgraden
  lifeCount();
  //fjerner startknappen og difficulty selector
  removeMenu();
};
//hovedfunksjon for spillet. Sammenligner knapper og ballongcontent, og ser om ballonger skal fjernes.
function gameEvent(keyStroke) {
  //skjekker om det finnes en balloon, og skjekker hva innholdet er.
  let balloons = document.querySelectorAll(".balloon");
  let balloonExists = false;
  //lager en loop som looper gjennom alle balloons som finnes når en knapp blir trykket.
  balloons.forEach((balloon) => {
    //skjekker om knappen som ble trykket i eventet ovenfor er ligt .code til tastaturknappene til bokstaver.
    if (keyStroke.key === balloon.textContent.toLowerCase()) {
      //sender ballongen statementen over finner inn i balloonAnimation
      balloonAnimation(balloon);
      balloonExists = true;
      balloonCount--;
      return;
    }
  });
  if (!balloonExists) removeLife();
}

//bruker knappen for å starte spillet.
startGameBtn.addEventListener("click", (event) => {
  stopped = false;
  gameStart();
});
//legger på en event listener som input til spillet.
document.addEventListener("keydown", (keyStroke) => {
  if (keyStroke.code !== "Enter") {
    //bruker stopped her for å passe på at random taster ikke registreres så lenge spillet ikke er startet.
    if (stopped) return;
    else gameEvent(keyStroke);
  } else {
    //starter spillet hvis Enter er trykket.
    stopped = false;
    gameStart();
  }
});
