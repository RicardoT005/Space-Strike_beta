/* SPACE STRIKE — In-game news / update notices v1.3.0 */

const NOTICES_KEY = "spaceStrikeNoticesRead";

const NOTICES = [
    {
        id: "v290",
        title: "VERSIÓN 2.9.0 — MISILES",
        body: "Destructor lanza misiles teledirigidos. Tienda: cantidad, ojiva y radio. En Infinito, oleadas 9/19/29… elige mejora de misil."
    },
    {
        id: "v279",
        title: "VT-03 VANGUARD PREMIUM",
        body: "Nueva nave premium VT-03. Fase 1 bombardero · botón TRANS suelta las alas y pasa a modo caza (más rápido y más cadencia)."
    },
    {
        id: "v275",
        title: "PARCHE 2.7.5",
        body: "Jefe Overlord cada 10 oleadas en Infinito y Aventura (para pruebas). Cuota de spawn alineada con el jefe."
    },
    {
        id: "v272",
        title: "PARCHE 2.7.2",
        body: "Destructor con textura T-Wind. Nebula: habilidades FASE, TORMENTA LÁSER y recarga de ESCUDO."
    },
    {
        id: "v271",
        title: "R.P.D. DRON POLICIAL",
        body: "La nave R.P.D. LEON trae dron de apoyo. El dron aplica INMU, PENTA 5 vías y el ORBE médico (1 uso)."
    },
    {
        id: "v270",
        title: "VERSIÓN 2.7.0 — R.P.D. LEON",
        body: "Nueva nave especial R.P.D. LEON (código). Habilidades: INMU 3s · PENTA 5 vías 4s · CURA orbe 1 uso (todas las vidas). Disparo azul."
    },
    {
        id: "v2618",
        title: "PARCHE 2.6.18",
        body: "Ranking global: sube automáticamente tu récord local. Botón SUBIR MI RÉCORD en Ranking si no apareces."
    },
    {
        id: "v2617",
        title: "PARCHE 2.6.17",
        body: "Fix infinito: enemigos volvían a salir tras oleada 10. Sugerencias por WhatsApp. Login Google obligatorio para guardar progreso."
    },
    {
        id: "v2616",
        title: "PARCHE 2.6.16",
        body: "Habilidades EMP/OVER/NOVA se compran en la Tienda y se activan tocando los botones. Tras perder una vida puedes moverte. Jefe Overlord (aventura x10 / infinito x50). Premium admin y badge dorado."
    },
    {
        id: "v2615",
        title: "PARCHE 2.6.15",
        body: "Al perder una vida puedes moverte (sin disparar) durante la invulnerabilidad para escapar."
    },
    {
        id: "v2614",
        title: "JEFE OVERLORD",
        body: "Nuevo jefe con sprite. Aventura cada 10 niveles · Infinito cada 50 oleadas."
    },
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
