// Global variables
let scene, camera, renderer, christmasTree;
let handposeModel = null;
let video, videoEnabled = false;
let audioContext, audioAnalyser, audioSource, audioData;
let uploadedPhotos = [];
let currentAudio = null;

// Configuration
const config = {
    sphereDensity: 500,
    sphereSize: 0.15,
    backgroundColor: 0x000000,
    autoRotationSpeed: 0.005,
    treeHeight: 8,
    treeRadius: 3,
    cameraEnabled: false,
    musicEnabled: false
};

// Gesture state
// Enhanced gesture recognition with smoothing, confidence tracking, and debouncing
// to improve accuracy and reduce false positives
const gestureState = {
    lastHandPositions: [],
    smoothedHandPositions: [],
    pinchStartDistance: null,
    twoHandsLastDistance: null,
    treeScale: 1,
    treeRotationY: 0,
    treePositionY: 0,
    isScattered: false,
    lastGestureTime: {
        scatter: 0,
        gather: 0,
        photoReveal: 0
    },
    gestureCooldown: 1000, // milliseconds
    smoothingFactor: 0.3, // Lower = more smoothing (0-1 range)
    confidenceThreshold: 3, // Number of consecutive frames to confirm gesture
    gestureConfidence: {
        scatter: 0,
        gather: 0,
        pinch: 0
    }
};

// Improved thresholds
const gestureThresholds = {
    pinchDistance: 40, // Increased from 30 for more reliable detection
    photoRevealMin: 70, // Decreased from 80 for easier triggering
    photoRevealMax: 180, // Increased from 150 for wider range
    movementSensitivity: 5, // Increased from 2 to reduce jitter
    twoHandsScatterDelta: 80, // Increased from 50 for more deliberate gesture
    twoHandsGatherDelta: -80, // Increased from -50 for more deliberate gesture
    rotationSpeed: 0.002, // Increased from 0.001 for more responsive rotation
    verticalSpeed: 0.015 // Increased from 0.01 for more responsive movement
};

class ChristmasTree {
    constructor() {
        this.spheres = [];
        this.originalPositions = [];
        this.targetPositions = [];
        this.group = new THREE.Group();
        this.colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffffff, 0xffa500];
        this.createTree();
    }

    createTree() {
        this.clearTree();
        
        for (let i = 0; i < config.sphereDensity; i++) {
            // Create cone-shaped distribution for Christmas tree
            const height = Math.random() * config.treeHeight;
            const maxRadius = config.treeRadius * (1 - height / config.treeHeight);
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.sqrt(Math.random()) * maxRadius;
            
            const x = Math.cos(angle) * radius;
            const y = height - config.treeHeight / 2;
            const z = Math.sin(angle) * radius;

            const geometry = new THREE.SphereGeometry(config.sphereSize, 16, 16);
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const material = new THREE.MeshPhongMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.3,
                shininess: 100,
                transparent: true,
                opacity: 0.9
            });

            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(x, y, z);
            
            // Add animation properties
            sphere.userData = {
                originalPos: new THREE.Vector3(x, y, z),
                targetPos: new THREE.Vector3(x, y, z),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02
                ),
                phase: Math.random() * Math.PI * 2,
                photoIndex: uploadedPhotos.length > 0 ? Math.floor(Math.random() * uploadedPhotos.length) : -1
            };

            this.spheres.push(sphere);
            this.group.add(sphere);
        }
    }

    clearTree() {
        this.spheres.forEach(sphere => {
            sphere.geometry.dispose();
            sphere.material.dispose();
            this.group.remove(sphere);
        });
        this.spheres = [];
    }

    update(audioLevel = 0) {
        const time = Date.now() * 0.001;
        
        this.spheres.forEach((sphere, index) => {
            const userData = sphere.userData;
            
            // Smooth movement towards target position
            sphere.position.lerp(userData.targetPos, 0.05);
            
            // Add floating animation
            const floatOffset = Math.sin(time + userData.phase) * 0.05;
            sphere.position.y += floatOffset * 0.1;
            
            // Pulsing with music
            if (audioLevel > 0) {
                const scale = 1 + audioLevel * 0.3;
                sphere.scale.set(scale, scale, scale);
                sphere.material.emissiveIntensity = 0.3 + audioLevel * 0.7;
            } else {
                sphere.scale.set(1, 1, 1);
                sphere.material.emissiveIntensity = 0.3 + Math.sin(time + userData.phase) * 0.2;
            }
            
            // Slight rotation
            sphere.rotation.y += 0.01;
        });
    }

    scatter() {
        gestureState.isScattered = true;
        this.spheres.forEach(sphere => {
            const userData = sphere.userData;
            const direction = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ).normalize();
            
            userData.targetPos.copy(userData.originalPos).add(
                direction.multiplyScalar(5 + Math.random() * 5)
            );
        });
    }

    gather() {
        gestureState.isScattered = false;
        this.spheres.forEach(sphere => {
            sphere.userData.targetPos.copy(sphere.userData.originalPos);
        });
    }

    updateDensity(density) {
        config.sphereDensity = density;
        this.createTree();
    }

    updateSize(size) {
        config.sphereSize = size;
        const scaleFactor = size / 0.15; // 0.15 is the default size
        this.spheres.forEach(sphere => {
            sphere.scale.set(scaleFactor, scaleFactor, scaleFactor);
        });
    }

    getClosestSphereToScreen(screenX, screenY) {
        const mouse = new THREE.Vector2(
            (screenX / window.innerWidth) * 2 - 1,
            -(screenY / window.innerHeight) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(this.spheres);
        return intersects.length > 0 ? intersects[0].object : null;
    }
}

