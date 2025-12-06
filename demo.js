// Simple 2D demo to showcase the application structure
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let config = {
    sphereCount: 300,
    animSpeed: 1,
    backgroundColor: '#000000',
    isScattered: false
};

let particles = [];
let animationId;

// Resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Particle class
class Particle {
    constructor() {
        this.reset();
        this.originalPos = { ...this.pos };
        this.color = this.getRandomColor();
        this.phase = Math.random() * Math.PI * 2;
    }

    reset() {
        // Create tree shape
        const height = Math.random();
        const maxRadius = 150 * (1 - height);
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random()) * maxRadius;
        
        this.pos = {
            x: canvas.width / 2 + Math.cos(angle) * radius,
            y: canvas.height / 2 + height * 400 - 200
        };
        this.targetPos = { ...this.pos };
        this.size = 3 + Math.random() * 3;
        this.velocity = {
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5
        };
    }

    getRandomColor() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#ffa500'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        // Move towards target position
        this.pos.x += (this.targetPos.x - this.pos.x) * 0.05;
        this.pos.y += (this.targetPos.y - this.pos.y) * 0.05;

        // Add floating animation
        const time = Date.now() * 0.001;
        const floatX = Math.sin(time * config.animSpeed + this.phase) * 2;
        const floatY = Math.cos(time * config.animSpeed + this.phase) * 2;
        
        this.pos.x += floatX * 0.3;
        this.pos.y += floatY * 0.3;

        // Pulsing effect
        const pulse = Math.sin(time * config.animSpeed * 2 + this.phase) * 0.5 + 0.5;
        this.currentSize = this.size * (0.8 + pulse * 0.4);
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.currentSize, 0, Math.PI * 2);
        
        // Gradient for glow effect
        const gradient = ctx.createRadialGradient(
            this.pos.x, this.pos.y, 0,
            this.pos.x, this.pos.y, this.currentSize * 2
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.color + '80');
        gradient.addColorStop(1, this.color + '00');
        
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    scatter() {
        const angle = Math.random() * Math.PI * 2;
        const distance = 300 + Math.random() * 300;
        this.targetPos = {
            x: this.originalPos.x + Math.cos(angle) * distance,
            y: this.originalPos.y + Math.sin(angle) * distance
        };
    }

    gather() {
        this.targetPos = { ...this.originalPos };
    }
}

// Initialize particles
function initParticles() {
    particles = [];
    for (let i = 0; i < config.sphereCount; i++) {
        particles.push(new Particle());
    }
}

// Animation loop
function animate() {
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Draw star on top
    drawStar(canvas.width / 2, canvas.height / 2 - 220, 20);

    animationId = requestAnimationFrame(animate);
}

// Draw star
function drawStar(x, y, size) {
    const time = Date.now() * 0.001;
    const pulse = Math.sin(time * 2) * 0.3 + 1;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(time * 0.5);
    
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const outerX = Math.cos(angle) * size * pulse;
        const outerY = Math.sin(angle) * size * pulse;
        
        if (i === 0) {
            ctx.moveTo(outerX, outerY);
        } else {
            ctx.lineTo(outerX, outerY);
        }
        
        const innerAngle = angle + Math.PI / 5;
        const innerX = Math.cos(innerAngle) * size * 0.4 * pulse;
        const innerY = Math.sin(innerAngle) * size * 0.4 * pulse;
        ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2);
    gradient.addColorStop(0, '#ffff00');
    gradient.addColorStop(0.5, '#ffa500');
    gradient.addColorStop(1, '#ff0000');
    
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
}

// Event listeners
document.getElementById('bgColor').addEventListener('input', (e) => {
    config.backgroundColor = e.target.value;
});

document.getElementById('sphereCount').addEventListener('input', (e) => {
    config.sphereCount = parseInt(e.target.value);
    document.getElementById('countValue').textContent = config.sphereCount;
    initParticles();
});

document.getElementById('animSpeed').addEventListener('input', (e) => {
    config.animSpeed = parseFloat(e.target.value);
    document.getElementById('speedValue').textContent = config.animSpeed.toFixed(1);
});

document.getElementById('scatterBtn').addEventListener('click', () => {
    config.isScattered = true;
    particles.forEach(p => p.scatter());
});

document.getElementById('gatherBtn').addEventListener('click', () => {
    config.isScattered = false;
    particles.forEach(p => p.gather());
});

document.getElementById('resetBtn').addEventListener('click', () => {
    config.isScattered = false;
    particles.forEach(p => {
        p.reset();
        p.originalPos = { ...p.pos };
        p.targetPos = { ...p.pos };
    });
});

window.addEventListener('resize', () => {
    resizeCanvas();
    particles.forEach(p => {
        const offsetX = canvas.width / 2 - p.originalPos.x;
        const offsetY = canvas.height / 2 - p.originalPos.y;
        p.reset();
        p.originalPos = { ...p.pos };
    });
});

// Initialize
resizeCanvas();
initParticles();
animate();
