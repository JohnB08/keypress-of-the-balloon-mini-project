const scoreContainer = document.querySelector(".scorecontainer");
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

const spawnBalloon = () => {
  let balloon = document.createElement("div");
  balloon.classList.add("balloon");
  balloon.style.top = `${Math.floor(Math.random() * 90)}%`;
  balloon.style.left = `${Math.floor(Math.random() * 90)}%`;
  let balloonLetter = document.createElement("p");
  balloonLetter.textContent =
    alphabet[Math.floor(Math.random() * alphabet.length)];
  balloonContainer.appendChild(balloon);
  balloon.appendChild(balloonLetter);
};
setInterval(spawnBalloon, 3000);
document.addEventListener("keydown", (event) => {
  let balloons = document.querySelectorAll(".balloon");
  let letters = document.querySelectorAll("p");
  for (let i = 0; i < balloons.length; i++) {
    if (event.code === `Key${letters[i].textContent}`) balloons[i].remove();
  }
});
