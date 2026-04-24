import React, { useMemo, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Dropdown,
  Form,
  Modal,
  Nav,
  Table,
} from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ClipboardCheck,
  FileText,
  MoreHorizontal,
  Plus,
  Target,
  Download,
  Trash2,
  Copy,
  Archive,
} from 'lucide-react'
import * as adminApi from '../../api/admin-api'
import type { Audit, AuditTemplate } from '../../api/admin-api'
import AdminPageHeader from './AdminPageHeader'
import { downloadAuditPdf } from './pdf-utils'
import './AdminAudits.scss'

type Tab = 'audits' | 'templates'

const STATUS_META: Record<string, { label: string; bg: string }> = {
  DRAFT: { label: 'Draft', bg: 'secondary' },
  IN_PROGRESS: { label: 'In progress', bg: 'info' },
  COMPLETED: { label: 'Completed', bg: 'success' },
  ARCHIVED: { label: 'Archived', bg: 'dark' },
}

const CATEGORY_LABELS: Record<string, string> = {
  website: 'Website',
  infra: 'IT infrastructure',
  security: 'Security',
  systems: 'Business systems',
  custom: 'Custom',
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

function auditProgress(audit: Audit): { done: number; total: number } {
  let done = 0
  let total = 0
  for (const s of audit.sections ?? []) {
    for (const i of s.items ?? []) {
      total += 1
      const st = i.status ?? 'UNKNOWN'
      if (st !== 'UNKNOWN') done += 1
    }
  }
  return { done, total }
}

export default function AdminAudits() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('audits')
  const [error, setError] = useState<string | null>(null)
  const [showNewAudit, setShowNewAudit] = useState(false)
  const [showNewTemplate, setShowNewTemplate] = useState(false)
  const [newAuditTemplateId, setNewAuditTemplateId] = useState<string | ''>('')

  const auditsQ = useQuery({ queryKey: ['admin', 'audits'], queryFn: adminApi.listAudits })
  const templatesQ = useQuery({
    queryKey: ['admin', 'auditTemplates'],
    queryFn: adminApi.listAuditTemplates,
  })

  const audits = auditsQ.data ?? []
  const templates = templatesQ.data ?? []

  const invalidateAudits = () => queryClient.invalidateQueries({ queryKey: ['admin', 'audits'] })
  const invalidateTemplates = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'auditTemplates'] })

  const seedMut = useMutation({
    mutationFn: adminApi.seedDefaultAuditTemplates,
    onSuccess: () => {
      invalidateTemplates()
      setError(null)
    },
    onError: (e) => setError(e instanceof Error ? e.message : String(e)),
  })

  const deleteAuditMut = useMutation({
    mutationFn: adminApi.deleteAudit,
    onSuccess: invalidateAudits,
    onError: (e) => setError(e instanceof Error ? e.message : String(e)),
  })

  const setStatusMut = useMutation({
    mutationFn: (args: { id: string; status: string }) =>
      adminApi.setAuditStatus(args.id, args.status),
    onSuccess: invalidateAudits,
    onError: (e) => setError(e instanceof Error ? e.message : String(e)),
  })

  const deleteTemplateMut = useMutation({
    mutationFn: adminApi.deleteAuditTemplate,
    onSuccess: invalidateTemplates,
    onError: (e) => setError(e instanceof Error ? e.message : String(e)),
  })

  const duplicateTemplateMut = useMutation({
    mutationFn: async (t: AuditTemplate) => {
      return await adminApi.createAuditTemplate({
        name: `${t.name} (copy)`,
        description: t.description ?? undefined,
        category: t.category ?? undefined,
        sections: (t.sections ?? []).map((s) => ({
          title: s.title,
          description: s.description ?? undefined,
          sortOrder: s.sortOrder ?? null,
          items: (s.items ?? []).map((it) => ({
            label: it.label,
            description: it.description ?? undefined,
            referenceUrl: it.referenceUrl ?? undefined,
            remediation: it.remediation ?? undefined,
            sortOrder: it.sortOrder ?? null,
          })),
        })),
      })
    },
    onSuccess: (created) => {
      invalidateTemplates()
      navigate(`/admin/audits/templates/${created.id}`)
    },
    onError: (e) => setError(e instanceof Error ? e.message : String(e)),
  })

  const counts = useMemo(() => {
    const out = { total: audits.length, draft: 0, inProgress: 0, completed: 0, archived: 0 }
    for (const a of audits) {
      if (a.status === 'DRAFT') out.draft += 1
      else if (a.status === 'IN_PROGRESS') out.inProgress += 1
      else if (a.status === 'COMPLETED') out.completed += 1
      else if (a.status === 'ARCHIVED') out.archived += 1
    }
    return out
  }, [audits])

  return (
    <>
      <AdminPageHeader
        eyebrow="Audits"
        title="Audit checklists"
        description="Reusable templates plus live audit runs for websites, IT infrastructure, security posture, and business systems."
      />

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="admin-audits-stats mb-3">
        <StatTile label="All audits" value={counts.total} />
        <StatTile label="In progress" value={counts.inProgress + counts.draft} />
        <StatTile label="Completed" value={counts.completed} />
        <StatTile label="Templates" value={templates.length} />
      </div>

      <Card className="admin-card admin-audits-card">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <Nav
              variant="pills"
              activeKey={tab}
              onSelect={(k) => k && setTab(k as Tab)}
              className="admin-audits-tabs"
            >
              <Nav.Item>
                <Nav.Link eventKey="audits">
                  <ClipboardCheck size={15} className="me-2" />
                  Audits
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="templates">
                  <FileText size={15} className="me-2" />
                  Templates
                </Nav.Link>
              </Nav.Item>
            </Nav>
            <div className="d-flex gap-2 flex-wrap">
              {tab === 'audits' ? (
                <Button
                  variant="primary"
                  onClick={() => {
                    setNewAuditTemplateId('')
                    setShowNewAudit(true)
                  }}
                  disabled={templates.length === 0}
                  title={
                    templates.length === 0
                      ? 'Create or seed a template before starting an audit'
                      : undefined
                  }
                >
                  <Plus size={16} className="me-1" />
                  New audit
                </Button>
              ) : (
                <>
                  {templates.length === 0 && (
                    <Button
                      variant="outline-light"
                      onClick={() => seedMut.mutate()}
                      disabled={seedMut.isPending}
                    >
                      Seed default templates
                    </Button>
                  )}
                  <Button variant="primary" onClick={() => setShowNewTemplate(true)}>
                    <Plus size={16} className="me-1" />
                    New template
                  </Button>
                </>
              )}
            </div>
          </div>

          {tab === 'audits' ? (
            <AuditsTab
              audits={audits}
              isLoading={auditsQ.isLoading}
              onDelete={(id) => {
                if (window.confirm('Delete this audit? This cannot be undone.')) {
                  deleteAuditMut.mutate(id)
                }
              }}
              onArchive={(id) => setStatusMut.mutate({ id, status: 'ARCHIVED' })}
              onReopen={(id) => setStatusMut.mutate({ id, status: 'IN_PROGRESS' })}
              onDownloadPdf={async (audit) => {
                try {
                  await downloadAuditPdf(audit)
                } catch (e) {
                  setError(e instanceof Error ? e.message : String(e))
                }
              }}
              onStartFromTemplate={() => {
                setNewAuditTemplateId('')
                setShowNewAudit(true)
              }}
            />
          ) : (
            <TemplatesTab
              templates={templates}
              isLoading={templatesQ.isLoading}
              onDelete={(id) => {
                if (window.confirm('Delete this template? Past audits are not affected.')) {
                  deleteTemplateMut.mutate(id)
                }
              }}
              onDuplicate={(t) => duplicateTemplateMut.mutate(t)}
              onStartAuditFrom={(t) => {
                setNewAuditTemplateId(t.id)
                setShowNewAudit(true)
              }}
            />
          )}
        </Card.Body>
      </Card>

      <NewAuditModal
        show={showNewAudit}
        onHide={() => setShowNewAudit(false)}
        templates={templates}
        defaultTemplateId={newAuditTemplateId}
        onError={setError}
      />

      <NewTemplateModal
        show={showNewTemplate}
        onHide={() => setShowNewTemplate(false)}
        onError={setError}
      />
    </>
  )
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="admin-audits-stat">
      <span className="admin-audits-stat-label">{label}</span>
      <span className="admin-audits-stat-value">{value}</span>
    </div>
  )
}

