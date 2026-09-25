/* ================================================================
   SPACE STRIKE
   INDEX / MAIN MENU
   Version: 1.3.3
================================================================ */


/* ================================================================
   ELEMENTOS DEL DOM
================================================================ */

const spaceBackground = document.getElementById("space");
const transitionScreen = document.getElementById("transition");

const startGameButton =
    document.getElementById("startGameButton");

const howToPlayButton =
    document.getElementById("howToPlayButton");

const settingsButton =
    document.getElementById("settingsButton");

const adventureButton =
    document.getElementById("adventureButton");

const shopButton =
    document.getElementById("shopButton");

const premiumButton =
    document.getElementById("premiumButton");

const rewardsButton =
    document.getElementById("rewardsButton");

const googleAuthButton =
    document.getElementById("googleAuthButton");

const leaderboardButton =
    document.getElementById("leaderboardButton");

const achievementsButton =
    document.getElementById("achievementsButton");

const pilotLabel =
    document.getElementById("pilotLabel");

const noticeBanner =
    document.getElementById("noticeBanner");

const registerOverlay =
    document.getElementById("registerOverlay");

const pilotNameInput =
    document.getElementById("pilotNameInput");

const registerError =
    document.getElementById("registerError");

const registerConfirm =
    document.getElementById("registerConfirm");


/* ================================================================
   CONFIGURACIÓN DEL FONDO
================================================================ */

const STAR_COUNT_LIMIT = 180;


/* ================================================================
   CREAR ESTRELLAS
================================================================ */

function createStars() {

    if (!spaceBackground) {
        return;
    }

    /*
        Evita duplicar estrellas si esta función
        llegara a ejecutarse nuevamente.
    */

    spaceBackground.innerHTML = "";


    /*
        La cantidad de estrellas depende del tamaño
        de la pantalla.

        En pantallas grandes habrá más estrellas,
        mientras que en dispositivos pequeños
        reducimos la cantidad para no desperdiciar
        rendimiento.
    */

    const calculatedAmount =
        Math.floor(
            (
                window.innerWidth *
                window.innerHeight
            ) / 7000
        );


    const amount =
        Math.min(
            STAR_COUNT_LIMIT,
            Math.max(40, calculatedAmount)
        );


    for (let i = 0; i < amount; i++) {

        const star =
            document.createElement("div");


        star.classList.add("star");


        /*
            Tamaño aleatorio.
        */

        const isLargeStar =
            Math.random() < 0.15;


        const size =
            isLargeStar
                ? Math.random() * 2.5 + 1
                : Math.random() * 1.6 + 0.5;


        star.style.width =
            `${size}px`;

        star.style.height =
            `${size}px`;


        /*
            Posición aleatoria.
        */

        star.style.left =
            `${Math.random() * 100}%`;

        star.style.top =
            `${Math.random() * 100}%`;


        /*
            Animación aleatoria.
        */

        star.style.animationDuration =
            `${Math.random() * 3 + 1.5}s`;


        star.style.animationDelay =
            `${Math.random() * 3}s`;


        /*
            Algunas estrellas serán ligeramente
            menos brillantes.
        */

        if (Math.random() < 0.25) {

            star.style.opacity =
                `${Math.random() * 0.4 + 0.2}`;

        }


        spaceBackground.appendChild(star);
    }

}


/* ================================================================
   TRANSICIÓN DE PANTALLA
================================================================ */

function navigateTo(page) {

    /*
        Evita ejecutar la navegación varias veces
        mientras la transición está activa.
    */

    if (
        !transitionScreen ||
        transitionScreen.classList.contains("active")
    ) {
        return;
    }


    transitionScreen.classList.add("active");


    /*
        Pequeña pausa para permitir que la animación
        de salida sea visible antes de cambiar de página.
    */

    window.setTimeout(() => {

        window.location.href = page;

    }, 500);

}


/* ================================================================
   INICIAR MISIÓN
================================================================ */

function startGame() {

    ensurePilotRegistered(function () {
        navigateTo("html/game.html?mode=infinite");
    });

}


function openAdventure() {

    ensurePilotRegistered(function () {
        navigateTo("html/adventure.html");
    });

}


function openRewards() {
    navigateTo("html/rewards.html");
}

function openPremium() {
    navigateTo("html/premium.html");
}

function openShop() {

    navigateTo(
        "html/shop.html"
    );

}


function openLeaderboard() {

    navigateTo(
        "html/leaderboard.html"
    );

}

function openAchievements() {
    navigateTo("html/achievements.html");
}


/* ================================================================
   CÓMO JUGAR
================================================================ */

function openHowToPlay() {

    navigateTo(
        "html/howtoplay.html"
    );

}


/* ================================================================
   CONFIGURACIÓN
================================================================ */

function openSettings() {

    navigateTo(
        "html/settings.html"
    );

}


/* ================================================================
   EVENTOS DE LOS BOTONES
================================================================ */

