//Henter inn eller lager de få statiske HTML elementene jeg trenger.
const scoreContainer = document.querySelector(".scorecontainer");

const scoreCount = document.querySelector(".scorecontainer h1");

const balloonContainer = document.querySelector(".ballooncontainer");

const highScoreTracker = document.createElement("h2");

const heartContainer = document.createElement("div");

const startGameBtn = document.createElement("button");

const difficultySelector = document.createElement("select");

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

showMenu();

//adder styling til det som trenger styling.
heartContainer.classList.add("heartcontainer");

startGameBtn.classList.add("btn");

startGameBtn.textContent = "Start Game!";

difficultySelector.classList.add("selector");

//prøver å gjøre spillet compatible på tlf med en hack
const mobileCheck = () => {
  if (window.innerWidth > 800) return;
  else {
    let hiddenInput = makeElement("input", { type: "text" }, "hiddenInput");
    document.body.appendChild(hiddenInput);
  }
};

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
  balloonObject: {},
  currentHearts: [],
};

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
//predefinerer variabler jeg trenger til spillet.
//Gir alle "default" verdier så de blir lastet inn i memory.
score = baseValues.score;
highScore = baseValues.highScore;
balloonSpawner = baseValues.balloonSpawner;
lifeTimer = baseValues.lifeTimer;
life = baseValues.life;
maxBalloon = baseValues.maxBalloon;
stopped = baseValues.stopped;
totalBalloonCount = baseValues.totalBalloonCount;
balloonObject = baseValues.balloonObject;
currentHearts = baseValues.currentHearts;

/* ON LOAD FUNCTIONS */

//Funksjon som lager element, tar in to ting:
//string som er hvilken type element, og et object array med propertynavn -> property value, pluss initial CSS class, og hvor den skal appendes.
const makeElement = (type, properties, className) => {
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
  element.classList.add(className);
  return element;
};

mobileCheck();
console.log(document);

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
    makeElement(
      "option",
      {
        textContent: difficultySelection[difficulty].text,
        value: Object.keys(difficultySelection).indexOf(difficulty),
      },
      "difficulty"
    )
  );
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

/* HP DISPLAY AND LIFE MANIPULATION */

//Displayer hjerteSVG over balooncontainer basert på hvor mange liv man starter med.
const lifeCount = () => {
  for (let i = 0; i < life; i++) {
    let heart = makeElement("img", { src: "./img/life.svg" }, "heart");
    heartContainer.appendChild(heart);
    //pusher det nye elementet til currentHearts array.
    currentHearts.push(heart);
  }
};

//funksjon som fjerner liv og hjerter.
const removeLife = () => {
  //finner alle hjerteikonene som er igjen.
  let hearts = currentHearts;
  //fjerner en av de.
  hearts[0].remove();
  //prøvde å bruke push pop her, men den slet med å finne rett html element uten loop, hvis jeg gjorde det sånn. Nå trenger jeg ikke en loop.
  hearts.shift();
  life--;
  //skjekker om vi har tapt.
  if (life === 0) noLife();
};

//denne funksjonen kjører kun når life har blitt 0
const noLife = () => {
  //her stopper jeg begge intervallene.
  clearInterval(balloonSpawner);
  clearInterval(lifeTimer);
  //jeg fjerner alle balloons som finnes. Velger å bruke querySelectorAll her, siden jeg skal fjerne ALLE, slipper å loope gjennom hvert bokstavarray.
  let balloons = document.querySelectorAll(".balloon");
  balloons.forEach((balloon) => balloon.remove());
  //skjekker om det er kommet en ny high score.
  if (score > highScore) saveHighScore();
  //Viser menyen igjen og setter stopped til true, sånn at alle keypress utenom enter blir ignorert.
  showMenu();
  soundElements.backgroundMusic.audioEl.pause();
  stopped = true;
};

/* RESET, RESTARTS & UTILITY */

