/**
 * Printable quote/invoice HTML aligned with ms-billing buildQuoteClientHtml for client-side PDF.
 * Keep markup, styles, and script logic in sync when package PDFs change.
 */
import type { Invoice, LineItem, Quote, TimelineEvent } from '../api/admin-api'
import {
  eventRangeLabelForClient,
  formatClientFacingDate,
  lineItemPayableAmount,
  quoteDisplayTotal,
  timelineDaySpanLabel,
} from './quote-display'
import { quoteClientBrandHeaderHtml, quoteClientBrandStyles, quoteClientFooterHtml } from './quote-print-branding'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function sortedEvents(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => {
    const o = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    if (o !== 0) return o
    return String(a.startDate).localeCompare(String(b.startDate))
  })
}

function collectDescendantLineIds(li: LineItem): Set<string> {
  const ids = new Set<string>()
  const walk = (item: LineItem) => {
    ids.add(item.id)
    for (const c of item.subLineItems ?? []) walk(c)
  }
  walk(li)
  return ids
}

function lineDeliverableLabel(l: LineItem): string {
  const t = (l.title ?? '').trim()
  const d = (l.description ?? '').trim()
  if (t && d) return `${t} — ${d}`
  return t || d || 'Deliverable'
}

function narrativeSection(title: string, body: string): string {
  if (!body.trim()) return ''
  return `<section class="narrative-block"><h3>${escapeHtml(title)}</h3><div class="narrative-body">${escapeHtml(body)}</div></section>`
}

function buildNarrativeHtml(lineItems: LineItem[], evs: TimelineEvent[]): string {
  let narrativeHtml = ''
  const byLine = new Map<string | null, TimelineEvent[]>()
  for (const e of evs) {
    const k = e.lineItemId ?? null
    if (!byLine.has(k)) byLine.set(k, [])
    byLine.get(k)!.push(e)
  }

  for (const line of lineItems) {
    const allowed = collectDescendantLineIds(line)
    const tevents = evs.filter((e) => e.lineItemId != null && allowed.has(e.lineItemId))
    if (tevents.length === 0) continue
    const parts: string[] = []
    parts.push(`$${lineItemPayableAmount(line).toFixed(2)}`)
    for (const e of sortedEvents(tevents)) {
      parts.push(`\n• ${e.chartLabel} (${eventRangeLabelForClient(e)})`)
      if (e.description?.trim()) parts.push(`\n${e.description.trim()}`)
    }
    narrativeHtml += narrativeSection(`Deliverable: ${lineDeliverableLabel(line)}`, parts.join(''))
  }

  const projectWide = byLine.get(null) ?? []
  if (projectWide.length) {
    const parts: string[] = []
    for (const e of sortedEvents(projectWide)) {
      parts.push(`• ${e.chartLabel} (${eventRangeLabelForClient(e)})`)
      if (e.description?.trim()) parts.push(`\n${e.description.trim()}\n`)
    }
    narrativeHtml += narrativeSection('Project milestones', parts.join('\n'))
  }
  return narrativeHtml
}

function buildLineItemRowsHtml(items: LineItem[], depth: number): string {
  return items
    .map((l) => {
      const children = l.subLineItems ?? []
      const hasChildren = children.length > 0
      const padRem = depth * 1.15
      const isSubLine = depth > 0
      const rateCell = isSubLine ? '-' : `$${l.unitPrice.toFixed(2)}`
      const qtyCell = isSubLine ? '-' : String(l.quantity)
      const amtCell = isSubLine ? '-' : `$${lineItemPayableAmount(l).toFixed(2)}`
      const row = `<tr class="line-item-row">
        <td class="col-desc" style="padding-left:${padRem}rem">${lineItemDescCellHtml(l)}</td>
        <td class="col-num">${rateCell}</td>
        <td class="col-num">${qtyCell}</td>
        <td class="col-num">${amtCell}</td>
      </tr>`
      const childRows = hasChildren ? buildLineItemRowsHtml(children, depth + 1) : ''
      return row + childRows
    })
    .join('')
}

