// Textos do site (PT / EN).

export const NAV = {
    work: { PT: "Trabalhos", EN: "Work" },
    about: { PT: "Sobre", EN: "About" },
    services: { PT: "Serviços", EN: "Services" },
    experience: { PT: "Percurso", EN: "Experience" },
    contact: { PT: "Contacto", EN: "Contact" },
};

export const HERO = {
    overline: {
        PT: "Portfólio · 2026",
        EN: "Portfolio · 2026",
    },
    location_line: {
        PT: "Portugal → para o mundo",
        EN: "Portugal → to the world",
    },
    statement: {
        PT: "Design, AR, 3D, web e IA criativa para marcas. Do primeiro esboço à entrega final, onde o gráfico e o interativo se cruzam.",
        EN: "Design, AR, 3D, web and creative AI for brands. From the first sketch to final delivery, where graphic and interactive meet.",
    },
    role: { PT: "Design & Multimedia Lead", EN: "Design & Multimedia Lead" },
    available: {
        PT: "Baseado em Portugal",
        EN: "Based in Portugal",
    },
    disciplines: [
        { PT: "Realidade Aumentada", EN: "Augmented Reality" },
        { PT: "3D e Blender", EN: "3D and Blender" },
        { PT: "Design Gráfico", EN: "Graphic Design" },
        { PT: "Web", EN: "Web" },
        { PT: "Motion", EN: "Motion" },
        { PT: "IA Criativa", EN: "Creative AI" },
        { PT: "Fotografia", EN: "Photography" },
    ],
    location: { PT: "Ericeira, Portugal", EN: "Ericeira, Portugal" },
    intro: {
        PT: "Faço design, experiências em AR, 3D e sites para marcas. Gosto de projetos onde o gráfico e o interativo se cruzam, e acompanho-os da ideia até à entrega.",
        EN: "I do design, AR experiences, 3D and websites for brands. I like projects where graphic design and interaction meet, and I see them through from the first idea to delivery.",
    },
    cta: { PT: "Ver trabalhos", EN: "See work" },
    cta_secondary: { PT: "Falar comigo", EN: "Get in touch" },
    floating_note: {
        PT: "Trabalhos de 2022 a 2026",
        EN: "Work from 2022 to 2026",
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

// Os projetos vêm do Firestore (admin). Lista vazia como reserva.
export const PROJECTS = [];

export const ABOUT = {
    heading: {
        PT: "Sou o Alexandre, designer multidisciplinar. Tenho 23 anos e vivo entre a Ericeira e Lisboa.",
        EN: "I'm Alexandre, a multidisciplinary designer. I'm 23 and I live between Ericeira and Lisbon.",
    },
    body: [
        {
            PT: "Formei-me em Engenharia Multimédia no ISTEC. Hoje sou Design & Multimedia Lead na Ydigital Media, onde entrei como Multimedia & AR Specialist. Antes disso estive no GCI Media Group, como designer gráfico.",
            EN: "I studied Multimedia Engineering at ISTEC. Today I'm Design & Multimedia Lead at Ydigital Media, where I started as Multimedia & AR Specialist. Before that I worked at GCI Media Group as a graphic designer.",
        },
        {
            PT: "Tanto faço uma campanha para impressão como uma experiência em AR ou um site. Em qualquer um deles, o que me interessa é que fique bem feito e que funcione para quem o vai usar.",
            EN: "I work on print campaigns as much as on AR experiences and websites. Whatever the format, what I care about is that it's well made and works for the people who use it.",
        },
    ],
    // Marcas com que já trabalhei (aparecem na secção "Sobre")
    clients: [
        "Danone · Blédina · Aptamil",
        "Burger King",
        "Carglass",
        "Deloitte",
        "Bayer · Clarityne",
        "Distell · Savanna",
        "Solverde Group",
        "Sonasol",
        "Bright International School",
        "Madeira Rústica",
        "Bruti",
        "Talay Thai House",
        "BerryLab Açaí",
        "…",
    ],
    // Crachá da secção "Sobre"
    badge: {
        photo: "/alexandre-badge.jpg",
        dept: { PT: "Design Department", EN: "Design Department" },
        name: "Alexandre Cosme",
        role: "Design & Multimedia Lead",
        note: { PT: "Uso pessoal e intransmissível", EN: "Personal and non-transferable use" },
    },
    pull: {
        PT: "Aprendo depressa e gosto de entregar trabalho bem acabado.",
        EN: "I learn fast and I like to hand over work that is properly finished.",
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
            PT: "Identidade visual, campanhas, editorial e packaging, com atenção à tipografia.",
            EN: "Visual identity, campaigns, editorial and packaging, with attention to typography.",
        },
    },
    {
        no: "03",
        title: { PT: "3D & Direção de Arte", EN: "3D & Art Direction" },
        body: {
            PT: "Modelação, render e composição em Blender, para web, redes sociais, AR ou impressão.",
            EN: "Modelling, rendering and composition in Blender, for web, social media, AR or print.",
        },
    },
    {
        no: "04",
        title: { PT: "Web Design & Desenvolvimento", EN: "Web Design & Development" },
        body: {
            PT: "Sites em React/TypeScript ou HTML/CSS, com SEO e publicados na Vercel.",
            EN: "Websites in React/TypeScript or HTML/CSS, with SEO, published on Vercel.",
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
            PT: "Edição em Premiere e animação em After Effects para vídeos curtos, redes sociais e teasers.",
            EN: "Editing in Premiere and animation in After Effects for short videos, social media and teasers.",
        },
    },
    {
        no: "07",
        title: { PT: "IA Criativa", EN: "Creative AI" },
        body: {
            PT: "Imagem e vídeo gerados com IA, retoque e extensão de imagens com Generative Fill, e sites e ferramentas feitos com programação assistida por IA. Mais rápido, sem perder qualidade.",
            EN: "AI-generated images and video, retouching and image extension with Generative Fill, and websites and tools built with AI-assisted coding. Faster, without losing quality.",
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
    "IA generativa (imagem e vídeo)",
    "Programação assistida por IA",
    "React / TypeScript",
    "HTML / CSS",
    "Fotografia / Vídeo",
];

export const EXPERIENCE = [
    {
        period: "Desde 2026",
        period_en: "Since 2026",
        role: { PT: "Design & Multimedia Lead", EN: "Design & Multimedia Lead" },
        company: "YDIGITAL MEDIA",
        scope: {
            PT: "Lidero o design da agência: campanhas, rich media, 3D e redes sociais.",
            EN: "I lead the agency's design work: campaigns, rich media, 3D and social media.",
        },
        details: {
            PT: [
                "Lidero o departamento de design e acompanho o trabalho da equipa, do briefing à entrega.",
                "Campanhas rich media e banners HTML5 para marcas internacionais.",
                "Animações 3D, newsletters e design para redes sociais.",
            ],
            EN: [
                "I lead the design department and follow the team's work from brief to delivery.",
                "Rich media campaigns and HTML5 banners for international brands.",
                "3D animation, newsletters and social media design.",
            ],
        },
    },
    {
        period: "2025 a 2026",
        period_en: "2025 to 2026",
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
                "Design gráfico para redes sociais, impressão e publicidade exterior.",
                "Web design e protótipos em Figma para websites e landings de clientes.",
                "Conceção de packaging e expositores PLV para retalho e eventos.",
                "Trabalho diário em equipa criativa: briefing, iteração com art directors e apresentação a cliente.",
            ],
            EN: [
                "Development of advertising campaigns from concept to final deliverable.",
                "Graphic design for social media, print and outdoor advertising.",
                "Web design and prototyping in Figma for client websites and landings.",
                "Packaging design and POS displays for retail and events.",
                "Daily work in a creative team: briefing, iteration with art directors and client presentation.",
            ],
        },
    },
    {
        period: "Desde 2022",
        period_en: "Since 2022",
        role: { PT: "Web & Vídeo Freelancer", EN: "Freelance Web & Video" },
        company: { PT: "Independente", EN: "Independent" },
        scope: {
            PT: "Websites para negócios locais, fotografia e conteúdo de vídeo.",
            EN: "Websites for local businesses, photography and video content.",
        },
        details: {
            PT: [
                "Desenvolvimento e entrega de websites para negócios locais (Ericeira, Lisboa, Mafra), com deploy em Vercel.",
                "Fotografia de provas e eventos desportivos, sobretudo automobilismo e surf.",
                "Captação e edição de vídeo para eventos corporate e conteúdo social.",
                "Gestão direta com clientes: orçamentação, agenda, contrato e entrega.",
            ],
            EN: [
                "Development and delivery of websites for local businesses (Ericeira, Lisbon, Mafra), deployed to Vercel.",
                "Photography of races and sporting events, mostly motorsport and surf.",
                "Filming and editing of video for corporate events and social content.",
                "Direct client management: quoting, scheduling, contracts and delivery.",
            ],
        },
    },
    {
        period: "2022 a 2023",
        period_en: "2022 to 2023",
        role: { PT: "Técnico de Montagem Audiovisual", EN: "Audiovisual Technician" },
        company: "PALCO 22",
        scope: {
            PT: "Instalação de sinal de vídeo e áudio, operação de câmara, organização de eventos.",
            EN: "Video and audio signal install, camera operation, event organisation.",
        },
        details: {
            PT: [
                "Instalação e processamento de sinal de vídeo e áudio em eventos ao vivo.",
                "Operação de câmara em interior e exterior, em multicâmara e câmara isolada.",
                "Organização logística de eventos com foco em luz, imagem e som.",
                "Trabalho em equipa técnica sob pressão de tempo e gestão de imprevistos.",
            ],
            EN: [
                "Install and processing of video and audio signal in live events.",
                "Camera operation indoors and outdoors, in multi-camera and single-camera setups.",
                "Logistical organisation of events focused on light, image and sound.",
                "Teamwork under time pressure and on-the-fly problem solving.",
            ],
        },
    },
];

export const CONTACT = {
    heading: {
        PT: "Tens um projeto?\nVamos falar.",
        EN: "Got a project?\nLet's talk.",
    },
    sub: {
        PT: "Propostas de trabalho, colaborações ou só para dizer olá. Costumo responder em 48 horas.",
        EN: "Job offers, collaborations or just to say hi. I usually reply within 48 hours.",
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
    available: {
        PT: "Baseado em Portugal",
        EN: "Based in Portugal",
    },
};

export const SOCIAL = {
    email: "alexandrexbdcosme@gmail.com",
    phone: "+351 933 059 987",
    linkedin: "https://www.linkedin.com/in/alexandre-cosme-857a59198/",
    instagram: "https://www.instagram.com/alexandre_cosme_fotografia/",
    location: "Ribamar, Ericeira",
};
