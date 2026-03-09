import React, { useState } from 'react'
import { Container, Row, Col, Form, Card, Alert, Button } from 'react-bootstrap'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './Login.scss'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { signIn, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/admin'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setSubmitting(true)
    try {
      await signIn(username.trim(), password)
      navigate(redirectTo, { replace: true })
    } catch {
      // error already set in context
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="login-card">
            <Card.Body className="p-4">
              <h1 className="h3 mb-4 text-white">Admin sign in</h1>
              {error && (
                <Alert variant="danger" dismissible onClose={clearError}>
                  {error}
                </Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Email or username</Form.Label>
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter email or username"
                    required
                    autoComplete="username"
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="text-white">Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    autoComplete="current-password"
                  />
                </Form.Group>
                <Button type="submit" variant="primary" className="w-100" disabled={submitting}>
                  {submitting ? 'Signing in…' : 'Sign in'}
                </Button>
              </Form>
              <p className="mt-3 mb-0 small gray-2">
                <Link to="/" className="text-decoration-none">Back to site</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
