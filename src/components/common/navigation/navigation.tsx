import { useState } from 'react'
import { Navbar, Nav, Container } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../../assets/icon-only-transparent-no-buffer.png'
import './navigation.scss'

const Navigation = () => {
  const [expanded, setExpanded] = useState(false)
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <Navbar
      expand="lg"
      className="sticky-top navbar-transparent"
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
    >
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="text-primary">
           <img src={logo} width={48} height={48} />
           <span className='px-2 text-white logo-text'>Byteverse</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav" className="flex-grow-0">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/services"
              className={`mx-2 ${isActive('/services') ? 'active fw-bold' : 'text-white'}`}
              onClick={() => setExpanded(false)}
            >
              Services
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/about"
              className={`mx-2 ${isActive('/about') ? 'active fw-bold' : 'text-white'}`}
              onClick={() => setExpanded(false)}
            >
              About
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/contact"
              className={`mx-2 ${isActive('/contact') ? 'active fw-bold' : 'text-white'}`}
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