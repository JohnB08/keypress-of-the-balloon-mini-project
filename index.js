const scoreContainer = document.querySelector(".scorecontainer h1");
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
let score = 0;
const spawnBalloon = () => {
  let balloon = document.createElement("div");
  balloon.classList.add("balloon");
  //ballongene spawner med minst 5% luft mot kanten av kontaineren.
  balloon.style.top = `${Math.floor(Math.random() * 90) + 5}%`;
  balloon.style.left = `${Math.floor(Math.random() * 90) + 5}%`;
  let balloonLetter = document.createElement("p");
  balloonLetter.textContent =
    alphabet[Math.floor(Math.random() * alphabet.length)];
  balloonContainer.appendChild(balloon);
  balloon.appendChild(balloonLetter);
};
setInterval(spawnBalloon, 1500);
document.addEventListener("keydown", (event) => {
  let balloons = document.querySelectorAll(".balloon");
  let letters = document.querySelectorAll("p");
  for (let i = 0; i < balloons.length; i++) {
    if (event.code === `Key${letters[i].textContent}`) {
      balloons[i].remove();
      score++;
      scoreContainer.textContent = `Score: ${score}`;
    }
  }
});
