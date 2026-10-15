---
Hazard_Round_16-1:
Hazard_Round_16-2:
Hazard_Round_8-1:
Hazard_Round_16-3:
Hazard_Round_16-4:
Hazard_Round_8-2:
Hazard_Round_4-1:
Hazard_Round_16-5:
Hazard_Round_16-6:
Hazard_Round_8-3:
Hazard_Round_16-7:
Hazard_Round_16-8:
Hazard_Round_8-4:
Hazard_Round_4-2:
Hazard_Round_16-9:
Hazard_Round_16-10:
Hazard_Round_8-5:
Hazard_Round_16-11:
Hazard_Round_16-12:
Hazard_Round_8-6:
Hazard_Round_4-3:
Hazard_Round_16-13:
Hazard_Round_16-14:
Hazard_Round_8-7:
Hazard_Round_16-15:
Hazard_Round_16-16:
Hazard_Round_8-8:
Hazard_Round_4-4:
Hazard_Round_2-1:
Hazard_Round_2-2:
Winner:
cssclasses:
  - frame-full
  - Movie_Cards
---





```dataviewjs
const current = dv.current();
const avatarCache = new Map();
const classAvatarMap = {};
const classNameMap = {};

/* ================= MAP ROUND → CSS CLASS ================= */

function convertToClass(round, slot) {

    if (round === 16)
        return slot <= 8 ? `l${slot}` : `r${slot - 8}`;

    if (round === 8)
        return slot <= 4 ? `l${8 + slot}` : `r${8 + slot - 4}`;

    if (round === 4)
        return slot <= 2 ? `l${12 + slot}` : `r${12 + slot - 2}`;

    if (round === 2)
        return slot === 1 ? "l15" : "r15";

    return null;
}

function randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/* fallback avatar */
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";

/* ================= BUILD MAP ================= */

const hazardKeys = Object.keys(current)
    .filter(k => k.startsWith("Hazard_Round_"))
    .map(k => {
        const match = k.match(/Hazard_Round_(\d+)-(\d+)/);
        if (!match) return null;

        return {
            round: parseInt(match[1]),
            slot: parseInt(match[2]),
            value: current[k]
        };
    })
    .filter(Boolean);

for (const item of hazardKeys) {

    const cssClass = convertToClass(item.round, item.slot);
    if (!cssClass) continue;

    const cacheKey = item.value?.path ?? `empty-${item.round}-${item.slot}`;

    if (item.value) {
        classNameMap[cssClass] = item.value.path
            .split('/')
            .pop()
            .replace('.md','')
            .replace(/^.*~\s*/,'')
            .split(' - ')[0]; // lấy tên hover
    }

    if (!avatarCache.has(cacheKey)) {

        const page = item.value ? dv.page(item.value.path) : null;
            
		// lấy avatar từ YAML mới
		const avatars =
		    page?.Eva_Display_Ecstasy?.[0]?.Z___Avatar?.length
		        ? page.Eva_Display_Ecstasy[0].Z___Avatar
		        : [DEFAULT_AVATAR];
        


        avatarCache.set(cacheKey, randomPick(avatars));
    }

    classAvatarMap[cssClass] = avatarCache.get(cacheKey);
}

/* ================= RENDER ================= */

const container = dv.container.createEl("div", { cls: "bracket" });

for (const cls in classAvatarMap) {

    container.createEl("img", {
        cls: `avatar ${cls}`,
        attr: {
            src: classAvatarMap[cls],
            title: classNameMap[cls] || "" // hover hiện tên
        }
    });
}

/* ================= SAFE SVG BRACKET DRAW ================= */

requestAnimationFrame(() => {
requestAnimationFrame(() => {

    const get = (c) => container.querySelector("." + c);

    const center = (el) => {
        if (!el) return null;

        const r = el.getBoundingClientRect();
        const c = container.getBoundingClientRect();

        return {
            x: r.left - c.left + r.width / 2,
            y: r.top - c.top + r.height / 2
        };
    };

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");

    svg.style.position = "absolute";
    svg.style.inset = "0";
    svg.style.zIndex = "1";
    svg.style.pointerEvents = "none";

    svg.setAttribute("width", container.clientWidth);
    svg.setAttribute("height", container.clientHeight);

    container.prepend(svg);

    const path = (a, b) => {

        if (!a || !b) return;

        const midX = (a.x + b.x) / 2;

        const d = `
            M ${a.x} ${a.y}
            H ${midX}
            V ${b.y}
            H ${b.x}
        `;

        const p = document.createElementNS(svgNS, "path");

        p.setAttribute("d", d);
        p.setAttribute("fill", "none");
        p.setAttribute("stroke", "#e2e8f0");
        p.setAttribute("stroke-width", "2");

        svg.appendChild(p);
    };

    const leftRounds = [
        ["l1","l2","l3","l4","l5","l6","l7","l8"],
        ["l9","l10","l11","l12"],
        ["l13","l14"],
        ["l15"]
    ];

    for (let i = 0; i < leftRounds.length - 1; i++) {

        const cur = leftRounds[i];
        const next = leftRounds[i + 1];

        for (let j = 0; j < cur.length; j += 2) {

            const a = get(cur[j]);
            const b = get(cur[j + 1]);
            const p = get(next[Math.floor(j / 2)]);

            if (a && p) path(center(a), center(p));
            if (b && p) path(center(b), center(p));
        }
    }

    const rightRounds = [
        ["r1","r2","r3","r4","r5","r6","r7","r8"],
        ["r9","r10","r11","r12"],
        ["r13","r14"],
        ["r15"]
    ];

    for (let i = 0; i < rightRounds.length - 1; i++) {

        const cur = rightRounds[i];
        const next = rightRounds[i + 1];

        for (let j = 0; j < cur.length; j += 2) {

            const a = get(cur[j]);
            const b = get(cur[j + 1]);
            const p = get(next[Math.floor(j / 2)]);

            if (a && p) path(center(a), center(p));
            if (b && p) path(center(b), center(p));
        }
    }

});
});
```



