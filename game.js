// ===== MARIO KART GAME ENGINE =====

let game = {
  state: 'idle', // idle, countdown, racing, finished
  track: null,
  trackGen: null,
  player: null,
  aiRacers: [],
  allRacers: [],
  itemBoxes: [],
  projectiles: [],
  camera: { x: 0, y: 0, zoom: 1 },
  canvas: null,
  ctx: null,
  minimapCanvas: null,
  minimapCtx: null,
  raceStartTime: 0,
  raceTime: 0,
  animFrame: null,
  keys: {},
  lastRank: 1,
  selectedCharIdx: 0,
  selectedVehicleIdx: 0,
  selectedTrackIdx: 0,
  grandPrixMode: false,
  grandPrixCupIdx: 0,
  grandPrixRaceIdx: 0,
  grandPrixScores: {},
  inputMode: 'keyboard', // keyboard or touch
  touchState: { left:false, right:false, accel:false, brake:false, item:false }
};

// Key bindings
const KEYS = {
  left: ['ArrowLeft','KeyA'],
  right: ['ArrowRight','KeyD'],
  accel: ['ArrowUp','KeyW'],
  brake: ['ArrowDown','KeyS'],
  item: ['Space','KeyZ','Enter'],
};

function isKeyDown(action) {
  return KEYS[action].some(k => game.keys[k]) || game.touchState[action];
}

document.addEventListener('keydown', e => {
  game.keys[e.code] = true;
  if (e.code === 'Space') { e.preventDefault(); if (game.state === 'racing') useItem(); }
});
document.addEventListener('keyup', e => { game.keys[e.code] = false; });

// ===== RACE INITIALIZATION =====
function initRace(trackData, playerCharIdx, playerVehicleIdx) {
  const canvas = document.getElementById('race-canvas');
  const mmCanvas = document.getElementById('minimap-canvas');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const W = canvas.width, H = canvas.height;

  game.canvas = canvas;
  game.ctx = canvas.getContext('2d');
  game.minimapCanvas = mmCanvas;
  game.minimapCtx = mmCanvas.getContext('2d');

  // Generate track
  const tg = new TrackGenerator(trackData, W, H);
  tg.generate();
  game.trackGen = tg;
  game.track = trackData;

  // Create player
  const playerChar = CHARACTERS[playerCharIdx];
  const playerVeh = VEHICLES[playerVehicleIdx];
  const player = new AIRacer(playerChar, playerVeh, tg, tg.startIdx, 0, playerChar.color);
  player.isPlayer = true;
  player.name = 'YOU';
  player.accel = 0.12;
  player.maxSpeed = player.calcMaxSpeed(playerChar, playerVeh) + 0.3;

  // Create 11 AI opponents
  const aiRacers = [];
  const usedChars = new Set([playerCharIdx]);
  const gridOffsets = [-60,-30,30,60,-90,90,-120,120,-150,150,-180];

  for (let i = 0; i < 11; i++) {
    let charIdx;
    do { charIdx = Math.floor(Math.random() * CHARACTERS.length); }
    while (usedChars.has(charIdx));
    usedChars.add(charIdx);

    const vehIdx = Math.floor(Math.random() * VEHICLES.length);
    const char = CHARACTERS[charIdx];
    const veh = VEHICLES[vehIdx];
    const offset = gridOffsets[i] || (i * 20);

    // Place on starting grid (behind player)
    const ai = new AIRacer(char, veh, tg, (tg.startIdx + 3) % tg.points.length, offset, char.color);
    ai.targetIdx = (tg.startIdx + 6) % tg.points.length;
    aiRacers.push(ai);
  }

  // Initialize player grid position
  player.targetIdx = tg.startIdx;

  game.player = player;
  game.aiRacers = aiRacers;
  game.allRacers = [player, ...aiRacers];
  game.itemBoxes = generateItemBoxes(tg);
  game.projectiles = [];

  // Camera centered on player
  game.camera = { x: player.x, y: player.y, zoom: 0.9 };

  game.raceStartTime = 0;
  game.raceTime = 0;
  game.state = 'countdown';

  // Add touch controls for mobile
  setupTouchControls();
}

