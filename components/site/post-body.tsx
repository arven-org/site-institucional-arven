import { type Block } from "@/lib/site/blog";

/** Renderiza o corpo do artigo a partir dos blocos tipados. */
export function PostBody({ body }: { body: Block[] }) {
  return (
    <div className="mx-auto max-w-[42rem]">
      {body.map((block, i) => {
        const key = `${block.type}-${String(i)}`;
        switch (block.type) {
          case "lead":
            return (
              <p
                key={key}
                className="mb-10 text-[1.2rem] leading-relaxed"
                style={{ color: "var(--fg)" }}
              >
                {block.text}
              </p>
            );
          case "p":
            return (
              <p
                key={key}
                className="mb-6 text-[1.05rem] leading-[1.75]"
                style={{ color: "var(--fg-muted)" }}
              >
                {block.text}
              </p>
            );
          case "h2":
            return (
              <h2
                key={key}
                className="display mt-14 mb-5"
                style={{ fontSize: "clamp(1.5rem, 3vw, 1.9rem)" }}
              >
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={key}
                className="mt-10 mb-4 text-[1.15rem] font-semibold"
                style={{ color: "var(--fg)" }}
              >
                {block.text}
              </h3>
            );
          case "ul":
            return (
              <ul key={key} className="mb-6 space-y-3">
                {block.items.map((item, j) => (
                  <li
                    key={`${key}-${String(j)}`}
                    className="relative pl-6 text-[1.05rem] leading-[1.7]"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    <span
                      aria-hidden
                      className="absolute top-[0.7em] left-0 h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: "var(--sand)" }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote
                key={key}
                className="display my-12 border-l-2 pl-6"
                style={{
                  borderColor: "var(--ink)",
                  fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
                  lineHeight: 1.25,
                }}
              >
                {block.text}
              </blockquote>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
