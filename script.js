/* =========================================================
   SIF FOREX HUB - COMPLETE SCRIPT
   Risk Calculator + Lot Size + Trading Journal + Dashboard
   ========================================================= */


/* =========================================================
   1. HELPER FUNCTIONS
   ========================================================= */

function getNumber(id) {
    const element = document.getElementById(id);

    if (!element) {
        return 0;
    }

    const value = parseFloat(element.value);

    return isNaN(value) ? 0 : value;
}


function getValue(id) {
    const element = document.getElementById(id);

    if (!element) {
        return "";
    }

    return element.value.trim();
}


function getTrades() {
    try {
        const savedTrades = localStorage.getItem("sifTrades");

        if (!savedTrades) {
            return [];
        }

        const trades = JSON.parse(savedTrades);

        return Array.isArray(trades) ? trades : [];

    } catch (error) {
        console.error("Error reading trades:", error);
        return [];
    }
}


function saveTrades(trades) {
    localStorage.setItem("sifTrades", JSON.stringify(trades));
}


/* =========================================================
   2. RISK CALCULATOR
   ========================================================= */

function calculateRisk() {

    const balance = getNumber("balance");
    const riskPercent = getNumber("risk");
    const stopLoss = getNumber("stopLoss");
    const pair = getValue("pair");
    const currentPrice = getNumber("price");

    const resultBox = document.getElementById("risk-result");

    if (!resultBox) {
        alert("Risk result box was not found.");
        return;
    }

    if (balance <= 0) {
        resultBox.innerHTML =
            "<p>Please enter a valid account balance.</p>";
        return;
    }

    if (riskPercent <= 0) {
        resultBox.innerHTML =
            "<p>Please enter a valid risk percentage.</p>";
        return;
    }

    if (stopLoss <= 0) {
        resultBox.innerHTML =
            "<p>Please enter a valid stop loss in pips.</p>";
        return;
    }

    if (!pair) {
        resultBox.innerHTML =
            "<p>Please select a currency pair.</p>";
        return;
    }


    /* Maximum money you can lose */
    const riskAmount = balance * (riskPercent / 100);


    /* Calculate approximate pip value */
    const pipValue = getPipValue(pair, currentPrice);


    /* Calculate lot size */
    let lotSize = riskAmount / (stopLoss * pipValue);


    /* Protect against invalid calculation */
    if (!isFinite(lotSize) || lotSize <= 0) {
        lotSize = 0;
    }


    /* Round to 3 decimal places */
    lotSize = Math.floor(lotSize * 1000) / 1000;


    resultBox.innerHTML = `
        <div class="risk-result-card">

            <h3>📊 Risk Calculation</h3>

            <p>
                <strong>Account Balance:</strong>
                $${balance.toFixed(2)}
            </p>

            <p>
                <strong>Risk:</strong>
                ${riskPercent}%
            </p>

            <p>
                <strong>Stop Loss:</strong>
                ${stopLoss} pips
            </p>

            <p>
                <strong>Currency Pair:</strong>
                ${pair}
            </p>

            ${
                currentPrice > 0
                ? `<p>
                    <strong>Current Price:</strong>
                    ${currentPrice}
                   </p>`
                : ""
            }

            <h2>
                Maximum Risk:
                $${riskAmount.toFixed(2)}
            </h2>

            <h2>
                Estimated Lot Size:
                ${lotSize.toFixed(3)}
            </h2>

            <p>
                ⚠️ This is an estimated calculation.
                Always verify the pip value and contract
                specifications with your broker.
            </p>

        </div>
    `;
}


/* =========================================================
   3. PIP VALUE CALCULATOR
   ========================================================= */

