// ===== ALL 42 CHARACTERS =====
const CHARACTERS = [
  // Light
  { name:'Toad', emoji:'🍄', weight:'Light', speed:3, accel:5, handling:5, color:'#4488FF' },
  { name:'Koopa', emoji:'🐢', weight:'Light', speed:3, accel:5, handling:5, color:'#44BB44' },
  { name:'Shy Guy', emoji:'😷', weight:'Light', speed:3, accel:5, handling:4, color:'#FF4444' },
  { name:'Lakitu', emoji:'☁️', weight:'Light', speed:2, accel:5, handling:5, color:'#AADDFF' },
  { name:'Toadette', emoji:'🎀', weight:'Light', speed:3, accel:5, handling:5, color:'#FF88CC' },
  { name:'Baby Mario', emoji:'👶', weight:'Light', speed:2, accel:5, handling:5, color:'#FF4444' },
  { name:'Baby Luigi', emoji:'🫧', weight:'Light', speed:2, accel:5, handling:5, color:'#4444FF' },
  { name:'Baby Peach', emoji:'🌸', weight:'Light', speed:2, accel:5, handling:5, color:'#FFAACC' },
  { name:'Baby Daisy', emoji:'🌼', weight:'Light', speed:2, accel:5, handling:5, color:'#FFDD44' },
  { name:'Baby Rosalina', emoji:'⭐', weight:'Light', speed:2, accel:5, handling:5, color:'#AACCFF' },
  { name:'Lemmy', emoji:'🎪', weight:'Light', speed:3, accel:5, handling:4, color:'#FF8844' },

  // Medium
  { name:'Mario', emoji:'🔴', weight:'Medium', speed:4, accel:4, handling:4, color:'#FF4444' },
  { name:'Luigi', emoji:'🟢', weight:'Medium', speed:4, accel:4, handling:4, color:'#44AA44' },
  { name:'Peach', emoji:'👸', weight:'Medium', speed:3, accel:4, handling:5, color:'#FFAACC' },
  { name:'Daisy', emoji:'🌻', weight:'Medium', speed:3, accel:4, handling:5, color:'#FFCC44' },
  { name:'Yoshi', emoji:'🦎', weight:'Medium', speed:3, accel:4, handling:5, color:'#44CC44' },
  { name:'Tanooki Mario', emoji:'🦝', weight:'Medium', speed:4, accel:4, handling:4, color:'#AA8844' },
  { name:'Cat Peach', emoji:'🐱', weight:'Medium', speed:3, accel:4, handling:5, color:'#FFAACC' },
  { name:'Inkling Boy', emoji:'🦑', weight:'Medium', speed:4, accel:4, handling:4, color:'#44FFDD' },
  { name:'Inkling Girl', emoji:'🎭', weight:'Medium', speed:4, accel:4, handling:4, color:'#FF8844' },
  { name:'Villager M', emoji:'🏠', weight:'Medium', speed:3, accel:4, handling:5, color:'#88CC88' },
  { name:'Villager F', emoji:'🌿', weight:'Medium', speed:3, accel:4, handling:5, color:'#CC8844' },
  { name:'Isabelle', emoji:'🐾', weight:'Medium', speed:3, accel:4, handling:5, color:'#FFDD88' },
  { name:'Larry', emoji:'🎯', weight:'Medium', speed:4, accel:4, handling:4, color:'#4488FF' },
  { name:'Wendy', emoji:'💅', weight:'Medium', speed:3, accel:4, handling:5, color:'#FF44AA' },
  { name:'Morton', emoji:'🔨', weight:'Medium', speed:4, accel:4, handling:4, color:'#888888' },

  // Heavy
  { name:'Wario', emoji:'💰', weight:'Heavy', speed:5, accel:3, handling:3, color:'#DDBB00' },
  { name:'Waluigi', emoji:'🎰', weight:'Heavy', speed:5, accel:3, handling:3, color:'#9944CC' },
  { name:'Donkey Kong', emoji:'🦍', weight:'Heavy', speed:5, accel:3, handling:3, color:'#AA6622' },
  { name:'Bowser', emoji:'🐉', weight:'Heavy', speed:5, accel:3, handling:2, color:'#AA4400' },
  { name:'Rosalina', emoji:'🌟', weight:'Heavy', speed:5, accel:3, handling:3, color:'#6644CC' },
  { name:'Link', emoji:'🗡️', weight:'Heavy', speed:5, accel:3, handling:3, color:'#44AA44' },
  { name:'Dry Bowser', emoji:'💀', weight:'Heavy', speed:5, accel:3, handling:2, color:'#DDDDDD' },
  { name:'King Boo', emoji:'👻', weight:'Heavy', speed:5, accel:3, handling:3, color:'#CCAAFF' },
  { name:'Roy', emoji:'🥊', weight:'Heavy', speed:5, accel:3, handling:3, color:'#AA44FF' },
  { name:'Ludwig', emoji:'🎵', weight:'Heavy', speed:5, accel:3, handling:3, color:'#4488CC' },
  { name:'Metal Mario', emoji:'⚙️', weight:'Heavy', speed:5, accel:3, handling:2, color:'#888888' },
  { name:'Pink Gold Peach', emoji:'💗', weight:'Heavy', speed:5, accel:3, handling:3, color:'#FFAADD' },
  { name:'Iggy', emoji:'🦩', weight:'Medium', speed:4, accel:4, handling:4, color:'#88DDFF' },
  { name:'Dry Bones', emoji:'🦴', weight:'Light', speed:3, accel:5, handling:5, color:'#DDDDCC' },
  { name:'Bowser Jr.', emoji:'🎭', weight:'Medium', speed:4, accel:4, handling:4, color:'#FFAA44' },
  { name:'Kamek', emoji:'🧙', weight:'Medium', speed:4, accel:4, handling:4, color:'#AA44CC' },
];

