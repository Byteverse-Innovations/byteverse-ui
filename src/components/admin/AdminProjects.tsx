import React from 'react'
import { Card } from 'react-bootstrap'
import './AdminQuotes.scss'

/**
 * Placeholder for Project Management (CRUD).
 * Backend Project model and listProjects/createProject/updateProject/deleteProject
 * can be added in a follow-up; this page is ready to be wired to those APIs.
 */
export default function AdminProjects() {
  return (
    <>
      <h1 className="h3 mb-4 text-white">Projects</h1>
      <Card className="admin-card">
        <Card.Body>
          <h2 className="h6 text-white mb-2">Project Management</h2>
          <p className="text-white-50 mb-0">
            Full project CRUD will be available here once the Project model and API are added to the
            backend. You can extend the GraphQL schema with a <code>Project</code> type and
            listProjects / getProject / createProject / updateProject / deleteProject, then wire
            this page to the admin API.
          </p>
        </Card.Body>
      </Card>
    </>
  )
}
