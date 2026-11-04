const ranks = ["ACE", "2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING"];
const suits = ["DIAMONDS", "HEARTS", "SPADES", "CLUBS"];
const suitChars = ["♦", "♥", "♠", "♣"];
const ternary = ["L", "M", "H"];
const ternaryPermutations = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
];

function createCard(suit, rank) {
    const suitChar = suitChars[suits.indexOf(suit)];
    const suitColor = ["HEARTS", "DIAMONDS"].includes(suit) ? "red" : "black";
    return {
        suit,
        suitChar,
        suitOrdinal: suits.indexOf(suit) + 1,
        suitColor,
        rank,
        rankOrdinal: ranks.indexOf(rank) + 1,
        string: suitChar + rankChar(rank),
        html: `<span style="color:${suitColor}">${suitChar}</span>${rankChar(rank)}`,
    };
}

function rankChar(rank) {
    return ["ACE", "JACK", "QUEEN", "KING"].includes(rank) ? rank.charAt(0) : rank;
}

const compareCards = (a, b) => a.rankOrdinal - b.rankOrdinal || a.suitOrdinal - b.suitOrdinal;

// { card[][] }
const deckGroupedBySuit = () => suits.map((suit) => ranks.map((rank) => createCard(suit, rank)));

const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

function pickRandomCards(arrayOfCards, numberOfPicks) {
    const picks = [];

    const cards = arrayOfCards.slice(0);
    const numberOfCards = cards.length;

    for (let i = numberOfCards; i > numberOfCards - numberOfPicks; --i) {
        const index = random(0, i);

        picks.push(cards[index]);
        cards.splice(index, 1);
    }

    return picks;
}

function chooseFirstTwoCards(fiveRandomCards) {
    const suitsWithMoreThanOneCard = suits
        .map((suit) => fiveRandomCards.filter((card) => card.suit === suit))
        .filter((arr) => arr.length > 1);

    const randomIndex = random(0, suitsWithMoreThanOneCard.length);
    const setOfMoreThanOneCard = suitsWithMoreThanOneCard[randomIndex];

    const usingCards = pickRandomCards(setOfMoreThanOneCard, 2);

    let firstCard = usingCards[0];
    let secondCard = usingCards[1];

    let offset = (13 + secondCard.rankOrdinal - firstCard.rankOrdinal) % 13;

    if (offset > 6) {
        // offset too large, swap cards
        firstCard = usingCards[1];
        secondCard = usingCards[0];
        offset = (13 + secondCard.rankOrdinal - firstCard.rankOrdinal) % 13;
    }

    return {
        offset: offset,
        faceUp: firstCard,
        faceDown: secondCard,
    };
}

function drawHand() {
    const deck = deckGroupedBySuit().flat();

    const fiveRandomCards = pickRandomCards(deck, 5);

    const { offset, faceUp, faceDown } = chooseFirstTwoCards(fiveRandomCards);

    const remainingThreeCards = fiveRandomCards.filter((c) => c !== faceUp && c !== faceDown).sort(compareCards);

    const permutation = ternaryPermutations[offset - 1];

    return {
        offset,
        ternary: permutation.map((i) => ternary[i]),
        faceDown,
        faceUp: [faceUp, ...permutation.map((i) => remainingThreeCards[i])],
    };
}

//
// ---------------
//

function getById(id) {
    return document.getElementById(id);
}

function toPath(card) {
    return `img/${card.suit.toLowerCase()}/${card.rankOrdinal}${card.suit.charAt(0).toLowerCase()}.svg`;
}

function toggleFaceDownCard() {
    const revealed = getById("faceDown").classList.toggle("revealed");
    document.querySelector("#flipper .front").setAttribute("aria-hidden", String(revealed));
    document.querySelector("#flipper .back").setAttribute("aria-hidden", String(!revealed));
}

function cardName(card) {
    const rank = card.rank.charAt(0) + card.rank.slice(1).toLowerCase();
    return `${rank} of ${card.suit.toLowerCase()}`;
}