// ===== PLAYER UPDATE =====
function updatePlayer() {
  const p = game.player;
  if (!p || p.finished) return;

  const tg = game.trackGen;

  if (p.stunned > 0) {
    p.stunned--;
    p.speed *= 0.85;
    p.x += Math.cos(p.angle) * p.speed;
    p.y += Math.sin(p.angle) * p.speed;
    p.updateProgress(tg);
    return;
  }

  const steering = p.handling * 1.0;

  if (isKeyDown('left'))  p.angle -= steering;
  if (isKeyDown('right')) p.angle += steering;

  const accel = isKeyDown('accel');
  const brake = isKeyDown('brake');

  // Star / boost
  let maxSpd = p.maxSpeed;
  if (p.starTime > 0) { maxSpd *= 1.4; p.starTime--; }
  else if (p.boostTime > 0) { maxSpd *= 1.3; p.boostTime--; }
  else if (p.shrunk > 0) { maxSpd *= 0.7; p.shrunk--; }

  if (accel) {
    p.speed += p.accel * 1.5;
    p.speed = Math.min(p.speed, maxSpd);
  } else if (brake) {
    p.speed -= p.accel * 2;
    p.speed = Math.max(p.speed, -maxSpd * 0.4);
  } else {
    // Coast
    p.speed *= 0.96;
  }

  // Off-road check
  const closestIdx = tg.getClosestPointIndex(p.x, p.y);
  const closestPt = tg.points[closestIdx];
  const offDist = Math.hypot(p.x - closestPt.x, p.y - closestPt.y);
  const onRoad = offDist < tg.trackWidth / 2 + 5;

  if (!onRoad && p.starTime === 0) {
    p.speed *= 0.88;
  }

  // Wheel animation
  if (isKeyDown('left')) p.wheelAngle = -0.3;
  else if (isKeyDown('right')) p.wheelAngle = 0.3;
  else p.wheelAngle *= 0.85;

  // Move
  p.lastX = p.x;
  p.lastY = p.y;
  p.x += Math.cos(p.angle) * p.speed;
  p.y += Math.sin(p.angle) * p.speed;

  p.updateProgress(tg);
}

// ===== ITEM USAGE =====
function useItem() {
  const p = game.player;
  if (!p || !p.item) return;
  const item = p.item;
  p.item = null;

  showItemBanner(`${item.emoji} ${item.name}!`);
  document.getElementById('hud-item-icon').textContent = '?';

  switch(item.name) {
    case 'Mushroom':
      p.boostTime = 120;
      break;
    case 'Star':
      p.starTime = 420;
      break;
    case 'Lightning':
      for (const r of game.aiRacers) { r.shrunk = 300; }
      showItemBanner('⚡ LIGHTNING! All racers shrunk!');
      break;
    case 'Red Shell':
      game.projectiles.push(new Projectile(p.x, p.y, p.angle, 'red_shell', p));
      break;
    case 'Green Shell':
      game.projectiles.push(new Projectile(p.x, p.y, p.angle, 'green_shell', p));
      break;
    case 'Bob-omb':
      game.projectiles.push(new Projectile(p.x, p.y, p.angle, 'bob_omb', p));
      break;
    case 'Banana':
      game.projectiles.push(new Projectile(
        p.x - Math.cos(p.angle)*20,
        p.y - Math.sin(p.angle)*20,
        p.angle + Math.PI, 'banana', p
      ));
      break;
    case 'Blue Shell':
      // Find 1st place AI
      const leader = game.allRacers
        .filter(r=>!r.isPlayer && !r.finished)
        .sort((a,b)=>b.totalProgress-a.totalProgress)[0];
      if (leader) {
        leader.stunned = 180;
        leader.speed = 0;
        showItemBanner('💙 BLUE SHELL! 1st place hit!');
      }
      break;
    case 'Bullet Bill':
      p.boostTime = 300;
      p.stunned = 0;
      showItemBanner('🚀 BULLET BILL! Auto-drive!');
      // Brief autopilot - just boost
      break;
    case 'Boomerang':
      game.projectiles.push(new Projectile(p.x, p.y, p.angle, 'boomerang', p));
      break;
    case 'Fire Flower':
      game.projectiles.push(new Projectile(p.x, p.y, p.angle, 'fire', p));
      game.projectiles.push(new Projectile(p.x, p.y, p.angle-0.2, 'fire', p));
      break;
    case 'Coin':
      showItemBanner('🪙 +2 Coins!');
      break;
  }
}

// ===== RACE RANKING =====
function updateRankings() {
  const racers = game.allRacers;
  // Sort by total progress (laps*trackLen + position), then finished first
  racers.sort((a, b) => {
    if (a.finished && !b.finished) return -1;
    if (!a.finished && b.finished) return 1;
    if (a.finished && b.finished) return (a.finishTime||0) - (b.finishTime||0);
    return b.totalProgress - a.totalProgress;
  });

  racers.forEach((r, i) => {
    r.position = i + 1;
    if (!r.isPlayer) r.setRubberbanding(i+1, racers.length);
  });

  // Update player position display
  const pos = game.player.position;
  game.lastRank = pos;
  const posEl = document.getElementById('hud-pos');
  if (posEl) posEl.textContent = ordinal(pos);

  // Update standings
  updateStandingsHUD();
}

