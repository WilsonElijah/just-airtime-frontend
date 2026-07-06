import * as THREE from 'three';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// 1. Setup Scene, Camera, Renderer
const canvas = document.querySelector('#bg-canvas');
const scene = new THREE.Scene();
// Dark moody fog for the cyber-folklore aesthetic
scene.fog = new THREE.FogExp2(0x050505, 0.015);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 25;
camera.position.y = 5;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ReinhardToneMapping;

// 2. Post-processing for Neon Glow (Bloom)
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0;
bloomPass.strength = 1.8; // Intensity of the neon glow
bloomPass.radius = 0.5;

const outputPass = new OutputPass();

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);
composer.addPass(outputPass);

// 3. Constructing the Abstract Geometric Hoop
const hoopGroup = new THREE.Group();
scene.add(hoopGroup);

// --- Backboard (Glassy with neon cyan border) ---
const backboardWidth = 14;
const backboardHeight = 9;

const backboardGeom = new THREE.BoxGeometry(backboardWidth, backboardHeight, 0.5);
const backboardMat = new THREE.MeshPhysicalMaterial({
    color: 0x111111,
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.7,
    transmission: 0.5,
});
const backboard = new THREE.Mesh(backboardGeom, backboardMat);
hoopGroup.add(backboard);

// Neon Cyan Border for Backboard
const backboardEdges = new THREE.EdgesGeometry(backboardGeom);
const backboardBorderMat = new THREE.LineBasicMaterial({ color: 0x00ffcc, linewidth: 2 });
const backboardBorder = new THREE.LineSegments(backboardEdges, backboardBorderMat);
hoopGroup.add(backboardBorder);

// Inner Square on Backboard (Neon Pink)
const innerSquareWidth = 4;
const innerSquareHeight = 3;
const innerSquareGeom = new THREE.PlaneGeometry(innerSquareWidth, innerSquareHeight);
const innerSquareEdges = new THREE.EdgesGeometry(innerSquareGeom);
const innerSquareMat = new THREE.LineBasicMaterial({ color: 0xff007f });
const innerSquare = new THREE.LineSegments(innerSquareEdges, innerSquareMat);
innerSquare.position.set(0, -1.5, 0.26);
hoopGroup.add(innerSquare);

// --- Rim (Neon Orange/Red) ---
const rimRadius = 1.5;
const rimTube = 0.15;
const rimGeom = new THREE.TorusGeometry(rimRadius, rimTube, 16, 100);
const rimMat = new THREE.MeshStandardMaterial({
    color: 0xff4500,
    emissive: 0xff4500,
    emissiveIntensity: 2
});
const rim = new THREE.Mesh(rimGeom, rimMat);
rim.rotation.x = Math.PI / 2;
rim.position.set(0, -3, 0.25 + rimRadius);
hoopGroup.add(rim);

// --- Abstract Net (Wireframe Cone/Cylinder) ---
const netGeom = new THREE.CylinderGeometry(rimRadius, rimRadius * 0.7, 3, 12, 4, true);
const netMat = new THREE.MeshBasicMaterial({
    color: 0x00ffcc,
    wireframe: true,
    transparent: true,
    opacity: 0.3
});
const net = new THREE.Mesh(netGeom, netMat);
net.position.set(0, -4.5, 0.25 + rimRadius);
hoopGroup.add(net);

// --- Pole / Stand (Dark Metal) ---
const poleGeom = new THREE.CylinderGeometry(0.5, 0.5, 20);
const poleMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 });
const pole = new THREE.Mesh(poleGeom, poleMat);
pole.position.set(0, -14, -2);
hoopGroup.add(pole);

// 4. Lighting and Atmosphere
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// Point Lights to highlight the hoop structures
const pointLight1 = new THREE.PointLight(0x00ffcc, 50, 50);
pointLight1.position.set(10, 10, 10);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xff007f, 50, 50);
pointLight2.position.set(-10, -10, 10);
scene.add(pointLight2);

// Particles for magical 'cyber-folklore' vibe
const particleCount = 500;
const particleGeom = new THREE.BufferGeometry();
const particlePos = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i++) {
    particlePos[i] = (Math.random() - 0.5) * 60;
}
particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
const particleMat = new THREE.PointsMaterial({
    color: 0x00ffcc,
    size: 0.1,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});
const particles = new THREE.Points(particleGeom, particleMat);
scene.add(particles);

// 5. Interactivity and Animation
// Mouse tracking for slight interaction
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX) * 0.001;
    mouseY = (event.clientY - windowHalfY) * 0.001;
});

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Smooth dampening for mouse interaction
    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;

    // Rotate the hoop slowly, combined with mouse movement
    hoopGroup.rotation.y += 0.05 * (targetX - hoopGroup.rotation.y) + Math.sin(elapsedTime * 0.2) * 0.005;
    hoopGroup.rotation.x += 0.05 * (targetY - hoopGroup.rotation.x) + Math.sin(elapsedTime * 0.1) * 0.002;

    // Floating effect for the hoop
    hoopGroup.position.y = Math.sin(elapsedTime * 0.5) * 0.5;

    // Rotate particles slowly
    particles.rotation.y = elapsedTime * 0.05;

    // Render using composer for bloom
    composer.render();
}

animate();

// 6. Handle Window Resize dynamically
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// 7. Form Submission Handling (FIXED)
const workoutForm = document.querySelector('.workout-form');
const successMessage = document.getElementById('success-message');

if (workoutForm) {
    workoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Capture values
        const vertical = document.getElementById('vertical').value;
        const dunkType = document.getElementById('dunk-type').value;
        const notes = document.getElementById('notes').value;

        // Prepare JSON payload exactly how the MongoDB Schema expects it
        const sessionData = {
            verticalHeight: Number(vertical), // FIXED: changed from 'vertical' to 'verticalHeight'
            dunkType: dunkType,
            notes: notes
        };

        console.log("🚀 Sending Payload to Backend:", sessionData);

        try {
            // Send POST request
            const response = await fetch('https://just-airtime-api.onrender.com/api/sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sessionData)
            });

            const result = await response.json();

            if (response.ok) {
                console.log("🟢 Success:", result);
                // Clear the form
                workoutForm.reset();

                // Briefly display the glowing green success message
                if (successMessage) {
                    successMessage.style.display = 'block';
                    setTimeout(() => {
                        successMessage.style.display = 'none';
                    }, 3000);
                } else {
                    alert("Session Saved Successfully!"); // Backup if UI element is missing
                }
            } else {
                console.error('🔴 Backend Validation Error:', result);
            }
        } catch (error) {
            console.error('🔴 Network/Fetch Error:', error);
        }
    });
}