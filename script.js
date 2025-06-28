// Cyber Attack Visualization Map
class CyberAttackMap {
    constructor() {
        this.canvas = document.getElementById('cyber-map');
        this.ctx = this.canvas.getContext('2d');
        this.attacks = [];
        this.worldPoints = [];
        this.breachCount = 0;
        this.passwordsCompromised = 0;
        this.attacksBlocked = 0;
        
        this.init();
    }

    init() {
        this.resizeCanvas();
        this.generateWorldPoints();
        this.startAnimation();
        this.startCounters();
        
        // Handle resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = document.getElementById('cyber-map-container');
        this.canvas.width = container.offsetWidth;
        this.canvas.height = container.offsetHeight;
    }

    generateWorldPoints() {
        // Generate realistic world coordinates for major cities
        const majorCities = [
            {x: 0.12, y: 0.35, name: 'New York'},
            {x: 0.15, y: 0.5, name: 'Sao Paulo'},
            {x: 0.45, y: 0.25, name: 'London'},
            {x: 0.48, y: 0.4, name: 'Lagos'},
            {x: 0.55, y: 0.3, name: 'Moscow'},
            {x: 0.7, y: 0.4, name: 'Mumbai'},
            {x: 0.75, y: 0.25, name: 'Beijing'},
            {x: 0.8, y: 0.35, name: 'Tokyo'},
            {x: 0.85, y: 0.7, name: 'Sydney'},
            {x: 0.25, y: 0.45, name: 'Mexico City'},
            {x: 0.52, y: 0.5, name: 'Johannesburg'},
            {x: 0.65, y: 0.5, name: 'Bangkok'},
        ];

        this.worldPoints = majorCities.map(city => ({
            x: city.x * this.canvas.width,
            y: city.y * this.canvas.height,
            name: city.name,
            lastAttack: 0
        }));
    }

    createAttack() {
        if (this.worldPoints.length < 2) return;

        const source = this.worldPoints[Math.floor(Math.random() * this.worldPoints.length)];
        let target;
        do {
            target = this.worldPoints[Math.floor(Math.random() * this.worldPoints.length)];
        } while (target === source);

        const attack = {
            startX: source.x,
            startY: source.y,
            endX: target.x,
            endY: target.y,
            progress: 0,
            speed: 0.02 + Math.random() * 0.03,
            type: Math.random() > 0.7 ? 'blocked' : 'breach',
            intensity: Math.random(),
            particles: []
        };

        // Create particle trail
        for (let i = 0; i < 5; i++) {
            attack.particles.push({
                x: attack.startX,
                y: attack.startY,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 1,
                decay: 0.02 + Math.random() * 0.02
            });
        }

        this.attacks.push(attack);
        
        // Update counters
        if (attack.type === 'breach') {
            this.breachCount++;
            this.passwordsCompromised += Math.floor(Math.random() * 1000) + 100;
        } else {
            this.attacksBlocked++;
        }
    }

    updateAttacks() {
        this.attacks = this.attacks.filter(attack => {
            attack.progress += attack.speed;
            
            // Update particles
            attack.particles = attack.particles.filter(particle => {
                const currentX = attack.startX + (attack.endX - attack.startX) * attack.progress;
                const currentY = attack.startY + (attack.endY - attack.startY) * attack.progress;
                
                particle.x = currentX + particle.vx;
                particle.y = currentY + particle.vy;
                particle.life -= particle.decay;
                
                return particle.life > 0;
            });

            return attack.progress < 1;
        });
    }

    drawAttacks() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw world points
        this.worldPoints.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = '#8b5cf6';
            this.ctx.fill();
            
