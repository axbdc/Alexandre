// frontend/src/admin/RequireAuth.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseAdmin";

const RequireAuth = ({ children }) => {
    const [status, setStatus] = useState("loading"); // loading | in | out

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setStatus(user ? "in" : "out");
        });
        return unsub;
    }, []);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-bone flex items-center justify-center">
                <span className="overline text-mist">A carregar…</span>
            </div>
        );
    }

    if (status === "out") {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default RequireAuth;
