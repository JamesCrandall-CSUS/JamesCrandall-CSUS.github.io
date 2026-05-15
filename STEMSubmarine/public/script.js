const submarine = document.getElementById("submarine");
const ocean = document.getElementById("ocean");
const bubbleContainer = document.getElementById("bubble_container");
const deltaTime = 0.03;

let bubbles = [];

const ballastSlider = document.getElementById("ballast");
const thrustSlider = document.getElementById("thrust");

const depthText = document.getElementById("depth");
const pressureText = document.getElementById("pressure");
const verticalVelocityText = document.getElementById("vertical_velocity");
const horizontalVelocityText = document.getElementById("horizontal_velocity");
const ballastValueText = document.getElementById("ballast_value");

const aiText = document.getElementById("ai_text");

let depth = 50;
let verticalVelocity = 0;
let acceleration = 0;
let xPosition = 160;
let horizontalVelocity = 0;

// ballast amount inside submarine
let currentBallast = 50;

document.addEventListener("keydown", (event) => {

    if (event.key === "ArrowUp") {
        ballastSlider.value =
            Math.max(0, Number(ballastSlider.value) - 5);
    }

    if (event.key === "ArrowDown") {
        ballastSlider.value =
            Math.min(100, Number(ballastSlider.value) + 5);
    }

    if (event.key === "ArrowRight") {
        thrustSlider.value =
            Math.min(5, Number(thrustSlider.value) + 1);
    }

    if (event.key === "ArrowLeft") {
        thrustSlider.value =
            Math.max(-5, Number(thrustSlider.value) - 1);
    }

});

document.getElementById("ask_ai").addEventListener("click", updateAI);

function updatePhysics() {

    /*
        BALLAST SYSTEM
    */
    let targetBallast = Number(ballastSlider.value);

    // Slowly adjust ballast tanks
    currentBallast += (targetBallast - currentBallast) * 0.005;

    /*
        THRUST
    */
    let thrust = Number(thrustSlider.value);

    /*
    VERTICAL PHYSICS
    */

    // Ballast controls buoyancy
    let ballastForce =
        -(currentBallast - 50) * 0.12;

    // Water resistance
    let verticalDrag =
        verticalVelocity * 0.08;

    // Net acceleration
    acceleration =
        ballastForce -
        verticalDrag;

    // Update velocity
    verticalVelocity +=
        acceleration * deltaTime;

    // Clamp velocity
    verticalVelocity =
        Math.max(-10, Math.min(10, verticalVelocity));

    // Update depth
    depth -= verticalVelocity * deltaTime;

    // Pressure increases with depth
    let pressure = 1 + (depth / 10);


    /*
        HORIZONTAL PHYSICS
    */

    // Thrust pushes submarine sideways
    horizontalVelocity += thrust * 0.02;

    // Horizontal drag
    horizontalVelocity *= 0.98;

    // Limit speed
    horizontalVelocity =
        Math.max(-10, Math.min(10, horizontalVelocity));

    // Update position
    xPosition += horizontalVelocity;

    /*
        BOUNDARIES
    */

    // Ocean top boundary
    if (depth < 0) {
        depth = 0;
        verticalVelocity = 0;
    }


    /*
        UPDATE SUBMARINE POSITION
    */
    let visualDepth = Math.min(depth, 350);

    submarine.style.top = visualDepth + "px";

    

    /*
        UPDATE UI
    */
    depthText.textContent = depth.toFixed(1);
    pressureText.textContent =  pressure.toFixed(2);
    ballastValueText.textContent = currentBallast.toFixed(1);
    ocean.style.backgroundPositionX = `${horizontalVelocity * 20}px`;

    verticalVelocityText.textContent = verticalVelocity.toFixed(2);
    horizontalVelocityText.textContent = horizontalVelocity.toFixed(2);

    /*
    OCEAN DEPTH COLORS
*/

/*
    SMOOTH OCEAN DEPTH LIGHTING
*/

// Clamp max visual depth
let maxDepth = 1000;

let normalizedDepth =
    Math.min(depth, maxDepth) / maxDepth;

/*
    SURFACE COLOR
    Light blue -> dark blue
*/
let topR =
    Math.floor(80 * (1 - normalizedDepth));

let topG =
    Math.floor(180 * (1 - normalizedDepth));

let topB =
    Math.floor(255 * (1 - normalizedDepth * 0.7));

/*
    DEEP WATER COLOR
*/
let bottomR =
    0;

let bottomG =
    Math.floor(80 * (1 - normalizedDepth));

let bottomB =
    Math.floor(180 * (1 - normalizedDepth));

/*
    APPLY GRADIENT
*/
ocean.style.background =
    `linear-gradient(
        to bottom,
        rgb(${topR}, ${topG}, ${topB}),
        rgb(${bottomR}, ${bottomG}, ${bottomB}),
        rgb(0, 0, 0)
    )`;

/*
    BUBBLE PHYSICS
*/

for (let i = bubbles.length - 1; i >= 0; i--) {

    let bubble = bubbles[i];

    // Bubbles rise
    bubble.y -= bubble.verticalSpeed;

    // Drift sideways
    bubble.x +=
        bubble.horizontalDrift -
        horizontalVelocity * 0.3;

    // Slight acceleration upward
    bubble.verticalSpeed += 0.01;

    // Update visuals
    bubble.element.style.left =
        bubble.x + "px";

    bubble.element.style.top =
        bubble.y + "px";

    bubble.element.style.width =
        bubble.size + "px";

    bubble.element.style.height =
        bubble.size + "px";

    // Remove offscreen bubbles
    if (bubble.y < -20) {

        bubble.element.remove();

        bubbles.splice(i, 1);
    }
}
}

