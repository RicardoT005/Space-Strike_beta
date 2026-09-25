/* SPACE STRIKE 2.6.9 — Ship inventory (single source of truth) */

const SHIPS_KEY = "spaceStrikeShips";
const EQUIPPED_KEY = "spaceStrikeEquippedShip";
const SHIPS_META_KEY = "spaceStrikeShipsMeta";

const SHIP_CATALOG = {
    interceptor: {
        id: "interceptor",
        name: "INTERCEPTOR",
        desc: "Rápida y ágil. Casco ligero.",
        cost: 0,
        free: true,
        speed: 430,
        fireRate: 150,
        maxHealth: 3,
        damageBonus: 0,
        color: "#6ebcf0",
        accent: "#e9f7ff"
    },
    assault: {
        id: "assault",
        name: "ASALTO",
        desc: "Equilibrada. Más daño base.",
        cost: 400,
        free: false,
        speed: 390,
        fireRate: 155,
        maxHealth: 3,
        damageBonus: 1,
        color: "#f0a060",
        accent: "#ffe0c0"
    },
    tank: {
        id: "tank",
        name: "TANQUE",
        desc: "Lenta pero muy resistente.",
        cost: 500,
        free: false,
        speed: 320,
        fireRate: 180,
        maxHealth: 5,
        damageBonus: 0,
        color: "#7ecf9a",
        accent: "#d0ffe0"
    },
    spectre: {
        id: "spectre",
        name: "SPECTRE",
        desc: "Cadencia alta. Casco frágil.",
        cost: 650,
        free: false,
        speed: 410,
        fireRate: 115,
        maxHealth: 2,
        damageBonus: 0,
        color: "#c090ff",
        accent: "#f0e0ff"
    },
    destroyer: {
        id: "destroyer",
        name: "DESTRUCTOR",
        desc: "Alto daño y casco medio.",
        cost: 900,
        free: false,
        speed: 360,
        fireRate: 165,
        maxHealth: 4,
        damageBonus: 2,
        color: "#ff6b6b",
        accent: "#ffd0d0"
    },
    phoenix: {
        id: "phoenix",
        name: "PHOENIX ★",
        desc: "PREMIUM. Equilibrio élite + estilo fuego.",
        cost: 0,
        free: false,
        premium: true,
        speed: 420,
        fireRate: 130,
        maxHealth: 4,
        damageBonus: 1,
        color: "#ff8c42",
        accent: "#ffd4a8"
    },
    voidrunner: {
        id: "voidrunner",
        name: "VOID RUNNER ★",
        desc: "PREMIUM. Máxima velocidad y cadencia.",
        cost: 0,
        free: false,
        premium: true,
        speed: 460,
        fireRate: 105,
        maxHealth: 3,
        damageBonus: 1,
        color: "#a78bfa",
        accent: "#e9d5ff"
    },
    nebula: {
        id: "nebula",
        name: "NEBULA ★★",
        desc: "EXCLUSIVA. Doble cañón, agilidad alta, escudo 3 hits (regen 60s). Disparo rojo + 10% láser.",
        cost: 0,
        free: false,
        special: true,
        codeOnly: true,
        speed: 480,
        fireRate: 140,
        maxHealth: 3,
        damageBonus: 1,
        color: "#7b6cff",
        accent: "#c4b5ff",
        sprite: "../img/texturas-especiales/nave-especial.png",
        specialStats: {
            doubleCannon: true,
            agility: true,
            shieldMax: 3,
            shieldRegenSec: 60,
            bulletColor: "#ff3b4a",
            laserChance: 0.10
        }
    }
};

function normalizeOwnedList(list) {
    if (!Array.isArray(list)) list = [];
    var out = [];
    var seen = {};
    list.forEach(function (id) {
        id = String(id || "").toLowerCase().trim();
        if (!id || seen[id]) return;
        if (!SHIP_CATALOG[id]) return; /* drop unknown ids */
        seen[id] = true;
        out.push(id);
    });
    if (out.indexOf("interceptor") < 0) out.unshift("interceptor");
    return out;
}

function readMeta() {
    try {
        return JSON.parse(localStorage.getItem(SHIPS_META_KEY) || "{}") || {};
    } catch (e) {
        return {};
    }
}

function writeMeta(meta) {
    try {
        localStorage.setItem(SHIPS_META_KEY, JSON.stringify(meta || {}));
    } catch (e) {}
}

