//
// Preenche estes dois valores (não são segredo):
//  - CLOUDINARY_CLOUD  = o teu "cloud name" (Cloudinary → Dashboard, no topo)
//  - CLOUDINARY_PRESET = nome de um "upload preset" UNSIGNED que crias em
//    Cloudinary → Settings → Upload → Upload presets → Add → Signing Mode: Unsigned
//
export const CLOUDINARY_CLOUD = "dtfcvu4gu";
export const CLOUDINARY_PRESET = "portfolio";

// Modelos 3D (GLB/USDZ) vão como "raw": o tipo "auto" trata o GLB como imagem
// e rejeita-o, e o USDZ nem é reconhecido.
const isModel = (file) => /\.(glb|gltf|usdz)$/i.test(file.name || "");
const MAX_MB = 10; // limite por ficheiro no plano grátis do Cloudinary

export async function uploadToCloudinary(file) {
    if (isModel(file) && file.size > MAX_MB * 1024 * 1024) {
        throw new Error(
            `${file.name} tem ${(file.size / 1048576).toFixed(1)} MB; o limite é ${MAX_MB} MB. Comprime o modelo e tenta outra vez.`,
        );
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_PRESET);

    const res = await fetch(
        // "auto" aceita imagens e vídeos
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/${isModel(file) ? "raw" : "auto"}/upload`,
        { method: "POST", body: fd },
    );
    if (!res.ok) {
        let detail = "";
        try {
            detail = (await res.json())?.error?.message || "";
        } catch (_) {
            /* ignora */
        }
        throw new Error(`erro ${res.status}${detail ? ": " + detail : ""}`);
    }
    const data = await res.json();
    // Vídeos: entrega sempre em .mp4 (o Cloudinary converte), para tocar em
    // qualquer browser mesmo que o original seja .mov.
    if (data.resource_type === "video") {
        return data.secure_url.replace(/\.[a-z0-9]+$/i, ".mp4");
    }
    return data.secure_url;
}