// ===== ALL VEHICLES =====
const VEHICLES = [
  // Karts
  { name:'Standard Kart', emoji:'🏎️', type:'Kart', speed:3, accel:3, handling:3, color:'#FF4444' },
  { name:'Pipe Frame', emoji:'🚗', type:'Kart', speed:2, accel:4, handling:4, color:'#44AA44' },
  { name:'Mach 8', emoji:'⚡', type:'Kart', speed:5, accel:3, handling:3, color:'#4488FF' },
  { name:'Steel Driver', emoji:'🔧', type:'Kart', speed:4, accel:2, handling:2, color:'#888888' },
  { name:'Cat Cruiser', emoji:'🐱', type:'Kart', speed:3, accel:4, handling:4, color:'#FFAACC' },
  { name:'Circuit Special', emoji:'🏁', type:'Kart', speed:5, accel:3, handling:4, color:'#FF8800' },
  { name:'Tri-Speeder', emoji:'🔺', type:'Kart', speed:4, accel:3, handling:3, color:'#44CCCC' },
  { name:'Badwagon', emoji:'💀', type:'Kart', speed:4, accel:2, handling:2, color:'#333333' },
  { name:'Prancer', emoji:'🦌', type:'Kart', speed:3, accel:4, handling:4, color:'#AA4400' },
  { name:'Biddybuggy', emoji:'🐛', type:'Kart', speed:2, accel:5, handling:5, color:'#FF4488' },
  { name:'Landship', emoji:'🛳️', type:'Kart', speed:3, accel:4, handling:4, color:'#4488AA' },
  { name:'Sneeker', emoji:'👟', type:'Kart', speed:3, accel:4, handling:4, color:'#FFDD44' },
  { name:'Sports Coupe', emoji:'🚙', type:'Kart', speed:4, accel:4, handling:3, color:'#AA4488' },
  { name:'Gold Standard', emoji:'⭐', type:'Kart', speed:4, accel:3, handling:3, color:'#FFD700' },
  { name:'GLA Mercedes', emoji:'🚖', type:'Kart', speed:4, accel:3, handling:3, color:'#222222' },
  { name:'W25 Silver Arrow', emoji:'🚘', type:'Kart', speed:5, accel:3, handling:3, color:'#CCCCCC' },
  { name:'300 SL Roadster', emoji:'🏎️', type:'Kart', speed:4, accel:4, handling:3, color:'#4444AA' },
  // Bikes
  { name:'Standard Bike', emoji:'🏍️', type:'Bike', speed:3, accel:4, handling:4, color:'#4444FF' },
  { name:'Comet', emoji:'☄️', type:'Bike', speed:3, accel:4, handling:5, color:'#FF4444' },
  { name:'Sport Bike', emoji:'🏁', type:'Bike', speed:5, accel:3, handling:4, color:'#FF8800' },
  { name:'The Duke', emoji:'👑', type:'Bike', speed:4, accel:3, handling:4, color:'#444444' },
  { name:'Flame Rider', emoji:'🔥', type:'Bike', speed:4, accel:4, handling:4, color:'#FF4400' },
  { name:'Varmint', emoji:'🌿', type:'Bike', speed:3, accel:5, handling:5, color:'#44AA44' },
  { name:'Mr. Scooty', emoji:'🛵', type:'Bike', speed:2, accel:5, handling:5, color:'#FF88CC' },
  { name:'Jet Bike', emoji:'✈️', type:'Bike', speed:5, accel:3, handling:3, color:'#4488FF' },
  { name:'Yoshi Bike', emoji:'🦎', type:'Bike', speed:3, accel:4, handling:5, color:'#44CC44' },
  // ATVs
  { name:'Standard ATV', emoji:'🚜', type:'ATV', speed:3, accel:3, handling:3, color:'#888844' },
  { name:'Wild Wiggler', emoji:'🐛', type:'ATV', speed:2, accel:5, handling:5, color:'#AA4400' },
  { name:'Teddy Buggy', emoji:'🧸', type:'ATV', speed:3, accel:4, handling:4, color:'#CCAA66' },
  { name:'Bone Rattler', emoji:'💀', type:'ATV', speed:5, accel:2, handling:2, color:'#DDDDCC' },
];

