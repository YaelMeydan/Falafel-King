const startBtn = document.getElementById('startBtn');
const usernameInput = document.getElementById('username');
const gameArea = document.getElementById('gameArea');
const playerName = document.getElementById('playerName');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const inventoryDiv = document.getElementById('inventory');
const ordersDiv = document.getElementById('orders');
let currentOrder = null;
let score = 0;
let timer;
let ingredientInventory = { falafel: 5, tomatoes: 5, lettuce: 5, onions: 5 };
const ingredient = JSON.parse(localStorage.getItem(ingredientInventory));
let orderCount = localStorage.getItem('orderCount') ? +localStorage.getItem('orderCount') : 0;
function startGame() {
    const username = usernameInput.value;
    if (username.length < 1)
        return alert('Enter username!');
    const userData = JSON.parse(localStorage.getItem(username) || '{"score": 0}');
    score = userData.score;
    playerName.innerText = username;
    scoreDisplay.innerText = score.toString();
    orderCount++;
    if (orderCount >= 4) {
        timer = 30;
    }
    else {
        timer = 30; // timer should be 60 seconds originally, reduced time for class presentation.
    }
    localStorage.setItem('orderCount', orderCount.toString());
    localStorage.setItem(username, JSON.stringify({ score }));
    gameArea.style.display = 'block';
    startTimer();
    generateOrder();
    updateInventoryDisplay();
}
function startTimer() {
    const countdown = setInterval(() => {
        timer--;
        timerDisplay.innerText = timer.toString();
        if (timer <= 0) {
            clearInterval(countdown);
            endGame();
        }
    }, 500);
}
function generateOrder() {
    currentOrder = {
        falafel: Math.floor(Math.random() * 4),
        tomatoes: Math.floor(Math.random() * 4),
        lettuce: Math.floor(Math.random() * 4),
        onions: Math.floor(Math.random() * 4),
    };
    ordersDiv.innerHTML = '';
    const orderElement = document.createElement('div');
    orderElement.className = 'order';
    orderElement.innerHTML = `
        <h3>New Order:</h3>
        <p>Falafel: ${currentOrder.falafel}</p>
        <p>Tomatoes: ${currentOrder.tomatoes}</p>
        <p>Lettuce: ${currentOrder.lettuce}</p>
        <p>Onions: ${currentOrder.onions}</p>
        <button id="completeOrderBtn">Complete Order</button>
    `;
    ordersDiv.appendChild(orderElement);
    const completeOrderBtn = document.getElementById('completeOrderBtn');
    completeOrderBtn.addEventListener('click', completeOrder);
}
function completeOrder() {
    if (!currentOrder)
        return;
    const hasAllIngredients = Object.keys(currentOrder).every(ingredient => {
        return ingredientInventory[ingredient] >= currentOrder[ingredient];
    });
    if (!hasAllIngredients) {
        alert('Not enough ingredients to complete this order!');
        return;
    }
    for (let ingredient in currentOrder) {
        ingredientInventory[ingredient] -= currentOrder[ingredient];
    }
    score += 10;
    scoreDisplay.innerText = score.toString();
    localStorage.setItem(playerName.innerText, JSON.stringify({ score }));
    // Show completed message and generate new order
    alert('Completed!');
    currentOrder = null; // Reset current order
    generateOrder();
    updateInventoryDisplay();
}
function updateInventoryDisplay() {
    inventoryDiv.innerHTML = '';
    for (let ingredient in ingredientInventory) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'inventory-item';
        itemDiv.innerText = `${ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}: ${ingredientInventory[ingredient]}`;
        // Drag-and-drop functionality
        itemDiv.setAttribute('draggable', 'true');
        itemDiv.addEventListener('dragstart', (event) => {
            event.dataTransfer?.setData('text/plain', ingredient);
        });
        inventoryDiv.appendChild(itemDiv);
    }
    // Notify when inventory is empty
    for (let ingredient in ingredientInventory) {
        if (ingredientInventory[ingredient] <= 0) {
            alert(`${ingredient.charAt(0).toUpperCase() + ingredient.slice(1)} is out of stock!`);
            const restockButton = document.createElement('button');
            restockButton.innerText = 'Restock ' + ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
            restockButton.addEventListener('click', () => {
                ingredientInventory[ingredient] = 5; // Reset to default or desired number
                updateInventoryDisplay();
            });
            inventoryDiv.appendChild(restockButton);
        }
    }
}
function endGame() {
    gameArea.style.display = 'none';
    const scoreboard = document.getElementById('scoreboard');
    scoreboard.innerHTML = `
        <h2>Game Over!</h2>
        <p>Username: ${playerName.innerText}</p>
        <p>Your Score: ${score}</p>
        <h3>Top Players:</h3>
        <div id="topScores"></div>
    `;
    // Logic to get top scores
    getTopScores();
    scoreboard.style.display = 'block';
}
function getTopScores() {
    const players = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const userData = JSON.parse(localStorage.getItem(key) || '{"score": 0}');
        players.push({ username: key, score: userData.score });
    }
    // Sort players by score in descending order
    players.sort((a, b) => b.score - a.score);
    // Display top 5 players
    const topScoresDiv = document.getElementById('topScores');
    players.slice(0, 5).forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.innerText = `${player.username}: ${player.score}`;
        topScoresDiv.appendChild(playerDiv);
    });
}
// Attach Event Listeners
startBtn.addEventListener('click', startGame);