            // Glow effect
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
            this.ctx.fill();
        });

        // Draw attacks
        this.attacks.forEach(attack => {
            const currentX = attack.startX + (attack.endX - attack.startX) * attack.progress;
            const currentY = attack.startY + (attack.endY - attack.startY) * attack.progress;
            
            // Draw attack line
            this.ctx.beginPath();
            this.ctx.moveTo(attack.startX, attack.startY);
            this.ctx.lineTo(currentX, currentY);
            
            if (attack.type === 'breach') {
                this.ctx.strokeStyle = `rgba(239, 68, 68, ${1 - attack.progress})`;
                this.ctx.shadowColor = '#ef4444';
            } else {
                this.ctx.strokeStyle = `rgba(251, 191, 36, ${1 - attack.progress})`;
                this.ctx.shadowColor = '#fbbf24';
            }
            
            this.ctx.lineWidth = 2;
            this.ctx.shadowBlur = 10;
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
            
            // Draw particles
            attack.particles.forEach(particle => {
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
                
                if (attack.type === 'breach') {
                    this.ctx.fillStyle = `rgba(239, 68, 68, ${particle.life})`;
                } else {
                    this.ctx.fillStyle = `rgba(251, 191, 36, ${particle.life})`;
                }
                
                this.ctx.fill();
            });
            
            // Draw attack head
            if (attack.progress < 1) {
                this.ctx.beginPath();
                this.ctx.arc(currentX, currentY, 5, 0, Math.PI * 2);
                
                if (attack.type === 'breach') {
                    this.ctx.fillStyle = '#ef4444';
                    this.ctx.shadowColor = '#ef4444';
                } else {
                    this.ctx.fillStyle = '#fbbf24';
                    this.ctx.shadowColor = '#fbbf24';
                }
                
                this.ctx.shadowBlur = 15;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        });
    }

    animate() {
        this.updateAttacks();
        this.drawAttacks();
        
        // Create new attacks randomly
        if (Math.random() < 0.1) { // 10% chance per frame
            this.createAttack();
        }
        
        requestAnimationFrame(() => this.animate());
    }

    startAnimation() {
        this.animate();
    }

    updateCounterDisplay() {
        const breachCountElement = document.getElementById('breach-count');
        const passwordsElement = document.getElementById('passwords-compromised');
        const attacksBlockedElement = document.getElementById('attacks-blocked');
        
        if (breachCountElement) {
            this.animateCounter(breachCountElement, this.breachCount);
        }
        if (passwordsElement) {
            this.animateCounter(passwordsElement, this.passwordsCompromised);
        }
        if (attacksBlockedElement) {
            this.animateCounter(attacksBlockedElement, this.attacksBlocked);
        }
    }

    animateCounter(element, targetValue) {
        const currentValue = parseInt(element.textContent) || 0;
        const increment = Math.ceil((targetValue - currentValue) / 10);
        
        if (currentValue < targetValue) {
            element.textContent = Math.min(currentValue + increment, targetValue).toLocaleString();
        }
    }

    startCounters() {
        // Initial burst of attacks for demonstration
        setTimeout(() => {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => this.createAttack(), i * 200);
            }
        }, 1000);

        // Update counter display
        setInterval(() => {
            this.updateCounterDisplay();
        }, 100);

        // Periodic attack creation
        setInterval(() => {
            if (Math.random() < 0.7) {
                this.createAttack();
            }
        }, 2000);
    }
}

// Background Matrix Effect
class MatrixBackground {
    constructor() {
        this.container = document.getElementById('cyber-map-container');
        this.createMatrixEffect();
    }

    createMatrixEffect() {
        // Create floating binary numbers
        setInterval(() => {
            if (Math.random() < 0.3) {
                this.createFloatingBinary();
            }
        }, 1000);
    }

    createFloatingBinary() {
        const binary = document.createElement('div');
        binary.textContent = Math.random() > 0.5 ? '1' : '0';
        binary.style.cssText = `
            position: absolute;
            color: rgba(139, 92, 246, 0.3);
            font-family: monospace;
            font-size: ${Math.random() * 20 + 10}px;
            left: ${Math.random() * 100}%;
            top: -20px;
            pointer-events: none;
            z-index: -1;
            animation: float-down 5s linear forwards;
        `;

        this.container.appendChild(binary);

        // Remove after animation
        setTimeout(() => {
            if (binary.parentNode) {
                binary.parentNode.removeChild(binary);
            }
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add float-down animation to CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float-down {
            from {
                transform: translateY(0);
                opacity: 1;
            }
            to {
                transform: translateY(100vh);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Initialize the cyber attack map
    const cyberMap = new CyberAttackMap();
    const matrixBg = new MatrixBackground();

    // Add some interactive effects
    document.addEventListener('mousemove', (e) => {
        const moveX = (e.clientX / window.innerWidth - 0.5) * 20;
        const moveY = (e.clientY / window.innerHeight - 0.5) * 20;
        
        const worldMap = document.getElementById('world-map');
        if (worldMap) {
            worldMap.style.transform = `translate(-50%, -50%) translate(${moveX}px, ${moveY}px)`;
        }
    });

    // Add pulse effect to breach counter when it updates
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                const element = mutation.target.nodeType === Node.TEXT_NODE 
                    ? mutation.target.parentElement 
                    : mutation.target;
                
                if (element && element.id === 'breach-count') {
                    element.style.animation = 'none';
                    element.offsetHeight; // Trigger reflow
                    element.style.animation = 'pulse 0.5s ease-out';
                }
            }
        });
    });

    const breachCountElement = document.getElementById('breach-count');
    if (breachCountElement) {
        observer.observe(breachCountElement, {
            childList: true,
            characterData: true,
            subtree: true
        });
    }
});