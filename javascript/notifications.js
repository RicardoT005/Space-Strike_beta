/* SPACE STRIKE — In-game news / update notices v1.3.0 */

const NOTICES_KEY = "spaceStrikeNoticesRead";

const NOTICES = [
    {
        id: "v260",
        title: "NAVE NEBULA ★★",
        body: "Nave especial exclusiva (código). Doble cañón, escudo 3, disparo rojo, 10% láser."
    },
    {
        id: "v250",
        title: "PARCHE 2.5.0",
        body: "EMP más corto, bonus créditos 8%, gráficos AUTO/BAJO/MEDIO/ALTO, evolución visual de nave."
    },
    {
        id: "v230",
        title: "PREMIUM 2.3.0",
        body: "Naves exclusivas Phoenix/Void Runner, +50% créditos e insignia VIP. Menú → Premium."
    },
    {
        id: "v210",
        title: "ACTUALIZACIÓN 2.1.0",
        body: "Ranking GLOBAL con Firebase. Juega infinito y sube al top mundial."
    },
    {
        id: "v200",
        title: "REMASTER 2.0.0",
        body: "Habilidades EMP/OVER/NOVA, escudo regenerable, asteroides, eventos, logros y rango XP."
    },
    {
        id: "v140",
        title: "ACTUALIZACIÓN 1.4.0",
        body: "Combos, stats de misión, jefe en 2 fases. Cañón doble + ráfaga ya funcionan juntos."
    },
    {
        id: "v134",
        title: "ACTUALIZACIÓN 1.3.4",
        body: "Oleadas por enemigos (no puntos). Jefes cada 10 oleadas. Enemigos y jefes más resistentes."
    },
    {
        id: "v130",
        title: "ACTUALIZACIÓN 1.3.0",
        body: "Logo Multisoft, 40 sectores, 5 enemigos, jefe cada 50 oleadas, ranking local y más mejoras en la tienda."
    },
    {
        id: "v121",
        title: "CONTROLES Y FPS",
        body: "Personaliza joystick/FIRE en Configuración. Contador de FPS y optimización móvil."
    },
    {
        id: "future",
        title: "PRÓXIMAMENTE",
        body: "Ranking online global, más jefes de aventura y power-ups en mapa. ¡Sigue las novedades aquí!"
    }
];

function getReadIds() {
    try {
        const raw = localStorage.getItem(NOTICES_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
    } catch (e) {
        return [];
    }
}

function markRead(id) {
    const ids = getReadIds();
    if (ids.indexOf(id) === -1) {
        ids.push(id);
        try {
            localStorage.setItem(NOTICES_KEY, JSON.stringify(ids));
        } catch (e) {}
    }
}

function getUnread() {
    const read = getReadIds();
    return NOTICES.filter(function (n) {
        return read.indexOf(n.id) === -1;
    });
}

if (typeof window !== "undefined") {
    window.SpaceStrikeNotices = {
        all: NOTICES,
        unread: getUnread,
        markRead: markRead
    };
}
