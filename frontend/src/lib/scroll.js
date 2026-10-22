// Scroll suave: usa o Lenis (ver App.js) quando existe; senão, o scroll nativo.
export const scrollToId = (id) => {
    const el = id === "top" ? 0 : document.getElementById(id);
    if (el === null) return;
    if (window.__lenis) {
        window.__lenis.scrollTo(el, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
        return;
    }
    if (el === 0) window.scrollTo({ top: 0, behavior: "smooth" });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
};
