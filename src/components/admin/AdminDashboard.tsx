import React, { useMemo } from 'react'
import { Card, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  FileText,
  Inbox,
  Briefcase,
  ArrowUpRight,
} from 'lucide-react'
import './AdminDashboard.scss'

type DashTile = {
  to: string
  title: string
  description: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
}

const TILES: DashTile[] = [
  {
    to: '/admin/projects',
    title: 'Projects',
    description: 'Internal projects — create and update records as your backend grows.',
    icon: FolderKanban,
  },
  {
    to: '/admin/clients',
    title: 'Clients',
    description: 'Client directory with context from quotes and contact activity.',
    icon: Users,
  },
  {
    to: '/admin/quotes',
    title: 'Quotes & invoices',
    description: 'Draft quotes, track status, and move work through billing.',
    icon: FileText,
  },
  {
    to: '/admin/contacts',
    title: 'Contact submissions',
    description: 'Inbox for site enquiries — triage and follow up.',
    icon: Inbox,
  },
  {
    to: '/admin/services',
    title: 'Services',
    description: 'Manage what you show on the marketing site.',
    icon: Briefcase,
  },
]

export default function AdminDashboard() {
  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }).format(new Date()),
    []
  )

  return (
    <div className="admin-dashboard-home">
      <header className="admin-dashboard-hero">
        <div className="admin-dashboard-hero-glow" aria-hidden="true" />
        <div className="admin-dashboard-hero-inner">
          <div className="admin-dashboard-hero-copy">
            <p className="admin-dashboard-eyebrow mb-2">
              <LayoutDashboard size={16} strokeWidth={2} className="admin-dashboard-eyebrow-icon" />
              Overview
            </p>
            <h1 className="admin-dashboard-title mb-2">{greeting}</h1>
            <p className="admin-dashboard-lead mb-0">
              Pick a workspace below or use the sidebar. You’re signed in to the internal console.
            </p>
          </div>
          <div className="admin-dashboard-date-pill" aria-label="Today’s date">
            <span>{today}</span>
          </div>
        </div>
      </header>

      <h2 className="admin-dashboard-section-title h6 text-uppercase mb-3">
        Workspaces
      </h2>
      <Row>
        {TILES.map(({ to, title, description, icon: Icon }) => (
          <Col md={6} xl={4} key={to} className="mb-3">
            <Card as={Link} to={to} className="admin-card admin-dashboard-tile text-decoration-none h-100">
              <Card.Body className="d-flex flex-column">
                <div className="admin-dashboard-tile-top">
                  <span className="admin-dashboard-tile-icon" aria-hidden="true">
                    <Icon size={22} strokeWidth={1.85} />
                  </span>
                  <ArrowUpRight size={18} strokeWidth={2} className="admin-dashboard-tile-arrow" />
                </div>
                <Card.Title className="admin-dashboard-tile-title h5 mt-3 mb-2">{title}</Card.Title>
                <Card.Text className="admin-dashboard-tile-desc small mb-0 flex-grow-1">{description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
