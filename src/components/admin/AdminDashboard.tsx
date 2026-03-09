import React from 'react'
import { Card, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  return (
    <>
      <h1 className="h3 mb-4 text-white">Dashboard</h1>
      <Row>
        <Col md={6} lg={4} className="mb-3">
          <Card className="admin-card">
            <Card.Body>
              <Card.Title as={Link} to="/admin/projects" className="text-primary text-decoration-none">
                Projects
              </Card.Title>
              <Card.Text className="text-white-50 small mb-0">
                Manage internal projects (CRUD). Backend model can be added in a follow-up.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={4} className="mb-3">
          <Card className="admin-card">
            <Card.Body>
              <Card.Title as={Link} to="/admin/clients" className="text-primary text-decoration-none">
                Clients
              </Card.Title>
              <Card.Text className="text-white-50 small mb-0">
                View client list with activity and status from quotes and contacts.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={4} className="mb-3">
          <Card className="admin-card">
            <Card.Body>
              <Card.Title as={Link} to="/admin/quotes" className="text-primary text-decoration-none">
                Quotes & Invoices
              </Card.Title>
              <Card.Text className="text-white-50 small mb-0">
                Create and manage quotes, convert to invoices, view status.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={4} className="mb-3">
          <Card className="admin-card">
            <Card.Body>
              <Card.Title as={Link} to="/admin/contacts" className="text-primary text-decoration-none">
                Contact submissions
              </Card.Title>
              <Card.Text className="text-white-50 small mb-0">
                View and manage contact form submissions.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={4} className="mb-3">
          <Card className="admin-card">
            <Card.Body>
              <Card.Title as={Link} to="/admin/services" className="text-primary text-decoration-none">
                Services
              </Card.Title>
              <Card.Text className="text-white-50 small mb-0">
                Create, edit, and delete services (content/component management).
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}
