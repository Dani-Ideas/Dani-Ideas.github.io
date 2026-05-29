export const person = {
  name: 'Daniel Romero',
  role:     { es: 'Fullstack Developer',   en: 'Fullstack Developer' },
  location: { es: 'Ciudad de México',      en: 'Mexico City' },
  email: 'daniideas0@gmail.com',
  github:   'https://github.com/Dani-Ideas',
  linkedin: 'https://linkedin.com/in/daniel-romero-dani-ideas/',
  twitter:  'https://x.com/',
  cv: '/resources/Daniel_Romero_CV.pdf',
  openToWork: true,
} as const;

export const about = {
  es: `<p>Ingeniero de Software enfocado en la transformación digital y la eficiencia operativa. Mi enfoque es resolver problemas de negocio mediante tecnología, no solo escribir código.</p><p>Como único responsable del desarrollo de software en una empresa de manufactura, lideré la transición de procesos manuales hacia ecosistemas digitales escalables: sistema de trazabilidad QR, control de inventario con lógica Kardex, dashboards de manufactura y arquitectura Full Stack con Next.js y PostgreSQL. Actualmente estudiante de Ingeniería en Computación en la UNAM.</p>`,
  en: `<p>Software Engineer focused on digital transformation and operational efficiency. I solve business problems through technology — not just write code.</p><p>As the sole software developer in a manufacturing company, I led the transition from manual processes to scalable digital ecosystems: QR traceability system, inventory control with Kardex logic, manufacturing dashboards, and Full Stack architecture with Next.js and PostgreSQL. Currently studying Computer Engineering at UNAM.</p>`,
};

export const skills = [
  'TypeScript', 'Next.js', 'React', 'Node.js', 'PostgreSQL',
  'Prisma', 'REST API', 'Supabase', 'Tailwind CSS', 'shadcn/ui',
  'Zustand', 'Zod', 'Python', 'Java', 'C/C++', 'Git', 'GitHub', 'Vercel', 'Stripe',
] as const;

export interface BilingualText { es: string; en: string; }

export interface ExperienceItem {
  company: string;
  companyUrl: string;
  role: BilingualText;
  period: BilingualText;
  place: BilingualText;
  description: BilingualText;
}

export const experience: ExperienceItem[] = [
  {
    company: 'Talla — Joyería y alta costura',
    companyUrl: '',
    role: {
      es: 'Full Stack Developer & Process Automation Lead',
      en: 'Full Stack Developer & Process Automation Lead',
    },
    period: { es: '2023 – presente', en: '2023 – present' },
    place:  { es: 'Ciudad de México', en: 'Mexico City' },
    description: {
      es: 'Responsable de la transformación digital en una planta de fabricación de joyería fina. Diseñé e implementé un sistema de gestión de inventarios con trazabilidad QR (rastreo atómico desde producción hasta punto de venta). Migré la arquitectura de scripts básicos a Next.js, PostgreSQL y Prisma ORM. Implementé lógica Kardex para control de stock y dashboards de manufactura para toma de decisiones basada en datos.',
      en: 'Responsible for digital transformation at a fine jewelry manufacturing plant. Designed and implemented an inventory management system with QR traceability (atomic tracking from production to point of sale). Migrated architecture from basic scripts to Next.js, PostgreSQL, and Prisma ORM. Implemented Kardex logic for stock control and manufacturing dashboards for data-driven decision making.',
    },
  },
  {
    company: 'Autónomo',
    companyUrl: '',
    role: { es: 'Frontend Developer', en: 'Frontend Developer' },
    period: { es: '2020 – 2023', en: '2020 – 2023' },
    place:  { es: 'Ciudad de México', en: 'Mexico City' },
    description: {
      es: 'Proyectos de desarrollo frontend para clientes en distintos sectores. Diseño e implementación de interfaces con React y tecnologías web modernas.',
      en: 'Frontend development projects for clients in various sectors. Design and implementation of interfaces using React and modern web technologies.',
    },
  },
  {
    company: 'RappiCard',
    companyUrl: 'https://rappicard.com.mx/',
    role: {
      es: 'Operador de Atención a Clientes',
      en: 'Customer Service Operator',
    },
    period: { es: '2021 – 2022', en: '2021 – 2022' },
    place:  { es: 'Ciudad de México', en: 'Mexico City' },
    description: {
      es: 'Resolución de incidencias financieras y lectura de estados de cuenta con alto volumen de llamadas. Coordinación con múltiples departamentos para escalar y cerrar casos complejos. Comunicación efectiva bajo presión con clientes en situaciones de conflicto.',
      en: 'Resolution of financial incidents and account statement review with high call volume. Coordination with multiple departments to escalate and close complex cases. Effective communication under pressure with clients in conflict situations.',
    },
  },
];

