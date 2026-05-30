// ===== AI RACER SYSTEM =====

class AIRacer {
  constructor(character, vehicle, trackGen, startIdx, startOffset, color) {
    this.character = character;
    this.vehicle = vehicle;
    this.color = color || character.color;
    this.name = character.name;

    // Position
    this.x = trackGen.startPos.x + Math.cos(trackGen.startAngle + Math.PI/2) * startOffset;
    this.y = trackGen.startPos.y + Math.sin(trackGen.startAngle + Math.PI/2) * startOffset;
    this.angle = trackGen.startAngle;

    // Physics
    this.speed = 0;
    this.maxSpeed = this.calcMaxSpeed(character, vehicle);
    this.accel = 0.15 + character.accel * 0.03;
    this.handling = 0.04 + character.handling * 0.008;
    this.drag = 0.94;
    this.offRoadFactor = 0.65;

    // AI
    this.trackGen = trackGen;
    this.targetIdx = startIdx;
    this.lookahead = 12 + Math.floor(Math.random() * 8);
    this.rubberbanding = 1.0;
    this.isPlayer = false;
    this.waypointRadius = 30;

    // Race state
    this.currentLap = 0;
    this.lapProgress = trackGen.getClosestPointIndex(this.x, this.y);
    this.trackPoints = trackGen.points.length;
    this.lastProgress = 0;
    this.totalProgress = 0; // for overall ranking
    this.finishTime = null;
    this.finished = false;
    this.position = 0; // 1-based race position

    // Items
    this.item = null;
    this.itemCooldown = 0;
    this.shielded = false;
    this.stunned = 0; // frames stunned
    this.starTime = 0;
    this.boostTime = 0;
    this.shrunk = 0;

    // Visual
    this.lastX = this.x;
    this.lastY = this.y;
    this.wheelAngle = 0;
    this.emoji = character.emoji;
    this.kartEmoji = vehicle.emoji;
  }

  calcMaxSpeed(char, veh) {
    const base = 3.5;
    const charBonus = (char.speed - 3) * 0.3;
    const vehBonus = (veh.speed - 3) * 0.2;
    return base + charBonus + vehBonus;
  }

  update(track, racers, raceTime) {
    if (this.finished) return;
    if (this.stunned > 0) {
      this.stunned--;
      this.speed *= 0.85;
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.updateProgress(track);
      return;
    }

    const pts = track.points;
    const n = pts.length;

    // Find target waypoint ahead
    const targetPt = pts[this.targetIdx % n];
    const dx = targetPt.x - this.x;
    const dy = targetPt.y - this.y;
    const dist = Math.hypot(dx, dy);

    // Move to next waypoint when close enough
    if (dist < this.waypointRadius) {
      this.targetIdx = (this.targetIdx + 1) % n;
    }

    // Steer toward target
    const desiredAngle = Math.atan2(dy, dx);
    let angleDiff = desiredAngle - this.angle;

    // Normalize angle diff
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    // Apply steering (with handling stat)
    const steer = Math.max(-this.handling, Math.min(this.handling, angleDiff * 0.2));
    this.angle += steer;
    this.wheelAngle = steer * 8;

    // Rubberbanding: slow down if ahead, speed up if behind
    const effective = this.maxSpeed * this.rubberbanding;

    // Accelerate
    let targetSpeed = effective;
    if (this.starTime > 0) {
      targetSpeed = effective * 1.4;
      this.starTime--;
    } else if (this.boostTime > 0) {
      targetSpeed = effective * 1.3;
      this.boostTime--;
    } else if (this.shrunk > 0) {
      targetSpeed = effective * 0.7;
      this.shrunk--;
    }

    // Sharp corners: slow down
    if (Math.abs(angleDiff) > 0.4) {
      targetSpeed *= 0.8;
    }
    if (Math.abs(angleDiff) > 0.8) {
      targetSpeed *= 0.7;
    }

    this.speed += (targetSpeed - this.speed) * this.accel;
    this.speed = Math.max(0, Math.min(targetSpeed * 1.05, this.speed));

    // Off-road check: nearest point distance
    const closestIdx = track.getClosestPointIndex(this.x, this.y);
    const closestPt = pts[closestIdx];
    const offDist = Math.hypot(this.x - closestPt.x, this.y - closestPt.y);
    const onRoad = offDist < track.trackWidth / 2;
    if (!onRoad && this.starTime === 0) {
      this.speed *= this.offRoadFactor;
    }

    // Move
    this.lastX = this.x;
    this.lastY = this.y;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    // Update progress
    this.updateProgress(track);

    // Random item usage for AI
    if (this.item && this.itemCooldown === 0 && Math.random() < 0.005) {
      this.useItem(racers);
    }
    if (this.itemCooldown > 0) this.itemCooldown--;
  }

  updateProgress(track) {
    const n = track.points.length;
    const idx = track.getClosestPointIndex(this.x, this.y);
    const prevIdx = this.lapProgress;

    // Detect lap completion (crossing start/finish)
    const startIdx = track.startIdx || 0;
    const crossWindow = 15; // frames either side of start

    // Check if we crossed start line (forward direction)
    const prevDist = Math.min(Math.abs(prevIdx - startIdx), n - Math.abs(prevIdx - startIdx));
    const currDist = Math.min(Math.abs(idx - startIdx), n - Math.abs(idx - startIdx));

    if (prevDist > crossWindow && currDist <= crossWindow) {
      // Crossed start - check direction
      const moved = ((idx - prevIdx) + n) % n;
      if (moved < n/2) {
        // Forward crossing = new lap
        this.currentLap++;
        if (this.currentLap > track.LAPS && !this.finished) {
          this.finished = true;
          this.finishTime = Date.now();
        }
      }
    }

    this.lapProgress = idx;
    // Total progress for ranking (laps * track length + current position)
    this.totalProgress = this.currentLap * n + ((idx - (track.startIdx||0) + n) % n);
  }

