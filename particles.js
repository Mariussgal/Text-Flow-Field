let particles = [];
let textParticles = [];
let orbitalParticles = [];
let explosionParticles = [];
let outlinePoints = []; 
let hasExploded = false;


function generateOutlinePoints() {
    const canvas = document.getElementById('particleCanvas');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    
    outlinePoints = [];

    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    tempCtx.font = `bold ${CONFIG.FONT_SIZE}px Arial`;
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    tempCtx.fillText(CONFIG.TEXT, centerX, centerY);

    
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;

    const edgePoints = [];
    const checkRadius = Math.floor(CONFIG.FONT_SIZE / 8); 

  
    for (let y = centerY - CONFIG.FONT_SIZE; y < centerY + CONFIG.FONT_SIZE; y += 2) {
        for (let x = centerX - CONFIG.FONT_SIZE * 5; x < centerX + CONFIG.FONT_SIZE * 5; x += 2) {
            const index = (y * tempCanvas.width + x) * 4;

            
            if (data[index + 3] > 0) {
               
                let isBorder = false;

                
                for (let dy = -1; dy <= 1 && !isBorder; dy++) {
                    for (let dx = -1; dx <= 1 && !isBorder; dx++) {
                        if (dx === 0 && dy === 0) continue;

                        const nx = x + dx * checkRadius;
                        const ny = y + dy * checkRadius;

                        if (nx >= 0 && nx < tempCanvas.width && ny >= 0 && ny < tempCanvas.height) {
                            const neighborIndex = (ny * tempCanvas.width + nx) * 4;
                            
                            if (data[neighborIndex + 3] === 0) {
                                isBorder = true;
                            }
                        }
                    }
                }

                if (isBorder) {
                    edgePoints.push({ x, y, vx: 0, vy: 0, originalX: x, originalY: y });
                }
            }
        }
    }

    
    const step = Math.max(1, Math.floor(edgePoints.length / CONFIG.OUTLINE_SEGMENTS));

    for (let i = 0; i < edgePoints.length; i += step) {
        outlinePoints.push(edgePoints[i]);
    }

    console.log(`Generated ${outlinePoints.length} outline points`);
}


function createParticles() {
    const canvas = document.getElementById('particleCanvas');
    
 
    particles = [];
    textParticles = [];
    orbitalParticles = [];
    explosionParticles = [];


    generateOutlinePoints();

   
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

   
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    tempCtx.font = `bold ${CONFIG.FONT_SIZE}px Arial`;
    tempCtx.fillStyle = '#fff';
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    tempCtx.fillText(CONFIG.TEXT, tempCanvas.width / 2, tempCanvas.height / 2);

    
    const textMetrics = tempCtx.measureText(CONFIG.TEXT);
    const textWidth = textMetrics.width;
    const textHeight = CONFIG.FONT_SIZE * 1.2;

    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;

    
    for (let y = 0; y < tempCanvas.height; y += CONFIG.DENSITY) {
        for (let x = 0; x < tempCanvas.width; x += CONFIG.DENSITY) {
            const index = (y * tempCanvas.width + x) * 4;
           
            if (data[index + 3] > 0) {
                const particle = {
                    x: x,
                    y: y,
                    originalX: x,
                    originalY: y,
                    size: CONFIG.PARTICLE_SIZE,
                    minSize: CONFIG.MIN_PARTICLE_SIZE,
                    color: `rgb(255, ${Math.floor(Math.random() * 100)}, 0)`,
                    vx: 0,
                    vy: 0,
                    growing: Math.random() > 0.5,
                    type: 'text'
                };
                particles.push(particle);
                textParticles.push(particle);
            }
        }
    }


    const orbitRadius = Math.max(textWidth, textHeight) * 0.8;

    for (let i = 0; i < CONFIG.ORBITAL_PARTICLES_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;

        
        const circleVariation = 0.8 + Math.random() * 0.4; 
        const radius = orbitRadius * circleVariation;

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        const particle = {
            x: x,
            y: y,
            originalX: x,
            originalY: y,
            size: CONFIG.PARTICLE_SIZE * (0.5 + Math.random()),
            minSize: CONFIG.MIN_PARTICLE_SIZE,
            color: `rgb(255, ${70 + Math.floor(Math.random() * 100)}, 0)`,
            angle: angle,
            speed: 0.1 + Math.random() * 0.3,
            centerX: centerX,
            centerY: centerY,
            radius: radius,
            vx: 0,
            vy: 0,
            growing: Math.random() > 0.5,
            type: 'orbital'
        };
        particles.push(particle);
        orbitalParticles.push(particle);
    }
}
