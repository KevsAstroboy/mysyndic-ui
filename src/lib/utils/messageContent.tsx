import React from "react";

/**
 * Contenu de message : rendu léger et sûr + conversion d'un collage riche.
 *
 * Rendu (jamais de HTML brut — aucune XSS) :
 *  - gras **texte**
 *  - italique *texte*
 *  - nouvelle ligne (\n) → saut de ligne (rendu pre-wrap)
 *  - émojis / unicode → conservés
 *
 * Conversion `htmlToMessageMarkup` : transforme un collage riche (Word,
 * navigateur…) en texte + marqueurs (gras/italique) + retours à la ligne,
 * pour conserver la mise en forme même si l'éditeur est un textarea.
 */

type Seg = { t: string; b?: boolean; i?: boolean };

function parseInline(text: string): Seg[] {
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  const out: Seg[] = [];
  for (const part of boldParts) {
    const bm = part.match(/^\*\*(.+)\*\*$/);
    if (bm) {
      out.push(...parseItalic(bm[1], true));
    } else {
      out.push(...parseItalic(part, false));
    }
  }
  return out;
}

function parseItalic(text: string, bold: boolean): Seg[] {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return parts.map((p) => {
    const im = p.match(/^\*(.+)\*$/);
    if (im) return { t: im[1], i: true, b: bold };
    return { t: p, b: bold };
  });
}

export function renderMessageContent(content: string): React.ReactNode {
  if (!content) return null;
  // Normalise les fins de ligne (CRLF/CR) et retire le hard-break Markdown
  // (barre oblique en fin de ligne) pour ne pas l'afficher tel quel.
  const lines = content
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\\\s*$/, ""));
  return lines.map((line, li) => {
    const segs = parseInline(line);
    let node: React.ReactNode = line;
    if (segs.length > 1 || segs.some((s) => s.b || s.i)) {
      node = segs.map((s, si) => {
        if (s.b || s.i) {
          return (
            <span
              key={si}
              className={s.b ? "font-semibold" : undefined}
              style={s.i && !s.b ? { fontStyle: "italic" } : undefined}
            >
              {s.t}
            </span>
          );
        }
        return <React.Fragment key={si}>{s.t}</React.Fragment>;
      });
    }
    return (
      <React.Fragment key={li}>
        {node}
        {li < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

/** Détecte si le texte brut semble déjà « balisé » (non affiché tel quel). */
export function hasMarkup(text: string): boolean {
  return /\*\*[^*]+\*\*|\*[^*]+\*/.test(text);
}

const BLOCK_BREAK = /<\/(p|div|li|h[1-6]|tr|ul|ol)>|<br\s*\/?>/gi;

/**
 * Collage riche → texte + marqueurs. Garde gras/italique/surligné-émojis et
 * les retours à la ligne ; retire tout le HTML restant (sûr à stocker).
 */
export function htmlToMessageMarkup(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const walk = (node: Node): string => {
    const tag = (node as Element).tagName?.toLowerCase?.();
    if (tag === "br") return "\n";
    if (tag === "p" || tag === "div" || tag === "li") {
      const inner = Array.from(node.childNodes).map(walk).join("");
      return tag === "li" ? `• ${inner}\n` : `${inner}\n`;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent ?? "").replace(/\u00a0/g, " ");
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const inner = Array.from(el.childNodes).map(walk).join("");
      if (tag === "b" || tag === "strong") return `**${inner}**`;
      if (tag === "i" || tag === "em") return `*${inner}*`;
      return inner;
    }
    return "";
  };
  const text = walk(doc.body).replace(/\n{3,}/g, "\n\n").trim();
  return text.replace(BLOCK_BREAK, "\n");
}