// ===== ALL 48 TRACKS =====
const CUPS = [
  {
    name:'Mushroom Cup', icon:'🍄',
    tracks:[
      { name:'Mario Kart Stadium', theme:'circuit', difficulty:1 },
      { name:'Water Park', theme:'water', difficulty:1 },
      { name:'Sweet Sweet Canyon', theme:'candy', difficulty:1 },
      { name:'Thwomp Ruins', theme:'ruins', difficulty:2 },
    ]
  },
  {
    name:'Flower Cup', icon:'🌸',
    tracks:[
      { name:'Mario Circuit', theme:'circuit', difficulty:2 },
      { name:'Toad Harbor', theme:'city', difficulty:2 },
      { name:'Twisted Mansion', theme:'mansion', difficulty:2 },
      { name:'Shy Guy Falls', theme:'mountain', difficulty:3 },
    ]
  },
  {
    name:'Star Cup', icon:'⭐',
    tracks:[
      { name:'Sunshine Airport', theme:'airport', difficulty:3 },
      { name:'Dolphin Shoals', theme:'water', difficulty:3 },
      { name:'Electrodrome', theme:'city', difficulty:3 },
      { name:"Mount Wario", theme:'mountain', difficulty:4 },
    ]
  },
  {
    name:'Special Cup', icon:'🌟',
    tracks:[
      { name:'Cloudtop Cruise', theme:'sky', difficulty:4 },
      { name:"Bone-Dry Dunes", theme:'desert', difficulty:4 },
      { name:'Bowser\'s Castle', theme:'castle', difficulty:5 },
      { name:'Rainbow Road', theme:'rainbow', difficulty:5 },
    ]
  },
  {
    name:'Egg Cup', icon:'🥚',
    tracks:[
      { name:'Yoshi Circuit', theme:'grass', difficulty:2 },
      { name:'Excitebike Arena', theme:'dirt', difficulty:2 },
      { name:'Dragon Driftway', theme:'sky', difficulty:3 },
      { name:'Mute City', theme:'futuristic', difficulty:3 },
    ]
  },
  {
    name:'Crossing Cup', icon:'🍃',
    tracks:[
      { name:'Baby Park', theme:'circuit', difficulty:1 },
      { name:'Cheese Land', theme:'moon', difficulty:2 },
      { name:'Wild Woods', theme:'forest', difficulty:3 },
      { name:'Animal Crossing', theme:'village', difficulty:2 },
    ]
  },
  {
    name:'Shell Cup', icon:'🐚',
    tracks:[
      { name:'Moo Moo Meadows', theme:'grass', difficulty:1 },
      { name:'Mario Circuit (Wii)', theme:'circuit', difficulty:2 },
      { name:'Cheep Cheep Lagoon', theme:'water', difficulty:2 },
      { name:'Toad\'s Turnpike', theme:'city', difficulty:3 },
    ]
  },
  {
    name:'Banana Cup', icon:'🍌',
    tracks:[
      { name:'Dry Plains', theme:'desert', difficulty:2 },
      { name:'Wario Stadium', theme:'dirt', difficulty:3 },
      { name:'Sherbet Land', theme:'ice', difficulty:3 },
      { name:'Music Park', theme:'candy', difficulty:3 },
    ]
  },
  {
    name:'Leaf Cup', icon:'🍂',
    tracks:[
      { name:'Yoshi Valley', theme:'grass', difficulty:3 },
      { name:'Tick-Tock Clock', theme:'city', difficulty:4 },
      { name:'Piranha Plant Slide', theme:'sewer', difficulty:3 },
      { name:'Grumble Volcano', theme:'volcano', difficulty:4 },
    ]
  },
  {
    name:'Lightning Cup', icon:'⚡',
    tracks:[
      { name:'N64 Rainbow Road', theme:'rainbow', difficulty:5 },
      { name:'Ice Ice Outpost', theme:'ice', difficulty:3 },
      { name:'Hyrule Circuit', theme:'castle', difficulty:4 },
      { name:'Neo Bowser City', theme:'city', difficulty:4 },
    ]
  },
  {
    name:'Triforce Cup', icon:'🔺',
    tracks:[
      { name:'Ribbon Road', theme:'candy', difficulty:4 },
      { name:'Super Bell Subway', theme:'city', difficulty:4 },
      { name:'Big Blue', theme:'futuristic', difficulty:5 },
      { name:'Sky Garden', theme:'sky', difficulty:3 },
    ]
  },
  {
    name:'Bell Cup', icon:'🔔',
    tracks:[
      { name:'Baby Park (GCN)', theme:'circuit', difficulty:1 },
      { name:'Cheese Land (GBA)', theme:'moon', difficulty:2 },
      { name:'Wild Woods 2', theme:'forest', difficulty:3 },
      { name:'Animal Crossing 2', theme:'village', difficulty:2 },
    ]
  },
];

