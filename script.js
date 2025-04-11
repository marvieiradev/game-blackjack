var dealerSum = 0,
  playerSum = 0;
var dealerAceCount = 0,
  playerAceCount = 0;
var hidden,
  deck,
  canHit = true;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const click = new Audio("audio/click.mp3");

window.onload = function () {
  buildDeck();
  shuffleDeck();
  startGame();
};

function buildDeck() {
  let values = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];
  let types = ["C", "D", "H", "S"];
  deck = [];

  for (let i = 0; i < types.length; i++) {
    for (let j = 0; j < values.length; j++) {
      deck.push(values[j] + "-" + types[i]);
    }
  }
}

function shuffleDeck() {
  for (let i = 0; i < deck.length; i++) {
    let j = Math.floor(Math.random() * deck.length);
    let temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }
}

async function startGame() {
  hidden = deck.pop();
  dealerSum += getValue(hidden);
  dealerAceCount += checkAce(hidden);

  while (dealerSum < 17) {
    let card = deck.pop();
    dealerSum += getValue(card);
    dealerAceCount += checkAce(card);
    showCards(card, "dealer-cards");
  }

  for (let i = 0; i < 2; i++) {
    let card = deck.pop();
    playerSum += getValue(card);
    playerAceCount += checkAce(card);
    await delay(1000);
    showCards(card, "player-cards");
  }
  document.getElementById("hit").addEventListener("click", hit);
  document.getElementById("stay").addEventListener("click", stay);
}

async function hit() {
  if (!canHit) {
    return;
  }

  click.play();
  let card = deck.pop();
  playerSum += getValue(card);
  playerAceCount += checkAce(card);
  await delay(500);
  showCards(card, "player-cards");

  if (reduceAce(playerSum, playerAceCount) > 21) {
    canHit = false;
  }
}

function stay() {
  dealerSum = reduceAce(dealerSum, dealerAceCount);
  playerSum = reduceAce(playerSum, playerAceCount);

  canHit = false;
  document.getElementById("hidden").src = "./cards/" + hidden + ".webp";

  click.play();

  let result = "";
  if (playerSum > 21) {
    result = "l";
  } else if (dealerSum > 21) {
    result = "w";
  } else if (playerSum == dealerSum) {
    result = "d";
  } else if (playerSum > dealerSum) {
    result = "w";
  } else if (playerSum < dealerSum) {
    result = "l";
  }
  gameOver(result, dealerSum, playerSum);
}

function getValue(card) {
  let data = card.split("-");
  let value = data[0];

  if (isNaN(value)) {
    if (value == "A") {
      return 11;
    }
    return 10;
  }
  return parseInt(value);
}

function checkAce(card) {
  if (card[0] == "A") {
    return 1;
  }
  return 0;
}

function reduceAce(playerSum, playerAceCount) {
  while (playerSum > 21 && playerAceCount > 0) {
    playerSum -= 10;
    playerAceCount -= 1;
  }
  return playerSum;
}

function showCards(card, player) {
  let div = document.createElement("div");
  let back = document.createElement("div");
  let front = document.createElement("div");
  let cardImg = document.createElement("img");
  let cardBack = document.createElement("img");

  const flip = new Audio("audio/flip.mp3");
  flip.play();

  div.classList.add("card");
  cardImg.src = "./cards/" + card + ".webp";
  cardBack.src = "./cards/BACK-R.webp";
  front.classList.add("front");
  back.classList.add("back");
  back.append(cardBack);
  front.append(cardImg);
  div.append(back, front);
  document.getElementById(player).append(div);
}

function gameOver(result, dealerSum, playerSum) {
  let message = "";
  let messageElement = document.getElementById("message");
  const win = new Audio("audio/win.mp3");
  const lose = new Audio("audio/lose.mp3");
  document.getElementById("game-over").style.display = "flex";
  document.getElementById("dealer-sum").innerText = dealerSum;
  document.getElementById("player-sum").innerText = playerSum;
  document.querySelector(".player-pts").style.opacity = 1;
  document.querySelector(".dealer-pts").style.opacity = 1;

  switch (result) {
    case "w":
      message = "Você Venceu!";
      messageElement.style.color = "#daa520";
      win.play();
      break;
    case "d":
      message = "Empate!";
      messageElement.style.color = "#ffffff";
      win.play();
      break;
    case "l":
      message = "Você Perdeu!";
      messageElement.style.color = "#ff000f";
      lose.play();
      break;
  }
  document.getElementById("message").innerText = message;
  document.getElementById("bt-restart").addEventListener("click", () => {
    click.play();
    window.location.reload(true);
  });
}
