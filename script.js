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
    `;
}

function chooseLevel(level) {

    alert("You selected the " + level + " level. Welcome to SIF FOREX HUB! 🚀");
}