// Flat list of all tracks
const ALL_TRACKS = [];
CUPS.forEach((cup, ci) => {
  cup.tracks.forEach((t, ti) => {
    ALL_TRACKS.push({ ...t, cup:cup.name, cupIcon:cup.icon, cupIndex:ci, trackIndex:ti, globalIndex:ALL_TRACKS.length });
  });
});

// Theme color palettes for procedural track generation
const THEME_PALETTES = {
  circuit:   { road:'#444', grass:'#339933', accent:'#FF4444', sky:'#5599FF', border:'#FFFFFF' },
  water:     { road:'#336699', grass:'#2266AA', accent:'#00CCFF', sky:'#88CCFF', border:'#FFFFFF' },
  candy:     { road:'#FF88AA', grass:'#FF4488', accent:'#FFFF44', sky:'#FFAACC', border:'#FF44AA' },
  ruins:     { road:'#886644', grass:'#665533', accent:'#FFDD88', sky:'#AA8866', border:'#FFCC88' },
  city:      { road:'#555566', grass:'#334455', accent:'#FFDD00', sky:'#334466', border:'#AABBCC' },
  mansion:   { road:'#442244', grass:'#331133', accent:'#AADD88', sky:'#221133', border:'#8844AA' },
  mountain:  { road:'#776655', grass:'#AABBAA', accent:'#FFFFFF', sky:'#AACCDD', border:'#CCDDEE' },
  airport:   { road:'#888899', grass:'#33AA55', accent:'#FFDD00', sky:'#7799BB', border:'#FFFFFF' },
  sky:       { road:'#AACCFF', grass:'#6699FF', accent:'#FFFFFF', sky:'#4488DD', border:'#EEEEFF' },
  desert:    { road:'#CCAA66', grass:'#AA8844', accent:'#FFDD44', sky:'#DDCC88', border:'#FFEEAA' },
  castle:    { road:'#885544', grass:'#663322', accent:'#FF4400', sky:'#331122', border:'#FF6644' },
  rainbow:   { road:'#FF44CC', grass:'#4444CC', accent:'#FFFF44', sky:'#000033', border:'#FF44FF' },
  grass:     { road:'#556633', grass:'#44AA22', accent:'#FFFF44', sky:'#88CCFF', border:'#AAFFAA' },
  dirt:      { road:'#997755', grass:'#665533', accent:'#FFDD44', sky:'#AAAAAA', border:'#CCAA88' },
  futuristic:{ road:'#222244', grass:'#111133', accent:'#00FFFF', sky:'#000022', border:'#00FFFF' },
  moon:      { road:'#CCBBAA', grass:'#AAAAAA', accent:'#FFFF88', sky:'#111133', border:'#FFFFFF' },
  forest:    { road:'#556644', grass:'#336622', accent:'#FFDD44', sky:'#446622', border:'#88CC66' },
  village:   { road:'#888866', grass:'#66AA44', accent:'#FFCC66', sky:'#99CCEE', border:'#FFEE99' },
  ice:       { road:'#AACCEE', grass:'#88AACC', accent:'#FFFFFF', sky:'#AADDFF', border:'#DDFFFF' },
  volcano:   { road:'#664422', grass:'#442211', accent:'#FF4400', sky:'#331100', border:'#FF6600' },
  sewer:     { road:'#446644', grass:'#334433', accent:'#AAFFAA', sky:'#334433', border:'#66AA66' },
};

