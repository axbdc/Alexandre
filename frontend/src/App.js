import React, { useEffect, lazy, Suspense } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import SelectedWorks from "@/components/SelectedWorks";
import AboutServices from "@/components/AboutServices";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import Loader from "@/components/Loader";
// Páginas que o visitante normal não abre: carregadas só quando são precisas,
// para não pesarem no site público (admin + login do Firebase).
const RichMediaViewer = lazy(() => import("@/components/RichMediaViewer"));
const AdminLogin = lazy(() => import("@/admin/AdminLogin"));
const AdminProjects = lazy(() => import("@/admin/AdminProjects"));
const RequireAuth = lazy(() => import("@/admin/RequireAuth"));

const Portfolio = () => {
    // Scroll suave (Lenis): a página desliza com inércia em vez de saltar.
    // Desligado com "reduzir movimento"; no telemóvel o scroll continua nativo.
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
        let lenis = null;
        let raf = 0;
        let cancelled = false;
        import("lenis").then(({ default: Lenis }) => {
            if (cancelled) return;
            lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
            window.__lenis = lenis;
            // durante o ecrã de entrada o scroll fica parado
            const html = document.documentElement;
            let locked = html.classList.contains("intro-lock");
            if (locked) lenis.stop();
            const sync = () => {
                const now = html.classList.contains("intro-lock");
                if (now === locked) return; // só reage quando o ecrã de entrada abre/fecha
                locked = now;
                if (now) lenis.stop();
                else lenis.start();
            };
            const mo = new MutationObserver(sync);
            mo.observe(html, { attributes: true, attributeFilter: ["class"] });
            lenis.__mo = mo;
            const loop = (time) => {
                lenis.raf(time);
                raf = requestAnimationFrame(loop);
            };
            raf = requestAnimationFrame(loop);
        });
        return () => {
            cancelled = true;
            cancelAnimationFrame(raf);
            if (lenis) {
                if (lenis.__mo) lenis.__mo.disconnect();
                lenis.destroy();
            }
            window.__lenis = null;
        };
    }, []);

    return (
        <div className="App site-zoom theme-neutral" data-testid="portfolio-root">
            <Loader />
            <Navigation />
            <main>
                <Hero />
                <SelectedWorks />
                <AboutServices />
                <Experience />
                <Contact />
            </main>
        </div>
    );
};

function App() {
    return (
        <LanguageProvider>
            <BrowserRouter>
                <Suspense fallback={null}>
                <Routes>
                    <Route path="/" element={<Portfolio />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route
                        path="/admin"
                        element={
                            <RequireAuth>
                                <AdminProjects />
                            </RequireAuth>
                        }
                    />
                    <Route path="/rm/:id" element={<RichMediaViewer />} />
                    <Route path="*" element={<Portfolio />} />
                </Routes>
                </Suspense>
            </BrowserRouter>
        </LanguageProvider>
    );
}

export default App;
