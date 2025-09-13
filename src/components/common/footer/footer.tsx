import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import logo from '../../../assets/bv-logo.svg'
import './footer.scss'

const Footer: React.FC = () => {
  return (
    <footer className="footer bg-deep-cove text-white py-5">
      <Container>
        <Row className="align-items-center">
          {/* Logo and Company Info */}
          <Col lg={4} className="mb-4 mb-lg-0">
            <div className="d-flex align-items-center mb-3">
              <img src={logo} alt="Byteverse" className="footer-logo me-3" />
            </div>
          </Col>

          {/* Contact Info */}
          <Col lg={{ span: 3, offset: 5 }} className='text-md-end get-in-touch'>
            <h6 className="text-primary mb-3 fw-semibold">Get In Touch</h6>
            <div className="contact-info">
              <div className="mb-2">
                <i className="bi bi-envelope me-2 text-primary"></i>
                <a href='mailto:info@byteverseinnov.com' className="text-light text-decoration-none">reach@byteverseinnov.com</a>
              </div>
            </div>
          </Col>
        </Row>

        {/* Bottom Section */}
        <Row className="mt-4 pt-4">
          <Col md={6}>
            <p className="text-light mb-0 small">
              © 2025 Byteverse. All rights reserved.
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
