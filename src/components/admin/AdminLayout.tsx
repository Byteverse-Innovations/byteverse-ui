import React, { useState } from 'react'
import { Container, Nav, Row, Col, Button } from 'react-bootstrap'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './AdminLayout.scss'

export default function AdminLayout() {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/')

  const navLinks = [
    { to: '/admin', label: 'Dashboard', exact: true },
    { to: '/admin/projects', label: 'Projects' },
    { to: '/admin/clients', label: 'Clients' },
    { to: '/admin/quotes', label: 'Quotes & Invoices' },
    { to: '/admin/contacts', label: 'Contact submissions' },
    { to: '/admin/services', label: 'Services' },
    { to: '/admin/audits', label: 'Audit checklists' },
  ]

  return (
    <Container fluid className="admin-layout">
      <Row>
        <Col
          xs={12}
          md={3}
          lg={2}
          className={`admin-sidebar px-0${sidebarOpen ? ' admin-sidebar--open' : ''}`}
        >
          <div
            className={`sidebar-backdrop ${sidebarOpen ? 'open' : ''}`}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="sidebar-sticky py-3">
            <div className="d-flex align-items-center justify-content-between px-3 mb-3 sidebar-brand-row">
              <div className="sidebar-brand">
                <span className="sidebar-brand-mark" aria-hidden="true" />
                <h2 className="sidebar-brand-title mb-0">Admin</h2>
              </div>
              <Button
                variant="link"
                className="admin-sidebar-toggle d-md-none text-white p-0"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              >
                {sidebarOpen ? '✕' : '☰'}
              </Button>
            </div>
            <Nav className="flex-column">
              {navLinks.map(({ to, label, exact }) => (
                <Nav.Link
                  key={to}
                  as={Link}
                  to={to}
                  className={
                    exact ? (location.pathname === to ? 'active' : '') : isActive(to) ? 'active' : ''
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  {label}
                </Nav.Link>
              ))}
            </Nav>
            <div className="sidebar-footer px-3 mt-4">
              <span className="sidebar-user text-white-50 small d-block text-truncate" title={user?.username}>
                {user?.username}
              </span>
              <button
                type="button"
                className="btn admin-sidebar-signout btn-sm"
                onClick={() => signOut()}
              >
                Sign out
              </button>
            </div>
          </div>
        </Col>
        <Col xs={12} md={9} lg={10} className="admin-main py-4">
          <Button
            variant="outline-light"
            size="sm"
            className="d-md-none mb-2 admin-main-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open admin menu"
          >
            ☰ Menu
          </Button>
          <Outlet />
        </Col>
      </Row>
    </Container>
  )
}
