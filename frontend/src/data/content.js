// Content for Alexandre Cosme's portfolio. PT and EN versions.
// PROJETOS REAIS. As imagens estão como placeholders (placehold.co) que mostram
// o nome de cada projeto — troca cada `cover` (e `gallery`) pelo URL real
// (Cloudinary, etc.) quando tiveres as imagens prontas. Procura por "📷 TROCAR".

export const NAV = {
    work: { PT: "Trabalhos", EN: "Work" },
    about: { PT: "Sobre", EN: "About" },
    services: { PT: "Serviços", EN: "Services" },
    experience: { PT: "Percurso", EN: "Experience" },
    contact: { PT: "Contacto", EN: "Contact" },
};

export const HERO = {
    overline: {
        PT: "Portfólio — Disponível para projetos 2026",
        EN: "Portfolio — Available for 2026 projects",
    },
    role: { PT: "Multimedia & AR Specialist", EN: "Multimedia & AR Specialist" },
    location: { PT: "Ericeira, Portugal", EN: "Ericeira, Portugal" },
    intro: {
        PT: "Design, AR e imagem para marcas que recusam o óbvio. Trabalho na fronteira entre o gráfico, o tridimensional e o que ainda não tem nome.",
        EN: "Design, AR and image for brands that refuse the obvious. I work on the edge between graphic, three-dimensional, and what has yet to be named.",
    },
    cta: { PT: "Ver trabalhos", EN: "See work" },
    cta_secondary: { PT: "Falar comigo", EN: "Get in touch" },
    floating_note: {
        PT: "Selecionados — 2022 / 2026",
        EN: "Selected — 2022 / 2026",
    },
};

export const SECTION_LABELS = {
    work: { PT: "Trabalhos", EN: "Work" },
    about: { PT: "Sobre", EN: "About" },
    services: { PT: "Serviços", EN: "Services" },
    experience: { PT: "Percurso", EN: "Experience" },
    contact: { PT: "Vamos trabalhar juntos", EN: "Let's work together" },
};

// -------- Categories --------
export const CATEGORIES = [
    { id: "all", label: { PT: "Todos", EN: "All" } },
    { id: "ar3d", label: { PT: "AR & 3D", EN: "AR & 3D" } },
    { id: "graphic", label: { PT: "Design Gráfico", EN: "Graphic Design" } },
    { id: "photo", label: { PT: "Fotografia", EN: "Photography" } },
    { id: "web", label: { PT: "Web", EN: "Web" } },
    { id: "motion", label: { PT: "Motion", EN: "Motion" } },
    { id: "richmedia", label: { PT: "Rich Media", EN: "Rich Media" } },
];

