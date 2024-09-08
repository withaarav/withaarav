document.addEventListener("DOMContentLoaded", function () {
    let balance = 2000;
    const balanceEl = document.getElementById("balance");
    const warningEl = document.getElementById("warning");
    const resultEl = document.getElementById("result");
    const winSound = document.getElementById("win-sound");
    const loseSound = document.getElementById("lose-sound"); // Lose sound element
    const spinnerSound = document.getElementById("spinner-sound"); // Spinner sound element
    const wheelEl = document.getElementById("wheel");

    const sliders = Array.from(document.querySelectorAll(".slider"));
    const betAmounts = sliders.map((slider, index) =>
        document.getElementById(`bet${index}`)
    );

    sliders.forEach((slider, index) => {
        slider.addEventListener("input", () => {
            betAmounts[index].innerText = `$${slider.value}`;
            updateTotalBet();
        });
    });

    function updateTotalBet() {
        const totalBet = sliders.reduce((total, slider) => total + parseInt(slider.value), 0);
        if (totalBet > balance) {
            warningEl.innerText = "Total bet exceeds available balance!";
        } else {
            warningEl.innerText = "";
        }
    }

    // Adjusted mapping based on feedback (swap mismatched numbers)
    const numberMapping = {
        0: 252,  // Swap with 7
        1: 216,  // Swap with 6
        2: 198,  // Swap with 5
        3: 162,  // Swap with 4
        4: 108,  // Swap with 3
        5: 72,   // Swap with 2
        6: 36,   // Swap with 1
        7: 0,    // Swap with 0
        8: 324,  // Swap with 9
        9: 288   // Swap with 8
    };

    document.getElementById("placeBetBtn").addEventListener("click", () => {
        const bets = [];
        let totalBet = 0;

        sliders.forEach((slider, index) => {
            const betAmount = parseInt(slider.value);
            if (betAmount > 0) {
                bets.push({ number: index, bet: betAmount });
                totalBet += betAmount;
            }
        });

        if (totalBet > balance) {
            warningEl.innerText = "Total bet exceeds available balance!";
            return;
        }

        if (bets.length === 0) {
            resultEl.innerText = "Please place at least one bet!";
            return;
        }

        balance -= totalBet;
        balanceEl.innerText = `Balance: $${balance}`;
        sliders.forEach(slider => slider.value = 0);
        betAmounts.forEach((betAmountEl, index) => betAmountEl.innerText = `$0`);

        // Start the spinner at 18 degrees
        wheelEl.style.transition = 'none'; // Remove the previous transition
        wheelEl.style.transform = 'rotate(18deg)'; // Set the starting position to 18 degrees

        // Play spinner sound
        spinnerSound.play();

        // Force a reflow to allow the new animation to be triggered
        setTimeout(() => {
            // Step 1: Choose the winning number
            const winningNumber = Math.floor(Math.random() * 10); // Randomly generate winning number

            // Step 2: Use the corrected number mapping to calculate the angle
            const targetAngle = 3600 + 18 + numberMapping[winningNumber]; // 3600 for 10 full spins + 18 to start centered, plus the number's position

            // Step 3: Spin the wheel
            wheelEl.style.transition = "transform 5s ease-out"; // Smooth stopping animation
            wheelEl.style.transform = `rotate(${targetAngle}deg)`; // Apply the calculated rotation

            // Stop the spinner sound when the spin ends (after 5 seconds)
            setTimeout(() => {
                spinnerSound.pause();
                spinnerSound.currentTime = 0; // Reset sound to the beginning

                displayResult(winningNumber, bets);
            }, 5000); // Wait for 5 seconds of spin before declaring the result
        }, 50); // A small delay to allow the reset to be applied
    });

    function displayResult(winningNumber, bets) {
        resultEl.innerText = `The winning number is ${winningNumber}`;
        const matchingBet = bets.find(bet => bet.number === winningNumber);
        if (matchingBet) {
            const winAmount = matchingBet.bet * 9;
            balance += winAmount;
            resultEl.innerText += `. You won $${winAmount}!`;
            balanceEl.innerText = `Balance: $${balance}`;
            winSound.play(); // Play win sound
        } else {
            resultEl.innerText += `. Sorry, you didn't win.`;
            loseSound.play(); // Play lose sound if no match
        }
    }
});
