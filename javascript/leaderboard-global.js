/* SPACE STRIKE 2.1.3 — Global leaderboard (1 entry per pilot, best score) */
(function () {
    var firebaseConfig = {
        apiKey: "AIzaSyAvphMu9hP94TxCWbhiyAHZJtUHiwBrU1Y",
        authDomain: "space-strike-2b542.firebaseapp.com",
        projectId: "space-strike-2b542",
        storageBucket: "space-strike-2b542.firebasestorage.app",
        messagingSenderId: "274515632428",
        appId: "1:274515632428:web:c72fb66c2df01929128c89",
        measurementId: "G-96LB3982K3"
    };

    var db = null;
    var ready = false;
    var initPromise = null;
    var lastError = "";

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            if (document.querySelector('script[src="' + src + '"]')) {
                resolve();
                return;
            }
            var s = document.createElement("script");
            s.src = src;
            s.async = true;
            s.onload = function () { resolve(); };
            s.onerror = function () { reject(new Error("No se pudo cargar " + src)); };
            document.head.appendChild(s);
        });
    }

    function init() {
        if (initPromise) return initPromise;
        initPromise = loadScript("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js")
            .then(function () {
                return loadScript("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js");
            })
            .then(function () {
                if (!window.firebase) throw new Error("Firebase no disponible");
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }
                db = firebase.firestore();
                ready = true;
                lastError = "";
                return true;
            })
            .catch(function (err) {
                lastError = String(err && err.message || err);
                console.warn("[SpaceStrike] Firebase init failed", err);
                ready = false;
                return false;
            });
        return initPromise;
    }

    /** Stable doc id from pilot name (unique per name, case-insensitive) */
    function nameToId(name) {
        return String(name || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9_\-]/g, "_")
            .slice(0, 32);
    }

    function resolveName(name) {
        name = String(name || "").trim();
        if (name.length >= 7 && name.length <= 12) return name;
        try {
            if (window.SpaceStrikePlayer && typeof window.SpaceStrikePlayer.getName === "function") {
                name = String(window.SpaceStrikePlayer.getName() || "").trim();
            }
        } catch (e) {}
        if (name.length >= 7 && name.length <= 12) return name;
        try {
            var raw = localStorage.getItem("spaceStrikeProfile");
            if (raw) {
                var p = JSON.parse(raw);
                if (p && p.name) name = String(p.name).trim();
            }
        } catch (e) {}
        return name;
    }

    /**
     * One document per pilot name.
     * - If no entry: create
     * - If new score is higher: update
     * - If new score is lower or equal: keep existing (no write)
     */
    function isPlayerPremium() {
        try {
            if (window.SpaceStrikePremium && window.SpaceStrikePremium.isPremium) {
                return !!window.SpaceStrikePremium.isPremium();
            }
            return localStorage.getItem("spaceStrikePremium") === "1";
        } catch (e) {
            return false;
        }
    }

    function submitScore(name, score, wave) {
        name = resolveName(name);
        score = Math.floor(Number(score) || 0);
        wave = Math.floor(Number(wave) || 1);

        if (name.length < 7 || name.length <= 6 || name.length > 12) {
            lastError = "Nombre inválido (7-12 caracteres). Regístrate en el menú.";
            return Promise.resolve({ ok: false, reason: "name", error: lastError });
        }
        if (score <= 0) {
            lastError = "Score 0 no se sube";
            return Promise.resolve({ ok: false, reason: "score" });
        }

        var docId = nameToId(name);
        if (!docId) {
            lastError = "Nombre inválido";
            return Promise.resolve({ ok: false, reason: "name", error: lastError });
        }

        return init().then(function (ok) {
            if (!ok || !db) {
                lastError = lastError || "Firebase offline";
                return { ok: false, reason: "offline", error: lastError };
            }

            var ref = db.collection("scores").doc(docId);
            return ref.get().then(function (snap) {
                var payload = {
                    name: name,
                    score: score,
                    wave: wave,
                    date: Date.now(),
                    premium: isPlayerPremium()
                };

                if (!snap.exists) {
                    return ref.set(payload).then(function () {
                        lastError = "";
                        return { ok: true, action: "created" };
                    });
                }

                var prev = snap.data() || {};
                var prevScore = Number(prev.score) || 0;
                if (score > prevScore || (payload.premium && !prev.premium)) {
                    return ref.set(payload, { merge: true }).then(function () {
                        lastError = "";
                        return { ok: true, action: score > prevScore ? "updated" : "premium_flag", previous: prevScore };
                    });
                }

                /* Not a personal best — keep cloud record */
                lastError = "";
                return { ok: true, action: "kept", previous: prevScore };
            }).catch(function (err) {
                lastError = String(err && err.message || err);
                console.warn("[SpaceStrike] submit failed", err);
                return { ok: false, reason: "error", error: lastError };
            });
        });
    }

    function fetchTop(limit) {
        limit = limit || 20;
        return init().then(function (ok) {
            if (!ok || !db) return [];
            return db.collection("scores")
                .orderBy("score", "desc")
                .limit(limit)
                .get()
                .then(function (snap) {
                    var rows = [];
                    snap.forEach(function (doc) {
                        var d = doc.data() || {};
                        rows.push({
                            id: doc.id,
                            name: d.name || "———",
                            score: Number(d.score) || 0,
                            wave: Number(d.wave) || 1,
                            date: d.date || 0,
                            premium: !!d.premium
                        });
                    });
                    lastError = "";
                    return rows;
                })
                .catch(function (err) {
                    lastError = String(err && err.message || err);
                    console.warn("[SpaceStrike] fetch failed", err);
                    return db.collection("scores").limit(80).get().then(function (snap) {
                        var rows = [];
                        snap.forEach(function (doc) {
                            var d = doc.data() || {};
                            rows.push({
                                id: doc.id,
                                name: d.name || "———",
                                score: Number(d.score) || 0,
                                wave: Number(d.wave) || 1,
                                date: d.date || 0
                            });
                        });
                        rows.sort(function (a, b) {
                            return b.score - a.score || b.wave - a.wave;
                        });
                        return rows.slice(0, limit);
                    }).catch(function (err2) {
                        lastError = String(err2 && err2.message || err2);
                        return [];
                    });
                });
        });
    }

    window.SpaceStrikeGlobalLB = {
        init: init,
        submit: submitScore,
        top: fetchTop,
        isReady: function () { return ready; },
        lastError: function () { return lastError; }
    };
})();
