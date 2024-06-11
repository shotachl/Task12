import * as THREE from "https://esm.sh/three";
import { OrbitControls } from "https://esm.sh/three/examples/jsm/controls/OrbitControls";
const scene = new THREE.Scene;
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
document.body.style.margin = 0;
document.body.style.overflow = 'hidden';
document.documentElement.style.margin = 0;
document.documentElement.style.overflow = 'hidden';

const axesHelper = new THREE.AxesHelper(1);
scene.add(axesHelper);

const material = new THREE.MeshBasicMaterial({color:0xffffff});

//cube path
const cubePoints = [
    new THREE.Vector3(-2,0,3),
    new THREE.Vector3(-1,3,-3)
];
const cubePathGeometry = new THREE.BufferGeometry().setFromPoints(cubePoints);
const cubePath = new THREE.Line(cubePathGeometry, material);
scene.add(cubePath);

//cone path
const conePath = new THREE.Path();

conePath.arc(3, 2, 2, 0, 2 * Math.PI, false);

const conePoints = conePath.getPoints();
const conePathGeometry = new THREE.BufferGeometry().setFromPoints(conePoints);
const coneLine = new THREE.Line(conePathGeometry, material);
scene.add(coneLine);

//sphere path
const radius = 1;
const height = 1.5;
const turns = 2;
const pointsPerTurn = 100;
const initialY = -2;
function generateSpiralPoints(radius, height, turns, pointsPerTurn, initialY) {
    const points = [];
    const totalPoints = turns * pointsPerTurn;
    const angleIncrement = (2 * Math.PI * turns) / pointsPerTurn;
    const heightIncrement = height / pointsPerTurn;

    for (let i = 0; i < totalPoints; i++) {
        const angle = angleIncrement * i;
        const x = radius * Math.cos(angle);
        const y = initialY + (i * heightIncrement) - (height / 2);
        const z = radius * Math.sin(angle);
        points.push(new THREE.Vector3(x,y,z));
    }
    return points;
}
const spiralPoints = generateSpiralPoints(radius, height, turns, pointsPerTurn, initialY);
const spiralPathGeometry = new THREE.BufferGeometry().setFromPoints(spiralPoints);
const spiralPath = new THREE.Line(spiralPathGeometry, material);
scene.add(spiralPath);

const geometryCube = new THREE.BoxGeometry(0.5,0.5,0.5);
const geometrySphere = new THREE.SphereGeometry(0.5,32,16);
const geometryCone = new THREE.ConeGeometry(0.5, 0.7, 10);

const cube = new THREE.Mesh(geometryCube, material);
const sphere = new THREE.Mesh(geometrySphere, material);
const cone = new THREE.Mesh(geometryCone, material);

scene.add(cube);
scene.add(sphere);
scene.add(cone);

const initialConePosition = new THREE.Vector3(conePoints[0].x, conePoints[0].y, 0);
cone.position.copy(initialConePosition);
cube.position.copy(cubePoints[0]);
sphere.position.copy(spiralPoints[0]);

camera.position.z = 7;
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enabled = true;

var coneAngle = 0;
var cubeDirection = 0.5;
var cubeIndex = 0;
var sphereDirection = 1;
var sphereIndex = 0;

const spiralLengths = [0];
for (let i = 1; i < spiralPoints.length; i++) {
    const segmentLength = spiralPoints[i].distanceTo(spiralPoints[i - 1]);
    spiralLengths.push(spiralLengths[i - 1] + segmentLength);
}

function getPositionOnSpiralPath(t) {
    const totalLength = spiralLengths[spiralLengths.length - 1];
    const targetLength = t * totalLength;
    
    for (let i = 1; i < spiralLengths.length; i++) {
        if (targetLength <= spiralLengths[i]) {
            const segmentStart = spiralLengths[i - 1];
            const segmentEnd = spiralLengths[i];
            const segmentLength = segmentEnd - segmentStart;
            const segmentT = (targetLength - segmentStart) / segmentLength;

            const startPoint = spiralPoints[i - 1];
            const endPoint = spiralPoints[i];
            return startPoint.clone().lerp(endPoint, segmentT);
        }
    }
    return spiralPoints[spiralPoints.length - 1];
}

function animateObjects(){
    //cone animation
    coneAngle -= 0.01;
    const coneX = 3 + 2 * Math.cos(coneAngle);
    const coneY = 2 + 2 * Math.sin(coneAngle);
    cone.position.set(coneX, coneY, 0);

    //cube animation
    cubeIndex += cubeDirection * 0.01;
    if (cubeIndex >= 1 || cubeIndex <= 0) {
        cubeDirection *= -1;
    }
    const cubePosition = cubePoints[0].clone().lerp(cubePoints[1], cubeIndex);
    cube.position.copy(cubePosition);

    //sphere animation
    sphereIndex += sphereDirection * 0.001;
    if (sphereIndex >= 1 || sphereIndex <= 0) {
        sphereDirection *= -1;
    }
    const spherePosition = getPositionOnSpiralPath(sphereIndex);
    sphere.position.copy(spherePosition);
}

function animate() {
    requestAnimationFrame(animate);
    animateObjects();
    controls.update();
    renderer.render(scene, camera);
}
animate();
