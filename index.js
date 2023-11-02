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
//Gir alle "default" verdier så de blir lastet inn i memory.
let score = 0;
scoreCount.textContent = `Score: ${score}`;
let highScore = 0;
//Prefedinerer timerene mine i memory.
let balloonSpawner = null;
let lifeTimer = null;
let life = 5;
let maxBalloon = 0;
//bruker stopped variabelen så ingen kode blir kjørt av tastetrykk før spillet starter.
let stopped = true;
let balloonCount = 0;
//Lager et tomt object som jeg kan fylle med key/value pairs for å se om en bokstav er spawnet eller ikke.
let spawnedBalloon = {};

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
  //genererer en random y koordinat
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
  //Lager en if else, for å se om balloon med bokstav er blitt spawnet allerede.
  //Denne if/else statementen + objectet som lages, gjør at jeg kan ha samme funksjonalitet som før rewrite,
  //men trenger ikke kjøre document.querySelectorAll før jeg faktisk må fjerne et html element.
  if (!spawnedBalloon[balloon.textContent]) {
    //lager et object, i spawnedBalloon for denne bokstaven.
    spawnedBalloon[balloon.textContent] = { count: 1 };
  } else {
    //hvis objectet allerede er spawnet, setter eg exists til true, og inkrementer count.
    spawnedBalloon[balloon.textContent].count++;
  }
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
  //finner alle hjerteikonene som er igjen.
  let hearts = document.querySelectorAll(".heart");
  //fjerner en av de.
  hearts[life - 1].remove();
  life--;
  //skjekker om vi har tapt.
  if (life === 0) noLife();
};

//Skjekker hvor mange balloons som er laget, og fjerner liv hvis antallet går over et treshhold.
const balloonChecker = () => {
  if (balloonCount > maxBalloon) {
    removeLife();
  }
};

//denne funksjonen kjører kun når life har blitt 0
const noLife = () => {
  //her stopper jeg begge intervallene.
  clearInterval(balloonSpawner);
  clearInterval(lifeTimer);
  //jeg fjerner alle balloons
  let balloons = document.querySelectorAll(".balloon");
  balloons.forEach((balloon) => balloon.remove());
  //skjekker om det er kommet en ny high score.
  if (score > highScore) saveHighScore();
  //resetter knapp og setter stopped til true, sånn at alle keypress utenom enter blir ignorert.
  showMenu();
  stopped = true;
};

//Funksjon som resetter spillet ved spillstart.
function reset() {
  //setter life, time og maxBalloon basert på difficulty objekt.
  let difficulty = difficultySelection[difficultySelector.value];
  life = difficulty.maxLife;
  maxBalloon = difficulty.maxBalloon;
  time = difficulty.time;
  //resetter score og balloonCount til 0
  score = 0;
  balloonCount = 0;
  scoreCount.textContent = `Score: ${score}`;
  //starter balloonspawner og den som skjekker anntallet balloons.
  balloonSpawner = setInterval(spawnBalloon, time);
  lifeTimer = setInterval(balloonChecker, time);
  //tømmer spawnedBalloon objektet.
  spawnedBalloon = {};
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
//funksjon som kjøres hvis en balloon er funnet.
const balloonSelector = (letter) => {
  //Jeg vil bare fjerne en og en balloon, vet ikke om det er noen annen måte å gjøre det på, siden balloons er en nodeList. .find fungerer ikke så vidt jeg vet.
  let balloons = document.querySelectorAll(".balloon");
  for (let i = 0; i < balloons.length; i++) {
    if (balloons[i].textContent === letter) {
      balloonAnimation(balloons[i]);
      balloonCount--;
      return;
    }
  }
};

//hovedfunksjon for spillet. Sammenligner knapper og ballongcontent, og ser om ballonger skal fjernes.
function gameEvent(keyStroke) {
  let letter = keyStroke.key.toUpperCase();
  //skjekker om en balloon med den teksten i det hele tatt er blitt spawna.
  if (!spawnedBalloon[letter] || !spawnedBalloon[letter].count) {
    removeLife();
    return;
  } else {
    //siden balloonSelector fjerner alle balloons med den bokstaven, sier jeg at de nå er vekk.
    spawnedBalloon[letter].count--;
    balloonSelector(letter);
  }
}

//bruker knappen for å starte spillet.
startGameBtn.addEventListener("click", (event) => {
  stopped = false;
  gameStart();
});
//legger på en event listener som input til spillet.
document.addEventListener("keydown", (keyStroke) => {
  //Hvis spillet er stoppet, men enter er IKKE trykket, gjør ingenting.
  if (stopped && keyStroke.code !== "Enter") return;
  //Hvis spillet er stoppet, og enter er trykket, start spillet.
  else if (stopped && keyStroke.code === "Enter") {
    stopped = false;
    gameStart();
    //Hvis spillet er startet, kjør gameEvent for hver knapp.
  } else gameEvent(keyStroke);
});
