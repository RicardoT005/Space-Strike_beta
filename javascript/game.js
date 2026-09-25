/* ================================================================
   SPACE STRIKE
   GAME ENGINE
   Version: 0.1.0

   Main game controller.

   Systems included:
   - Canvas rendering
   - Player
   - Projectiles
   - Enemies
   - Enemy projectiles
   - Collision system
   - Score
   - Levels
   - Difficulty
   - Particles
   - Touch controls
   - Pause
   - Game Over
   - Local high score
================================================================ */


/* ================================================================
   DOM REFERENCES
================================================================ */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");
const targetElement = document.getElementById("target");
const livesElement = document.getElementById("lives");

const progressBar = document.getElementById("progressBar");

const pauseButton = document.getElementById("pauseButton");

const pauseScreen = document.getElementById("pauseScreen");
const resumeButton = document.getElementById("resumeButton");
const pauseMenuButton = document.getElementById("pauseMenuButton");

const levelCompleteScreen =
    document.getElementById("levelCompleteScreen");

const completedLevelElement =
    document.getElementById("completedLevel");

const levelCompleteScoreElement =
    document.getElementById("levelCompleteScore");

const gameOverScreen =
    document.getElementById("gameOverScreen");

const finalScoreElement =
    document.getElementById("finalScore");

const finalLevelElement =
    document.getElementById("finalLevel");

const bestScoreElement =
    document.getElementById("bestScore");

const restartButton =
    document.getElementById("restartButton");

const gameOverMenuButton =
    document.getElementById("gameOverMenuButton");

const missionStartScreen =
    document.getElementById("missionStartScreen");

const missionLevelElement =
    document.getElementById("missionLevel");

const launchButton =
    document.getElementById("launchButton");

const continueButton =
    document.getElementById("continueButton");

const continueInfo =
    document.getElementById("continueInfo");

const joystick =
    document.getElementById("joystick");

const joystickStick =
    document.getElementById("joystickStick");

const fireButton =
    document.getElementById("fireButton");

const systemStatus =
    document.getElementById("systemStatus");

const mobileControls =
    document.getElementById("mobileControls");


/* ================================================================
   CANVAS CONFIGURATION
================================================================ */

let canvasWidth = 0;
let canvasHeight = 0;

let deviceScale = 1;


/* ================================================================
   GAME STATE
================================================================ */

const game = {

    running: false,

    paused: false,

    gameOver: false,

    levelTransition: false,

    /*
        infinite | adventure
    */
    mode: "infinite",

    /*
        Adventure stage 1..10
    */
    adventureLevel: 1,

    /*
        Score gained only in current adventure level
    */
    levelScore: 0,

    score: 0,

    level: 1,

    targetScore: 1000,

    highScore: Number(
        localStorage.getItem("spaceStrikeHighScore") || 0
    ),

    lastTime: 0,

    elapsed: 0,

    spawnTimer: 0,

    spawnInterval: 900,

    screenShake: 0,

    timeLeft: 0,

    timedLevel: false,

    /* Wave / kill quotas */
    waveKills: 0,

    waveKillTarget: 10,

    waveSpawned: 0,

    waveSpawnQuota: 10,

    bossActive: false,

    waitingWaveClear: false,

    /* Remaster 2.0.0 */
    shieldRegenTimer: 0,

    bossesKilled: 0,

    /* Session stats / combo */
    kills: 0,

    shotsFired: 0,

    hitsLanded: 0,

    damageTaken: 0,

    combo: 0,

    maxCombo: 0,

    comboTimer: 0,

    missionTime: 0

};


/* ================================================================
   PROGRESS SAVE / LOAD
================================================================ */

const PROGRESS_KEY = "spaceStrikeProgress";


function saveProgress() {

    /*
        Progress continue only for infinite mode.
    */

    if (game.mode === "adventure") {
        return;
    }

    /*
        Only save while a run is active
        (running, paused, or level transition).
        Never save on game over.
    */

    if (game.gameOver) {
        return;
    }

    if (
        !game.running &&
        !game.paused &&
        !game.levelTransition
    ) {
        return;
    }

    if (game.score > game.highScore) {
        game.highScore = game.score;
    }

    persistHighScore();

    var shipIdSave = "interceptor";
    try {
        if (window.SpaceStrikeShips && window.SpaceStrikeShips.getEquippedId) {
            shipIdSave = window.SpaceStrikeShips.getEquippedId();
        } else if (player && player.shipId) {
            shipIdSave = player.shipId;
        } else {
            shipIdSave = localStorage.getItem("spaceStrikeEquippedShip") || "interceptor";
        }
    } catch (eShip) {}

    const data = {
        version: 2,
        score: game.score,
        level: game.level,
        targetScore: game.targetScore,
        spawnInterval: game.spawnInterval,
        health: player.health,
        shipId: shipIdSave,
        savedAt: Date.now()
    };

    try {
        localStorage.setItem(
            PROGRESS_KEY,
            JSON.stringify(data)
        );
    } catch (e) {
        // silent
    }

}


function loadProgress() {

    try {
        const raw = localStorage.getItem(PROGRESS_KEY);
        if (!raw) {
            return null;
        }

        const data = JSON.parse(raw);

        if (
            !data ||
            typeof data.level !== "number" ||
            typeof data.score !== "number" ||
            data.level < 1
        ) {
            return null;
        }

        return data;
    } catch (e) {
        return null;
    }

}


function clearProgress() {

    try {
        localStorage.removeItem(PROGRESS_KEY);
    } catch (e) {
        // silent
    }

}


function hasSavedProgress() {

    return loadProgress() !== null;

}


function persistHighScore() {

    try {
        localStorage.setItem(
            "spaceStrikeHighScore",
            String(Math.max(0, Math.floor(game.highScore)))
        );
    } catch (e) {
        // silent
    }

}


function syncHighScoreFromSources() {

    /*
        Rebuild best score from localStorage + any
        saved run progress (covers cases where the
        player beat a record but never hit game over).
    */

    let best = Number(
        localStorage.getItem("spaceStrikeHighScore") || 0
    );

    if (!Number.isFinite(best) || best < 0) {
        best = 0;
    }

    const progress = loadProgress();

    if (progress && typeof progress.score === "number") {
        best = Math.max(best, progress.score);
    }

    if (typeof game.score === "number") {
        best = Math.max(best, game.score);
    }

    game.highScore = best;
    persistHighScore();

}


function updateMissionStartUI() {

    const data = loadProgress();

    if (data) {

        if (continueButton) {
            continueButton.classList.remove("hidden");
        }

        if (continueInfo) {
            continueInfo.classList.remove("hidden");
            continueInfo.textContent =
                `PROGRESO // NIVEL ${String(data.level).padStart(2, "0")} // SCORE ${formatNumber(data.score)}`;
        }

        if (missionLevelElement) {
            missionLevelElement.textContent =
                `LEVEL ${String(data.level).padStart(2, "0")}`;
        }

        if (launchButton) {
            launchButton.textContent = "NUEVA MISIÓN";
            launchButton.classList.remove("primary");
        }

    } else {

        if (continueButton) {
            continueButton.classList.add("hidden");
        }

        if (continueInfo) {
            continueInfo.classList.add("hidden");
        }

        if (missionLevelElement) {
            missionLevelElement.textContent = "LEVEL 01";
        }

        if (launchButton) {
            launchButton.textContent = "LAUNCH";
            launchButton.classList.add("primary");
        }

    }

}


/* ================================================================
   SETTINGS (from settings screen / localStorage)
================================================================ */

const SETTINGS_KEY = "spaceStrikeSettings";

const DIFFICULTY_MULTIPLIERS = {
    easy: {
        enemySpeed: 0.85,
        spawnRate: 1.20
    },
    normal: {
        enemySpeed: 1.0,
        spawnRate: 1.0
    },
    hard: {
        enemySpeed: 1.25,
        spawnRate: 0.75
    }
};

const DEFAULT_GAME_SETTINGS = {
    sound: true,
    music: true,
    vibration: true,
    difficulty: "normal"
};

let gameSettings = { ...DEFAULT_GAME_SETTINGS };


function loadGameSettings() {

    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) {
            gameSettings = { ...DEFAULT_GAME_SETTINGS };
            return gameSettings;
        }

        const parsed = JSON.parse(raw);

        gameSettings = {
            sound: typeof parsed.sound === "boolean" ? parsed.sound : true,
            music: typeof parsed.music === "boolean" ? parsed.music : true,
            vibration: typeof parsed.vibration === "boolean" ? parsed.vibration : true,
            difficulty: ["easy", "normal", "hard"].includes(parsed.difficulty)
                ? parsed.difficulty
                : "normal"
        };
    } catch (e) {
        gameSettings = { ...DEFAULT_GAME_SETTINGS };
    }

    return gameSettings;

}


function getDifficultyMult() {

    return DIFFICULTY_MULTIPLIERS[gameSettings.difficulty]
        || DIFFICULTY_MULTIPLIERS.normal;

}


function baseSpawnInterval(level) {

    return Math.max(
        280,
        900 - (level - 1) * 55
    );

}


function getSpawnIntervalForLevel(level) {

    const mult = getDifficultyMult();

    let interval = Math.max(
        260,
        baseSpawnInterval(level) * mult.spawnRate
    );

    if (PERF.isMobile) {
        interval *= 1.25;
    }

    if (game.mode === "adventure") {
        interval *= 1.15;
    }

    return interval;

}


function triggerVibration(pattern) {

    if (!gameSettings.vibration) {
        return;
    }

    if (
        typeof navigator !== "undefined" &&
        typeof navigator.vibrate === "function"
    ) {
        try {
            navigator.vibrate(pattern);
        } catch (e) {
            // silent
        }
    }

}


/* ================================================================
   AUDIO (Web Audio — no external files required)
================================================================ */

let audioCtx = null;
let musicNodes = null;


function ensureAudioContext() {

    if (audioCtx) {
        return audioCtx;
    }

    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) {
        return null;
    }

    audioCtx = new AC();
    return audioCtx;

}


function resumeAudioIfNeeded() {

    const ctx = ensureAudioContext();
    if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(function () {});
    }

}


function playTone(freq, duration, type, volume) {

    if (!gameSettings.sound) {
        return;
    }

    const ctx = ensureAudioContext();
    if (!ctx) {
        return;
    }

    resumeAudioIfNeeded();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type || "square";
    osc.frequency.value = freq;

    const now = ctx.currentTime;
    const vol = volume == null ? 0.08 : volume;

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + duration
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);

}


function playSound(name) {

    if (!gameSettings.sound) {
        return;
    }

    if (name === "shoot") {
        playTone(880, 0.06, "square", 0.05);
        return;
    }

    if (name === "hit") {
        playTone(220, 0.08, "sawtooth", 0.06);
        return;
    }

    if (name === "explosion") {
        playTone(90, 0.25, "sawtooth", 0.1);
        playTone(55, 0.3, "triangle", 0.08);
        return;
    }

    if (name === "damage") {
        playTone(120, 0.2, "square", 0.1);
        playTone(80, 0.25, "sawtooth", 0.08);
        return;
    }

    if (name === "level") {
        playTone(523, 0.12, "triangle", 0.08);
        setTimeout(function () {
            playTone(659, 0.12, "triangle", 0.08);
        }, 100);
        setTimeout(function () {
            playTone(784, 0.18, "triangle", 0.09);
        }, 200);
        return;
    }

    if (name === "gameover") {
        playTone(200, 0.3, "sawtooth", 0.1);
        setTimeout(function () {
            playTone(120, 0.4, "triangle", 0.1);
        }, 200);
    }

}


function startMusic() {

    if (!gameSettings.music) {
        stopMusic();
        return;
    }

    const ctx = ensureAudioContext();
    if (!ctx) {
        return;
    }

    resumeAudioIfNeeded();

    if (musicNodes) {
        return;
    }

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.value = 55;
    osc2.frequency.value = 82.5;

    filter.type = "lowpass";
    filter.frequency.value = 180;

    gain.gain.value = 0.025;

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();

    musicNodes = { osc1: osc1, osc2: osc2, gain: gain, filter: filter };

}


function stopMusic() {

    if (!musicNodes) {
        return;
    }

    try {
        musicNodes.osc1.stop();
        musicNodes.osc2.stop();
    } catch (e) {
        // silent
    }

    musicNodes = null;

}


function syncAudioWithSettings() {

    if (gameSettings.music && game.running && !game.paused && !game.gameOver) {
        startMusic();
    } else {
        stopMusic();
    }

}


/* ================================================================
   PLAYER
================================================================ */

const player = {

    x: 0,

    y: 0,

    width: 42,

    height: 54,

    speed: 390,

    baseSpeed: 390,

    maxHealth: 3,

    health: 3,

    fireCooldown: 0,

    fireRate: 165,

    baseFireRate: 165,

    invulnerable: 0,
    canShoot: true,

    visible: true,

    canControl: true,

    shields: 0,

    doubleCannon: false,
    specialShield: 0,
    specialShieldMax: 0,
    specialShieldRegenSec: 60,
    specialShieldTimer: 0,
    specialAgility: false,
    specialBulletColor: null,
    specialLaserChance: 0,
    shipSprite: null,
    specialShip: false,

    hasHelper: false,

    thrustAnimation: 0

};