// Initialize Three.js scene
function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(config.backgroundColor);

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 12;
    camera.position.y = 0;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffffff, 1, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight2.position.set(-10, -10, -10);
    scene.add(pointLight2);

    // Create Christmas tree
    christmasTree = new ChristmasTree();
    scene.add(christmasTree.group);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize camera and handpose model
async function initCamera() {
    try {
        video = document.getElementById('video');
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 }
        });
        video.srcObject = stream;
        video.style.display = 'block';
        
        await video.play();
        
        if (!handposeModel) {
            handposeModel = await handpose.load();
        }
        
        videoEnabled = true;
        config.cameraEnabled = true;
        document.getElementById('toggleCamera').textContent = 'Disable Camera';
        
        detectHands();
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Failed to access camera. Please ensure camera permissions are granted.');
    }
}

function stopCamera() {
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.style.display = 'none';
        videoEnabled = false;
        config.cameraEnabled = false;
        document.getElementById('toggleCamera').textContent = 'Enable Camera';
    }
}

// Hand detection and gesture recognition
async function detectHands() {
    if (!videoEnabled) return;

    try {
        const predictions = await handposeModel.estimateHands(video);
        
        if (predictions.length > 0) {
            processGestures(predictions);
        }
    } catch (error) {
        console.error('Hand detection error:', error);
    }

    if (videoEnabled) {
        requestAnimationFrame(detectHands);
    }
}

function processGestures(predictions) {
    const numHands = predictions.length;
    
    if (numHands === 1) {
        processSingleHandGesture(predictions[0]);
    } else if (numHands === 2) {
        processTwoHandsGesture(predictions[0], predictions[1]);
    }
}

function processSingleHandGesture(hand) {
    const landmarks = hand.landmarks;
    const palm = landmarks[0];
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    // Smooth hand position
    const smoothedPalm = smoothHandPosition(
        palm, 
        gestureState.smoothedHandPositions[0], 
        gestureState.smoothingFactor
    );
    gestureState.smoothedHandPositions[0] = smoothedPalm;

    // Calculate pinch distance (thumb to index)
    const pinchDistance = distance3D(thumbTip, indexTip);
    const isPinching = pinchDistance < gestureThresholds.pinchDistance;

    // Detect thumb-index spread for photo display
    if (pinchDistance > gestureThresholds.photoRevealMin && 
        pinchDistance < gestureThresholds.photoRevealMax &&
        canTriggerGesture('photoReveal')) {
        const screenX = window.innerWidth - (thumbTip[0] / 640) * 200;
        const screenY = (thumbTip[1] / 480) * 150;
        showPhotoAtPosition(screenX, screenY);
        markGestureTriggered('photoReveal');
    }

    // One hand pinch to control tree size with confidence tracking
    if (isPinching) {
        const isConfirmed = updateGestureConfidence('pinch', true);
        if (isConfirmed) {
            if (gestureState.pinchStartDistance === null) {
                gestureState.pinchStartDistance = pinchDistance;
            } else {
                const scaleFactor = pinchDistance / gestureState.pinchStartDistance;
                gestureState.treeScale = Math.max(0.5, Math.min(2, scaleFactor));
                christmasTree.group.scale.set(
                    gestureState.treeScale,
                    gestureState.treeScale,
                    gestureState.treeScale
                );
            }
        }
    } else {
        updateGestureConfidence('pinch', false);
        gestureState.pinchStartDistance = null;
    }

    // Hand position for rotation and movement with improved thresholds
    if (gestureState.lastHandPositions.length > 0) {
        const lastPalm = gestureState.lastHandPositions[0];
        const deltaX = smoothedPalm[0] - lastPalm[0];
        const deltaY = smoothedPalm[1] - lastPalm[1];

        // Horizontal movement rotates tree (with higher threshold to reduce jitter)
        if (Math.abs(deltaX) > gestureThresholds.movementSensitivity) {
            gestureState.treeRotationY += deltaX * gestureThresholds.rotationSpeed;
            christmasTree.group.rotation.y = gestureState.treeRotationY;
        }

        // Vertical movement moves tree up/down (with higher threshold)
        if (Math.abs(deltaY) > gestureThresholds.movementSensitivity) {
            gestureState.treePositionY -= deltaY * gestureThresholds.verticalSpeed;
            christmasTree.group.position.y = gestureState.treePositionY;
        }
    }

    gestureState.lastHandPositions = [smoothedPalm];
}

