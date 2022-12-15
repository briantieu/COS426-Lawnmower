/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SeedScene } from 'scenes';
require('./audio/countdownbeep.mp3')
require('./audio/start.mp3')
require('./audio/background.mp3')
require('./audio/lawnmower.mp3')

// Initialize core ThreeJS components
let scene;
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({ antialias: true });
let difficultyRegistered = false;

// Set up camera
const relativeCameraOffset = new Vector3(0, 10, -20);
camera.position.set(0, 10, -10);
camera.lookAt(new Vector3(0, 0, 0));

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.style.zIndex = '-1';
document.body.appendChild(canvas);

const div = document.createElement('div');
const starterScreen = `
<div style="border-radius: 20px; padding: 20px; margin-left: auto; margin-right: auto; height: fit-content; width: 50vw; color: white; font-size: 20px; background-color: rgb(53, 67, 53); box-shadow: 0px 0px 40px 8px black">
    <div id="starterScreen" style="align-content: center; display: flex; flex-direction: column;">
        <p style='font-family: Cursive;  color: rgb(255, 255, 255); font-weight: bolder; font-size: 45px; padding-top: 10px; margin: 0;'>
            <i>Welcome to Lawnmower Lunacy</i>
        </p>
        <p style='text-align: left'><b style="font-size: 25px;">Gameplay Directions:</b>
            <ul style='margin-top: -10px; text-align: left'>
                <li>Use the <span style="font-weight: 20px; background-color: rgb(0, 0, 0); padding: 1px 8px 4px 8px; color: rgb(185, 151, 97); border-radius: 5px;">&#8593;</span> and <span style="font-weight: 20px; background-color: rgb(0, 0, 0); padding: 1px 8px 4px 8px; color: rgb(185, 151, 97); border-radius: 5px;">&#8595;</span> keyboard keys to speed up and slown down.</li>
                <li style="margin-top: 7px;">Use the <span style="font-weight: 20px; background-color: rgb(0, 0, 0); padding: 1px 8px 4px 8px; color: rgb(185, 151, 97); border-radius: 5px;">&#8592;</span> and <span style="font-weight: 20px; background-color: rgb(0, 0, 0); padding: 1px 8px 4px 8px; color: rgb(185, 151, 97); border-radius: 5px;">&#8594;</span> keyboard keys to change direction.</li>
                <li style="margin-top: 7px;">Running into a rock will <span style="color: rgb(214, 134, 134); font-weight: bolder;">deduct</span> points.</li>
                <li style="margin-top: 7px;">Mowing a weed (big grass) will give you size <span style="color: rgb(214, 134, 134); font-weight: bolder;">boost</span>!</li>
                <li style="margin-top: 7px; font-weight: bolder;">Cut as much grass as you can before time runs out!!</li>
            </ul>
        </p>
        <div style="margin-top: -20px; display: flex; flex-direction: row; gap: 10px">
            <label style="display: inline; width: fit-content;" for="difficulty">Difficulty (1 - 20):</label>
            <input style="width: 100px; height: 25px; display: inline;" type="number" value="1" id="difficulty" name="difficulty" min="1" max="20">
        </div>
        <br>
        <button id="countdownSequence" style="box-shadow: 0px 0px 10px 2px rgb(255, 255, 255); border: none; border-radius: 8px; margin-left: auto; margin-right: auto; cursor: pointer; background-color: rgb(142, 116, 76); color: white; border: none; width: fit-content; height: 50px; font-size: 25px;">
            Mow That Lawn!!
        </button>
        <br>
    </div>
    <div id="resultsScreen" style="display: none; flex-direction: column;">
        <p style='color: white; font-weight: bolder; font-size: 60px; padding: 20px; margin: 0;'>
            Your Score
        </p>
        <p id="scoreResult" style="padding: 0; margin: 0; font-size: 70px;">0</p>
        <br>
        <br>
        <button id="playAgain" style="box-shadow: 0px 0px 10px 2px rgb(255, 255, 255); border: none; border-radius: 8px; margin-left: auto; margin-right: auto; cursor: pointer; background-color: #8D744C; color: white; border: none; width: fit-content; height: 50px; font-size: 25px;">
            Play Again
        </button>
        <br>
    </div>
</div>
`
div.id = 'startScreen';
// div.style.display = 'none'; // comment out this line to show the homescreen
div.style.display = 'flex';
div.style.flexDirection = 'column';
div.style.justifyContent = 'center';
div.style.position = 'fixed';
div.style.textAlign = 'center';
div.style.zIndex = '100';
div.style.left = '0';
div.style.top = '0';
div.style.fontFamily = 'Arial';
div.style.width = '100vw';
div.style.height = '100vh';
div.style.backgroundColor = 'rgb(126, 153, 126)';
div.innerHTML = starterScreen;