// Items available
const ITEMS = [
  { name:'Red Shell', emoji:'🔴', type:'offensive', desc:'Seeks nearest racer ahead' },
  { name:'Green Shell', emoji:'🟢', type:'offensive', desc:'Rolls straight ahead' },
  { name:'Banana', emoji:'🍌', type:'trap', desc:'Drop behind to trip opponents' },
  { name:'Mushroom', emoji:'🍄', type:'boost', desc:'Speed boost!' },
  { name:'Star', emoji:'⭐', type:'star', desc:'Invincible for 7 seconds!' },
  { name:'Bob-omb', emoji:'💣', type:'offensive', desc:'Explodes near opponents' },
  { name:'Blue Shell', emoji:'💙', type:'offensive', desc:'Homes in on 1st place!' },
  { name:'Lightning', emoji:'⚡', type:'aoe', desc:'Shrinks all opponents!' },
  { name:'Bullet Bill', emoji:'🚀', type:'autopilot', desc:'Auto-drives for 5 seconds' },
  { name:'Boomerang', emoji:'🪃', type:'offensive', desc:'Returns to you (3 uses)' },
  { name:'Fire Flower', emoji:'🌸', type:'offensive', desc:'Throw fireballs!' },
  { name:'Coin', emoji:'🪙', type:'coin', desc:'+2 Coins (up to 10 for speed)' },
];

// Position ordinals
function ordinal(n) {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
}

// Get item weights based on position (worse position = better items)
function getItemWeights(position, total) {
  const ratio = position / total; // 1=last, 0=first
  if (ratio > 0.8) return [0,0,4,6,4,3,2,3,2,2,2,2]; // bad items, lots of good
  if (ratio > 0.5) return [2,2,4,4,2,2,1,1,1,2,2,3]; // mid
  return [4,4,4,2,0,1,0,0,0,1,1,6]; // leading: shells, bananas, coins
}

function pickRandomItem(weights) {
  const total = weights.reduce((a,b)=>a+b,0);
  let r = Math.random() * total;
  for (let i=0;i<weights.length;i++) {
    r -= weights[i];
    if (r <= 0) return ITEMS[i];
  }
  return ITEMS[11]; // coin
}