function AuditsTab({
  audits,
  isLoading,
  onDelete,
  onArchive,
  onReopen,
  onDownloadPdf,
  onStartFromTemplate,
}: {
  audits: Audit[]
  isLoading: boolean
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onReopen: (id: string) => void
  onDownloadPdf: (a: Audit) => void
  onStartFromTemplate: () => void
}) {
  if (isLoading) return <p className="text-white-50">Loading audits…</p>
  if (audits.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardCheck size={32} />}
        title="No audits yet"
        description="Start one from a template to fill in findings as you go, or create a blank audit if you want to define it in-place."
        action={
          <Button variant="outline-light" onClick={onStartFromTemplate}>
            Start an audit
          </Button>
        }
      />
    )
  }
  return (
    <div className="admin-table-wrap">
      <Table responsive size="sm" className="text-white admin-table mb-0">
        <thead>
          <tr>
            <th>Audit</th>
            <th>Target</th>
            <th>Client</th>
            <th>Progress</th>
            <th>Status</th>
            <th>Updated</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {audits.map((a) => {
            const { done, total } = auditProgress(a)
            const pct = total > 0 ? Math.round((done / total) * 100) : 0
            const status = STATUS_META[a.status] ?? { label: a.status, bg: 'secondary' }
            return (
              <tr key={a.id}>
                <td>
                  <Link to={`/admin/audits/${a.id}`} className="admin-audits-title-link">
                    {a.title}
                  </Link>
                  {a.templateName && (
                    <div className="text-white-50 small">From template: {a.templateName}</div>
                  )}
                </td>
                <td className="text-white-50">{a.target}</td>
                <td className="text-white-50">{a.clientName || '—'}</td>
                <td style={{ minWidth: 160 }}>
                  <div className="admin-audits-progress">
                    <div className="admin-audits-progress-bar" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="small text-white-50 mt-1">
                    {done}/{total} · {pct}%
                  </div>
                </td>
                <td>
                  <Badge bg={status.bg}>{status.label}</Badge>
                </td>
                <td className="text-white-50">{formatDate(a.updatedAt ?? a.createdAt)}</td>
                <td className="text-end">
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      variant="outline-light"
                      size="sm"
                      className="admin-audits-action-btn"
                    >
                      <MoreHorizontal size={14} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item as={Link} to={`/admin/audits/${a.id}`}>
                        Open
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => onDownloadPdf(a)}>
                        <Download size={14} className="me-2" />
                        Download PDF
                      </Dropdown.Item>
                      {a.status === 'ARCHIVED' ? (
                        <Dropdown.Item onClick={() => onReopen(a.id)}>Reopen</Dropdown.Item>
                      ) : (
                        <Dropdown.Item onClick={() => onArchive(a.id)}>
                          <Archive size={14} className="me-2" />
                          Archive
                        </Dropdown.Item>
                      )}
                      <Dropdown.Divider />
                      <Dropdown.Item className="text-danger" onClick={() => onDelete(a.id)}>
                        <Trash2 size={14} className="me-2" />
                        Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </div>
  )
}

function TemplatesTab({
  templates,
  isLoading,
  onDelete,
  onDuplicate,
  onStartAuditFrom,
}: {
  templates: AuditTemplate[]
  isLoading: boolean
  onDelete: (id: string) => void
  onDuplicate: (t: AuditTemplate) => void
  onStartAuditFrom: (t: AuditTemplate) => void
}) {
  if (isLoading) return <p className="text-white-50">Loading templates…</p>
  if (templates.length === 0) {
    return (
      <EmptyState
        icon={<FileText size={32} />}
        title="No templates yet"
        description="Seed the starter pack (website, IT infra, security, and business systems) or design your own from scratch."
      />
    )
  }
  return (
    <div className="admin-audits-grid">
      {templates.map((t) => {
        const sectionCount = t.sections?.length ?? 0
        const itemCount = (t.sections ?? []).reduce(
          (sum, s) => sum + (s.items?.length ?? 0),
          0
        )
        return (
          <article key={t.id} className="admin-audits-template-card">
            <header className="admin-audits-template-card-head">
              <span className="admin-audits-template-category">
                {CATEGORY_LABELS[t.category ?? 'custom'] ?? t.category ?? 'Custom'}
              </span>
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" size="sm" className="p-0 text-white-50">
                  <MoreHorizontal size={16} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to={`/admin/audits/templates/${t.id}`}>
                    Edit
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => onDuplicate(t)}>
                    <Copy size={14} className="me-2" />
                    Duplicate
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item className="text-danger" onClick={() => onDelete(t.id)}>
                    <Trash2 size={14} className="me-2" />
                    Delete
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </header>
            <h3 className="admin-audits-template-title">{t.name}</h3>
            {t.description && (
              <p className="admin-audits-template-desc">{t.description}</p>
            )}
            <div className="admin-audits-template-meta">
              <span>{sectionCount} sections</span>
              <span>·</span>
              <span>{itemCount} items</span>
              {t.version != null && (
                <>
                  <span>·</span>
                  <span>v{t.version}</span>
                </>
              )}
            </div>
            <footer className="admin-audits-template-card-foot">
              <Button
                as={Link as any}
                to={`/admin/audits/templates/${t.id}`}
                variant="outline-light"
                size="sm"
              >
                Edit
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onStartAuditFrom(t)}
              >
                <Target size={14} className="me-1" />
                Start audit
              </Button>
            </footer>
          </article>
        )
      })}
    </div>
  )
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="admin-audits-empty">
      <div className="admin-audits-empty-icon">{icon}</div>
      <h3 className="admin-audits-empty-title">{title}</h3>
      <p className="admin-audits-empty-desc">{description}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  )
}