function createBubble() {

    let bubble = {
        x:
            submarine.offsetLeft + 40 +
            (Math.random() * 20 - 10),

        y:
            submarine.offsetTop + 20,

        size:
            Math.random() * 8 + 4,

        verticalSpeed:
            Math.random() * 1.5 + 1,

        horizontalDrift:
            (Math.random() - 0.5) * 0.5
    };

    let element =
        document.createElement("div");

    element.classList.add("bubble");

    bubble.element = element;

    bubbleContainer.appendChild(element);

    bubbles.push(bubble);
}

async function updateAI() {

    const askButton =
        document.getElementById("ask_ai");

    try {

        // Show loading state
        aiText.textContent =
            "AI Tutor is thinking...";

        askButton.disabled = true;
        askButton.textContent = "Loading...";

        const pressure =
            1 + (depth / 10);

        const response =
            await fetch("/api/tutor", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    depth,
                    pressure,
                    ballast: currentBallast,
                    verticalVelocity
                })
            });

        const data = await response.json();

let formattedText = data.text;

/*
    Remove stray slashes
*/
formattedText =
    formattedText.replace(
        /^\\$/gm,
        ""
    );

/*
    Fix merged words/numbers
*/
formattedText =
    formattedText.replace(
        /([a-zA-Z])(\d)/g,
        "$1 $2"
    );

/*
    Convert [equation] blocks
*/
formattedText =
    formattedText.replace(

        /\[\s*([\s\S]*?)\s*\]/g,

        (_, equation) => {

            return `

$$
${equation.trim()}
$$

`;
        }
    );

/*
    Convert single dollar inline math
*/
formattedText =
    formattedText.replace(

        /\$([^$\n]+)\$/g,

        (_, equation) => {

            return `\\(${equation.trim()}\\)`;
        }
    );

/*
    Convert inline parentheses math
*/
formattedText =
    formattedText.replace(

        /\(([^()]+)\)/g,

        (_, equation) => {

            return `\\(${equation.trim()}\\)`;
        }
    );
aiText.innerHTML =
    marked.parse(formattedText);

/*
    Render MathJax
*/
if (window.MathJax) {

    MathJax.typesetPromise([aiText]);
}

    }

    catch (error) {

        aiText.textContent =
            "AI tutor unavailable.";
    }

    finally {

        // Restore button
        askButton.disabled = false;

        askButton.textContent =
            "Ask AI Tutor";
    }
}

setInterval(createBubble, 500);


setInterval(updatePhysics, 30);