// ========================================
// SIF FOREX HUB - MAIN JAVASCRIPT
// ========================================


// ========================================
// RISK & LOT SIZE CALCULATOR
// ========================================

function calculateRisk() {

    const balance = Number(
        document.getElementById("balance").value
    );

    const risk = Number(
        document.getElementById("risk").value
    );

    const stopLoss = Number(
        document.getElementById("stopLoss").value
    );

    const pairElement = document.getElementById("pair");
    const priceElement = document.getElementById("price");
    const result = document.getElementById("risk-result");

    if (!balance || !risk || !stopLoss) {

        result.innerHTML = `
            <p>Please enter your balance, risk and stop loss.</p>
        `;

        return;
    }

    const pair = pairElement ? pairElement.value : "EURUSD";
    const price = priceElement ? Number(priceElement.value) : 0;

    const riskAmount = balance * (risk / 100);

    let pipSize = 0.0001;

    if (pair.includes("JPY")) {
        pipSize = 0.01;
    }

    let pipValuePerLot = 10;

    /*
       For USD-quoted pairs such as:
       EUR/USD
       GBP/USD
       AUD/USD
       NZD/USD

       1 standard lot ≈ $10 per pip.
    */

    const cleanPair = pair.replace("/", "");

    const usdQuotePairs = [
        "EURUSD",
        "GBPUSD",
        "AUDUSD",
        "NZDUSD"
    ];

    if (!usdQuotePairs.includes(cleanPair) && price > 0) {

        pipValuePerLot =
            (pipSize * 100000) / price;
    }

    const lotSize =
        riskAmount /
        (stopLoss * pipValuePerLot);

    result.innerHTML = `
        <div class="calculator-result">

            <h3>Risk Calculation</h3>

            <p>
                <strong>Pair:</strong>
                ${cleanPair.slice(0, 3)}/${cleanPair.slice(3)}
            </p>

            <p>
                <strong>Account Balance:</strong>
                $${balance.toFixed(2)}
            </p>

            <p>
                <strong>Risk:</strong>
                ${risk}%
            </p>

            <p>
                <strong>Stop Loss:</strong>
                ${stopLoss} pips
            </p>

            <h2>
                Maximum Risk:
                $${riskAmount.toFixed(2)}
            </h2>

            <h2>
                Estimated Lot Size:
                ${lotSize.toFixed(3)}
            </h2>

            <p>
                Always verify the final lot size with
                your broker before placing a live trade.
            </p>

        </div>
    `;
}


// ========================================
// TRADING JOURNAL
// ========================================

function addTrade() {

    const pairElement =
        document.getElementById("journal-pair");

    const tradeTypeElement =
        document.getElementById("trade-type");

    const entryElement =
        document.getElementById("entry-price");

    const stopElement =
        document.getElementById("journal-stop");

    const takeProfitElement =
        document.getElementById("take-profit");

    const lotElement =
        document.getElementById("journal-lot");

    const resultElement =
        document.getElementById("trade-result");

    const notesElement =
        document.getElementById("trade-notes");


    // Check that the journal exists
    if (
        !pairElement ||
        !tradeTypeElement ||
        !entryElement ||
        !stopElement ||
        !takeProfitElement ||
        !lotElement ||
        !resultElement ||
        !notesElement
    ) {

        alert(
            "Trading Journal could not be found. Please check your HTML."
        );

        return;
    }


    const pair = pairElement.value;
    const tradeType = tradeTypeElement.value;
    const entry = entryElement.value.trim();
    const stopLoss = stopElement.value.trim();
    const takeProfit = takeProfitElement.value.trim();
    const lotSize = lotElement.value.trim();
    const tradeResult = resultElement.value;
    const notes = notesElement.value.trim();


    // Validate required fields
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


    // Create trade
    const trade = {

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


    // Get existing trades
    let trades =
        JSON.parse(
            localStorage.getItem("sifTrades")
        ) || [];


    // Add new trade
    trades.push(trade);


    // Save trades
    localStorage.setItem(
        "sifTrades",
        JSON.stringify(trades)
    );


    // Update page
    displayTrades();

    updateTradingStats();


    // Clear input fields
    entryElement.value = "";

    stopElement.value = "";

    takeProfitElement.value = "";

    lotElement.value = "";

    notesElement.value = "";


    alert("Trade saved successfully! 📒");

}


// ========================================
// DISPLAY SAVED TRADES
// ========================================

function displayTrades() {

    const journalResults =
        document.getElementById("journal-results");


    if (!journalResults) {
        return;
    }


    const trades =
        JSON.parse(
            localStorage.getItem("sifTrades")
        ) || [];


    // No trades
    if (trades.length === 0) {

        journalResults.innerHTML = `
            <p>No trades recorded yet.</p>
        `;

        return;
    }


    journalResults.innerHTML = `
        <h2>📋 Your Trade History</h2>
    `;


    trades.forEach(function(trade, index) {

        const cleanPair =
            String(trade.pair).replace("/", "");


        const pairName =
            cleanPair.length >= 6
                ? cleanPair.slice(0, 3) +
                  "/" +
                  cleanPair.slice(3)
                : trade.pair;


        journalResults.innerHTML += `

            <div class="trade-card">

                <h3>
                    ${pairName}
                </h3>

                <p>
                    <strong>Trade:</strong>
                    ${trade.tradeType}
                </p>

                <p>
                    <strong>Entry:</strong>
                    ${trade.entry}
                </p>

                <p>
                    <strong>Stop Loss:</strong>
                    ${trade.stopLoss}
                </p>

                <p>
                    <strong>Take Profit:</strong>
                    ${trade.takeProfit}
                </p>

                <p>
                    <strong>Lot Size:</strong>
                    ${trade.lotSize}
                </p>

                <p>
                    <strong>Result:</strong>
                    ${trade.tradeResult}
                </p>

                <p>
                    <strong>Notes:</strong>
                    ${trade.notes}
                </p>

                <small>
                    ${trade.date}
                </small>

            </div>

        `;
    });

}


// ========================================
// PERFORMANCE DASHBOARD
// ========================================

function updateTradingStats() {

    const trades =
        JSON.parse(
            localStorage.getItem("sifTrades")
        ) || [];


    const totalTrades =
        trades.length;


    const wins =
        trades.filter(function(trade) {

            return trade.tradeResult === "Win";

        }).length;


    const losses =
        trades.filter(function(trade) {

            return trade.tradeResult === "Loss";

        }).length;


    const breakEven =
        trades.filter(function(trade) {

            return trade.tradeResult === "Break Even";

        }).length;


    let winRate = 0;


    if (totalTrades > 0) {

        winRate =
            (wins / totalTrades) * 100;

    }


    const totalTradesElement =
        document.getElementById("total-trades");

    const totalWinsElement =
        document.getElementById("total-wins");

    const totalLossesElement =
        document.getElementById("total-losses");

    const totalBreakEvenElement =
        document.getElementById("total-break-even");

    const winRateElement =
        document.getElementById("win-rate");


    if (totalTradesElement) {

        totalTradesElement.textContent =
            totalTrades;

    }


    if (totalWinsElement) {

        totalWinsElement.textContent =
            wins;

    }


    if (totalLossesElement) {

        totalLossesElement.textContent =
            losses;

    }


    if (totalBreakEvenElement) {

        totalBreakEvenElement.textContent =
            breakEven;

    }


    if (winRateElement) {

        winRateElement.textContent =
            winRate.toFixed(1) + "%";

    }

}


// ========================================
// LOAD JOURNAL WHEN PAGE OPENS
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        displayTrades();

        updateTradingStats();

    }
);