export interface EducationItem {
  institution: string;
  degree: BilingualText;
  period: string;
}

export const education: EducationItem[] = [
  {
    institution: 'UNAM — FES Aragón',
    degree: { es: 'Ingeniería en Computación', en: 'Computer Engineering' },
    period: '2022 – 2027 (en curso)',
  },
  {
    institution: 'Platzi',
    degree: {
      es: 'Programación informática y aplicaciones específicas',
      en: 'Computer Programming and Specific Applications',
    },
    period: '2019 – 2023',
  },
  {
    institution: 'Instituto Ingenia',
    degree: { es: 'Certificación en Robótica', en: 'Robotics Certification' },
    period: '2017 – 2019',
  },
];

export interface ProjectItem {
  name: BilingualText;
  liveUrl: string;
  githubUrl: string;
  demoUrl?: string;
  description: BilingualText;
  longDescription: BilingualText;
  technologies: string[];
  status: 'live' | 'wip';
  date: string;
}

export const projects: ProjectItem[] = [
  {
    name: { es: 'Sistema ERP / POS', en: 'ERP / POS System' },
    liveUrl: 'https://manager-master-hol0gw9pp-dani-ideas-projects.vercel.app/',
    githubUrl: 'https://github.com/Dani-Ideas',
    demoUrl: '/pos-demo/',
    description: {
      es: 'Sistema completo de punto de venta e inventario en producción. Módulo SGI con Kardex (StockMove), lotes y ubicaciones jerárquicas. Integración con Stripe y Mercado Pago (pago dividido en POS). NextAuth v5, control de sesiones de caja y auditoría completa.',
      en: 'Complete point of sale and inventory system in production. SGI module with Kardex (StockMove), lots and hierarchical locations. Integration with Stripe and Mercado Pago (split payment in POS). NextAuth v5, cashier session control and full audit trail.',
    },
    longDescription: {
      es: 'ERP y punto de venta fullstack: inventario con Kardex, lotes y ubicaciones jerárquicas, POS con pago dividido, Stripe + Mercado Pago. Deploy continuo en Vercel + Supabase.',
      en: 'Fullstack ERP and point of sale: inventory with Kardex, lots and hierarchical locations, POS with split payment, Stripe + Mercado Pago. Continuous deploy on Vercel + Supabase.',
    },
    technologies: ['Next.js 16', 'TypeScript', 'PostgreSQL', 'Prisma ORM', 'NextAuth v5', 'Zustand', 'Tailwind CSS', 'Stripe', 'Supabase', 'SheetJS', 'Vercel'],
    status: 'live',
    date: '2025',
  },
  {
    name: { es: 'Sistema de Inventario (SGI)', en: 'Inventory System (SGI)' },
    liveUrl: '',
    githubUrl: 'https://github.com/Dani-Ideas',
    demoUrl: '/sgi-demo/',
    description: {
      es: 'Módulo de gestión de inventario con Kardex (StockMove), lotes y ubicaciones jerárquicas. Exportación a Excel. Demo interactiva con datos precargados — sin backend.',
      en: 'Inventory management module with Kardex (StockMove), lots and hierarchical locations. Excel export. Interactive demo with preloaded data — no backend.',
    },
    longDescription: {
      es: 'SGI demo: Kardex con búsqueda y exportación XLSX, recepciones, traslados entre almacenes, visualización de rutas INPUT→QC→STOCK. Zustand + localStorage (persiste entre recargas).',
      en: 'SGI demo: Kardex with search and XLSX export, receipts, warehouse transfers, route visualization INPUT→QC→STOCK. Zustand + localStorage (persists across reloads).',
    },
    technologies: ['React 19', 'TypeScript', 'Zustand', 'Tailwind CSS v4', 'shadcn/ui', 'Vite', 'xlsx'],
    status: 'live',
    date: '2025',
  },
];

export const nav = [
  { href: '#about',      label: { es: 'Sobre mí',    en: 'About' } },
  { href: '#experience', label: { es: 'Experiencia', en: 'Experience' } },
  { href: '#projects',   label: { es: 'Proyectos',   en: 'Projects' } },
  { href: '#education',  label: { es: 'Educación',   en: 'Education' } },
  { href: '#skills',     label: { es: 'Habilidades', en: 'Skills' } },
];
