function animate() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    const outlineCanvas = document.getElementById('outlineCanvas');
    const outlineCtx = outlineCanvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    outlineCtx.clearRect(0, 0, outlineCanvas.width, outlineCanvas.height);

    updateAndDrawOutlines(outlineCtx);
    
    updateAndDrawParticles(ctx);
    
    updateAndDrawExplosionParticles(ctx);
    
    updateCursorParticles();

    requestAnimationFrame(animate);
}

function updateAndDrawOutlines(outlineCtx) {
    if (outlinePoints.length === 0) return;
    
    for (let i = 0; i < outlinePoints.length; i++) {
        const p = outlinePoints[i];

        if (isPressed) {
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const pressDuration = (Date.now() - pressTime) / 1000;
            const forceFactor = Math.min(pressDuration * 0.8, 3);

            const force = (CONFIG.ATTRACTION_STRENGTH * 0.7 * forceFactor) / (1 + distance * 0.02);

            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * force * 0.001;
            p.vy += Math.sin(angle) * force * 0.001;

            const maxSpeed = 8 + forceFactor * 3;
            const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (currentSpeed > maxSpeed) {
                p.vx = (p.vx / currentSpeed) * maxSpeed;
                p.vy = (p.vy / currentSpeed) * maxSpeed;
            }
        } else {
            const dx = p.originalX - p.x;
            const dy = p.originalY - p.y;
            const distanceToOrigin = Math.sqrt(dx * dx + dy * dy);

            if (distanceToOrigin > 0.5) {
                const returnSpeed = 0.06;
                p.x += dx * returnSpeed;
                p.y += dy * returnSpeed;
                p.vx = 0;
                p.vy = 0;
            } else {
                p.x = p.originalX;
                p.y = p.originalY;
                p.vx = 0;
                p.vy = 0;
            }
        }

        p.vx *= CONFIG.FRICTION;
        p.vy *= CONFIG.FRICTION;

        p.x += p.vx;
        p.y += p.vy;
    }

    drawOutlines(outlineCtx);
}

function drawOutlines(outlineCtx) {
    outlineCtx.save();

    drawOutlinePath(outlineCtx, 'rgba(255, 100, 0, 0.7)', 3);
    
    drawOutlinePath(outlineCtx, '#fff', 1.5);
    
    for (let i = 0; i < outlinePoints.length; i += 3) {
        const p = outlinePoints[i];
        outlineCtx.beginPath();
        outlineCtx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        outlineCtx.fillStyle = '#fff';
        outlineCtx.fill();
    }

    outlineCtx.restore();
}

function drawOutlinePath(ctx, color, lineWidth) {
    ctx.beginPath();
    ctx.moveTo(outlinePoints[0].x, outlinePoints[0].y);

    for (let i = 1; i < outlinePoints.length; i++) {
        const p = outlinePoints[i];
        const prev = outlinePoints[i - 1];
        const distance = Math.sqrt((p.x - prev.x) ** 2 + (p.y - prev.y) ** 2);

        if (distance < CONFIG.FONT_SIZE) {
            ctx.lineTo(p.x, p.y);
        } else {
            ctx.moveTo(p.x, p.y);
        }
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
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
    } else {
        const dx = p.originalX - p.x;
        const dy = p.originalY - p.y;
        const distanceToOrigin = Math.sqrt(dx * dx + dy * dy);

        if (distanceToOrigin > 0.5) {
            const returnSpeed = 0.06;
            p.x += dx * returnSpeed;
            p.y += dy * returnSpeed;
            p.vx = 0;
            p.vy = 0;
        } else {
            p.x = p.originalX;
            p.y = p.originalY;
            p.vx = 0;
            p.vy = 0;
        }
    }

  
    p.vx *= CONFIG.FRICTION;
    p.vy *= CONFIG.FRICTION;


    p.x += p.vx;
    p.y += p.vy;
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
        ctx.strokeStyle = p.color.replace('rgb', 'rgba').replace(')', ', 0.3)');
        ctx.lineWidth = p.size * 0.8;
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
        ctx.strokeStyle = p.color.replace('rgb', 'rgba').replace(')', `, ${p.life * 0.5})`);
        ctx.lineWidth = p.size * 0.7;
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color.replace('rgb', 'rgba').replace(')', `, ${p.life})`);
    ctx.fill();
}