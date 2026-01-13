// Ball properties
let ball = {
    x: 300,
    y: 200,
    diameter: 40,
    speedX: 5,
    speedY: 3,
    color: [255, 105, 180], // Pink color
    trail: []
};

// Simulation settings
let gravity = 0.1;
let bounceFactor = 0.85;
let isPaused = false;
let collisionCount = 0;
let maxTrailLength = 20;

// Canvas dimensions
let canvasWidth = 600;
let canvasHeight = 400;

// Mouse interaction
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragEndX = 0;
let dragEndY = 0;

function setup() {
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    
    // Initialize ball position to center
    ball.x = width / 2;
    ball.y = height / 2;
    
    // Set up event listeners for controls
    document.getElementById('speedSlider').addEventListener('input', function() {
        // Adjust speed proportionally
        let speedMultiplier = this.value / 5;
        ball.speedX = ball.speedX > 0 ? speedMultiplier * 5 : -speedMultiplier * 5;
        ball.speedY = ball.speedY > 0 ? speedMultiplier * 3 : -speedMultiplier * 3;
        document.getElementById('speedValue').textContent = this.value;
    });
    
    document.getElementById('sizeSlider').addEventListener('input', function() {
        ball.diameter = parseInt(this.value);
        document.getElementById('sizeValue').textContent = this.value;
    });
    
    document.getElementById('gravitySlider').addEventListener('input', function() {
        gravity = parseFloat(this.value);
        document.getElementById('gravityValue').textContent = gravity.toFixed(2);
    });
    
    document.getElementById('bounceSlider').addEventListener('input', function() {
        bounceFactor = parseFloat(this.value);
        document.getElementById('bounceValue').textContent = bounceFactor.toFixed(2);
    });
    
    // Update status display
    updateStatus();
}

function draw() {
    // Dark blue background
    background(25, 25, 40);
    
    // Draw drag line if dragging
    if (isDragging) {
        stroke(255, 255, 255, 150);
        strokeWeight(2);
        line(dragStartX, dragStartY, mouseX, mouseY);
        
        // Draw arrow at the end
        drawArrow(dragStartX, dragStartY, mouseX, mouseY);
    }
    
    // Draw ball trail
    drawTrail();
    
    // Draw the ball
    drawBall();
    
    // Update ball position if not paused
    if (!isPaused) {
        updateBall();
    }
    
    // Update status display
    updateStatus();
}

function drawBall() {
    // Draw glow effect
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = `rgb(${ball.color[0]}, ${ball.color[1]}, ${ball.color[2]})`;
    
    // Draw the ball
    fill(ball.color[0], ball.color[1], ball.color[2]);
    noStroke();
    ellipse(ball.x, ball.y, ball.diameter, ball.diameter);
    
    // Draw inner highlight
    fill(255, 255, 255, 100);
    ellipse(ball.x - ball.diameter/6, ball.y - ball.diameter/6, ball.diameter/4, ball.diameter/4);
    
    // Reset shadow
    drawingContext.shadowBlur = 0;
}

function drawTrail() {
    // Draw trail behind the ball
    for (let i = 0; i < ball.trail.length; i++) {
        let point = ball.trail[i];
        let alpha = map(i, 0, ball.trail.length, 20, 100);
        let size = map(i, 0, ball.trail.length, ball.diameter/3, ball.diameter);
        
        fill(ball.color[0], ball.color[1], ball.color[2], alpha);
        noStroke();
        ellipse(point.x, point.y, size, size);
    }
}

function drawArrow(x1, y1, x2, y2) {
    // Draw an arrow from (x1, y1) to (x2, y2)
    let angle = atan2(y2 - y1, x2 - x1);
    let length = dist(x1, y1, x2, y2);
    let arrowSize = min(length / 3, 20);
    
    push();
    translate(x2, y2);
    rotate(angle);
    
    // Arrow line
    stroke(255, 255, 255, 200);
    strokeWeight(2);
    line(-arrowSize, 0, 0, 0);
    
    // Arrow head
    noStroke();
    fill(255, 255, 255, 200);
    triangle(0, 0, -arrowSize, arrowSize/3, -arrowSize, -arrowSize/3);
    
    pop();
}

function updateBall() {
    // Add current position to trail
    ball.trail.push({x: ball.x, y: ball.y});
    
    // Limit trail length
    if (ball.trail.length > maxTrailLength) {
        ball.trail.shift();
    }
    
    // Apply gravity
    ball.speedY += gravity;
    
    // Update position
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    
    // Check for collisions with edges
    let collided = false;
    
    // Right edge
    if (ball.x + ball.diameter/2 > width) {
        ball.x = width - ball.diameter/2;
        ball.speedX = -ball.speedX * bounceFactor;
        collided = true;
    }
    // Left edge
    else if (ball.x - ball.diameter/2 < 0) {
        ball.x = ball.diameter/2;
        ball.speedX = -ball.speedX * bounceFactor;
        collided = true;
    }
    
    // Bottom edge
    if (ball.y + ball.diameter/2 > height) {
        ball.y = height - ball.diameter/2;
        ball.speedY = -ball.speedY * bounceFactor;
        
        // Add some friction on ground contact
        ball.speedX *= 0.99;
        collided = true;
    }
    // Top edge
    else if (ball.y - ball.diameter/2 < 0) {
        ball.y = ball.diameter/2;
        ball.speedY = -ball.speedY * bounceFactor;
        collided = true;
    }
    
    // If collision occurred, change color and increment count
    if (collided) {
        changeColor();
        collisionCount++;
    }
    
    // Gradually slow down horizontal movement (air resistance)
    ball.speedX *= 0.999;
}

function changeColor() {
    // Generate a random bright color
    ball.color = [
        random(100, 255),
        random(100, 255),
        random(100, 255)
    ];
}

function mousePressed() {
    // Check if mouse is over the ball
    let d = dist(mouseX, mouseY, ball.x, ball.y);
    if (d < ball.diameter/2) {
        isDragging = true;
        dragStartX = ball.x;
        dragStartY = ball.y;
        return false; // Prevent default
    }
}

function mouseReleased() {
    if (isDragging) {
        isDragging = false;
        
        // Calculate throw velocity based on drag distance
        let throwStrength = 0.2;
        ball.speedX = (dragStartX - mouseX) * throwStrength;
        ball.speedY = (dragStartY - mouseY) * throwStrength;
    }
}

function keyPressed() {
    // Space bar toggles pause
    if (key === ' ') {
        isPaused = !isPaused;
    }
    
    // R key resets the simulation
    if (key === 'r' || key === 'R') {
        resetSimulation();
    }
}

function resetSimulation() {
    ball.x = width / 2;
    ball.y = height / 2;
    ball.speedX = random([-5, 5]);
    ball.speedY = random(-3, 3);
    ball.trail = [];
    collisionCount = 0;
    isPaused = false;
    changeColor();
}

function updateStatus() {
    document.getElementById('posX').textContent = Math.round(ball.x);
    document.getElementById('posY').textContent = Math.round(ball.y);
    document.getElementById('velX').textContent = ball.speedX.toFixed(2);
    document.getElementById('velY').textContent = ball.speedY.toFixed(2);
    document.getElementById('collisionCount').textContent = collisionCount;
}

// Make functions available globally for p5.js
window.setup = setup;
window.draw = draw;
window.mousePressed = mousePressed;
window.mouseReleased = mouseReleased;
window.keyPressed = keyPressed;
