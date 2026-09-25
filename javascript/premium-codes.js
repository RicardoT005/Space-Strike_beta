/* One-time premium codes via Firestore — admin generate, always single-use */
(function () {
    var COL = "premiumCodes";
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
        if (window.SpaceStrikeGlobalLB && window.SpaceStrikeGlobalLB.init) {
            return window.SpaceStrikeGlobalLB.init();
        }
        return Promise.resolve(!!getDb());
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

    function normalizeCode(code) {
        return String(code || "").trim().toUpperCase().replace(/\s+/g, "");
    }

    function randomCode(prefix) {
        var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var s = "";
        for (var i = 0; i < 8; i++) {
            s += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        var pre = normalizeCode(prefix || "VIP");
        if (pre.length > 8) pre = pre.slice(0, 8);
        return pre + "-" + s;
    }

    function redeemCode(code) {
        code = normalizeCode(code);
        if (code.length < 6) {
            return Promise.resolve({ ok: false, error: "Código demasiado corto" });
        }

        /* Legacy static codes */
        if (window.SpaceStrikePremium && window.SpaceStrikePremium.redeem) {
            var legacy = window.SpaceStrikePremium.redeem(code);
            if (legacy && legacy.ok) {
                if (window.SpaceStrikeAuth && window.SpaceStrikeAuth.push) {
                    try { window.SpaceStrikeAuth.push(); } catch (e) {}
                }
                /* Apply ranking badge immediately */
                if (window.SpaceStrikeGlobalLB && window.SpaceStrikeGlobalLB.markPremium) {
                    try {
                        window.SpaceStrikeGlobalLB.markPremium().catch(function () {});
                    } catch (e2) {}
                }
                return Promise.resolve(legacy);
            }
        }

        return ensureFirebase().then(function () {
            var db = getDb();
            if (!db) return { ok: false, error: "Sin conexión a la nube" };

            var ref = db.collection(COL).doc(code);
            return db
                .runTransaction(function (tx) {
                    return tx.get(ref).then(function (snap) {
                        if (!snap.exists) throw new Error("Código inválido");
                        var d = snap.data() || {};
                        if (d.used === true) throw new Error("Código ya usado");
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
                })
                .then(function () {
                    if (window.SpaceStrikePremium && window.SpaceStrikePremium.activate) {
                        window.SpaceStrikePremium.activate();
                    } else {
                        localStorage.setItem("spaceStrikePremium", "1");
                    }
                    if (window.SpaceStrikeAuth && window.SpaceStrikeAuth.push) {
                        try { window.SpaceStrikeAuth.push(); } catch (e3) {}
                    }
                    if (window.SpaceStrikeGlobalLB && window.SpaceStrikeGlobalLB.markPremium) {
                        return window.SpaceStrikeGlobalLB.markPremium().then(function () {
                            return { ok: true, message: "¡Premium activado! Badge dorado en ranking." };
                        });
                    }
                    return { ok: true, message: "¡Premium activado!" };
                })
                .catch(function (err) {
                    return { ok: false, error: String(err.message || err) };
                });
        });
    }

    /** Admin only — always single-use */
    function createCode(opts) {
        opts = opts || {};
        if (!isAdmin()) {
            return Promise.resolve({ ok: false, error: "No autorizado" });
        }
        var code = opts.code ? normalizeCode(opts.code) : randomCode(opts.prefix || "VIP");
        if (code.length < 6) {
            return Promise.resolve({ ok: false, error: "Código inválido" });
        }

        return ensureFirebase().then(function () {
            var db = getDb();
            if (!db) return { ok: false, error: "Sin Firebase" };
            var ref = db.collection(COL).doc(code);
            return ref.get().then(function (snap) {
                if (snap.exists) {
                    code = randomCode(opts.prefix || "VIP");
                    ref = db.collection(COL).doc(code);
                }
                var data = {
                    used: false,
                    createdAt: Date.now(),
                    createdBy: getAdminEmail(),
                    singleUse: true
                };
                return ref.set(data).then(function () {
                    return { ok: true, code: code };
                });
            });
        }).catch(function (err) {
            return { ok: false, error: String(err.message || err) };
        });
    }

    /**
     * Admin: list pilots from scores (+ optional users collection)
     */
    function listRegisteredUsers() {
        if (!isAdmin()) {
            return Promise.resolve({ ok: false, error: "No autorizado", rows: [] });
        }
        return ensureFirebase().then(function () {
            var db = getDb();
            if (!db) return { ok: false, error: "Sin Firebase", rows: [] };

            return db
                .collection("scores")
                .orderBy("score", "desc")
                .limit(100)
                .get()
                .then(function (snap) {
                    var rows = [];
                    snap.forEach(function (doc) {
                        var d = doc.data() || {};
                        rows.push({
                            id: doc.id,
                            name: d.name || doc.id,
                            score: Number(d.score) || 0,
                            wave: Number(d.wave) || 0,
                            premium: !!d.premium,
                            date: d.date || 0
                        });
                    });
                    return { ok: true, rows: rows };
                })
                .catch(function (err) {
                    return { ok: false, error: String(err.message || err), rows: [] };
                });
        });
    }

    /** Admin: set premium flag on a pilot in scores without beating score */
    function setUserPremium(name, on) {
        if (!isAdmin()) {
            return Promise.resolve({ ok: false, error: "No autorizado" });
        }
        name = String(name || "").trim();
        if (name.length < 7) {
            return Promise.resolve({ ok: false, error: "Nombre inválido" });
        }
        return ensureFirebase().then(function () {
            var db = getDb();
            if (!db) return { ok: false, error: "Sin Firebase" };
            var docId = name.toUpperCase().replace(/[^A-Z0-9_\-]/g, "_").slice(0, 40);
            if (window.SpaceStrikeGlobalLB && window.SpaceStrikeGlobalLB.nameToId) {
                docId = window.SpaceStrikeGlobalLB.nameToId(name) || docId;
            }
            var ref = db.collection("scores").doc(docId);
            return ref.set({ premium: !!on, name: name }, { merge: true }).then(function () {
                return { ok: true };
            });
        }).catch(function (err) {
            return { ok: false, error: String(err.message || err) };
        });
    }

    window.SpaceStrikeCodes = {
        redeem: redeemCode,
        createCode: createCode,
        generate: function (count, prefix) {
            /* compat: generate N single-use codes (admin) */
            if (!isAdmin()) return Promise.resolve({ ok: false, error: "No autorizado", codes: [] });
            count = Math.min(20, Math.max(1, count || 1));
            var chain = Promise.resolve({ ok: true, codes: [] });
            var all = [];
            for (var i = 0; i < count; i++) {
                chain = chain.then(function () {
                    return createCode({ prefix: prefix || "VIP" }).then(function (res) {
                        if (res && res.ok) all.push(res.code);
                        return { ok: true, codes: all };
                    });
                });
            }
            return chain;
        },
        listUsers: listRegisteredUsers,
        setUserPremium: setUserPremium,
        isAdmin: isAdmin,
        getAdminEmail: getAdminEmail,
        ADMIN_EMAIL: ADMIN_EMAIL
    };
})();