// -------- Projects (REAIS) --------
export const PROJECTS = [
    // ===== AR & 3D =====
    {
        id: "ar3d-01",
        category: "ar3d",
        title: { PT: "Ativações AR de Marca", EN: "Branded AR Activations" },
        subtitle: { PT: "AR / Campanha", EN: "AR / Campaign" },
        client: "YDIGITAL MEDIA",
        year: "2025",
        cover: "https://placehold.co/1200x900/14110f/F4F2EE?text=Ativacoes+AR", // 📷 TROCAR
        // model_glb: "URL_DO_TEU_.glb",   // descomenta quando tiveres o modelo alojado
        // model_usdz: "URL_DO_TEU_.usdz",
        summary: {
            PT: "Experiências de Realidade Aumentada para campanhas, ativações e eventos de marca.",
            EN: "Augmented Reality experiences for brand campaigns, activations and events.",
        },
        details: {
            PT: "Como Multimedia & AR Specialist na YDIGITAL MEDIA, concebo e produzo experiências de Realidade Aumentada para clientes da agência — de filtros sociais a ativações em evento. O fluxo passa por conceito, modelação e otimização de assets 3D em Blender, e implementação para web e redes sociais.\n\nCada peça vive entre a câmara, o gesto e a marca: o desafio é manter a identidade visual intacta dentro das limitações de performance do AR em telemóvel.",
            EN: "As Multimedia & AR Specialist at YDIGITAL MEDIA, I design and produce Augmented Reality experiences for agency clients — from social filters to live event activations. The flow goes from concept to 3D asset modelling and optimisation in Blender, and implementation for web and social.\n\nEach piece lives between the camera, the gesture and the brand: the challenge is keeping the visual identity intact within the performance limits of mobile AR.",
        },
        tools: ["Blender", "Spark AR", "Photoshop", "After Effects"],
    },
    {
        id: "ar3d-02",
        category: "ar3d",
        title: { PT: "Red Panda Kawaii", EN: "Kawaii Red Panda" },
        subtitle: { PT: "3D / Estudo pessoal", EN: "3D / Personal study" },
        client: { PT: "Projeto pessoal", EN: "Personal project" },
        year: "2024",
        cover: "https://placehold.co/1200x900/14110f/F4F2EE?text=Red+Panda+3D", // 📷 TROCAR
        summary: {
            PT: "Estudo de modelação e texture painting em Blender, com estética cartoon.",
            EN: "Modelling and texture painting study in Blender, with a cartoon aesthetic.",
        },
        details: {
            PT: "Personagem 3D estilizada modelada em Blender como exercício de texture painting. Trabalhei com uma abordagem multi-material por zonas para controlar cor e detalhe, e construí o contorno cartoon com o modificador Solidify combinado com Freestyle.\n\nUm projeto pessoal para afinar workflow de personagem — da silhueta ao look final, sem sair do Blender.",
            EN: "A stylised 3D character modelled in Blender as a texture-painting exercise. I worked with a zoned multi-material approach to control colour and detail, and built the cartoon outline using the Solidify modifier combined with Freestyle.\n\nA personal project to refine a character workflow — from silhouette to final look, entirely inside Blender.",
        },
        tools: ["Blender"],
    },

    // ===== Design Gráfico =====
    {
        id: "graphic-01",
        category: "graphic",
        title: { PT: "Natura Rescue", EN: "Natura Rescue" },
        subtitle: { PT: "Campanha / Key Visual", EN: "Campaign / Key Visual" },
        client: "Mediology",
        year: "2025",
        cover: "https://placehold.co/1200x900/14110f/F4F2EE?text=Natura+Rescue", // 📷 TROCAR
        summary: {
            PT: "Recuperação e finalização das artes da campanha Natura Rescue.",
            EN: "Recovery and final art production for the Natura Rescue campaign.",
        },
        details: {
            PT: "Trabalho de finalização gráfica para a campanha Natura Rescue, incluindo a recuperação técnica de um ficheiro PSD corrompido para repor o material de origem sem perda de qualidade.\n\nComposição, ajuste de artes e preparação dos suportes finais a partir do conceito da campanha.",
            EN: "Final art production for the Natura Rescue campaign, including the technical recovery of a corrupted PSD file to restore the source material with no loss of quality.\n\nComposition, art adjustment and final media prep from the campaign concept.",
        },
    },
    {
        id: "graphic-02",
        category: "graphic",
        title: { PT: "Solverde Group", EN: "Solverde Group" },
        subtitle: { PT: "Copy / Comunicação", EN: "Copy / Communication" },
        client: "Solverde Group",
        year: "2025",
        cover: "https://placehold.co/1200x900/14110f/F4F2EE?text=Solverde+Group", // 📷 TROCAR
        summary: {
            PT: "Linha de comunicação para quatro unidades hoteleiras do grupo Solverde.",
            EN: "Communication line for four hotel properties of the Solverde group.",
        },
        details: {
            PT: "Desenvolvimento de frases e linha de comunicação para quatro propriedades do grupo: Hotel Solverde Spa & Wellness, Hotel Apartamento Solverde, Hotel Algarve Casino e Hotel Casino Chaves.\n\nCada unidade com tom próprio, mantendo coerência de marca no conjunto.",
            EN: "Development of taglines and a communication line for four group properties: Hotel Solverde Spa & Wellness, Hotel Apartamento Solverde, Hotel Algarve Casino and Hotel Casino Chaves.\n\nEach property with its own tone, keeping brand coherence across the set.",
        },
    },
    {
        id: "graphic-03",
        category: "graphic",
        title: { PT: "Campanhas GCI", EN: "GCI Campaigns" },
        subtitle: { PT: "Publicidade / Multi-suporte", EN: "Advertising / Multi-format" },
        client: "GCI Media Group",
        year: "2024",
        cover: "https://placehold.co/1200x900/14110f/F4F2EE?text=Campanhas+GCI", // 📷 TROCAR
        summary: {
            PT: "Campanhas publicitárias do conceito ao deliverable, durante o estágio na GCI.",
            EN: "Advertising campaigns from concept to deliverable, during the GCI internship.",
        },
        details: {
            PT: "Desenvolvimento de campanhas publicitárias do conceito ao deliverable final, para suportes online e offline — redes sociais, print e OOH. Conceção de packaging e expositores PLV para retalho e eventos.\n\nTrabalho diário em equipa criativa: briefing, iteração com art directors e apresentação a cliente.",
            EN: "Development of advertising campaigns from concept to final deliverable, for online and offline media — social, print and OOH. Packaging design and POS displays for retail and events.\n\nDaily work in a creative team: briefing, iteration with art directors and client presentation.",
        },
    },
    {
        id: "graphic-04",
        category: "graphic",
        title: { PT: "Aronick", EN: "Aronick" },
        subtitle: { PT: "Identidade / Desporto", EN: "Identity / Sportswear" },
        client: "Aronick",
        year: "2025",
        cover: "https://placehold.co/1200x900/14110f/F4F2EE?text=Aronick", // 📷 TROCAR
        summary: {
            PT: "Direção visual para uma marca portuguesa de vestuário desportivo.",
            EN: "Visual direction for a Portuguese sportswear brand.",
        },
    },

    // ===== Fotografia =====
    {
        id: "photo-01",
        category: "photo",
        title: { PT: "Estoril Motorsport", EN: "Estoril Motorsport" },
        subtitle: { PT: "Fotografia / Automobilismo", EN: "Photography / Motorsport" },
        client: { PT: "Projeto pessoal", EN: "Personal project" },
        year: "2024",
        cover: "https://placehold.co/1200x900/14110f/F4F2EE?text=Estoril+Motorsport", // 📷 TROCAR
        summary: {
            PT: "Série fotográfica de automobilismo — Porsche em pista, no Autódromo do Estoril.",
            EN: "Motorsport photography series — Porsche on track, at Estoril Circuit.",
        },
        details: {
            PT: "Série dedicada a automobilismo, com foco em Porsche em pista no Autódromo do Estoril. Trabalho de panning e timing para captar velocidade, com tratamento de cor que valoriza a luz da hora dourada e a textura do carro.\n\nUma das séries de que tenho mais orgulho — onde a fotografia e a paixão pelo automóvel se cruzam.",
            EN: "A series dedicated to motorsport, focused on Porsche on track at Estoril Circuit. Panning and timing work to capture speed, with colour grading that brings out golden-hour light and the texture of the car.\n\nOne of the series I'm most proud of — where photography and a passion for cars meet.",
        },
    },
    {
        id: "photo-02",
        category: "photo",
        title: { PT: "Atlântico — Ericeira", EN: "Atlantic — Ericeira" },
        subtitle: { PT: "Fotografia / Surf", EN: "Photography / Surf" },
        client: { PT: "Freelance — Ericeira", EN: "Freelance — Ericeira" },
        year: "2023",
        cover: "https://placehold.co/1200x900/14110f/F4F2EE?text=Atlantico+Ericeira", // 📷 TROCAR
        summary: {
            PT: "Ensaio fotográfico de surf na Ericeira — pranchas, hora dourada, oceano.",
            EN: "Surf photography essay in Ericeira — boards, golden hour, ocean.",
        },
    },
    {
        id: "photo-03",
        category: "photo",
        title: { PT: "Evento Corporate — Tivoli Oriente", EN: "Corporate Event — Tivoli Oriente" },
        subtitle: { PT: "Fotografia / Evento", EN: "Photography / Event" },
        client: { PT: "Cliente imobiliário (Dubai)", EN: "Real estate client (Dubai)" },
        year: "2025",
        cover: "https://placehold.co/1200x900/14110f/F4F2EE?text=Tivoli+Oriente", // 📷 TROCAR
        summary: {
            PT: "Cobertura de um evento corporate de imobiliário de luxo no Tivoli Oriente, Parque das Nações.",
            EN: "Coverage of a luxury real estate corporate event at Tivoli Oriente, Parque das Nações.",
        },
    },

    // ===== Web =====
    {
        id: "web-01",
        category: "web",
        title: { PT: "Madeira Rústica", EN: "Madeira Rústica" },
        subtitle: { PT: "Website / Carpintaria", EN: "Website / Carpentry" },
        client: "Madeira Rústica",
        year: "2025",
        url: "https://www.madeirarustica.pt",
        // Screenshot automático do site live (WordPress mShots). Para produção podes
        // trocar por um screenshot teu alojado (mais nítido/fiável). 📷 opcional
        cover: "https://image.thum.io/get/width/1280/https://www.madeirarustica.pt",
        // cover_mobile: "URL_screenshot_mobile",  // descomenta para o telemóvel sobreposto
        summary: {
            PT: "Site bilingue com painel de admin, galeria de projetos e backend Supabase.",
            EN: "Bilingual site with admin panel, project gallery and a Supabase backend.",
        },
        details: {
            PT: "Website completo para a Madeira Rústica (madeirarustica.pt), em HTML/CSS/JS com backend em Supabase e painel de administração. Sistema de i18n PT/EN, galeria de projetos com modal e slideshow, formulário de contacto via Web3Forms e imagens alojadas em Cloudinary.\n\nDo lado técnico: SEO completo (Google Search Console, dados estruturados JSON-LD, sitemap e robots.txt) com indexação confirmada, e domínio próprio ligado via Amen.pt ao Vercel.",
            EN: "A full website for Madeira Rústica (madeirarustica.pt), in HTML/CSS/JS with a Supabase backend and admin panel. PT/EN i18n system, project gallery with modal and slideshow, contact form via Web3Forms and images hosted on Cloudinary.\n\nOn the technical side: full SEO (Google Search Console, JSON-LD structured data, sitemap and robots.txt) with confirmed indexing, and a custom domain connected via Amen.pt to Vercel.",
        },
        tools: ["HTML / CSS", "JavaScript", "Supabase", "Cloudinary"],
    },
    {
        id: "web-02",
        category: "web",
        title: { PT: "Bruti", EN: "Bruti" },
        subtitle: { PT: "Website / Restauração", EN: "Website / Restaurant" },
        client: "Bruti",
        year: "2025",
        url: "https://bruti.vercel.app",
        cover: "https://image.thum.io/get/width/1280/https://bruti.vercel.app", // screenshot live · 📷 TROCAR por hospedado p/ produção
        // cover_mobile: "URL_screenshot_mobile",
        summary: {
            PT: "Site para pizzaria em React + Vite, com modal de reservas e SEO.",
            EN: "Pizzeria site in React + Vite, with a reservation modal and SEO.",
        },
        details: {
            PT: "Website para a pizzaria Bruti em React + Vite + TypeScript + Tailwind. Inclui auditoria de site, geração de favicon e OG image, modal de reservas com lógica de fallback e melhorias de SEO.\n\nDeploy em Vercel a partir de GitHub.",
            EN: "Website for the Bruti pizzeria in React + Vite + TypeScript + Tailwind. Includes a site audit, favicon and OG image generation, a reservation modal with fallback logic and SEO improvements.\n\nDeployed to Vercel from GitHub.",
        },
        tools: ["React", "Vite", "TypeScript", "Tailwind"],
    },
    {
        id: "web-03",
        category: "web",
        title: { PT: "Talay Thai House", EN: "Talay Thai House" },
        subtitle: { PT: "Website / Restauração", EN: "Website / Restaurant" },
        client: "Talay Thai House",
        year: "2024",
        url: "https://talaythai-house.vercel.app",
        cover: "https://image.thum.io/get/width/1280/https://talaythai-house.vercel.app", // screenshot live
        summary: {
            PT: "Website para restaurante tailandês na Ericeira, com menu lateral e ligações a delivery.",
            EN: "Website for a Thai restaurant in Ericeira, with a side-drawer menu and delivery links.",
        },
        details: {
            PT: "Website para o Talay Thai House (Ericeira) em React + TypeScript + Vite + Tailwind. Menu em side-drawer deslizante, paleta quente em dourado e terracota, e ligações diretas a Uber Eats e Bolt Food.\n\nDeploy em GitHub e Vercel.",
            EN: "Website for Talay Thai House (Ericeira) in React + TypeScript + Vite + Tailwind. A sliding side-drawer menu, warm gold and terracotta palette, and direct links to Uber Eats and Bolt Food.\n\nDeployed to GitHub and Vercel.",
        },
        tools: ["React", "TypeScript", "Vite", "Tailwind"],
    },
    {
        id: "web-04",
        category: "web",
        title: { PT: "BerryLab Açaí", EN: "BerryLab Açaí" },
        subtitle: { PT: "Website / Restauração", EN: "Website / Restaurant" },
        client: "BerryLab Açaí",
        year: "2025",
        url: "https://berry-lab-acai-site.vercel.app",
        cover: "https://image.thum.io/get/width/1280/https://berry-lab-acai-site.vercel.app", // screenshot live
        summary: {
            PT: "Website para a BerryLab Açaí, marca de bowls e smoothies de açaí.",
            EN: "Website for BerryLab Açaí, an açaí bowls and smoothies brand.",
        },
        details: {
            PT: "Website para a BerryLab Açaí — “O Açaí Autêntico” — marca portuguesa de bowls, smoothies e toppings frescos, com lojas em Ericeira, Santa Cruz e Torres Vedras. Inclui menu, localizações e presença de marca.\n\nReact + Tailwind, deploy em Vercel.",
            EN: "Website for BerryLab Açaí — “The Authentic Açaí” — a Portuguese brand of fresh bowls, smoothies and toppings, with shops in Ericeira, Santa Cruz and Torres Vedras. Includes menu, locations and brand presence.\n\nReact + Tailwind, deployed to Vercel.",
        },
        tools: ["React", "Tailwind", "Vite"],
    },
    {
        id: "web-05",
        category: "web",
        title: { PT: "GIG — Ericeira", EN: "GIG — Ericeira" },
        subtitle: { PT: "Website / Restauração", EN: "Website / Restaurant" },
        client: "GIG",
        year: "2025",
        url: "https://gi-g-website.vercel.app",
        cover: "https://image.thum.io/get/width/1280/https://gi-g-website.vercel.app", // screenshot live
        summary: {
            PT: "Landing page para o GIG (Ericeira) com sistema de reservas por email.",
            EN: "Landing page for GIG (Ericeira) with an email reservation system.",
        },
        details: {
            PT: "Landing page para o GIG, na Ericeira, com um sistema de reservas que envia o pedido por email. Foco em conversão: uma página única e direta, com a reserva sempre à mão.\n\nReact, deploy em Vercel.",
            EN: "Landing page for GIG, in Ericeira, with a reservation system that sends requests by email. Conversion-focused: a single, direct page with booking always within reach.\n\nReact, deployed to Vercel.",
        },
        tools: ["React", "Tailwind", "Vite"],
    },

    // ===== Motion & Rich Media =====
    {
        id: "motion-01",
        category: "richmedia",
        title: { PT: "World Cup Predictor 2026", EN: "World Cup Predictor 2026" },
        subtitle: { PT: "Rich Media / HTML5", EN: "Rich Media / HTML5" },
        client: "World Sports Betting",
        year: "2026",
        cover: "https://placehold.co/1200x900/14110f/F4F2EE?text=World+Cup+Predictor", // 📷 TROCAR (capa que aparece na grelha)
        // === PROTÓTIPO CLICÁVEL (tipo Marvel, dentro de um telemóvel fixo) ===
        // Exporta cada ecrã do PSD como PNG, mete-os em frontend/public/rm/wsb/
        // e troca os `src` abaixo por "/rm/wsb/1.png", etc.
        // - Tocar no ecrã avança para o seguinte.
        // - fit: "contain" (default, com barras pretas em cima/baixo, tipo Marvel)
        //        ou "cover" (preenche o ecrã do telemóvel).
        // - Para zonas clicáveis tipo Marvel, adiciona `hotspots` a um ecrã:
        //     hotspots: [{ x: 12, y: 78, w: 76, h: 10, to: 2 }]
        //   x/y/w/h em % do ecrã do telemóvel; `to` = índice do ecrã destino (começa em 0).
        richmedia: {
            fit: "contain",
            screens: [
                {
                    src: "https://placehold.co/639x1136/151515/FF460B?text=RM+Ecra+1%0A(toca)",
                    // Exemplo de hotspot: faixa em baixo que salta para o ecrã 3 (índice 2)
                    hotspots: [{ x: 12, y: 80, w: 76, h: 8, to: 2 }],
                },
                {
                    src: "https://placehold.co/639x1136/E2231A/FFFFFF?text=RM+Ecra+2",
                },
                {
                    src: "https://placehold.co/639x1136/151515/FF460B?text=RM+Ecra+3",
                },
            ],
        },
        summary: {
            PT: "Banner interativo HTML5 (rich media) para a campanha World Cup Predictor 2026.",
            EN: "Interactive HTML5 rich-media banner for the World Cup Predictor 2026 campaign.",
        },
        details: {
            PT: "Produção de um banner rich media HTML5 (639×1136px) para a campanha World Cup Predictor 2026 da World Sports Betting. Extração de cores de marca a partir dos PSDs e construção do mockup e animação.\n\nPeça pensada para captar atenção em formato vertical, com a identidade da marca a guiar a animação.",
            EN: "Production of an HTML5 rich-media banner (639×1136px) for World Sports Betting's World Cup Predictor 2026 campaign. Brand colour extraction from the PSDs and build of the mockup and animation.\n\nA piece built to grab attention in vertical format, with the brand identity driving the animation.",
        },
        tools: ["HTML5", "After Effects", "Photoshop"],
    },
    {
        id: "motion-02",
        category: "motion",
        title: { PT: "Short-form Imobiliário", EN: "Real Estate Short-form" },
        subtitle: { PT: "Vídeo / Social", EN: "Video / Social" },
        client: { PT: "Imobiliário (Lisboa)", EN: "Real estate (Lisbon)" },
        year: "2025",
        cover: "https://placehold.co/1200x900/14110f/F4F2EE?text=Short-form+Imobiliario", // 📷 TROCAR
        summary: {
            PT: "Edições verticais para social — pipeline assistido por IA para clientes de imobiliário.",
            EN: "Vertical edits for social — an AI-assisted pipeline for real estate clients.",
        },
    },
    {
        id: "motion-03",
        category: "motion",
        title: { PT: "Tivoli Oriente — Aftermovie", EN: "Tivoli Oriente — Aftermovie" },
        subtitle: { PT: "Vídeo / Evento", EN: "Video / Event" },
        client: { PT: "Cliente imobiliário (Dubai)", EN: "Real estate client (Dubai)" },
        year: "2025",
        cover: "https://placehold.co/1200x900/14110f/F4F2EE?text=Tivoli+Aftermovie", // 📷 TROCAR
        summary: {
            PT: "Captação e edição do vídeo de um evento corporate de imobiliário de luxo.",
            EN: "Filming and editing of a luxury real estate corporate event video.",
        },
    },
    {
        id: "motion-04",
        category: "motion",
        title: { PT: "PALCO 22 — Audiovisual", EN: "PALCO 22 — Audiovisual" },
        subtitle: { PT: "Vídeo / Eventos ao vivo", EN: "Video / Live events" },
        client: "PALCO 22",
        year: "2023",
        cover: "https://placehold.co/1200x900/14110f/F4F2EE?text=PALCO+22", // 📷 TROCAR
        summary: {
            PT: "Operação de câmara e montagem audiovisual em eventos ao vivo.",
            EN: "Camera operation and audiovisual setup at live events.",
        },
    },
];