function showCard(id, card) {
    const img = getById(id);
    img.src = toPath(card);
    img.alt = cardName(card);
}

function setShuffleButtonLabel(label) {
    getById("shuffle-button").textContent = label;
}

function showAlert(id) {
    document.querySelectorAll(".alert").forEach((alert) => {
        alert.hidden = alert.id !== id;
    });
}

function longHandToString(hand) {
    const cards = hand.faceUp.map((card) => card.html).join(" ");
    return `<span class="hand-cards">${cards} =</span> ${shortHandParts(hand).join(" ")}`;
}

function shortHandParts(hand) {
    const first = hand.faceUp[0].html;
    return [`${first} + ${hand.ternary.join("")}`, `= ${first} + ${hand.offset} = ${hand.faceDown.html}`];
}

function startTimer() {
    startTime = performance.now();
}

function stopTimer() {
    return Math.round(performance.now() - startTime);
}

function calcAverageElapsed() {
    const avg = elapsedArray.reduce((p, c) => p + c) / elapsedArray.length;
    return avg;
}

function formatElapsed(elapsed) {
    return (elapsed / 1000).toFixed(3) + "s";
}

function updateShufflesCurOfMax() {
    if (curShuffles > 0) {
        getById("shuffles-cur-of-max").textContent = `Shuffle ${curShuffles} of ${maxShuffles}`;
    } else {
        getById("shuffles-cur-of-max").textContent = "";
    }
}

function updateCurrentAverageElapsed() {
    if (elapsedArray.length) {
        getById("avg-cur").textContent = `Average time ${formatElapsed(calcAverageElapsed())}`;
    } else {
        getById("avg-cur").textContent = "";
    }
}

function updateBestAverageElapsed() {
    if (Number.isFinite(bestAverageElapsed)) {
        getById("avg-best").textContent = `Best average time ${formatElapsed(bestAverageElapsed)}`;
    }
}

