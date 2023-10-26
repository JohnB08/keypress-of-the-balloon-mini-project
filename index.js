const scoreContainer = document.querySelector(".scorecontainer");
const balloonContainer = document.querySelector(".ballooncontainer");

const spawnBalloon = () => {
  let balloon = document.createElement("div");
  balloon.classList.add("balloon");
  balloon.style.top = `${Math.floor(Math.random() * 90)}%`;
  balloon.style.left = `${Math.floor(Math.random() * 90)}%`;
  balloonContainer.appendChild(balloon);
};
setInterval(spawnBalloon, 5000);
