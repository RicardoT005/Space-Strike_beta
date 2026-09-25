/* SPACE STRIKE — Special reward codes (Firestore rewardCodes) */
(function () {
    var COL = "rewardCodes";
    var SHIPS_KEY = "spaceStrikeShips";
    var EQUIP_KEY = "spaceStrikeEquippedShip";
    var ADMIN_EMAIL = "ricardotorresgalvez005@gmail.com";

    function getDb() {
        if (window.firebase && firebase.apps && firebase.apps.length) {
            return firebase.firestore();
        }
        return null;
    }

    function ensureFirebase() {
        if (window.SpaceStrikeAuth && window.SpaceStrikeAuth.init) {
            return window.SpaceStrikeAuth.init();
        }
        return Promise.resolve(!!getDb());
    }

    function normalizeCode(code) {
        return String(code || "")
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "");
    }

    function getAdminEmail() {
        try {
            var u = window.SpaceStrikeAuth && window.SpaceStrikeAuth.user && window.SpaceStrikeAuth.user();
            if (u && u.email) return String(u.email).toLowerCase().trim();
        } catch (e) {}
        try {
            if (window.firebase && firebase.auth && firebase.auth().currentUser) {
                return String(firebase.auth().currentUser.email || "").toLowerCase().trim();
            }
        } catch (e2) {}
        return "";
    }

    function isAdmin() {
        return getAdminEmail() === ADMIN_EMAIL.toLowerCase();
    }

    function grantShipLocal(shipId) {
        var list = [];
        try {
            list = JSON.parse(localStorage.getItem(SHIPS_KEY) || "[]");
        } catch (e) {
            list = [];
        }
        if (!Array.isArray(list)) list = [];
        if (list.indexOf("interceptor") < 0) list.unshift("interceptor");
        if (list.indexOf(shipId) < 0) list.push(shipId);
        try {
            localStorage.setItem(SHIPS_KEY, JSON.stringify(list));
            localStorage.setItem(EQUIP_KEY, shipId);
        } catch (e2) {}
        return list;
    }

    function applyReward(reward) {
        reward = String(reward || "").toLowerCase().trim();
        var shipId = null;
        if (reward.indexOf("ship_") === 0) {
            shipId = reward.slice(5);
        } else if (reward === "nebula" || reward === "ship_nebula") {
            shipId = "nebula";
        } else if (window.SpaceStrikeShips && window.SpaceStrikeShips.catalog && window.SpaceStrikeShips.catalog[reward]) {
            shipId = reward;
        }
        if (!shipId) {
            return { ok: false, error: "Recompensa desconocida: " + reward };
        }
        var res;
        if (window.SpaceStrikeShips && typeof window.SpaceStrikeShips.grant === "function") {
            res = window.SpaceStrikeShips.grant(shipId, { equip: true });
        } else {
            grantShipLocal(shipId);
            res = { ok: true };
        }
        if (!res || res.ok === false) {
            return { ok: false, error: (res && res.reason) || "No se pudo desbloquear" };
        }
        var name = shipId.toUpperCase();
        try {
            if (window.SpaceStrikeShips && window.SpaceStrikeShips.catalog[shipId]) {
                name = window.SpaceStrikeShips.catalog[shipId].name || name;
            }
        } catch (e4) {}
        return {
            ok: true,
            reward: "ship_" + shipId,
            owned: res.owned,
            message: "¡Nave " + name + " desbloqueada y equipada! Revisa NAVES ESPECIALES en la Tienda."
        };
    }

    function redeem(code) {
        code = normalizeCode(code);
        if (code.length < 4) {
            return Promise.resolve({ ok: false, error: "Código demasiado corto" });
        }

        return ensureFirebase().then(function () {
            var db = getDb();
            if (!db) {
                return { ok: false, error: "Sin conexión a Firebase. Revisa internet o espera un momento." };
            }

            var ref = db.collection(COL).doc(code);

            return db
                .runTransaction(function (tx) {
                    return tx.get(ref).then(function (snap) {
                        if (!snap.exists) {
                            throw new Error("Código inválido");
                        }
                        var d = snap.data() || {};
                        if (d.active === false) {
                            throw new Error("Código desactivado");
                        }
                        var left = Number(d.usesLeft);
                        if (isNaN(left) || left <= 0) {
                            throw new Error("Código agotado");
                        }
                        var rewardValue = d.reward || "";
                        var next = left - 1;
                        if (next <= 0) {
                            tx.delete(ref);
                        } else {
                            tx.update(ref, {
                                usesLeft: next,
                                lastUsedAt: Date.now()
                            });
                        }
                        return { reward: rewardValue, usesLeft: next };
                    });
                })
                .then(function (info) {
                    var applied = applyReward(info.reward);
                    if (!applied.ok) return applied;
                    return {
                        ok: true,
                        reward: info.reward,
                        usesLeft: info.usesLeft,
                        message: applied.message
                    };
                })
                .catch(function (err) {
                    return { ok: false, error: String(err.message || err) };
                });
        });
    }

    function randomCode(prefix) {
        var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var s = "";
        for (var i = 0; i < 6; i++) {
            s += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        var pre = normalizeCode(prefix || "ESP");
        if (pre.length > 12) pre = pre.slice(0, 12);
        return pre + "_" + s;
    }

    /**
     * Admin only: create a new reward code in Firestore.
     * opts: { shipId, uses, code?, prefix? }
     */
    function createCode(opts) {
        opts = opts || {};
        if (!isAdmin()) {
            return Promise.resolve({ ok: false, error: "No autorizado" });
        }
        var shipId = String(opts.shipId || "nebula").toLowerCase().trim();
        var uses = Math.max(1, Math.min(1000, Number(opts.uses) || 1));
        var code = opts.code ? normalizeCode(opts.code) : randomCode(opts.prefix || "ESP");
        if (code.length < 4) {
            return Promise.resolve({ ok: false, error: "Código inválido" });
        }

        return ensureFirebase().then(function () {
            var db = getDb();
            if (!db) return { ok: false, error: "Sin Firebase" };

            var ref = db.collection(COL).doc(code);
            return ref.get().then(function (snap) {
                if (snap.exists) {
                    /* regenerate once */
                    code = randomCode(opts.prefix || "ESP");
                    ref = db.collection(COL).doc(code);
                }
                var data = {
                    reward: "ship_" + shipId,
                    usesLeft: uses,
                    maxUses: uses,
                    active: true,
                    createdAt: Date.now(),
                    createdBy: getAdminEmail()
                };
                return ref.set(data).then(function () {
                    return { ok: true, code: code, reward: data.reward, uses: uses };
                });
            });
        }).catch(function (err) {
            return { ok: false, error: String(err.message || err) };
        });
    }

    function listSpecialShips() {
        var out = [];
        if (window.SpaceStrikeShips && window.SpaceStrikeShips.catalog) {
            Object.keys(window.SpaceStrikeShips.catalog).forEach(function (id) {
                var s = window.SpaceStrikeShips.catalog[id];
                if (s.special || s.codeOnly) {
                    out.push({ id: id, name: s.name, desc: s.desc });
                }
            });
        }
        if (out.length === 0) {
            out.push({ id: "nebula", name: "NEBULA ★★", desc: "Exclusiva" });
        }
        return out;
    }

    window.SpaceStrikeRewards = {
        redeem: redeem,
        applyReward: applyReward,
        createCode: createCode,
        isAdmin: isAdmin,
        getAdminEmail: getAdminEmail,
        listSpecialShips: listSpecialShips,
        ADMIN_EMAIL: ADMIN_EMAIL
    };
})();