function lineItemDescCellHtml(l: LineItem): string {
  const title = (l.title ?? '').trim()
  const desc = (l.description ?? '').trim()
  if (title && desc) {
    return `<div class="line-item-desc"><div class="line-item-desc-title">${escapeHtml(title)}</div><div class="line-item-desc-detail">${escapeHtml(desc)}</div></div>`
  }
  if (title) return `<div class="line-item-desc"><div class="line-item-desc-title">${escapeHtml(title)}</div></div>`
  return `<div class="line-item-desc"><div class="line-item-desc-detail line-item-desc-detail--solo">${escapeHtml(desc || '—')}</div></div>`
}

function timelineRowsJson(evs: TimelineEvent[]): string {
  return JSON.stringify(
    sortedEvents(evs).map((e) => {
      const days = timelineDaySpanLabel(e.startDate, e.endDate)
      return {
        role: 'Phase',
        name: days ? `${e.chartLabel} (${days})` : e.chartLabel,
        start: e.startDate,
        end: e.endDate,
      }
    })
  )
}

function timelineChartDrawScript(rowsJson: string): string {
  return `
  <script>
    var ROWS = ${rowsJson};
    google.charts.load('current', { packages: ['timeline'] });
    google.charts.setOnLoadCallback(function () {
      var container = document.getElementById('timeline-chart');
      if (!container) return;
      if (!ROWS || ROWS.length === 0) {
        container.innerHTML = '<p style="color:#666;font-size:0.9rem;padding:8px 0;">No timeline events.</p>';
        return;
      }
      var chart = new google.visualization.Timeline(container);
      var dataTable = new google.visualization.DataTable();
      dataTable.addColumn({ type: 'string', id: 'Role' });
      dataTable.addColumn({ type: 'string', id: 'Name' });
      dataTable.addColumn({ type: 'date', id: 'Start' });
      dataTable.addColumn({ type: 'date', id: 'End' });
      var dataRows = ROWS.map(function (r) {
        return [ r.role, r.name, new Date(r.start), new Date(r.end) ];
      });
      dataTable.addRows(dataRows);
      var options = {
        height: 460,
        width: 900,
        hAxis: {
          format: 'MMM d, yyyy'
        },
        timeline: { showRowLabels: true, showBarLabels: true }
      };
      chart.draw(dataTable, options);
    });
  </script>`
}

const PRINT_BODY_STYLES = `
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #111; margin: 24px; line-height: 1.45; }
    h2 { font-size: 1.15rem; margin: 1.25rem 0 0.5rem; }
    .meta { color: #444; margin-bottom: 1.5rem; }
    table.line-items { border-collapse: collapse; width: 100%; margin: 1.25rem 0 2rem; font-size: 0.9rem; }
    table.line-items thead th {
      text-transform: uppercase; font-weight: 700; letter-spacing: 0.04em; font-size: 0.72rem;
      padding: 10px 8px 8px 0; border-top: 3px solid #000; border-bottom: 3px solid #000;
      background: transparent; text-align: left;
    }
    table.line-items thead th.col-num { text-align: right; }
    table.line-items tbody td { padding: 10px 8px 10px 0; border-bottom: 1px solid #e5e5e5; vertical-align: top; }
    table.line-items tbody td.col-num { text-align: right; white-space: nowrap; }
    table.line-items .col-desc { text-align: left; }
    .line-item-desc-title { font-weight: 700; font-size: 1em; line-height: 1.35; display: block; }
    .line-item-desc-detail { font-size: 0.78em; color: #444; margin-top: 0.22rem; line-height: 1.38; display: block; font-weight: 400; }
    .line-item-desc-detail--solo { margin-top: 0; font-size: 0.95em; color: #111; }
    #timeline-chart { min-height: 400px; width: 100%; max-width: 920px; margin: 1.5rem 0; }
    .narrative-block { margin-top: 1.5rem; page-break-inside: avoid; }
    .narrative-block h3 { font-size: 1.1rem; margin-bottom: 0.5rem; }
    .narrative-body { white-space: pre-wrap; font-size: 0.88rem; color: #222; }
    .totals-block { max-width: 280px; margin: 1.5rem 0 0 auto; text-align: right; font-size: 0.9rem; }
    .totals-row { display: flex; justify-content: flex-end; gap: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
    .totals-block hr { border: none; border-top: 1px solid #e5e5e5; margin: 0.65rem 0; }
    .balance-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; margin-bottom: 0.35rem; }
    .balance-amt { font-size: 1.25rem; font-weight: 700; }
`

