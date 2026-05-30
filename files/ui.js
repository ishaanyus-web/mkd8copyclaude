// ===== UI MANAGEMENT =====

let selectedCharIdx = 0;
let selectedVehicleIdx = 0;
let selectedTrackIdx = 0;
let selectedCupIdx = 0;

// ===== SCREEN MANAGEMENT =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(id);
  if (screen) screen.classList.add('active');

  // Clean up race
  if (id !== 'screen-race') {
    cancelAnimationFrame(game.animFrame);
    game.state = 'idle';
    const to = document.getElementById('touch-overlay');
    if (to) to.remove();
  }

  // Initialize screens
  if (id === 'screen-character') buildCharGrid();
  if (id === 'screen-vehicle') buildVehicleGrid();
  if (id === 'screen-track') buildTrackGrid();
  if (id === 'screen-grandprix') buildGrandPrixGrid();
}

// ===== CHARACTER GRID =====
function buildCharGrid() {
  const grid = document.getElementById('char-grid');
  if (!grid) return;
  grid.innerHTML = CHARACTERS.map((c, i) => `
    <div class="char-card ${i===selectedCharIdx?'selected':''}" onclick="selectChar(${i})">
      <div class="char-emoji">${c.emoji}</div>
      <div class="char-label">${c.name}</div>
    </div>
  `).join('');
  updateCharPreview();
}

function selectChar(idx) {
  selectedCharIdx = idx;
  document.querySelectorAll('.char-card').forEach((el,i) => {
    el.classList.toggle('selected', i===idx);
  });
  updateCharPreview();
}

function updateCharPreview() {
  const c = CHARACTERS[selectedCharIdx];
  const nameEl = document.getElementById('char-name-display');
  const classEl = document.getElementById('char-class-display');
  if (nameEl) nameEl.textContent = `${c.emoji} ${c.name}`;
  if (classEl) classEl.textContent = `${c.weight} Weight  •  Speed: ${'⭐'.repeat(c.speed)}  •  Handling: ${'⭐'.repeat(c.handling)}`;
}

// ===== VEHICLE GRID =====
function buildVehicleGrid() {
  const grid = document.getElementById('vehicle-grid');
  if (!grid) return;
  grid.innerHTML = VEHICLES.map((v, i) => `
    <div class="vehicle-card ${i===selectedVehicleIdx?'selected':''}" onclick="selectVehicle(${i})">
      <div class="vehicle-emoji">${v.emoji}</div>
      <div class="vehicle-name">${v.name}</div>
      <div style="font-size:10px;color:rgba(255,255,255,0.4);margin-top:2px">${v.type}</div>
      <div class="vehicle-stats">
        <div class="stat-bar" title="Speed"><div class="stat-fill stat-spd" style="width:${v.speed*20}%"></div></div>
        <div class="stat-bar" title="Accel"><div class="stat-fill stat-acc" style="width:${v.accel*20}%"></div></div>
        <div class="stat-bar" title="Handling"><div class="stat-fill stat-hnd" style="width:${v.handling*20}%"></div></div>
      </div>
    </div>
  `).join('');
}

function selectVehicle(idx) {
  selectedVehicleIdx = idx;
  document.querySelectorAll('.vehicle-card').forEach((el,i) => {
    el.classList.toggle('selected', i===idx);
  });
}

// ===== TRACK GRID =====
function buildTrackGrid() {
  const tabsEl = document.getElementById('cup-tabs');
  const gridEl = document.getElementById('track-grid');
  if (!tabsEl || !gridEl) return;

  // Build cup tabs
  tabsEl.innerHTML = CUPS.map((cup, i) => `
    <div class="cup-tab ${i===selectedCupIdx?'active':''}" onclick="selectCup(${i})">${cup.icon} ${cup.name}</div>
  `).join('');

  buildTrackCards();
}

function selectCup(idx) {
  selectedCupIdx = idx;
  document.querySelectorAll('.cup-tab').forEach((el,i) => {
    el.classList.toggle('active', i===idx);
  });
  buildTrackCards();
}

