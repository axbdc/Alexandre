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
import CustomCursor from "@/components/CustomCursor";
// Páginas que o visitante normal não abre: carregadas só quando são precisas,
// para não pesarem no site público (admin + login do Firebase).
const RichMediaViewer = lazy(() => import("@/components/RichMediaViewer"));
const AdminLogin = lazy(() => import("@/admin/AdminLogin"));
const AdminProjects = lazy(() => import("@/admin/AdminProjects"));
const RequireAuth = lazy(() => import("@/admin/RequireAuth"));

const Portfolio = () => {
    useEffect(() => {
        document.documentElement.style.scrollBehavior = "smooth";
        return () => {
            document.documentElement.style.scrollBehavior = "";
        };
    }, []);

    return (
        <div className="App site-zoom theme-neutral" data-testid="portfolio-root">
            <CustomCursor />
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
