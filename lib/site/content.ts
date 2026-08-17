/**
 * Conteudo do site institucional Arven. Fonte unica de verdade para copy
 * estrutural. Sem travessao, tom editorial, PT-BR com acentuacao correta.
 * Numeros reais fornecidos pela lideranca.
 */

export const brand = {
  name: "Arven",
  tagline: "Performance & Intelligence",
  promise: "Inteligência aplicada ao crescimento.",
  positioning: "Um time de performance. Não uma agência.",
  email: "contato@arvenoficial.com",
  location: "Santa Catarina, Brasil",
  presence: "Time 100% presencial",
  // Fonte unica de verdade dos CTAs. Trocar por Calendly/Cal.com quando houver.
  scheduleUrl: "mailto:contato@arvenoficial.com?subject=Quero%20agendar%20uma%20reuni%C3%A3o",
  scheduleLabel: "Agendar reunião",
  // Checkout do ebook (Hotmart). Destino apos o lead passar pela qualificacao.
  checkoutUrl: "https://pay.hotmart.com/A107100553U",
  social: {
    linkedin: "https://www.linkedin.com/company/arvensolutions",
    instagram: "https://www.instagram.com/arvensolutions",
  },
} as const;

export const nav = [
  { label: "Sobre", href: "/#sobre" },
  { label: "Serviços", href: "/#servicos" },
  { label: "Resultados", href: "/#resultados" },
  { label: "ADv", href: "/#adv" },
  { label: "Clientes", href: "/#clientes" },
  { label: "Blog", href: "/blog" },
] as const;

/** Entregáveis reais que o cliente recebe. */
export const deliverables = [
  {
    id: "dashboard",
    title: "Dashboard de marketing e vendas",
    body: "100% conectado ao time comercial e às plataformas de mídia.",
  },
  {
    id: "whatsapp-relatorios",
    title: "Relatórios em tempo real no WhatsApp",
    body: "Leads e métricas direto no WhatsApp, para acesso fácil e discussões estratégicas.",
  },
  {
    id: "time-conectado",
    title: "Time conectado, de segunda a sábado",
    body: "Grupo no WhatsApp com todo o time. Comunicação direta e decisão mais ágil.",
  },
  {
    id: "automacoes",
    title: "Automações com dados proprietários",
    body: "Banco de dados exclusivo por cliente e automações orquestradas no n8n, no servidor interno da Arven. Fluxos melhores, resposta rápida ao lead e dados confiáveis.",
  },
] as const;

export const services = [
  {
    id: "midia",
    title: "Mídia Paga",
    body: "Tráfego pago orientado por dados no LinkedIn, Google, Meta e TikTok Ads.",
    detail: "Do teste à escala, com verba sempre protegida. Mais de R$8 milhões geridos por mês.",
  },
  {
    id: "crm",
    title: "Qualificação e CRM",
    body: "Mais de 70 CRMs implementados em 2026, prontos para o comercial.",
    detail: "Integramos nossa inteligência ao Kommo, HubSpot, Salesforce e Pipedrive.",
  },
  {
    id: "criativos",
    title: "Criativos e ADv",
    body: "Metodologia própria de criativos que parecem conteúdo, não propaganda.",
    detail:
      "Criada para os advogados mais influentes do Brasil. Demanda com mais de 70% de qualificação.",
  },
  {
    id: "automacao",
    title: "Automação e IA",
    body: "IA aplicada a processos, projetos, comercial e marketing para elevar as métricas.",
    detail: "Automatizamos o operacional e integramos inteligência de ponta a ponta.",
  },
] as const;

/** Metricas reais. Algumas animam (Counter), outras sao faixas (static). */
export const metrics = [
  {
    id: "midia",
    prefix: "R$",
    value: 8,
    suffix: "Mi",
    label: "Em mídia paga gerida",
    note: "todo mês, com verba protegida e método.",
  },
  {
    id: "crm",
    prefix: "+",
    value: 70,
    suffix: "",
    label: "CRMs implementados",
    note: "em diversos nichos e operações.",
  },
  {
    id: "qualificacao",
    value: 70,
    suffix: "%",
    label: "Taxa de qualificação",
    note: "de média nos funis que operamos.",
  },
  {
    id: "roas",
    static: "3 a 5x",
    label: "ROAS em perpétuo",
    note: "com lead qualificado a R$80 a R$120.",
  },
] as const;