const countdown = document.createElement('div');
countdown.innerHTML = `
<span id="three" style="width: 100vw; text-align: center; font-family: arial; visibility: hidden; color: red; font-size: 300px; line-height: 300px; z-index: 100; position: fixed; left: 0; top: 25%;">3</span>
<span id="two" style="width: 100vw; text-align: center; font-family: arial; visibility: hidden; color: red; font-size: 300px; line-height: 300px; z-index: 100; position: fixed; left: 0; top: 25%;">2</span>
<span id="one" style="width: 100vw; text-align: center; font-family: arial; visibility: hidden; color: red; font-size: 300px; line-height: 300px; z-index: 100; position: fixed; left: 0; top: 25%;">1</span>
<span id="go" style="width: 100vw; text-align: center; font-family: arial; visibility: hidden; color: red; font-size: 300px; line-height: 300px; z-index: 100; position: fixed; left: 0; top: 25%;">Go!!</span>
<p id="timer" style="font-family: arial; position: fixed; visibility: hidden; top: -40px; left: 30px; font-size: 60px; font-weight: bolder; background-color: #7E997E; padding: 5px; padding-left: 10px; padding-right: 10px; border-radius: 8px; color: black">1:00</p>
<p id="score" style="font-family: arial; position: fixed; visibility: hidden; top: 30px; left: 30px; font-size: 60px; font-weight: bolder; background-color: #7E997E; padding: 5px; padding-left: 10px; padding-right: 10px; border-radius: 8px; color: white;">0</p>
`;

document.body.append(div);
document.body.append(countdown);
console.log(document);

document
    .getElementById('countdownSequence')
    .addEventListener('click', countdownSequence);

document
    .getElementById('playAgain')
    .addEventListener('click', playAgain);

function updateScore(score){
    document.getElementById("score").innerHTML = score;
}

function countdownSequence() {
    var countdownbeep = new Audio('src/audio/countdownbeep.mp3');
    var startbeep = new Audio('src/audio/start.mp3');
    countdownbeep.play();
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('three').style.visibility = 'visible';
    difficultyRegistered = true;

    let difficultyValue = parseInt(document.getElementById("difficulty").value);
    if (difficultyValue < 1) difficultyValue = 1;
    else if (difficultyValue > 20) difficultyValue = 20;
    scene = new SeedScene(difficultyValue);

    setTimeout(() => {
        document.getElementById('three').style.visibility = 'hidden';
        document.getElementById('two').style.visibility = 'visible';
    }, 1000);
    setTimeout(() => {
        countdownbeep.play();
    }, 1700);
    setTimeout(() => {
        document.getElementById('two').style.visibility = 'hidden';
        document.getElementById('one').style.visibility = 'visible';
    }, 2000);
    setTimeout(() => {
        countdownbeep.play();
    }, 2700);
    setTimeout(() => {
        document.getElementById('one').style.visibility = 'hidden';
        document.getElementById('go').style.visibility = 'visible';
    }, 3000);
    setTimeout(() => {
        startbeep.play();
    }, 3600);
    setTimeout(() => {
        document.getElementById('go').style.visibility = 'hidden';
        startGame();
    }, 4000);
}

function startGame() {
    document.getElementById('timer').style.visibility = 'visible';
    document.getElementById('score').style.visibility = 'visible';
    var audio = new Audio('src/audio/background.mp3');
    audio.play();
    startTimer();
    console.log('Game Started!!');
}

// timer code taken from this site: https://codepen.io/ishanbakshi/pen/pgzNMv?editors=0110
function startTimer() {
    var presentTime = document.getElementById('timer').innerHTML;
    var timeArray = presentTime.split(/[:]+/);
    var m = timeArray[0];
    var s = checkSecond(timeArray[1] - 1);

    if (s == 59) {
        m = m - 1;
    }
    if (m < 0) {
        endGame();
        return;
    }

    document.getElementById('timer').innerHTML = m + ':' + s;
    setTimeout(startTimer, 1000);
}

function checkSecond(sec) {
    if (sec < 10 && sec >= 0) {
        sec = '0' + sec;
    } // add zero in front of numbers < 10
    if (sec < 0) {
        sec = '59';
    }
    return sec;
}

function endGame() {
    document.getElementById("startScreen").style.display = 'flex';
    document.getElementById("resultsScreen").style.display = 'flex';
    document.getElementById("starterScreen").style.display = 'none';
    document.getElementById('timer').style.visibility = 'hidden';
    document.getElementById('score').style.visibility = 'hidden';
    document.getElementById('timer').innerHTML = '1:00';
    document.getElementById("scoreResult").innerHTML = document.getElementById("score").innerHTML;
}

function playAgain(){
    // document.getElementById("resultsScreen").style.display = 'none';
    // document.getElementById("starterScreen").style.display = 'flex';
    // document.getElementById('score').innerHTML = '0';
    window.location.reload(true);
}

// Set up controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;
// controls.enablePan = false;
// controls.minDistance = 4;
// controls.maxDistance = 16;
// controls.maxPolarAngle = Math.PI / 2 - 0.25;
// controls.update();

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    if(difficultyRegistered){
    // Camera controls inspired by https://jsfiddle.net/Fyrestar/6519yedL/
    const lawnMower = scene.getObjectByName('lawnMower');
    const temp = new Vector3(0, 0, 0);
    // Follows LM with fixed world POV, but not behind LM
    // temp.setFromMatrixPosition(lawnMower.matrixWorld).add(relativeCameraOffset);

    // Chase camera
    const cameraOffset = lawnMower.getObjectByName('cameraOffset');
    temp.setFromMatrixPosition(cameraOffset.matrixWorld);

    camera.position.lerp(temp, 0.15);
    camera.lookAt(lawnMower.position);

    // controls.update();

    renderer.render(scene, camera);
    scene.update && scene.update(timeStamp);
    
    updateScore(scene.children[3].getScore() - scene.children[7].getRockPenalty());
    }
    window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);

const handleKeyDown = (event) => {
    scene.getObjectByName('lawnMower').move(event);
};

// Set up lawn mower movement
window.addEventListener('keydown', handleKeyDown, false);