import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Badge, Button, Card, Form, Spinner } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleAlert,
  CircleX,
  Download,
  Filter,
  Save,
  SquareDashed,
} from 'lucide-react'
import * as adminApi from '../../api/admin-api'
import type { Audit, AuditRunItem } from '../../api/admin-api'
import AdminPageHeader from './AdminPageHeader'
import { downloadAuditPdf } from './pdf-utils'
import './AdminAudits.scss'

type ItemStatus = 'UNKNOWN' | 'PASS' | 'WARNING' | 'FAIL' | 'NA'
type Severity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

const STATUSES: ItemStatus[] = ['PASS', 'WARNING', 'FAIL', 'NA']
const STATUS_LABELS: Record<ItemStatus, string> = {
  UNKNOWN: 'Unanswered',
  PASS: 'Pass',
  WARNING: 'Warn',
  FAIL: 'Fail',
  NA: 'N/A',
}
const STATUS_CLASS: Record<ItemStatus, string> = {
  UNKNOWN: '',
  PASS: 'active-pass',
  WARNING: 'active-warning',
  FAIL: 'active-fail',
  NA: 'active-na',
}

const SEVERITIES: Severity[] = ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const SEVERITY_COLORS: Record<Severity, string> = {
  INFO: 'rgba(100, 181, 246, 1)',
  LOW: 'rgba(129, 199, 132, 1)',
  MEDIUM: 'rgba(255, 213, 79, 1)',
  HIGH: 'rgba(255, 138, 101, 1)',
  CRITICAL: 'rgba(229, 115, 115, 1)',
}

const STATUS_META: Record<string, { label: string; bg: string }> = {
  DRAFT: { label: 'Draft', bg: 'secondary' },
  IN_PROGRESS: { label: 'In progress', bg: 'info' },
  COMPLETED: { label: 'Completed', bg: 'success' },
  ARCHIVED: { label: 'Archived', bg: 'dark' },
}

type FilterMode = 'all' | 'unanswered' | 'fail' | 'warning'

type DraftMap = Record<string, Partial<AuditRunItem>>

function itemStatus(it: AuditRunItem): ItemStatus {
  return (it.status as ItemStatus) ?? 'UNKNOWN'
}
function itemSeverity(it: AuditRunItem): Severity {
  return (it.severity as Severity) ?? 'INFO'
}

/** One useRef-backed debounced writer per item so rapid typing coalesces. */
function useItemWriter(auditId: string, onError: (msg: string) => void) {
  const queryClient = useQueryClient()
  const timersRef = useRef<Map<string, number>>(new Map())

  const writeNow = async (sectionId: string, itemId: string, patch: Partial<AuditRunItem>) => {
    try {
      const updated = await adminApi.updateAuditItem(auditId, sectionId, itemId, patch)
      queryClient.setQueryData(['admin', 'audit', auditId], updated)
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e))
    }
  }

  const schedule = (
    sectionId: string,
    itemId: string,
    patch: Partial<AuditRunItem>,
    debounceMs = 350
  ) => {
    const key = `${sectionId}:${itemId}`
    const existing = timersRef.current.get(key)
    if (existing) window.clearTimeout(existing)
    const handle = window.setTimeout(() => {
      timersRef.current.delete(key)
      void writeNow(sectionId, itemId, patch)
    }, debounceMs)
    timersRef.current.set(key, handle)
  }

  const flush = async (sectionId: string, itemId: string, patch: Partial<AuditRunItem>) => {
    const key = `${sectionId}:${itemId}`
    const existing = timersRef.current.get(key)
    if (existing) {
      window.clearTimeout(existing)
      timersRef.current.delete(key)
    }
    await writeNow(sectionId, itemId, patch)
  }

  return { schedule, flush }
}

