import React, { useMemo, useState } from 'react'
import { Button, Card, Col, Form, Row, Table } from 'react-bootstrap'
import {
  getBenchmarkStackTemplates,
  HOSTING_BENCHMARK_DISCLAIMER,
  HOSTING_BENCHMARK_PROVIDERS,
  stackTemplatesSubtotalUsd,
} from '../../lib/quote-hosting-benchmarks'
import {
  emptyMonthlyCostEstimate,
  monthlyCostsSubtotalUsd,
  parseMonthlyCostEstimate,
  serializeMonthlyCostEstimate,
  type QuoteMonthlyCostEstimateV1,
  type QuoteMonthlyCostLine,
  type QuoteMonthlyCostLinePaidBy,
} from '../../lib/quote-monthly-costs'

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `mc-${Date.now()}`
}

const emptyLine = (): QuoteMonthlyCostLine => ({
  id: newId(),
  label: '',
  amountMonthly: 0,
  paidBy: 'client',
  notes: '',
})

export default function QuoteMonthlyCostsPanel({
  valueJson,
  onChange,
}: {
  valueJson: string | null | undefined
  onChange: (json: string | null) => void
}) {
  const [est, setEst] = useState<QuoteMonthlyCostEstimateV1>(() => parseMonthlyCostEstimate(valueJson))

  React.useEffect(() => {
    setEst(parseMonthlyCostEstimate(valueJson))
  }, [valueJson])

  const pushEst = (next: QuoteMonthlyCostEstimateV1) => {
    setEst(next)
    onChange(serializeMonthlyCostEstimate(next))
  }

  const updateIntro = (introNote: string) => {
    pushEst({ ...est, introNote })
  }

  const updateLine = (id: string, patch: Partial<QuoteMonthlyCostLine>) => {
    pushEst({
      ...est,
      lines: est.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    })
  }

  const addLine = () => {
    pushEst({ ...est, lines: [...est.lines, emptyLine()] })
  }

  const removeLine = (id: string) => {
    pushEst({ ...est, lines: est.lines.filter((l) => l.id !== id) })
  }

  const [benchProvider, setBenchProvider] = useState<string>('digitalocean')
  const [benchTier, setBenchTier] = useState<string>('do-droplet-basic-s')

  const tierOptions = useMemo(() => {
    const p = HOSTING_BENCHMARK_PROVIDERS.find((x) => x.id === benchProvider)
    return p?.tiers ?? []
  }, [benchProvider])

  const selectedTier = useMemo(() => {
    const p = HOSTING_BENCHMARK_PROVIDERS.find((x) => x.id === benchProvider)
    return p?.tiers.find((x) => x.id === benchTier) ?? null
  }, [benchProvider, benchTier])

  const stackPreview = useMemo(
    () => getBenchmarkStackTemplates(benchProvider, benchTier),
    [benchProvider, benchTier]
  )

  const stackPreviewSum = useMemo(() => stackTemplatesSubtotalUsd(stackPreview), [stackPreview])

  const applySingleTierLine = () => {
    const p = HOSTING_BENCHMARK_PROVIDERS.find((x) => x.id === benchProvider)
    const t = p?.tiers.find((x) => x.id === benchTier)
    if (!p || !t) return
    const label = `${p.label} — ${t.label}`
    const line: QuoteMonthlyCostLine = {
      id: newId(),
      label,
      amountMonthly: t.estMonthlyUsd,
      paidBy: 'pass_through',
      notes: t.description,
    }
    pushEst({ ...est, lines: [...est.lines, line] })
  }

  const applyFullStackLines = () => {
    const templates = getBenchmarkStackTemplates(benchProvider, benchTier)
    if (templates.length === 0) return
    const newLines: QuoteMonthlyCostLine[] = templates.map((row) => ({
      id: newId(),
      label: row.label,
      amountMonthly: Number(row.estMonthlyUsd) || 0,
      paidBy: (row.paidBy ?? 'pass_through') as QuoteMonthlyCostLinePaidBy,
      notes: row.notes ?? '',
    }))
    pushEst({ ...est, lines: [...est.lines, ...newLines] })
  }

  const subtotal = monthlyCostsSubtotalUsd(est.lines)
  const clearAll = () => {
    const next = emptyMonthlyCostEstimate()
    setEst(next)
    onChange(null)
  }

  return (
    <div className="quote-monthly-costs-panel">
      <Card className="border-secondary bg-transparent mb-3">
        <Card.Body className="py-3 px-3">
          <h3 className="h6 text-white mb-2">Provider stacks (generate monthly lines)</h3>
          <p className="small text-white-50 mb-2">
            Pick a <strong className="text-white-50">vendor + tier</strong>, then{' '}
            <strong className="text-info">Generate stack lines</strong> to add a typical breakdown (compute, DNS,
            buffers, optional DB lines, etc.). Use <strong className="text-white-50">Add single line</strong> for just
            one rolled-up row.
          </p>
          <p className="small text-white-50 mb-3">{HOSTING_BENCHMARK_DISCLAIMER}</p>
          <Row className="g-2 align-items-end flex-wrap">
            <Col xs={12} sm={6} md={4}>
              <Form.Label className="small text-white-50 mb-1">Provider</Form.Label>
              <Form.Select
                value={benchProvider}
                onChange={(e) => {
                  const id = e.target.value
                  setBenchProvider(id)
                  const prov = HOSTING_BENCHMARK_PROVIDERS.find((x) => x.id === id)
                  setBenchTier(prov?.tiers[0]?.id ?? '')
                }}
                className="bg-dark text-white border-secondary"
              >
                {HOSTING_BENCHMARK_PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Form.Label className="small text-white-50 mb-1">Tier</Form.Label>
              <Form.Select
                value={benchTier}
                onChange={(e) => setBenchTier(e.target.value)}
                className="bg-dark text-white border-secondary"
              >
                {tierOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} (~${t.estMonthlyUsd}/mo)
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={12} className="d-flex flex-wrap gap-2 mt-1">
              <Button type="button" variant="info" size="sm" onClick={applyFullStackLines}>
                Generate stack lines ({stackPreview.length})
              </Button>
              <Button type="button" variant="outline-light" size="sm" onClick={applySingleTierLine}>
                Add single line (~${selectedTier?.estMonthlyUsd ?? 0}/mo)
              </Button>
            </Col>
            <Col xs={12} className="small text-white-50 mt-2">
              Stack sum (this tier, illustrative):{' '}
              <strong className="text-white">${stackPreviewSum.toFixed(2)}/mo</strong>
              {selectedTier && selectedTier.estMonthlyUsd > 0 && Math.abs(stackPreviewSum - selectedTier.estMonthlyUsd) > 3 ? (
                <span className="ms-1">
                  — tier headline was ~${selectedTier.estMonthlyUsd}/mo; breakdown may differ.
                </span>
              ) : null}
            </Col>
            <Col xs={12} className="small mt-1">
              {HOSTING_BENCHMARK_PROVIDERS.find((x) => x.id === benchProvider)?.docUrl ? (
                <a
                  href={HOSTING_BENCHMARK_PROVIDERS.find((x) => x.id === benchProvider)!.docUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="link-info"
                >
                  Open official pricing →
                </a>
              ) : null}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Form.Group className="mb-3">
        <Form.Label className="text-white">Intro (optional)</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={est.introNote ?? ''}
          onChange={(e) => updateIntro(e.target.value)}
          placeholder="e.g. Ongoing hosting and IDX are billed separately from the implementation total below."
          className="bg-dark text-white border-secondary"
        />
      </Form.Group>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
        <span className="text-white fw-semibold small">Monthly cost lines</span>
        <div className="d-flex gap-2">
          <Button type="button" variant="outline-primary" size="sm" onClick={addLine}>
            + Add line
          </Button>
          <Button type="button" variant="outline-secondary" size="sm" onClick={clearAll}>
            Clear all
          </Button>
        </div>
      </div>

      <Table responsive bordered size="sm" className="quote-monthly-costs-table text-white align-middle">
        <thead className="table-secondary">
          <tr>
            <th>Item</th>
            <th style={{ width: 120 }}>Est. $ / mo</th>
            <th style={{ width: 150 }}>Who pays</th>
            <th>Notes</th>
            <th style={{ width: 72 }} />
          </tr>
        </thead>
        <tbody>
          {est.lines.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-white-50 small py-4 text-center">
                No rows yet — use benchmarks or “Add line”.
              </td>
            </tr>
          ) : (
            est.lines.map((line) => (
              <tr key={line.id}>
                <td>
                  <Form.Control
                    size="sm"
                    value={line.label}
                    onChange={(e) => updateLine(line.id, { label: e.target.value })}
                    placeholder="e.g. Managed WordPress hosting"
                    className="bg-dark text-white border-secondary"
                  />
                </td>
                <td>
                  <Form.Control
                    size="sm"
                    type="number"
                    min={0}
                    step="0.01"
                    value={line.amountMonthly === 0 ? '' : line.amountMonthly}
                    onChange={(e) =>
                      updateLine(line.id, { amountMonthly: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0"
                    className="bg-dark text-white border-secondary"
                  />
                </td>
                <td>
                  <Form.Select
                    size="sm"
                    value={line.paidBy}
                    onChange={(e) =>
                      updateLine(line.id, { paidBy: e.target.value as QuoteMonthlyCostLinePaidBy })
                    }
                    className="bg-dark text-white border-secondary"
                  >
                    <option value="client">Client / agent</option>
                    <option value="pass_through">Pass-through</option>
                    <option value="included">Included in fee</option>
                  </Form.Select>
                </td>
                <td>
                  <Form.Control
                    size="sm"
                    value={line.notes ?? ''}
                    onChange={(e) => updateLine(line.id, { notes: e.target.value })}
                    placeholder="Optional"
                    className="bg-dark text-white border-secondary"
                  />
                </td>
                <td>
                  <Button type="button" variant="outline-danger" size="sm" onClick={() => removeLine(line.id)}>
                    ×
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <p className="text-info small mb-0">
        Estimated monthly subtotal: <strong>${subtotal.toFixed(2)}</strong> (sum of amounts above)
      </p>
    </div>
  )
}
