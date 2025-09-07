import React from 'react'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import heroImage from '../../assets/icon-only-transparent (cropped).png'
import croppedLogoSvg from '../../assets/logo-cropped.svg'
import './home.scss'
import { Link } from 'react-router-dom'
import ByteverseCircuitGlobe from '../globe/CircuitGlobe'

const Home: React.FC = () => {
  return (
    <Container fluid className='h-100'>
      {/* Hero Section */}
      <Row>
        <Col className="d-flex flex-row align-items-center justify-content-center bg-deep-cove pb-5">
          <div className='d-flex flex-column'>
            <h1 className="display-4 fw-bold mb-4 text-white ">Engineering the Future for Small Business IT</h1>
            <p className="lead mb-4 gray-2 fs-6">
              Innovative solutions for the digital age. We transform ideas into powerful, scalable applications.
            </p>
            <div>
              <Button variant="primary" size="lg" as={Link as any} to="/about">
                View Our Work
              </Button>
            </div>
          </div>
          <div>
            <ByteverseCircuitGlobe logoUrl={heroImage} />
          </div>
        </Col>
      </Row>

      {/* Features Section */}
      <Row className="py-4 bg-deep-cove">
        <h4 className="display-6 text-start text-white mb-4">Our Expertise</h4>
        <Col lg={3} className="mb-4">
          <Card className="h-100 bg-deep-cove text-white">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="bi bi-code-slash fs-1 text-primary"></i>
              </div>
              <Card.Title>Custom Development</Card.Title>
              <Card.Text className='gray-2'>
                Tailored software solutions designed to meet your specific business needs and requirements.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} className="mb-4">
          <Card className="h-100 bg-deep-cove text-white">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="bi bi-gear-fill fs-1 text-primary"></i>
              </div>
              <Card.Title>IT Infrastructure</Card.Title>
              <Card.Text className='gray-2'>
                Complete IT solutions including network setup, computer management, and technical support for small businesses.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} className="mb-4">
          <Card className="h-100 bg-deep-cove text-white">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="bi bi-cloud fs-1 text-primary"></i>
              </div>
              <Card.Title>Cloud Solutions</Card.Title>
              <Card.Text className='gray-2'>
                Scalable cloud infrastructure and services to power your applications and business growth.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} className="mb-4">
          <Card className="h-100 bg-deep-cove text-white">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="bi bi-lock fs-1 text-primary"></i>
              </div>
              <Card.Title>Cybersecurity</Card.Title>
              <Card.Text className='gray-2'>
                Advanced cybersecurity solutions that safeguard your data, systems, and reputation from evolving digital threats.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* About Preview Section */}
      <Row className="bg-deep-cove py-5">
        <Col lg={6} className="mx-auto text-start text-white">
          <h2 className="mb-4">Delivering IT solutions that suit your needs</h2>
          <p className="lead gray-2 fs-6">
            With years of experience in comprehensive IT services and a passion for innovation,
            we help small businesses thrive in the digital landscape through cutting-edge technology solutions.
          </p>
        </Col>
        <Col lg={6} className="d-none d-lg-block text-white why-byteverse">
          <h2 className="mb-3 text-uppercase">Why Byteverse</h2>
          <ul className="lead">
            <li><i className="bi bi-check" /> Expertise in modern technologies</li>
            <li><i className="bi bi-check" /> Customer-centric approach</li>
            <li><i className="bi bi-check" /> Proven track record of success</li>
            <li><i className="bi bi-check" /> Commitment to quality and innovation</li>
          </ul>
        </Col>
      </Row>
    </Container>
  )
}

export default Home 