export const ABOUT = {
    heading: {
        PT: "Designer multidisciplinar, 23 anos, baseado entre a Ericeira e Lisboa.",
        EN: "Multidisciplinary designer, 23, based between Ericeira and Lisbon.",
    },
    body: [
        {
            PT: "Formado em Engenharia Multimédia pelo ISTEC. Trabalho atualmente como Multimedia & AR Specialist na YDIGITAL MEDIA, depois de uma passagem pelo GCI Media Group enquanto designer gráfico.",
            EN: "Multimedia Engineering graduate from ISTEC. Currently Multimedia & AR Specialist at YDIGITAL MEDIA after a spell at GCI Media Group as a graphic designer.",
        },
        {
            PT: "Movo-me confortavelmente entre o estático e o interativo, entre uma campanha impressa e uma experiência em AR. Encaro cada brief como um problema de composição — e o resto resolve-se com gosto e disciplina.",
            EN: "I move comfortably between the static and the interactive, between a print campaign and an AR experience. I treat each brief as a composition problem — the rest is solved with taste and discipline.",
        },
    ],
    pull: {
        PT: "Aprender depressa, errar com calma, entregar com clareza.",
        EN: "Learn fast, fail calmly, deliver with clarity.",
    },
};

export const SERVICES = [
    {
        no: "01",
        title: { PT: "Realidade Aumentada", EN: "Augmented Reality" },
        body: {
            PT: "Experiências AR para marcas, campanhas e eventos. Conceito, modelação e implementação.",
            EN: "AR experiences for brands, campaigns and events. Concept, modelling and implementation.",
        },
    },
    {
        no: "02",
        title: { PT: "Design Gráfico", EN: "Graphic Design" },
        body: {
            PT: "Identidade visual, campanhas, editorial e packaging com sensibilidade tipográfica.",
            EN: "Visual identity, campaigns, editorial and packaging with typographic sensibility.",
        },
    },
    {
        no: "03",
        title: { PT: "3D & Direção de Arte", EN: "3D & Art Direction" },
        body: {
            PT: "Modelação, render e composição em Blender — para web, social, AR ou impressão.",
            EN: "Modelling, render and composition in Blender — for web, social, AR or print.",
        },
    },
    {
        no: "04",
        title: { PT: "Web Design & Desenvolvimento", EN: "Web Design & Development" },
        body: {
            PT: "Sites em React/TypeScript ou HTML/CSS, com SEO, deploy em Vercel e tipografia cuidada.",
            EN: "Sites in React/TypeScript or HTML/CSS, with SEO, Vercel deploy and careful typography.",
        },
    },
    {
        no: "05",
        title: { PT: "Fotografia", EN: "Photography" },
        body: {
            PT: "Eventos desportivos, automobilismo, sessões privadas e direção de imagem para marcas.",
            EN: "Sporting events, motorsport, private sessions and image direction for brands.",
        },
    },
    {
        no: "06",
        title: { PT: "Vídeo & Pós-produção", EN: "Video & Post-production" },
        body: {
            PT: "Edição em Premiere e motion em After Effects — peças curtas, social cuts, teasers.",
            EN: "Premiere editing and After Effects motion — shorts, social cuts, teasers.",
        },
    },
];

