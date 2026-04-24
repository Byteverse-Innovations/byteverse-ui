import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, GripVertical, Plus, Trash2 } from 'lucide-react'
import * as adminApi from '../../api/admin-api'
import type { AuditSectionInput } from '../../api/admin-api'
import AdminPageHeader from './AdminPageHeader'
import './AdminAudits.scss'

type EditorSection = {
  id: string
  title: string
  description: string
  items: EditorItem[]
}

type EditorItem = {
  id: string
  label: string
  description: string
  referenceUrl: string
  remediation: string
}

let TEMP_ID = 1
const tempId = (prefix: string) => `${prefix}-${Date.now()}-${TEMP_ID++}`

function toEditorSection(s: adminApi.AuditSection): EditorSection {
  return {
    id: s.id,
    title: s.title,
    description: s.description ?? '',
    items: (s.items ?? []).map((it) => ({
      id: it.id,
      label: it.label,
      description: it.description ?? '',
      referenceUrl: it.referenceUrl ?? '',
      remediation: it.remediation ?? '',
    })),
  }
}

function toInputSection(s: EditorSection, order: number): AuditSectionInput {
  return {
    id: s.id.startsWith('new-') ? undefined : s.id,
    title: s.title,
    description: s.description || undefined,
    sortOrder: order,
    items: s.items.map((it, i) => ({
      id: it.id.startsWith('new-') ? undefined : it.id,
      label: it.label,
      description: it.description || undefined,
      referenceUrl: it.referenceUrl || undefined,
      remediation: it.remediation || undefined,
      sortOrder: i,
    })),
  }
}

