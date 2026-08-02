// Minimal, safe markdown -> HTML for the proposal output. Handles headings,
// bullet lists, inline **bold**, and paragraphs. Escapes HTML first so AI
// output can never inject markup.
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inline(s: string): string {
  return escapeHtml(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.trim() === '') {
      closeList();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = heading[1].length + 1; // #->h2, ##->h3
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    const boldOnly = line.match(/^\*\*(.+?)\*\*:?\s*$/);
    if (boldOnly) {
      closeList();
      out.push(`<h3>${inline(boldOnly[1])}</h3>`);
      continue;
    }

    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }

    closeList();
    out.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  return out.join('\n');
}