/* Helper drone */
const helper = {
    active: false,
    x: 0,
    y: 0,
    fireCooldown: 0,
    orbit: 0
};


/* ================================================================
   INPUT
================================================================ */

const keyboard = {

    left: false,

    right: false,

    up: false,

    down: false,

    fire: false

};


const touchInput = {

    x: 0,

    y: 0,

    active: false,

    fire: false

};


/* ================================================================
   GAME ARRAYS
================================================================ */

const playerProjectiles = [];

const enemyProjectiles = [];

const enemies = [];
const asteroids = [];


const particles = [];


/* ================================================================
   PERFORMANCE
================================================================ */

const shipSprites = {};
function loadShipSprite(id, srcList) {
    if (!id) return;
    if (shipSprites[id] && (shipSprites[id].ready || shipSprites[id]._trying)) return;
    var paths = Array.isArray(srcList) ? srcList : [srcList];
    var img = new Image();
    img.ready = false;
    img._trying = true;
    img._paths = paths.slice();
    img._i = 0;
    function tryNext() {
        if (img._i >= img._paths.length) {
            img.failed = true;
            img._trying = false;
            console.warn("[ShipSprite] failed all paths for", id, paths);
            return;
        }
        var p = img._paths[img._i++];
        img.onload = function () {
            img.ready = true;
            img._trying = false;
            console.log("[ShipSprite] loaded", id, p);
        };
        img.onerror = function () { tryNext(); };
        img.src = p;
    }
    shipSprites[id] = img;
    tryNext();
}
/* Try several relative paths (localhost / netlify / nested) */
loadShipSprite("nebula", [
    "../img/texturas-especiales/nave-especial.png",
    "../img/ships/nebula.png",
    "img/texturas-especiales/nave-especial.png",
    "img/ships/nebula.png",
    "/img/texturas-especiales/nave-especial.png",
    "/img/ships/nebula.png"
]);
loadShipSprite("overlord", [
    "../img/bosses/overlord.png",
    "img/bosses/overlord.png",
    "/img/bosses/overlord.png"
]);

const PERF = {
    isMobile:
        (typeof navigator !== "undefined" &&
            /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) ||
        (typeof window !== "undefined" && window.innerWidth < 900),
    maxParticles: 0,
    maxEnemies: 0,
    starCount: 0,
    explosionScale: 1
};

if (window.SpaceStrikeGraphics && window.SpaceStrikeGraphics.applyToPerf) {
    window.SpaceStrikeGraphics.applyToPerf(PERF);
} else {
    PERF.starCount = PERF.isMobile ? 55 : 110;
    PERF.maxParticles = PERF.isMobile ? 55 : 120;
    PERF.maxEnemies = PERF.isMobile ? 10 : 18;
    PERF.explosionScale = PERF.isMobile ? 0.45 : 1;
    PERF.shadows = !PERF.isMobile;
    PERF.shipDetail = PERF.isMobile ? 1 : 2;
}


/* ================================================================
   FPS COUNTER
================================================================ */

const fpsState = {
    frames: 0,
    lastSample: 0,
    value: 60
};


/* ================================================================
   BACKGROUND STARS
================================================================ */

const stars = [];

const STAR_COUNT = PERF.starCount;


/* ================================================================
   UTILITY
================================================================ */

function random(min, max) {

    return Math.random() * (max - min) + min;

}


function randomInteger(min, max) {

    return Math.floor(
        random(min, max + 1)
    );

}


function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );

}


/* ================================================================
   NUMBER FORMATTING
================================================================ */

function formatNumber(value, digits = 4) {

    return String(
        Math.max(0, Math.floor(value))
    ).padStart(
        digits,
        "0"
    );

}


/* ================================================================
   CANVAS RESIZE
================================================================ */

function resizeCanvas() {

    const rect =
        canvas.getBoundingClientRect();

    deviceScale =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    canvasWidth = rect.width;
    canvasHeight = rect.height;

    canvas.width =
        Math.floor(
            canvasWidth * deviceScale
        );

    canvas.height =
        Math.floor(
            canvasHeight * deviceScale
        );

    ctx.setTransform(
        deviceScale,
        0,
        0,
        deviceScale,
        0,
        0
    );

    player.x =
        clamp(
            player.x || canvasWidth / 2,
            player.width / 2,
            canvasWidth - player.width / 2
        );

    player.y =
        clamp(
            player.y || canvasHeight * 0.82,
            player.height / 2,
            canvasHeight - player.height / 2
        );

}


/* ================================================================
   BACKGROUND STARS
================================================================ */

function initializeStars() {

    stars.length = 0;

    for (let i = 0; i < STAR_COUNT; i++) {

        stars.push({

            x: Math.random(),

            y: Math.random(),

            size: random(0.5, 2.2),

            speed: random(15, 65),

            alpha: random(0.15, 0.9),

            twinkle:
                random(
                    0,
                    Math.PI * 2
                )

        });

    }

}


function updateStars(deltaTime) {

    for (const star of stars) {

        star.y +=
            (
                star.speed *
                deltaTime
            ) / canvasHeight;

        star.twinkle +=
            deltaTime * 2;

        if (star.y > 1.05) {

            star.y = -0.02;

            star.x = Math.random();

        }

    }

}


function drawStars() {

    for (const star of stars) {

        const pulse =
            (
                Math.sin(star.twinkle) + 1
            ) / 2;

        const alpha =
            star.alpha *
            (0.55 + pulse * 0.45);

        ctx.fillStyle =
            `rgba(180,220,255,${alpha})`;

        ctx.fillRect(

            star.x * canvasWidth,

            star.y * canvasHeight,

            star.size,

            star.size

        );

    }

}


/* ================================================================
   PLAYER RESET
================================================================ */

function resetPlayer() {

    player.x =
        canvasWidth / 2;

    player.y =
        canvasHeight * 0.82;

    player.health =
        player.maxHealth;

    player.fireCooldown = 0;

    player.invulnerable = 0;
    player.canShoot = true;
    player.visible = true;

    player.canControl = true;

    if (player.hasHelper) {
        helper.active = true;
        helper.x = player.x + 50;
        helper.y = player.y;
        helper.fireCooldown = 0;
        helper.orbit = 0;
    } else {
        helper.active = false;
    }

}


function applyOwnedUpgrades() {

    /* Defaults */
    player.doubleCannon = false;
    player.multiShot = false;
    player.pierce = false;
    player.hasHelper = false;
    player.bulletDamage = 1;
    player.coinBonus = 1;
    player.shields = 0;
    player.baseFireRate = 165;
    player.baseSpeed = 390;
    player.maxHealth = 3;
    player.shipDamageBonus = 0;
    player.shipColor = "#6ebcf0";
    player.shipAccent = "#e9f7ff";

    /* Ship base stats first */
    if (window.SpaceStrikeShips && typeof window.SpaceStrikeShips.applyToPlayer === "function") {
        window.SpaceStrikeShips.applyToPlayer(player);
        player.maxHealth = player.shipMaxHealth || 3;
        player.fireRate = player.baseFireRate;
        player.speed = player.baseSpeed;
        player.bulletDamage = 1 + (player.shipDamageBonus || 0);
    } else {
        /* Fallback: read equipped ship id from storage */
        try {
            var eq = localStorage.getItem("spaceStrikeEquippedShip") || "interceptor";
            player.shipId = eq;
            if (eq === "nebula") {
                player.specialShip = true;
                player.shipColor = "#7b6cff";
                player.shipAccent = "#c4b5ff";
                player.baseSpeed = 480;
                player.baseFireRate = 140;
                player.shipMaxHealth = 3;
                player.specialStats = { doubleCannon: true, agility: true, shieldMax: 3, shieldRegenSec: 60, bulletColor: "#ff3b4a", laserChance: 0.1 };
            }
        } catch (e) {}
        player.fireRate = player.baseFireRate || 165;
        player.speed = player.baseSpeed || 390;
    }
    /* Always re-read shipId so texture matches equipped */
    try {
        if (window.SpaceStrikeShips && window.SpaceStrikeShips.getEquippedId) {
            player.shipId = window.SpaceStrikeShips.getEquippedId();
        } else {
            player.shipId = localStorage.getItem("spaceStrikeEquippedShip") || player.shipId || "interceptor";
        }
    } catch (e2) {}
    if (player.shipId === "nebula" || player.specialShip) {
        player.specialShip = true;
        if (!player.specialStats) {
            player.specialStats = { doubleCannon: true, agility: true, shieldMax: 3, shieldRegenSec: 60, bulletColor: "#ff3b4a", laserChance: 0.1 };
        }
        if (typeof loadShipSprite === "function") {
            loadShipSprite("nebula", [
                "../img/texturas-especiales/nave-especial.png",
                "../img/ships/nebula.png",
                "img/texturas-especiales/nave-especial.png",
                "img/ships/nebula.png"
            ]);
        }
    }

    /* Then stack purchased upgrades on top of ship */
    if (
        window.SpaceStrikeUpgrades &&
        typeof window.SpaceStrikeUpgrades.applyToPlayer === "function"
    ) {
        var u = window.SpaceStrikeUpgrades.loadUpgrades();
        /* Manual merge so ship bases are not wiped */
        player.fireRate = Math.max(70, (player.baseFireRate || 165) - (u.fireRate || 0) * 18);
        player.speed = (player.baseSpeed || 390) + (u.moveSpeed || 0) * 35;
        player.maxHealth = (player.shipMaxHealth || 3) + (u.resistance || 0);
        player.shields = Math.max(0, Number(u.shield) || 0);
        player.doubleCannon = Number(u.doubleCannon) > 0;
        player.hasHelper = Number(u.helper) > 0;
        player.pierce = Number(u.pierce) > 0;
        player.multiShot = Number(u.multiShot) > 0;
        player.bulletDamage = 1 + (player.shipDamageBonus || 0) + Math.max(0, Number(u.damage) || 0);
        player.coinBonus = 1 + Math.max(0, Number(u.magnet) || 0) * 0.08;
    }

    /* NEBULA special: fixed traits (no stack beyond ship) */
    if (player.specialShip && player.specialStats) {
        player.doubleCannon = true;
        player.specialAgility = true;
        player.speed = Math.max(player.speed || 0, player.baseSpeed || 480);
        player.specialShieldMax = player.specialStats.shieldMax || 3;
        player.specialShieldRegenSec = player.specialStats.shieldRegenSec || 60;
        if (typeof player.specialShield !== "number" || player.specialShield < 0) {
            player.specialShield = player.specialShieldMax;
        }
        if (player.specialShield > player.specialShieldMax) {
            player.specialShield = player.specialShieldMax;
        }
        player.specialBulletColor = player.specialStats.bulletColor || "#ff3b4a";
        player.specialLaserChance = player.specialStats.laserChance || 0.1;
    } else {
        player.specialShield = 0;
        player.specialShieldMax = 0;
        player.specialShieldTimer = 0;
    }

}


/* ================================================================
   PLAYER INPUT DIRECTION
================================================================ */

function getHorizontalInput() {

    let value = 0;

    if (keyboard.left) {

        value -= 1;

    }

    if (keyboard.right) {

        value += 1;

    }

    if (touchInput.active) {

        value += touchInput.x;

    }

    return clamp(
        value,
        -1,
        1
    );

}


function getVerticalInput() {

    let value = 0;

    if (keyboard.up) {

        value -= 1;

    }

    if (keyboard.down) {

        value += 1;

    }

    if (touchInput.active) {

        value += touchInput.y;

    }

    return clamp(
        value,
        -1,
        1
    );

}


/* ================================================================
   PLAYER UPDATE
================================================================ */

function updatePlayer(deltaTime) {

    /*
        Tras perder una vida: sin control ni disparo
        hasta reaparecer.
    */

    if (player.invulnerable > 0) {

        player.invulnerable -=
            deltaTime;

        if (player.invulnerable <= 0) {

            player.invulnerable = 0;
            player.visible = true;
            player.canControl = true;
            player.canShoot = true;

        }

    }


    if (player.canControl && player.visible) {

        const horizontal =
            getHorizontalInput();

        const vertical =
            getVerticalInput();

        const movementLength =
            Math.hypot(
                horizontal,
                vertical
            );

        let moveX = horizontal;
        let moveY = vertical;

        if (movementLength > 1) {

            moveX /= movementLength;
            moveY /= movementLength;

        }

        player.x +=
            moveX *
            player.speed *
            deltaTime;

        player.y +=
            moveY *
            player.speed *
            deltaTime;

        player.x =
            clamp(
                player.x,
                player.width / 2,
                canvasWidth - player.width / 2
            );

        player.y =
            clamp(
                player.y,
                player.height / 2 + 70,
                canvasHeight - player.height / 2
            );

        player.thrustAnimation +=
            deltaTime * 15;

        player.fireCooldown -=
            deltaTime * 1000;

        if (
            keyboard.fire ||
            touchInput.fire
        ) {

            attemptPlayerFire();

        }

    } else {

        player.fireCooldown -=
            deltaTime * 1000;

    }


    updateHelper(deltaTime);

}