export default function AdminAuditRun() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterMode>('all')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [drafts, setDrafts] = useState<DraftMap>({})
  const [pdfPending, setPdfPending] = useState(false)

  const auditQ = useQuery({
    queryKey: ['admin', 'audit', id],
    queryFn: () => adminApi.getAudit(id),
    enabled: !!id,
  })
  const audit = auditQ.data ?? null

  const writer = useItemWriter(id, setError)

  const setStatusMut = useMutation({
    mutationFn: (status: string) => adminApi.setAuditStatus(id, status),
    onSuccess: (updated) => {
      queryClient.setQueryData(['admin', 'audit', id], updated)
      queryClient.invalidateQueries({ queryKey: ['admin', 'audits'] })
    },
    onError: (e) => setError(e instanceof Error ? e.message : String(e)),
  })

  const headerMut = useMutation({
    mutationFn: (patch: adminApi.UpdateAuditInput) => adminApi.updateAudit(id, patch),
    onSuccess: (updated) => {
      queryClient.setQueryData(['admin', 'audit', id], updated)
    },
    onError: (e) => setError(e instanceof Error ? e.message : String(e)),
  })

  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [auditor, setAuditor] = useState('')
  const [summary, setSummary] = useState('')
  const headerLoadedRef = useRef(false)

  useEffect(() => {
    if (audit && !headerLoadedRef.current) {
      headerLoadedRef.current = true
      setTitle(audit.title)
      setTarget(audit.target)
      setClientName(audit.clientName ?? '')
      setClientEmail(audit.clientEmail ?? '')
      setAuditor(audit.auditor ?? '')
      setSummary(audit.summary ?? '')
    }
  }, [audit])

  const sections = audit?.sections ?? []

  const { done, total, statusCounts, severityCounts } = useMemo(() => {
    let d = 0
    let t = 0
    const sc: Record<ItemStatus, number> = { UNKNOWN: 0, PASS: 0, WARNING: 0, FAIL: 0, NA: 0 }
    const sev: Record<Severity, number> = { INFO: 0, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 }
    for (const s of sections) {
      for (const it of s.items ?? []) {
        const draft = drafts[it.id] ?? {}
        const effStatus = (draft.status as ItemStatus) ?? itemStatus(it)
        const effSev = (draft.severity as Severity) ?? itemSeverity(it)
        t += 1
        sc[effStatus] += 1
        sev[effSev] += 1
        if (effStatus !== 'UNKNOWN') d += 1
      }
    }
    return { done: d, total: t, statusCounts: sc, severityCounts: sev }
  }, [sections, drafts])

  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const toggleSection = (sid: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(sid)) next.delete(sid)
      else next.add(sid)
      return next
    })
  }

  const updateDraft = (itemId: string, patch: Partial<AuditRunItem>) => {
    setDrafts((prev) => ({ ...prev, [itemId]: { ...(prev[itemId] ?? {}), ...patch } }))
  }

  const applyStatus = (sectionId: string, item: AuditRunItem, status: ItemStatus) => {
    updateDraft(item.id, { status })
    void writer.flush(sectionId, item.id, { status })
  }

  const applySeverity = (sectionId: string, item: AuditRunItem, severity: Severity) => {
    updateDraft(item.id, { severity })
    void writer.flush(sectionId, item.id, { severity })
  }

  const applyTextPatch = (
    sectionId: string,
    item: AuditRunItem,
    field: 'note' | 'evidenceUrl' | 'assignee' | 'dueDate',
    value: string
  ) => {
    const patch = { [field]: value || null } as Partial<AuditRunItem>
    updateDraft(item.id, patch)
    writer.schedule(sectionId, item.id, patch)
  }

  if (!id) return <Alert variant="danger">Missing audit id</Alert>
  if (auditQ.isLoading) {
    return (
      <div className="text-white-50 d-flex align-items-center gap-2">
        <Spinner animation="border" size="sm" /> Loading audit…
      </div>
    )
  }
  if (!audit) return <Alert variant="warning">Audit not found.</Alert>

  const statusBadge = STATUS_META[audit.status] ?? { label: audit.status, bg: 'secondary' }

  const handleHeaderBlur = () => {
    const patch: adminApi.UpdateAuditInput = {}
    if (title !== audit.title) patch.title = title
    if (target !== audit.target) patch.target = target
    if ((audit.clientName ?? '') !== clientName) patch.clientName = clientName || null
    if ((audit.clientEmail ?? '') !== clientEmail) patch.clientEmail = clientEmail || null
    if ((audit.auditor ?? '') !== auditor) patch.auditor = auditor || null
    if ((audit.summary ?? '') !== summary) patch.summary = summary || null
    if (Object.keys(patch).length > 0) headerMut.mutate(patch)
  }

  const canMarkComplete = done === total && total > 0

  return (
    <div>
      <div className="mb-3">
        <Button as={Link as any} variant="link" className="text-white-50 px-0" to="/admin/audits">
          <ArrowLeft size={15} className="me-1" /> Back to audits
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="admin-audit-run">
        <div className="admin-audit-run-main">
          <div className="admin-audit-run-header">
            <div className="admin-audit-run-title-row">
              <h1 className="admin-audit-run-title">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleHeaderBlur}
                  style={{
                    background: 'transparent',
                    border: 0,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 'inherit',
                    width: '100%',
                    outline: 'none',
                  }}
                />
              </h1>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <Badge bg={statusBadge.bg}>{statusBadge.label}</Badge>
                <Button
                  variant="outline-light"
                  size="sm"
                  disabled={pdfPending}
                  onClick={async () => {
                    setPdfPending(true)
                    try {
                      await downloadAuditPdf(audit)
                    } catch (e) {
                      setError(e instanceof Error ? e.message : String(e))
                    } finally {
                      setPdfPending(false)
                    }
                  }}
                >
                  <Download size={14} className="me-1" />
                  {pdfPending ? 'Building…' : 'PDF'}
                </Button>
                {audit.status !== 'COMPLETED' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!canMarkComplete || setStatusMut.isPending}
                    onClick={() => setStatusMut.mutate('COMPLETED')}
                    title={!canMarkComplete ? 'Answer every item to mark complete' : undefined}
                  >
                    Mark complete
                  </Button>
                ) : (
                  <Button
                    variant="outline-light"
                    size="sm"
                    onClick={() => setStatusMut.mutate('IN_PROGRESS')}
                  >
                    Reopen
                  </Button>
                )}
              </div>
            </div>

            <div className="admin-audit-run-meta">
              <span>
                <strong>Target:</strong>
                <input
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  onBlur={handleHeaderBlur}
                  style={{
                    background: 'transparent',
                    border: 0,
                    color: '#fff',
                    outline: 'none',
                    minWidth: 140,
                  }}
                />
              </span>
              <span>
                <strong>Client:</strong>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  onBlur={handleHeaderBlur}
                  placeholder="—"
                  style={{
                    background: 'transparent',
                    border: 0,
                    color: '#fff',
                    outline: 'none',
                    minWidth: 120,
                  }}
                />
              </span>
              <span>
                <strong>Auditor:</strong>
                <input
                  value={auditor}
                  onChange={(e) => setAuditor(e.target.value)}
                  onBlur={handleHeaderBlur}
                  placeholder="—"
                  style={{
                    background: 'transparent',
                    border: 0,
                    color: '#fff',
                    outline: 'none',
                    minWidth: 110,
                  }}
                />
              </span>
              {audit.templateName && (
                <span>
                  <strong>Template:</strong> {audit.templateName}
                </span>
              )}
            </div>

            <div className="admin-audit-run-progress-row">
              <div className="admin-audit-run-progress">
                <div className="bar" style={{ width: `${pct}%` }} />
              </div>
              <span className="admin-audit-run-progress-text">
                {done}/{total} · {pct}%
              </span>
            </div>
          </div>

          <Card className="admin-card mb-3">
            <Card.Body>
              <Form.Group>
                <Form.Label className="text-white-50 small text-uppercase">
                  Executive summary
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={summary}
                  placeholder="Headline findings, overall posture, and next recommended actions — appears on the PDF cover page."
                  onChange={(e) => setSummary(e.target.value)}
                  onBlur={handleHeaderBlur}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          <div className="d-flex gap-2 align-items-center mb-3 flex-wrap">
            <Filter size={15} className="text-white-50" />
            <span className="text-white-50 small me-1">Show:</span>
            {(['all', 'unanswered', 'fail', 'warning'] as FilterMode[]).map((m) => (
              <Button
                key={m}
                size="sm"
                variant={filter === m ? 'primary' : 'outline-light'}
                onClick={() => setFilter(m)}
              >
                {m === 'all'
                  ? 'All'
                  : m === 'unanswered'
                    ? 'Unanswered'
                    : m === 'fail'
                      ? 'Failures'
                      : 'Warnings'}
              </Button>
            ))}
          </div>

          {sections.length === 0 && (
            <Alert variant="secondary">
              This audit has no sections yet. Add some from a template, or{' '}
              <Link to={`/admin/audits`}>start from a template</Link>.
            </Alert>
          )}

          {sections.map((section) => {
            const isCollapsed = collapsed.has(section.id)
            const visibleItems = (section.items ?? []).filter((it) => {
              const draft = drafts[it.id] ?? {}
              const st = (draft.status as ItemStatus) ?? itemStatus(it)
              if (filter === 'all') return true
              if (filter === 'unanswered') return st === 'UNKNOWN'
              if (filter === 'fail') return st === 'FAIL'
              if (filter === 'warning') return st === 'WARNING'
              return true
            })
            const sectionDone = (section.items ?? []).filter((it) => {
              const st = (drafts[it.id]?.status as ItemStatus) ?? itemStatus(it)
              return st !== 'UNKNOWN'
            }).length
            const sectionTotal = section.items?.length ?? 0

            return (
              <section key={section.id} className="admin-audit-section">
                <header
                  className="admin-audit-section-head"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="d-flex align-items-center gap-2">
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                    <div>
                      <h2 className="admin-audit-section-title">{section.title}</h2>
                      {section.description && (
                        <p className="admin-audit-section-desc">{section.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="admin-audit-section-chip">
                    {sectionDone}/{sectionTotal}
                  </span>
                </header>

                {!isCollapsed &&
                  visibleItems.map((item) => {
                    const draft = drafts[item.id] ?? {}
                    const effStatus = (draft.status as ItemStatus) ?? itemStatus(item)
                    const effSev = (draft.severity as Severity) ?? itemSeverity(item)
                    const note = (draft.note as string | undefined) ?? item.note ?? ''
                    const evidenceUrl =
                      (draft.evidenceUrl as string | undefined) ?? item.evidenceUrl ?? ''
                    const assignee = (draft.assignee as string | undefined) ?? item.assignee ?? ''
                    const dueDate = (draft.dueDate as string | undefined) ?? item.dueDate ?? ''
                    const cls =
                      effStatus === 'PASS'
                        ? 'is-pass'
                        : effStatus === 'FAIL'
                          ? 'is-fail'
                          : effStatus === 'WARNING'
                            ? 'is-warning'
                            : effStatus === 'NA'
                              ? 'is-na'
                              : ''
                    return (
                      <div key={item.id} className={`admin-audit-item ${cls}`}>
                        <div className="admin-audit-item-body">
                          <div className="admin-audit-item-label">{item.label}</div>
                          {item.description && (
                            <div className="admin-audit-item-desc">{item.description}</div>
                          )}
                          <div className="admin-audit-item-meta">
                            {item.referenceUrl && (
                              <a href={item.referenceUrl} target="_blank" rel="noreferrer">
                                Reference
                              </a>
                            )}
                            {item.remediation && (
                              <span title={item.remediation}>
                                <SquareDashed size={12} className="me-1" />
                                Remediation available
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="admin-audit-item-controls">
                          <div className="d-flex gap-2 flex-wrap align-items-center">
                            <div
                              className="admin-audit-status-group"
                              role="group"
                              aria-label="Status"
                            >
                              {STATUSES.map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  className={effStatus === s ? STATUS_CLASS[s] : ''}
                                  onClick={() => applyStatus(section.id, item, s)}
                                >
                                  {STATUS_LABELS[s]}
                                </button>
                              ))}
                            </div>
                            <select
                              className="admin-audit-severity-select"
                              value={effSev}
                              onChange={(e) =>
                                applySeverity(section.id, item, e.target.value as Severity)
                              }
                              aria-label="Severity"
                            >
                              {SEVERITIES.map((sv) => (
                                <option key={sv} value={sv}>
                                  {sv}
                                </option>
                              ))}
                            </select>
                          </div>
                          <textarea
                            className="admin-audit-note-input"
                            rows={2}
                            value={note}
                            placeholder="Note / finding detail"
                            onChange={(e) =>
                              applyTextPatch(section.id, item, 'note', e.target.value)
                            }
                          />
                          <input
                            className="admin-audit-evidence-input"
                            value={evidenceUrl}
                            placeholder="Evidence URL (optional)"
                            onChange={(e) =>
                              applyTextPatch(section.id, item, 'evidenceUrl', e.target.value)
                            }
                          />
                          <div className="d-flex gap-2">
                            <input
                              className="admin-audit-assignee-input"
                              value={assignee}
                              placeholder="Assignee"
                              onChange={(e) =>
                                applyTextPatch(section.id, item, 'assignee', e.target.value)
                              }
                            />
                            <input
                              className="admin-audit-due-input"
                              type="date"
                              value={dueDate}
                              onChange={(e) =>
                                applyTextPatch(section.id, item, 'dueDate', e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </section>
            )
          })}
        </div>

        <aside className="admin-audit-side">
          <Card className="admin-card mb-3">
            <Card.Body>
              <h3 className="admin-card-heading mb-3 h6 text-uppercase text-white-50">
                Findings by status
              </h3>
              <SideRow
                icon={<CircleCheck size={14} style={{ color: 'rgba(129, 199, 132, 1)' }} />}
                label="Pass"
                value={statusCounts.PASS}
              />
              <SideRow
                icon={<CircleAlert size={14} style={{ color: 'rgba(255, 213, 79, 1)' }} />}
                label="Warnings"
                value={statusCounts.WARNING}
              />
              <SideRow
                icon={<CircleX size={14} style={{ color: 'rgba(229, 115, 115, 1)' }} />}
                label="Failures"
                value={statusCounts.FAIL}
              />
              <SideRow
                icon={<SquareDashed size={14} style={{ color: 'rgba(220, 222, 228, 0.5)' }} />}
                label="N/A"
                value={statusCounts.NA}
              />
              <SideRow
                icon={<SquareDashed size={14} style={{ color: 'rgba(220, 222, 228, 0.3)' }} />}
                label="Unanswered"
                value={statusCounts.UNKNOWN}
              />
            </Card.Body>
          </Card>
          <Card className="admin-card">
            <Card.Body>
              <h3 className="admin-card-heading mb-3 h6 text-uppercase text-white-50">
                By severity
              </h3>
              {SEVERITIES.map((sv) => (
                <div className="severity-row" key={sv}>
                  <span>
                    <span className="dot" style={{ background: SEVERITY_COLORS[sv] }} />
                    {sv.charAt(0) + sv.slice(1).toLowerCase()}
                  </span>
                  <strong>{severityCounts[sv]}</strong>
                </div>
              ))}
            </Card.Body>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function SideRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="severity-row">
      <span>
        <span className="me-2">{icon}</span>
        {label}
      </span>
      <strong>{value}</strong>
    </div>
  )
}
