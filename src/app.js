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

// Initialize core ThreeJS components
const scene = new SeedScene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({ antialias: true });

// Set up camera
camera.position.set(6, 3, -10);
camera.lookAt(new Vector3(0, 0, 0));

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.style.zIndex = "-1";
document.body.appendChild(canvas);

const div = document.createElement('div');
div.id= "startScreen";
div.style.display= "none";  // comment out this line to show the homescreen
div.style.position= 'fixed';
div.style.textAlign= 'center';
div.style.zIndex = '100';
div.style.left= '25%';
div.style.color= 'white';
div.style.top= '15%';
div.style.fontSize= '20px';
div.style.fontFamily= 'Arial';
div.style.width= "50%";
div.style.height= "70%";
div.style.backgroundColor= "#404040";
div.style.padding= "20px";
div.style.paddingLeft= "40px";
div.style.paddingRight= "40px";
div.innerHTML=`
<p style='color: orange; font-weight: bolder; font-size: 40px'>
    Welcome to Lawnmower Lunacy
</p>
<p style='text-align: left'>Gameplay Directions:
    <ul style='text-align: left'>
        <li>Direction 1</li>
        <li>Direction 2</li>
        <li>Direction 3</li>
        <li>Direction 4</li>
    </ul>
</p>
<button id="startGame" style="background-color: red; color: white; border: none; width: 50%; border-radius: 8px; height: 50px; font-size: 25px;">
    Mow That Lawn!!
</button>
`
const countdown = document.createElement('div');
countdown.innerHTML=`
<span id="three" style="font-family: arial; visibility: hidden; color: red; font-size: 300px; line-height: 300px; z-index: 100; position: fixed; left: 50%; top: 25%;">3</span>
<span id="two" style="font-family: arial; visibility: hidden; color: red; font-size: 300px; line-height: 300px; z-index: 100; position: fixed; left: 50%; top: 25%;">2</span>
<span id="one" style="font-family: arial; visibility: hidden; color: red; font-size: 300px; line-height: 300px; z-index: 100; position: fixed; left: 50%; top: 25%;">1</span>
<span id="go" style="font-family: arial; visibility: hidden; color: red; font-size: 300px; line-height: 300px; z-index: 100; position: fixed; left: 32%; top: 25%;">Go!!</span>

`
document.body.append(div);
document.body.append(countdown);
document.getElementById("startGame").addEventListener("click", startGame);
console.log(document)

function startGame(){
    console.log("Game Started!!");
    document.getElementById("startScreen").style.display="none";
    document.getElementById("three").style.visibility="visible";
    setTimeout((() => {document.getElementById("three").style.visibility="hidden"; document.getElementById("two").style.visibility="visible"}), 1500);
    setTimeout((() => {document.getElementById("two").style.visibility="hidden"; document.getElementById("one").style.visibility="visible"}), 3000);
    setTimeout((() => {document.getElementById("one").style.visibility="hidden"; document.getElementById("go").style.visibility="visible"}), 4500);
}

// Set up controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 16;
controls.maxPolarAngle = Math.PI / 2 - 0.25;
controls.update();

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    controls.update();
    renderer.render(scene, camera);
    scene.update && scene.update(timeStamp);
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