function initializeButtons() {

    /*
        Botón iniciar misión.
    */

    if (startGameButton) {

        startGameButton.addEventListener(
            "click",
            startGame
        );

    }


    /*
        Botón cómo jugar.
    */

    if (howToPlayButton) {

        howToPlayButton.addEventListener(
            "click",
            openHowToPlay
        );

    }


    /*
        Botón configuración.
    */

    if (settingsButton) {

        settingsButton.addEventListener(
            "click",
            openSettings
        );

    }


    if (adventureButton) {

        adventureButton.addEventListener(
            "click",
            openAdventure
        );

    }


    if (shopButton) {

        if (rewardsButton) rewardsButton.addEventListener("click", openRewards);
        if (premiumButton) premiumButton.addEventListener("click", openPremium);
        if (googleAuthButton) {
            googleAuthButton.addEventListener("click", function () {
                if (!window.SpaceStrikeAuth) {
                    alert("Auth no cargó");
                    return;
                }
                googleAuthButton.disabled = true;
                SpaceStrikeAuth.signInGoogle().then(function (user) {
                    var u = user || (SpaceStrikeAuth.user && SpaceStrikeAuth.user());
                    var label = u && u.email ? u.email.split("@")[0].toUpperCase() : "GOOGLE";
                    googleAuthButton.textContent = "☁ " + label;
                    googleAuthButton.disabled = false;
                    try { refreshPilotUI(); } catch (e1) {}
                    return SpaceStrikeAuth.pull().then(function () {
                        try { refreshPilotUI(); } catch (e2) {}
                        alert("Sesión iniciada. Progreso sincronizado.");
                    }).catch(function (pullErr) {
                        console.warn("pull", pullErr);
                        alert("Sesión OK. (Sincronización pendiente: " + (pullErr && pullErr.message || pullErr) + ")");
                    });
                }).catch(function (err) {
                    console.warn("login", err);
                    googleAuthButton.disabled = false;
                    alert("No se pudo iniciar sesión con Google.\n" + (err && err.message ? err.message : err));
                });
            });
        }
        window.__onSpaceAuthChange = function (u) {
            if (googleAuthButton && u) {
                googleAuthButton.textContent = "☁ " + (u.email || "GOOGLE").split("@")[0].toUpperCase();
            }
            try { refreshPilotUI(); } catch (e) {}
        };
        shopButton.addEventListener(
            "click",
            openShop
        );

    }


    if (leaderboardButton) {

        leaderboardButton.addEventListener(
            "click",
            openLeaderboard
        );

    }

    if (achievementsButton) {
        achievementsButton.addEventListener("click", openAchievements);
    }

}


/* ================================================================
   ATAJOS DE TECLADO
================================================================ */

function initializeKeyboard() {

    document.addEventListener(
        "keydown",
        (event) => {

            /*
                Enter:
                iniciar misión.
            */

            if (
                event.key === "Enter" &&
                !event.repeat
            ) {

                startGame();

            }

        }
    );

}


/* ================================================================
   REGENERAR ESTRELLAS AL CAMBIAR EL TAMAÑO
   DE LA VENTANA
================================================================ */

let resizeTimer = null;


function initializeResizeHandler() {

    window.addEventListener(
        "resize",
        () => {

            /*
                Evita regenerar las estrellas
                decenas de veces durante un resize.
            */

            window.clearTimeout(
                resizeTimer
            );


            resizeTimer =
                window.setTimeout(
                    () => {

                        createStars();

                    },
                    200
                );

        }
    );

}


/* ================================================================
   INICIALIZACIÓN
================================================================ */


function refreshPilotUI() {
    const P = window.SpaceStrikePlayer;
    if (!P || !pilotLabel) return;
    const name = P.getName();
    pilotLabel.textContent = name ? ("PILOTO // " + name) : "SIN REGISTRO";
}

function ensurePilotRegistered(callback) {
    const P = window.SpaceStrikePlayer;
    if (!P) {
        if (callback) callback();
        return;
    }
    if (P.getName()) {
        if (callback) callback();
        return;
    }
    if (registerOverlay) {
        registerOverlay.classList.remove("hidden");
        if (pilotNameInput) {
            pilotNameInput.value = "";
            pilotNameInput.focus();
        }
        if (registerError) registerError.textContent = "";
        window.__afterRegister = callback;
    }
}

function bindRegister() {
    if (!registerConfirm) return;
    registerConfirm.addEventListener("click", function () {
        const P = window.SpaceStrikePlayer;
        if (!P || !pilotNameInput) return;
        const res = P.register(pilotNameInput.value);
        if (!res.ok) {
            if (registerError) registerError.textContent = res.error || "Error";
            return;
        }
        if (registerOverlay) registerOverlay.classList.add("hidden");
        refreshPilotUI();
        if (typeof window.__afterRegister === "function") {
            const cb = window.__afterRegister;
            window.__afterRegister = null;
            cb();
        }
    });
}

function showNotices() {
    const N = window.SpaceStrikeNotices;
    if (!N || !noticeBanner) return;
    const unread = N.unread();
    if (!unread.length) {
        noticeBanner.classList.add("hidden");
        return;
    }
    const n = unread[0];
    noticeBanner.classList.remove("hidden");
    noticeBanner.innerHTML = "<strong>" + n.title + "</strong>" + n.body + "<div style='margin-top:6px;opacity:.6;font-size:10px'>TOCA PARA CERRAR</div>";
    noticeBanner.onclick = function () {
        N.markRead(n.id);
        showNotices();
    };
}


function initializeMenu() {

    createStars();

    initializeButtons();

    initializeKeyboard();

    initializeResizeHandler();

    bindRegister();
    refreshPilotUI();
    showNotices();

}


/* ================================================================
   ARRANCAR MENÚ
================================================================ */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeMenu
    );

} else {

    initializeMenu();

}