export const TOOLS = [
    "Photoshop",
    "Illustrator",
    "InDesign",
    "Lightroom",
    "Blender",
    "After Effects",
    "Premiere Pro",
    "Figma",
    "React / TypeScript",
    "HTML / CSS",
    "Fotografia / Vídeo",
];

export const EXPERIENCE = [
    {
        period: "2025 — Hoje",
        period_en: "2025 — Present",
        role: { PT: "Multimedia & AR Specialist", EN: "Multimedia & AR Specialist" },
        company: "YDIGITAL MEDIA",
        scope: {
            PT: "AR, design gráfico, 3D, web design, produção gráfica.",
            EN: "AR, graphic design, 3D, web design, graphic production.",
        },
        details: {
            PT: [
                "Conceção e produção de experiências de Realidade Aumentada para campanhas de marca, ativações e eventos.",
                "Modelação e otimização de assets 3D em Blender para uso em AR, web e social.",
                "Design gráfico de campanhas, KV e adaptações multi-suporte para clientes da agência.",
                "Web design e produção de landing pages e mini-sites em Figma + HTML/CSS.",
                "Apoio à produção gráfica e preparação de artes finais para impressão e produção física.",
            ],
            EN: [
                "Concept and production of Augmented Reality experiences for brand campaigns, activations and events.",
                "Modelling and optimisation of 3D assets in Blender for AR, web and social use.",
                "Graphic design for campaigns, KVs and multi-format adaptations for agency clients.",
                "Web design and production of landing pages and microsites in Figma + HTML/CSS.",
                "Support of graphic production and final art prep for print and physical production.",
            ],
        },
    },
    {
        period: "2024",
        period_en: "2024",
        role: { PT: "Designer Gráfico (Estágio)", EN: "Graphic Designer (Internship)" },
        company: "GCI Media Group",
        scope: {
            PT: "Campanhas publicitárias, web design, packaging, expositores.",
            EN: "Advertising campaigns, web design, packaging, stands.",
        },
        details: {
            PT: [
                "Desenvolvimento de campanhas publicitárias do conceito ao deliverable final.",
                "Design gráfico para suportes online e offline — redes sociais, print, OOH.",
                "Web design e protótipos em Figma para websites e landings de clientes.",
                "Conceção de packaging e expositores PLV para retalho e eventos.",
                "Trabalho diário em equipa criativa: briefing, iteração com art directors e apresentação a cliente.",
            ],
            EN: [
                "Development of advertising campaigns from concept to final deliverable.",
                "Graphic design for online and offline media — social, print, OOH.",
                "Web design and prototyping in Figma for client websites and landings.",
                "Packaging design and POS displays for retail and events.",
                "Daily work in a creative team: briefing, iteration with art directors and client presentation.",
            ],
        },
    },
    {
        period: "2022 — Hoje",
        period_en: "2022 — Present",
        role: { PT: "Web & Vídeo Freelancer", EN: "Freelance Web & Video" },
        company: { PT: "Independente", EN: "Independent" },
        scope: {
            PT: "Websites para negócios locais, fotografia e conteúdo de vídeo.",
            EN: "Websites for local businesses, photography and video content.",
        },
        details: {
            PT: [
                "Desenvolvimento e entrega de websites para negócios locais (Ericeira, Lisboa, Mafra), com deploy em Vercel.",
                "Cobertura fotográfica de provas e eventos desportivos — automobilismo, surf e amadores.",
                "Captação e edição de vídeo para eventos corporate e conteúdo social.",
                "Gestão direta com clientes: orçamentação, agenda, contrato e entrega.",
            ],
            EN: [
                "Development and delivery of websites for local businesses (Ericeira, Lisbon, Mafra), deployed to Vercel.",
                "Photographic coverage of sporting events — motorsport, surf and amateur races.",
                "Filming and editing of video for corporate events and social content.",
                "Direct client management: quoting, scheduling, contracts and delivery.",
            ],
        },
    },
    {
        period: "2022 — 2023",
        period_en: "2022 — 2023",
        role: { PT: "Técnico de Montagem Audiovisual", EN: "Audiovisual Technician" },
        company: "PALCO 22",
        scope: {
            PT: "Instalação de sinal de vídeo e áudio, operação de câmara, organização de eventos.",
            EN: "Video and audio signal install, camera operation, event organisation.",
        },
        details: {
            PT: [
                "Instalação e processamento de sinal de vídeo e áudio em eventos ao vivo.",
                "Operação de câmara em ambiente indoor e outdoor — multi-câmara e câmara isolada.",
                "Organização logística de eventos com foco em luz, imagem e som.",
                "Trabalho em equipa técnica sob pressão de tempo e gestão de imprevistos.",
            ],
            EN: [
                "Install and processing of video and audio signal in live events.",
                "Camera operation in indoor and outdoor settings — multi-camera and isolated camera.",
                "Logistical organisation of events focused on light, image and sound.",
                "Teamwork under time pressure and on-the-fly problem solving.",
            ],
        },
    },
];

