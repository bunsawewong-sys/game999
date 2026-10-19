// Thai / English UI strings. Use t('key', { var: value }).

const STRINGS = {
  th: {
    tagline: 'ปกป้องเครือข่ายจาก Packet ร้าย',
    start: 'เริ่มเล่น',
    leaderboard: 'อันดับคะแนน',
    settings: 'ตั้งค่า',
    howTo: 'ลากนิ้วเพื่อบังคับ  ยิงอัตโนมัติ',
    playerLabel: 'ผู้เล่น: {name}',
    changeName: 'เปลี่ยนชื่อ',
    bestLabel: 'สถิติ: {score}',

    nameTitle: 'ENTER NAME',
    nameHint: 'ชื่อเล่นสำหรับ Leaderboard (3-12 ตัวอักษร)',
    namePlaceholder: 'ชื่อเล่น',
    nameErrLength: 'ชื่อต้องยาว 3-12 ตัวอักษร',
    nameErrChars: 'ใช้ได้เฉพาะ ไทย อังกฤษ ตัวเลข _ - และเว้นวรรค',
    ok: 'ตกลง',
    cancel: 'ยกเลิก',

    wave: 'WAVE {n}',
    waveClear: 'WAVE CLEAR',
    noHit: 'ไม่โดนยิงเลย! +{n}',
    bossDefeated: 'กำจัด BOSS! +{n}',
    warning: 'WARNING',
    getReady: 'เตรียมพร้อม',

    boss_ddos: 'DDoS CORE',
    boss_ddos_sub: 'ตรวจพบการโจมตี DDoS!',
    boss_ransom: 'RANSOMWARE',
    boss_ransom_sub: 'ไฟล์ถูกเข้ารหัส! ยิงตอนเกราะเปิด',
    boss_botnet: 'BOTNET C&C',
    boss_botnet_sub: 'เซิร์ฟเวอร์สั่งการ Botnet! ระวังเลเซอร์',
    encrypted: 'ENCRYPTED',

    pu_multicast: 'MULTICAST: ยิง 3 ทาง',
    pu_laser: 'FIBER LASER: ทะลุศัตรู',
    pu_shield: 'DMZ SHIELD: โล่ป้องกัน',
    pu_patch: 'PATCH: ฟื้น HP',
    pu_qos: 'QoS BOOST: ยิงเร็ว x2',

    chooseUpgrade: 'เลือกอัปเกรด',
    level: 'Lv {n}',
    up_dpi: 'Deep Packet Inspection',
    up_dpi_desc: 'ความแรงกระสุน +30%',
    up_gigabit: 'Gigabit Upgrade',
    up_gigabit_desc: 'ยิงเร็วขึ้น +20%',
    up_redundancy: 'Redundancy',
    up_redundancy_desc: 'HP สูงสุด +25 และฟื้น 25 HP',
    up_latency: 'Low Latency',
    up_latency_desc: 'กระสุนเร็วขึ้น +25%',
    up_loadbal: 'Load Balancer',
    up_loadbal_desc: 'เพิ่มป้อมยิงเสริมด้านข้าง',
    up_tunnel: 'Tunneling',
    up_tunnel_desc: 'กระสุนทะลุศัตรู +1 ตัว',
    up_autodisc: 'Auto-Discovery',
    up_autodisc_desc: 'ดูดไอเทมจากระยะไกลขึ้น',
    up_zeroday: 'Zero-day Exploit',
    up_zeroday_desc: 'โอกาส Critical (x2) +10%',
    up_selfheal: 'Self-healing Network',
    up_selfheal_desc: 'ฟื้น 20 HP ทุกครั้งที่จบ Wave',
    up_lease: 'Lease Time',
    up_lease_desc: 'Power-up อยู่นานขึ้น +40%',

    paused: 'หยุดชั่วคราว',
    resume: 'เล่นต่อ',
    quit: 'ออกไปเมนู',
    quitConfirm: 'ยืนยันออก? (คะแนนรอบนี้จะหาย)',

    sfx: 'เสียงเอฟเฟกต์',
    bgm: 'เพลง',
    language: 'ภาษา',
    back: 'กลับ',

    gameOver: 'SYSTEM DOWN',
    gameOverSub: 'Firewall ถูกเจาะแล้ว!',
    score: 'คะแนน',
    reached: 'ถึง Wave {n}',
    newBest: 'สถิติใหม่!',
    submitting: 'กำลังส่งคะแนน...',
    rank: 'อันดับ #{n}',
    savedLocal: 'บันทึกในเครื่อง (ออฟไลน์)',
    retry: 'เล่นอีกครั้ง',
    menu: 'เมนู',

    lbTitle: 'TOP 50',
    lbOnline: 'ออนไลน์',
    lbLocal: 'ในเครื่องนี้ (ยังไม่ได้เชื่อมต่อเซิร์ฟเวอร์)',
    lbLoading: 'กำลังโหลด...',
    lbEmpty: 'ยังไม่มีคะแนน มาเป็นคนแรกกัน!',
  },

  en: {
    tagline: 'Defend the network from hostile packets',
    start: 'START',
    leaderboard: 'LEADERBOARD',
    settings: 'SETTINGS',
    howTo: 'Drag to move  -  auto fire',
    playerLabel: 'Player: {name}',
    changeName: 'Change name',
    bestLabel: 'Best: {score}',

    nameTitle: 'ENTER NAME',
    nameHint: 'Leaderboard nickname (3-12 characters)',
    namePlaceholder: 'Nickname',
    nameErrLength: 'Name must be 3-12 characters',
    nameErrChars: 'Use Thai, English, digits, _ - and spaces only',
    ok: 'OK',
    cancel: 'Cancel',

    wave: 'WAVE {n}',
    waveClear: 'WAVE CLEAR',
    noHit: 'NO-HIT BONUS +{n}',
    bossDefeated: 'BOSS DOWN! +{n}',
    warning: 'WARNING',
    getReady: 'GET READY',

    boss_ddos: 'DDoS CORE',
    boss_ddos_sub: 'DDoS attack detected!',
    boss_ransom: 'RANSOMWARE',
    boss_ransom_sub: 'Files encrypted! Shoot when the shield drops',
    boss_botnet: 'BOTNET C&C',
    boss_botnet_sub: 'Botnet command server! Watch the laser',
    encrypted: 'ENCRYPTED',

    pu_multicast: 'MULTICAST: 3-way shot',
    pu_laser: 'FIBER LASER: piercing',
    pu_shield: 'DMZ SHIELD: protected',
    pu_patch: 'PATCH: HP restored',
    pu_qos: 'QoS BOOST: fire rate x2',

    chooseUpgrade: 'CHOOSE UPGRADE',
    level: 'Lv {n}',
    up_dpi: 'Deep Packet Inspection',
    up_dpi_desc: 'Damage +30%',
    up_gigabit: 'Gigabit Upgrade',
    up_gigabit_desc: 'Fire rate +20%',
    up_redundancy: 'Redundancy',
    up_redundancy_desc: 'Max HP +25 and heal 25',
    up_latency: 'Low Latency',
    up_latency_desc: 'Bullet speed +25%',
    up_loadbal: 'Load Balancer',
    up_loadbal_desc: 'Adds a side turret',
    up_tunnel: 'Tunneling',
    up_tunnel_desc: 'Bullets pierce +1 enemy',
    up_autodisc: 'Auto-Discovery',
    up_autodisc_desc: 'Larger item pickup range',
    up_zeroday: 'Zero-day Exploit',
    up_zeroday_desc: 'Critical chance (x2) +10%',
    up_selfheal: 'Self-healing Network',
    up_selfheal_desc: 'Heal 20 HP after every wave',
    up_lease: 'Lease Time',
    up_lease_desc: 'Power-ups last 40% longer',

    paused: 'PAUSED',
    resume: 'RESUME',
    quit: 'QUIT TO MENU',
    quitConfirm: 'Quit? This run will be lost',

    sfx: 'Sound FX',
    bgm: 'Music',
    language: 'Language',
    back: 'BACK',

    gameOver: 'SYSTEM DOWN',
    gameOverSub: 'The firewall has been breached!',
    score: 'SCORE',
    reached: 'Reached wave {n}',
    newBest: 'NEW BEST!',
    submitting: 'Submitting score...',
    rank: 'Rank #{n}',
    savedLocal: 'Saved on this device (offline)',
    retry: 'PLAY AGAIN',
    menu: 'MENU',

    lbTitle: 'TOP 50',
    lbOnline: 'Online',
    lbLocal: 'This device only (server not connected)',
    lbLoading: 'Loading...',
    lbEmpty: 'No scores yet. Be the first!',
  },
};

let lang = 'th';

export function setLang(next) {
  lang = STRINGS[next] ? next : 'th';
}

export function getLang() {
  return lang;
}

export function t(key, vars) {
  let s = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}
