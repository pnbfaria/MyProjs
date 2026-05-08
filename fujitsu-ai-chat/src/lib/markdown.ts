/**
 * Simple markdown-to-HTML renderer for chat messages.
 * Handles headings, bold, italic, code blocks, inline code,
 * lists, tables, links, and paragraphs.
 */
export function renderMarkdown(text: string): string {
  let html = text;

  // Fenced code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
    return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
  });

  // Tables
  html = html.replace(
    /(?:^|\n)((?:\|.*\|[ \t]*\n)+)/g,
    (_match, tableBlock: string) => {
      const rows = tableBlock.trim().split('\n');
      if (rows.length < 2) return tableBlock;

      const parseRow = (row: string) =>
        row.split('|').filter((c) => c.trim() !== '').map((c) => c.trim());

      const headerCells = parseRow(rows[0]);
      // Skip separator row (row[1])
      const bodyRows = rows.slice(2);

      let table = '<table><thead><tr>';
      headerCells.forEach((c) => (table += `<th>${c}</th>`));
      table += '</tr></thead><tbody>';
      bodyRows.forEach((row) => {
        const cells = parseRow(row);
        table += '<tr>';
        cells.forEach((c) => (table += `<td>${c}</td>`));
        table += '</tr>';
      });
      table += '</tbody></table>';
      return '\n' + table + '\n';
    }
  );

  const lines = html.split('\n');
  const result: string[] = [];
  let inList = false;
  let listType = '';

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Skip if inside pre block
    if (line.startsWith('<pre>') || line.startsWith('<table>')) {
      result.push(line);
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      if (inList) { result.push(`</${listType}>`); inList = false; }
      result.push(`<h3>${processInline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) { result.push(`</${listType}>`); inList = false; }
      result.push(`<h2>${processInline(line.slice(3))}</h2>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) result.push(`</${listType}>`);
        result.push('<ol>');
        inList = true; listType = 'ol';
      }
      result.push(`<li>${processInline(olMatch[2])}</li>`);
      continue;
    }

    // Unordered list
    if (line.match(/^[-*]\s+/)) {
      if (!inList || listType !== 'ul') {
        if (inList) result.push(`</${listType}>`);
        result.push('<ul>');
        inList = true; listType = 'ul';
      }
      result.push(`<li>${processInline(line.replace(/^[-*]\s+/, ''))}</li>`);
      continue;
    }

    // Close list if needed
    if (inList && line.trim() === '') {
      result.push(`</${listType}>`);
      inList = false;
      continue;
    }
    if (inList && !line.match(/^\s/)) {
      result.push(`</${listType}>`);
      inList = false;
    }

    // Empty line
    if (line.trim() === '') {
      continue;
    }

    // Paragraph
    result.push(`<p>${processInline(line)}</p>`);
  }

  if (inList) result.push(`</${listType}>`);

  return result.join('\n');
}

function processInline(text: string): string {
  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Links
  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  return text;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
