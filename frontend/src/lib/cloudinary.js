// frontend/src/lib/cloudinary.js
//
// Preenche estes dois valores (não são segredo):
//  - CLOUDINARY_CLOUD  = o teu "cloud name" (Cloudinary → Dashboard, no topo)
//  - CLOUDINARY_PRESET = nome de um "upload preset" UNSIGNED que crias em
//    Cloudinary → Settings → Upload → Upload presets → Add → Signing Mode: Unsigned
//
export const CLOUDINARY_CLOUD = "PÕE_AQUI_O_TEU_CLOUD_NAME";
export const CLOUDINARY_PRESET = "PÕE_AQUI_O_PRESET";

export async function uploadToCloudinary(file) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_PRESET);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/upload`,
        { method: "POST", body: fd },
    );
    if (!res.ok) throw new Error("upload falhou (" + res.status + ")");
    const data = await res.json();
    return data.secure_url;
}
