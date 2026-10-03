/* SPACE STRIKE — Cloud announcements + browser notifications (admins publish) */
(function (global) {
    "use strict";

    var COL = "announcements";
    var SEEN_KEY = "spaceStrikeAnnouncementsSeen";
    var PERM_ASKED_KEY = "spaceStrikeNotifPermAsked";
    var unsub = null;

    function getDb() {
        try {
            if (global.firebase && firebase.apps && firebase.apps.length) {
                return firebase.firestore();
            }
        } catch (e) {}
        return null;
    }

    function ensureFirebase() {
        if (global.SpaceStrikeAuth && global.SpaceStrikeAuth.init) {
            return global.SpaceStrikeAuth.init().then(function () {
                return !!getDb();
            });
        }
        return Promise.resolve(!!getDb());
    }

    function loadSeen() {
        try {
            return JSON.parse(localStorage.getItem(SEEN_KEY) || "[]") || [];
        } catch (e) {
            return [];
        }
    }

    function markSeen(id) {
        var s = loadSeen();
        if (s.indexOf(id) < 0) {
            s.push(id);
            if (s.length > 80) s = s.slice(-80);
            try {
                localStorage.setItem(SEEN_KEY, JSON.stringify(s));
            } catch (e) {}
        }
    }

    function notifSupported() {
        return typeof Notification !== "undefined";
    }

    function permissionState() {
        if (!notifSupported()) return "unsupported";
        return Notification.permission;
    }

    /**
     * Explain + request permission (like Gmail / WhatsApp style prompt in-page first).
     */
    function requestPermissionWithExplain() {
        return new Promise(function (resolve) {
            if (!notifSupported()) {
                resolve({ ok: false, permission: "unsupported" });
                return;
            }
            if (Notification.permission === "granted") {
                resolve({ ok: true, permission: "granted" });
                return;
            }
            if (Notification.permission === "denied") {
                resolve({ ok: false, permission: "denied" });
                return;
            }

            var msg =
                "SPACE STRIKE quiere enviarte notificaciones.\n\n" +
                "Sirven para:\n" +
                "• Noticias y actualizaciones del juego\n" +
                "• Eventos especiales\n" +
                "• Códigos de uso limitado / recompensas\n" +
                "• Avisos importantes del equipo\n\n" +
                "¿Permitir notificaciones?";

            if (!confirm(msg)) {
                try {
                    localStorage.setItem(PERM_ASKED_KEY, "1");
                } catch (e) {}
                resolve({ ok: false, permission: "dismissed" });
                return;
            }

            Notification.requestPermission().then(function (perm) {
                try {
                    localStorage.setItem(PERM_ASKED_KEY, "1");
                } catch (e2) {}
                resolve({ ok: perm === "granted", permission: perm });
            }).catch(function () {
                resolve({ ok: false, permission: "error" });
            });
        });
    }

    function maybeAskPermissionOnce() {
        try {
            if (localStorage.getItem(PERM_ASKED_KEY) === "1") return Promise.resolve(permissionState());
        } catch (e) {}
        /* delay so menu paints first */
        return new Promise(function (resolve) {
            setTimeout(function () {
                requestPermissionWithExplain().then(function (r) {
                    resolve(r.permission || permissionState());
                });
            }, 2500);
        });
    }

    function showBrowserNotification(title, body, tag) {
        if (!notifSupported() || Notification.permission !== "granted") return false;
        try {
            var n = new Notification(title || "SPACE STRIKE", {
                body: body || "",
                tag: tag || "ss-announcement",
                icon: "img/marca.png",
                badge: "img/marca.png"
            });
            n.onclick = function () {
                try {
                    window.focus();
                    n.close();
                } catch (e) {}
            };
            return true;
        } catch (e2) {
            return false;
        }
    }

    function showInGameBanner(title, body) {
        try {
            var el = document.getElementById("ssCloudNotice");
            if (!el) {
                el = document.createElement("div");
                el.id = "ssCloudNotice";
                el.style.cssText =
                    "position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:99999;" +
                    "max-width:min(420px,92vw);padding:12px 14px;border-radius:8px;" +
                    "background:rgba(8,18,36,0.95);border:1px solid rgba(100,180,255,0.45);" +
                    "color:#e8f4ff;font:12px/1.4 system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,0.45);";
                document.body.appendChild(el);
            }
            el.innerHTML =
                "<div style='font-weight:800;letter-spacing:1px;margin-bottom:4px'>" +
                (title || "AVISO") +
                "</div><div style='opacity:0.9'>" +
                (body || "") +
                "</div>" +
                "<button type='button' style='margin-top:8px;width:100%;padding:8px;border-radius:5px;border:1px solid rgba(90,170,255,0.35);background:#0a2038;color:#dcecff;font-weight:700;cursor:pointer'>CERRAR</button>";
            el.querySelector("button").onclick = function () {
                el.remove();
            };
            setTimeout(function () {
                try {
                    if (el && el.parentNode) el.remove();
                } catch (e) {}
            }, 14000);
        } catch (e3) {}
    }

    function handleAnnouncement(doc) {
        var id = doc.id;
        var data = doc.data() || {};
        var seen = loadSeen();
        if (seen.indexOf(id) >= 0) return;
        markSeen(id);
        var title = data.title || "SPACE STRIKE";
        var body = data.body || data.message || "";
        showInGameBanner(title, body);
        showBrowserNotification(title, body, "ss-" + id);
    }

    function listen() {
        return ensureFirebase().then(function (ok) {
            var db = getDb();
            if (!ok || !db) return { ok: false };
            if (unsub) {
                try {
                    unsub();
                } catch (e) {}
            }
            /* last 15 by time */
            unsub = db
                .collection(COL)
                .orderBy("createdAt", "desc")
                .limit(15)
                .onSnapshot(
                    function (snap) {
                        snap.docChanges().forEach(function (change) {
                            if (change.type === "added") {
                                handleAnnouncement(change.doc);
                            }
                        });
                    },
                    function (err) {
                        console.warn("[SS announcements]", err);
                    }
                );
            return { ok: true };
        });
    }

    function publish(title, body, type) {
        var isAdm =
            (global.SpaceStrikeAdmin && global.SpaceStrikeAdmin.isAdmin && global.SpaceStrikeAdmin.isAdmin()) ||
            (global.SpaceStrikeCodes && global.SpaceStrikeCodes.isAdmin && global.SpaceStrikeCodes.isAdmin());
        if (!isAdm) {
            return Promise.resolve({ ok: false, error: "Solo admins pueden enviar notificaciones" });
        }
        title = String(title || "").trim();
        body = String(body || "").trim();
        if (!title || !body) {
            return Promise.resolve({ ok: false, error: "Título y mensaje requeridos" });
        }
        return ensureFirebase().then(function (ok) {
            var db = getDb();
            if (!ok || !db) return { ok: false, error: "Sin Firebase" };
            var email = "";
            try {
                if (global.SpaceStrikeAuth && global.SpaceStrikeAuth.user) {
                    var u = global.SpaceStrikeAuth.user();
                    email = (u && u.email) || "";
                }
            } catch (e) {}
            return db
                .collection(COL)
                .add({
                    title: title.slice(0, 80),
                    body: body.slice(0, 500),
                    type: type || "news",
                    createdAt: Date.now(),
                    by: email
                })
                .then(function (ref) {
                    return { ok: true, id: ref.id };
                });
        }).catch(function (err) {
            return { ok: false, error: String(err && err.message || err) };
        });
    }

    function listRecent(limit) {
        limit = limit || 20;
        return ensureFirebase().then(function (ok) {
            var db = getDb();
            if (!ok || !db) return { ok: false, items: [] };
            return db
                .collection(COL)
                .orderBy("createdAt", "desc")
                .limit(limit)
                .get()
                .then(function (snap) {
                    var items = [];
                    snap.forEach(function (doc) {
                        var d = doc.data() || {};
                        items.push({
                            id: doc.id,
                            title: d.title,
                            body: d.body,
                            type: d.type,
                            createdAt: d.createdAt,
                            by: d.by
                        });
                    });
                    return { ok: true, items: items };
                });
        });
    }

    global.SpaceStrikePush = {
        requestPermissionWithExplain: requestPermissionWithExplain,
        maybeAskPermissionOnce: maybeAskPermissionOnce,
        permissionState: permissionState,
        listen: listen,
        publish: publish,
        listRecent: listRecent,
        showBrowserNotification: showBrowserNotification
    };

    function boot() {
        maybeAskPermissionOnce();
        listen();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            setTimeout(boot, 400);
        });
    } else {
        setTimeout(boot, 400);
    }
})(typeof window !== "undefined" ? window : this);