function updateStandingsHUD() {
  const panel = document.getElementById('hud-standings');
  if (!panel) return;
  const sorted = [...game.allRacers].sort((a,b)=>a.position-b.position);
  panel.innerHTML = sorted.slice(0,8).map(r => `
    <div class="standing-row ${r.isPlayer?'player':''}">
      <span class="standing-pos">${r.position}</span>
      <span class="standing-name">${r.isPlayer ? '★YOU' : r.name.slice(0,8)}</span>
    </div>
  `).join('');
}

// ===== CAMERA =====
function updateCamera() {
  const p = game.player;
  if (!p) return;
  const targetX = p.x;
  const targetY = p.y;

  // Smooth follow
  game.camera.x += (targetX - game.camera.x) * 0.1;
  game.camera.y += (targetY - game.camera.y) * 0.1;

  // Zoom based on speed
  const targetZoom = 0.75 + (1 - Math.abs(p.speed) / (p.maxSpeed * 1.5)) * 0.4;
  game.camera.zoom += (targetZoom - game.camera.zoom) * 0.05;
  game.camera.zoom = Math.max(0.5, Math.min(1.5, game.camera.zoom));
}

// ===== ITEM BOX COLLECTION =====
function updateItemBoxes() {
  for (const box of game.itemBoxes) {
    box.update();
    for (const r of game.allRacers) {
      if (box.checkCollision(r)) {
        const weights = getItemWeights(r.position, game.allRacers.length);
        const item = pickRandomItem(weights);
        r.item = item;
        if (r.isPlayer) {
          document.getElementById('hud-item-icon').textContent = item.emoji;
          showItemBanner(`Got ${item.emoji} ${item.name}!`);
        }
      }
    }
  }
}

// ===== HUD UPDATE =====
function updateHUD() {
  const p = game.player;
  if (!p) return;

  // Lap counter
  const lap = Math.min(p.currentLap + 1, game.trackGen.LAPS);
  const lapEl = document.getElementById('hud-lap');
  if (lapEl) lapEl.textContent = `LAP ${lap}/${game.trackGen.LAPS}`;

  // Speed
  const speedEl = document.getElementById('speed-val');
  if (speedEl) {
    const kmh = Math.round(Math.abs(p.speed) * 40);
    speedEl.textContent = kmh;
  }

  // Item
  if (!p.item) {
    document.getElementById('hud-item-icon').textContent = '?';
  }
}

// ===== FINISH DETECTION =====
function checkFinish() {
  const p = game.player;
  if (!p || p.finished) return;

  // Player finished
  if (p.currentLap > game.trackGen.LAPS) {
    p.finished = true;
    p.finishTime = Date.now();
    const elapsed = (Date.now() - game.raceStartTime) / 1000;
    const mins = Math.floor(elapsed / 60).toString().padStart(2,'0');
    const secs = (elapsed % 60).toFixed(3).padStart(6,'0');
    showFinishScreen(`${mins}:${secs}`);
  }
}

function showFinishScreen(timeStr) {
  game.state = 'finished';
  cancelAnimationFrame(game.animFrame);

  // Sort final standings
  const sorted = [...game.allRacers].sort((a,b)=>a.position-b.position);
  const playerPos = game.player.position;

  const titles = ['🏆 WINNER!','🥈 2nd Place!','🥉 3rd Place!','4th Place','5th Place','6th Place','7th Place','8th Place','9th Place','10th Place','11th Place','12th Place'];
  document.getElementById('finish-title').textContent = playerPos === 1 ? '🏆 WINNER!' : 'FINISH!';
  document.getElementById('finish-pos').textContent = titles[playerPos-1] || `${playerPos}th Place`;
  document.getElementById('finish-time').textContent = `Time: ${timeStr}`;

  const standingsEl = document.getElementById('finish-standings');
  standingsEl.innerHTML = sorted.map((r,i) => `
    <div class="finish-row ${r.isPlayer?'player':''}">
      <span class="frow-pos">${ordinal(i+1)}</span>
      <span>${r.emoji}</span>
      <span class="frow-name">${r.isPlayer ? '★ YOU' : r.name}</span>
      <span class="frow-time">${r.finished ? '✓' : '…'}</span>
    </div>
  `).join('');

  showScreen('screen-finish');
}

