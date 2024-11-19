const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const wilson = new Image();
    wilson.src = "Sprites\\Wilson.png";
const ganso = new Image();
    ganso.src = "Sprites\\Ganso.png";
const enemySprite = new Image();
    enemySprite.src = "Sprites\\enemigo_20x20.png";
const pointsSprite = new Image();
    pointsSprite.src = "Sprites\\gema_mazmorra.png";
const arbusto = new Image();
    arbusto.src = "Sprites\\pasto.png";
const scoreElements = {
    score: document.getElementById("score"),
    cubuS: document.getElementById('cubuPts'),
    coboS: document.getElementById('coboPts')};
const speed = document.getElementById('speed');
const multiPlayerObj = document.getElementById('multiPlayer');
const divObj = document.getElementById('divplayer');
let multiPlayer = false;
let singlePlayer = false;
let Credits = false;
let CreditsDiv = document.getElementById('creditsDiv');
let initPage = true;
const buttons = [
    { x: 50, y: 50, width: 110, height: 40, label: 'sp', toShow: "Single Player", show: true},
    { x: 200, y: 50, width: 100, height: 40, label: 'mp', toShow: "Multiplayer", show: true},
    {x:350, y: 50, width: 110, height:40, label: 'cred', toShow: 'Credits', show: true},
    {x:364, y:394, width:110, height: 40, label: 'back', toShow: 'Go back', show: false}
];

// canvas.addEventListener('click', function(event) {
//     // Get the bounding rectangle of the canvas
//     const rect = canvas.getBoundingClientRect();
//     // Calculate the click coordinates relative to the canvas
//     const x = event.clientX - rect.left;
//     const y = event.clientY - rect.top;
//     // Alert the coordinates
//     alert(`Coordinates: (${x}, ${y})`);
// });

multiPlayerObj.addEventListener("change", function(){
    if(multiPlayer){
        nextround = true;
    }else{
        isGameOver = true;
    }
});

let cobo = { x: 50, y: 50, size: 20, speed: 5, visible: true};
let coboS = 0;
let coboD = 0;
let coboG = 0;
let cubu = {x: 70, y: 70, size: 20, speed: 5, visible: true};
let cubuS = 0;
let cubuD = 0;
let cubuG = 0;
let enemies = [];
let points = [];
let obstacles = [];
let powerUps = [];
let score = 0;
let scoreS = 0;
let enemySpeed = 1;
let isGameOver = false;
let EnemiesSeeCobo = true;
let scores = [];
let gameLoopId = null;
let isGameRunning = false;
let nextround = false;


// Key states
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    a: false,
    s: false,
    d: false,
};


// Initialize the game
function init(i = 1) {
    if (isGameRunning) {return "ya ta corriendose"}; // Prevent starting a new game if one is already running
    isGameRunning = true; // Set the game as running
    console.log(isGameRunning);
    nextround = false;
    console.clear();
    let v = parseInt(speed.value);
    console.log(multiPlayerObj.checked);
    console.log(v);
    score = 0;
    scores = [];
    enemySpeed = 1;
    cobo = { x: 50, y: 50, size: 20, speed: v , visible: true};
    if(i === 1){
        cubuS = 0;
        coboS = 0;
        scoreS = 0;
        multiPlayer = false;
        initPage = true;
        singlePlayer = false;
    }
    cubu = { x: 50, y: 50, size: 20, speed: v, visible: true};
    enemies = [];
    points = [];
    obstacles = [];
    isGameOver = false;
    spawnPoints();
    spawnObstacles();
    
    // Start the game loop
    gameLoopId = requestAnimationFrame(update);
}
//tries to spawn power ups whith a probability of 5% per frame and a 50/50 of good or no
function TrySpawnPowerUp(){
    if(singlePlayer){
        if(Math.random() < 0.0005 && powerUps.length === 0){
            powerUps.push({
                x: Math.random() * canvas.width - 20,
                y: Math.random() * canvas.height - 20,
                size: 20,
                type: Math.random() < 0.5 ? "BoostEnemy" : "BoostCobo",
            });
            return "spawned";
        }
    }
    if(multiPlayer){
        if(Math.random() < 0.0005 && powerUps.length === 0){
            powerUps.push({
                x: Math.random() * canvas.width - 20,
                y: Math.random() * canvas.height - 20,
                size: 20,
                type: Math.random() < 0.5 ? "BoostEnemy" : "BoostCobo",
            });
            
            return "spawned";
        }
    }
    console.log(powerUps.length > 0 ? (powerUps[0].type === "BoostEnemy" ? "enemy" : "cobo") : "noSpawned");
}
// Spawn points
function spawnPoints() {
    for (let i = 0; i < 3; i++) {
        points.push({
            x: Math.random() * (canvas.width - 20),
            y: Math.random() * (canvas.height - 20),
            size: 20
        });
    }
}