export const CONTACT = {
    heading: {
        PT: "Tem um projeto. Vamos\nfazê-lo bem.",
        EN: "Got a project. Let's\nmake it well.",
    },
    sub: {
        PT: "Para propostas, colaborações ou apenas para dizer olá — envie uma mensagem. Respondo geralmente em 48h.",
        EN: "For briefs, collaborations or just to say hi — send a message. I usually reply within 48h.",
    },
    fields: {
        name: { PT: "Nome", EN: "Name" },
        email: { PT: "Email", EN: "Email" },
        subject: { PT: "Assunto (opcional)", EN: "Subject (optional)" },
        message: { PT: "A tua mensagem", EN: "Your message" },
        submit: { PT: "Enviar mensagem", EN: "Send message" },
        sending: { PT: "A enviar…", EN: "Sending…" },
        success: {
            PT: "Mensagem enviada. Falamos em breve.",
            EN: "Message sent. Talk soon.",
        },
        error: {
            PT: "Algo correu mal. Tenta novamente ou escreve diretamente.",
            EN: "Something went wrong. Try again or write directly.",
        },
    },
};

export const FOOTER = {
    rights: {
        PT: "Todos os direitos reservados",
        EN: "All rights reserved",
    },
    colophon: {
        PT: "Cabinet Grotesk · Satoshi · Newsreader",
        EN: "Cabinet Grotesk · Satoshi · Newsreader",
    },
    available: {
        PT: "Disponível para projetos",
        EN: "Available for projects",
    },
};

