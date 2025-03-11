function isMouseMoving() {
    return Math.abs(mouseVelocityX) > 0.1 || Math.abs(mouseVelocityY) > 0.1;
}

function animate() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    const outlineCanvas = document.getElementById('outlineCanvas');
    const outlineCtx = outlineCanvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    outlineCtx.clearRect(0, 0, outlineCanvas.width, outlineCanvas.height);

    updateMouseVelocity();
    
    updateAndDrawParticles(ctx);
    
    updateAndDrawExplosionParticles(ctx);
    
    updateCursorParticles();

    requestAnimationFrame(animate);
}



function updateAndDrawParticles(ctx) {
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        updateParticleSize(p);
        
        if (p.type === 'text') {
            updateTextParticle(p);
        } else if (p.type === 'orbital') {
            updateOrbitalParticle(p);
        }

        if (p.size > 0) {
            drawParticle(ctx, p);
        }
    }
}

function updateParticleSize(p) {
    if (isPressed) {
        if (p.growing) {
            p.size += CONFIG.PARTICLE_CHANGE_SPEED;
            if (p.size > CONFIG.PARTICLE_SIZE + CONFIG.PARTICLE_CHANGE_SIZE) {
                p.growing = false;
            }
        } else {
            p.size -= CONFIG.PARTICLE_CHANGE_SPEED;
            if (p.size < p.minSize) {
                p.growing = true;
                p.size = p.minSize;
            }
        }
    }
    else {
        p.size = p.minSize;
    }
}

function updateTextParticle(p) {
    if (isPressed) {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const pressDuration = (Date.now() - pressTime) / 1000;
        const forceFactor = Math.min(pressDuration * 1.0, 3);

        const force = CONFIG.ATTRACTION_STRENGTH * forceFactor / (1 + distance * 0.01);

        const angle = Math.atan2(dy, dx);
        p.vx += Math.cos(angle) * force * 0.002;
        p.vy += Math.sin(angle) * force * 0.002;

        const maxSpeed = 10 + forceFactor * 5;
        const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (currentSpeed > maxSpeed) {
            p.vx = (p.vx / currentSpeed) * maxSpeed;
            p.vy = (p.vy / currentSpeed) * maxSpeed;
        }
        
        p.x += p.vx;
        p.y += p.vy;
        
        p.vx *= CONFIG.FRICTION;
        p.vy *= CONFIG.FRICTION;
    } 
    else {
        if (p.x !== p.originalX || p.y !== p.originalY) {
            const dx = p.originalX - p.x;
            const dy = p.originalY - p.y;
            const distanceToOrigin = Math.sqrt(dx * dx + dy * dy);

            if (distanceToOrigin > 0.5) {
                const returnSpeed = 0.06;
                p.x += dx * returnSpeed;
                p.y += dy * returnSpeed;
            } else {
                p.x = p.originalX;
                p.y = p.originalY;
                p.vx = 0;
                p.vy = 0;
            }
        }
        
        p.vx = 0;
        p.vy = 0;
    }
}

function updateOrbitalParticle(p) {
    if (isPressed) {
        
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

      
        const pressDuration = (Date.now() - pressTime) / 1000;
        const forceFactor = Math.min(pressDuration * 1.5, 5);
        const force = CONFIG.ATTRACTION_STRENGTH * 1.5 * forceFactor / (1 + distance * 0.005);

        const angle = Math.atan2(dy, dx);
        p.vx += Math.cos(angle) * force * 0.002;
        p.vy += Math.sin(angle) * force * 0.002;

       
        const maxSpeed = 15 + forceFactor * 5;
        const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (currentSpeed > maxSpeed) {
            p.vx = (p.vx / currentSpeed) * maxSpeed;
            p.vy = (p.vy / currentSpeed) * maxSpeed;
        }

    
        p.x += p.vx;
        p.y += p.vy;

       
        p.vx *= CONFIG.FRICTION;
        p.vy *= CONFIG.FRICTION;
    } else {
        if (hasExploded && Date.now() - releaseTime < 2000) {
            
            const targetX = p.centerX + Math.cos(p.angle) * p.radius;
            const targetY = p.centerY + Math.sin(p.angle) * p.radius;

           
            const returnSpeed = 0.08;
            p.x += (targetX - p.x) * returnSpeed;
            p.y += (targetY - p.y) * returnSpeed;
            p.vx = 0;
            p.vy = 0;

          
            p.angle += p.speed * 0.01;
        } else {
          
            p.angle += p.speed * 0.01;
            p.x = p.centerX + Math.cos(p.angle) * p.radius;
            p.y = p.centerY + Math.sin(p.angle) * p.radius;
            p.vx = 0;
            p.vy = 0;
        }
    }
}


function drawParticle(ctx, p) {
   
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speed > 3) {
     
        const trailLength = Math.min(speed * 1.5, 15);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - (p.vx * trailLength) / speed, p.y - (p.vy * trailLength) / speed);
        ctx.stroke();
    }

   
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
}


function updateAndDrawExplosionParticles(ctx) {
    for (let i = explosionParticles.length - 1; i >= 0; i--) {
        const p = explosionParticles[i];

  
        p.x += p.vx;
        p.y += p.vy;

   
        p.vy += p.gravity;

    
        p.vx *= 0.96;
        p.vy *= 0.96;

     
        p.life -= p.decay;

     
        if (p.life > 0) {
            drawExplosionParticle(ctx, p);
        } else {
            explosionParticles.splice(i, 1);
        }
    }
}

function drawExplosionParticle(ctx, p) {
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speed > 2) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color.replace('rgb', 'rgba').replace(')', `, ${p.life})`);
    ctx.fill();
}