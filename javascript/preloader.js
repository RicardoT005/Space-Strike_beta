/**
 * SPACE STRIKE — Asset Preloader
 * Verifica caché del navegador; si falta alguna textura la descarga.
 * Bloquea menú / juego hasta que todo esté listo.
 */
(function (global) {
    "use strict";

    var CACHE_NAME = "space-strike-assets-v3.3.6";
    var MANIFEST_KEY = "ss_assets_manifest_v336";

    /** Rutas relativas desde la raíz del sitio (index.html) */
    var ASSETS = [
        "img/marca.png",
        "img/bosses/overlord.png",
        "img/ui/rpd-badge.png",
        "img/ships/assault.png",
        "img/ships/cempasuchil.png",
        "img/ships/interceptor.png",
        "img/ships/nebula.png",
        "img/ships/rogue.png",
        "img/ships/rpd-drone.png",
        "img/ships/rpd.png",
        "img/ships/spectre.png",
        "img/ships/t-wind.png",
        "img/ships/tank.png",
        "img/ships/vt03.png",
        "img/ships/vt03/core.png",
        "img/ships/vt03/phase1.png",
        "img/ships/vt03/wing-l.png",
        "img/ships/vt03/wing-r.png",
        "img/texturas-especiales/assault.png",
        "img/texturas-especiales/cempasuchil-eterno.png",
        "img/texturas-especiales/interceptor.png",
        "img/texturas-especiales/nave-especial.png",
        "img/texturas-especiales/rpd-drone.png",
        "img/texturas-especiales/rpd-leon.png",
        "img/texturas-especiales/spectre.png",
        "img/texturas-especiales/tank.png",
        "img/texturas-especiales/vt03-core.png",
        "img/texturas-especiales/vt03-phase1.png",
        "img/texturas-especiales/vt03-wing-l.png",
        "img/texturas-especiales/vt03-wing-r.png",
        "img/texturas-especiales/skins/horror_jason.png",
        "img/texturas-especiales/skins/horror_chucky.png",
        "img/texturas-especiales/skins/horror_freddy.png",
        "img/texturas-especiales/skins/horror_rpd_drone.png",
        "img/texturas-especiales/skins/horror_rpd.png",
        "img/texturas-especiales/skins/horror_jason_mil.png",
        "img/texturas-especiales/skins/horror_jason_02.png",
        "img/texturas-especiales/skins/horror_freddy_hat.png",
        "img/texturas-especiales/skins/horror_freddy_claw.png",
        "img/texturas-especiales/skins/horror_delta.png",
        "img/texturas-especiales/skins/horror_freddy_heavy.png",
        "img/texturas-especiales/skins/horror_freddy_delta.png"
        /* cover promocional omitida a propósito (muy pesada, no se usa en juego) */
    ];

    var state = {
        ready: false,
        total: ASSETS.length,
        done: 0,
        failed: [],
        started: false
    };

    function rootPrefix() {
        var path = (location.pathname || "").replace(/\\/g, "/");
        /* páginas en /html/xxx.html → subir un nivel */
        if (/\/html\//i.test(path)) return "../";
        return "";
    }

    function urlFor(rel) {
        return rootPrefix() + rel;
    }

    function ensureOverlay() {
        var el = document.getElementById("ss-preload");
        if (el) return el;
        el = document.createElement("div");
        el.id = "ss-preload";
        el.innerHTML =
            '<div class="ss-preload-box">' +
            '<div class="ss-preload-title">SPACE STRIKE</div>' +
            '<div class="ss-preload-sub">CARGANDO RECURSOS</div>' +
            '<div class="ss-preload-bar"><div class="ss-preload-fill" id="ss-preload-fill"></div></div>' +
            '<div class="ss-preload-pct" id="ss-preload-pct">0%</div>' +
            '<div class="ss-preload-msg" id="ss-preload-msg">Preparando texturas…</div>' +
            "</div>";
        document.body.appendChild(el);
        if (!document.getElementById("ss-preload-style")) {
            var st = document.createElement("style");
            st.id = "ss-preload-style";
            st.textContent =
                "#ss-preload{position:fixed;inset:0;z-index:99999;background:#030407;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;}" +
                "#ss-preload.ss-done{opacity:0;pointer-events:none;transition:opacity .35s ease;}" +
                ".ss-preload-box{width:min(320px,86vw);text-align:center;}" +
                ".ss-preload-title{font-size:22px;letter-spacing:6px;color:#e8e4ff;font-weight:700;}" +
                ".ss-preload-sub{margin-top:8px;font-size:11px;letter-spacing:3px;color:rgba(160,150,220,.7);}" +
                ".ss-preload-bar{margin:22px 0 10px;height:6px;border-radius:4px;background:rgba(80,70,140,.25);overflow:hidden;}" +
                ".ss-preload-fill{height:100%;width:0%;background:linear-gradient(90deg,#6a5cff,#c4b5ff);transition:width .15s linear;}" +
                ".ss-preload-pct{font-size:13px;color:#c4b5ff;letter-spacing:2px;}" +
                ".ss-preload-msg{margin-top:10px;font-size:11px;color:rgba(180,170,220,.55);min-height:16px;}" +
                "body.ss-loading .menu,body.ss-loading main{pointer-events:none;opacity:.35;}" +
                "body.ss-loading #startGameButton,body.ss-loading .play-button{pointer-events:none;}";
            document.head.appendChild(st);
        }
        return el;
    }

    function setProgress(done, total, msg) {
        state.done = done;
        var pct = total ? Math.min(100, Math.round((done / total) * 100)) : 100;
        var fill = document.getElementById("ss-preload-fill");
        var pctEl = document.getElementById("ss-preload-pct");
        var msgEl = document.getElementById("ss-preload-msg");
        if (fill) fill.style.width = pct + "%";
        if (pctEl) pctEl.textContent = pct + "%";
        if (msgEl && msg) msgEl.textContent = msg;
    }

    function loadImage(url) {
        return new Promise(function (resolve) {
            var img = new Image();
            img.onload = function () {
                resolve({ ok: true, url: url });
            };
            img.onerror = function () {
                resolve({ ok: false, url: url });
            };
            /* cache-bust solo si nunca se cacheó esta versión */
            img.src = url;
        });
    }

    function cachePut(url) {
        if (!("caches" in global)) return Promise.resolve();
        return caches.open(CACHE_NAME).then(function (cache) {
            return fetch(url, { cache: "force-cache" }).then(function (res) {
                if (res && res.ok) return cache.put(url, res.clone());
            }).catch(function () {});
        }).catch(function () {});
    }

    function isInCache(url) {
        if (!("caches" in global)) return Promise.resolve(false);
        return caches.open(CACHE_NAME).then(function (cache) {
            return cache.match(url).then(function (r) {
                return !!r;
            });
        }).catch(function () {
            return false;
        });
    }

    /** Precarga secuencial en lotes para no saturar móvil */
    function preloadAll(onProgress) {
        var prefix = rootPrefix();
        var list = ASSETS.map(function (r) {
            return prefix + r;
        });
        var total = list.length;
        var done = 0;
        var failed = [];
        var CONCURRENCY = 4;

        return new Promise(function (resolve) {
            var i = 0;

            function next() {
                if (i >= total && active === 0) {
                    resolve({ failed: failed, total: total });
                    return;
                }
                while (active < CONCURRENCY && i < total) {
                    (function (url) {
                        active++;
                        /* primero intenta desde caché HTTP del navegador vía Image */
                        loadImage(url).then(function (res) {
                            if (!res.ok) failed.push(url);
                            else cachePut(url); /* refuerza Cache API */
                            done++;
                            active--;
                            if (onProgress) onProgress(done, total, url);
                            next();
                        });
                    })(list[i++]);
                }
            }
            var active = 0;
            next();
        });
    }

    function finish(overlay) {
        state.ready = true;
        try {
            localStorage.setItem(MANIFEST_KEY, CACHE_NAME + "|" + ASSETS.length);
        } catch (e) {}
        document.body.classList.remove("ss-loading");
        if (overlay) {
            overlay.classList.add("ss-done");
            setTimeout(function () {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }, 400);
        }
        try {
            document.dispatchEvent(new CustomEvent("ss-assets-ready"));
        } catch (e) {}
        if (typeof global.onSpaceStrikeAssetsReady === "function") {
            try {
                global.onSpaceStrikeAssetsReady();
            } catch (e2) {}
        }
    }

    function start(opts) {
        opts = opts || {};
        if (state.started) {
            return state.ready ? Promise.resolve() : waitReady();
        }
        state.started = true;
        document.body.classList.add("ss-loading");
        var overlay = ensureOverlay();

        /* Si el manifiesto local coincide y Cache API tiene todo, barra rápida */
        var skipHeavy = false;
        try {
            var m = localStorage.getItem(MANIFEST_KEY);
            if (m === CACHE_NAME + "|" + ASSETS.length) skipHeavy = true;
        } catch (e) {}

        setProgress(0, state.total, skipHeavy ? "Verificando caché…" : "Descargando texturas…");

        return preloadAll(function (done, total, url) {
            var name = (url || "").split("/").pop() || "";
            setProgress(done, total, (skipHeavy ? "OK · " : "Cargando · ") + name);
        }).then(function (res) {
            state.failed = res.failed || [];
            if (state.failed.length) {
                setProgress(res.total, res.total, "Listo · " + state.failed.length + " opcionales fallaron");
            } else {
                setProgress(res.total, res.total, "Todo listo");
            }
            setTimeout(function () {
                finish(overlay);
            }, 180);
        });
    }

    function waitReady() {
        if (state.ready) return Promise.resolve();
        return new Promise(function (resolve) {
            document.addEventListener(
                "ss-assets-ready",
                function () {
                    resolve();
                },
                { once: true }
            );
        });
    }

    function isReady() {
        return !!state.ready;
    }

    /** Guard para botones de juego: no navegar hasta estar listo */
    function guardClick(fn) {
        return function (ev) {
            if (!state.ready) {
                if (ev && ev.preventDefault) ev.preventDefault();
                start();
                return;
            }
            return fn.apply(this, arguments);
        };
    }

    global.SpaceStrikePreloader = {
        start: start,
        waitReady: waitReady,
        isReady: isReady,
        guardClick: guardClick,
        assets: ASSETS,
        CACHE_NAME: CACHE_NAME
    };

    /* Auto-start al cargar DOM */
    function boot() {
        start();
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})(typeof window !== "undefined" ? window : this);
