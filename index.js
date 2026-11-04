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
    const suitsWithMoreThanOneCard = Object.values(Object.groupBy(fiveRandomCards, (card) => card.suit)).filter((arr) => arr.length > 1);

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
    getById("faceDown").classList.toggle("revealed");
}

function shuffleButtonLabelNewGame() {
    getById("shuffle-button").innerHTML = "New Game";
}

function shuffleButtonLabelShuffle() {
    getById("shuffle-button").innerHTML = "Shuffle";
}

function addGameOverLabel() {
    getById("game-over").style.display = "flex";
}

function removeGameOverLabel() {
    getById("game-over").style.display = "none";
}

function addGameWonLabel(elapsed) {
    getById("game-won-avg").innerHTML = formatElapsed(elapsed);
    getById("game-won").style.display = "flex";
}

function removeGameWonLabel() {
    getById("game-won").style.display = "none";
}

function addGameWonNewBestLabel(elapsed) {
    getById("game-won-new-best-avg").innerHTML = formatElapsed(elapsed);
    getById("game-won-new-best").style.display = "flex";
}

function removeGameWonNewBestLabel() {
    getById("game-won-new-best").style.display = "none";
}

function longHandToString(hand) {
    return `${hand.faceUp[0].html} ${hand.faceUp[1].html} ${hand.faceUp[2].html} ${hand.faceUp[3].html} = ${shortHandToString(hand)}`;
}

function shortHandToString(hand) {
    return `${hand.faceUp[0].html} + ${hand.ternary.join("")} = ${hand.faceUp[0].html} + ${hand.offset} = ${hand.faceDown.html}`;
}

function startTimer() {
    startTime = Date.now();
}

function stopTimer() {
    const stopTime = Date.now();
    const elapsed = stopTime - startTime;

    return elapsed;
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
        getById("shuffles-cur-of-max").innerHTML = `Shuffle ${curShuffles} of ${maxShuffles}`;
    } else {
        getById("shuffles-cur-of-max").innerHTML = "";
    }
}

function updateCurrentAverageElapsed() {
    if (elapsedArray.length) {
        getById("avg-cur").innerHTML = `Average time ${formatElapsed(calcAverageElapsed())}`;
    } else {
        getById("avg-cur").innerHTML = "";
    }
}

function updateBestAverageElapsed() {
    if (Number.isFinite(bestAverageElapsed)) {
        getById("avg-best").innerHTML = `Best average time ${formatElapsed(bestAverageElapsed)}`;
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
    getById("statistics-list").innerHTML = "";
}

//
// ---------------
//

function addShuffleButtonListener() {
    getById("shuffle-button").addEventListener("click", shuffleButtonAction, false);
}

function addSpaceKeyListener() {
    document.documentElement.addEventListener(
        "keyup",
        (e) => {
            if (e.keyCode == 32) {
                shuffleButtonAction();
            }
        },
        false,
    );
}

function shuffleButtonAction() {
    if (state === states.RUNNING) {
        return;
    }

    if (state === states.WON || state === states.GAMEOVER) {
        gameNew();
    }

    gameRunning();

    getById("flipper").addEventListener("transitionend", shuffleButtonTransitionEndHandler, false);
    toggleFaceDownCard();
}

function shuffleButtonTransitionEndHandler() {
    showHand();
}

function showHand() {
    getById("flipper").removeEventListener("transitionend", shuffleButtonTransitionEndHandler, false);

    hand = drawHand();

    getById("card0").src = toPath(hand.faceDown);
    getById("card1").src = toPath(hand.faceUp[0]);
    getById("card2").src = toPath(hand.faceUp[1]);
    getById("card3").src = toPath(hand.faceUp[2]);
    getById("card4").src = toPath(hand.faceUp[3]);
    getById("answer-hand").innerHTML = shortHandToString(hand);

    const answerButtonsHtml = deckGroupedBySuit()
        [hand.faceDown.suitOrdinal - 1].map(
            (card) => `<img class="answer-card-button" data-suit="${card.suit}" data-rank="${card.rank}" src="${toPath(card)}">`,
        )
        .join(" ");

    const answerCards = getById("answer-cards");
    answerCards.innerHTML = answerButtonsHtml;

    if (state !== states.NEW) {
        updateShufflesCurOfMax();
        startTimer();
    }
}

function addAnswerButtonListener() {
    getById("answer-cards").addEventListener("click", answerButtonAction, false);
}

function answerButtonAction(e) {
    if (state !== states.RUNNING || !e.target.hasAttribute("data-suit")) {
        return;
    }
    state = states.ANSWERED;

    const elapsed = stopTimer();

    const suit = e.target.dataset["suit"];
    const rank = e.target.dataset["rank"];
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

const states = {
    NEW: 0,
    RUNNING: 1,
    ANSWERED: 2,
    WON: 3,
    GAMEOVER: 4,
};
let state = states.NEW;

function loadBestAverageElapsed() {
    const best = parseFloat(localStorage.getItem("bestAverageElapsed"));
    return Number.isFinite(best) && best > 0 ? best : Infinity;
}

function gameNew() {
    state = states.NEW;

    curShuffles = 0;
    elapsedArray = [];

    removeGameOverLabel();
    removeGameWonLabel();
    removeGameWonNewBestLabel();

    updateShufflesCurOfMax();
    updateCurrentAverageElapsed();
    updateBestAverageElapsed();

    clearStatistics();
}

function gameRunning() {
    state = states.RUNNING;
    shuffleButtonLabelShuffle();
    curShuffles += 1;
}

function gameWon() {
    state = states.WON;

    shuffleButtonLabelNewGame();

    const elapsed = calcAverageElapsed();
    if (elapsed < bestAverageElapsed) {
        bestAverageElapsed = elapsed;
        localStorage.setItem("bestAverageElapsed", bestAverageElapsed);
        addGameWonNewBestLabel(elapsed);
    } else {
        addGameWonLabel(elapsed);
    }
}

function gameOver() {
    state = states.GAMEOVER;

    shuffleButtonLabelNewGame();
    addGameOverLabel();
}

function main() {
    addAnswerButtonListener();
    addShuffleButtonListener();
    addSpaceKeyListener();

    gameNew();
    showHand();
}

main();
