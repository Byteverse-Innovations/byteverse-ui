import React, { useState } from 'react'
import { Container, Row, Col, Form, Card, Alert, Button } from 'react-bootstrap'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './Login.scss'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [needsNewPassword, setNeedsNewPassword] = useState(false)
  const { signIn, confirmNewPassword, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/admin'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setSubmitting(true)
    try {
      const result = await signIn(username.trim(), password)
      if (result.newPasswordRequired) {
        setNeedsNewPassword(true)
      } else {
        navigate(redirectTo, { replace: true })
      }
    } catch {
      // error already set in context
    } finally {
      setSubmitting(false)
    }
  }

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    if (newPassword !== confirmPassword) {
      clearError()
      return
    }
    if (newPassword.length < 8) {
      return
    }
    setSubmitting(true)
    try {
      await confirmNewPassword(newPassword)
      navigate(redirectTo, { replace: true })
    } catch {
      // error already set in context
    } finally {
      setSubmitting(false)
    }
  }

  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword
  const passwordTooShort = newPassword.length > 0 && newPassword.length < 8

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="login-card">
            <Card.Body className="p-4">
              <h1 className="h3 mb-4 text-white">
                {needsNewPassword ? 'Set new password' : 'Admin sign in'}
              </h1>
              {error && (
                <Alert variant="danger" dismissible onClose={clearError}>
                  {error}
                </Alert>
              )}

              {needsNewPassword ? (
                <Form onSubmit={handleNewPasswordSubmit}>
                  <p className="text-white-50 small mb-3">
                    Your account requires a new password. Choose a password at least 8 characters
                    long.
                  </p>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-white">New password</Form.Label>
                    <Form.Control
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      isInvalid={passwordTooShort}
                    />
                    {passwordTooShort && (
                      <Form.Control.Feedback type="invalid">
                        Password must be at least 8 characters.
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-white">Confirm new password</Form.Label>
                    <Form.Control
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      autoComplete="new-password"
                      isInvalid={passwordMismatch}
                    />
                    {passwordMismatch && (
                      <Form.Control.Feedback type="invalid">
                        Passwords do not match.
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100"
                    disabled={
                      submitting ||
                      newPassword.length < 8 ||
                      confirmPassword !== newPassword
                    }
                  >
                    {submitting ? 'Updating…' : 'Set password & sign in'}
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="mt-2 p-0 text-white-50"
                    onClick={() => {
                      setNeedsNewPassword(false)
                      setNewPassword('')
                      setConfirmPassword('')
                      clearError()
                    }}
                  >
                    Back to sign in
                  </Button>
                </Form>
              ) : (
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
              )}

              <p className="mt-3 mb-0 small gray-2">
                <Link to="/" className="text-decoration-none">
                  Back to site
                </Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
