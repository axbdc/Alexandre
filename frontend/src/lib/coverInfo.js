// Descobre se a capa é um logo com fundo transparente e qual é a cor da marca.
// Logo transparente -> cartão "marca": fundo liso com um tom suave da cor da
// marca e o logo ao centro. Imagem normal -> ocupa o cartão todo.
// O resultado fica guardado (memória + localStorage) para não repetir.
import { cld } from "./img";

const KEY = "ptf:cover-info:v2";
let store = {};
try {
    store = JSON.parse(localStorage.getItem(KEY) || "{}");
} catch (e) {
    store = {};
}
const save = () => {
    try {
        localStorage.setItem(KEY, JSON.stringify(store));
    } catch (e) {
        /* ignora */
    }
};
const pending = {};

const analyse = (url) =>
    new Promise((resolve) => {
        const im = new Image();
        im.crossOrigin = "anonymous";
        im.onload = () => {
            try {
                const S = 48;
                const c = document.createElement("canvas");
                c.width = S;
                c.height = S;
                const x = c.getContext("2d", { willReadFrequently: true });
                x.drawImage(im, 0, 0, S, S);
                const d = x.getImageData(0, 0, S, S).data;
                let clear = 0;
                let total = 0;
                // cor da marca: média dos píxeis opacos mais saturados
                let r = 0, g = 0, b = 0, w = 0;
                let opaque = 0;
                let light = 0;
                for (let i = 0; i < d.length; i += 4) {
                    total++;
                    const a = d[i + 3];
                    if (a < 20) {
                        clear++;
                        continue;
                    }
                    const R = d[i], G = d[i + 1], B = d[i + 2];
                    const mx = Math.max(R, G, B), mn = Math.min(R, G, B);
                    opaque++;
                    const lum = (0.2126 * R + 0.7152 * G + 0.0722 * B) / 255;
                    if (lum > 0.82 && mx - mn < 40) light++;
                    const sat = mx ? (mx - mn) / mx : 0;
                    const wt = sat * sat * (a / 255);
                    r += R * wt;
                    g += G * wt;
                    b += B * wt;
                    w += wt;
                }
                const logo = clear / total > 0.12;
                const color = w > 0.5 ? [Math.round(r / w), Math.round(g / w), Math.round(b / w)] : null;
                // logo com muito branco (texto branco, versão negativa): fundo escuro
                const dark = logo && opaque > 0 && light / opaque > 0.15;
                resolve({ logo, color, dark });
            } catch (e) {
                resolve({ logo: false, color: null });
            }
        };
        im.onerror = () => resolve({ logo: false, color: null });
        // PNG para manter a transparência
        im.src = cld(url, 200).replace("f_auto,", "f_png,");
    });

export const getCoverInfo = (url) => {
    if (!url) return Promise.resolve({ logo: false, color: null });
    if (store[url]) return Promise.resolve(store[url]);
    if (!pending[url]) {
        pending[url] = analyse(url).then((info) => {
            store[url] = info;
            save();
            return info;
        });
    }
    return pending[url];
};

export const peekCoverInfo = (url) => store[url] || null;

// Fundo escuro para logos claros: cor da marca bem escurecida.
export const brandDark = (color) => {
    const base = [28, 27, 26];
    if (!color) return "rgb(28 27 26)";
    const m = base.map((v, i) => Math.round(v * 0.78 + color[i] * 0.22));
    return `rgb(${m[0]} ${m[1]} ${m[2]})`;
};

// Tom suave da cor da marca, misturado com o fundo do site.
export const brandTint = (color, amount = 0.13) => {
    const base = [244, 242, 238];
    if (!color) return "rgb(232 229 223)";
    const m = base.map((v, i) => Math.round(v * (1 - amount) + color[i] * amount));
    return `rgb(${m[0]} ${m[1]} ${m[2]})`;
};