function getPipValue(pair, price) {

    pair = pair.toUpperCase();

    /*
       Standard forex lot = 100,000 units.

       For pairs where USD is the quote currency:
       approximately $10 per pip for 1 standard lot.

       For USD/JPY and other USD-base pairs,
       the value depends on price.
    */


    /* EURUSD, GBPUSD, AUDUSD, NZDUSD */
    if (
        pair === "EURUSD" ||
        pair === "GBPUSD" ||
        pair === "AUDUSD" ||
        pair === "NZDUSD"
    ) {
        return 10;
    }


    /* USDJPY */
    if (pair === "USDJPY") {

        if (price > 0) {
            return 1000 / price;
        }

        return 6.67;
    }


    /* USDCHF */
    if (pair === "USDCHF") {

        if (price > 0) {
            return 10 / price;
        }

        return 11;
    }


    /* USDCAD */
    if (pair === "USDCAD") {

        if (price > 0) {
            return 10 / price;
        }

        return 7.3;
    }


    /*
       Approximate values for cross/minor pairs.
       These are estimates and can vary with the market.
    */

    const approximatePipValues = {

        EURGBP: 13.0,
        EURJPY: 6.7,
        EURCHF: 11.5,
        EURAUD: 6.5,
        EURNZD: 6.0,
        EURCAD: 7.3,

        GBPJPY: 6.7,
        GBPCHF: 11.5,
        GBPAUD: 6.5,
        GBPNZD: 6.0,
        GBPCAD: 7.3,

        CHFJPY: 6.7,
        CADJPY: 6.7,
        AUDJPY: 6.7,
        NZDJPY: 6.7,

        AUDCAD: 7.3,
        AUDCHF: 11.5,
        AUDNZD: 6.0,

        NZDCAD: 7.3,
        NZDCHF: 11.5,

        CADCHF: 11.5
    };


    if (approximatePipValues[pair]) {
        return approximatePipValues[pair];
    }


    /* Safe default */
    return 10;
}


/* =========================================================
   4. TRADING JOURNAL - ADD TRADE
   ========================================================= */

function addTrade() {

    const pair = getValue("journal-pair");

    const tradeTypeElement =
        document.getElementById("trade-type");

    const tradeType =
        tradeTypeElement
            ? tradeTypeElement.value
            : "Buy";


    const entry = getValue("entry-price");

    const stopLoss = getValue("journal-stop");

    const takeProfit = getValue("take-profit");

    const lotSize = getValue("journal-lot");

    const resultElement =
        document.getElementById("trade-result");

    const tradeResult =
        resultElement
            ? resultElement.value
            : "Pending";


    const notes = getValue("trade-notes");


    /* Check required fields */

    if (
        entry === "" ||
        stopLoss === "" ||
        takeProfit === "" ||
        lotSize === ""
    ) {

        alert(
            "Please fill in Entry Price, Stop Loss, Take Profit and Lot Size."
        );

        return;
    }


    /* Create trade */

    const trade = {

        id: Date.now(),

        pair: pair,

        tradeType: tradeType,

        entry: entry,

        stopLoss: stopLoss,

        takeProfit: takeProfit,

        lotSize: lotSize,

        tradeResult: tradeResult,

        notes: notes || "No notes added.",

        date: new Date().toLocaleString()

    };


    /* Get existing trades */

    const trades = getTrades();


    /* Add new trade */

    trades.push(trade);


    /* Save */

    saveTrades(trades);


    /* Refresh journal */

    displayTrades();

    updateTradingStats();


    /* Clear inputs */

    clearTradeInputs();


    alert("Trade saved successfully! 📒");
}


/* =========================================================
   5. DISPLAY TRADES
   ========================================================= */

function displayTrades() {

    const resultsBox =
        document.getElementById("journal-results");


    if (!resultsBox) {
        return;
    }


    const trades = getTrades();


    /* No trades */

    if (trades.length === 0) {

        resultsBox.innerHTML = `
            <div class="no-trades">
                <p>📒 No trades recorded yet.</p>
                <p>Your saved trades will appear here.</p>
            </div>
        `;

        return;
    }


    /* Display newest trade first */

    const reversedTrades = [...trades].reverse();


    resultsBox.innerHTML = reversedTrades.map(trade => {

        return `
            <div class="trade-card">

                <h3>
                    ${escapeHTML(trade.pair)}
                    -
                    ${escapeHTML(trade.tradeType)}
                </h3>

                <p>
                    <strong>Entry:</strong>
                    ${escapeHTML(trade.entry)}
                </p>

                <p>
                    <strong>Stop Loss:</strong>
                    ${escapeHTML(trade.stopLoss)}
                </p>

                <p>
                    <strong>Take Profit:</strong>
                    ${escapeHTML(trade.takeProfit)}
                </p>

                <p>
                    <strong>Lot Size:</strong>
                    ${escapeHTML(trade.lotSize)}
                </p>

                <p>
                    <strong>Result:</strong>
                    ${escapeHTML(trade.tradeResult)}
                </p>

                <p>
                    <strong>Notes:</strong>
                    ${escapeHTML(trade.notes)}
                </p>

                <small>
                    ${escapeHTML(trade.date)}
                </small>

                <br><br>

                <button
                    onclick="deleteTrade(${trade.id})"
                    class="delete-trade"
                >
                    🗑️ Delete Trade
                </button>

            </div>
        `;

    }).join("");
}