function updateHelper(deltaTime) {

    if (!helper.active || !player.hasHelper) {
        return;
    }

    if (!game.running || game.paused || game.gameOver) {
        return;
    }

    helper.orbit += deltaTime * 2.2;

    const targetX = player.x + Math.cos(helper.orbit) * 48;
    const targetY = player.y + Math.sin(helper.orbit) * 28 - 10;

    helper.x += (targetX - helper.x) * Math.min(1, deltaTime * 6);
    helper.y += (targetY - helper.y) * Math.min(1, deltaTime * 6);

    helper.fireCooldown -= deltaTime * 1000;

    if (
        helper.fireCooldown <= 0 &&
        player.visible &&
        enemies.length > 0
    ) {

        let nearest = null;
        let best = Infinity;

        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            const d =
                (e.x - helper.x) * (e.x - helper.x) +
                (e.y - helper.y) * (e.y - helper.y);
            if (d < best) {
                best = d;
                nearest = e;
            }
        }

        if (nearest) {
            helper.fireCooldown = 280;
            playerProjectiles.push({
                x: helper.x,
                y: helper.y,
                radius: 2.5,
                speed: 700,
                damage: 1,
                fromHelper: true
            });
        }

    }

}


function drawHelper() {

    if (!helper.active || !player.hasHelper) {
        return;
    }

    if (!player.visible && player.invulnerable > 0) {
        /* helper stays visible */
    }

    ctx.save();
    ctx.translate(helper.x, helper.y);
    ctx.fillStyle = "#7ef0c8";
    ctx.shadowBlur = 12;
    ctx.shadowColor = "rgba(80,255,200,0.7)";
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(8, 8);
    ctx.lineTo(0, 4);
    ctx.lineTo(-8, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

}


/* ================================================================
   PLAYER DRAW
================================================================ */


/* Ship visual evolution by progress (wave / adventure level) */
function getShipEvolutionStage() {
    var n = 1;
    if (game.mode === "adventure") n = game.adventureLevel || 1;
    else n = game.level || 1;
    if (n >= 60) return 4;
    if (n >= 30) return 3;
    if (n >= 12) return 2;
    return 1;
}

function drawShipModel(ctx, sid, player) {
    var accent = player.shipAccent || "#e9f7ff";
    var color = player.shipColor || "#6ebcf0";
    var g = ctx.createLinearGradient(0, -28, 0, 28);
    g.addColorStop(0, accent);
    g.addColorStop(0.4, color);
    g.addColorStop(1, "#12385c");
    ctx.fillStyle = g;
    ctx.beginPath();
    if (sid === "tank") {
        ctx.moveTo(0, -22); ctx.lineTo(18, 8); ctx.lineTo(16, 24); ctx.lineTo(-16, 24); ctx.lineTo(-18, 8);
    } else if (sid === "spectre") {
        ctx.moveTo(0, -32); ctx.lineTo(10, 6); ctx.lineTo(22, 18); ctx.lineTo(4, 14); ctx.lineTo(0, 20); ctx.lineTo(-4, 14); ctx.lineTo(-22, 18); ctx.lineTo(-10, 6);
    } else if (sid === "destroyer") {
        ctx.moveTo(0, -26); ctx.lineTo(16, 4); ctx.lineTo(20, 22); ctx.lineTo(8, 18); ctx.lineTo(0, 26); ctx.lineTo(-8, 18); ctx.lineTo(-20, 22); ctx.lineTo(-16, 4);
    } else if (sid === "assault") {
        ctx.moveTo(0, -28); ctx.lineTo(14, 8); ctx.lineTo(18, 22); ctx.lineTo(0, 16); ctx.lineTo(-18, 22); ctx.lineTo(-14, 8);
    } else if (sid === "phoenix") {
        ctx.moveTo(0, -30); ctx.lineTo(12, 0); ctx.lineTo(24, 16); ctx.lineTo(8, 12); ctx.lineTo(0, 22); ctx.lineTo(-8, 12); ctx.lineTo(-24, 16); ctx.lineTo(-12, 0);
    } else if (sid === "voidrunner") {
        ctx.moveTo(0, -34); ctx.lineTo(8, 4); ctx.lineTo(16, 20); ctx.lineTo(0, 12); ctx.lineTo(-16, 20); ctx.lineTo(-8, 4);
    } else if (sid === "nebula") {
        /* Wide V-wing exclusive silhouette (fallback if PNG missing) */
        ctx.moveTo(0, -18);
        ctx.lineTo(28, -14);
        ctx.lineTo(34, 4);
        ctx.lineTo(30, 14);
        ctx.lineTo(12, 16);
        ctx.lineTo(8, 24);
        ctx.lineTo(0, 28);
        ctx.lineTo(-8, 24);
        ctx.lineTo(-12, 16);
        ctx.lineTo(-30, 14);
        ctx.lineTo(-34, 4);
        ctx.lineTo(-28, -14);
    } else {
        ctx.moveTo(0, -28); ctx.lineTo(13, 10); ctx.lineTo(20, 23); ctx.lineTo(7, 19); ctx.lineTo(0, 25); ctx.lineTo(-7, 19); ctx.lineTo(-20, 23); ctx.lineTo(-13, 10);
    }
    ctx.closePath();
    ctx.fill();
}

function drawPlayer() {

    var evoStage = getShipEvolutionStage();


    if (!player.visible) {

        return;

    }

    const x = player.x;
    const y = player.y;

    const flicker =
        player.invulnerable > 0 &&
        Math.floor(
            player.invulnerable * 15
        ) % 2 === 0;

    if (flicker) {

        return;

    }


    ctx.save();

    ctx.translate(x, y);

    /* Textured ships (NEBULA + futuras) */
    var sidTex = player.shipId || "interceptor";
    var spr = (typeof shipSprites !== "undefined") ? shipSprites[sidTex] : null;
    if (spr && spr.ready) {
        var sw = player.width * 1.55;
        var sh = player.height * 1.75;
        ctx.drawImage(spr, -sw / 2, -sh / 2, sw, sh);
        if (player.specialShield > 0) {
            ctx.strokeStyle = "rgba(120,180,255," + (0.25 + (player.specialShield || 0) * 0.15) + ")";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, sh * 0.42, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
        return;
    }


    /* ============================================================
       ENGINE FLAME
    ========================================================== */

    const flameSize =
        13 +
        Math.sin(
            player.thrustAnimation
        ) * 4;


    const flameGradient =
        ctx.createLinearGradient(
            0,
            player.height * 0.30,
            0,
            player.height * 0.75
        );

    flameGradient.addColorStop(
        0,
        "rgba(100,210,255,0.9)"
    );

    flameGradient.addColorStop(
        1,
        "rgba(0,70,180,0)"
    );


    ctx.fillStyle =
        flameGradient;


    ctx.beginPath();

    ctx.moveTo(
        -8,
        20
    );

    ctx.lineTo(
        0,
        20 + flameSize
    );

    ctx.lineTo(
        8,
        20
    );

    ctx.closePath();

    ctx.fill();


    /* ============================================================
       SHIP GLOW
    ========================================================== */

    if (PERF.shadows !== false) {
        ctx.shadowBlur = 18;
        ctx.shadowColor = evoStage >= 3
            ? "rgba(255,140,60,0.75)"
            : evoStage >= 2
                ? "rgba(160,100,255,0.7)"
                : "rgba(30,160,255,0.7)";
    } else {
        ctx.shadowBlur = 0;
    }


    /* ============================================================
       MAIN SHIP
    ========================================================== */

    const bodyGradient =
        ctx.createLinearGradient(
            0,
            -28,
            0,
            28
        );

    bodyGradient.addColorStop(
        0,
        player.shipAccent || "#e9f7ff"
    );

    bodyGradient.addColorStop(
        0.35,
        player.shipColor || "#6ebcf0"
    );

    bodyGradient.addColorStop(
        1,
        "#12385c"
    );


    /* Per-ship vector model */
    drawShipModel(ctx, player.shipId || "interceptor", player);


    /* ============================================================
       COCKPIT
    ========================================================== */

    ctx.shadowBlur = 8;

    ctx.shadowColor =
        "rgba(100,220,255,0.9)";


    ctx.fillStyle =
        "#081a2d";


    ctx.beginPath();

    ctx.moveTo(
        0,
        -18
    );

    ctx.lineTo(
        7,
        3
    );

    ctx.lineTo(
        0,
        9
    );

    ctx.lineTo(
        -7,
        3
    );

    ctx.closePath();

    ctx.fill();


    ctx.strokeStyle =
        "rgba(150,225,255,0.85)";

    ctx.lineWidth = 1;

    ctx.stroke();


    /* ============================================================
       WINGS
    ========================================================== */

    ctx.shadowBlur = 0;

    ctx.strokeStyle =
        "rgba(150,220,255,0.5)";

    ctx.beginPath();

    ctx.moveTo(
        -13,
        9
    );

    ctx.lineTo(
        -21,
        20
    );

    ctx.moveTo(
        13,
        9
    );

    ctx.lineTo(
        21,
        20
    );

    ctx.stroke();


    ctx.restore();

}


/* ================================================================
   PLAYER FIRE
================================================================ */

function attemptPlayerFire() {

    if (!game.running) {

        return;

    }

    if (game.paused) {

        return;

    }

    if (game.gameOver) {

        return;

    }

    if (game.levelTransition) {

        return;

    }

    /*
        No disparar mientras la nave está oculta
        (invulnerabilidad tras perder una vida).
    */

    if (!player.visible || !player.canControl || player.canShoot === false) {

        return;

    }

    if (player.fireCooldown > 0) {

        return;

    }


    player.fireCooldown =
        player.fireRate;


    const muzzleY =
        player.y -
        player.height / 2;

    /*
        Solo se aplican mejoras realmente compradas.
        Cañón doble + ráfaga pueden coexistir.
    */
    const dmg = Math.max(1, player.bulletDamage || 1);
    const pierce = player.pierce === true;
    const useDouble = player.doubleCannon === true;
    const useMulti = player.multiShot === true;

    const isLaser = player.specialShip && Math.random() < (player.specialLaserChance || 0);
    const bColor = player.specialBulletColor || null;

    function pushShot(ox, vx, laser) {
        playerProjectiles.push({
            x: player.x + (ox || 0),
            y: muzzleY,
            radius: laser ? 2 : 3,
            speed: laser ? 1100 : 760,
            damage: laser ? dmg + 1 : dmg,
            pierce: laser ? true : pierce,
            vx: vx || 0,
            color: laser ? "#ff6b9d" : bColor,
            laser: !!laser
        });
    }

    /* Nave especial: siempre doble cañón en alas */
    const forceDouble = player.specialShip === true;
    const doubleOn = useDouble || forceDouble;

    if (doubleOn && useMulti) {
        pushShot(-14, -70, isLaser);
        pushShot(-6, -20, isLaser);
        pushShot(6, 20, isLaser);
        pushShot(14, 70, isLaser);
        createMuzzleParticles(player.x - 10, player.y - 27);
        createMuzzleParticles(player.x + 10, player.y - 27);
    } else if (useMulti) {
        pushShot(0, 0, isLaser);
        pushShot(-12, -80, isLaser);
        pushShot(12, 80, isLaser);
        createMuzzleParticles(player.x, player.y - 27);
    } else if (doubleOn) {
        pushShot(-16, 0, isLaser);
        pushShot(16, 0, isLaser);
        createMuzzleParticles(player.x - 16, player.y - 27);
        createMuzzleParticles(player.x + 16, player.y - 27);
    } else {
        pushShot(0, 0, isLaser);
        createMuzzleParticles(player.x, player.y - 27);
    }

    game.shotsFired = (game.shotsFired || 0) + 1;
    playSound("shoot");

}


/* ================================================================
   PLAYER PROJECTILES
================================================================ */

function updatePlayerProjectiles(deltaTime) {

    for (
        let i = playerProjectiles.length - 1;
        i >= 0;
        i--
    ) {

        const projectile =
            playerProjectiles[i];


        projectile.y -=
            projectile.speed *
            deltaTime;

        if (projectile.vx) {
            projectile.x += projectile.vx * deltaTime;
        }


        if (
            projectile.y <
            -20 ||
            projectile.x < -40 ||
            projectile.x > canvasWidth + 40
        ) {

            playerProjectiles.splice(
                i,
                1
            );

        }

    }

}


function drawPlayerProjectiles() {

    for (
        const projectile
        of playerProjectiles
    ) {

        ctx.save();

        ctx.shadowBlur = 15;

        var col = projectile.color || "#8edcff";
        ctx.shadowColor = projectile.laser
            ? "rgba(255,80,120,0.95)"
            : (projectile.color ? "rgba(255,60,80,0.85)" : "rgba(50,190,255,0.9)");
        ctx.fillStyle = col;

        if (projectile.laser) {
            ctx.fillRect(projectile.x - 1.5, projectile.y - 10, 3, 18);
        } else {
            ctx.beginPath();
            ctx.arc(
                projectile.x,
                projectile.y,
                projectile.radius,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }


        ctx.restore();

    }

}


/* ================================================================
   ENEMY TYPES
================================================================ */

const enemyTypes = {

    basic: {

        width: 38,

        height: 32,

        health: 1,

        speed: 90,

        points: 100,

        shoot: false

    },


    fast: {

        width: 30,

        height: 27,

        health: 1,

        speed: 180,

        points: 150,

        shoot: false

    },


    shooter: {

        width: 44,

        height: 38,

        health: 2,

        speed: 75,

        points: 200,

        shoot: true

    },


    elite: {

        width: 54,

        height: 45,

        health: 4,

        speed: 60,

        points: 500,

        shoot: true

    },


    tank: {

        width: 52,

        height: 42,

        health: 6,

        speed: 48,

        points: 350,

        shoot: false

    },


    boss: {

        width: 128,

        height: 110,

        health: 100,

        speed: 28,

        points: 5000,

        shoot: true

    }

};


/* ================================================================
   ENEMY TYPE SELECTION
================================================================ */

function selectEnemyType() {

    if (game.mode === "adventure") {

        const def = getAdventureLevelDef(game.adventureLevel);
        const allowed = (def && def.allowedTypes) || ["basic"];
        const roll = Math.random();

        if (allowed.length === 1) {
            return allowed[0];
        }

        /* Weighted toward earlier types */
        const idx = Math.min(
            allowed.length - 1,
            Math.floor(roll * allowed.length)
        );

        return allowed[idx];

    }

    const roll = Math.random();

    if (game.level >= 8 && roll < 0.07) {
        return "elite";
    }

    if (game.level >= 6 && roll < 0.18) {
        return "tank";
    }

    if (game.level >= 3 && roll < 0.32) {
        return "shooter";
    }

    if (game.level >= 2 && roll < 0.55) {
        return "fast";
    }

    return "basic";

}


/* ================================================================
   SPAWN ENEMY
================================================================ */

function spawnEnemy() {

    if (game.bossActive) {
        return;
    }

    if (game.waveSpawned >= game.waveSpawnQuota) {
        return;
    }

    if (enemies.length >= PERF.maxEnemies) {
        return;
    }

    const typeName =
        selectEnemyType();

    const type =
        enemyTypes[typeName];

    const wave = getWaveNumber();
    const hpScale = getEnemyHpScale(wave);
    const hp = Math.max(1, Math.ceil(type.health * hpScale));

    const enemy = {

        type: typeName,

        x:
            random(
                type.width,
                canvasWidth - type.width
            ),

        y:
            -type.height,

        width:
            type.width,

        height:
            type.height,

        health: hp,

        maxHealth: hp,

        speed:
            type.speed *
            (
                1 +
                (wave - 1) * (game.mode === "adventure" ? 0.025 : 0.04)
            ) *
            getDifficultyMult().enemySpeed *
            (game.mode === "adventure" ? 0.88 : 1),

        points:
            type.points + Math.floor(wave * 5),

        shoot:
            type.shoot,

        shootCooldown:
            random(
                700,
                2200
            ),

        wave:
            random(
                0,
                Math.PI * 2
            ),

        waveSpeed:
            random(
                1.5,
                3.5
            ),

        age: 0

    };


    enemies.push(enemy);
    game.waveSpawned++;

}


/* ================================================================
   ENEMY UPDATE
================================================================ */

function updateEnemies(deltaTime) {

    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {

        const enemy =
            enemies[i];


        enemy.age +=
            deltaTime;


        if (enemy.frozen && enemy.frozen > 0) {
            enemy.frozen -= deltaTime;
        } else {
            enemy.y +=
            enemy.speed *
            deltaTime;
        }


        /*
            Basic horizontal movement
            for some enemies.
        */

        if (
            enemy.type === "fast" ||
            enemy.type === "shooter"
        ) {

            enemy.x +=
                Math.sin(
                    enemy.age *
                    enemy.waveSpeed +
                    enemy.wave
                ) *
                45 *
                deltaTime;

        }


        enemy.x =
            clamp(
                enemy.x,
                enemy.width / 2,
                canvasWidth -
                enemy.width / 2
            );


        /*
            Shooting.
        */

        if (enemy.shoot) {

            enemy.shootCooldown -=
                deltaTime * 1000;


            if (
                enemy.shootCooldown <= 0 &&
                enemy.y > 20 &&
                enemy.y < canvasHeight * 0.70
            ) {

                enemyFire(enemy);

                if (enemy.isBoss && enemy.bossPhase >= 2) {
                    enemy.shootCooldown = random(220, 380);
                } else if (enemy.isBoss) {
                    enemy.shootCooldown = random(450, 700);
                } else {
                    enemy.shootCooldown =
                        random(
                            900,
                            Math.max(
                                1200,
                                2300 -
                                game.level * 60
                            )
                        );
                }

            }

        }


        /*
            Enemy leaves the screen.
        */

        if (
            enemy.y >
            canvasHeight +
            enemy.height
        ) {

            enemies.splice(
                i,
                1
            );

            /* Allow replacement spawn so the wave stays completable */
            if (!enemy.isBoss) {
                game.waveSpawned = Math.max(0, game.waveSpawned - 1);
            }

            continue;

        }


        /*
            Enemy collides with player.
        */

        if (
            player.visible &&
            player.invulnerable <= 0 &&
            player.canControl &&
            checkCollision(
                player,
                enemy
            )
        ) {

            damagePlayer();

            const wasBoss = !!enemy.isBoss;
            destroyEnemy(
                i,
                false
            );

            if (!wasBoss) {
                game.waveSpawned = Math.max(0, game.waveSpawned - 1);
            }

        }

    }

}


/* ================================================================
   DRAW ENEMIES
================================================================ */

function drawEnemies() {

    for (
        const enemy
        of enemies
    ) {

        drawEnemy(enemy);

    }

}


function drawEnemy(enemy) {

    const x = enemy.x;
    const y = enemy.y;

    ctx.save();

    ctx.translate(
        x,
        y
    );

    /* BOSS sprite (Overlord) */
    if (enemy.isBoss || enemy.type === "boss") {
        var bspr = (typeof shipSprites !== "undefined") ? shipSprites[enemy.spriteId || "overlord"] : null;
        if (bspr && bspr.ready && bspr.naturalWidth) {
            var bw = enemy.width;
            var bh = enemy.height;
            ctx.shadowBlur = 20;
            ctx.shadowColor = enemy.bossPhase >= 2 ? "#ff3344" : "#3388ff";
            /* nose toward player (down on screen) — art is nose-down already */
            ctx.drawImage(bspr, -bw / 2, -bh / 2, bw, bh);
            /* HP bar */
            var barW = bw * 0.9;
            var hpRatio = clamp(enemy.health / Math.max(1, enemy.maxHealth), 0, 1);
            ctx.shadowBlur = 0;
            ctx.fillStyle = "rgba(0,0,0,0.55)";
            ctx.fillRect(-barW / 2, -bh / 2 - 14, barW, 6);
            ctx.fillStyle = hpRatio > 0.5 ? "#35aaff" : (hpRatio > 0.25 ? "#ffcc44" : "#ff4466");
            ctx.fillRect(-barW / 2, -bh / 2 - 14, barW * hpRatio, 6);
            ctx.restore();
            return;
        }
    }

    /*
        Color by enemy type.
    */

    let primary =
        "#b8c7d8";

    let secondary =
        "#263c50";


    if (enemy.type === "fast") {

        primary =
            "#d9c3ff";

        secondary =
            "#4c276f";

    }


    if (enemy.type === "shooter") {

        primary =
            "#ffb6b6";

        secondary =
            "#662b35";

    }


    if (enemy.type === "elite") {

        primary =
            "#ffd28c";

        secondary =
            "#6b3e18";

    }


    if (enemy.type === "tank") {

        primary =
            "#9ad0a8";

        secondary =
            "#1e3d28";

    }


    if (enemy.type === "boss") {

        primary =
            "#ff6b6b";

        secondary =
            "#4a0a0a";

        ctx.shadowBlur = 28;

    }


    ctx.shadowBlur = enemy.type === "boss" ? 28 : 14;

    ctx.shadowColor =
        primary;


    /*
        Main body.
    */

    const gradient =
        ctx.createLinearGradient(
            0,
            -enemy.height / 2,
            0,
            enemy.height / 2
        );


    gradient.addColorStop(
        0,
        primary
    );

    gradient.addColorStop(
        1,
        secondary
    );


    ctx.fillStyle =
        gradient;


    ctx.beginPath();

    ctx.moveTo(
        0,
        enemy.height / 2
    );

    ctx.lineTo(
        enemy.width / 2,
        -enemy.height / 4
    );

    ctx.lineTo(
        enemy.width / 4,
        -enemy.height / 2
    );

    ctx.lineTo(
        0,
        -enemy.height / 3
    );

    ctx.lineTo(
        -enemy.width / 4,
        -enemy.height / 2
    );

    ctx.lineTo(
        -enemy.width / 2,
        -enemy.height / 4
    );

    ctx.closePath();

    ctx.fill();


    /*
        Core.
    */

    ctx.shadowBlur = 8;

    ctx.fillStyle =
        "#090e16";


    ctx.beginPath();

    ctx.arc(
        0,
        0,
        Math.min(
            6,
            enemy.width * 0.08
        ),
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.strokeStyle =
        primary;

    ctx.lineWidth = 1;

    ctx.stroke();


    /*
        Shooter weapon.
    */

    if (enemy.shoot) {

        ctx.strokeStyle =
            "rgba(255,255,255,0.35)";

        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.moveTo(
            -enemy.width * 0.32,
            5
        );

        ctx.lineTo(
            -enemy.width * 0.48,
            enemy.height * 0.25
        );

        ctx.moveTo(
            enemy.width * 0.32,
            5
        );

        ctx.lineTo(
            enemy.width * 0.48,
            enemy.height * 0.25
        );

        ctx.stroke();

    }


    /*
        Elite health bar.
    */

    if (
        enemy.type === "elite" &&
        enemy.health < enemy.maxHealth
    ) {

        const barWidth =
            enemy.width;

        const barHeight = 3;

        const percentage =
            enemy.health /
            enemy.maxHealth;


        ctx.shadowBlur = 0;

        ctx.fillStyle =
            "rgba(0,0,0,0.6)";

        ctx.fillRect(
            -barWidth / 2,
            -enemy.height / 2 - 8,
            barWidth,
            barHeight
        );


        ctx.fillStyle =
            "#ffb46e";

        ctx.fillRect(
            -barWidth / 2,
            -enemy.height / 2 - 8,
            barWidth * percentage,
            barHeight
        );

    }


    ctx.restore();

}


/* ================================================================
   ENEMY FIRE
================================================================ */

function enemyFire(enemy) {

    const directionX =
        player.x - enemy.x;

    const directionY =
        player.y - enemy.y;

    const distance =
        Math.hypot(
            directionX,
            directionY
        ) || 1;


    const speed =
        260 +
        game.level * 8;


    enemyProjectiles.push({

        x:
            enemy.x,

        y:
            enemy.y +
            enemy.height / 2,

        radius: 4,

        vx:
            directionX /
            distance *
            speed,

        vy:
            directionY /
            distance *
            speed,

        damage: 1

    });

}


/* ================================================================
   ENEMY PROJECTILES UPDATE
================================================================ */

function updateEnemyProjectiles(deltaTime) {

    for (
        let i = enemyProjectiles.length - 1;
        i >= 0;
        i--
    ) {

        const projectile =
            enemyProjectiles[i];


        projectile.x +=
            projectile.vx *
            deltaTime;

        projectile.y +=
            projectile.vy *
            deltaTime;


        if (
            projectile.x < -30 ||
            projectile.x > canvasWidth + 30 ||
            projectile.y < -30 ||
            projectile.y > canvasHeight + 30
        ) {

            enemyProjectiles.splice(
                i,
                1
            );

            continue;

        }


        if (
            player.visible &&
            player.invulnerable <= 0 &&
            circleRectangleCollision(
                projectile,
                player
            )
        ) {

            damagePlayer();

            enemyProjectiles.splice(
                i,
                1
            );

        }

    }

}


/* ================================================================
   DRAW ENEMY PROJECTILES
================================================================ */

function drawEnemyProjectiles() {

    for (
        const projectile
        of enemyProjectiles
    ) {

        ctx.save();

        ctx.shadowBlur = 15;

        ctx.shadowColor =
            "rgba(255,70,70,0.8)";

        ctx.fillStyle =
            "#ff8a8a";


        ctx.beginPath();

        ctx.arc(
            projectile.x,
            projectile.y,
            projectile.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.restore();

    }

}


/* ================================================================
   COLLISION
================================================================ */

function checkCollision(a, b) {

    return (

        Math.abs(a.x - b.x) <
        (
            a.width +
            b.width
        ) / 2

        &&

        Math.abs(a.y - b.y) <
        (
            a.height +
            b.height
        ) / 2

    );

}


function circleRectangleCollision(
    circle,
    rectangle
) {

    const closestX =
        clamp(
            circle.x,
            rectangle.x -
                rectangle.width / 2,
            rectangle.x +
                rectangle.width / 2
        );


    const closestY =
        clamp(
            circle.y,
            rectangle.y -
                rectangle.height / 2,
            rectangle.y +
                rectangle.height / 2
        );


    const distanceX =
        circle.x - closestX;

    const distanceY =
        circle.y - closestY;


    return (
        distanceX * distanceX +
        distanceY * distanceY
    ) <
    circle.radius *
    circle.radius;

}


/* ================================================================
   PLAYER PROJECTILE COLLISIONS
================================================================ */

function handleProjectileCollisions() {

    for (
        let p =
            playerProjectiles.length - 1;

        p >= 0;

        p--
    ) {

        const projectile =
            playerProjectiles[p];


        let hit =
            false;


        for (
            let e =
                enemies.length - 1;

            e >= 0;

            e--
        ) {

            const enemy =
                enemies[e];


            if (
                circleRectangleCollision(
                    projectile,
                    enemy
                )
            ) {

                enemy.health -=
                    projectile.damage || 1;

                game.hitsLanded = (game.hitsLanded || 0) + 1;

                createHitParticles(
                    projectile.x,
                    projectile.y
                );


                if (!projectile.pierce) {
                    playerProjectiles.splice(
                        p,
                        1
                    );
                    hit = true;
                }


                if (
                    enemy.health <= 0
                ) {

                    destroyEnemy(
                        e,
                        true
                    );

                }


                if (!projectile.pierce) {
                    break;
                }

            }

        }


        if (hit) {

            continue;

        }

    }

}


/* ================================================================
   DESTROY ENEMY
================================================================ */

function destroyEnemy(
    index,
    awardPoints = true
) {

    if (
        index < 0 ||
        index >= enemies.length
    ) {

        return;

    }


    const enemy =
        enemies[index];


    createExplosion(
        enemy.x,
        enemy.y,
        enemy.type
    );

    playSound("explosion");
    triggerVibration(25);


    if (awardPoints) {

        if (enemy.isBoss || enemy.type === "boss") {
            game.bossesKilled = (game.bossesKilled || 0) + 1;
        }

        game.kills = (game.kills || 0) + 1;

        /* Combo system */
        game.combo = (game.combo || 0) + 1;
        game.comboTimer = 2.4;
        if (game.combo > (game.maxCombo || 0)) {
            game.maxCombo = game.combo;
        }

        let points = enemy.points;
        if (game.combo >= 20) {
            points = Math.floor(points * 5);
        } else if (game.combo >= 10) {
            points = Math.floor(points * 3);
        } else if (game.combo >= 5) {
            points = Math.floor(points * 2);
        }

        addScore(points);

        game.waveKills++;
        updateWaveProgressUI();
        checkWaveClear();
        updateComboUI();

    }


    enemies.splice(
        index,
        1
    );


    game.screenShake =
        Math.min(
            10,
            game.screenShake + 2
        );

}


function checkWaveClear() {

    if (game.levelTransition || game.gameOver) {
        return;
    }

    if (game.waveKills < game.waveKillTarget) {
        return;
    }

    /* Wait until screen clear for boss / last enemies */
    if (enemies.length > 0) {
        game.waitingWaveClear = true;
        return;
    }

    completeLevel();

}


/* ================================================================
   DAMAGE PLAYER
================================================================ */

function damagePlayer() {

    if (
        player.invulnerable > 0 ||
        game.gameOver ||
        !player.canControl
    ) {

        return;

    }


    /* Special ship shield (NEBULA): up to 3 hits */
    if (player.specialShip && player.specialShield > 0) {
        player.specialShield--;
        player.specialShieldTimer = 0; /* reset regen clock on hit */
        player.invulnerable = 0.6;
        game.screenShake = 5;
        playSound("hit");
        triggerVibration(15);
        updateLivesUI();
        return;
    }

    /* Shop shield absorbs one hit */
    if (player.shields > 0) {

        player.shields--;
        player.invulnerable = 0.8;
        game.screenShake = 6;
        playSound("hit");
        triggerVibration(20);
        updateLivesUI();
        return;

    }

    /* Reset special shield regen timer when hull is hit */
    if (player.specialShip) {
        player.specialShieldTimer = 0;
    }


    player.health--;
    game.damageTaken = (game.damageTaken || 0) + 1;
    game.combo = 0;
    game.comboTimer = 0;
    updateComboUI();

    /*
        2 segundos invulnerable: puede moverse para escapar,
        pero no disparar. Parpadeo en draw.
    */
    player.invulnerable = 2.0;
    player.visible = true; /* drawPlayer parpadea con invulnerable */
    player.canControl = true; /* movimiento permitido */
    player.canShoot = false; /* sin disparo hasta reaparecer del todo */

    game.screenShake = 12;

    createExplosion(
        player.x,
        player.y,
        "player"
    );

    playSound("damage");
    triggerVibration([40, 30, 60]);

    updateLivesUI();

    if (player.health <= 0) {

        endGame();

    } else {

        saveProgress();

    }

}


/* ================================================================
   SCORE
================================================================ */

function addScore(points) {

    game.score +=
        points;


    if (
        game.score >
        game.highScore
    ) {

        game.highScore =
            game.score;

        persistHighScore();

    }


    updateScoreUI();

    checkLevelProgress();

}


/* ================================================================
   LEVEL SYSTEM
================================================================ */

function calculateTargetScore(level) {

    if (game.mode === "adventure") {
        const def = getAdventureLevelDef(game.adventureLevel);
        return def ? def.target : level * 500;
    }

    /*
        Infinite: soft thresholds (no hard stop).
    */
    return level * 1000;

}


function getAdventureLevelDef(id) {

    if (
        typeof window !== "undefined" &&
        window.SpaceStrikeLevels &&
        typeof window.SpaceStrikeLevels.getAdventureLevel === "function"
    ) {
        return window.SpaceStrikeLevels.getAdventureLevel(id);
    }

    /* Fallback if levels.js missing */
    return {
        id: id,
        name: "SECTOR " + id,
        target: 400 + id * 200,
        excellency: 700 + id * 350,
        allowedTypes: id < 3 ? ["basic"] : id < 5 ? ["basic", "fast"] : id < 8 ? ["basic", "fast", "shooter"] : ["basic", "fast", "shooter", "elite"]
    };

}


function parseGameModeFromURL() {

    try {
        const params = new URLSearchParams(window.location.search);
        const mode = params.get("mode");
        const level = Number(params.get("level") || "1");

        if (mode === "adventure") {
            game.mode = "adventure";
            game.adventureLevel = Math.max(1, Math.min(100, level || 1));
        } else {
            game.mode = "infinite";
            game.adventureLevel = 1;
        }
    } catch (e) {
        game.mode = "infinite";
    }

}


function calculateAdventureStars(levelScore, livesLeft, def) {

    if (
        window.SpaceStrikeLevels &&
        typeof window.SpaceStrikeLevels.calculateStars === "function"
    ) {
        return window.SpaceStrikeLevels.calculateStars(
            levelScore,
            livesLeft,
            def
        );
    }

    /* Fallback: stars by hull remaining */
    if (livesLeft >= 3) return 3;
    if (livesLeft === 2) return 2;
    if (livesLeft === 1) return 1;
    return 0;

}


function saveAdventureStars(levelId, stars) {

    const safeStars = Math.max(0, Math.min(3, Number(stars) || 0));

    if (
        window.SpaceStrikeLevels &&
        typeof window.SpaceStrikeLevels.setLevelStars === "function"
    ) {
        window.SpaceStrikeLevels.setLevelStars(levelId, safeStars);
        return;
    }

    const key = "spaceStrikeAdventure";
    let data = { levels: {} };

    try {
        const raw = localStorage.getItem(key);
        if (raw) {
            data = JSON.parse(raw);
            if (!data.levels) data.levels = {};
        }
    } catch (e) {
        data = { levels: {} };
    }

    const prev = Number(data.levels[String(levelId)] || 0);
    data.levels[String(levelId)] = Math.max(prev, safeStars);

    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        // silent
    }

}


function grantLevelCoins(amount) {

    let n = Math.max(0, Math.floor(amount));
    if (player.coinBonus && player.coinBonus > 1) {
        n = Math.floor(n * player.coinBonus);
    }
    if (window.SpaceStrikePremium && typeof window.SpaceStrikePremium.coinMultiplier === "function") {
        n = Math.floor(n * window.SpaceStrikePremium.coinMultiplier());
    }

    if (
        window.SpaceStrikeUpgrades &&
        typeof window.SpaceStrikeUpgrades.addCoins === "function"
    ) {
        return window.SpaceStrikeUpgrades.addCoins(n);
    }

    return 0;

}



/* ================================================================
   WAVE BALANCE (v1.3.4)
================================================================ */

function getWaveNumber() {
    return Math.max(1, game.level || 1);
}

/** Enemies to kill to clear a wave */
function getWaveKillTarget(wave) {
    /* Wave 1: 8 · Wave 10: ~20 · Wave 25: ~35 · Wave 50: ~55 */
    return Math.min(70, 8 + Math.floor(wave * 1.15) + Math.floor(wave / 5) * 2);
}

/** How many to spawn this wave (same as kill target for normal waves) */
function getWaveSpawnQuota(wave) {
    if (wave % 10 === 0) {
        return 1; /* boss only */
    }
    return getWaveKillTarget(wave);
}

/** HP multiplier — wave 50 ~6.5x base; still fightable with full upgrades */
function getEnemyHpScale(wave) {
    return 1 + (wave - 1) * 0.11 + Math.floor((wave - 1) / 10) * 0.08;
}

/** Boss HP — designed to take time even with max damage/pierce */
function getBossHealth(wave) {
    /*
        Wave 10: ~120  ·  Wave 20: ~220  ·  Wave 30: ~340  ·  Wave 50: ~620
        Max player damage ~4 + multi/double shots still needs sustained fire.
    */
    const tier = Math.max(1, Math.floor(wave / 10));
    return Math.floor(80 + wave * 8 + tier * 35);
}

function isBossWave(wave) {
    wave = Math.floor(Number(wave) || 0);
    /* Aventura: jefe cada 10 sectores · Infinito: jefe cada 50 oleadas */
    if (game.mode === "adventure") {
        return wave >= 10 && wave % 10 === 0;
    }
    return wave >= 50 && wave % 50 === 0;
}

function setupWave(wave) {
    game.level = wave;
    game.waveKills = 0;
    game.waveSpawned = 0;
    game.waitingWaveClear = false;
    game.bossActive = false;

    if (isBossWave(wave)) {
        game.waveKillTarget = 1;
        game.waveSpawnQuota = 1;
        game.bossActive = true;
        game.spawnInterval = 99999;
        spawnBossForWave(wave);
    } else {
        game.waveKillTarget = getWaveKillTarget(wave);
        game.waveSpawnQuota = getWaveSpawnQuota(wave);
        game.spawnInterval = getSpawnIntervalForLevel(wave);
        game.spawnTimer = 0;
    }

    game.targetScore = game.waveKillTarget; /* reuse HUD target as kill goal */

    updateLevelUI();
    updateWaveProgressUI();
}

function updateWaveProgressUI() {
    if (progressBar) {
        const p = clamp(
            game.waveKills / Math.max(1, game.waveKillTarget),
            0,
            1
        );
        progressBar.style.width = (p * 100) + "%";
    }

    if (targetElement) {
        if (game.bossActive) {
            targetElement.textContent = "BOSS";
        } else {
            targetElement.textContent =
                String(game.waveKills) + "/" + String(game.waveKillTarget);
        }
    }
}

function spawnBossForWave(wave) {
    if (enemies.some(function (e) { return e.type === "boss"; })) {
        return;
    }

    loadShipSprite("overlord", [
        "../img/bosses/overlord.png",
        "img/bosses/overlord.png",
        "/img/bosses/overlord.png"
    ]);

    const type = enemyTypes.boss;
    const hp = getBossHealth(wave);
    const scale = 1 + Math.min(0.35, Math.floor(wave / 50) * 0.12);

    enemies.push({
        type: "boss",
        x: canvasWidth / 2,
        y: -type.height * scale,
        width: type.width * scale,
        height: type.height * scale,
        health: hp,
        maxHealth: hp,
        speed: type.speed * (0.9 + Math.min(0.4, wave * 0.008)),
        points: 2500 + wave * 100,
        shoot: true,
        shootCooldown: 480,
        wave: 0,
        waveSpeed: 1.1,
        age: 0,
        isBoss: true,
        bossPhase: 1,
        phaseAnnounced: false,
        spriteId: "overlord"
    });

    if (systemStatus) {
        systemStatus.textContent = "⚠ JEFE OVERLORD · OLEADA " + wave;
    }
}

function updateBossPhases() {
    for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (!e.isBoss) continue;

        const ratio = e.health / Math.max(1, e.maxHealth);

        if (ratio <= 0.5 && e.bossPhase < 2) {
            e.bossPhase = 2;
            e.speed *= 1.35;
            e.waveSpeed *= 1.5;
            e.shootCooldown = Math.min(e.shootCooldown, 280);
            if (systemStatus) {
                systemStatus.textContent = "⚠ JEFE FASE 2 · ENFURECIDO";
            }
            game.screenShake = Math.max(game.screenShake, 10);
            playSound("level");
        }
    }
}


function checkLevelProgress() {

    /*
        Progress is kill-based (waves).
        Score still awards points but does not clear waves.
    */

    updateWaveProgressUI();

}


/* ================================================================
   LEVEL COMPLETE
================================================================ */

function completeLevel() {

    if (game.mode === "infinite") {

        /*
            Infinite: soft wave advance, no full-screen stop.
        */

        const finishedWave = game.level;
        const waveCoins = 10 + Math.floor(finishedWave * 2.5);
        grantLevelCoins(waveCoins);

        game.level = finishedWave + 1;
        enemies.length = 0;
        enemyProjectiles.length = 0;

        setupWave(game.level);
        saveProgress();

        if (systemStatus) {
            systemStatus.textContent =
                `WAVE ${String(game.level).padStart(2, "0")}  +${waveCoins} CR`;
            window.setTimeout(function () {
                if (systemStatus && game.running && !game.bossActive) {
                    systemStatus.textContent = "SYSTEM ONLINE";
                }
            }, 1500);
        }

        return;
    }


    /*
        Adventure: pause and show result + stars.
    */

    game.levelTransition = true;
    game.running = false;

    const def = getAdventureLevelDef(game.adventureLevel);
    let stars = calculateAdventureStars(
        game.score,
        player.health,
        def
    );

    /* Completar nivel siempre da al menos 1 estrella */
    if (stars < 1 && game.score >= (def ? def.target : 1)) {
        stars = 1;
    }
    if (stars < 1) {
        stars = 1;
    }

    saveAdventureStars(game.adventureLevel, stars);

    const coinReward = def && def.coins ? def.coins : (30 + game.adventureLevel * 8);
    const totalCoins = grantLevelCoins(coinReward);

    completedLevelElement.textContent =
        `SECTOR ${String(game.adventureLevel).padStart(2, "0")}`;

    levelCompleteScoreElement.textContent =
        formatNumber(game.score);

    const starsLabel = "★".repeat(stars) + "☆".repeat(3 - stars);

    if (document.getElementById("levelCompleteStars")) {
        document.getElementById("levelCompleteStars").textContent =
            starsLabel + "  ·  +" + coinReward + " CR";
    }

    fillMissionStats();
    levelCompleteScreen.classList.remove("hidden");

    playSound("level");

    window.setTimeout(function () {
        window.location.href = "adventure.html";
    }, 2600);

}


/* ================================================================
   ADVANCE LEVEL
================================================================ */

function advanceToNextLevel() {

    levelCompleteScreen.classList.add(
        "hidden"
    );


    game.level++;

    game.targetScore =
        calculateTargetScore(
            game.level
        );


    /*
        Higher level = faster spawns.
    */

    game.spawnInterval =
        getSpawnIntervalForLevel(
            game.level
        );


    enemies.length = 0;

    enemyProjectiles.length = 0;

    playerProjectiles.length = 0;


    game.levelTransition =
        false;

    game.running =
        true;

    game.spawnTimer =
        0;


    updateLevelUI();

    saveProgress();

}


/* ================================================================
   UI UPDATE
================================================================ */

function updateComboUI() {
    const el = document.getElementById("comboDisplay");
    if (!el) return;
    if (game.combo >= 5) {
        el.classList.remove("hidden");
        let mult = "x2";
        if (game.combo >= 20) mult = "x5";
        else if (game.combo >= 10) mult = "x3";
        el.textContent = "COMBO " + game.combo + "  " + mult;
    } else {
        el.classList.add("hidden");
    }
}

function formatMissionTime(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

function fillMissionStats() {
    const set = function (id, val) {
        const n = document.getElementById(id);
        if (n) n.textContent = val;
    };
    const accuracy = game.shotsFired > 0
        ? Math.min(100, Math.round((game.hitsLanded / game.shotsFired) * 100))
        : 0;
    set("statScore", formatNumber(game.score));
    set("statKills", String(game.kills || 0));
    set("statAccuracy", accuracy + "%");
    set("statCombo", "x" + String(game.maxCombo || 0));
    set("statDamage", String(game.damageTaken || 0));
    set("statTime", formatMissionTime(game.missionTime));
}

function resetMissionStats() {
    game.kills = 0;
    game.shotsFired = 0;
    game.hitsLanded = 0;
    game.damageTaken = 0;
    game.combo = 0;
    game.maxCombo = 0;
    game.comboTimer = 0;
    game.missionTime = 0;
    updateComboUI();
}

function updateScoreUI() {

    scoreElement.textContent =
        formatNumber(
            game.score
        );

}


function updateLevelUI() {

    if (levelElement) {
        levelElement.textContent =
            String(game.level).padStart(2, "0");
    }

    updateWaveProgressUI();

}



function updateLivesUI() {

    if (!livesElement) {
        return;
    }

    const needed = Math.max(3, player.maxHealth || 3);
    let lifeElements = livesElement.querySelectorAll(".life");

    while (lifeElements.length < needed) {
        const span = document.createElement("span");
        span.className = "life";
        livesElement.appendChild(span);
        lifeElements = livesElement.querySelectorAll(".life");
    }

    while (lifeElements.length > needed) {
        livesElement.removeChild(lifeElements[lifeElements.length - 1]);
        lifeElements = livesElement.querySelectorAll(".life");
    }

    lifeElements.forEach(function (life, index) {
        if (index < player.health) {
            life.classList.add("active");
        } else {
            life.classList.remove("active");
        }
    });

    /* Optional shield indicator on status */
    if (systemStatus && player.shields > 0 && game.running) {
        /* keep timer text priority in adventure */
    }

}


/* ================================================================
   SPAWN SYSTEM
================================================================ */

function updateSpawnSystem(deltaTime) {

    if (game.bossActive) {
        return;
    }

    if (game.waveSpawned >= game.waveSpawnQuota) {
        return;
    }

    game.spawnTimer +=
        deltaTime * 1000;

    if (
        game.spawnTimer >=
        game.spawnInterval
    ) {

        game.spawnTimer = 0;

        spawnEnemy();

        /* Slightly denser mid-wave on high waves (desktop) */
        if (
            !PERF.isMobile &&
            game.level >= 8 &&
            game.waveSpawned < game.waveSpawnQuota &&
            Math.random() < Math.min(0.22, game.level * 0.008)
        ) {
            spawnEnemy();
        }

    }

}


/* ================================================================
   PARTICLES
================================================================ */

function createParticle(
    x,
    y,
    options = {}
) {

    if (particles.length >= PERF.maxParticles) {
        particles.splice(0, Math.ceil(PERF.maxParticles * 0.25));
    }

    particles.push({

        x,
        y,

        vx:
            options.vx ??
            random(-100, 100),

        vy:
            options.vy ??
            random(-100, 100),

        life:
            options.life ??
            random(0.25, 0.7),

        maxLife:
            options.life ??
            random(0.25, 0.7),

        size:
            options.size ??
            random(1, 3),

        gravity:
            options.gravity ??
            0,

        alpha:
            options.alpha ??
            1,

        type:
            options.type ??
            "normal"

    });

}


function createExplosion(
    x,
    y,
    type = "basic"
) {

    let count = Math.floor(14 * PERF.explosionScale);

    if (type === "elite") {

        count = Math.floor(22 * PERF.explosionScale);

    }

    if (type === "player") {

        count = Math.floor(28 * PERF.explosionScale);

    }

    if (type === "boss") {

        count = Math.floor(40 * PERF.explosionScale);

    }

    count = Math.max(4, count);


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const angle =
            random(
                0,
                Math.PI * 2
            );

        const speed =
            random(
                40,
                type === "player"
                    ? 300
                    : 220
            );


        createParticle(
            x,
            y,
            {

                vx:
                    Math.cos(angle) *
                    speed,

                vy:
                    Math.sin(angle) *
                    speed,

                life:
                    random(
                        0.25,
                        0.75
                    ),

                size:
                    random(
                        1,
                        type === "elite"
                            ? 5
                            : 3
                    ),

                gravity:
                    random(
                        0,
                        30
                    )

            }
        );

    }

}


function createHitParticles(
    x,
    y
) {

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        createParticle(
            x,
            y,
            {

                vx:
                    random(
                        -90,
                        90
                    ),

                vy:
                    random(
                        -90,
                        90
                    ),

                life:
                    random(
                        0.1,
                        0.3
                    ),

                size:
                    random(
                        1,
                        2.5
                    )

            }
        );

    }

}


function createMuzzleParticles(
    x,
    y
) {

    for (
        let i = 0;
        i < 4;
        i++
    ) {

        createParticle(
            x,
            y,
            {

                vx:
                    random(
                        -35,
                        35
                    ),

                vy:
                    random(
                        -120,
                        -60
                    ),

                life:
                    random(
                        0.08,
                        0.18
                    ),

                size:
                    random(
                        1,
                        2.5
                    )

            }
        );

    }

}


function updateParticles(deltaTime) {

    for (
        let i =
            particles.length - 1;

        i >= 0;

        i--
    ) {

        const particle =
            particles[i];


        particle.life -=
            deltaTime;


        if (
            particle.life <= 0
        ) {

            particles.splice(
                i,
                1
            );

            continue;

        }


        particle.x +=
            particle.vx *
            deltaTime;

        particle.y +=
            particle.vy *
            deltaTime;


        particle.vy +=
            particle.gravity *
            deltaTime;

    }

}


function drawParticles() {

    for (
        const particle
        of particles
    ) {

        const alpha =
            particle.life /
            particle.maxLife;


        ctx.globalAlpha =
            alpha;


        ctx.fillStyle =
            "#bdeaff";


        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    ctx.globalAlpha = 1;

}


/* ================================================================
   DRAW BACKGROUND
================================================================ */

function drawBackground() {

    const gradient =
        ctx.createRadialGradient(
            canvasWidth / 2,
            canvasHeight * 0.45,
            0,
            canvasWidth / 2,
            canvasHeight * 0.45,
            canvasHeight * 0.8
        );


    gradient.addColorStop(
        0,
        "#081321"
    );

    gradient.addColorStop(
        0.5,
        "#030912"
    );

    gradient.addColorStop(
        1,
        "#010205"
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(
        0,
        0,
        canvasWidth,
        canvasHeight
    );


    /*
        Subtle horizontal space lines.
    */

    ctx.strokeStyle =
        "rgba(50,100,140,0.035)";

    ctx.lineWidth = 1;


    for (
        let y = 0;
        y < canvasHeight;
        y += 70
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            canvasWidth,
            y
        );

        ctx.stroke();

    }

}


/* ================================================================
   DRAW EVERYTHING
================================================================ */

function render() {

    ctx.save();


    /*
        Screen shake.
    */

    if (
        game.screenShake > 0
    ) {

        const shake =
            game.screenShake;

        ctx.translate(
            random(
                -shake,
                shake
            ),
            random(
                -shake,
                shake
            )
        );

        game.screenShake *= 0.88;


        if (
            game.screenShake < 0.2
        ) {

            game.screenShake = 0;

        }

    }


    drawBackground();

    drawStars();

    drawParticles();
    drawAsteroids();


    drawPlayerProjectiles();

    drawEnemyProjectiles();

    drawEnemies();

    drawPlayer();

    drawHelper();


    ctx.restore();

}


/* ================================================================
   MAIN UPDATE
================================================================ */

function update(deltaTime) {

    if (
        !game.running ||
        game.paused ||
        game.gameOver ||
        game.levelTransition
    ) {

        return;

    }


    game.elapsed +=
        deltaTime;

    game.missionTime = (game.missionTime || 0) + deltaTime;

    if (game.comboTimer > 0) {
        game.comboTimer -= deltaTime;
        if (game.comboTimer <= 0) {
            game.combo = 0;
            game.comboTimer = 0;
            updateComboUI();
        }
    }

    updateBossPhases();
    updateShieldRegen(deltaTime);
    updateAsteroids(deltaTime);
    updateAbilitySystem(deltaTime);
    updateRandomEvents(deltaTime);

    if (game.mode === "adventure" && game.timedLevel) {

        game.timeLeft -= deltaTime;

        if (systemStatus) {
            const sec = Math.max(0, Math.ceil(game.timeLeft));
            systemStatus.textContent =
                "TIEMPO " + String(sec).padStart(2, "0") + "s";
        }

        if (game.timeLeft <= 0) {
            game.timeLeft = 0;
            if (game.waveKills >= game.waveKillTarget) {
                completeLevel();
            } else {
                endGame();
            }
            return;
        }

    }


    updateStars(
        deltaTime
    );

    updatePlayer(
        deltaTime
    );

    updateSpawnSystem(
        deltaTime
    );

    updateEnemies(
        deltaTime
    );

    updatePlayerProjectiles(
        deltaTime
    );

    updateEnemyProjectiles(
        deltaTime
    );

    handleProjectileCollisions();

    updateParticles(
        deltaTime
    );

    if (
        game.waitingWaveClear &&
        enemies.length === 0 &&
        game.waveKills >= game.waveKillTarget
    ) {
        game.waitingWaveClear = false;
        completeLevel();
    }

}


/* ================================================================
   GAME LOOP
================================================================ */

function gameLoop(timestamp) {

    if (
        !game.lastTime
    ) {

        game.lastTime =
            timestamp;

    }


    let deltaTime =
        (
            timestamp -
            game.lastTime
        ) / 1000;


    game.lastTime =
        timestamp;


    /*
        Prevent giant jumps if the browser
        freezes or the tab is suspended.
    */

    deltaTime =
        Math.min(
            deltaTime,
            0.05
        );


    update(
        deltaTime
    );

    render();


    fpsState.frames++;

    if (!fpsState.lastSample) {
        fpsState.lastSample = timestamp;
    }

    if (timestamp - fpsState.lastSample >= 500) {
        fpsState.value = Math.round(
            (fpsState.frames * 1000) /
            (timestamp - fpsState.lastSample)
        );
        fpsState.frames = 0;
        fpsState.lastSample = timestamp;

        const fpsEl = document.getElementById("fpsCounter");
        if (fpsEl) {
            fpsEl.textContent = fpsState.value + " FPS";
            fpsEl.style.color =
                fpsState.value >= 50
                    ? "#7ef0c8"
                    : fpsState.value >= 30
                        ? "#ffd56a"
                        : "#ff8a9a";
        }
    }


    requestAnimationFrame(
        gameLoop
    );

}


/* ================================================================
   START GAME
================================================================ */

function applyRunState(state) {

    game.score = state.score;
    game.level = state.level;
    game.targetScore = state.targetScore;
    game.spawnInterval = state.spawnInterval;
    game.spawnTimer = 0;
    game.elapsed = 0;
    game.paused = false;
    game.gameOver = false;
    game.levelTransition = false;
    game.running = true;

    playerProjectiles.length = 0;
    enemyProjectiles.length = 0;
    enemies.length = 0;
    particles.length = 0;
    if (typeof asteroids !== "undefined") asteroids.length = 0;

    resetPlayer();

    if (typeof state.health === "number") {
        player.health = Math.max(
            1,
            Math.min(player.maxHealth, state.health)
        );
    }

    updateScoreUI();
    updateLevelUI();
    updateLivesUI();

    missionStartScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    pauseScreen.classList.add("hidden");

    if (pauseButton) {
        pauseButton.style.display = "";
    }

    game.lastTime = performance.now();

}


function startNewGame() {

    loadGameSettings();
    parseGameModeFromURL();
    applyOwnedUpgrades();

    if (game.mode === "infinite") {
        clearProgress();
    }

    resumeAudioIfNeeded();

    let startLevel = 1;
    let target = 1000;

    if (game.mode === "adventure") {
        startLevel = game.adventureLevel;
        target = calculateTargetScore(startLevel);
        const def = getAdventureLevelDef(startLevel);
        game.timedLevel = true;
        game.timeLeft = def && def.timeLimit ? def.timeLimit : 120;
    } else {
        target = calculateTargetScore(1);
        game.timedLevel = false;
        game.timeLeft = 0;
    }

    applyRunState({
        score: 0,
        level: startLevel,
        targetScore: target,
        spawnInterval: getSpawnIntervalForLevel(
            game.mode === "adventure" ? Math.max(1, Math.floor(startLevel / 2)) : 1
        ),
        health: player.maxHealth
    });

    /* Re-apply health after applyRunState resetPlayer */
    applyOwnedUpgrades();
    player.health = player.maxHealth;
    updateLivesUI();

    game.levelScore = 0;
    game.bossesKilled = 0;
    game.shieldRegenTimer = 0;
    resetMissionStats();
    if (typeof asteroids !== "undefined") asteroids.length = 0;
    if (window.SpaceStrikeAbilities) window.SpaceStrikeAbilities.reset();
    if (window.SpaceStrikeEvents) window.SpaceStrikeEvents.reset();

    if (game.mode === "infinite") {
        setupWave(1);
        saveProgress();
    } else {
        /* Adventure: kill quota from sector · boss every 10 levels */
        const def = getAdventureLevelDef(game.adventureLevel);
        const advLv = game.adventureLevel || 1;
        game.waveKills = 0;
        game.waveSpawned = 0;
        if (isBossWave(advLv)) {
            game.waveKillTarget = 1;
            game.waveSpawnQuota = 1;
            game.bossActive = true;
            game.spawnInterval = 99999;
            game.targetScore = 1;
            spawnBossForWave(advLv);
        } else {
            const kills = def && def.kills
                ? def.kills
                : Math.max(12, Math.floor((def && def.target ? def.target : 400) / 45));
            game.waveKillTarget = kills;
            game.waveSpawnQuota = kills;
            game.bossActive = false;
            game.targetScore = kills;
        }
        updateWaveProgressUI();
        updateLevelUI();
    }

    startMusic();

}


function continueGame() {

    loadGameSettings();
    parseGameModeFromURL();
    resumeAudioIfNeeded();

    if (game.mode === "adventure") {
        startNewGame();
        return;
    }

    const data = loadProgress();

    if (!data) {
        startNewGame();
        return;
    }

    const level = data.level;

    /* Restore equipped ship from save (or global inventory) before run state */
    try {
        var sid = data.shipId || null;
        if (sid && window.SpaceStrikeShips && window.SpaceStrikeShips.catalog && window.SpaceStrikeShips.catalog[sid]) {
            if (window.SpaceStrikeShips.owns && !window.SpaceStrikeShips.owns(sid)) {
                window.SpaceStrikeShips.grant(sid, { equip: true });
            } else if (window.SpaceStrikeShips.setEquipped) {
                window.SpaceStrikeShips.setEquipped(sid);
            } else {
                localStorage.setItem("spaceStrikeEquippedShip", sid);
            }
        }
    } catch (eRestore) {}

    applyOwnedUpgrades();

    applyRunState({
        score: data.score,
        level: level,
        targetScore: data.targetScore || calculateTargetScore(level),
        spawnInterval: getSpawnIntervalForLevel(level),
        health: data.health
    });

    /* applyRunState resets player — re-apply ship stats and health cap */
    applyOwnedUpgrades();
    if (typeof data.health === "number") {
        player.health = Math.max(1, Math.min(player.maxHealth, data.health));
    }
    updateLivesUI();

    setupWave(level);
    /* restore score after setupWave */
    game.score = data.score;
    updateScoreUI();

    saveProgress();
    startMusic();

}


/*
    Backward-compatible alias used by restart button.
*/
function startGame() {
    startNewGame();
}


/* ================================================================
   END GAME
================================================================ */


/* ================================================================
   REMASTER 2.0.0 SYSTEMS
================================================================ */

function updateShieldRegen(dt) {
    if (!player || game.gameOver) return;
    const maxShield = (window.SpaceStrikeUpgrades
        ? (window.SpaceStrikeUpgrades.loadUpgrades().shield || 0)
        : 0);
    if (maxShield <= 0) return;
    if (player.invulnerable > 0) {
        game.shieldRegenTimer = 0;
        return;
    }
    game.shieldRegenTimer = (game.shieldRegenTimer || 0) + dt;
    if (game.shieldRegenTimer >= 6 && player.shields < maxShield) {
        player.shields++;
        game.shieldRegenTimer = 0;
        if (systemStatus) systemStatus.textContent = "ESCUDO +1";
    }
}

function spawnAsteroid() {
    if (typeof asteroids === "undefined") return;
    if (asteroids.length >= 8) return;
    const size = 18 + Math.random() * 28;
    asteroids.push({
        x: random(size, canvasWidth - size),
        y: -size,
        width: size,
        height: size,
        speed: 40 + Math.random() * 70 + game.level * 2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 2,
        health: size > 30 ? 3 : 2
    });
}

function updateAsteroids(dt) {
    if (typeof asteroids === "undefined") return;
    const event = window.SpaceStrikeEvents && window.SpaceStrikeEvents.active
        ? window.SpaceStrikeEvents.active()
        : null;
    if (event === "asteroid_field" && Math.random() < 0.04) {
        spawnAsteroid();
    } else if (Math.random() < 0.008 + game.level * 0.0003) {
        spawnAsteroid();
    }

    for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i];
        a.y += a.speed * dt;
        a.rot += a.rotSpeed * dt;
        if (a.y > canvasHeight + a.height) {
            asteroids.splice(i, 1);
            continue;
        }
        if (player.visible && player.invulnerable <= 0 && checkCollision(player, a)) {
            damagePlayer();
            asteroids.splice(i, 1);
            continue;
        }
        /* Player bullets hit asteroids */
        for (let p = playerProjectiles.length - 1; p >= 0; p--) {
            const pr = playerProjectiles[p];
            if (circleRectangleCollision(pr, a)) {
                a.health -= pr.damage || 1;
                if (!pr.pierce) playerProjectiles.splice(p, 1);
                if (a.health <= 0) {
                    createExplosion(a.x, a.y, "basic");
                    asteroids.splice(i, 1);
                    addScore(25);
                    break;
                }
            }
        }
    }
}

function drawAsteroids() {
    if (typeof asteroids === "undefined") return;
    for (let i = 0; i < asteroids.length; i++) {
        const a = asteroids[i];
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rot);
        ctx.fillStyle = "#6a7a8a";
        ctx.strokeStyle = "#9ab";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let k = 0; k < 7; k++) {
            const ang = (k / 7) * Math.PI * 2;
            const r = a.width / 2 * (0.75 + (k % 2) * 0.2);
            const px = Math.cos(ang) * r;
            const py = Math.sin(ang) * r;
            if (k === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

function updateAbilitySystem(dt) {
    if (!window.SpaceStrikeAbilities) return;
    window.SpaceStrikeAbilities.update(dt);
    /* Overdrive modifiers */
    if (window.SpaceStrikeAbilities.isOverdriveActive()) {
        player.fireRate = Math.max(50, (player.baseFireRate || 165) * 0.55);
        player.speed = (player.baseSpeed || 390) * 1.35;
    }
    updateAbilityUI();
}

function updateRandomEvents(dt) {
    if (!window.SpaceStrikeEvents) return;
    window.SpaceStrikeEvents.update(dt, {
        systemStatus: systemStatus,
        grantCoins: function (n) {
            if (window.SpaceStrikeUpgrades) window.SpaceStrikeUpgrades.addCoins(n);
        }
    });
}

function activateAbility(id) {
    if (!window.SpaceStrikeAbilities || !game.running || game.paused || game.gameOver) return;
    if (window.SpaceStrikeAbilities.owns && !window.SpaceStrikeAbilities.owns(id)) {
        if (systemStatus) systemStatus.textContent = "Compra la habilidad en la TIENDA";
        return;
    }
    const ok = window.SpaceStrikeAbilities.tryActivate(id, {
        enemies: enemies,
        player: player,
        game: game,
        createExplosion: createExplosion,
        createHitParticles: createHitParticles,
        destroyEnemy: destroyEnemy
    });
    if (ok) {
        playSound("level");
        triggerVibration(30);
        updateAbilityUI();
    }
}

function updateAbilityUI() {
    if (!window.SpaceStrikeAbilities) return;
    const st = window.SpaceStrikeAbilities.ui();
    ["emp", "overdrive", "nova"].forEach(function (id) {
        const btn = document.getElementById("ability-" + id);
        if (!btn) return;
        const owned = !window.SpaceStrikeAbilities.owns || window.SpaceStrikeAbilities.owns(id);
        btn.classList.toggle("locked", !owned);
        btn.style.opacity = owned ? "" : "0.35";
        btn.title = owned
            ? ((window.SpaceStrikeAbilities.defs[id] && window.SpaceStrikeAbilities.defs[id].desc) || id)
            : "Bloqueada — cómprala en la Tienda";
        const s = st[id];
        btn.classList.toggle("ready", owned && s.cd <= 0);
        btn.classList.toggle("cooling", owned && s.cd > 0);
        const cdEl = btn.querySelector(".ability-cd");
        if (cdEl) {
            if (!owned) cdEl.textContent = "🔒";
            else cdEl.textContent = s.cd > 0 ? Math.ceil(s.cd) + "s" : "";
        }
    });
}

function awardEndXp() {
    if (!window.SpaceStrikeRank) return;
    let xp = Math.floor((game.kills || 0) * 2 + (game.score || 0) / 200);
    if (game.mode === "adventure") xp += 40;
    if ((game.maxCombo || 0) >= 10) xp += 25;
    window.SpaceStrikeRank.addXp(xp);
}

function checkSessionAchievements() {
    if (!window.SpaceStrikeAchievements) return;
    const A = window.SpaceStrikeAchievements;
    if ((game.kills || 0) >= 1) A.unlock("first_blood");
    if ((game.maxCombo || 0) >= 10) A.unlock("ace_pilot");
    if ((game.maxCombo || 0) >= 20) A.unlock("combo_20");
    if ((game.bossesKilled || 0) >= 5) A.unlock("boss_hunter");
    if (game.mode === "infinite" && game.level >= 20) A.unlock("wave_20");
    if (game.mode === "adventure" && (game.damageTaken || 0) === 0 && (game.kills || 0) > 0) {
        A.unlock("survivor");
    }
}

function getSectorTheme(levelId) {
    const id = levelId || game.adventureLevel || game.level || 1;
    if (id <= 5) return { name: "ESPACIO PROFUNDO", tint: "rgba(0,40,90,0.25)" };
    if (id <= 10) return { name: "ASTEROIDES", tint: "rgba(60,50,30,0.3)" };
    if (id <= 15) return { name: "ZONA INDUSTRIAL", tint: "rgba(40,40,50,0.35)" };
    if (id <= 20) return { name: "NEBULOSA", tint: "rgba(60,20,80,0.3)" };
    if (id <= 30) return { name: "ZONA DE GUERRA", tint: "rgba(80,20,20,0.3)" };
    if (id <= 35) return { name: "ESPACIO CORRUPTO", tint: "rgba(40,0,60,0.35)" };
    return { name: "TERRITORIO ENEMIGO", tint: "rgba(80,0,20,0.35)" };
}


function endGame() {

    game.running = false;

    game.gameOver = true;

    player.visible = false;

    stopMusic();
    playSound("gameover");
    triggerVibration([80, 40, 80, 40, 120]);


    if (
        game.score >
        game.highScore
    ) {

        game.highScore =
            game.score;

        persistHighScore();

    }


    if (game.mode === "infinite") {
        clearProgress();
    } else {
        /* Failed adventure level keeps 0 stars (no upgrade) */
        saveAdventureStars(game.adventureLevel, 0);
    }


    finalScoreElement.textContent =
        formatNumber(
            game.score
        );


    finalLevelElement.textContent =
        String(
            game.mode === "adventure"
                ? game.adventureLevel
                : game.level
        ).padStart(
            2,
            "0"
        );


    bestScoreElement.textContent =
        formatNumber(
            game.highScore
        );


    fillMissionStats();
    awardEndXp();
    checkSessionAchievements();

    gameOverScreen.classList.remove(
        "hidden"
    );

    if (
        game.mode === "infinite" &&
        window.SpaceStrikePlayer &&
        typeof window.SpaceStrikePlayer.submitScore === "function"
    ) {
        window.SpaceStrikePlayer.submitScore(game.score, game.level);
    }

    /* Global leaderboard (Firebase) — only infinite, real pilot name */
    if (game.mode === "infinite") {
        try {
            var pilotName = "";
            if (window.SpaceStrikePlayer && typeof window.SpaceStrikePlayer.getName === "function") {
                pilotName = window.SpaceStrikePlayer.getName() || "";
            }
            if (!pilotName && window.SpaceStrikePlayer && typeof window.SpaceStrikePlayer.loadProfile === "function") {
                var pr = window.SpaceStrikePlayer.loadProfile();
                if (pr && pr.name) pilotName = pr.name;
            }
            if (!pilotName) {
                try {
                    var raw = localStorage.getItem("spaceStrikeProfile");
                    if (raw) {
                        var p = JSON.parse(raw);
                        if (p && p.name) pilotName = p.name;
                    }
                } catch (e2) {}
            }
            pilotName = String(pilotName || "").trim();

            if (window.SpaceStrikeGlobalLB && typeof window.SpaceStrikeGlobalLB.submit === "function") {
                window.SpaceStrikeGlobalLB.submit(pilotName, game.score, game.level).then(function (res) {
                    if (systemStatus) {
                        if (res && res.ok) {
                            systemStatus.textContent = "RANKING GLOBAL ✓";
                        if (window.SpaceStrikeAuth) window.SpaceStrikeAuth.push();
                        } else {
                            systemStatus.textContent = "RANKING: " + ((res && res.error) || (res && res.reason) || "error");
                        }
                    }
                    console.log("[SpaceStrike] global submit", res);
                });
            } else {
                console.warn("[SpaceStrike] SpaceStrikeGlobalLB no cargado");
                if (systemStatus) systemStatus.textContent = "RANKING: módulo no cargado";
            }
        } catch (err) {
            console.warn("[SpaceStrike] global submit exception", err);
        }
    }

    try {
        if (window.SpaceStrikeAuth && window.SpaceStrikeAuth.push) {
            window.SpaceStrikeAuth.push();
        }
    } catch (ePush) {}

}


/* ================================================================
   PAUSE
================================================================ */

function togglePause() {

    if (
        !game.running ||
        game.gameOver ||
        game.levelTransition
    ) {

        return;

    }


    game.paused =
        !game.paused;


    if (game.paused) {

        pauseScreen.classList.remove(
            "hidden"
        );

        saveProgress();
        stopMusic();

    } else {

        pauseScreen.classList.add(
            "hidden"
        );

        game.lastTime =
            performance.now();

        if (gameSettings.music) {
            startMusic();
        }

    }

}


/* ================================================================
   RETURN TO MENU
================================================================ */

function returnToMenu() {

    if (
        game.mode === "infinite" &&
        !game.gameOver &&
        (
            game.running ||
            game.paused ||
            game.levelTransition
        )
    ) {
        saveProgress();
    }

    if (game.mode === "adventure") {
        window.location.href = "adventure.html";
        return;
    }

    window.location.href =
        "../index.html";

}


/* ================================================================
   KEYBOARD INPUT
================================================================ */

function initializeKeyboard() {

    document.addEventListener(
        "keydown",
        (event) => {

            const key =
                event.key.toLowerCase();


            if (
                [
                    "arrowup",
                    "arrowdown",
                    "arrowleft",
                    "arrowright",
                    " ",
                ].includes(
                    event.key.toLowerCase()
                )
            ) {

                event.preventDefault();

            }


            if (
                key === "w" ||
                event.key === "ArrowUp"
            ) {

                keyboard.up = true;

            }


            if (
                key === "s" ||
                event.key === "ArrowDown"
            ) {

                keyboard.down = true;

            }


            if (
                key === "a" ||
                event.key === "ArrowLeft"
            ) {

                keyboard.left = true;

            }


            if (
                key === "d" ||
                event.key === "ArrowRight"
            ) {

                keyboard.right = true;

            }


            if (
                event.code === "Space"
            ) {

                keyboard.fire = true;

            }


            if (
                key === "p" ||
                event.key === "Escape"
            ) {

                togglePause();

            }

        }
    );


    document.addEventListener(
        "keyup",
        (event) => {

            const key =
                event.key.toLowerCase();


            if (
                key === "w" ||
                event.key === "ArrowUp"
            ) {

                keyboard.up = false;

            }


            if (
                key === "s" ||
                event.key === "ArrowDown"
            ) {

                keyboard.down = false;

            }


            if (
                key === "a" ||
                event.key === "ArrowLeft"
            ) {

                keyboard.left = false;

            }


            if (
                key === "d" ||
                event.key === "ArrowRight"
            ) {

                keyboard.right = false;

            }


            if (
                event.code === "Space"
            ) {

                keyboard.fire = false;

            }

        }
    );

}


/* ================================================================
   JOYSTICK
================================================================ */

let joystickPointerId = null;


function updateJoystick(
    clientX,
    clientY
) {

    const rect =
        joystick.getBoundingClientRect();


    const centerX =
        rect.left +
        rect.width / 2;

    const centerY =
        rect.top +
        rect.height / 2;


    let deltaX =
        clientX -
        centerX;

    let deltaY =
        clientY -
        centerY;


    const maxDistance =
        rect.width * 0.36;


    const distance =
        Math.hypot(
            deltaX,
            deltaY
        );


    if (
        distance >
        maxDistance
    ) {

        const factor =
            maxDistance /
            distance;

        deltaX *= factor;
        deltaY *= factor;

    }


    touchInput.x =
        deltaX /
        maxDistance;

    touchInput.y =
        deltaY /
        maxDistance;


    joystickStick.style.transform =
        `translate(
            calc(-50% + ${deltaX}px),
            calc(-50% + ${deltaY}px)
        )`;

}


function resetJoystick() {

    touchInput.x = 0;

    touchInput.y = 0;

    touchInput.active = false;

    joystickStick.style.transform =
        "translate(-50%, -50%)";

}


function initializeJoystick() {

    if (!joystick) {

        return;

    }


    joystick.addEventListener(
        "pointerdown",
        (event) => {

            joystickPointerId =
                event.pointerId;

            touchInput.active =
                true;

            joystick.setPointerCapture(
                event.pointerId
            );


            updateJoystick(
                event.clientX,
                event.clientY
            );

        }
    );


    joystick.addEventListener(
        "pointermove",
        (event) => {

            if (
                event.pointerId !==
                joystickPointerId
            ) {

                return;

            }


            updateJoystick(
                event.clientX,
                event.clientY
            );

        }
    );


    const releaseJoystick =
        (event) => {

            if (
                event.pointerId !==
                joystickPointerId
            ) {

                return;

            }


            joystickPointerId =
                null;

            resetJoystick();

        };


    joystick.addEventListener(
        "pointerup",
        releaseJoystick
    );


    joystick.addEventListener(
        "pointercancel",
        releaseJoystick
    );


    joystick.addEventListener(
        "lostpointercapture",
        () => {

            joystickPointerId =
                null;

            resetJoystick();

        }
    );

}


/* ================================================================
   FIRE BUTTON
================================================================ */

function initializeFireButton() {

    if (!fireButton) {

        return;

    }


    fireButton.addEventListener(
        "pointerdown",
        (event) => {

            event.preventDefault();

            touchInput.fire = true;

            fireButton.classList.add(
                "active"
            );

        }
    );


    const releaseFire =
        () => {

            touchInput.fire = false;

            fireButton.classList.remove(
                "active"
            );

        };


    fireButton.addEventListener(
        "pointerup",
        releaseFire
    );


    fireButton.addEventListener(
        "pointercancel",
        releaseFire
    );


    fireButton.addEventListener(
        "pointerleave",
        releaseFire
    );

}


/* ================================================================
   UI EVENTS
================================================================ */

function initializeUI() {

    if (pauseButton) {

        pauseButton.addEventListener(
            "click",
            togglePause
        );

    }


    if (resumeButton) {

        resumeButton.addEventListener(
            "click",
            togglePause
        );

    }


    if (pauseMenuButton) {

        pauseMenuButton.addEventListener(
            "click",
            returnToMenu
        );

    }


    if (restartButton) {

        restartButton.addEventListener(
            "click",
            startGame
        );

    }


    if (gameOverMenuButton) {

        gameOverMenuButton.addEventListener(
            "click",
            returnToMenu
        );

    }


    if (launchButton) {

        launchButton.addEventListener(
            "click",
            startNewGame
        );

    }


    if (continueButton) {

        continueButton.addEventListener(
            "click",
            continueGame
        );

    }

}


/* ================================================================
   WINDOW EVENTS
================================================================ */

function initializeWindowEvents() {

    window.addEventListener(
        "resize",
        resizeCanvas
    );


    document.addEventListener(
        "visibilitychange",
        () => {

            /*
                Pause automatically when the player
                leaves the browser tab.
            */

            if (
                document.hidden &&
                game.running &&
                !game.paused
            ) {

                togglePause();

            }


            if (document.hidden) {
                saveProgress();
            }

        }
    );


    window.addEventListener(
        "beforeunload",
        () => {
            saveProgress();
        }
    );

}


/* ================================================================
   INITIALIZATION
================================================================ */

function updateMobileControlsVisibility() {

    const isTouch =
        window.matchMedia("(pointer: coarse)").matches ||
        ("ontouchstart" in window && window.matchMedia("(max-width: 900px)").matches);

    if (mobileControls) {
        if (isTouch) {
            mobileControls.classList.remove("desktop-hidden");
        } else {
            mobileControls.classList.add("desktop-hidden");
        }
    }

}



function bindAbilityButtons() {
    ["emp", "overdrive", "nova"].forEach(function (id) {
        var btn = document.getElementById("ability-" + id);
        if (!btn) return;
        function fire(ev) {
            if (ev) {
                ev.preventDefault();
                ev.stopPropagation();
            }
            activateAbility(id);
        }
        btn.addEventListener("click", fire);
        btn.addEventListener("touchend", fire, { passive: false });
        btn.addEventListener("pointerup", function (ev) {
            if (ev.pointerType === "touch" || ev.pointerType === "pen") return;
            fire(ev);
        });
    });
}

function initializeGame() {

    loadGameSettings();

    bindAbilityButtons();

    parseGameModeFromURL();

    syncHighScoreFromSources();

    resizeCanvas();

    updateMobileControlsVisibility();

    if (window.SpaceStrikeControls) {
        window.SpaceStrikeControls.apply(
            joystick,
            joystickStick,
            fireButton
        );
    }

    initializeStars();

    resetPlayer();

    updateScoreUI();

    updateLevelUI();

    updateLivesUI();

    initializeKeyboard();

    initializeJoystick();

    initializeFireButton();

    initializeUI();

    initializeWindowEvents();

    window.addEventListener("resize", updateMobileControlsVisibility);


    /*
        The game starts behind the
        MISSION INITIALIZATION screen.
    */

    missionStartScreen.classList.remove(
        "hidden"
    );

    if (game.mode === "adventure") {
        if (continueButton) {
            continueButton.classList.add("hidden");
        }
        if (continueInfo) {
            continueInfo.classList.add("hidden");
        }
        if (missionLevelElement) {
            missionLevelElement.textContent =
                `SECTOR ${String(game.adventureLevel).padStart(2, "0")}`;
        }
        if (launchButton) {
            launchButton.textContent = "LAUNCH";
            launchButton.classList.add("primary");
        }
    } else {
        updateMissionStartUI();
    }


    requestAnimationFrame(
        gameLoop
    );

}


/* ================================================================
   BOOT
================================================================ */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeGame
    );

} else {

    initializeGame();

}

/* Ability hotkeys 2.0.0 */
document.addEventListener("keydown", function (e) {
    if (e.key === "1") activateAbility("emp");
    if (e.key === "2") activateAbility("overdrive");
    if (e.key === "3") activateAbility("nova");
});