function addHandToStatistics(hand, elapsed, card, correct) {
    const correctSymbol = correct ? "✔" : '<span style="color:red">✖</span>';

    const table = getById("statistics-list");
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${longHandToString(hand)}</td><td>${formatElapsed(elapsed)}</td><td>${card.html}</td><td>${correctSymbol}</td>`;
    table.prepend(tr);
}

function clearStatistics() {
    getById("statistics-list").replaceChildren();
}

//
// ---------------
//

function addShuffleButtonListener() {
    getById("shuffle-button").addEventListener("click", shuffleButtonAction, false);
}

function addSpaceKeyListener() {
    document.addEventListener("keydown", (e) => {
        if (e.key !== " ") {
            return;
        }
        e.preventDefault();
        if (!e.repeat) {
            shuffleButtonAction();
        }
    });
}

function shuffleButtonAction() {
    if (state === states.DEALING || state === states.RUNNING) {
        return;
    }

    if (state === states.WON || state === states.GAMEOVER) {
        gameNew();
    }

    gameDealing();
    flipThenStartRound();
}

function flipThenStartRound() {
    const flipper = getById("flipper");
    let started = false;

    const start = () => {
        if (started) {
            return;
        }
        started = true;
        flipper.removeEventListener("transitionend", start, false);
        clearTimeout(fallbackTimer);
        startRound();
    };

    flipper.addEventListener("transitionend", start, false);
    const fallbackTimer = setTimeout(start, flipFallbackMs);
    toggleFaceDownCard();
}

async function startRound() {
    showHand();
    await waitForCardImages();
    state = states.RUNNING;
    updateShufflesCurOfMax();
    startTimer();
}

function preloadCardImages() {
    deckGroupedBySuit()
        .flat()
        .forEach((card) => {
            new Image().src = toPath(card);
        });
}

function waitForCardImages() {
    const images = document.querySelectorAll(".card img, #answer-cards img");
    return Promise.all([...images].map((img) => img.decode().catch(() => {})));
}

function showHand() {
    hand = drawHand();

    showCard("card0", hand.faceDown);
    hand.faceUp.forEach((card, i) => showCard(`card${i + 1}`, card));
    getById("answer-hand").innerHTML = shortHandParts(hand)
        .map((part) => `<span class="hand-part">${part}</span>`)
        .join(" ");

    const answerButtonsHtml = deckGroupedBySuit()
        [hand.faceDown.suitOrdinal - 1].map(
            (card) =>
                `<button type="button" class="answer-card-button" data-suit="${card.suit}" data-rank="${card.rank}"><img src="${toPath(card)}" alt="${cardName(card)}"></button>`,
        )
        .join(" ");

    const answerCards = getById("answer-cards");
    answerCards.innerHTML = answerButtonsHtml;
}

function addAnswerButtonListener() {
    getById("answer-cards").addEventListener("click", answerButtonAction, false);
}

function answerButtonAction(e) {
    const button = e.target.closest("button[data-suit]");
    if (state !== states.RUNNING || !button) {
        return;
    }
    state = states.ANSWERED;

    const elapsed = stopTimer();

    const { suit, rank } = button.dataset;
    const card = createCard(suit, rank);

    const correct = hand.faceDown.suit === suit && hand.faceDown.rank === rank;

    addHandToStatistics(hand, elapsed, card, correct);
    toggleFaceDownCard();

    if (correct) {
        elapsedArray.push(elapsed);
        updateCurrentAverageElapsed();

        if (curShuffles + 1 > maxShuffles) {
            gameWon();
        }
    } else {
        gameOver();
    }
}

let startTime;
let hand;
let curShuffles = 0;
let maxShuffles = 10;
let elapsedArray = [];
let bestAverageElapsed = loadBestAverageElapsed();

const flipFallbackMs = 1000;

const states = {
    NEW: 0,
    DEALING: 1,
    RUNNING: 2,
    ANSWERED: 3,
    WON: 4,
    GAMEOVER: 5,
};
let state = states.NEW;

function loadBestAverageElapsed() {
    let best;
    try {
        best = parseFloat(localStorage.getItem("bestAverageElapsed"));
    } catch {
        return Infinity;
    }
    return Number.isFinite(best) && best > 0 ? best : Infinity;
}

function saveBestAverageElapsed(best) {
    try {
        localStorage.setItem("bestAverageElapsed", best);
    } catch {}
}

function gameNew() {
    state = states.NEW;

    curShuffles = 0;
    elapsedArray = [];

    showAlert(null);

    updateShufflesCurOfMax();
    updateCurrentAverageElapsed();
    updateBestAverageElapsed();

    clearStatistics();
}

function gameDealing() {
    state = states.DEALING;
    setShuffleButtonLabel("Shuffle");
    curShuffles += 1;
}

function gameWon() {
    state = states.WON;

    setShuffleButtonLabel("New Game");

    const elapsed = calcAverageElapsed();
    const newBest = elapsed < bestAverageElapsed;
    if (newBest) {
        bestAverageElapsed = elapsed;
        saveBestAverageElapsed(bestAverageElapsed);
    }

    const alertId = newBest ? "game-won-new-best" : "game-won";
    getById(`${alertId}-avg`).textContent = formatElapsed(elapsed);
    showAlert(alertId);
}

function gameOver() {
    state = states.GAMEOVER;

    setShuffleButtonLabel("New Game");
    showAlert("game-over");
}

function main() {
    addAnswerButtonListener();
    addShuffleButtonListener();
    addSpaceKeyListener();
    preloadCardImages();

    gameNew();
    showHand();
    enableFlipAnimation();
}

function enableFlipAnimation() {
    const flipContainer = getById("faceDown");
    // Flush styles first so no transition can start from a style computed before index.css loaded.
    getComputedStyle(flipContainer.querySelector(".front")).transform;
    flipContainer.classList.add("animated");
}

main();
