import type { ReportDetail } from '@/types';

type ExportFormat = 'pdf' | 'md' | 'html';

function buildMarkdown(report: ReportDetail): string {
  const lines: string[] = [];
  lines.push(`# ${report.title}`);
  lines.push('');
  lines.push(`> 报告 ID：${report.report_id}　｜　任务 ID：${report.task_id}　｜　生成时间：${report.created_at}`);
  lines.push('');
  lines.push(report.content);

  if (report.citations.length > 0) {
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## 引用来源');
    lines.push('');
    report.citations.forEach((c, i) => {
      const number = c.index_number && c.index_number > 0 ? c.index_number : i + 1;
      const key = c.cite_key ? ` @${c.cite_key}` : '';
      lines.push(`${number}. [${c.source_title}](${c.source_url})${key}`);
    });
  }

  lines.push('');
  return lines.join('\n');
}

function buildHtml(report: ReportDetail): string {
  const citationsHtml =
    report.citations.length > 0
      ? `<hr/><h2>引用来源</h2><ol>${report.citations
          .map(
            (c) =>
              `<li><a href="${encodeURI(c.source_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(c.source_title)}</a>${c.cite_key ? ` <code>@${escapeHtml(c.cite_key)}</code>` : ''}</li>`
          )
          .join('')}</ol>`
      : '';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"/>
<title>${escapeHtml(report.title)}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans SC", sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; line-height: 1.8; }
  h1 { font-size: 1.75rem; margin-bottom: 0.25em; }
  .meta { color: #64748b; font-size: 0.85rem; margin-bottom: 1.5em; }
  .content { white-space: pre-wrap; font-size: 1rem; }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 2em 0; }
  h2 { font-size: 1.25rem; }
  ol { padding-left: 1.25em; }
  li { margin-bottom: 0.35em; }
  a { color: #2563eb; text-decoration: none; }
  a:hover { text-decoration: underline; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
<h1>${escapeHtml(report.title)}</h1>
<p class="meta">报告 ID：${escapeHtml(report.report_id)}　｜　任务 ID：${escapeHtml(report.task_id)}　｜　生成时间：${escapeHtml(report.created_at)}</p>
<div class="content">${escapeHtml(report.content)}</div>
${citationsHtml}
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadReport(report: ReportDetail, format: ExportFormat) {
  const safeTitle = report.title.replace(/[/\\?%*:|"<>]/g, '_');

  switch (format) {
    case 'md': {
      const md = buildMarkdown(report);
      downloadBlob(new Blob([md], { type: 'text/markdown;charset=utf-8' }), `${safeTitle}.md`);
      break;
    }
    case 'html': {
      const html = buildHtml(report);
      downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8' }), `${safeTitle}.html`);
      break;
    }
    case 'pdf': {
      const html = buildHtml(report);
      const win = window.open('', '_blank');
      if (!win) {
        throw new Error('浏览器阻止了弹窗，请允许弹窗后重试。');
      }
      win.document.write(html);
      win.document.close();
      // Wait for content to render before triggering print
      win.addEventListener('afterprint', () => win.close());
      setTimeout(() => win.print(), 300);
      break;
    }
  }
}
