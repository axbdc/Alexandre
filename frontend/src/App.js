import React, { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import SelectedWorks from "@/components/SelectedWorks";
import Marquee from "@/components/Marquee";
import AboutServices from "@/components/AboutServices";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import CustomCursor from "@/components/CustomCursor";
import RichMediaViewer from "@/components/RichMediaViewer";
import AdminLogin from "@/admin/AdminLogin";
import AdminProjects from "@/admin/AdminProjects";
import RequireAuth from "@/admin/RequireAuth";

const Portfolio = () => {
    useEffect(() => {
        document.documentElement.style.scrollBehavior = "smooth";
        return () => {
            document.documentElement.style.scrollBehavior = "";
        };
    }, []);

    return (
        <div className="App grain" data-testid="portfolio-root">
            <CustomCursor />
            <Navigation />
            <main>
                <Hero />
                <Marquee />
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
            </BrowserRouter>
        </LanguageProvider>
    );
}

export default App;