function loadOwnedShips() {
    try {
        var raw = localStorage.getItem(SHIPS_KEY);
        var list = raw ? JSON.parse(raw) : ["interceptor"];
        list = normalizeOwnedList(list);

        /* HEAL: equipped special/premium must also be owned (fixes game vs shop mismatch) */
        var eq = "";
        try { eq = String(localStorage.getItem(EQUIPPED_KEY) || "").toLowerCase().trim(); } catch (e0) {}
        if (eq && SHIP_CATALOG[eq] && list.indexOf(eq) < 0) {
            var ship = SHIP_CATALOG[eq];
            if (ship.special || ship.codeOnly || ship.premium || ship.free) {
                list.push(eq);
                list = normalizeOwnedList(list);
                try { localStorage.setItem(SHIPS_KEY, JSON.stringify(list)); } catch (e1) {}
            }
        }

        /* HEAL: meta lastGrantId */
        try {
            var meta = readMeta();
            if (meta && meta.lastGrantId && SHIP_CATALOG[meta.lastGrantId] && list.indexOf(meta.lastGrantId) < 0) {
                list.push(meta.lastGrantId);
                list = normalizeOwnedList(list);
                try { localStorage.setItem(SHIPS_KEY, JSON.stringify(list)); } catch (e2) {}
            }
        } catch (e3) {}

        return list;
    } catch (e) {
        return ["interceptor"];
    }
}

function saveOwnedShips(list) {
    list = normalizeOwnedList(list);
    try {
        localStorage.setItem(SHIPS_KEY, JSON.stringify(list));
    } catch (e) {}
    return list;
}

function notifyShipsChanged() {
    try {
        window.dispatchEvent(new CustomEvent("ss-ships-changed", {
            detail: {
                owned: loadOwnedShips(),
                equipped: getEquippedShipId()
            }
        }));
    } catch (e) {}
    try {
        localStorage.setItem("spaceStrikeShipsPing", String(Date.now()));
    } catch (e2) {}
}

function getEquippedShipId() {
    try {
        var id = localStorage.getItem(EQUIPPED_KEY) || "interceptor";
        id = String(id).toLowerCase().trim();
        if (!SHIP_CATALOG[id]) return "interceptor";
        var owned = loadOwnedShips(); /* heals special equipped into owned */
        if (owned.indexOf(id) < 0) {
            return "interceptor";
        }
        return id;
    } catch (e) {
        return "interceptor";
    }
}

function setEquippedShipId(id) {
    id = String(id || "").toLowerCase().trim();
    if (!SHIP_CATALOG[id]) return false;
    var owned = loadOwnedShips();
    if (owned.indexOf(id) < 0) return false;
    try {
        localStorage.setItem(EQUIPPED_KEY, id);
    } catch (e) {}
    notifyShipsChanged();
    return true;
}

function ownsShip(id) {
    return loadOwnedShips().indexOf(String(id || "").toLowerCase()) >= 0;
}

/**
 * Single entry point to unlock a ship (idempotent).
 * Always persists local first, stamps meta, then optional cloud push.
 */
function grantShip(id, opts) {
    opts = opts || {};
    id = String(id || "").toLowerCase().trim();
    if (!SHIP_CATALOG[id]) {
        console.warn("[SHIPS] grant unknown id", id);
        return { ok: false, reason: "unknown" };
    }
    var before = loadOwnedShips();
    console.log("[SHIPS] owned before grant:", before.join(","));
    console.log("[SHIPS] granting:", id);

    var owned = before.slice();
    if (owned.indexOf(id) < 0) owned.push(id);
    owned = saveOwnedShips(owned);

    /* equip by default unless opts.equip === false */
    if (opts.equip !== false) {
        try {
            localStorage.setItem(EQUIPPED_KEY, id);
        } catch (e) {}
    }

    var meta = readMeta();
    meta.lastGrantId = id;
    meta.lastGrantAt = Date.now();
    meta.ownedSnapshot = owned.slice();
    writeMeta(meta);

    console.log("[SHIPS] owned after grant:", owned.join(","));
    console.log("[SHIPS] equipped:", getEquippedShipId());

    notifyShipsChanged();

    /* Cloud sync after local is solid */
    try {
        if (window.SpaceStrikeAuth && typeof window.SpaceStrikeAuth.push === "function") {
            var p = window.SpaceStrikeAuth.push();
            if (p && p.then) p.catch(function (err) { console.warn("[SHIPS] push", err); });
        }
    } catch (e2) {}

    return { ok: true, owned: owned, equipped: getEquippedShipId() };
}

