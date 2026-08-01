import PDFDocument from 'pdfkit';
import { Response } from 'express';

// Streams a clean PDF rendering of the proposal markdown straight to the HTTP
// response. Handles the markdown the model actually produces: headings (#, ##,
// or a fully-bold line), bullet points, and inline **bold**.
export function streamProposalPdf(res: Response, opts: { title: string; markdown: string }) {
  const doc = new PDFDocument({ size: 'A4', margin: 56 });
  doc.pipe(res);

  doc.font('Helvetica-Bold').fontSize(18).text(opts.title);
  doc.moveDown(1);

  renderMarkdown(doc, opts.markdown);

  doc.end();
}

function renderMarkdown(doc: PDFKit.PDFDocument, markdown: string) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.trim() === '') {
      doc.moveDown(0.5);
      continue;
    }

    // Heading via #, ## or ###
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      const size = heading[1].length === 1 ? 15 : heading[1].length === 2 ? 13 : 12;
      doc.moveDown(0.4).font('Helvetica-Bold').fontSize(size).text(clean(heading[2]));
      doc.moveDown(0.2);
      continue;
    }

    // Heading via a fully-bold line, e.g. **Introduction**
    const boldOnly = line.match(/^\*\*(.+?)\*\*:?\s*$/);
    if (boldOnly) {
      doc.moveDown(0.4).font('Helvetica-Bold').fontSize(13).text(clean(boldOnly[1]));
      doc.moveDown(0.2);
      continue;
    }

    // Bullet point
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      renderInline(doc, `•  ${bullet[1]}`);
      continue;
    }

    renderInline(doc, line);
  }
}

// Renders a line with inline **bold** support, then a small gap after it.
function renderInline(doc: PDFKit.PDFDocument, text: string) {
  const segments = text.split(/\*\*/); // even = normal, odd = bold
  doc.fontSize(11);

  segments.forEach((segment, i) => {
    if (segment === '') return;
    const isLast = i === segments.length - 1;
    doc
      .font(i % 2 === 1 ? 'Helvetica-Bold' : 'Helvetica')
      .text(clean(segment), { continued: !isLast });
  });
  // Ensure the paragraph is closed even if it ended on a "continued" segment.
  doc.text('', { continued: false });
  doc.moveDown(0.35);
}

// Strips leftover inline markdown characters (stray * and backticks).
function clean(s: string): string {
  return s.replace(/[*`]/g, '');
}
