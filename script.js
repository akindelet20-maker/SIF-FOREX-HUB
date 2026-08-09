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
function editTrade(index) {
    let trades = JSON.parse(localStorage.getItem("sifTrades")) || [];

    const trade = trades[index];

    if (!trade) {
        alert("Trade not found.");
        return;
    }

    document.getElementById("journal-pair").value = trade.pair || "";
    document.getElementById("trade-type").value = trade.tradeType || "";
    document.getElementById("entry-price").value = trade.entry || "";
    document.getElementById("journal-stop").value = trade.stopLoss || "";
    document.getElementById("take-profit").value = trade.takeProfit || "";
    document.getElementById("journal-lot").value = trade.lotSize || "";
    document.getElementById("trade-result").value = trade.tradeResult || "";
    document.getElementById("trade-notes").value = trade.notes || "";

    trades.splice(index, 1);

    localStorage.setItem("sifTrades", JSON.stringify(trades));

    displayTrades();
    updateTradingStats();

    window.scrollTo({
        top: document.getElementById("trading-journal").offsetTop,
        behavior: "smooth"
    });

    alert("Trade loaded for editing. Make your changes and click Add Trade.");
}


/* =========================================================
   END OF SCRIPT
   ========================================================= */
