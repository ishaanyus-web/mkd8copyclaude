// ===== PROCEDURAL TRACK GENERATOR =====
// Generates unique, playable tracks for all 48 MK8D tracks

class TrackGenerator {
  constructor(trackData, canvasWidth, canvasHeight) {
    this.track = trackData;
    this.W = canvasWidth;
    this.H = canvasHeight;
    this.palette = THEME_PALETTES[trackData.theme] || THEME_PALETTES.circuit;
    this.seed = trackData.globalIndex || 0;
    this.points = [];
    this.path = null;
    this.startPos = null;
    this.startAngle = 0;
    this.trackWidth = 90;
    this.LAPS = 3;
  }

  // Seeded random for consistent tracks
  rand(n) {
    this.seed = (this.seed * 1664525 + 1013904223) & 0xFFFFFFFF;
    return ((this.seed >>> 0) / 0xFFFFFFFF) * (n || 1);
  }

  generate() {
    this.generatePoints();
    this.buildPath();
    this.findStartPos();
    return this;
  }

  generatePoints() {
    // Create a smooth closed loop with 8-14 waypoints
    const cx = this.W / 2;
    const cy = this.H / 2;
    const numPoints = 8 + Math.floor(this.rand() * 6);
    const rawPoints = [];

    // Generate unique shape based on track theme and index
    const trackType = this.track.globalIndex % 6;
    const baseRadius = Math.min(this.W, this.H) * 0.35;

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      let r;

      switch(trackType) {
        case 0: // Oval-ish
          r = baseRadius * (0.7 + 0.3 * Math.cos(angle * 2 + this.rand() * 0.5));
          break;
        case 1: // Figure-eight-ish (complex)
          r = baseRadius * (0.6 + 0.4 * Math.abs(Math.sin(angle * 1.5 + this.seed * 0.01)));
          break;
        case 2: // Wide turns
          r = baseRadius * (0.75 + 0.25 * Math.cos(angle + this.rand() * 1));
          break;
        case 3: // Star-like
          r = baseRadius * (0.5 + 0.45 * (i % 2 === 0 ? 1 : 0.5) + this.rand() * 0.1);
          break;
        case 4: // Irregular
          r = baseRadius * (0.5 + this.rand() * 0.5);
          break;
        default: // Default
          r = baseRadius * (0.65 + 0.35 * Math.sin(angle * 3 + this.seed));
      }

      // Add some randomness
      r *= 0.85 + this.rand() * 0.3;

      rawPoints.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r
      });
    }

    // Smooth the points (Catmull-Rom style)
    this.points = this.smoothPoints(rawPoints, 60);
  }

  smoothPoints(pts, resolution) {
    const smoothed = [];
    const n = pts.length;

    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % n];
      const p3 = pts[(i + 2) % n];

      for (let t = 0; t < resolution; t++) {
        const tt = t / resolution;
        const tt2 = tt * tt;
        const tt3 = tt2 * tt;

        const x = 0.5 * (
          (2 * p1.x) +
          (-p0.x + p2.x) * tt +
          (2*p0.x - 5*p1.x + 4*p2.x - p3.x) * tt2 +
          (-p0.x + 3*p1.x - 3*p2.x + p3.x) * tt3
        );
        const y = 0.5 * (
          (2 * p1.y) +
          (-p0.y + p2.y) * tt +
          (2*p0.y - 5*p1.y + 4*p2.y - p3.y) * tt2 +
          (-p0.y + 3*p1.y - 3*p2.y + p3.y) * tt3
        );
        smoothed.push({ x, y });
      }
    }
    return smoothed;
  }

  buildPath() {
    if (this.points.length < 2) return;
    const path = new Path2D();
    path.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      path.lineTo(this.points[i].x, this.points[i].y);
    }
    path.closePath();
    this.path = path;
  }

  findStartPos() {
    if (this.points.length < 2) return;
    // Start near the bottom of the track
    let bestIdx = 0;
    let bestY = -Infinity;
    for (let i = 0; i < this.points.length; i++) {
      if (this.points[i].y > bestY) {
        bestY = this.points[i].y;
        bestIdx = i;
      }
    }
    this.startIdx = bestIdx;
    this.startPos = { ...this.points[bestIdx] };

    // Calculate starting angle (direction of track)
    const next = this.points[(bestIdx + 1) % this.points.length];
    const prev = this.points[(bestIdx - 1 + this.points.length) % this.points.length];
    this.startAngle = Math.atan2(next.y - prev.y, next.x - prev.x);
  }

  // Get the closest point index on track to a world position
  getClosestPointIndex(x, y) {
    let best = 0, bestDist = Infinity;
    for (let i = 0; i < this.points.length; i++) {
      const dx = this.points[i].x - x;
      const dy = this.points[i].y - y;
      const d = dx*dx + dy*dy;
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  }

  // Get track progress (0-1) from point index
  getProgress(idx) {
    return idx / this.points.length;
  }

  // Get position along track at progress t
  getPositionAt(t) {
    const idx = Math.floor(t * this.points.length) % this.points.length;
    return this.points[idx];
  }

  // Get angle of track at point index
  getAngleAt(idx) {
    const n = this.points.length;
    const next = this.points[(idx + 1) % n];
    const prev = this.points[(idx - 1 + n) % n];
    return Math.atan2(next.y - prev.y, next.x - prev.x);
  }

  // Draw the track on canvas context
  draw(ctx, camera) {
    const palette = this.palette;
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;

    // Sky / background
    const skyGrad = ctx.createLinearGradient(0,0,0,H);
    skyGrad.addColorStop(0, palette.sky);
    skyGrad.addColorStop(1, this.darken(palette.sky, 0.6));
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Draw decorative background elements
    this.drawBackground(ctx, palette, W, H);

    if (this.points.length < 2) return;

    ctx.save();
    // Camera transform
    ctx.translate(W/2, H/2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    // Draw grass/terrain border (wide)
    this.drawTrackLayer(ctx, this.trackWidth + 50, palette.grass);

    // Draw road curb (alternating red/white)
    this.drawCurbs(ctx);

    // Draw road surface
    this.drawTrackLayer(ctx, this.trackWidth, palette.road);

    // Draw road markings
    this.drawRoadMarkings(ctx, palette);

    // Draw start/finish line
    this.drawStartLine(ctx);

    // Draw item boxes
    this.drawItemBoxes(ctx);

    ctx.restore();
  }

  drawBackground(ctx, palette, W, H) {
    // Add some environmental decoration
    if (this.track.theme === 'rainbow') {
      // Starfield
      ctx.fillStyle = '#001';
      ctx.fillRect(0, 0, W, H);
      for (let i=0;i<100;i++){
        ctx.fillStyle = `rgba(255,255,255,${0.3+Math.random()*0.7})`;
        ctx.fillRect(Math.random()*W, Math.random()*H*0.6, 1.5, 1.5);
      }
    }
  }

  drawTrackLayer(ctx, width, color) {
    const pts = this.points;
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  drawCurbs(ctx) {
    const pts = this.points;
    const curbWidth = this.trackWidth + 16;
    const segLen = 24;

    for (let i = 0; i < pts.length; i++) {
      const color = Math.floor(i / segLen) % 2 === 0 ? '#FF2222' : '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[(i+1)%pts.length].x, pts[(i+1)%pts.length].y);
      ctx.lineWidth = curbWidth;
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  }

  drawRoadMarkings(ctx, palette) {
    const pts = this.points;
    // Dashed center line
    const dashLen = 20;
    ctx.setLineDash([dashLen, dashLen*1.5]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawStartLine(ctx) {
    if (!this.startPos) return;
    const angle = this.startAngle;
    const perp = angle + Math.PI/2;
    const hw = this.trackWidth / 2;

    const x1 = this.startPos.x + Math.cos(perp) * hw;
    const y1 = this.startPos.y + Math.sin(perp) * hw;
    const x2 = this.startPos.x - Math.cos(perp) * hw;
    const y2 = this.startPos.y - Math.sin(perp) * hw;

    // Checkerboard finish line
    const steps = 8;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const t2 = (i+1) / steps;
      const sx1 = x1 + (x2-x1)*t;
      const sy1 = y1 + (y2-y1)*t;
      const sx2 = x1 + (x2-x1)*t2;
      const sy2 = y1 + (y2-y1)*t2;

      ctx.fillStyle = i % 2 === 0 ? '#fff' : '#000';
      ctx.beginPath();
      ctx.moveTo(sx1 - Math.cos(angle)*10, sy1 - Math.sin(angle)*10);
      ctx.lineTo(sx2 - Math.cos(angle)*10, sy2 - Math.sin(angle)*10);
      ctx.lineTo(sx2 + Math.cos(angle)*10, sy2 + Math.sin(angle)*10);
      ctx.lineTo(sx1 + Math.cos(angle)*10, sy1 + Math.sin(angle)*10);
      ctx.closePath();
      ctx.fill();
    }
  }

  drawItemBoxes(ctx) {
    // Place item boxes at specific positions on track
    const positions = [0.15, 0.35, 0.55, 0.75, 0.9];
    for (const t of positions) {
      const idx = Math.floor(t * this.points.length);
      const p = this.points[idx];
      if (!p) continue;
      const angle = this.getAngleAt(idx);
      // Offset to side of track
      const offsets = [-25, 0, 25];
      for (const off of offsets) {
        const perp = angle + Math.PI/2;
        const bx = p.x + Math.cos(perp) * off;
        const by = p.y + Math.sin(perp) * off;

        ctx.save();
        ctx.translate(bx, by);
        // Rotating box
        const rot = Date.now() * 0.002;
        ctx.rotate(rot);

        // Rainbow box
        const grad = ctx.createLinearGradient(-12,-12,12,12);
        grad.addColorStop(0, '#FF4444');
        grad.addColorStop(0.33, '#FFFF00');
        grad.addColorStop(0.66, '#44FF44');
        grad.addColorStop(1, '#4444FF');
        ctx.fillStyle = grad;
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(-12, -12, 24, 24);
        ctx.fill();
        ctx.stroke();

        // "?" text
        ctx.rotate(-rot);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Fredoka One, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 0, 0);

        ctx.restore();
      }
    }
  }

  // Check if a point is on the road
  isOnRoad(ctx, wx, wy, camera, W, H) {
    // Transform world to screen
    const sx = (wx - camera.x) * camera.zoom + W/2;
    const sy = (wy - camera.y) * camera.zoom + H/2;

    // Find nearest point on track path
    const closestIdx = this.getClosestPointIndex(wx, wy);
    const closestPt = this.points[closestIdx];
    const dist = Math.hypot(wx - closestPt.x, wy - closestPt.y);
    return dist < this.trackWidth / 2;
  }

  darken(hex, factor) {
    const r = parseInt(hex.slice(1,3)||'88',16);
    const g = parseInt(hex.slice(3,5)||'88',16);
    const b = parseInt(hex.slice(5,7)||'88',16);
    return `rgb(${Math.floor(r*factor)},${Math.floor(g*factor)},${Math.floor(b*factor)})`;
  }

  // Draw minimap
  drawMinimap(ctx, racers) {
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.beginPath();
    ctx.arc(W/2, H/2, W/2, 0, Math.PI*2);
    ctx.fill();

    // Find bounds of track
    let minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity;
    for (const p of this.points) {
      if(p.x<minX)minX=p.x; if(p.x>maxX)maxX=p.x;
      if(p.y<minY)minY=p.y; if(p.y>maxY)maxY=p.y;
    }
    const tw = maxX-minX, th = maxY-minY;
    const scale = Math.min((W-20)/tw, (H-20)/th) * 0.85;
    const ox = W/2 - (minX + tw/2)*scale;
    const oy = H/2 - (minY + th/2)*scale;

    // Draw track
    ctx.beginPath();
    ctx.moveTo(this.points[0].x*scale+ox, this.points[0].y*scale+oy);
    for (let i=1;i<this.points.length;i++) {
      ctx.lineTo(this.points[i].x*scale+ox, this.points[i].y*scale+oy);
    }
    ctx.closePath();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#888';
    ctx.stroke();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ccc';
    ctx.stroke();

    // Draw racers as dots
    if (racers) {
      for (const r of racers) {
        const sx = r.x * scale + ox;
        const sy = r.y * scale + oy;
        ctx.beginPath();
        ctx.arc(sx, sy, r.isPlayer ? 4 : 2.5, 0, Math.PI*2);
        ctx.fillStyle = r.isPlayer ? '#FFD700' : (r.color || '#FF4444');
        ctx.fill();
        if (r.isPlayer) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Border
    ctx.beginPath();
    ctx.arc(W/2, H/2, W/2-1, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
