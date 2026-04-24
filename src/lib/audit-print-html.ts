/**
 * Printable audit-report HTML.
 *
 * Layout (one `.quote-pdf-page` per logical section so pdf-utils can page-break cleanly):
 *   1. Cover — title, target, client, auditor, audited-at, status, executive summary,
 *      findings-by-status + findings-by-severity totals.
 *   2. One page per audit section with a compact findings table (status, severity, note, evidence).
 */
import type { Audit, AuditRunItem, AuditRunSection } from '../api/admin-api'
import {
  quoteClientBrandHeaderHtml,
  quoteClientBrandStyles,
  quoteClientFooterHtml,
} from './quote-print-branding'

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return String(iso)
  }
}

type StatusCounts = Record<'PASS' | 'WARNING' | 'FAIL' | 'NA' | 'UNKNOWN', number>
type SeverityCounts = Record<'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', number>

const STATUS_LABELS: Record<string, string> = {
  PASS: 'Pass',
  WARNING: 'Warning',
  FAIL: 'Fail',
  NA: 'N/A',
  UNKNOWN: 'Unanswered',
}

const STATUS_COLOR: Record<string, string> = {
  PASS: '#3ea55f',
  WARNING: '#d39e00',
  FAIL: '#d64040',
  NA: '#999',
  UNKNOWN: '#888',
}

const SEVERITY_COLOR: Record<string, string> = {
  INFO: '#2d7ccf',
  LOW: '#3ea55f',
  MEDIUM: '#d39e00',
  HIGH: '#d06b2a',
  CRITICAL: '#d64040',
}

function tally(audit: Audit): { status: StatusCounts; severity: SeverityCounts; total: number } {
  const status: StatusCounts = { PASS: 0, WARNING: 0, FAIL: 0, NA: 0, UNKNOWN: 0 }
  const severity: SeverityCounts = { INFO: 0, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 }
  let total = 0
  for (const s of audit.sections ?? []) {
    for (const it of s.items ?? []) {
      total += 1
      const st = (it.status ?? 'UNKNOWN') as keyof StatusCounts
      if (st in status) status[st] += 1
      const sv = (it.severity ?? 'INFO') as keyof SeverityCounts
      if (sv in severity) severity[sv] += 1
    }
  }
  return { status, severity, total }
}

function buildStatusChip(status: string): string {
  const label = STATUS_LABELS[status] ?? status
  const color = STATUS_COLOR[status] ?? '#888'
  return `<span class="audit-chip" style="background:${color}1a;border:1px solid ${color}55;color:${color};">${escapeHtml(label)}</span>`
}

function buildSeverityChip(severity: string): string {
  const color = SEVERITY_COLOR[severity] ?? '#888'
  return `<span class="audit-chip" style="background:${color}1a;border:1px solid ${color}55;color:${color};">${escapeHtml(severity)}</span>`
}

function buildCoverPage(audit: Audit): string {
  const { status, severity, total } = tally(audit)
  const answered = total - status.UNKNOWN
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0

  const summary = (audit.summary ?? '').trim()
  const summaryBlock = summary
    ? `<section class="audit-summary">
         <h2>Executive summary</h2>
         <div class="audit-summary-body">${escapeHtml(summary)}</div>
       </section>`
    : ''

  const totalsTable = `
    <section class="audit-totals">
      <div class="audit-totals-col">
        <h3>Findings by status</h3>
        <table class="audit-totals-table">
          <tbody>
            <tr><td>Pass</td><td class="num">${status.PASS}</td></tr>
            <tr><td>Warnings</td><td class="num">${status.WARNING}</td></tr>
            <tr><td>Failures</td><td class="num">${status.FAIL}</td></tr>
            <tr><td>N/A</td><td class="num">${status.NA}</td></tr>
            <tr><td>Unanswered</td><td class="num">${status.UNKNOWN}</td></tr>
          </tbody>
        </table>
      </div>
      <div class="audit-totals-col">
        <h3>Findings by severity</h3>
        <table class="audit-totals-table">
          <tbody>
            <tr><td><span class="sev-dot" style="background:${SEVERITY_COLOR.CRITICAL}"></span>Critical</td><td class="num">${severity.CRITICAL}</td></tr>
            <tr><td><span class="sev-dot" style="background:${SEVERITY_COLOR.HIGH}"></span>High</td><td class="num">${severity.HIGH}</td></tr>
            <tr><td><span class="sev-dot" style="background:${SEVERITY_COLOR.MEDIUM}"></span>Medium</td><td class="num">${severity.MEDIUM}</td></tr>
            <tr><td><span class="sev-dot" style="background:${SEVERITY_COLOR.LOW}"></span>Low</td><td class="num">${severity.LOW}</td></tr>
            <tr><td><span class="sev-dot" style="background:${SEVERITY_COLOR.INFO}"></span>Info</td><td class="num">${severity.INFO}</td></tr>
          </tbody>
        </table>
      </div>
    </section>`

  return `
    <section class="audit-cover">
      <p class="audit-cover-eyebrow">Audit report</p>
      <h1 class="audit-cover-title">${escapeHtml(audit.title)}</h1>
      <dl class="audit-meta-list">
        <div><dt>Target</dt><dd>${escapeHtml(audit.target)}</dd></div>
        ${audit.clientName ? `<div><dt>Client</dt><dd>${escapeHtml(audit.clientName)}${audit.clientEmail ? ` &middot; ${escapeHtml(audit.clientEmail)}` : ''}</dd></div>` : ''}
        ${audit.auditor ? `<div><dt>Auditor</dt><dd>${escapeHtml(audit.auditor)}</dd></div>` : ''}
        <div><dt>Status</dt><dd>${buildStatusPill(audit.status)}</dd></div>
        <div><dt>Date</dt><dd>${escapeHtml(formatDate(audit.auditedAt ?? audit.updatedAt ?? audit.createdAt))}</dd></div>
        ${audit.templateName ? `<div><dt>Template</dt><dd>${escapeHtml(audit.templateName)}${audit.templateVersion ? ` &middot; v${audit.templateVersion}` : ''}</dd></div>` : ''}
        <div><dt>Completion</dt><dd>${answered} of ${total} items answered &middot; ${pct}%</dd></div>
      </dl>
      ${summaryBlock}
      ${totalsTable}
    </section>
  `
}

