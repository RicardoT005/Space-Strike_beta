/* SPACE STRIKE — Special texture skins (cosmetic, permanent unlock via codes) */
(function () {
    var OWNED_KEY = "spaceStrikeOwnedSkins";
    var EQUIPPED_KEY = "spaceStrikeEquippedSkin";

    var SKIN_CATALOG = {
        horror_jason: {
            id: "horror_jason",
            name: "JASON · VIERNES 13",
            desc: "Skin de combate con máscaras hockey. Montable en Assalto / Interceptor.",
            ships: ["assault", "interceptor", "nebula"],
            sprite: "../img/texturas-especiales/skins/horror_jason.png",
            event: "horror_pack"
        },
        horror_chucky: {
            id: "horror_chucky",
            name: "CHUCKY · MUÑECO",
            desc: "Skin roja con caras de muñeco. Assalto / Interceptor.",
            ships: ["assault", "interceptor", "nebula"],
            sprite: "../img/texturas-especiales/skins/horror_chucky.png",
            event: "horror_pack"
        },
        horror_freddy: {
            id: "horror_freddy",
            name: "FREDDY · ALAS",
            desc: "Rostros de pesadilla en las alas. Assalto / Spectre.",
            ships: ["assault", "spectre", "nebula"],
            sprite: "../img/texturas-especiales/skins/horror_freddy.png",
            event: "horror_pack"
        },
        horror_rpd_drone: {
            id: "horror_rpd_drone",
            name: "R.P.D. DRON HORROR",
            desc: "Textura de dron policial (solo con nave R.P.D.).",
            ships: ["rpd"],
            sprite: "../img/texturas-especiales/skins/horror_rpd_drone.png",
            event: "horror_pack",
            drone: true
        },
        horror_rpd: {
            id: "horror_rpd",
            name: "R.P.D. TACTICAL HORROR",
            desc: "Casco militar R.P.D. con sangre. Solo R.P.D. LEON.",
            ships: ["rpd"],
            sprite: "../img/texturas-especiales/skins/horror_rpd.png",
            event: "horror_pack"
        },
        horror_jason_mil: {
            id: "horror_jason_mil",
            name: "JASON MILITAR",
            desc: "Caza militar con máscaras. Tanque / Assalto.",
            ships: ["tank", "assault", "nebula"],
            sprite: "../img/texturas-especiales/skins/horror_jason_mil.png",
            event: "horror_pack"
        },
        horror_jason_02: {
            id: "horror_jason_02",
            name: "JASON 02/20",
            desc: "Caza pesado numerado. Assalto / Tanque.",
            ships: ["assault", "tank", "nebula"],
            sprite: "../img/texturas-especiales/skins/horror_jason_02.png",
            event: "horror_pack"
        },
        horror_freddy_hat: {
            id: "horror_freddy_hat",
            name: "FREDDY SOMBRERO",
            desc: "Pesadilla con sombrero y garras. Tanque / Destructor.",
            ships: ["tank", "destroyer", "nebula"],
            sprite: "../img/texturas-especiales/skins/horror_freddy_hat.png",
            event: "horror_pack"
        },
        horror_freddy_claw: {
            id: "horror_freddy_claw",
            name: "FREDDY GARRA",
            desc: "Guante de garras doradas. R.P.D. / Tanque.",
            ships: ["rpd", "tank", "nebula"],
            sprite: "../img/texturas-especiales/skins/horror_freddy_claw.png",
            event: "horror_pack"
        },
        horror_delta: {
            id: "horror_delta",
            name: "DELTA JASON",
            desc: "Ala delta con máscaras. Spectre / Interceptor.",
            ships: ["spectre", "interceptor", "nebula"],
            sprite: "../img/texturas-especiales/skins/horror_delta.png",
            event: "horror_pack"
        },
        horror_freddy_heavy: {
            id: "horror_freddy_heavy",
            name: "FREDDY HEAVY",
            desc: "Acorazado de pesadilla. Tanque / Destructor.",
            ships: ["tank", "destroyer", "nebula"],
            sprite: "../img/texturas-especiales/skins/horror_freddy_heavy.png",
            event: "horror_pack"
        },
        horror_freddy_delta: {
            id: "horror_freddy_delta",
            name: "FREDDY DELTA",
            desc: "Caza delta con garras en motores. Spectre / Assalto.",
            ships: ["spectre", "assault", "nebula"],
            sprite: "../img/texturas-especiales/skins/horror_freddy_delta.png",
            event: "horror_pack"
        }
    };

    function loadOwned() {
        try {
            var raw = localStorage.getItem(OWNED_KEY);
            var arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr : [];
        } catch (e) { return []; }
    }

    function saveOwned(list) {
        try { localStorage.setItem(OWNED_KEY, JSON.stringify(list)); } catch (e) {}
        try {
            if (window.SpaceStrikeAuth && window.SpaceStrikeAuth.pushCloud) {
                window.SpaceStrikeAuth.pushCloud();
            }
        } catch (e2) {}
    }

    function owns(id) {
        return loadOwned().indexOf(id) >= 0;
    }

    function grant(id) {
        id = String(id || "").toLowerCase().trim();
        if (!SKIN_CATALOG[id]) return { ok: false, error: "Skin desconocida: " + id };
        var list = loadOwned();
        if (list.indexOf(id) >= 0) return { ok: true, already: true, skin: id };
        list.push(id);
        saveOwned(list);
        return { ok: true, already: false, skin: id };
    }

    function getEquipped() {
        try { return localStorage.getItem(EQUIPPED_KEY) || ""; } catch (e) { return ""; }
    }

    function equip(id) {
        id = String(id || "").trim();
        if (!id) {
            try { localStorage.removeItem(EQUIPPED_KEY); } catch (e) {}
            return { ok: true, equipped: "" };
        }
        if (!SKIN_CATALOG[id]) return { ok: false, error: "Skin no existe" };
        if (!owns(id)) return { ok: false, error: "No posees esta skin" };
        var shipId = "interceptor";
        try {
            if (window.SpaceStrikeShips && window.SpaceStrikeShips.getEquippedId) {
                shipId = window.SpaceStrikeShips.getEquippedId();
            }
        } catch (e) {}
        var skin = SKIN_CATALOG[id];
        if (skin.ships && skin.ships.indexOf(shipId) < 0) {
            return { ok: false, error: "Esta skin no monta en " + shipId + ". Usa: " + skin.ships.join(", ") };
        }
        try { localStorage.setItem(EQUIPPED_KEY, id); } catch (e2) {}
        try {
            if (window.SpaceStrikeAuth && window.SpaceStrikeAuth.pushCloud) window.SpaceStrikeAuth.pushCloud();
        } catch (e3) {}
        return { ok: true, equipped: id };
    }

    function getActiveSprite(shipId) {
        var eq = getEquipped();
        if (!eq || !owns(eq)) return null;
        var skin = SKIN_CATALOG[eq];
        if (!skin) return null;
        if (skin.drone) return null; /* drone handled separately */
        if (skin.ships && shipId && skin.ships.indexOf(shipId) < 0) return null;
        return skin.sprite || null;
    }

    function getActiveDroneSprite() {
        var eq = getEquipped();
        if (!eq || !owns(eq)) return null;
        var skin = SKIN_CATALOG[eq];
        if (skin && skin.drone) return skin.sprite;
        return null;
    }

    function listForShip(shipId) {
        var out = [];
        Object.keys(SKIN_CATALOG).forEach(function (k) {
            var s = SKIN_CATALOG[k];
            if (!s.ships || s.ships.indexOf(shipId) >= 0) {
                out.push(Object.assign({}, s, { owned: owns(k), equipped: getEquipped() === k }));
            }
        });
        return out;
    }

    function mergeFromCloud(data) {
        if (!data) return;
        if (Array.isArray(data.ownedSkins)) {
            var cur = loadOwned();
            data.ownedSkins.forEach(function (id) {
                if (cur.indexOf(id) < 0) cur.push(id);
            });
            saveOwned(cur);
        }
        if (data.equippedSkin) {
            try { localStorage.setItem(EQUIPPED_KEY, data.equippedSkin); } catch (e) {}
        }
    }

    function collectForCloud() {
        return {
            ownedSkins: loadOwned(),
            equippedSkin: getEquipped() || ""
        };
    }

    window.SpaceStrikeSkins = {
        catalog: SKIN_CATALOG,
        owns: owns,
        grant: grant,
        equip: equip,
        unequip: function () { return equip(""); },
        getEquipped: getEquipped,
        getActiveSprite: getActiveSprite,
        getActiveDroneSprite: getActiveDroneSprite,
        listForShip: listForShip,
        loadOwned: loadOwned,
        mergeFromCloud: mergeFromCloud,
        collectForCloud: collectForCloud
    };
})();