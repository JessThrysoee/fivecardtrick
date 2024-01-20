const ranks = ["ACE", "2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING"];
const suites = ["DIAMONDS", "HEARTS", "SPADES", "CLUBS"];
const suitesChars = ["♦", "♥", "♠", "♣"];
const ternary = ["L", "M", "H"];

const createCard = (suite, rank) => ({
    suite: suite,
    suiteChar: suiteChar(suite),
    suiteOrdinal: suites.indexOf(suite) + 1,
    suiteColor: suiteColor(suite),
    rank: rank,
    rankOrdinal: ranks.indexOf(rank) + 1,
    string: suiteChar(suite) + rankChar(rank),
    html: `<span style="color:${suiteColor(suite)}">${suiteChar(suite)}</span>${rankChar(rank)}`,
});

function rankChar(rank) {
    return ["ACE", "JACK", "QUEEN", "KING"].indexOf(rank) != -1 ? rank.charAt(0) : rank;
}

function suiteChar(suite) {
    return suitesChars[suites.indexOf(suite)];
}

function suiteColor(suite) {
    return ["HEARTS", "DIAMONDS"].indexOf(suite) != -1 ? "red" : "black";
}

function compareRanks(card1, card2) {
    if (card1.rankOrdinal < card2.rankOrdinal) return -1;
    if (card1.rankOrdinal > card2.rankOrdinal) return 1;
    return 0;
}

function compareSuites(card1, card2) {
    if (card1.suiteOrdinal < card2.suiteOrdinal) return -1;
    if (card1.suiteOrdinal > card2.suiteOrdinal) return 1;
    return 0;
}

function compareCards(card1, card2) {
    const order = compareRanks(card1, card2);
    if (order !== 0) {
        return order;
    }
    return compareSuites(card1, card2);
}

// { card[][] }
const deckGroupedBySuite = () => suites.map((suite) => ranks.map((rank) => createCard(suite, rank)));

// card[] -> { suite:card[] }
function groupBySuite(arrayOfCards) {
    const cards = {};

    arrayOfCards.forEach((card) => {
        if (!cards[card.suite]) {
            cards[card.suite] = [];
        }
        cards[card.suite].push(card);
    });

    return cards;
}

// { suite:card[] } -> card[][]
const arrayOfArraysOfCard = (objectOfCards) => Object.keys(objectOfCards).map((key) => objectOfCards[key]);

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

function removeCardPredicate(card) {
    return (c) => (c.suite == card.suite && c.rank == card.rank) != true;
}

function chooseFirstTwoCards(fiveRandomCards) {
    const fiveRandomCardsGroupBySuite = arrayOfArraysOfCard(groupBySuite(fiveRandomCards));

    const suitesWithMoreThanOneCard = fiveRandomCardsGroupBySuite.filter((arr) => arr.length > 1);

    const randomIndex = random(0, suitesWithMoreThanOneCard.length);
    const setOfMoreThanOneCard = suitesWithMoreThanOneCard[randomIndex];

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

const addTernaryCardsFn = (hand, remainingThreeCards) => (idx0, idx1, idx2) => {
    hand.ternary.push(ternary[idx0]);
    hand.faceUp.push(remainingThreeCards[idx0]);

    hand.ternary.push(ternary[idx1]);
    hand.faceUp.push(remainingThreeCards[idx1]);

    hand.ternary.push(ternary[idx2]);
    hand.faceUp.push(remainingThreeCards[idx2]);
};

function drawHand() {
    const deck = deckGroupedBySuite().flat();

    const fiveRandomCards = pickRandomCards(deck, 5);

    const firstTwoCards = chooseFirstTwoCards(fiveRandomCards);

    const remainingThreeCards = fiveRandomCards
        .filter(removeCardPredicate(firstTwoCards.faceDown))
        .filter(removeCardPredicate(firstTwoCards.faceUp))
        .sort(compareCards);

    const hand = {
        offset: firstTwoCards.offset,
        ternary: [],
        faceDown: firstTwoCards.faceDown,
        faceUp: [firstTwoCards.faceUp],
    };

    const addTernaryCards = addTernaryCardsFn(hand, remainingThreeCards);

    switch (hand.offset) {
        case 1:
            addTernaryCards(0, 1, 2);
            break;
        case 2:
            addTernaryCards(0, 2, 1);
            break;
        case 3:
            addTernaryCards(1, 0, 2);
            break;
        case 4:
            addTernaryCards(1, 2, 0);
            break;
        case 5:
            addTernaryCards(2, 0, 1);
            break;
        case 6:
            addTernaryCards(2, 1, 0);
            break;
        default:
            console.log("impossible");
    }

    return hand;
}

//
// ---------------
//

function getById(id) {
    return document.getElementById(id);
}

function toPath(card) {
    return `img/${card.suite.toLowerCase()}/${card.rankOrdinal}${card.suite.charAt(0).toLowerCase()}.svg`;
}

function toggleFaceDownCard() {
    getById("faceDown").classList.toggle("hover");
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
    if (bestAverageElapsed !== Number.MAX_VALUE) {
        getById("avg-best").innerHTML = `Best average time ${formatElapsed(bestAverageElapsed)}`;
    }
}

function addHandToStatistics(hand, elapsed, card, correct) {
    const correctSymbol = correct ? "✔" : '<span style="color:red">✖</span>';

    const table = getById("statistics-list");
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${longHandToString(hand)}</td><td>${formatElapsed(elapsed)}</td><td>${card.html}</td><td>${correctSymbol}</td>`;
    table.appendChild(tr, table.firstChild);
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
        false
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

    getById("flipper").addEventListener("transitionend", shuffleButtonTransistionEndHandler, false);
    toggleFaceDownCard();
}

function shuffleButtonTransistionEndHandler() {
    showHand();
}

function showHand() {
    getById("flipper").removeEventListener("transitionend", shuffleButtonTransistionEndHandler, false);

    hand = drawHand();

    getById("card0").src = toPath(hand.faceDown);
    getById("card1").src = toPath(hand.faceUp[0]);
    getById("card2").src = toPath(hand.faceUp[1]);
    getById("card3").src = toPath(hand.faceUp[2]);
    getById("card4").src = toPath(hand.faceUp[3]);
    getById("answer-hand").innerHTML = shortHandToString(hand);

    const ranks = deckGroupedBySuite()
        [hand.faceDown.suiteOrdinal - 1].map(
            (card) => `<img class="answer-card-button" data-suite="${card.suite}" data-rank="${card.rank}" src="${toPath(card)}">`
        )
        .join(" ");

    const answerCards = getById("answer-cards");
    answerCards.innerHTML = ranks;

    if (state !== states.NEW) {
        updateShufflesCurOfMax();
        startTimer();
    }
}

function addAnswerButtonListener() {
    getById("answer-cards").addEventListener("click", answerButtonAction, false);
}

function answerButtonAction(e) {
    if (state !== states.RUNNING || !e.target.hasAttribute("data-suite")) {
        return;
    }
    state = states.ANSWERED;

    const elapsed = stopTimer();

    const suite = e.target.dataset["suite"];
    const rank = e.target.dataset["rank"];
    const card = createCard(suite, rank);

    const correct = hand.faceDown.suite === suite && hand.faceDown.rank === rank;

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
let bestAverageElapsed = localStorage.getItem("bestAverageElapsed") || Number.MAX_VALUE;

const states = {
    NEW: 0,
    RUNNING: 1,
    ANSWERED: 2,
    WON: 3,
    GAMEOVER: 4,
};
let state = states.NEW;

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
