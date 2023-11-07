//Henter inn eller lager de få statiske HTML elementene jeg trenger.
const scoreContainer = document.querySelector(".scorecontainer");

const scoreCount = document.querySelector(".scorecontainer h1");

const balloonContainer = document.querySelector(".ballooncontainer");

const muteLabel = document.querySelector("#muteLabel");

const mute = document.querySelector("#mute");

const endGameText = document.createElement("h3");

const restartBtn = makeElement("button", {
  className: "btn",
  textContent: "Try Again?",
});

const highScoreTracker = document.createElement("h2");

const titleText = makeElement("p", {
  className: "header",
  textContent: "Typing Survivor",
});

const heartContainer = makeElement("div", { className: "heartcontainer" });

const startGameBtn = makeElement("button", {
  className: "btn",
  textContent: "Start Game!",
});

const difficultySelector = makeElement("select", { className: "selector" });

//lager et objekt for vanskelighetsgrad. Ved å legge til et nytt objekt i objektet, legges en ny vanskelighetsgrad til automatisk.
const difficultyObject = {
  easy: {
    maxLife: 5,
    time: 1125,
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
    maxLife: 5,
    time: 375,
    maxBalloon: 50,
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

//Har et object, hvor eg predefinerer standard values for de globale variablene mine,
// både for å kunne lage alle global variablene on load, men også sånn at jeg kan lett sette de tilbake senere hvis jeg trenger.
const baseValues = {
  score: 0,
  highScore: 0,
  balloonSpawner: null,
  balloonTimer: null,
  life: 5,
  maxBalloon: 0,
  stopped: true,
  totalBalloonCount: 0,
  gameObjects: {
    hiddenInput: {
      isActive: false,
    },
    balloons: {},
    currentHearts: [],
  },
};

//lager alle globale variabler jeg trenger i starten.
//Gir alle "default" verdier så de blir lastet inn i memory.
//bruker dekonstruering av baseValues objectet for å lage alle variablene eg har i baseValues objektet.

let {
  score,
  highScore,
  balloonSpawner,
  balloonTimer,
  life,
  maxBalloon,
  stopped,
  totalBalloonCount,
  gameObjects,
} = baseValues;

//Lager et object for sound effects og bakgrunnsmusikk, har en .folder som viser hvor de skal hentes. så en for hver fil.
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
    highScore: {
      file: "/NewHighScore.mp3",
    }, // <---- dette kommaet skaper litt problemer ser eg, siden den leter etter en (soundeffects undefined.) får ikke fjerna det pga prettier. antar ting fremdeles funker
  },
};

//lager bakgrunnsmusikkElementet
soundElements.backgroundMusic.audioEl = makeElement("audio", {
  src: `${soundElements.backgroundMusic.folder}${soundElements.backgroundMusic.file}`,
  volume: "0.2",
  loop: "true",
});

//lager soundeffect element for hver sound effect.
Object.keys(soundElements.soundEffects).forEach((soundeffect) => {
  soundElements.soundEffects[soundeffect].audioEl = makeElement("audio", {
    src: `${soundElements.soundEffects.folder}${soundElements.soundEffects[soundeffect].file}`,
    volume: "0.4",
  });
});

//Her Lager jeg difficultyselection + alle options i en forEach loop.
//bruker Object.keys for å lage et array for alle keys i difficultyObject
Object.keys(difficultyObject).forEach((difficulty) => {
  difficultySelector.appendChild(
    makeElement("option", {
      textContent: difficultyObject[difficulty].text,
      value: Object.keys(difficultyObject).indexOf(difficulty),
      className: "difficulty",
    })
  );
});

//Appender det som skal appendes.
scoreContainer.appendChild(highScoreTracker);

scoreContainer.appendChild(heartContainer);

mobileCheck();

showMenu();

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

//lager en funksjon for å appende tittel, knapp og selector, fjerner også evt endgame menyen om den er til stede.
function showMenu() {
  //fjerner endgamescreen, hvis den eksisterer.
  if (gameObjects.endGameScreen) gameObjects.endGameScreen.remove();
  gameObjects.endGameScreen = null;
  balloonContainer.appendChild(titleText);
  balloonContainer.appendChild(startGameBtn);
  balloonContainer.appendChild(difficultySelector);
}

