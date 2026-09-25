/* One-time premium codes via Firestore */
(function () {
    var COL = "premiumCodes";

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
        if (window.SpaceStrikeGlobalLB && window.SpaceStrikeGlobalLB.init) {
            return window.SpaceStrikeGlobalLB.init();
        }
        return Promise.resolve(false);
    }

    function redeemCode(code) {
        code = String(code || "").trim().toUpperCase().replace(/\s+/g, "");
        if (code.length < 6) {
            return Promise.resolve({ ok: false, error: "Código demasiado corto" });
        }

        /* Legacy static codes still work once */
        if (window.SpaceStrikePremium && window.SpaceStrikePremium.redeem) {
            var legacy = window.SpaceStrikePremium.redeem(code);
            if (legacy && legacy.ok) {
                if (window.SpaceStrikeAuth) window.SpaceStrikeAuth.push();
                return Promise.resolve(legacy);
            }
        }

        return ensureFirebase().then(function () {
            var db = getDb();
            if (!db) return { ok: false, error: "Sin conexión a la nube" };

            var ref = db.collection(COL).doc(code);
            return db.runTransaction(function (tx) {
                return tx.get(ref).then(function (snap) {
                    if (!snap.exists) {
                        throw new Error("Código inválido");
                    }
                    var d = snap.data() || {};
                    if (d.used) {
                        throw new Error("Código ya usado");
                    }
                    var uid = null;
                    try {
                        if (window.SpaceStrikeAuth && window.SpaceStrikeAuth.user()) {
                            uid = window.SpaceStrikeAuth.user().uid;
                        }
                    } catch (e) {}
                    tx.update(ref, {
                        used: true,
                        usedAt: Date.now(),
                        usedBy: uid || "local"
                    });
                    return true;
                });
            }).then(function () {
                if (window.SpaceStrikePremium && window.SpaceStrikePremium.activate) {
                    window.SpaceStrikePremium.activate();
                } else {
                    localStorage.setItem("spaceStrikePremium", "1");
                }
                if (window.SpaceStrikeAuth) window.SpaceStrikeAuth.push();
                return { ok: true };
            }).catch(function (err) {
                return { ok: false, error: String(err.message || err) };
            });
        });
    }

    /**
     * Create codes (owner only — needs Firestore rules allowing create on premiumCodes
     * or use Firebase console). Returns list of codes.
     */
    function generateCodes(count, prefix) {
        count = Math.min(50, Math.max(1, count || 5));
        prefix = String(prefix || "SS").toUpperCase();
        return ensureFirebase().then(function () {
            var db = getDb();
            if (!db) return { ok: false, error: "Sin DB" };
            var batch = db.batch();
            var codes = [];
            for (var i = 0; i < count; i++) {
                var code = prefix + "-" + Math.random().toString(36).slice(2, 6).toUpperCase() +
                    Math.random().toString(36).slice(2, 6).toUpperCase();
                codes.push(code);
                batch.set(db.collection(COL).doc(code), {
                    used: false,
                    createdAt: Date.now()
                });
            }
            return batch.commit().then(function () {
                return { ok: true, codes: codes };
            }).catch(function (err) {
                return { ok: false, error: String(err.message || err) };
            });
        });
    }

    window.SpaceStrikeCodes = {
        redeem: redeemCode,
        generate: generateCodes
    };
})();