//Funksjon som resetter spillet ved spillstart.
function reset() {
  //setter life, time og maxBalloon basert på difficulty objekt.
  let difficulty = Object.keys(difficultySelection)[difficultySelector.value];
  life = difficultySelection[difficulty].maxLife;
  maxBalloon = difficultySelection[difficulty].maxBalloon;
  time = difficultySelection[difficulty].time;
  //resetter score og totalBalloonCount til 0
  score = baseValues.score;
  totalBalloonCount = baseValues.totalBalloonCount;
  scoreCount.textContent = `Score: ${baseValues.score}`;
  //starter balloonspawner og den som skjekker anntallet balloons.
  balloonSpawner = setInterval(spawnBalloon, time);
  lifeTimer = setInterval(balloonChecker, time);
  //tømmer balloonObject objektet.
  balloonObject = baseValues.balloonObject;
}

//Lagrer ny highscore i localstorage hvis det har skjedd i noLife().
const saveHighScore = () => {
  highScore = score;
  localStorage.removeItem("highScore");
  localStorage.setItem("highScore", JSON.stringify(highScore));
  highScoreTracker.textContent = `HighScore: ${highScore}`;
};

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
  soundElements.backgroundMusic.audioEl.play();
};

/* BALLOON MANIPULATON */

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

//Skjekker hvor mange balloons som er laget, og fjerner liv hvis antallet går over et treshhold.
const balloonChecker = () => {
  if (totalBalloonCount > maxBalloon) {
    removeLife();
  }
};

//funksjon som kjøres hvis en balloon er funnet.
const balloonSelector = (letter) => {
  //Jeg vil bare fjerne en og en balloon. Gjør dette ved å hente elementArrayet mitt i balloonObject objectet.
  let balloons = balloonObject[letter].balloonElements;
  //sender første arrayet inn i balloonAnimation.
  balloonAnimation(balloons[0]);
  //fjerner det første elementet i arrayet.
  balloons.shift();
  totalBalloonCount--;
  return;
};

//spawnBalloon funksjon. Lager en firkant med tekst i, og plasserer den en tilfeldig plass i balooncontainer elementet.
const spawnBalloon = () => {
  //Genererer en random uppercase bokstav.
  let randomLetter = (Math.floor(Math.random() * 26) + 10)
    .toString(36)
    .toUpperCase();
  //genererer en random x koordinat
  let xCoordinate = Math.floor(Math.random() * 80) + 5;
  //genererer en random y koordinat
  //passer på at det alltid er litt luft fra kanten.
  let yCoordinate = Math.floor(Math.random() * 80) + 5;
  //kjører makeElement funksjonen, og gir div class balloon, og random x/y coordinater.
  let balloon = makeElement(
    "div",
    {
      style: `top: ${yCoordinate}%; left: ${xCoordinate}%;`,
      textContent: randomLetter,
    },
    "balloon"
  );
  balloonContainer.appendChild(balloon);
  totalBalloonCount++;
  //Lager en if else, for å se om balloon med bokstav er blitt spawnet allerede.
  //Denne if/else statementen + objectet som lages, gjør at jeg kan ha samme funksjonalitet som før rewrite
  //uten å måtte querySelectorAll etter .balloon classen som tidligere.
  if (!balloonObject[balloon.textContent]) {
    //lager et object, i balloonObject for denne bokstaven. Sender inn et element som er et Array av alle elementer hittil spawnet.
    balloonObject[balloon.textContent] = {
      balloonElements: [balloon],
    };
  } else {
    //hvis objectet allerede er spawnet, pusher jeg det nye elementet til balloonElements Arrayet.
    balloonObject[balloon.textContent].balloonElements.push(balloon);
  }
  console.log(balloonObject[balloon.textContent].balloonElements);
};

//hovedfunksjon for spillet. Sammenligner knapper og ballongcontent, og ser om ballonger skal fjernes.
function gameEvent(keyStroke) {
  let letter = keyStroke.key.toUpperCase();
  //skjekker om en balloon med den teksten i det hele tatt er blitt spawna.
  if (
    !balloonObject[letter] ||
    balloonObject[letter].balloonElements.length === 0
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

/* EVENT LISTENERS */

//Hvis man bruker knappen for å starte spillet.
startGameBtn.addEventListener("click", (event) => {
  stopped = false;
  if (window.innerWidth < 800) hiddenInput.focus();
  gameStart();
});
//Legger på en eventListener til hele dokumentet.
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
