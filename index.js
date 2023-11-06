//Henter inn eller lager de få statiske HTML elementene jeg trenger.
const scoreContainer = document.querySelector(".scorecontainer");

const scoreCount = document.querySelector(".scorecontainer h1");

const balloonContainer = document.querySelector(".ballooncontainer");

const highScoreTracker = document.createElement("h2");

const heartContainer = makeElement("div", { className: "heartcontainer" });

const startGameBtn = makeElement("button", {
  className: "btn",
  textContent: "Start Game!",
});

const difficultySelector = makeElement("select", { className: "selector" });

//lager et objektarray for vanskelighetsgrad. Ved å legge til et nytt objekt her, legges en ny vanskelighetsgrad til automatisk.
const difficultySelection = {
  easy: {
    maxLife: 5,
    time: 750,
    maxBalloon: 50,
    text: "Easy",
  },
  medium: {
    maxLife: 5,
    time: 750,
    maxBalloon: 50,
    text: "Medium",
  },
  hard: {
    maxLife: 3,
    time: 750,
    maxBalloon: 25,
    text: "Hard",
  },
  veryHard: {
    maxLife: 3,
    time: 375,
    maxBalloon: 25,
    text: "Very Hard",
  },
  apocalypse: {
    maxLife: 1,
    time: 375,
    maxBalloon: 25,
    text: "Apocalypse Mode",
  },
};
//Appender det som skal appendes.
scoreContainer.appendChild(highScoreTracker);

scoreContainer.appendChild(heartContainer);

mobileCheck();

showMenu();

//test object, prøver noe greier.
const baseValues = {
  score: 0,
  highScore: 0,
  balloonSpawner: null,
  lifeTimer: null,
  life: 5,
  maxBalloon: 0,
  stopped: true,
  totalBalloonCount: 0,
  gameObjects: {},
  currentHearts: [],
};

//predefinerer variabler jeg trenger til spillet.
//Gir alle "default" verdier så de blir lastet inn i memory.
//bruker dekonstruering av baseValues objectet for å sette alle variablene til verdien de har i baseValues.

let {
  score,
  highScore,
  balloonSpawner,
  lifeTimer,
  life,
  maxBalloon,
  stopped,
  totalBalloonCount,
  gameObjects,
  currentHearts,
} = baseValues;
gameObjects.hiddenInput = {};
gameObjects.balloons = {};
gameObjects.hiddenInput.isActive = false;

//Lager et object for sound effects, og hvor de er lagret, så jeg kan hente det inn senere.
const soundElements = {
  backgroundMusic: {
    folder: "./music",
    file: "/Beat Mekanik - Nocturnal.mp3",
  },
  soundEffects: {
    folder: "./soundeffect",
    error: {
      file: "/Error.mp3",
    },
  },
};

//lager bakgrunnsmusikkElementet
soundElements.backgroundMusic.audioEl = makeElement("audio", {
  src: `${soundElements.backgroundMusic.folder}${soundElements.backgroundMusic.file}`,
  volume: "0.2",
});

//lager audio element for error
soundElements.soundEffects.error.audioEl = makeElement("audio", {
  src: `${soundElements.soundEffects.folder}${soundElements.soundEffects.error.file}`,
  volume: "0.5",
});

//Her Lager jeg difficultyselection + alle options i en for Each loop.
Object.keys(difficultySelection).forEach((difficulty) => {
  difficultySelector.appendChild(
    makeElement("option", {
      textContent: difficultySelection[difficulty].text,
      value: Object.keys(difficultySelection).indexOf(difficulty),
      className: "difficulty",
    })
  );
});

/* Utility og MediaQuery */

//Funksjon som lager element, tar in to ting:
//string som er hvilken type element, og et object array med propertynavn -> property value, pluss initial CSS class, og hvor den skal appendes.
function makeElement(type, properties) {
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
}

//lager en funksjon for å appende knapp og selector.
function showMenu() {
  balloonContainer.appendChild(startGameBtn);
  balloonContainer.appendChild(difficultySelector);
}

//fjerner knapper og select fra skjermen.
function removeMenu() {
  startGameBtn.remove();
  difficultySelector.remove();
}

//prøver å gjøre spillet compatible på tlf med en hack
//kjører en funksjon på load som ser om viewporten er smal nok til å være en mobilskjerm, og lager en skjult inputfield under ballooncontainer.
function mobileCheck() {
  if (window.innerWidth > 600) return;
  else {
    let hiddenInput = makeElement("input", {
      type: "text",
      className: "hiddenInput",
    });
    gameObjects.hiddenInput.inputEl = hiddenInput;
    gameObjects.hiddenInput.isActive = true;
    balloonContainer.appendChild(hiddenInput);
  }
}

/* RESET, RESTART */

