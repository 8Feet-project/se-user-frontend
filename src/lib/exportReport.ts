import type { ReportDetail } from '@/types';
import { buildApiUrl } from '@/api/http';

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
      const source = c.source_url ? `[${c.source_title}](${c.source_url})` : c.source_title;
      const sourceMeta = [c.source_platform, c.source_type].filter((item): item is string => Boolean(item));
      lines.push(`${number}. ${source}${key}`);
      if (sourceMeta.length > 0) {
        lines.push(`   - 来源：${sourceMeta.join(' / ')}`);
      }
      if (!c.source_url && c.reproduction_code) {
        lines.push('   - 复现代码：');
        lines.push('```python');
        lines.push(c.reproduction_code);
        lines.push('```');
      }
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
            (c) => {
              const title = c.source_url
                ? `<a href="${encodeURI(c.source_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(c.source_title)}</a>`
                : escapeHtml(c.source_title);
              const meta = [c.source_platform, c.source_type]
                .filter((item): item is string => Boolean(item))
                .map(escapeHtml)
                .join(' / ');
              const code = !c.source_url && c.reproduction_code ? `<pre><code>${escapeHtml(c.reproduction_code)}</code></pre>` : '';
              return `<li>${title}${c.cite_key ? ` <code>@${escapeHtml(c.cite_key)}</code>` : ''}${meta ? `<div class="citation-meta">${meta}</div>` : ''}${code}</li>`;
            }
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
  .citation-meta { color: #64748b; font-size: 0.85rem; }
  pre { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow-x: auto; padding: 0.75rem; }
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

function openDownloadLink(url: string) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) {
    return null;
  }
  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1].trim().replace(/^"|"$/g, ''));
  }
  const filenameMatch = header.match(/filename="?([^";]+)"?/i);
  return filenameMatch?.[1] ? filenameMatch[1].trim() : null;
}

export async function downloadReportFile(downloadUrl: string) {
  if (/^https?:\/\//i.test(downloadUrl)) {
    const url = new URL(downloadUrl);
    if (url.origin !== window.location.origin) {
      openDownloadLink(downloadUrl);
      return;
    }
  }

  const accessToken = localStorage.getItem('access_token');
  const response = await fetch(buildApiUrl(downloadUrl), {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  if (!response.ok) {
    throw new Error(`下载失败 (${response.status})`);
  }

  const blob = await response.blob();
  const filename = filenameFromContentDisposition(response.headers.get('content-disposition')) || 'report-export';
  downloadBlob(blob, filename);
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