// Spawn obstacles
function spawnObstacles() {
    for (let i = 0; i < 5; i++) {
        obstacles.push({
            x: Math.random() * (canvas.width - 20),
            y: Math.random() * (canvas.height - 20),
            size: 20,
            isGood: Math.random() > 0.4 // Randomly good or bad
        });
    }
}

// Spawn enemies
function spawnEnemies(cant) {
    for (let i = 0; i < cant; i++) {
         let collide = true;
        let x = Math.random() * (canvas.width - 20);
        let y = Math.random() * (canvas.height - 20);
        
        while(collide){
            if((cobo.x < x + 100 &&
                cobo.x + 100 > x &&
                cobo.y < y + 100 &&
                cobo.y + 100 > y) === true){
                    x = Math.random() * (canvas.width - 20);
                    y = Math.random() * (canvas.height - 20);
            }
            else{
                collide = false;
            }
        }
        enemies.push({
            x: x,
            y: y,
            size: 20, // Adjust enemy size as needed
            objectiveX: Math.random() * (canvas.width - 20),
            objectiveY: Math.random() * (canvas.height - 20)
        });
    }
}

// Update function
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(Credits){
        CreditsDiv.style.display = "block";
        drawButtons();
    }
    if(multiPlayer === true || singlePlayer === true){
        drawCobo();
        if(multiPlayer === true){
            drawCubu();
            divObj.style.display = "block";
            scoreS = coboS + cubuS;
        }
        else{
            divObj.style.display = "none";
            if(score >= 530){
                TrySpawnPowerUp();
            }
            drawPowerUp();
        }
        drawEnemies(); // Draw enemies
        drawPoints();
        drawObstacles();
        move(); // Move enemies towards Cobo
        checkCollisions(); // Check for collisions
        updateScore(); // Update score display

        // Move Cobo based on key states
        if(multiPlayer === true){
            if (keys.w) cobo.y -= cobo.speed;
            if (keys.s) cobo.y += cobo.speed;
            if (keys.a) cobo.x -= cobo.speed;
            if (keys.d) cobo.x += cobo.speed;
            if (keys.ArrowUp) cubu.y -= cubu.speed;
            if (keys.ArrowDown) cubu.y += cubu.speed;
            if (keys.ArrowLeft) cubu.x -= cubu.speed;
            if (keys.ArrowRight) cubu.x += cubu.speed;
        }
        else{
            if (keys.ArrowUp || keys.w) cobo.y -= cobo.speed;
            if (keys.ArrowDown || keys.s) cobo.y += cobo.speed;
            if (keys.ArrowLeft || keys.a) cobo.x -= cobo.speed;
            if (keys.ArrowRight || keys.d) cobo.x += cobo.speed;
        }

        // Prevent Cobo from moving out of bounds
        cobo.x = Math.max(0, Math.min(canvas.width - cobo.size, cobo.x));
        cobo.y = Math.max(0, Math.min(canvas.height - cobo.size, cobo.y));
        cubu.x = Math.max(0, Math.min(canvas.width - cubu.size, cubu.x));
        cubu.y = Math.max(0, Math.min(canvas.height - cubu.size, cubu.y));

        if(!multiPlayer){
            if (!isGameOver) {
                gameLoopId = requestAnimationFrame(update); // Update game loop
            } else {
                drawGameOver();
                isGameRunning = false; // Reset the running flag when game is over
            }
        }
        else{
            if(!nextround){
                gameLoopId = requestAnimationFrame(update);
            }else{
                isGameRunning = false;
                init(0);
            }
        }
        if(score % 30 === 0 && scores.includes(score) === false && (score === 0) === false){
            var enn = enemies.length;
            scores.push(score);
            spawnEnemies(1);
        }
        if(points.length === 0){
            spawnPoints();
        }
    }
    if(initPage === true){
        gameLoopId = requestAnimationFrame(update);
        drawButtons();
    }
}
function isPointInButton(x, y, button) {
    return x >= button.x && x <= button.x + button.width &&
           y >= button.y && y <= button.y + button.height;
}
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    buttons.forEach((button, index) => {
        if (isPointInButton(mouseX, mouseY, button)) {
            console.log(`Clicked on: ${button.label}`);
            // You can add more functionality here
            if(button.label === "sp"){
                singlePlayer = true;
                initPage = false;
            }if(button.label === "mp"){
                multiPlayer = true;
                initPage = false;
            }if(button.label === "cred"){
                Credits = true;
                initPage = false;
            }if(button.label === "back"){
                Credits = false;
                initPage = true;
                update();
            }
        }
    });
});