//Funksjon som resetter spillet ved spillstart.
function reset() {
  //setter life, time og maxBalloon basert på difficulty objekt.
  let difficulty =
    difficultySelection[
      Object.keys(difficultySelection)[difficultySelector.value]
    ];
  console.log(difficulty);
  life = difficulty.maxLife;
  maxBalloon = difficulty.maxBalloon;
  time = difficulty.time;
  getHighScore();
  //resetter score og totalBalloonCount til 0
  score = baseValues.score;
  totalBalloonCount = baseValues.totalBalloonCount;
  scoreCount.textContent = `Score: ${baseValues.score}`;
  //starter balloonspawner og den som skjekker anntallet balloons.
  balloonSpawner = setInterval(spawnBalloon, time);
  lifeTimer = setInterval(balloonChecker, time);
  //tømmer gameObjects objektet.
  gameObjects = baseValues.gameObjects;
}

function getHighScore() {
  //prøver å hente highscore fra local storage.
  //experimenterer med å få localStorage til å virke.
  //experimenterer med å lage forskjellige highscores for hver difficulty.
  let difficulty = Object.keys(difficultySelection)[difficultySelector.value];
  if (!localStorage.getItem(difficulty)) {
    highScore = baseValues.highScore;
    highScoreTracker.textContent = `HighScore: ${highScore}`;
  } else {
    let savedHighScore = JSON.parse(localStorage.getItem(difficulty));
    highScoreTracker.textContent = `HighScore: ${savedHighScore}`;
    highScore = savedHighScore;
  }
}

//Lagrer ny highscore i localstorage hvis ny highscore er registrert i gameOver().
//lagrer en highscore i localStorage til browser pr difficulty.
function saveHighScore() {
  let difficulty = Object.keys(difficultySelection)[difficultySelector.value];
  highScore = score;
  localStorage.removeItem(difficulty);
  localStorage.setItem(difficulty, JSON.stringify(highScore));
  highScoreTracker.textContent = `HighScore: ${highScore}`;
}

//denne funksjonen kjører når spillet blir startet.
function gameStart() {
  reset();
  //setter life, time og maxballoons til det som er bestemt av vanskelighetsgraden
  displayLife();
  //fjerner startknappen og difficulty selector
  removeMenu();
  //soundElements.backgroundMusic.audioEl.play();
}

/* SPILL FUNKSJONER. */

//spawnBalloon funksjon. Lager en firkant med tekst i, og plasserer den en tilfeldig plass i balooncontainer elementet.
function spawnBalloon() {
  //Genererer en random uppercase bokstav. Her bruker jeg toString(36).
  //enkelt forklart så bestemmer toString() når 10 skal være 10, når er man ferdig å telle til ti.
  //Den teller først gjennom alle tall fra 0-9, så alle små bokstaver a-z, før den igjen starter på 0. totalt 36 tegn.
  //tallet inni () i toString() bestemmer hvor langt den skal telle før den treffer 0.
  //toString(36) betyr at jeg vil at den skal telle gjennom alle tegnene. Jeg setter +10 Math.random stykket, sånn at den alltid hopper over tallene 0-9.
  //bruker toUpperCase fordi jeg vil at bokstaven skal være tydlig.
  let randomLetter = (Math.floor(Math.random() * 26) + 10)
    .toString(36)
    .toUpperCase();
  //genererer en random x koordinat
  let xCoordinate = Math.floor(Math.random() * 80) + 5;
  //genererer en random y koordinat
  //passer på at det alltid er litt luft fra kanten.
  let yCoordinate = Math.floor(Math.random() * 80) + 5;
  //kjører makeElement funksjonen, og gir div class balloon, og random x/y coordinater.
  let balloon = makeElement("div", {
    style: `top: ${yCoordinate}%; left: ${xCoordinate}%;`,
    textContent: randomLetter,
    className: "balloon",
  });
  balloonContainer.appendChild(balloon);
  totalBalloonCount++;
  //Lager en if else, for å se om balloon med bokstav er blitt spawnet allerede.
  //Denne if/else statementen + objectet som lages, gjør at jeg kan ha samme funksjonalitet som før rewrite
  //uten å måtte querySelectorAll etter .balloon classen som tidligere.
  if (!gameObjects.balloons[balloon.textContent]) {
    //lager et object, i gameObjects for denne bokstaven. Sender inn et element som er et Array av alle elementer hittil spawnet.
    gameObjects.balloons[balloon.textContent] = {
      balloonElements: [balloon],
    };
  } else {
    //hvis objectet allerede er spawnet, pusher jeg det nye elementet til balloonElements Arrayet.
    gameObjects.balloons[balloon.textContent].balloonElements.push(balloon);
  }
}