/* =========================================================
   6. DELETE ONE TRADE
   ========================================================= */

function deleteTrade(id) {

    const confirmed =
        confirm("Are you sure you want to delete this trade?");


    if (!confirmed) {
        return;
    }


    let trades = getTrades();


    trades = trades.filter(
        trade => trade.id !== id
    );


    saveTrades(trades);


    displayTrades();

    updateTradingStats();
}


/* =========================================================
   7. CLEAR ALL TRADES
   ========================================================= */

function clearJournal() {

    const trades = getTrades();


    if (trades.length === 0) {

        alert("There are no trades to clear.");

        return;
    }


    const confirmed =
        confirm(
            "⚠️ Are you sure you want to delete ALL trades?\n\nThis action cannot be undone."
        );


    if (!confirmed) {
        return;
    }


    /* Remove saved trades */

    localStorage.removeItem("sifTrades");


    /* Refresh journal */

    displayTrades();

    updateTradingStats();


    alert("All trades have been cleared. 🗑️");
}


/* =========================================================
   8. CLEAR JOURNAL INPUTS
   ========================================================= */

function clearTradeInputs() {

    const ids = [

        "entry-price",

        "journal-stop",

        "take-profit",

        "journal-lot",

        "trade-notes"

    ];


    ids.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.value = "";
        }

    });
}


/* =========================================================
   9. TRADING STATISTICS
   ========================================================= */

function updateTradingStats() {

    const trades = getTrades();


    const totalTrades =
        trades.length;


    const wins =
        trades.filter(
            trade =>
                trade.tradeResult === "Win"
        ).length;


    const losses =
        trades.filter(
            trade =>
                trade.tradeResult === "Loss"
        ).length;


    const breakEven =
        trades.filter(
            trade =>
                trade.tradeResult === "Break Even"
        ).length;


    let winRate = 0;


    if (totalTrades > 0) {

        winRate =
            (wins / totalTrades) * 100;

    }


    /* Update dashboard */

    const totalElement =
        document.getElementById("total-trades");

    if (totalElement) {
        totalElement.textContent =
            totalTrades;
    }


    const winsElement =
        document.getElementById("total-wins");

    if (winsElement) {
        winsElement.textContent =
            wins;
    }


    const lossesElement =
        document.getElementById("total-losses");

    if (lossesElement) {
        lossesElement.textContent =
            losses;
    }


    const breakEvenElement =
        document.getElementById("total-break-even");

    if (breakEvenElement) {
        breakEvenElement.textContent =
            breakEven;
    }


    const winRateElement =
        document.getElementById("win-rate");

    if (winRateElement) {

        winRateElement.textContent =
            winRate.toFixed(1) + "%";

    }
}


/* =========================================================
   10. ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


/* =========================================================
   11. INITIALIZE WEBSITE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log("SIF FOREX HUB JavaScript loaded successfully.");


        /* Load saved trades */

        displayTrades();


        /* Update dashboard */

        updateTradingStats();

    }
);


/* =========================================================
   12. MAKE FUNCTIONS AVAILABLE TO HTML ONCLICK
   ========================================================= */

window.calculateRisk =
    calculateRisk;

window.addTrade =
    addTrade;

window.deleteTrade =
    deleteTrade;

window.clearJournal =
    clearJournal;

window.displayTrades =
    displayTrades;

window.updateTradingStats =
    updateTradingStats;

/* =========================================================
   12. START LEARNING
   ========================================================= */
/* =========================================================
   12. START LEARNING
   ========================================================= */