  setRubberbanding(myPos, totalRacers) {
    // Rubber band: players in first get slowed slightly, last get boosted
    const ratio = (myPos - 1) / (totalRacers - 1); // 0=first, 1=last
    this.rubberbanding = 0.75 + ratio * 0.5; // 0.75 (1st) to 1.25 (last)
    // Always some variance
    this.rubberbanding += (Math.random() - 0.5) * 0.05;
  }

  useItem(racers) {
    if (!this.item) return;
    // AI just drops item effect
    this.item = null;
    this.itemCooldown = 120;
  }

  draw(ctx, camera, W, H) {
    const sx = (this.x - camera.x) * camera.zoom + W/2;
    const sy = (this.y - camera.y) * camera.zoom + H/2;

    // Cull if off screen
    if (sx < -60 || sx > W+60 || sy < -60 || sy > H+60) return;

    const s = camera.zoom;
    const size = (this.shrunk > 0 ? 14 : 22) * Math.min(s, 1.5);
    const shadowSize = size * 1.1;

    ctx.save();
    ctx.translate(sx, sy);

    // Shadow
    ctx.save();
    ctx.translate(3*s, 4*s);
    ctx.scale(shadowSize/20, shadowSize/20 * 0.5);
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fill();
    ctx.restore();

    // Kart body
    ctx.rotate(this.angle + Math.PI/2);

    // Star effect
    if (this.starTime > 0) {
      ctx.save();
      const starColors = ['#FFD700','#FF4444','#44FF44','#4444FF','#FF44FF'];
      const sc = starColors[Math.floor(Date.now()/80) % starColors.length];
      ctx.shadowColor = sc;
      ctx.shadowBlur = 15;
      ctx.restore();
    }

    // Kart platform
    const kw = size * 1.2;
    const kh = size * 0.8;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.roundRect(-kw/2, -kh*0.3, kw, kh, 4);
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#222';
    const wr = size * 0.18;
    [[-kw*0.4, -kh*0.2], [kw*0.4, -kh*0.2], [-kw*0.4, kh*0.55], [kw*0.4, kh*0.55]].forEach(([wx,wy]) => {
      ctx.beginPath();
      ctx.ellipse(wx, wy, wr, wr*0.65, this.wheelAngle*0.3, 0, Math.PI*2);
      ctx.fill();
    });

    // Character emoji
    ctx.rotate(-this.angle - Math.PI/2);
    ctx.font = `${size * 0.9}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, 0, -size * 0.3);

    ctx.restore();

    // Name tag (only for nearby)
    const screenDist = Math.hypot(sx - W/2, sy - H/2);
    if (screenDist < 200 && !this.isPlayer) {
      ctx.save();
      ctx.translate(sx, sy - size - 5);
      ctx.font = `bold ${10*Math.min(s,1.2)}px Nunito, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillText(this.name, 1, 1);
      ctx.fillStyle = '#fff';
      ctx.fillText(this.name, 0, 0);
      ctx.restore();
    }
  }
}

// Item projectiles
class Projectile {
  constructor(x, y, angle, type, owner) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.type = type;
    this.owner = owner;
    this.speed = type === 'red_shell' ? 6 : 8;
    this.life = 180;
    this.emoji = type === 'red_shell' ? '🔴' : type === 'green_shell' ? '🟢' :
                 type === 'bob_omb' ? '💣' : type === 'fire' ? '🔥' : '🍌';
    this.size = 16;
    this.hit = false;
    this.targetRacer = null; // for red shell
  }

  update(racers, track) {
    this.life--;
    if (this.life <= 0) { this.hit = true; return; }

    if (this.type === 'red_shell' && !this.targetRacer) {
      // Find nearest racer ahead of owner
      let best = null, bestProg = -1;
      for (const r of racers) {
        if (r === this.owner) continue;
        if (r.totalProgress > this.owner.totalProgress && r.totalProgress > bestProg) {
          bestProg = r.totalProgress;
          best = r;
        }
      }
      this.targetRacer = best;
    }

    if (this.type === 'red_shell' && this.targetRacer) {
      const dx = this.targetRacer.x - this.x;
      const dy = this.targetRacer.y - this.y;
      const ta = Math.atan2(dy, dx);
      let da = ta - this.angle;
      while(da > Math.PI) da -= Math.PI*2;
      while(da < -Math.PI) da += Math.PI*2;
      this.angle += da * 0.12;
    } else if (this.type === 'banana') {
      // Stays put after one bounce
      this.speed = 0;
    }

    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    // Hit detection
    for (const r of racers) {
      if (r === this.owner) continue;
      if (r.starTime > 0) continue;
      const dist = Math.hypot(r.x - this.x, r.y - this.y);
      if (dist < 28) {
        this.hit = true;
        r.stunned = this.type === 'bob_omb' ? 180 : 120;
        r.speed = 0;
        showItemBanner('💥 HIT! 💥');
        break;
      }
    }
  }

  draw(ctx, camera, W, H) {
    const sx = (this.x - camera.x) * camera.zoom + W/2;
    const sy = (this.y - camera.y) * camera.zoom + H/2;
    if (sx < -30 || sx > W+30 || sy < -30 || sy > H+30) return;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(this.angle + Date.now()*0.01);
    ctx.font = `${this.size * camera.zoom}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, 0, 0);
    ctx.restore();
  }
}
