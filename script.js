function startLearning() {

    const learningOptions = document.getElementById("learning-options");

    learningOptions.innerHTML = `
        <h2>Choose Your Learning Level</h2>

        <div>
            <button onclick="chooseLevel('Beginner')">
                🟢 Beginner
            </button>

            <button onclick="chooseLevel('Intermediate')">
                🔵 Intermediate
            </button>

            <button onclick="chooseLevel('Advanced')">
                🔴 Advanced
            </button>
        </div>

        <div id="lesson-content"></div>
    `;
}


function chooseLevel(level) {

    const lessonContent = document.getElementById("lesson-content");

    if (level === "Beginner") {

        lessonContent.innerHTML = `
            <h2>🟢 Beginner Forex Course</h2>

            <p>
                Start your forex journey by learning the
                fundamental concepts every trader needs.
            </p>

            <h3>Lessons</h3>

            <ul>
                <li>What is Forex?</li>
                <li>Currency Pairs</li>
                <li>Pips</li>
                <li>Lot Size</li>
                <li>Leverage</li>
                <li>Risk Management</li>
            </ul>
        `;

    } else if (level === "Intermediate") {

        lessonContent.innerHTML = `
            <h2>🔵 Intermediate Forex Course</h2>

            <p>
                Build your trading knowledge and begin
                applying structured SMC concepts.
            </p>

            <h3>Lessons</h3>

            <ul>
                <li>Market Structure</li>
                <li>Liquidity</li>
                <li>Order Blocks</li>
                <li>Fair Value Gaps</li>
                <li>Market Structure Shift</li>
                <li>Risk Management</li>
            </ul>
        `;

    } else if (level === "Advanced") {

        lessonContent.innerHTML = `
            <h2>🔴 Advanced Forex Course</h2>

            <p>
                Develop a deeper understanding of SMC,
                trade execution, and professional trading discipline.
            </p>

            <h3>Lessons</h3>

            <ul>
                <li>Advanced Market Structure</li>
                <li>Liquidity Engineering</li>
                <li>Advanced Order Blocks</li>
                <li>FVG Entry Models</li>
                <li>Trade Execution</li>
                <li>Advanced Risk Management</li>
            </ul>
        `;
    }
}
function calculateRisk() {

    const balance = Number(document.getElementById("balance").value);
    const risk = Number(document.getElementById("risk").value);
    const stopLoss = Number(document.getElementById("stopLoss").value);
    const pair = document.getElementById("pair").value;
    const price = Number(document.getElementById("price").value);

    const result = document.getElementById("risk-result");

    if (balance <= 0 || risk <= 0 || stopLoss <= 0 || price <= 0) {
        result.innerHTML = `
            <p>Please enter valid numbers in all fields.</p>
        `;
        return;
    }

    const riskAmount = balance * (risk / 100);

    let pipSize = pair.includes("JPY") ? 0.01 : 0.0001;

    let pipValue;

    if (
        pair === "EURUSD" ||
        pair === "GBPUSD" ||
        pair === "AUDUSD" ||
        pair === "NZDUSD"
    ) {
        pipValue = 10;
    } else {
        pipValue = (pipSize * 100000) / price;
    }

    const lotSize = riskAmount / (stopLoss * pipValue);

    result.innerHTML = `
        <h3>Risk Calculation</h3>

        <p>Pair: ${pair.slice(0, 3)}/${pair.slice(3)}</p>

        <p>Account Balance: $${balance.toFixed(2)}</p>

        <p>Risk: ${risk}%</p>

        <p>Stop Loss: ${stopLoss} pips</p>

        <h2>Maximum Risk: $${riskAmount.toFixed(2)}</h2>

        <h2>Estimated Lot Size: ${lotSize.toFixed(3)}</h2>

        <p>
            Always verify the result with your broker's
            contract and pip-value specifications.
        </p>
    `;
}
function addTrade() {

    const pair = document.getElementById("journal-pair").value;
    const tradeType = document.getElementById("trade-type").value;
    const entry = document.getElementById("entry-price").value;
    const stopLoss = document.getElementById("journal-stop").value;
    const takeProfit = document.getElementById("take-profit").value;
    const lotSize = document.getElementById("journal-lot").value;
    const tradeResult = document.getElementById("trade-result").value;
    const notes = document.getElementById("trade-notes").value;

    const journalResults = document.getElementById("journal-results");

    if (
        entry === "" ||
        stopLoss === "" ||
        takeProfit === "" ||
        lotSize === ""
    ) {
        journalResults.innerHTML = `
            <p>Please fill in all required trade information.</p>
        `;
        return;
    }

    journalResults.innerHTML += `
        <div class="trade-card">

            <h3>${pair.slice(0, 3)}/${pair.slice(3)}</h3>

            <p><strong>Trade:</strong> ${tradeType}</p>

            <p><strong>Entry:</strong> ${entry}</p>

            <p><strong>Stop Loss:</strong> ${stopLoss}</p>

            <p><strong>Take Profit:</strong> ${takeProfit}</p>

            <p><strong>Lot Size:</strong> ${lotSize}</p>

            <p><strong>Result:</strong> ${tradeResult}</p>

            <p><strong>Notes:</strong> ${notes || "No notes added."}</p>

        </div>
    `;

    document.getElementById("entry-price").value = "";
    document.getElementById("journal-stop").value = "";
    document.getElementById("take-profit").value = "";
    document.getElementById("journal-lot").value = "";
    document.getElementById("trade-notes").value = "";
}
