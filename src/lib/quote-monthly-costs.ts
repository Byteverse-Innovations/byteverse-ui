import { formatUsdForClientDocument } from './quote-display'

export type QuoteMonthlyCostLinePaidBy = 'client' | 'pass_through' | 'included'

export type QuoteMonthlyCostLine = {
  id: string
  label: string
  /** Estimated monthly USD (0 allowed for TBD lines). */
  amountMonthly: number
  paidBy: QuoteMonthlyCostLinePaidBy
  notes?: string
}

export type QuoteMonthlyCostEstimateV1 = {
  v: 1
  introNote?: string
  lines: QuoteMonthlyCostLine[]
}

export function emptyMonthlyCostEstimate(): QuoteMonthlyCostEstimateV1 {
  return { v: 1, introNote: '', lines: [] }
}

export function parseMonthlyCostEstimate(raw: string | null | undefined): QuoteMonthlyCostEstimateV1 {
  if (raw == null || String(raw).trim() === '') return emptyMonthlyCostEstimate()
  try {
    const o = JSON.parse(String(raw)) as Partial<QuoteMonthlyCostEstimateV1>
    if (o?.v !== 1 || !Array.isArray(o.lines)) return emptyMonthlyCostEstimate()
    const lines: QuoteMonthlyCostLine[] = o.lines.map((row, i) => ({
      id: typeof row.id === 'string' && row.id.trim() ? row.id : `line-${i}`,
      label: String(row.label ?? ''),
      amountMonthly: Number(row.amountMonthly) || 0,
      paidBy:
        row.paidBy === 'pass_through' || row.paidBy === 'included' || row.paidBy === 'client'
          ? row.paidBy
          : 'client',
      notes: row.notes != null ? String(row.notes) : undefined,
    }))
    return {
      v: 1,
      introNote: o.introNote != null ? String(o.introNote) : '',
      lines,
    }
  } catch {
    return emptyMonthlyCostEstimate()
  }
}

export function serializeMonthlyCostEstimate(est: QuoteMonthlyCostEstimateV1): string | null {
  const intro = (est.introNote ?? '').trim()
  const lines = (est.lines ?? []).filter((l) => (l.label ?? '').trim() !== '' || (Number(l.amountMonthly) || 0) > 0)
  if (!intro && lines.length === 0) return null
  return JSON.stringify({
    v: 1,
    introNote: intro,
    lines: lines.map((l) => ({
      id: l.id,
      label: (l.label ?? '').trim(),
      amountMonthly: Number(l.amountMonthly) || 0,
      paidBy: l.paidBy,
      notes: l.notes?.trim() ? l.notes.trim() : undefined,
    })),
  })
}

function paidByLabel(p: QuoteMonthlyCostLinePaidBy): string {
  if (p === 'pass_through') return 'Pass-through'
  if (p === 'included') return 'Included in fee'
  return 'Client / agent'
}

export function monthlyCostsSubtotalUsd(lines: QuoteMonthlyCostLine[]): number {
  return lines.reduce((s, l) => s + (Number(l.amountMonthly) || 0), 0)
}

/** HTML fragment: section after line-items table, before project total. */
export function buildMonthlyCostsSectionHtml(raw: string | null | undefined): string {
  const est = parseMonthlyCostEstimate(raw)
  if (!est.introNote?.trim() && est.lines.length === 0) return ''

  const rows = est.lines
    .filter((l) => l.label.trim() || l.amountMonthly > 0)
    .map(
      (l) => `<tr>
      <td class="col-desc">${escapeHtml(l.label.trim() || '—')}${l.notes?.trim() ? `<div class="monthly-cost-notes">${escapeHtml(l.notes.trim())}</div>` : ''}</td>
      <td class="col-num">${formatUsdForClientDocument(Number(l.amountMonthly) || 0)}</td>
      <td class="col-num monthly-cost-paidby">${escapeHtml(paidByLabel(l.paidBy))}</td>
    </tr>`
    )
    .join('')

  const subtotal = monthlyCostsSubtotalUsd(est.lines)
  const introBlock = est.introNote?.trim()
    ? `<p class="monthly-costs-intro">${escapeHtml(est.introNote.trim())}</p>`
    : ''

  return `<section class="monthly-costs-block" aria-label="Estimated ongoing monthly costs">
  <h2>Estimated ongoing monthly costs</h2>
  ${introBlock}
  <p class="monthly-costs-disclaimer small">Estimates for planning; actual vendor invoices may differ. Not part of the line-item project total on the preceding page unless explicitly stated in a line item.</p>
  <table class="line-items monthly-costs-table">
    <thead><tr><th class="col-desc">Item</th><th class="col-num">Est. / month</th><th class="col-num">Who pays</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="3" class="text-muted">No line items — add rows in the admin quote editor.</td></tr>`}</tbody>
  </table>
  <div class="monthly-costs-subtotal"><span>Estimated monthly subtotal</span><span>${formatUsdForClientDocument(subtotal)}</span></div>
</section>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