function NewAuditModal({
  show,
  onHide,
  templates,
  defaultTemplateId,
  onError,
}: {
  show: boolean
  onHide: () => void
  templates: AuditTemplate[]
  defaultTemplateId: string | ''
  onError: (msg: string) => void
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [auditor, setAuditor] = useState('')
  const [templateId, setTemplateId] = useState<string>(defaultTemplateId)

  React.useEffect(() => {
    if (show) {
      setTitle('')
      setTarget('')
      setClientName('')
      setClientEmail('')
      setAuditor('')
      setTemplateId(defaultTemplateId)
    }
  }, [show, defaultTemplateId])

  const createMut = useMutation({
    mutationFn: async () => {
      const input: adminApi.CreateAuditInput = {
        title: title.trim(),
        target: target.trim(),
        clientName: clientName.trim() || null,
        clientEmail: clientEmail.trim() || null,
        auditor: auditor.trim() || null,
        status: 'DRAFT',
      }
      if (templateId) {
        return await adminApi.createAuditFromTemplate(templateId, input)
      }
      return await adminApi.createAudit({ ...input, sections: [] })
    },
    onSuccess: (audit) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'audits'] })
      onHide()
      navigate(`/admin/audits/${audit.id}`)
    },
    onError: (e) => onError(e instanceof Error ? e.message : String(e)),
  })

  const canSubmit = title.trim().length > 0 && target.trim().length > 0

  return (
    <Modal show={show} onHide={onHide} className="admin-modal">
      <Modal.Header closeButton>
        <Modal.Title>New audit</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form
          onSubmit={(e) => {
            e.preventDefault()
            if (canSubmit) createMut.mutate()
          }}
        >
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Acme site audit — Q2"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Target</Form.Label>
            <Form.Control
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. acme.com, office network, Salesforce instance"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Start from template</Form.Label>
            <Form.Select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
              <option value="">Blank (no template)</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Client name</Form.Label>
            <Form.Control
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Optional"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Client email</Form.Label>
            <Form.Control
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="Optional"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Auditor</Form.Label>
            <Form.Control
              value={auditor}
              onChange={(e) => setAuditor(e.target.value)}
              placeholder="Your name"
            />
          </Form.Group>
          <div className="d-flex gap-2">
            <Button type="submit" variant="primary" disabled={!canSubmit || createMut.isPending}>
              {createMut.isPending ? 'Creating…' : 'Create'}
            </Button>
            <Button type="button" variant="secondary" onClick={onHide}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

function NewTemplateModal({
  show,
  onHide,
  onError,
}: {
  show: boolean
  onHide: () => void
  onError: (msg: string) => void
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('custom')

  React.useEffect(() => {
    if (show) {
      setName('')
      setDescription('')
      setCategory('custom')
    }
  }, [show])

  const createMut = useMutation({
    mutationFn: () =>
      adminApi.createAuditTemplate({
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        sections: [
          {
            title: 'New section',
            items: [{ label: 'New item' }],
          },
        ],
      }),
    onSuccess: (tpl) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'auditTemplates'] })
      onHide()
      navigate(`/admin/audits/templates/${tpl.id}`)
    },
    onError: (e) => onError(e instanceof Error ? e.message : String(e)),
  })

  const canSubmit = name.trim().length > 0

  return (
    <Modal show={show} onHide={onHide} className="admin-modal">
      <Modal.Header closeButton>
        <Modal.Title>New audit template</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form
          onSubmit={(e) => {
            e.preventDefault()
            if (canSubmit) createMut.mutate()
          }}
        >
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control value={name} onChange={(e) => setName(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="website">Website</option>
              <option value="infra">IT infrastructure</option>
              <option value="security">Security</option>
              <option value="systems">Business systems</option>
              <option value="custom">Custom</option>
            </Form.Select>
          </Form.Group>
          <div className="d-flex gap-2">
            <Button type="submit" variant="primary" disabled={!canSubmit || createMut.isPending}>
              {createMut.isPending ? 'Creating…' : 'Create & edit'}
            </Button>
            <Button type="button" variant="secondary" onClick={onHide}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  )
}