function processTwoHandsGesture(hand1, hand2) {
    const palm1 = hand1.landmarks[0];
    const palm2 = hand2.landmarks[0];
    
    // Smooth both hand positions - ensure array has space
    const smoothedPalm1 = smoothHandPosition(
        palm1,
        gestureState.smoothedHandPositions[0],
        gestureState.smoothingFactor
    );
    const smoothedPalm2 = smoothHandPosition(
        palm2,
        gestureState.smoothedHandPositions[1] || [],
        gestureState.smoothingFactor
    );
    gestureState.smoothedHandPositions[0] = smoothedPalm1;
    gestureState.smoothedHandPositions[1] = smoothedPalm2;
    
    const handsDistance = distance3D(smoothedPalm1, smoothedPalm2);

    // Two hands gesture for scatter/gather with improved detection
    if (gestureState.twoHandsLastDistance !== null) {
        const distanceChange = handsDistance - gestureState.twoHandsLastDistance;
        
        // Spreading apart - scatter (with confidence tracking)
        const isScattering = distanceChange > gestureThresholds.twoHandsScatterDelta;
        const scatterConfirmed = updateGestureConfidence('scatter', isScattering);
        if (scatterConfirmed && !gestureState.isScattered && canTriggerGesture('scatter')) {
            christmasTree.scatter();
            markGestureTriggered('scatter');
        }
        
        // Coming together - gather (with confidence tracking)
        const isGathering = distanceChange < gestureThresholds.twoHandsGatherDelta;
        const gatherConfirmed = updateGestureConfidence('gather', isGathering);
        if (gatherConfirmed && gestureState.isScattered && canTriggerGesture('gather')) {
            christmasTree.gather();
            markGestureTriggered('gather');
        }
    }

    gestureState.twoHandsLastDistance = handsDistance;
    gestureState.lastHandPositions = [smoothedPalm1, smoothedPalm2];
}

function distance3D(point1, point2) {
    return Math.sqrt(
        Math.pow(point1[0] - point2[0], 2) +
        Math.pow(point1[1] - point2[1], 2) +
        Math.pow(point1[2] - point2[2], 2)
    );
}

// Smooth hand positions using exponential moving average
function smoothHandPosition(currentPos, smoothedPos, factor) {
    if (!smoothedPos || smoothedPos.length === 0) {
        return currentPos;
    }
    return [
        smoothedPos[0] + factor * (currentPos[0] - smoothedPos[0]),
        smoothedPos[1] + factor * (currentPos[1] - smoothedPos[1]),
        smoothedPos[2] + factor * (currentPos[2] - smoothedPos[2])
    ];
}

// Check if enough time has passed since last gesture
function canTriggerGesture(gestureType) {
    const now = Date.now();
    const lastTime = gestureState.lastGestureTime[gestureType] || 0;
    return (now - lastTime) > gestureState.gestureCooldown;
}

// Mark gesture as triggered
function markGestureTriggered(gestureType) {
    gestureState.lastGestureTime[gestureType] = Date.now();
}

// Update gesture confidence
function updateGestureConfidence(gestureType, isDetected) {
    if (isDetected) {
        gestureState.gestureConfidence[gestureType] = 
            Math.min(gestureState.confidenceThreshold, 
                    gestureState.gestureConfidence[gestureType] + 1);
    } else {
        gestureState.gestureConfidence[gestureType] = 
            Math.max(0, gestureState.gestureConfidence[gestureType] - 1);
    }
    return gestureState.gestureConfidence[gestureType] >= gestureState.confidenceThreshold;
}