function buyShip(id) {
    var ship = SHIP_CATALOG[id];
    if (!ship) return { ok: false, reason: "unknown" };
    if (ship.special || ship.codeOnly) {
        return { ok: false, reason: "code_only" };
    }
    if (ship.premium) {
        var prem = window.SpaceStrikePremium && window.SpaceStrikePremium.isPremium && window.SpaceStrikePremium.isPremium();
        if (!prem) return { ok: false, reason: "premium" };
        if (ownsShip(id)) return { ok: false, reason: "owned" };
        return grantShip(id);
    }
    if (ship.free || ownsShip(id)) return { ok: false, reason: "owned" };

    var coins = 0;
    if (window.SpaceStrikeUpgrades && window.SpaceStrikeUpgrades.loadCoins) {
        coins = window.SpaceStrikeUpgrades.loadCoins();
    } else {
        coins = Number(localStorage.getItem("spaceStrikeCoins") || 0);
    }
    if (coins < ship.cost) {
        return { ok: false, reason: "coins", cost: ship.cost, coins: coins };
    }
    var next = coins - ship.cost;
    if (window.SpaceStrikeUpgrades && window.SpaceStrikeUpgrades.saveCoins) {
        window.SpaceStrikeUpgrades.saveCoins(next);
    } else {
        localStorage.setItem("spaceStrikeCoins", String(next));
    }
    var res = grantShip(id);
    res.coins = next;
    return res;
}

function getEquippedShip() {
    return SHIP_CATALOG[getEquippedShipId()] || SHIP_CATALOG.interceptor;
}

function applyShipToPlayer(player) {
    var ship = getEquippedShip();
    player.shipId = ship.id;
    player.shipColor = ship.color;
    player.shipAccent = ship.accent;
    player.baseSpeed = ship.speed;
    player.baseFireRate = ship.fireRate;
    player.shipDamageBonus = ship.damageBonus || 0;
    player.shipMaxHealth = ship.maxHealth;
    player.shipSprite = ship.sprite || null;
    player.specialShip = !!ship.special;
    player.specialStats = ship.specialStats || null;
    if (ship.specialStats) {
        if (ship.specialStats.doubleCannon) player.doubleCannon = true;
        if (ship.specialStats.agility) {
            player.baseSpeed = Math.max(player.baseSpeed || 0, ship.speed);
            player.specialAgility = true;
        }
        player.specialShieldMax = ship.specialStats.shieldMax || 0;
        player.specialShieldRegenSec = ship.specialStats.shieldRegenSec || 60;
        player.specialBulletColor = ship.specialStats.bulletColor || null;
        player.specialLaserChance = ship.specialStats.laserChance || 0;
    } else {
        player.specialAgility = false;
        player.specialShieldMax = 0;
        player.specialShieldRegenSec = 60;
        player.specialBulletColor = null;
        player.specialLaserChance = 0;
    }
    return ship;
}

/** Merge two owned lists (union). Never drops ships. */
function mergeOwnedLists(a, b) {
    return normalizeOwnedList([].concat(a || [], b || []));
}

/**
 * Apply inventory from cloud merge WITHOUT wiping local unlocks.
 * Called by auth.js
 */
function applyInventoryFromCloud(cloudShips, cloudEquipped) {
    var local = loadOwnedShips();
    var merged = mergeOwnedLists(local, cloudShips);
    console.log("[SHIPS] merge local:", local.join(","), "cloud:", (cloudShips || []).join(","), "=>", merged.join(","));
    saveOwnedShips(merged);

    var eq = cloudEquipped || localStorage.getItem(EQUIPPED_KEY) || "interceptor";
    eq = String(eq).toLowerCase().trim();
    /* Prefer local equipped if still owned after merge (recent grant) */
    var localEq = localStorage.getItem(EQUIPPED_KEY);
    var meta = readMeta();
    var recentGrant = meta.lastGrantAt && (Date.now() - Number(meta.lastGrantAt) < 120000);
    if (recentGrant && meta.lastGrantId && merged.indexOf(meta.lastGrantId) >= 0) {
        eq = meta.lastGrantId;
    } else if (localEq && merged.indexOf(localEq) >= 0) {
        eq = localEq;
    } else if (merged.indexOf(eq) < 0) {
        eq = "interceptor";
    }
    try {
        localStorage.setItem(EQUIPPED_KEY, eq);
    } catch (e) {}
    notifyShipsChanged();
    return { owned: merged, equipped: eq };
}

if (typeof window !== "undefined") {
    window.SpaceStrikeShips = {
        catalog: SHIP_CATALOG,
        loadOwned: loadOwnedShips,
        owns: ownsShip,
        buy: buyShip,
        grant: grantShip,
        getEquippedId: getEquippedShipId,
        setEquipped: setEquippedShipId,
        getEquipped: getEquippedShip,
        applyToPlayer: applyShipToPlayer,
        mergeOwned: mergeOwnedLists,
        applyFromCloud: applyInventoryFromCloud
    };
}
