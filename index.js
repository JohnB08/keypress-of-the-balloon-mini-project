const scoreContainer = document.querySelector(".scorecontainer");
const balloonContainer = document.querySelector(".ballooncontainer");

const spawnBalloon = () => {
  let balloon = document.createElement("div");
  balloon.classList.add("balloon");
  balloonContainer.appendChild(balloon);
};
setInterval(spawnBalloon, 5000);
