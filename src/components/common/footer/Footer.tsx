import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import logo from '../../../assets/icon-only-transparent-no-buffer.png'
import './footer.scss'

const Footer: React.FC = () => {
  return (
    <footer className="footer text-white px-3 px-md-4 px-lg-5">
      <Container fluid>
        <Row className="align-items-center">
          {/* Logo – match navbar brand */}
          <Col lg={4} className="mb-2 mb-lg-0">
            <Link to="/" className="d-flex align-items-center text-primary text-decoration-none footer-brand">
              <img src={logo} alt="Byteverse" className="footer-logo me-2" />
              <span className="logo-text text-white">Byteverse</span>
            </Link>
          </Col>

          {/* Contact Info */}
          <Col lg={{ span: 3, offset: 5 }} className='text-md-end get-in-touch'>
            <h6 className="mb-2 fw-semibold">Get In Touch</h6>
            <div className="contact-info">
              <div className="mb-0">
                <i className="bi bi-envelope me-2 text-primary"></i>
                <a href='mailto:info@byteverseinnov.com' className="text-light text-decoration-none">reach@byteverseinnov.com</a>
              </div>
            </div>
          </Col>
        </Row>

        {/* Bottom Section */}
        <Row className="mt-3 pt-3">
          <Col md={6}>
            <p className="text-light mb-0 small">
              © 2026 Byteverse. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <div className="social-links">
              {/* <a href="#" className="text-light me-3 footer-link" aria-label="LinkedIn">
                <i className="bi bi-linkedin fs-5"></i>
              </a> */}
              <a href="https://x.com/byteverseco" className="text-light me-3 footer-link" aria-label="Twitter">
                <i className="bi bi-twitter-x fs-5"></i>
              </a>
              <a href="https://www.instagram.com/byteverseco/#" className="text-light footer-link" aria-label="Instagram">
                <i className="bi bi-instagram fs-5"></i>
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