// Draw Cobo
function drawCobo() {
    ctx.drawImage(wilson, cobo.x, cobo.y);
}
function drawCubu() {
    ctx.drawImage(ganso, cubu.x, cubu.y);
}
function drawPowerUp(){
    if(powerUps.length === 0)return;
    ctx.fillStyle = powerUps[0].type === "BoostEnemy" ? "green" : "red";
    ctx.fillRect(powerUps[0].x, powerUps[0].y, powerUps[0].size, powerUps[0].size);
}
function drawButtons() {
    buttons.forEach(button => {
        if(button.show && Credits === false){
            ctx.fillStyle = '#4CAF50'; // Button color
            ctx.fillRect(button.x, button.y, button.width, button.height); // Draw button
            ctx.fillStyle = '#FFFFFF'; // Text color
            ctx.font = '16px Arial';
            ctx.fillText(button.toShow, button.x + 10, button.y + 25); // Draw button label
        }if(button.show === false){
            if(Credits === true){
                ctx.fillStyle = '#4CAF50'; // Button color
                ctx.fillRect(button.x, button.y, button.width, button.height); // Draw button
                ctx.fillStyle = '#FFFFFF'; // Text color
                ctx.font = '16px Arial';
                ctx.fillText(button.toShow, button.x + 10, button.y + 25); // Draw button label
            }
        }
    });
}
// Draw enemies
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.drawImage(enemySprite, enemy.x, enemy.y);
    });
}

// Draw points
function drawPoints() {
    points.forEach(point => {
        ctx.drawImage(pointsSprite, point.x, point.y);
    });
}

// Draw obstacles
function drawObstacles() {
    obstacles.forEach(obstacle => {
        if(obstacle.isGood){
            ctx.drawImage(arbusto, obstacle.x, obstacle.y);
        }
        else{
            ctx.fillStyle = "darkred";
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.size, obstacle.size);
        }
    });
}

// Move enemies towards Cobo
function move(){
    if(multiPlayer){
        if(cobo.visible === true && cubu.visible === true){
            moveEnemiesToClosestTarget("coubuo");
        }
        if(cobo.visible === true && cubu.visible === false){
            moveEnemiesToClosestTarget("cobo");
        }
        if(cobo.visible === false && cubu.visible === true){
            moveEnemiesToClosestTarget("cubu");
        }
        if(cobo.visible === false && cubu.visible === false){
            moveEnemiesToObjective();
        }
    }
    else{
        if(cobo.visible){
            moveEnemiesToClosestTarget("cobo");
        }
        else{
            moveEnemiesToObjective();
        }
    }
}
function moveEnemiesToClosestTarget(coubuo = "cobo") {
    enemies.forEach(enemy => {
        let distanceToCobo;
        let distanceToCubu;
        if(coubuo === "coubuo"){
            distanceToCubu = Math.sqrt(Math.pow(cubu.x - enemy.x, 2) + Math.pow(cubu.y - enemy.y, 2));
            distanceToCobo  = Math.sqrt(Math.pow(cobo.x - enemy.x, 2) + Math.pow(cobo.y - enemy.y, 2));
        }
        if(coubuo === "cubu"){
            distanceToCubu = Math.sqrt(Math.pow(cubu.x - enemy.x, 2) + Math.pow(cubu.y - enemy.y, 2));
        }
        if(coubuo === "cobo"){
            distanceToCobo = Math.sqrt(Math.pow(cobo.x - enemy.x, 2) + Math.pow(cobo.y - enemy.y, 2));
        }
        
        // Determine the closest target
        
        let target = cobo;
        if(coubuo === "coubuo"){
            target = distanceToCobo < distanceToCubu ? cobo : cubu;
        }
        if(coubuo === "cubu"){
            target = cubu;
        }

        let dx = target.x - enemy.x;
        let dy = target.y - enemy.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // Calculate new position
            let newX = enemy.x + (dx / distance) * enemySpeed;
            let newY = enemy.y + (dy / distance) * enemySpeed;

            // Check for collisions with other enemies
            let collides = false;
            enemies.forEach((otherEnemy, otherIndex) => {
                if (enemy !== otherEnemy && isColliding({ x: newX, y: newY, size: enemy.size }, otherEnemy)) {
                    collides = true; // Collision detected
                }
            });

            // If no collision, update enemy position
            if (!collides) {
                enemy.x = newX;
                enemy.y = newY;
            }
        }
    });
}
//move enemies towards its objective
function moveEnemiesToObjective(){
    enemies.forEach(enemy => {
        if(enemy.x < enemy.objectiveX + enemy.size && enemy.x + enemy.size > enemy.objectiveY && enemy.y < enemy.objectiveY + enemy.size && enemy.y + enemy.size > enemy.objectiveY){
            enemy.objectiveX = Math.random() * (canvas.width - 20);
            enemy.objectiveY = Math.random() * (canvas.height - 20);
        }
        let dx = enemy.objectiveX - enemy.x;
        let dy = enemy.objectiveY - enemy.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            enemy.x += (dx / distance) * enemySpeed;
            enemy.y += (dy / distance) * enemySpeed;
        }
    });
}

