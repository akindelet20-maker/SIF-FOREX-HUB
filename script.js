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
