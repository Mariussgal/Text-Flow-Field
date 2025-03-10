const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
const outlineCanvas = document.getElementById('outlineCanvas');
const outlineCtx = outlineCanvas.getContext('2d');


function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    outlineCanvas.width = window.innerWidth;
    outlineCanvas.height = window.innerHeight;
    createParticles();
}


function init() {
    resizeCanvas();
    
    createCursorParticles();

    
    setupMouseEvents();
    
   
    window.addEventListener('resize', resizeCanvas);

   
    animate();
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}