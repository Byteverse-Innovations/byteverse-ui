import React from 'react'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import heroImage from '../../assets/icon-only-transparent.png'
import './home.scss'

const Home: React.FC = () => {
  return (
    <Container fluid>
      {/* Hero Section */}
      <Row>
        <Col className="text-center d-flex flex-row align-items-start justify-content-center bg-deep-cove p-5">
          <div className='d-flex flex-column'>
            <h1 className="display-4 fw-bold mb-4 text-white">Engineering the Future for Small Business IT</h1>
            <p className="lead mb-4 text-white">
              Innovative solutions for the digital age. We transform ideas into powerful, scalable applications.
            </p>
            <div>
              <Button variant="primary" size="lg">
                View Our Work
              </Button>
            </div>
          </div>
          {/* <div>
            <img src={heroImage} alt="Byteverse" className="img-hero" />
          </div> */}
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
              <Card.Text>
                Tailored software solutions designed to meet your specific business needs and requirements.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} className="mb-4">
          <Card className="h-100 bg-deep-cove text-white">
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
        <Col lg={3} className="mb-4">
          <Card className="h-100 bg-deep-cove text-white">
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
        <Col lg={3} className="mb-4">
          <Card className="h-100 bg-deep-cove text-white">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="bi bi-cloud fs-1 text-primary"></i>
              </div>
              <Card.Title>Cybersecurity</Card.Title>
              <Card.Text>
                Advanced cybersecurity solutions that safeguard your data, systems, and reputation from evolving digital threats.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* About Preview Section */}
      <Row className="bg-deep-cove py-5 rounded">
        <Col lg={9} className="mx-auto text-start text-white">
          <h2 className="mb-4">Delivering IT solutions that suit your needs</h2>
          <p className="lead">
            With years of experience in software development and a passion for innovation,
            we help businesses thrive in the digital landscape through cutting-edge technology solutions.
          </p>
          <Button variant="outline-secondary" href="/about">
            Learn More About Us
          </Button>
        </Col>
        <Col lg={3} className="d-none d-lg-block text-white">
         <h2 className="mb-5">Why Byteverse</h2>
         <ul className="lead">
            <li>Expertise in modern technologies</li>
            <li>Customer-centric approach</li>
            <li>Proven track record of success</li>
            <li>Commitment to quality and innovation</li>
          </ul>
          
        </Col>
      </Row>
    </Container>
  )
}

export default Home 