function wrapPrintDocument(innerBody: string, rowsJson: string, narrativeHtml: string, docTitle: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <script src="https://www.gstatic.com/charts/loader.js"></script>
  <style>
    ${quoteClientBrandStyles}
    ${PRINT_BODY_STYLES}
  </style>
</head>
<body>
  ${quoteClientBrandHeaderHtml(escapeHtml(docTitle))}
  ${innerBody}
  <h2>Timeline</h2>
  <div id="timeline-chart"></div>
  <h2>Scope &amp; milestones</h2>
  ${narrativeHtml}
  ${timelineChartDrawScript(rowsJson)}
  ${quoteClientFooterHtml()}
</body>
</html>`
}

export function buildQuotePrintHtml(quote: Quote): string {
  const evs = sortedEvents(quote.timelineEvents ?? [])
  const narrativeHtml = buildNarrativeHtml(quote.lineItems ?? [], evs)
  const lineRows = buildLineItemRowsHtml(quote.lineItems ?? [], 0)
  const displayTotal = quoteDisplayTotal(quote.lineItems, quote.total)
  const rowsJson = timelineRowsJson(evs)
  const meta = `<div class="meta">
    ${escapeHtml(quote.clientName)}<br/>
    ${escapeHtml(quote.clientEmail)}<br/>
    Status: ${escapeHtml(quote.status)} · ${escapeHtml(formatClientFacingDate(quote.createdAt ?? null))}
  </div>
  <h2>Line items</h2>
  <table class="line-items">
    <thead><tr><th class="col-desc">Description</th><th class="col-num">Rate</th><th class="col-num">Qty</th><th class="col-num">Amount</th></tr></thead>
    <tbody>${lineRows}</tbody>
  </table>
  <div class="totals-block">
    <div class="totals-row"><span>TOTAL</span><span>$${displayTotal.toFixed(2)}</span></div>
    <hr/>
    <div class="balance-label">BALANCE DUE</div>
    <div class="balance-amt">USD $${displayTotal.toFixed(2)}</div>
  </div>`

  return wrapPrintDocument(meta, rowsJson, narrativeHtml, 'Quote')
}

export function buildInvoicePrintHtml(invoice: Invoice): string {
  const evs = sortedEvents(invoice.timelineEvents ?? [])
  const narrativeHtml = buildNarrativeHtml(invoice.lineItems ?? [], evs)
  const lineRows = buildLineItemRowsHtml(invoice.lineItems ?? [], 0)
  const displayTotal = quoteDisplayTotal(invoice.lineItems, invoice.total)
  const rowsJson = timelineRowsJson(evs)
  const meta = `<div class="meta">
    ${escapeHtml(invoice.clientName)}<br/>
    ${escapeHtml(invoice.clientEmail)}<br/>
    Status: ${escapeHtml(invoice.status)}<br/>
    Due: ${escapeHtml(formatClientFacingDate(invoice.dueDate ?? null))}<br/>
    Paid: ${escapeHtml(formatClientFacingDate(invoice.paidAt ?? null))}
    ${invoice.createdAt ? `<br/>Created: ${escapeHtml(formatClientFacingDate(invoice.createdAt))}` : ''}
  </div>
  <h2>Line items</h2>
  <table class="line-items">
    <thead><tr><th class="col-desc">Description</th><th class="col-num">Rate</th><th class="col-num">Qty</th><th class="col-num">Amount</th></tr></thead>
    <tbody>${lineRows}</tbody>
  </table>
  <div class="totals-block">
    <div class="totals-row"><span>TOTAL</span><span>$${displayTotal.toFixed(2)}</span></div>
    <hr/>
    <div class="balance-label">BALANCE DUE</div>
    <div class="balance-amt">USD $${displayTotal.toFixed(2)}</div>
  </div>`

  return wrapPrintDocument(meta, rowsJson, narrativeHtml, 'Invoice')
}
