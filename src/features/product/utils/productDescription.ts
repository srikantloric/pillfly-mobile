export type DescriptionSpan = {
  text: string;
  bold: boolean;
};

export type DescriptionParagraph = {
  spans: DescriptionSpan[];
};

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

const BLOCK_TAGS = new Set(["p", "div", "li", "h1", "h2", "h3", "h4", "h5", "h6"]);

function decodeEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, body: string) => {
    const token = body.toLowerCase();
    if (token.startsWith("#x")) {
      const code = Number.parseInt(token.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : entity;
    }
    if (token.startsWith("#")) {
      const code = Number.parseInt(token.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : entity;
    }
    return NAMED_ENTITIES[token] ?? entity;
  });
}

function normalizeWhitespace(value: string): string {
  return value.replace(/[ \t\f\r]+/g, " ").replace(/ *\n */g, "\n");
}

function trimParagraph(spans: DescriptionSpan[]): DescriptionSpan[] {
  if (spans.length === 0) {
    return [];
  }

  const next = spans.map((span) => ({ ...span }));
  next[0].text = next[0].text.replace(/^\n+/, "").replace(/^ +/, "");
  const lastIndex = next.length - 1;
  next[lastIndex].text = next[lastIndex].text.replace(/\n+$/, "").replace(/ +$/, "");
  return next.filter((span) => span.text.length > 0);
}

export function parseProductDescription(source: string): DescriptionParagraph[] {
  const trimmed = source.trim();
  if (!trimmed) {
    return [];
  }

  if (!/<[a-z/!]/i.test(trimmed)) {
    return [{ spans: [{ text: trimmed, bold: false }] }];
  }

  const markup = trimmed
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");

  const paragraphs: DescriptionParagraph[] = [];
  let spans: DescriptionSpan[] = [];
  let bold = false;
  let buffer = "";

  const pushSpan = () => {
    const text = normalizeWhitespace(decodeEntities(buffer));
    buffer = "";
    if (!text) {
      return;
    }

    const previous = spans[spans.length - 1];
    if (previous && previous.bold === bold) {
      previous.text += text;
      return;
    }

    spans.push({ text, bold });
  };

  const pushParagraph = () => {
    pushSpan();
    const content = trimParagraph(spans);
    spans = [];
    if (content.length > 0) {
      paragraphs.push({ spans: content });
    }
  };

  const tagPattern = /<\/?([a-z0-9]+)(?:\s[^>]*)?\/?>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(markup)) !== null) {
    buffer += markup.slice(lastIndex, match.index);
    lastIndex = tagPattern.lastIndex;

    const name = match[1].toLowerCase();
    const closing = match[0].startsWith("</");

    if (name === "br") {
      buffer += "\n";
      continue;
    }

    if (name === "strong" || name === "b") {
      pushSpan();
      bold = !closing;
      continue;
    }

    if (BLOCK_TAGS.has(name)) {
      if (!closing && buffer.trim().length === 0 && spans.length === 0) {
        buffer = "";
        continue;
      }
      pushParagraph();
    }
  }

  buffer += markup.slice(lastIndex);
  pushParagraph();

  return paragraphs;
}
