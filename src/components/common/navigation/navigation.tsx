import { useState } from 'react'
import { Navbar, Nav, Container } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../../assets/bv-logo.svg'
import './navigation.scss'

const Navigation = () => {
  const [expanded, setExpanded] = useState(false)
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <Navbar
      bg="dark"
      expand="lg"
      className="shadow-sm sticky-top"
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">
          <img src={logo} alt="Byteverse" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav" className="flex-grow-0">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/"
              className={`mx-2 ${isActive('/') ? 'active fw-bold' : ''}`}
              onClick={() => setExpanded(false)}
            >
              Home
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/services"
              className={`mx-2 ${isActive('/services') ? 'active fw-bold' : ''}`}
              onClick={() => setExpanded(false)}
            >
              Services
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/about"
              className={`mx-2 ${isActive('/about') ? 'active fw-bold' : ''}`}
              onClick={() => setExpanded(false)}
            >
              About
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/contact"
              className={`mx-2 ${isActive('/contact') ? 'active fw-bold' : ''}`}
              onClick={() => setExpanded(false)}
            >
              Contact
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Navigation 