function showPhotoAtPosition(screenX, screenY) {
    const sphere = christmasTree.getClosestSphereToScreen(screenX, screenY);
    if (sphere && sphere.userData.photoIndex >= 0) {
        const photo = uploadedPhotos[sphere.userData.photoIndex];
        const modal = document.getElementById('photo-modal');
        modal.src = photo;
        modal.classList.add('show');
        
        setTimeout(() => {
            modal.classList.remove('show');
        }, 3000);
    }
}

// Audio handling
function initAudio(audioElement) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioAnalyser = audioContext.createAnalyser();
        audioAnalyser.fftSize = 256;
        audioData = new Uint8Array(audioAnalyser.frequencyBinCount);
    }

    if (audioSource) {
        audioSource.disconnect();
    }

    audioSource = audioContext.createMediaElementSource(audioElement);
    audioSource.connect(audioAnalyser);
    audioAnalyser.connect(audioContext.destination);
    
    config.musicEnabled = true;
}

function getAudioLevel() {
    if (!config.musicEnabled || !audioAnalyser) return 0;
    
    audioAnalyser.getByteFrequencyData(audioData);
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
        sum += audioData[i];
    }
    return sum / (audioData.length * 255);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Auto rotation
    if (config.autoRotationSpeed > 0 && !config.cameraEnabled) {
        christmasTree.group.rotation.y += config.autoRotationSpeed;
    }

    // Update tree with audio level
    const audioLevel = getAudioLevel();
    christmasTree.update(audioLevel);

    renderer.render(scene, camera);
}

// Event listeners
function setupEventListeners() {
    // Background color
    document.getElementById('bgColor').addEventListener('input', (e) => {
        config.backgroundColor = parseInt(e.target.value.replace('#', ''), 16);
        scene.background = new THREE.Color(config.backgroundColor);
    });

    // Sphere density
    document.getElementById('density').addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        document.getElementById('densityValue').textContent = value;
        christmasTree.updateDensity(value);
    });

    // Sphere size
    document.getElementById('sphereSize').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        document.getElementById('sizeValue').textContent = value.toFixed(2);
        christmasTree.updateSize(value);
    });

    // Rotation speed
    document.getElementById('rotationSpeed').addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        document.getElementById('rotationValue').textContent = value.toFixed(3);
        config.autoRotationSpeed = value;
    });

    // Camera toggle
    document.getElementById('toggleCamera').addEventListener('click', () => {
        if (videoEnabled) {
            stopCamera();
        } else {
            initCamera();
        }
    });

    // Photo upload
    document.getElementById('photoUpload').addEventListener('change', (e) => {
        const files = e.target.files;
        for (let file of files) {
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadedPhotos.push(event.target.result);
                christmasTree.createTree(); // Recreate to assign photos
            };
            reader.readAsDataURL(file);
        }
    });

    // Music upload
    document.getElementById('musicUpload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            
            if (currentAudio) {
                currentAudio.pause();
                currentAudio = null;
            }

            currentAudio = new Audio(url);
            currentAudio.volume = 0.5;
            initAudio(currentAudio);
            
            document.getElementById('audio-controls').classList.remove('hidden');
        }
    });

    // Play/Pause button
    document.getElementById('playPauseBtn').addEventListener('click', () => {
        if (currentAudio) {
            if (currentAudio.paused) {
                currentAudio.play();
                document.getElementById('playPauseBtn').textContent = '⏸️ Pause';
            } else {
                currentAudio.pause();
                document.getElementById('playPauseBtn').textContent = '▶️ Play';
            }
        }
    });

    // Volume slider
    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        if (currentAudio) {
            currentAudio.volume = parseFloat(e.target.value);
        }
    });

    // Manual controls
    document.getElementById('scatterBtn').addEventListener('click', () => {
        christmasTree.scatter();
    });

    document.getElementById('gatherBtn').addEventListener('click', () => {
        christmasTree.gather();
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        christmasTree.group.rotation.set(0, 0, 0);
        christmasTree.group.position.set(0, 0, 0);
        christmasTree.group.scale.set(1, 1, 1);
        gestureState.treeScale = 1;
        gestureState.treeRotationY = 0;
        gestureState.treePositionY = 0;
        christmasTree.gather();
    });
}

// Initialize application
async function init() {
    document.getElementById('loading').textContent = 'Initializing...';
    
    initScene();
    setupEventListeners();
    animate();
    
    document.getElementById('loading').classList.add('hidden');
}

// Start the application
init();
