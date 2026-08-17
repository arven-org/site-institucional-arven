/**
 * Blog da Arven. Posts como dados tipados (sem dependencia de MDX), renderizados
 * pelo PostBody com o design system do site. Ordenados por data desc.
 */

interface LeadBlock {
  type: "lead";
  text: string;
}
interface ParagraphBlock {
  type: "p";
  text: string;
}
interface HeadingBlock {
  type: "h2" | "h3";
  text: string;
}
interface ListBlock {
  type: "ul";
  items: string[];
}
interface QuoteBlock {
  type: "quote";
  text: string;
}
export type Block = LeadBlock | ParagraphBlock | HeadingBlock | ListBlock | QuoteBlock;

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string; // ISO
  readingMinutes: number;
  body: Block[];
}

const posts: Post[] = [
  {
    slug: "producao-de-criativos-em-mercados-de-alto-valor",
    title: "Produção de criativos em mercados de alto valor",
    excerpt:
      "Por que o público mais qualificado é o mais cético a anúncios, e como criar criativos que ele reconhece como conteúdo, não propaganda.",
    category: "Método",
    date: "2026-08-10",
    readingMinutes: 7,
    body: [
      {
        type: "lead",
        text: "Em mercados de alto valor, o lead que você mais quer é justamente o mais difícil de convencer. Quanto mais qualificado o público, mais cético ele é a qualquer coisa que cheire a propaganda. Produzir criativo para esse mercado é, antes de tudo, um exercício de disfarce: o anúncio precisa parecer conteúdo.",
      },
      { type: "h2", text: "A premissa: todo mundo odeia anúncio" },
      {
        type: "p",
        text: "Ninguém abre uma rede social querendo ver propaganda. As pessoas entram para consumir. Quando um criativo imita a linguagem nativa da plataforma, o cérebro do lead não ativa o filtro de propaganda, e ele assiste. Em mercados de alto valor isso é ainda mais crítico: o empresário endividado, o investidor, o gestor que aprova compras de seis dígitos, todos já foram abordados mil vezes por anúncios genéricos. O filtro deles é mais afiado.",
      },
      { type: "p", text: "O trabalho não é gritar mais alto. É soar como alguém de dentro." },
      { type: "h2", text: "O criativo virou a nova segmentação" },
      {
        type: "p",
        text: "Durante anos, segmentar significou configurar público no gerenciador: idade, interesse, cargo. Hoje, com os algoritmos otimizando por sinal de conversão, a segmentação mais eficiente acontece dentro do próprio criativo. Você atrai o público certo pela forma como fala, não pela caixinha que marca na campanha.",
      },
      {
        type: "p",
        text: "E aqui mora o detalhe: dizer explicitamente “você que tem dívida acima de um milhão” soa como um anúncio tentando filtrar, e isso já dispara a desconfiança. O público de alto valor reconhece o convite pelos sinais, não pela etiqueta.",
      },
      { type: "h3", text: "Signos: o cenário fala antes da primeira palavra" },
      {
        type: "p",
        text: "O lead precisa reconhecer, na tela, sinais que remetem ao mundo dele. Um escritório bem estruturado, um carro de padrão executivo, uma sala de reunião, a roupa certa, o relógio. Mesmo alguém em dificuldade financeira ainda carrega o imaginário de quem construiu algo. O cenário deve sinalizar “isso aqui fala com quem tem uma empresa” antes de qualquer fala.",
      },
      { type: "h3", text: "Linguagem: falar a língua exata do ICP" },
      {
        type: "p",
        text: "Termos que só quem vive o problema reconhece de imediato criam congruência instantânea. EBITDA comprometido, DARF em atraso, capital de giro no vermelho, protesto em cartório, recuperação judicial. Um leigo não reconhece esses termos com naturalidade. O cliente certo sente, de cara, que ali tem alguém que entende o problema dele.",
      },
      { type: "h2", text: "Formato e hook: os três primeiros segundos" },
      {
        type: "p",
        text: "O formato é a primeira coisa que o cérebro processa, antes de entender o que está sendo dito. Formatos familiares, os que a pessoa associa ao orgânico, reduzem a resistência na hora. Bate-papo, reação, tela dividida, sequência de prints. Qualquer coisa que não pareça uma peça publicitária.",
      },
      {
        type: "p",
        text: "Dentro desse formato, os primeiros dois ou três segundos decidem tudo. Se o hook não prende, não importa quão boa é a copy depois: ninguém vai saber que ela existe. Em mercado de alto valor, o hook que funciona costuma ser específico e um pouco desconfortável, do tipo que faz o lead pensar “como assim, isso é comigo”.",
      },
      {
        type: "ul",
        items: [
          "Pergunta direta e específica, que só faz sentido para quem vive aquele momento.",
          "Afirmação polêmica, que divide opinião e gera reação.",
          "Corte no ápice de uma cena, sem introdução, como se fosse o meio de um conteúdo que já rolava.",
        ],
      },
      { type: "h2", text: "Nível de consciência: você não fala igual para todo mundo" },
      {
        type: "p",
        text: "O mesmo criativo não serve para quem nunca ouviu falar do problema e para quem já está comparando soluções. O lead frio precisa reconhecer a dor antes de qualquer oferta. O lead consciente precisa de prova e diferenciação. Calibrar o discurso pelo nível de consciência é o que separa um criativo que educa de um que espanta.",
      },
      {
        type: "quote",
        text: "Criativo vencedor em mercado de alto valor não é inspiração. É estrutura.",
      },
      { type: "h2", text: "Método, não sorte" },
      {
        type: "p",
        text: "Entender cada alavanca, formato, hook, signo, linguagem e ângulo, permite gerar infinitas variações de criativos vencedores sem nunca perder o que funciona. Foi exatamente para sistematizar isso que criamos o ADv, nosso sistema de criativos, hoje usado pelos advogados e mentores mais influentes do Brasil.",
      },
    ],
  },
];

export function getAllPosts(): Post[] {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function formatDate(iso: string): string {
  const parts = iso.split("-");
  const d = Number(parts[2]);
  const m = Number(parts[1]);
  const y = Number(parts[0]);
  return `${String(d)} de ${MESES[m - 1] ?? ""} de ${String(y)}`;
}
