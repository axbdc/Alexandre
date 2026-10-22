import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Smartphone, RotateCcw } from "lucide-react";
import { loadModelViewer } from "../lib/ar";

// Visualizador 3D para o computador: a AR só funciona no telemóvel, por isso
// aqui mostramos o modelo a mexer (animações em loop), com aviso e um QR code
// para abrir o projeto diretamente no telemóvel.
// O <model-viewer> e o gerador de QR só são descarregados quando isto abre.
const ARViewer = ({ project, title, lang, onClose }) => {
    const [ready, setReady] = useState(false);
    const [failed, setFailed] = useState(false);
    const [qr, setQr] = useState("");
    const mvRef = useRef(null);
    const PT = lang === "PT";

    useEffect(() => {
        let on = true;
        loadModelViewer()
            .then(() => on && setReady(true))
            .catch(() => on && setFailed(true));
        // QR code para abrir este projeto no telemóvel
        import("qrcode-generator")
            .then(({ default: qrcode }) => {
                if (!on) return;
                const url = `${window.location.origin}/?p=${encodeURIComponent(project.id)}`;
                const q = qrcode(0, "M");
                q.addData(url);
                q.make();
                setQr(q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }));
            })
            .catch(() => {});
        return () => {
            on = false;
        };
    }, [project.id]);

    const reset = () => {
        const mv = mvRef.current;
        if (mv && mv.resetTurntableRotation) {
            mv.cameraOrbit = "auto auto auto";
            mv.resetTurntableRotation();
            mv.jumpCameraToGoal && mv.jumpCameraToGoal();
        }
    };

    return (
        <motion.div
            className="ar-viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            data-no-drag
        >
            <div className="ar-viewer-bar">
                <span className="pm-kicker">
                    {PT ? "Pré-visualização 3D" : "3D preview"}
                    <span className="pm-dot" />
                    {title}
                </span>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={reset} className="pm-btn" aria-label={PT ? "Repor vista" : "Reset view"}>
                        <RotateCcw size={16} />
                    </button>
                    <button type="button" onClick={onClose} className="pm-btn pm-btn-close" aria-label={PT ? "Fechar" : "Close"}>
                        <X size={16} />
                    </button>
                </div>
            </div>

            <div className="ar-viewer-stage">
                {ready && project.model_glb ? (
                    <model-viewer
                        ref={mvRef}
                        src={project.model_glb}
                        ios-src={project.model_usdz || undefined}
                        poster={project.cover || undefined}
                        alt={title}
                        camera-controls
                        auto-rotate
                        autoplay
                        shadow-intensity="1"
                        exposure="1"
                        interaction-prompt="auto"
                        style={{ width: "100%", height: "100%", background: "transparent" }}
                    />
                ) : (
                    <div className="ar-viewer-loading">
                        {failed
                            ? PT
                                ? "Não foi possível carregar o modelo 3D."
                                : "Couldn't load the 3D model."
                            : PT
                              ? "A carregar o modelo 3D…"
                              : "Loading the 3D model…"}
                    </div>
                )}
            </div>

            <div className="ar-viewer-note">
                <div className="ar-viewer-note-text">
                    <Smartphone size={20} className="shrink-0" />
                    <div>
                        <div className="pm-label">
                            {PT ? "A realidade aumentada só funciona no telemóvel" : "Augmented reality only works on a phone"}
                        </div>
                        <p>
                            {PT
                                ? "Aqui podes rodar e ver o modelo animado. Para o pores no teu espaço, lê o código com a câmara do telemóvel e carrega em “Ver em realidade aumentada”."
                                : "Here you can rotate and watch the animated model. To place it in your space, scan the code with your phone camera and tap “View in augmented reality”."}
                        </p>
                    </div>
                </div>
                {qr ? <div className="ar-viewer-qr" aria-label="QR code" dangerouslySetInnerHTML={{ __html: qr }} /> : null}
            </div>
        </motion.div>
    );
};

export default ARViewer;