// ===== MAIN GAME LOOP =====
function gameLoop(timestamp) {
  if (game.state === 'idle' || game.state === 'finished') return;

  const ctx = game.ctx;
  const W = game.canvas.width;
  const H = game.canvas.height;
  const tg = game.trackGen;

  // Draw track
  tg.draw(ctx, game.camera);

  // Draw item boxes
  for (const box of game.itemBoxes) {
    box.draw(ctx, game.camera, W, H);
  }

  // Update & draw AI
  for (const ai of game.aiRacers) {
    if (game.state === 'racing') {
      ai.update(tg, game.allRacers, game.raceTime);
    }
    ai.draw(ctx, game.camera, W, H);
  }

  // Update & draw player
  if (game.state === 'racing') {
    updatePlayer();
  }
  if (game.player) game.player.draw(ctx, game.camera, W, H);

  // Update projectiles
  if (game.state === 'racing') {
    game.projectiles = game.projectiles.filter(p => !p.hit);
    for (const proj of game.projectiles) {
      proj.update(game.allRacers, tg);
      proj.draw(ctx, game.camera, W, H);
    }
  }

  // Camera
  if (game.state === 'racing') {
    updateCamera();
    updateItemBoxes();
    updateRankings();
    updateHUD();
    checkFinish();
    game.raceTime++;
  }

  // Minimap
  tg.drawMinimap(game.minimapCtx, game.allRacers.map(r => ({
    x: r.x, y: r.y, isPlayer: r.isPlayer, color: r.color
  })));

  game.animFrame = requestAnimationFrame(gameLoop);
}

// ===== COUNTDOWN SYSTEM =====
function startCountdown(trackData) {
  const countEl = document.getElementById('countdown-number');
  const trackNameEl = document.getElementById('countdown-track-name');
  trackNameEl.textContent = trackData.name;

  showScreen('screen-countdown');
  game.state = 'countdown';

  let count = 3;
  countEl.textContent = count;
  countEl.style.animation = 'none';
  countEl.offsetHeight; // reflow
  countEl.style.animation = 'countPop 0.9s ease-in-out';

  const countInterval = setInterval(() => {
    count--;
    if (count > 0) {
      countEl.textContent = count;
      countEl.style.animation = 'none';
      countEl.offsetHeight;
      countEl.style.animation = 'countPop 0.9s ease-in-out';
    } else if (count === 0) {
      countEl.textContent = 'GO!';
      countEl.style.color = '#44FF44';
      countEl.style.animation = 'none';
      countEl.offsetHeight;
      countEl.style.animation = 'countPop 0.9s ease-in-out';
    } else {
      clearInterval(countInterval);
      // Start actual race
      showScreen('screen-race');
      game.state = 'racing';
      game.raceStartTime = Date.now();
      game.animFrame = requestAnimationFrame(gameLoop);
    }
  }, 1000);
}

// ===== TOUCH CONTROLS =====
function setupTouchControls() {
  const canvas = game.canvas;
  if (!canvas) return;

  // Create touch overlay
  let overlay = document.getElementById('touch-overlay');
  if (overlay) overlay.remove();

  overlay = document.createElement('div');
  overlay.id = 'touch-overlay';
  overlay.style.cssText = `
    position:fixed; bottom:0; left:0; width:100%; height:45%;
    display:flex; justify-content:space-between; align-items:flex-end;
    pointer-events:none; z-index:500; padding:20px;
  `;

  overlay.innerHTML = `
    <div style="display:flex;gap:10px;pointer-events:all">
      <button id="t-left" style="${btnStyle('#4488FF')}">◄</button>
      <button id="t-right" style="${btnStyle('#4488FF')}">►</button>
    </div>
    <div style="display:flex;gap:10px;pointer-events:all">
      <button id="t-item" style="${btnStyle('#FFD700','#8B6914')}">ITEM</button>
      <button id="t-brake" style="${btnStyle('#FF4444')}">BRAKE</button>
      <button id="t-accel" style="${btnStyle('#44AA44')}">GAS</button>
    </div>
  `;

  document.body.appendChild(overlay);

  function btnStyle(bg, shadow='rgba(0,0,0,0.3)') {
    return `background:${bg};border:none;border-radius:50px;padding:14px 22px;
    font-family:Fredoka One,cursive;font-size:16px;color:#fff;
    box-shadow:0 4px 0 ${shadow};touch-action:none;cursor:pointer;
    -webkit-tap-highlight-color:transparent;`;
  }

  function bind(id, action) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('touchstart', e=>{ e.preventDefault(); game.touchState[action]=true; if(action==='item')useItem(); }, {passive:false});
    el.addEventListener('touchend', e=>{ e.preventDefault(); game.touchState[action]=false; }, {passive:false});
    el.addEventListener('touchcancel', ()=>{ game.touchState[action]=false; });
  }

  bind('t-left','left');
  bind('t-right','right');
  bind('t-accel','accel');
  bind('t-brake','brake');
  bind('t-item','item');
}

// Window resize
window.addEventListener('resize', () => {
  if (game.canvas) {
    game.canvas.width = window.innerWidth;
    game.canvas.height = window.innerHeight;
  }
});