function buildTrackCards() {
  const gridEl = document.getElementById('track-grid');
  if (!gridEl) return;
  const cup = CUPS[selectedCupIdx];
  const startGlobal = selectedCupIdx * 4;

  gridEl.innerHTML = cup.tracks.map((t, i) => {
    const globalIdx = startGlobal + i;
    const palette = THEME_PALETTES[t.theme] || THEME_PALETTES.circuit;
    return `
      <div class="track-card ${globalIdx===selectedTrackIdx?'selected':''}" onclick="selectTrack(${globalIdx})">
        <div class="track-number">${i+1}</div>
        <div class="track-info">
          <div class="track-name">${t.name}</div>
          <div class="track-cup">${cup.icon} ${cup.name}</div>
          <div style="margin-top:4px;display:flex;gap:3px">
            ${'⭐'.repeat(t.difficulty||1)}${'☆'.repeat(5-(t.difficulty||1))}
          </div>
        </div>
        <div style="width:40px;height:40px;border-radius:8px;background:${palette.road};border:2px solid ${palette.grass};display:flex;align-items:center;justify-content:center;font-size:18px">
          ${themeEmoji(t.theme)}
        </div>
      </div>
    `;
  }).join('');
}

function selectTrack(globalIdx) {
  selectedTrackIdx = globalIdx;
  selectedCupIdx = Math.floor(globalIdx / 4);
  buildTrackCards();
  buildTrackGrid(); // rebuild tabs
}

function themeEmoji(theme) {
  const map = {
    circuit:'🏎️',water:'🌊',candy:'🍭',ruins:'🏚️',city:'🏙️',
    mansion:'👻',mountain:'⛰️',airport:'✈️',sky:'☁️',desert:'🏜️',
    castle:'🏰',rainbow:'🌈',grass:'🌿',dirt:'🟤',futuristic:'🚀',
    moon:'🌙',forest:'🌲',village:'🏡',ice:'❄️',volcano:'🌋',sewer:'🚧'
  };
  return map[theme] || '🏁';
}

// ===== GRAND PRIX =====
function buildGrandPrixGrid() {
  const grid = document.getElementById('cup-select-grid');
  if (!grid) return;
  grid.innerHTML = CUPS.map((cup, i) => `
    <div class="cup-select-card" onclick="startGrandPrixCup(${i})">
      <div class="cup-icon">${cup.icon}</div>
      <div class="cup-title">${cup.name}</div>
      <div class="cup-tracks-list">${cup.tracks.map(t=>t.name).join('<br>')}</div>
    </div>
  `).join('');
}

function startGrandPrix() {
  showScreen('screen-character');
  game.grandPrixMode = false;
  showScreen('screen-grandprix');
}

function startGrandPrixCup(cupIdx) {
  game.grandPrixMode = true;
  game.grandPrixCupIdx = cupIdx;
  game.grandPrixRaceIdx = 0;
  game.grandPrixScores = {};
  showScreen('screen-character');
}

// ===== RACE START =====
function startRaceFromMenu() {
  const track = ALL_TRACKS[selectedTrackIdx];
  if (!track) { alert('Please select a track!'); return; }
  launchRace(track, selectedCharIdx, selectedVehicleIdx);
}

function launchRace(track, charIdx, vehicleIdx) {
  initRace(track, charIdx, vehicleIdx);
  startCountdown(track);
}

// ===== ITEM BANNER DOM =====
(function() {
  const banner = document.createElement('div');
  banner.id = 'item-banner';
  banner.style.cssText = `
    position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
    font-family:'Fredoka One',cursive;font-size:clamp(28px,5vw,48px);
    color:#FFD700;text-shadow:4px 4px 0 #8B6914;
    background:rgba(0,0,0,0.8);padding:15px 30px;
    border-radius:20px;border:3px solid #FFD700;
    display:none;z-index:1000;pointer-events:none;
    white-space:nowrap;max-width:90vw;text-align:center;
  `;
  document.body.appendChild(banner);

  const boostFlash = document.createElement('div');
  boostFlash.id = 'boost-flash';
  document.body.appendChild(boostFlash);
})();

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  showScreen('screen-title');
  buildCharGrid();
  buildVehicleGrid();
  buildTrackGrid();
  buildGrandPrixGrid();
});

// ===== EXPOSE GLOBALS =====
window.showScreen = showScreen;
window.selectChar = selectChar;
window.selectVehicle = selectVehicle;
window.selectTrack = selectTrack;
window.selectCup = selectCup;
window.startRaceFromMenu = startRaceFromMenu;
window.startGrandPrix = startGrandPrix;
window.startGrandPrixCup = startGrandPrixCup;
window.useItem = useItem;
