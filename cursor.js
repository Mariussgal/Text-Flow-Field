let cursorParticles = [];
let mouseX = 0;
let mouseY = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let mouseVelocityX = 0;
let mouseVelocityY = 0;
let isPressed = false;
let pressTime = 0;
let releaseTime = 0;


function createCursorParticles() {
    cursorParticles = [];

    for (let i = 0; i < CONFIG.CURSOR_PARTICLES_COUNT; i++) {
        const angle = (i / CONFIG.CURSOR_PARTICLES_COUNT) * Math.PI * 2;
        cursorParticles.push({
            angle: angle,
            distance: 15, 
            x: mouseX + Math.cos(angle) * 15,
            y: mouseY + Math.sin(angle) * 15,
            size: 2 + Math.random() * 2,
            speedDistance: 0.5 + Math.random() * 0.5, 
            speedAngle: 0.01 + Math.random() * 0.02, 
            element: document.createElement('div')
        });

      
        cursorParticles[i].element.className = 'cursor-particle';
        cursorParticles[i].element.style.left = `${cursorParticles[i].x}px`;
        cursorParticles[i].element.style.top = `${cursorParticles[i].y}px`;
        cursorParticles[i].element.style.backgroundColor = `rgba(255, ${100 + Math.floor(Math.random() * 100)}, 0, ${0.4 + Math.random() * 0.4})`;
        document.body.appendChild(cursorParticles[i].element);
    }
}


function updateCursorParticles() {
    for (let i = 0; i < cursorParticles.length; i++) {
        const p = cursorParticles[i];

      
        p.angle += p.speedAngle * (isPressed ? 3 : 1); 

        if (isPressed) {
        
            p.distance += p.speedDistance * 1.5;
            if (p.distance > 40) {
                p.distance = 40;
            }

        
            const pulsePhase = (Date.now() - pressTime) / 200;
            const pulseFactor = 1 + 0.5 * Math.sin(pulsePhase);
            p.element.style.width = `${p.size * pulseFactor}px`;
            p.element.style.height = `${p.size * pulseFactor}px`;
            p.element.style.opacity = '1';
        } else {
          
            p.distance = Math.max(15, p.distance - p.speedDistance * 2);
            p.element.style.width = `${p.size}px`;
            p.element.style.height = `${p.size}px`;
            p.element.style.opacity = '0.7';
        }

      
        p.x = mouseX + Math.cos(p.angle) * p.distance;
        p.y = mouseY + Math.sin(p.angle) * p.distance;

      
        p.element.style.left = `${p.x}px`;
        p.element.style.top = `${p.y}px`;
    }
}


function cleanupCursorParticles() {
    for (let i = 0; i < cursorParticles.length; i++) {
        document.body.removeChild(cursorParticles[i].element);
    }
    cursorParticles = [];
}


function setupMouseEvents() {
    const cursor = document.querySelector('.cursor');

    document.addEventListener('mousemove', (e) => {
        
        mouseVelocityX = e.clientX - mouseX;
        mouseVelocityY = e.clientY - mouseY;

        lastMouseX = mouseX;
        lastMouseY = mouseY;
        mouseX = e.clientX;
        mouseY = e.clientY;

      
        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;

     
    });

    document.addEventListener('mousedown', () => {
        isPressed = true;
        pressTime = Date.now();
        hasExploded = false;


        cursor.style.transform = 'translate(-50%, -50%) scale(0.5)';
        cursor.style.backgroundColor = 'rgba(255, 69, 0, 0.9)';
        cursor.style.boxShadow = '0 0 15px rgba(255, 69, 0, 0.8)';



    });

    document.addEventListener('mouseup', () => {
        isPressed = false;
        releaseTime = Date.now();

   
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.backgroundColor = 'rgba(255, 69, 0, 0.5)';
        cursor.style.boxShadow = '0 0 0 rgba(255, 69, 0, 0)';

     

        createExplosion();

    
     
    });
}

function updateMouseVelocity() {
    mouseVelocityX *= 0.9;
    mouseVelocityY *= 0.9;
    
    if (Math.abs(mouseVelocityX) < 0.1) mouseVelocityX = 0;
    if (Math.abs(mouseVelocityY) < 0.1) mouseVelocityY = 0;
}