export const SOCIAL = {
    email: "alexandrexbdcosme@gmail.com",
    phone: "+351 933 059 987",
    linkedin: "https://www.linkedin.com/in/alexandre-cosme-857a59198/",
    location: "Ribamar, Ericeira",
};

// ---- Enrich each project: galeria e tools por omissão ----
// Já defini `details` e (na maioria) `tools` reais em cima.
// A galeria começa só com a capa — acrescenta mais imagens reais quando tiveres.

const TOOLS_BY_CATEGORY = {
    ar3d: ["Blender", "Spark AR", "Photoshop", "After Effects"],
    graphic: ["Illustrator", "Photoshop", "InDesign", "Figma"],
    photo: ["Lightroom", "Photoshop", "Sony A7 IV"],
    web: ["React", "Vite", "TypeScript", "Tailwind"],
    motion: ["After Effects", "Premiere Pro", "Photoshop"],
};

PROJECTS.forEach((p) => {
    if (!p.gallery) {
        // Só a capa por agora. Acrescenta mais URLs reais aqui quando tiveres:
        // p.gallery = [p.cover, "URL_2", "URL_3"];
        p.gallery = [p.cover];
    }
    if (!p.tools) {
        p.tools = TOOLS_BY_CATEGORY[p.category] || [];
    }
});
