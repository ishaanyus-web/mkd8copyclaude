// ===== ITEM BOX SYSTEM =====

class ItemBox {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.active = true;
    this.respawnTime = 0;
    this.angle = 0;
  }

  update() {
    this.angle += 0.03;
    if (!this.active) {
      this.respawnTime--;
      if (this.respawnTime <= 0) this.active = true;
    }
  }

  checkCollision(racer) {
    if (!this.active) return false;
    const d = Math.hypot(racer.x - this.x, racer.y - this.y);
    if (d < 25) {
      this.active = false;
      this.respawnTime = 300; // 5 seconds
      return true;
    }
    return false;
  }

  draw(ctx, camera, W, H) {
    if (!this.active) return;
    const sx = (this.x - camera.x) * camera.zoom + W/2;
    const sy = (this.y - camera.y) * camera.zoom + H/2;
    if (sx < -30 || sx > W+30 || sy < -30 || sy > H+30) return;

    const s = camera.zoom;
    const size = 20 * Math.min(s, 1.5);

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(this.angle);

    // Glow
    ctx.shadowColor = 'rgba(255,255,100,0.8)';
    ctx.shadowBlur = 15;

    // Rainbow box
    const grad = ctx.createLinearGradient(-size,-size,size,size);
    grad.addColorStop(0, '#FF4444');
    grad.addColorStop(0.25, '#FFFF00');
    grad.addColorStop(0.5, '#44FF44');
    grad.addColorStop(0.75, '#4444FF');
    grad.addColorStop(1, '#FF44FF');
    ctx.fillStyle = grad;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(-size, -size, size*2, size*2);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.rotate(-this.angle);
    ctx.font = `bold ${size}px Fredoka One, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText('?', 0, 0);

    ctx.restore();
  }
}

// Generate item boxes for a track
function generateItemBoxes(trackGen) {
  const boxes = [];
  const pts = trackGen.points;
  const n = pts.length;

  // Place boxes at intervals across the track
  const positions = [0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 0.9];
  for (const t of positions) {
    const idx = Math.floor(t * n);
    const p = pts[idx];
    const angle = trackGen.getAngleAt(idx);
    const perp = angle + Math.PI/2;
    const offsets = [-30, 0, 30];
    for (const off of offsets) {
      boxes.push(new ItemBox(
        p.x + Math.cos(perp) * off,
        p.y + Math.sin(perp) * off
      ));
    }
  }
  return boxes;
}

// Item banner display
let itemBannerTimeout = null;
function showItemBanner(text) {
  const banner = document.getElementById('item-banner');
  if (!banner) return;
  banner.textContent = text;
  banner.style.display = 'block';
  if (itemBannerTimeout) clearTimeout(itemBannerTimeout);
  itemBannerTimeout = setTimeout(() => {
    if (banner) banner.style.display = 'none';
  }, 1500);
}