export default function AdminAuditTemplateEditor() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const templateQ = useQuery({
    queryKey: ['admin', 'auditTemplate', id],
    queryFn: () => adminApi.getAuditTemplate(id),
    enabled: !!id,
  })

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('custom')
  const [sections, setSections] = useState<EditorSection[]>([])
  const [error, setError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  const loadedRef = useRef(false)
  useEffect(() => {
    if (loadedRef.current) return
    const t = templateQ.data
    if (t) {
      loadedRef.current = true
      setName(t.name)
      setDescription(t.description ?? '')
      setCategory(t.category ?? 'custom')
      setSections((t.sections ?? []).map(toEditorSection))
    }
  }, [templateQ.data])

  const markDirty = () => setDirty(true)

  const saveMut = useMutation({
    mutationFn: () =>
      adminApi.updateAuditTemplate(id, {
        name: name.trim() || 'Untitled template',
        description: description.trim() || undefined,
        category,
        sections: sections.map((s, i) => toInputSection(s, i)),
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['admin', 'auditTemplate', id], updated)
      queryClient.invalidateQueries({ queryKey: ['admin', 'auditTemplates'] })
      setSections((updated.sections ?? []).map(toEditorSection))
      setDirty(false)
      setSavedAt(new Date())
      setError(null)
    },
    onError: (e) => setError(e instanceof Error ? e.message : String(e)),
  })

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: tempId('new-sec'),
        title: 'New section',
        description: '',
        items: [{ id: tempId('new-item'), label: 'New item', description: '', referenceUrl: '', remediation: '' }],
      },
    ])
    markDirty()
  }

  const removeSection = (sid: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sid))
    markDirty()
  }

  const moveSection = (idx: number, dir: -1 | 1) => {
    const next = idx + dir
    if (next < 0 || next >= sections.length) return
    setSections((prev) => {
      const copy = [...prev]
      const [moved] = copy.splice(idx, 1)
      copy.splice(next, 0, moved!)
      return copy
    })
    markDirty()
  }

  const updateSection = (sid: string, patch: Partial<EditorSection>) => {
    setSections((prev) => prev.map((s) => (s.id === sid ? { ...s, ...patch } : s)))
    markDirty()
  }

  const addItem = (sid: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sid
          ? {
              ...s,
              items: [
                ...s.items,
                { id: tempId('new-item'), label: 'New item', description: '', referenceUrl: '', remediation: '' },
              ],
            }
          : s
      )
    )
    markDirty()
  }

  const removeItem = (sid: string, iid: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sid ? { ...s, items: s.items.filter((it) => it.id !== iid) } : s))
    )
    markDirty()
  }

  const moveItem = (sid: string, iidx: number, dir: -1 | 1) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sid) return s
        const next = iidx + dir
        if (next < 0 || next >= s.items.length) return s
        const items = [...s.items]
        const [moved] = items.splice(iidx, 1)
        items.splice(next, 0, moved!)
        return { ...s, items }
      })
    )
    markDirty()
  }

  const updateItem = (sid: string, iid: string, patch: Partial<EditorItem>) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sid
          ? {
              ...s,
              items: s.items.map((it) => (it.id === iid ? { ...it, ...patch } : it)),
            }
          : s
      )
    )
    markDirty()
  }

  const totals = useMemo(() => {
    return {
      sections: sections.length,
      items: sections.reduce((sum, s) => sum + s.items.length, 0),
    }
  }, [sections])

  if (!id) return <Alert variant="danger">Missing template id</Alert>
  if (templateQ.isLoading) {
    return (
      <div className="text-white-50 d-flex align-items-center gap-2">
        <Spinner animation="border" size="sm" /> Loading template…
      </div>
    )
  }
  if (!templateQ.data) {
    return <Alert variant="warning">Template not found.</Alert>
  }

  return (
    <div className="admin-audit-editor">
      <div className="mb-3">
        <Button as={Link as any} variant="link" className="text-white-50 px-0" to="/admin/audits">
          <ArrowLeft size={15} className="me-1" /> Back to audits
        </Button>
      </div>
      <AdminPageHeader
        eyebrow="Template"
        title="Edit audit template"
        description="Templates describe what to check. Changes apply to new audits going forward; existing audits keep the snapshot they were started with."
      />
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card className="admin-card mb-3">
        <Card.Body>
          <div className="row g-3">
            <div className="col-md-7">
              <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    markDirty()
                  }}
                />
              </Form.Group>
            </div>
            <div className="col-md-5">
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value)
                    markDirty()
                  }}
                >
                  <option value="website">Website</option>
                  <option value="infra">IT infrastructure</option>
                  <option value="security">Security</option>
                  <option value="systems">Business systems</option>
                  <option value="custom">Custom</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-12">
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    markDirty()
                  }}
                />
              </Form.Group>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="admin-card mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="admin-card-heading mb-0">Sections</h2>
            <div className="text-white-50 small">
              {totals.sections} sections · {totals.items} items
            </div>
          </div>

          {sections.length === 0 && (
            <p className="text-white-50">No sections yet — add one below.</p>
          )}

          {sections.map((s, sidx) => (
            <div key={s.id} className="admin-audit-editor-section">
              <div className="section-head">
                <span className="section-drag" aria-hidden="true">
                  <GripVertical size={16} />
                </span>
                <div className="section-inputs">
                  <input
                    type="text"
                    className="section-title-input"
                    value={s.title}
                    placeholder="Section title"
                    onChange={(e) => updateSection(s.id, { title: e.target.value })}
                  />
                  <textarea
                    className="section-desc-input"
                    value={s.description}
                    placeholder="Optional description for this section"
                    rows={1}
                    onChange={(e) => updateSection(s.id, { description: e.target.value })}
                  />
                </div>
                <div className="d-flex flex-column gap-1 ms-2">
                  <Button
                    size="sm"
                    variant="link"
                    className="p-0 text-white-50"
                    onClick={() => moveSection(sidx, -1)}
                    disabled={sidx === 0}
                    title="Move up"
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="link"
                    className="p-0 text-white-50"
                    onClick={() => moveSection(sidx, 1)}
                    disabled={sidx === sections.length - 1}
                    title="Move down"
                  >
                    ↓
                  </Button>
                  <Button
                    size="sm"
                    variant="link"
                    className="p-0 text-danger"
                    onClick={() => removeSection(s.id)}
                    title="Delete section"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              {s.items.map((it, iidx) => (
                <div key={it.id} className="admin-audit-editor-item">
                  <span className="item-drag" aria-hidden="true">
                    <GripVertical size={14} />
                  </span>
                  <div className="item-fields">
                    <input
                      className="item-input"
                      value={it.label}
                      placeholder="Item label"
                      onChange={(e) => updateItem(s.id, it.id, { label: e.target.value })}
                    />
                    <textarea
                      className="item-input"
                      rows={1}
                      value={it.description}
                      placeholder="Optional description (what success looks like)"
                      onChange={(e) => updateItem(s.id, it.id, { description: e.target.value })}
                    />
                    <div className="item-sub-fields">
                      <input
                        className="item-input"
                        value={it.referenceUrl}
                        placeholder="Reference URL (optional)"
                        onChange={(e) => updateItem(s.id, it.id, { referenceUrl: e.target.value })}
                      />
                      <input
                        className="item-input"
                        value={it.remediation}
                        placeholder="Remediation hint (optional)"
                        onChange={(e) => updateItem(s.id, it.id, { remediation: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-1">
                    <Button
                      size="sm"
                      variant="link"
                      className="p-0 text-white-50"
                      onClick={() => moveItem(s.id, iidx, -1)}
                      disabled={iidx === 0}
                      title="Move up"
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="link"
                      className="p-0 text-white-50"
                      onClick={() => moveItem(s.id, iidx, 1)}
                      disabled={iidx === s.items.length - 1}
                      title="Move down"
                    >
                      ↓
                    </Button>
                    <Button
                      size="sm"
                      variant="link"
                      className="p-0 text-danger"
                      onClick={() => removeItem(s.id, it.id)}
                      title="Delete item"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                variant="outline-light"
                size="sm"
                onClick={() => addItem(s.id)}
                className="mt-1"
              >
                <Plus size={14} className="me-1" /> Add item
              </Button>
            </div>
          ))}

          <Button variant="outline-light" onClick={addSection} className="mt-2">
            <Plus size={14} className="me-1" /> Add section
          </Button>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="text-white-50 small">
          {savedAt ? (
            <span>
              <Check size={14} className="me-1" />
              Saved at {savedAt.toLocaleTimeString()}
            </span>
          ) : dirty ? (
            <span>Unsaved changes</span>
          ) : (
            <span>No changes</span>
          )}
        </div>
        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/admin/audits')}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => saveMut.mutate()}
            disabled={saveMut.isPending || !dirty}
          >
            {saveMut.isPending ? 'Saving…' : 'Save template'}
          </Button>
        </div>
      </div>
    </div>
  )
}