//funksjon som kjøres hvis en balloon er funnet.
function balloonSelector(letter) {
  //Jeg vil bare fjerne en og en balloon. Gjør dette ved å hente elementArrayet mitt i gameObjects objectet.
  //definerer en ny variabel som elementarrayet, så det blir litt mer ryddig hva jeg sender videre inn i balloonAnimation.
  let balloons = gameObjects.balloons[letter].balloonElements;
  //sender første arrayet inn i balloonAnimation.
  balloonAnimation(balloons[0]);
  //fjerner det første elementet i arrayet.
  balloons.shift();
  totalBalloonCount--;
  return;
}

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
async function balloonRemover(balloon) {
  new Promise((resolve) => {
    //set timeout som arrow function sånn at eg kan ha flere argumenter som skal bli kjørt når delayet er over.
    setTimeout(() => {
      balloon.remove();
      resolve();
    }, 300);
  });
}

//Skjekker hvor mange balloons som er laget, og fjerner liv hvis antallet går over et treshhold.
function balloonChecker() {
  if (totalBalloonCount > maxBalloon) {
    removeLife();
  }
}

//hovedfunksjon for spillet. Sammenligner knapper og ballongcontent, og ser om ballonger skal fjernes.
function gameEvent(letter) {
  //skjekker om en balloon med den teksten i det hele tatt er blitt spawna, eller om det er noen igjen i element arrayet.
  if (
    !gameObjects.balloons[letter] ||
    gameObjects.balloons[letter].balloonElements.length === 0
  ) {
    //hvis bokstaven ikke er spawnet, eller alle elementene er vekke. mist liv.
    removeLife();
    soundElements.soundEffects.error.audioEl.play();
    return;
  } else {
    //send bokstaven videre til balloonselector.
    balloonSelector(letter);
  }
}

/* HP DISPLAY AND LIFE MANIPULATION */

//Displayer hjerteSVG over balooncontainer basert på hvor mange liv man starter med.
function displayLife() {
  for (let i = 0; i < life; i++) {
    let heart = makeElement("img", {
      src: "./img/life.svg",
      className: "heart",
    });
    heartContainer.appendChild(heart);
    //pusher det nye elementet til currentHearts array.
    currentHearts.push(heart);
  }
}

//funksjon som fjerner liv og hjerter.
function removeLife() {
  //finner alle hjerteikonene som er igjen.
  let hearts = currentHearts;
  //fjerner en av de.
  hearts[0].remove();
  //prøvde å bruke push pop her, men den slet med å finne rett html element uten loop, hvis jeg gjorde det sånn. Nå trenger jeg ikke en loop.
  hearts.shift();
  life--;
  //skjekker om vi har tapt.
  if (life === 0) gameOver();
}

//denne funksjonen kjører kun når life har blitt 0
function gameOver() {
  //her stopper jeg begge intervallene.
  clearInterval(balloonSpawner);
  clearInterval(lifeTimer);
  //jeg fjerner alle balloons som finnes.
  let balloons = document.querySelectorAll(".balloon");
  balloons.forEach((balloon) => balloon.remove());
  //resetter balloon objektet.
  gameObjects.balloons = {};
  //skjekker om det er kommet en ny high score.
  if (score > highScore) saveHighScore();
  //Viser menyen igjen og setter stopped til true, sånn at alle keypress utenom enter blir ignorert.
  showMenu();
  //soundElements.backgroundMusic.audioEl.pause();
  stopped = true;
}

/* EVENT LISTENERS */

//Hvis man bruker knappen for å starte spillet.
startGameBtn.addEventListener("click", () => {
  stopped = false;
  //prøver å lage en skjult input, som knappen fokuserer på hvis man er på mobiltlf.
  if (window.innerWidth < 600) {
    gameObjects.hiddenInput.inputEl.focus({ preventScroll: true });
  }
  gameStart();
});

//Legger på en eventListener til hele dokumentet. Denne ser etter tastetrykk. Blir ignorert hvis man er på mobiltlf.
document.addEventListener("keydown", (keyStroke) => {
  //Hvis spillet er stoppet, men enter er IKKE trykket, gjør ingenting.
  if (
    (stopped && keyStroke.code !== "Enter") ||
    gameObjects.hiddenInput.isActive
  )
    return;
  //Hvis spillet er stoppet, og enter er trykket, start spillet.
  else if (stopped && keyStroke.code === "Enter") {
    stopped = false;
    gameStart();
    //Hvis spillet er startet, kjør gameEvent for hver knapp.
    //bruker toUppercase for å normalisere inputen til stor bokstav.
  } else gameEvent(keyStroke.key.toUpperCase());
});

/* EVENT LISTENER FOR MOBIL */

//legger på en eventListener i tilfelle hiddenInput er laget.
if (gameObjects.hiddenInput.isActive) {
  gameObjects.hiddenInput.inputEl.addEventListener(
    "beforeinput",
    (touchedKey) => {
      //bruker toUpperCase her også, bare for å standarisere input.
      gameEvent(touchedKey.data.toUpperCase());
    }
  );
  //eventlistener på balloonContainer i tilfelle bruker klikker vekk tastaturet.
  balloonContainer.addEventListener("click", () =>
    gameObjects.hiddenInput.inputEl.focus({ preventScroll: true })
  );
}