function startLearning() {

    const learningBox =
        document.getElementById("learning-options");

    if (!learningBox) {
        console.error("Learning options box not found.");
        return;
    }

    learningBox.innerHTML = `
        <div class="learning-options">

            <h3>Choose Your Learning Level</h3>

            <button type="button" onclick="startBeginner()">
                🟢 Beginner
            </button>

            <button type="button" onclick="startIntermediate()">
                🟡 Intermediate
            </button>

            <button type="button" onclick="startAdvanced()">
                🔴 Advanced
            </button>

        </div>
    `;

    learningBox.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


function startBeginner() {

    alert(
        "🟢 Beginner Level\n\n" +
        "Welcome to SIF FOREX HUB!\n\n" +
        "You will learn Forex fundamentals, " +
        "market structure, liquidity and basic SMC concepts."
    );
}


function startIntermediate() {

    alert(
        "🟡 Intermediate Level\n\n" +
        "You will learn advanced market structure, " +
        "liquidity, Order Blocks, Fair Value Gaps and trade execution."
    );
}


function startAdvanced() {

    alert(
        "🔴 Advanced Level\n\n" +
        "You will learn advanced SMC execution, " +
        "risk management, trading psychology and professional trade planning."
    );
}


/* Make learning functions available to HTML */

window.startLearning = startLearning;
window.startBeginner = startBeginner;
window.startIntermediate = startIntermediate;
window.startAdvanced = startAdvanced;

/* =========================================================
   SIF FOREX HUB - LEARNING CENTER
   ========================================================= */

const beginnerLessons = [

    {
        title: "📘 Lesson 1: What is Forex?",
        content: `
            <p>
                <strong>Forex</strong> means Foreign Exchange.
                It is the global market where currencies are
                bought and sold against each other.
            </p>

            <p>
                For example, when you trade EUR/USD, you are
                trading the Euro against the US Dollar.
            </p>

            <h4>Key idea:</h4>

            <p>
                Forex trading is about speculating whether one
                currency will become stronger or weaker compared
                with another currency.
            </p>

            <div class="lesson-tip">
                💡 <strong>Remember:</strong>
                Forex is always traded in pairs.
            </div>
        `
    },

    {
        title: "💱 Lesson 2: Currency Pairs",
        content: `
            <p>
                A currency pair contains two currencies.
            </p>

            <p>
                Example:
                <strong>EUR/USD</strong>
            </p>

            <p>
                EUR is the <strong>base currency</strong>.
                USD is the <strong>quote currency</strong>.
            </p>

            <p>
                If EUR/USD rises, it generally means the Euro
                is gaining value relative to the Dollar.
            </p>

            <div class="lesson-tip">
                💡 Always know which currency is the base currency
                and which is the quote currency.
            </div>
        `
    },

    {
        title: "🌍 Lesson 3: Major, Minor & Exotic Pairs",
        content: `
            <h4>Major Pairs</h4>

            <p>
                Major pairs contain the US Dollar and are among
                the most actively traded Forex pairs.
            </p>

            <p>
                Examples: EUR/USD, GBP/USD, USD/JPY.
            </p>

            <h4>Minor Pairs</h4>

            <p>
                Minor pairs usually involve major currencies but
                do not contain the US Dollar.
            </p>

            <p>
                Examples: EUR/GBP, GBP/JPY, EUR/AUD.
            </p>

            <h4>Exotic Pairs</h4>

            <p>
                Exotic pairs combine a major currency with a
                currency from an emerging or smaller economy.
            </p>

            <div class="lesson-tip">
                💡 Major pairs generally have better liquidity
                and tighter spreads.
            </div>
        `
    },

    {
        title: "📏 Lesson 4: What is a Pip?",
        content: `
            <p>
                A <strong>pip</strong> is a standard unit used
                to measure movement in a Forex pair.
            </p>

            <p>
                For most major currency pairs, one pip is
                represented by the fourth decimal place.
            </p>

            <p>
                Example:
                <strong>EUR/USD 1.1000 → 1.1010</strong>
            </p>

            <p>
                This is a movement of approximately
                <strong>10 pips</strong>.
            </p>

            <div class="lesson-tip">
                💡 Pips help traders measure price movement,
                stop-loss distance and potential profit or loss.
            </div>
        `
    },

    {
        title: "📦 Lesson 5: What is Lot Size?",
        content: `
            <p>
                Lot size determines how large your Forex trade is.
            </p>

            <h4>Common lot sizes:</h4>

            <ul>
                <li>1.00 lot = Standard lot</li>
                <li>0.10 lot = Mini lot</li>
                <li>0.01 lot = Micro lot</li>
            </ul>

            <p>
                Larger lot sizes generally mean larger potential
                profits and larger potential losses.
            </p>

            <div class="lesson-tip">
                💡 Your lot size should be based on your account
                size, risk percentage and stop-loss distance.
            </div>
        `
    },

    {
        title: "💰 Lesson 6: What is Spread?",
        content: `
            <p>
                The <strong>spread</strong> is the difference between
                the bid price and the ask price.
            </p>

            <p>
                It is one of the costs traders may pay when entering
                a Forex position.
            </p>

            <p>
                For example, if EUR/USD has a bid of 1.1000 and
                an ask of 1.1002, the spread is 2 pips.
            </p>

            <div class="lesson-tip">
                💡 Lower spreads can reduce trading costs,
                especially for short-term traders.
            </div>
        `
    },

    {
        title: "⚡ Lesson 7: What is Leverage?",
        content: `
            <p>
                <strong>Leverage</strong> allows a trader to control
                a larger position using a smaller amount of capital.
            </p>

            <p>
                For example, leverage of 1:100 means the broker may
                allow you to control a position much larger than
                your deposited margin.
            </p>

            <p>
                However, leverage does not remove risk.
                Larger positions can produce larger losses.
            </p>

            <div class="lesson-warning">
                ⚠️ High leverage can magnify losses as well as profits.
                Always use proper risk management.
            </div>
        `
    },

    {
        title: "🛑 Lesson 8: Stop Loss & Take Profit",
        content: `
            <h4>Stop Loss</h4>

            <p>
                A Stop Loss is an order designed to limit your loss
                if the market moves against your trade.
            </p>

            <h4>Take Profit</h4>

            <p>
                A Take Profit is an order designed to close your
                trade when your chosen profit target is reached.
            </p>

            <p>
                Example:
            </p>

            <ul>
                <li>Entry: 1.1000</li>
                <li>Stop Loss: 1.0950</li>
                <li>Take Profit: 1.1100</li>
            </ul>

            <div class="lesson-tip">
                💡 Know your exit levels before entering the trade.
            </div>
        `
    },

    {
        title: "🛡️ Lesson 9: Risk Management",
        content: `
            <p>
                Risk management is one of the most important
                skills in Forex trading.
            </p>

            <p>
                A common approach is to risk only a small percentage
                of your account on each trade.
            </p>

            <h4>Example:</h4>

            <p>
                Account balance: <strong>$500</strong>
            </p>

            <p>
                Risk: <strong>1%</strong>
            </p>

            <p>
                Maximum planned risk: <strong>$5</strong>
            </p>

            <div class="lesson-warning">
                ⚠️ Never choose a lot size simply because you want
                to make more money. Calculate your risk first.
            </div>
        `
    },

    {
        title: "🕐 Lesson 10: Forex Trading Sessions",
        content: `
            <p>
                The Forex market operates around the clock during
                the trading week, with major financial centers
                creating different trading sessions.
            </p>

            <h4>Major sessions:</h4>

            <ul>
                <li>🇦🇺 Sydney</li>
                <li>🇯🇵 Tokyo</li>
                <li>🇬🇧 London</li>
                <li>🇺🇸 New York</li>
            </ul>

            <p>
                London and New York are particularly important
                sessions for many Forex traders because of their
                high market activity and liquidity.
            </p>

            <div class="lesson-tip">
                💡 Learn when your preferred currency pairs are
                most active before choosing your trading time.
            </div>
        `
    }

];


let currentLesson = 0;


/* =========================================================
   OPEN BEGINNER COURSE
   ========================================================= */

function openBeginnerCourse() {

    currentLesson = 0;

    const home =
        document.getElementById("learning-home");

    const course =
        document.getElementById("learning-course");

    if (!home || !course) {
        console.error("Learning Center elements not found.");
        return;
    }

    home.style.display = "none";

    course.style.display = "block";

    showLesson();

    course.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================================
   SHOW LESSON
   ========================================================= */

function showLesson() {
   
const completed =
    JSON.parse(
        localStorage.getItem("sifCompletedLessons")
    ) || [];

const isCompleted =
    completed.includes(currentLesson);

const lessonStatus =
    isCompleted
        ? "✅ Completed"
        : currentLesson === 0 ||
          completed.includes(currentLesson - 1)
            ? "🔵 In Progress"
            : "🔒 Not Started";
   
    const lesson =
        beginnerLessons[currentLesson];

    const content =
        document.getElementById("lesson-content");

    const progress =
        document.getElementById("lesson-progress");

    if (!lesson || !content || !progress) {
        return;
    }


    progress.innerHTML = `
        <div class="lesson-progress">
            <strong>
                Lesson ${currentLesson + 1}
                of ${beginnerLessons.length}
            </strong>

            <div class="progress-bar">
                <div
                    class="progress-fill"
                    style="width: ${
                        ((currentLesson + 1) /
                        beginnerLessons.length) * 100
                    }%"
                ></div>
            </div>

            <small>
                ${Math.round(
                    ((currentLesson + 1) /
                    beginnerLessons.length) * 100
                )}% Complete
            </small>
        </div>
    `;


    content.innerHTML = `
        <article class="lesson-card">

            <h2>${lesson.title}</h2>

<div class="lesson-status">
    ${lessonStatus}
</div>

<div class="lesson-text">
    ${lesson.content}
</div>

        </article>
    `;


    const previous =
        document.getElementById("previous-lesson");

    const next =
        document.getElementById("next-lesson");


    if (previous) {

        previous.disabled =
            currentLesson === 0;

    }


    if (next) {

        next.textContent =
            currentLesson ===
            beginnerLessons.length - 1
                ? "Finish Course 🎉"
                : "Next →";

    }

}


/* =========================================================
   NEXT LESSON
   ========================================================= */

function nextLesson() {

    if (
        currentLesson <
        beginnerLessons.length - 1
    ) {

        currentLesson++;

        showLesson();

    } else {

        alert(
            "🎉 Congratulations!\n\n" +
            "You have completed the SIF FOREX HUB Beginner Course!"
        );

    }

}


/* =========================================================
   PREVIOUS LESSON
   ========================================================= */

function previousLesson() {

    if (currentLesson > 0) {

        currentLesson--;

        showLesson();

    }

}


/* =========================================================
   MARK LESSON COMPLETE
   ========================================================= */

function markLessonComplete() {

    const completed =
        JSON.parse(
            localStorage.getItem(
                "sifCompletedLessons"
            )
        ) || [];


    if (!completed.includes(currentLesson)) {

        completed.push(currentLesson);

        localStorage.setItem(
            "sifCompletedLessons",
            JSON.stringify(completed)
        );
       
       updateCourseProgress();

    }


    alert(
        "✅ Lesson marked as complete!"
    );

}


/* =========================================================
   MAKE LEARNING FUNCTIONS AVAILABLE
   ========================================================= */

window.openBeginnerCourse =
    openBeginnerCourse;

window.nextLesson =
    nextLesson;

window.previousLesson =
    previousLesson;

window.markLessonComplete =
    markLessonComplete;

// Make Learning Center lesson display available to HTML buttons
window.showLesson = showLesson;

function updateCourseProgress() {

    const progressBox =
        document.getElementById("course-progress");

    if (!progressBox) {
        return;
    }

    const completed =
        JSON.parse(
            localStorage.getItem("sifCompletedLessons")
        ) || [];

    const total =
        beginnerLessons.length;

    const completedCount =
        completed.length;

    const percentage =
        Math.round(
            (completedCount / total) * 100
        );

    progressBox.innerHTML = `
        <div class="course-progress-card">

            <strong>📚 Beginner Course Progress</strong>

            <p>
                ${completedCount} / ${total}
                lessons completed
            </p>

            <div class="progress-bar">
                <div
                    class="progress-fill"
                    style="width: ${percentage}%"
                ></div>
            </div>

            <small>${percentage}% Complete</small>

        </div>
    `;
}

window.updateCourseProgress =
    updateCourseProgress;
/* =========================================================
   END OF SCRIPT
   ========================================================= */