function buildStatusPill(status: string): string {
  const colorMap: Record<string, string> = {
    DRAFT: '#666',
    IN_PROGRESS: '#2d7ccf',
    COMPLETED: '#3ea55f',
    ARCHIVED: '#333',
  }
  const color = colorMap[status] ?? '#666'
  return `<span class="audit-chip" style="background:${color}1a;border:1px solid ${color}55;color:${color};">${escapeHtml(status.replace('_', ' '))}</span>`
}

function buildSectionPage(section: AuditRunSection, index: number): string {
  const items = section.items ?? []
  const rows = items
    .map((it: AuditRunItem) => {
      const st = it.status ?? 'UNKNOWN'
      const sv = it.severity ?? 'INFO'
      const desc = (it.description ?? '').trim()
      const note = (it.note ?? '').trim()
      const evidence = (it.evidenceUrl ?? '').trim()
      const remediation = (it.remediation ?? '').trim()
      const dueDate = (it.dueDate ?? '').trim()
      const assignee = (it.assignee ?? '').trim()
      const detailParts: string[] = []
      if (desc) detailParts.push(`<div class="audit-item-desc">${escapeHtml(desc)}</div>`)
      if (note) detailParts.push(`<div class="audit-item-note"><strong>Note:</strong> ${escapeHtml(note)}</div>`)
      if (remediation) detailParts.push(`<div class="audit-item-remediation"><strong>Remediation:</strong> ${escapeHtml(remediation)}</div>`)
      if (evidence) detailParts.push(`<div class="audit-item-evidence"><strong>Evidence:</strong> ${escapeHtml(evidence)}</div>`)
      const meta: string[] = []
      if (assignee) meta.push(`Assignee: ${escapeHtml(assignee)}`)
      if (dueDate) meta.push(`Due: ${escapeHtml(dueDate)}`)
      if (meta.length) detailParts.push(`<div class="audit-item-meta-line">${meta.join(' &middot; ')}</div>`)
      return `<tr class="audit-row">
        <td class="col-label">
          <div class="audit-item-label">${escapeHtml(it.label)}</div>
          ${detailParts.join('')}
        </td>
        <td class="col-chip">${buildStatusChip(st)}</td>
        <td class="col-chip">${buildSeverityChip(sv)}</td>
      </tr>`
    })
    .join('')

  return `
    <section class="audit-section-block">
      <header class="audit-section-header">
        <span class="audit-section-index">Section ${index + 1}</span>
        <h2>${escapeHtml(section.title)}</h2>
        ${section.description ? `<p class="audit-section-desc">${escapeHtml(section.description)}</p>` : ''}
      </header>
      <table class="audit-items-table">
        <thead>
          <tr>
            <th class="col-label">Item</th>
            <th class="col-chip">Status</th>
            <th class="col-chip">Severity</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr><td colspan="3" class="text-muted">No items in this section.</td></tr>`}
        </tbody>
      </table>
    </section>
  `
}

const AUDIT_PRINT_STYLES = `
  body { font-family: 'Segoe UI', system-ui, sans-serif; color: #111; margin: 0; padding: 0; line-height: 1.45; }
  .bv-print-main { padding: 0; max-width: 794px; box-sizing: border-box; margin: 0 auto; }
  .quote-pdf-page {
    box-sizing: border-box;
    padding: 0 24px 24px;
    break-before: page;
    page-break-before: always;
  }
  .quote-pdf-page--first {
    break-before: auto;
    page-break-before: auto;
    break-inside: auto;
    page-break-inside: auto;
  }
  h2 { font-size: 1.1rem; margin: 0 0 0.5rem; }
  h3 { font-size: 0.95rem; margin: 0 0 0.4rem; color: #444; }

  .audit-cover-eyebrow {
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: #2d7ccf; margin: 0 0 0.4rem;
  }
  .audit-cover-title {
    font-size: 1.55rem; font-weight: 700; margin: 0 0 1rem; color: #111;
    letter-spacing: -0.01em;
  }
  .audit-meta-list {
    display: grid; grid-template-columns: 1fr 1fr; gap: 0.35rem 1.5rem;
    margin: 0 0 1.25rem; padding: 0;
  }
  .audit-meta-list > div { display: flex; flex-direction: column; gap: 0.1rem; }
  .audit-meta-list dt {
    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: #888;
  }
  .audit-meta-list dd { margin: 0; font-size: 0.92rem; color: #222; }
  .audit-chip {
    display: inline-block; padding: 2px 8px; border-radius: 999px;
    font-size: 0.72rem; font-weight: 600; letter-spacing: 0.02em;
  }
  .audit-summary {
    margin: 0 0 1.25rem; padding: 0.9rem 1rem;
    border-left: 3px solid #2d7ccf; background: #f5f8fc;
    page-break-inside: avoid; break-inside: avoid;
  }
  .audit-summary h2 { font-size: 0.95rem; margin: 0 0 0.4rem; color: #2d7ccf; }
  .audit-summary-body { white-space: pre-wrap; font-size: 0.9rem; color: #222; line-height: 1.55; }

  .audit-totals {
    display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;
    page-break-inside: avoid; break-inside: avoid;
  }
  .audit-totals-col h3 { margin: 0 0 0.35rem; }
  .audit-totals-table {
    width: 100%; border-collapse: collapse; font-size: 0.88rem;
  }
  .audit-totals-table td { padding: 0.25rem 0.1rem; border-bottom: 1px solid #eee; color: #333; }
  .audit-totals-table td.num { text-align: right; font-weight: 600; color: #111; }
  .sev-dot {
    display: inline-block; width: 0.55rem; height: 0.55rem;
    border-radius: 999px; margin-right: 0.4rem; vertical-align: middle;
  }

  .audit-section-block {
    page-break-inside: auto; break-inside: auto;
    margin-top: 0.5rem;
  }
  .audit-section-header { margin-bottom: 0.6rem; }
  .audit-section-index {
    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: #2d7ccf; margin: 0 0 0.25rem; display: block;
  }
  .audit-section-header h2 {
    font-size: 1.15rem; margin: 0 0 0.25rem; color: #111;
  }
  .audit-section-desc { color: #555; font-size: 0.88rem; margin: 0 0 0.6rem; }
  .audit-items-table {
    width: 100%; border-collapse: collapse; font-size: 0.86rem;
  }
  .audit-items-table thead th {
    text-align: left; font-size: 0.72rem; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase; color: #888;
    padding: 0.4rem 0.5rem; border-bottom: 1px solid #ddd;
  }
  .audit-items-table .col-chip { width: 88px; text-align: center; }
  .audit-items-table tbody td {
    padding: 0.55rem 0.5rem; border-bottom: 1px solid #eee; vertical-align: top;
  }
  .audit-items-table .col-chip { text-align: center; }
  .audit-item-label { font-weight: 600; color: #111; font-size: 0.92rem; line-height: 1.4; margin-bottom: 0.15rem; }
  .audit-item-desc, .audit-item-note, .audit-item-remediation, .audit-item-evidence, .audit-item-meta-line {
    font-size: 0.82rem; color: #444; margin-top: 0.15rem; line-height: 1.45;
  }
  .audit-item-evidence { word-break: break-all; }
  .text-muted { color: #888; }
`

export function buildAuditPrintHtml(audit: Audit): string {
  const sections = audit.sections ?? []
  const sectionPages = sections
    .map((s, i) => `<div class="quote-pdf-page">${buildSectionPage(s, i)}</div>`)
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <style>
    ${quoteClientBrandStyles}
    ${AUDIT_PRINT_STYLES}
  </style>
</head>
<body>
  <div class="bv-print-main">
    <div class="quote-pdf-page quote-pdf-page--first">
      ${quoteClientBrandHeaderHtml(escapeHtml('Audit report'))}
      ${buildCoverPage(audit)}
    </div>
    ${sectionPages}
    <div class="quote-pdf-page quote-pdf-page--last">
      ${quoteClientFooterHtml()}
    </div>
  </div>
</body>
</html>`
}
