// frontend/src/lib/cloudinary.js
//
// Preenche estes dois valores (não são segredo):
//  - CLOUDINARY_CLOUD  = o teu "cloud name" (Cloudinary → Dashboard, no topo)
//  - CLOUDINARY_PRESET = nome de um "upload preset" UNSIGNED que crias em
//    Cloudinary → Settings → Upload → Upload presets → Add → Signing Mode: Unsigned
//
export const CLOUDINARY_CLOUD = "dtfcvu4gu";
export const CLOUDINARY_PRESET = "portfolio";

export async function uploadToCloudinary(file) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_PRESET);

    const res = await fetch(
        // "auto" aceita imagens e vídeos
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`,
        { method: "POST", body: fd },
    );
    if (!res.ok) throw new Error("upload falhou (" + res.status + ")");
    const data = await res.json();
    // Vídeos: entrega sempre em .mp4 (o Cloudinary converte), para tocar em
    // qualquer browser mesmo que o original seja .mov.
    if (data.resource_type === "video") {
        return data.secure_url.replace(/\.[a-z0-9]+$/i, ".mp4");
    }
    return data.secure_url;
}