// Check for collisions
function checkCollisions() {
    if(multiPlayer === false){
        points.forEach(point => {
            obstacles.forEach(obstacle =>{
                if(isColliding(point, obstacle)){
                    obstacles = [];
                    points = [];
                    spawnObstacles();
                }
        })});

        enemies.forEach(enemy => {
            if (isColliding(cobo, enemy) && cobo.visible === true) {
                isGameOver = true; // End game if Cobo collides with an enemy
            }
        });
        points.forEach((point, index) => {
            if (isColliding(cobo, point)) {
                points.splice(index, 1); // Remove point from the array
                score += 10; // Increase score
            }
        });

        obstacles.forEach(obstacle => {
            if(obstacle.isGood === true){
                if(isColliding(cobo, obstacle) === true){
                    cobo.visible = false;
                }
                else{
                    cobo.visible = true;
                }
            }
            else{
                if (isColliding(cobo, obstacle) === true) {
                    isGameOver = true; // End game if Cobo collides with an obstacle
                }
            }
            
        });
    }
    else{
        points.forEach(point => {
            obstacles.forEach(obstacle =>{
                if(isColliding(point, obstacle)){
                    obstacles = [];
                    points = [];
                    spawnObstacles();
                }
        })});

        enemies.forEach(enemy => {
            if (isColliding(cobo, enemy) && cobo.visible === true) {
                coboD++;
                cubuS += 100;
                nextround = true;
            }
            if(isColliding(cubu, enemy) && cubu.visible === true){
                cubuD++;
                coboS += 100;
                nextround = true;
            }
        });
        points.forEach((point, index) => {
            if (isColliding(cobo, point)) {
                points.splice(index, 1); // Remove point from the array
                coboS += 10;
                coboG++;
                score += 10; // Increase score
            }
            if(isColliding(cubu, point)){
                points.splice(index, 1);
                cubuS += 10;
                cubuG++;
                score += 10;
            }
        });

        obstacles.forEach(obstacle => {
            if(obstacle.isGood === true){
                if(isColliding(cobo, obstacle)){
                    cobo.visible = false;
                }
                else{
                    cobo.visible = true;
                }

                if(isColliding(cubu, obstacle)){
                    cubu.visible = false;
                }
                else{
                    cubu.visible = true;
                }
            }
            else{
                if (isColliding(cobo, obstacle)) {
                    coboD++;
                    cubuS += 100;
                    nextround = true;
                }
                if(isColliding(cubu, obstacle)){
                    cubuD++;
                    coboS += 100;
                    nextround = true;
                }
            }
            
        });
    }
}

// Collision detection function
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.size &&
           rect1.x + rect1.size > rect2.x &&
           rect1.y < rect2.y + rect2.size &&
           rect1.y + rect1.size > rect2.y;
}

// Update score display
function updateScore() {
    if(multiPlayer){
        scoreElements.score.innerText = `Score: ${scoreS}`;
    }else{
        scoreElements.score.innerText = `Score: ${score}`;
    }
    
    scoreElements.cubuS.innerText = `Cubu\'s Score: ${cubuS}; Deaths: ${cubuD}; Gems: ${cubuG}`;
    scoreElements.coboS.innerText = `Cobo\'s Score: ${coboS}; Deaths: ${coboD}; Gems: ${coboG}`;
}

// Draw game over screen
function drawGameOver() {
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 70, canvas.height / 2);
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2 - 90, canvas.height / 2 + 40);
}

// Handle key down events
window.addEventListener("keydown", (event) => {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = true;
    }
});

// Handle key up events
window.addEventListener("keyup", (event) => {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = false;
    }
});

// Start the game
init();
