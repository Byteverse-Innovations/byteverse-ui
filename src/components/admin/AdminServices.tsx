import React, { useEffect, useState } from 'react'
import { Table, Button, Card, Modal, Form, Alert, Badge } from 'react-bootstrap'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { graphqlClient } from '../../api/clients'
import { useListAllServicesQuery } from '../../api/operations/ops'
import * as adminApi from '../../api/admin-api'
import type { Service } from '../../api/admin-api'
import './AdminQuotes.scss'

export default function AdminServices() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [trackJobId, setTrackJobId] = useState<string | null>(null)

  const { data: services = [], isLoading } = useListAllServicesQuery(graphqlClient)

  const { data: notionStatus } = useQuery({
    queryKey: ['notionIntegrationStatus'],
    queryFn: () => adminApi.notionIntegrationStatus(),
  })

  const { data: trackedJob } = useQuery({
    queryKey: ['notionSyncJob', trackJobId],
    queryFn: () => adminApi.notionSyncJob(trackJobId!),
    enabled: !!trackJobId,
    refetchInterval: (query) => {
      const st = query.state.data?.status
      return st === 'QUEUED' || st === 'RUNNING' ? 2000 : false
    },
  })

  useEffect(() => {
    if (trackedJob?.status === 'SUCCEEDED' || trackedJob?.status === 'FAILED') {
      void queryClient.invalidateQueries({ queryKey: ['listAllServices'] })
      void queryClient.invalidateQueries({ queryKey: ['notionIntegrationStatus'] })
    }
  }, [trackedJob?.status, queryClient])

  const connectNotionMut = useMutation({
    mutationFn: adminApi.notionOAuthUrl,
    onSuccess: ({ url, state }) => {
      sessionStorage.setItem('notion_oauth_state', state)
      window.location.href = url
    },
    onError: (err) => setError(err instanceof Error ? err.message : String(err)),
  })

  const syncFromNotionMut = useMutation({
    mutationFn: adminApi.queueSyncServicesFromNotion,
    onSuccess: (job) => {
      setTrackJobId(job.jobId)
      setError(null)
    },
    onError: (err) => setError(err instanceof Error ? err.message : String(err)),
  })

  const pushToNotionMut = useMutation({
    mutationFn: (serviceId: string) => adminApi.queuePushServiceToNotion(serviceId),
    onSuccess: (job) => {
      setTrackJobId(job.jobId)
      setError(null)
    },
    onError: (err) => setError(err instanceof Error ? err.message : String(err)),
  })
  const createMut = useMutation({
    mutationFn: adminApi.createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listAllServices'] })
      setShowModal(false)
      setEditing(null)
    },
    onError: (err) => setError(err instanceof Error ? err.message : String(err)),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Record<string, unknown> }) =>
      adminApi.updateService(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listAllServices'] })
      setShowModal(false)
      setEditing(null)
    },
    onError: (err) => setError(err instanceof Error ? err.message : String(err)),
  })
  const deleteMut = useMutation({
    mutationFn: adminApi.deleteService,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['listAllServices'] }),
    onError: (err) => setError(err instanceof Error ? err.message : String(err)),
  })

  return (
    <>
      <h1 className="h3 mb-4 text-white">Services</h1>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Card className="admin-card mb-3">
        <Card.Body>
          <h2 className="h6 text-white mb-3">Notion</h2>
          <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
            {notionStatus?.connected ? (
              <Badge bg="success">
                Connected
                {notionStatus.usesOAuth === false
                  ? ' (internal integration)'
                  : notionStatus.workspaceName
                    ? `: ${notionStatus.workspaceName}`
                    : ''}
              </Badge>
            ) : (
              <Badge bg="secondary">Not connected</Badge>
            )}
            {notionStatus != null && notionStatus.usesOAuth && !notionStatus.connected && (
              <Button
                variant="outline-light"
                size="sm"
                disabled={connectNotionMut.isPending}
                onClick={() => connectNotionMut.mutate()}
              >
                Connect Notion
              </Button>
            )}
            {notionStatus?.connected && (
              <Button
                variant="outline-light"
                size="sm"
                disabled={syncFromNotionMut.isPending}
                onClick={() => syncFromNotionMut.mutate()}
              >
                Sync from Notion
              </Button>
            )}
          </div>
          {notionStatus?.usesOAuth && (
            <p className="text-white-50 small mb-0">
              OAuth redirect URL (public integrations only):{' '}
              <code className="text-white">{`${window.location.origin}/admin/notion/callback`}</code>
            </p>
          )}
          {notionStatus?.usesOAuth === false && (
            <p className="text-white-50 small mb-0">
              Using a Notion internal integration token from AWS Secrets Manager — share your Services database with
              that integration in Notion.
            </p>
          )}
          {trackedJob && (
            <Alert variant={trackedJob.status === 'FAILED' ? 'danger' : 'info'} className="mt-3 mb-0 py-2 small">
              Job {trackedJob.jobId.slice(0, 8)}… — {trackedJob.status}
              {trackedJob.errorMessage ? `: ${trackedJob.errorMessage}` : ''}
            </Alert>
          )}
        </Card.Body>
      </Card>

      <Card className="admin-card">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h6 text-white mb-0">Services</h2>
            <Button
              variant="primary"
              onClick={() => {
                setEditing(null)
                setShowModal(true)
              }}
            >
              Create service
            </Button>
          </div>
          {isLoading ? (
            <p className="text-white-50">Loading…</p>
          ) : (
            <Table responsive size="sm" className="text-white admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(services as any).listAllServices?.map((s: any) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td className="text-white-50">{(s.description ?? '').slice(0, 60)}…</td>
                    <td>{s.price != null ? `$${s.price}` : '—'}</td>
                    <td>{s.category ?? '—'}</td>
                    <td>
                      <Button
                        variant="outline-light"
                        size="sm"
                        className="me-1"
                        onClick={() => {
                          setEditing(s as Service)
                          setShowModal(true)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="me-1"
                        onClick={() => deleteMut.mutate(s.id)}
                      >
                        Delete
                      </Button>
                      {notionStatus?.connected && (
                        <Button
                          variant="outline-info"
                          size="sm"
                          disabled={pushToNotionMut.isPending}
                          onClick={() => pushToNotionMut.mutate(s.id)}
                        >
                          Push to Notion
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" className="admin-modal">
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Edit service' : 'New service'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ServiceForm
            service={editing}
            onSave={(input) => {
              setError(null)
              if (editing) {
                updateMut.mutate({ id: editing.id, input })
              } else {
                createMut.mutate(input)
              }
            }}
            onCancel={() => setShowModal(false)}
          />
        </Modal.Body>
      </Modal>
    </>
  )
}

function ServiceForm({
  service,
  onSave,
  onCancel,
}: {
  service: Service | null
  onSave: (input: Record<string, unknown>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(service?.name ?? '')
  const [description, setDescription] = useState(service?.description ?? '')
  const [price, setPrice] = useState(service?.price ?? '')
  const [category, setCategory] = useState(service?.category ?? '')
  const [servicePillar, setServicePillar] = useState(service?.servicePillar ?? '')
  const [pricingModel, setPricingModel] = useState(service?.pricingModel ?? '')
  const [estimatedDuration, setEstimatedDuration] = useState(service?.estimatedDuration ?? '')
  const [showOnMainSite, setShowOnMainSite] = useState(service?.showOnMainSite ?? true)
  const [isActive, setIsActive] = useState(service?.isActive ?? true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name,
      description: description || undefined,
      price: price === '' ? undefined : Number(price),
      category: category || undefined,
      servicePillar: servicePillar || undefined,
      pricingModel: pricingModel || undefined,
      estimatedDuration: estimatedDuration || undefined,
      showOnMainSite,
      isActive,
    })
  }

  return (
    <Form onSubmit={handleSubmit}>
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
        <Form.Label>Price</Form.Label>
        <Form.Control
          type="number"
          step={0.01}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Category</Form.Label>
        <Form.Control value={category} onChange={(e) => setCategory(e.target.value)} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Service pillar</Form.Label>
        <Form.Control value={servicePillar} onChange={(e) => setServicePillar(e.target.value)} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Pricing model</Form.Label>
        <Form.Control value={pricingModel} onChange={(e) => setPricingModel(e.target.value)} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Estimated duration</Form.Label>
        <Form.Control
          value={estimatedDuration}
          onChange={(e) => setEstimatedDuration(e.target.value)}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          label="Show on main site"
          checked={showOnMainSite}
          onChange={(e) => setShowOnMainSite(e.target.checked)}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          label="Active"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
      </Form.Group>
      <div className="d-flex gap-2">
        <Button type="submit" variant="primary">
          {service ? 'Update' : 'Create'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Form>
  )
}
