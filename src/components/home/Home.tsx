import React from 'react'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import heroImage from '../../assets/icon-only.png'
import './home.scss'

const Home: React.FC = () => {
  return (
    <Container fluid>
      {/* Hero Section */}
      <Row className="mb-5">
        <Col className="text-center d-flex align-items-start flex-column justify-content-center bg-deep-cove" lg={6}>
          <h1 className="display-4 fw-bold mb-4 text-white">Engineering the Future for Small Business IT</h1>
          <p className="lead mb-4 text-white">
            Innovative solutions for the digital age. We transform ideas into powerful, scalable applications..
          </p>
          <Button variant="primary" size="lg">
            View Our Work
          </Button>
        </Col>
        <Col lg={6}>
          <img src={heroImage} alt="Byteverse" className="img-hero" />
        </Col>
      </Row>

      {/* Features Section */}
      <Row className="mb-5">
        <Col lg={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="bi bi-code-slash fs-1 text-primary"></i>
              </div>
              <Card.Title>Custom Development</Card.Title>
              <Card.Text>
                Tailored software solutions designed to meet your specific business needs and requirements.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="bi bi-phone fs-1 text-primary"></i>
              </div>
              <Card.Title>Mobile Apps</Card.Title>
              <Card.Text>
                Native and cross-platform mobile applications that deliver exceptional user experiences.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="bi bi-cloud fs-1 text-primary"></i>
              </div>
              <Card.Title>Cloud Solutions</Card.Title>
              <Card.Text>
                Scalable cloud infrastructure and services to power your applications and business growth.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* About Preview Section */}
      <Row className="bg-light py-5 rounded">
        <Col lg={8} className="mx-auto text-center">
          <h2 className="mb-4">Why Choose Byteverse?</h2>
          <p className="lead">
            With years of experience in software development and a passion for innovation,
            we help businesses thrive in the digital landscape through cutting-edge technology solutions.
          </p>
          <Button variant="outline-secondary" href="/about">
            Learn More About Us
          </Button>
        </Col>
      </Row>
    </Container>
  )
}

export default Home 