/** ADv, metodologia proprietaria de criativos para advogados. */
export const adv = {
  name: "ADv",
  poweredBy: "Powered by Arven",
  subtitle: "Sistema de Criativos para Advogados",
  materialUrl: "/materiais/adv-metodo-arven.pdf",
  materialLabel: "Quero o ebook",
  lead: "Criamos uma metodologia única de produção de criativos. Em vez de entregar peça pronta, ensinamos o advogado a gravar ads que parecem conteúdo, não propaganda, com estrutura, ângulo e linguagem certos para cada nível de consciência do lead.",
  pillars: [
    {
      title: "Quebrar o padrão",
      body: "Formato, hook e fator dinâmico para roubar a atenção nos primeiros segundos.",
    },
    {
      title: "Se conectar",
      body: "Ângulo e linguagem do ICP, para o lead sentir que aquilo fala com ele.",
    },
    {
      title: "Estimular a ação",
      body: "Chamada clara que transforma atenção em lead qualificado.",
    },
  ],
} as const;

/** Stack de ferramentas integradas. logo null = fallback em texto. */
interface IntegrationGroup {
  label: string;
  items: { name: string; logo: string | null }[];
}
export const integrations: IntegrationGroup[] = [
  {
    label: "CRM",
    items: [
      { name: "HubSpot", logo: "/logos/hubspot.svg" },
      { name: "Salesforce", logo: "/logos/salesforce.svg" },
      { name: "Pipedrive", logo: null },
      { name: "Kommo", logo: null },
    ],
  },
  {
    label: "Mídia",
    items: [
      { name: "Meta", logo: "/logos/meta.svg" },
      { name: "Google Ads", logo: "/logos/googleads.svg" },
      { name: "LinkedIn", logo: "/logos/linkedin.svg" },
      { name: "TikTok", logo: "/logos/tiktok.svg" },
    ],
  },
  {
    label: "Inteligência",
    items: [
      { name: "OpenAI", logo: "/logos/openai.svg" },
      { name: "Anthropic", logo: "/logos/anthropic.svg" },
      { name: "Gemini", logo: "/logos/googlegemini.svg" },
      { name: "n8n", logo: "/logos/n8n.svg" },
    ],
  },
];

/**
 * Roster real de parceiros e clientes. Prova social.
 * A foto e carregada de /images/clientes/<slug>.jpg. Se o arquivo nao existir,
 * o card cai para um monograma automaticamente (onError).
 */
/** Clientes em destaque, com nome e nicho. Carrossel principal. */
export const clients = [
  { photo: "adrian-carvalho.png", name: "Adrian Carvalho", kind: "Engenharia Patrimonial" },
  { photo: "germano-eag.jpg", name: "Marcelo Germano", kind: "EAG" },
  { photo: "alan-ribeiro.png", name: "Allan Ribeiro", kind: "Advogado Bancário" },
  { photo: "paulo-freitas.png", name: "Paulo H. De Freitas", kind: "Direito Bancário" },
  { photo: "daniel-cheida.webp", name: "Daniel Cheida", kind: "Direito Bancário" },
  { photo: "araujo-refosco.png", name: "Araújo & Refosco", kind: "Reestruturação de Dívidas" },
  { photo: "tulio-parca.png", name: "Túlio Parça", kind: "Direito do Agronegócio" },
  { photo: "leonardo-cabral.png", name: "Leonardo Cabral", kind: "Advocacia" },
  { photo: "luis-hungaro.png", name: "Luis Hungaro", kind: "Licitações" },
] as const;

/** Demais clientes, fileira menor de avatares. "E muitos outros". */
export const moreClients = [
  { photo: "saraiva-e-castro.png", name: "Saraiva e Castro" },
  { photo: "guido-chicata.jpg", name: "Guido Chicata" },
  { photo: "gustavo-souza.png", name: "Gustavo Souza" },
  { photo: "matheus-emanuel.webp", name: "Matheus Emanuel" },
  { photo: "isabele-martins.webp", name: "Isabele Martins" },
  { photo: "santos-barros.jpg", name: "Santos Barros" },
  { photo: "viviane-macedo-brandao.png", name: "Viviane Macedo e Brandão" },
  { photo: "daniel-vatanabe.webp", name: "Daniel Vatanabe" },
  { photo: "nenger-lima.jpg", name: "Nenger Lima" },
  { photo: "ppa-advogados.jpeg", name: "PPA Advogados" },
  { photo: "douglas-ibarra.webp", name: "Douglas Ibarra" },
  { photo: "jose-cajazeiro.webp", name: "José Cajazeiro" },
  { photo: "rhuan-christo.jpeg", name: "Rhuan Christo" },
  { photo: "rodolfo-clivati.webp", name: "Rodolfo Clivati" },
] as const;

export const footerServices = services.map((s) => s.title);