//fjerner tittel, knapper og select fra skjermen.
function removeMenu() {
  titleText.remove();
  startGameBtn.remove();
  difficultySelector.remove();
}

//Funksjon som lager sluttmenyen etter spillet er ferdig.
function endGameMenu() {
  const endGameScreen = makeElement("div", { className: "endGameScreen" });
  balloonContainer.appendChild(endGameScreen);
  endGameScreen.appendChild(endGameText);
  //hvis en ny highscore er registrert, vis new high score!
  if (gameObjects.newHighScore) {
    let highScoreText = makeElement("p", { textContent: "New High Score!" });
    endGameScreen.appendChild(highScoreText);
  }
  endGameScreen.appendChild(restartBtn);
  //setter texten til å vise score.
  endGameText.textContent = `You Scored ${score}!`;
  gameObjects.endGameScreen = endGameScreen;
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

/* HighScore funksjoner */

//funksjon som henter highscores fra local storage om de finnes.
function getHighScore() {
  //prøver å hente highscore fra local storage.
  //experimenterer med å få localStorage til å virke.
  //experimenterer med å lage forskjellige highscores for hver difficulty.
  //har skjønt at siden localStorage bare vil ha strings, kan jeg bruke Object.keys igjen. For da får jeg ut hver "key" som en string.
  //kan bruke dette for å lage en identifier i localStorage for hver vanskelighetsgrad. Hvilken "key" er bestemt av valuen til selector.
  //Siden value til selector alltid vil samsvare til en index i på Object.keys(difficultyObject) arrayet, så funker dette bra.
  let difficulty = Object.keys(difficultyObject)[difficultySelector.value];
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
  let difficulty = Object.keys(difficultyObject)[difficultySelector.value];
  highScore = score;
  localStorage.removeItem(difficulty);
  localStorage.setItem(difficulty, JSON.stringify(highScore));
  highScoreTracker.textContent = `HighScore: ${highScore}`;
}

/* RESET, RESTART */

//Funksjon som resetter spillet ved spillstart.
function reset() {
  //definerer global variables til det det skal være basert på difficulty
  let difficulty =
    difficultyObject[Object.keys(difficultyObject)[difficultySelector.value]];
  life = difficulty.maxLife;
  maxBalloon = difficulty.maxBalloon;
  time = difficulty.time;
  //ser om det finnes en highScore for difficulty.
  getHighScore();
  //resetter score og totalBalloonCount til baseValues
  score = baseValues.score;
  totalBalloonCount = baseValues.totalBalloonCount;
  scoreCount.textContent = `Score: ${baseValues.score}`;
  //starter balloonspawner og den som skjekker anntallet balloons.
  balloonSpawner = setInterval(spawnBalloon, time);
  balloonTimer = setInterval(balloonCountCheck, time);
  //tømmer gameObjects objektet.
  gameObjects = baseValues.gameObjects;
}

//denne funksjonen kjører når spillet blir startet.
function gameStart() {
  reset();
  //setter life, time og maxballoons til det som er bestemt av vanskelighetsgraden
  displayLife();
  //fjerner startknappen og difficulty selector
  removeMenu();
  //starter bakgrunnsmusikk
  if (!mute.checked) soundElements.backgroundMusic.audioEl.play();
}

//funksjon for å stoppe musikken igjen.
function stopMusic() {
  soundElements.backgroundMusic.audioEl.pause();
  soundElements.backgroundMusic.audioEl.currentTime = 0;
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
function findBalloonElement(letter) {
  //Jeg vil bare fjerne en og en balloon. Gjør dette ved å hente elementArrayet mitt i gameObjects objectet.
  //definerer en ny variabel som elementarrayet, så det blir litt mer ryddig hva jeg sender videre inn i balloonAnimation.
  let balloons = gameObjects.balloons[letter].balloonElements;
  //sender første arrayet inn i balloonAnimation.
  balloonAnimation(balloons[0]);
  //fjerner det første elementet i arrayet.
  //å bruke shift her var den mest ryddige måten å gjøre det på, uten å trenge loop. .pop() skapte problemer med at den prøvde å fjerne samme element om igjen og om igjen.
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
function balloonCountCheck() {
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
    if (!mute.checked) soundElements.soundEffects.error.audioEl.play();
    return;
  } else {
    //send bokstaven videre til balloonselector.
    findBalloonElement(letter);
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
    //pusher det nye elementet til gameObjects.currentHearts array.
    gameObjects.currentHearts.push(heart);
  }
}

//funksjon som fjerner liv og hjerter.
function removeLife() {
  //finner alle hjerteikonene som er igjen.
  let hearts = gameObjects.currentHearts;
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
  clearInterval(balloonTimer);
  //jeg fjerner alle balloons som finnes.
  let balloons = document.querySelectorAll(".balloon");
  balloons.forEach((balloon) => balloon.remove());
  //resetter balloon objektet.
  gameObjects.balloons = {};

  //hvis man spiller på mobil, rengjør hiddenInput.
  if (gameObjects.hiddenInput.isActive) {
    gameObjects.hiddenInput.inputEl.blur();
    gameObjects.hiddenInput.inputEl.value = "";
  }
  //skjekker om det er kommet en ny high score.
  if (score > highScore) {
    gameObjects.newHighScore = score;
    soundElements.soundEffects.highScore.audioEl.play();
    saveHighScore();
  } else gameObjects.newHighScore = null;
  //Viser menyen igjen og setter stopped til true, sånn at alle keypress utenom enter blir ignorert.
  stopMusic();
  //lager en endgame div og appender den til ballooncontainer
  endGameMenu();
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
  //Hvis spillet har startet i mobil mode, eller hvis spillet er stoppet og en annen knapp enn Enter er trykket, gjør ingenting.
  if (
    (stopped && keyStroke.code !== "Enter") ||
    gameObjects.hiddenInput.isActive
  )
    return;
  //Hvis spillet er stoppet, og enter er trykket, start spillet.
  else if (stopped && keyStroke.code === "Enter") {
    //hvis endscreen er der, lukk den først med showMenu();
    if (gameObjects.endGameScreen) showMenu();
    else {
      stopped = false;
      gameStart();
    }
    //Hvis spillet er startet, kjør gameEvent for hver knapp.
    //bruker toUppercase for å normalisere inputen til stor bokstav.
  } else gameEvent(keyStroke.key.toUpperCase());
});

//en liten eventlistener på knappen i endgame menyen, for å lukke endgame.
restartBtn.addEventListener("click", showMenu);

//Eventlistener for mute knapp. ser etter "change" på checkboxen "mute".
mute.addEventListener("click", () => {
  if (!mute.checked) {
    //bruker stopped variabelen her for å se om spillet kjører. Hvis ikke spillet kjører fortsetter den til neste.
    if (!stopped) soundElements.backgroundMusic.audioEl.play();
    muteLabel.classList.remove("muteActive");
    muteLabel.textContent = "Mute Sounds?";
  } else {
    muteLabel.classList.add("muteActive");
    muteLabel.textContent = "Muted!";
    stopMusic();
  }
});

/* EVENT LISTENER FOR MOBIL */

//legger på en eventListener i tilfelle hiddenInput er laget.
if (gameObjects.hiddenInput.isActive) {
  gameObjects.hiddenInput.inputEl.addEventListener(
    "beforeinput",
    (touchedKey) => {
      //hvis noe blir copypasta inn, isteden for en og en bokstav, ignorer det.
      if (touchedKey.data.length > 1) return;
      //bruker toUpperCase her også, bare for å standarisere input.
      else gameEvent(touchedKey.data.toUpperCase());
    }
  );
  //eventlistener på balloonContainer i tilfelle bruker klikker vekk tastaturet.
  balloonContainer.addEventListener("click", () => {
    if (!stopped) {
      gameObjects.hiddenInput.inputEl.focus({ preventScroll: true });
    } else return;
  });
}
