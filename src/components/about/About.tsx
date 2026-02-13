import React from 'react'
import { Container, Row, Col, Card, ProgressBar, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Rocket, Star, Handshake, Gem } from 'lucide-react'
import './about.scss'

const About: React.FC = () => {
  const values = [
    { title: 'Innovation', description: 'We constantly explore new technologies and methodologies to deliver cutting-edge solutions.', Icon: Rocket },
    { title: 'Quality', description: 'Every line of code and every design decision is made with quality and excellence in mind.', Icon: Star },
    { title: 'Collaboration', description: 'We believe in the power of teamwork and close collaboration with our clients.', Icon: Handshake },
    { title: 'Integrity', description: 'Honest communication and transparent processes are the foundation of our relationships.', Icon: Gem },
  ]

  return (
    <Container fluid className="py-0">
      {/* Hero – same pattern as Home/Services */}
      <Row className="mb-0">
        <Col className="d-flex flex-row align-items-center justify-content-center py-5 px-3 px-md-4 px-lg-5">
          <div className="d-flex flex-column text-center about-hero">
            <h1 className="display-4 fw-bold mb-4 text-white">Who We Are</h1>
            <p className="lead mb-0 gray-2 fs-6">
              We're a passionate team of developers, designers, and strategists dedicated to
              transforming businesses through innovative technology solutions.
            </p>
          </div>
        </Col>
      </Row>

      <div className="section-break" aria-hidden="true">
        <span className="section-break__diamond" />
      </div>

      <div className="py-5 px-3 px-md-4 px-lg-5">
        {/* Story + Mission/Vision */}
        <Row className="mb-5 section-fade-in">
          <Col lg={6} className="mb-4">
            <h2 className="display-5 fw-bold mb-4 text-white">Our Story</h2>
            <p className="mb-3 gray-2">
              Byteverse was founded in 2023 with a simple mission: to help businesses
              leverage technology to achieve their goals. We're a growing company—and
              we bring a wealth of experience working with all kinds of businesses.
            </p>
            <p className="mb-3 gray-2">
              From startups to established enterprises and everything in between, we've
              partnered with organizations across industries. Every project has sharpened
              our approach and deepened our commitment to delivering real results.
            </p>
            <p className="mb-0 gray-2">
              Today we're proud to be a trusted technology partner, helping businesses
              navigate the digital landscape and build toward sustainable growth.
            </p>
          </Col>
          <Col lg={6} className="mb-4">
            <div className="about-mission-card p-4 rounded h-100">
              <h3 className="mb-4">Our Mission</h3>
              <p className="mb-4">
                To empower businesses with technology solutions that drive growth,
                efficiency, and lasting competitive advantage.
              </p>
              <h3 className="mb-4">Our Vision</h3>
              <p className="mb-0">
                To be the go-to technology partner for businesses ready to transform
                their digital presence and achieve sustainable success.
              </p>
            </div>
          </Col>
        </Row>

        <div className="section-break section-break--flip" aria-hidden="true">
          <span className="section-break__diamond" />
        </div>

        {/* Values */}
        <Row className="mb-5 section-fade-in">
          <Col lg={12} className="mb-4">
            <h2 className="display-5 fw-bold text-white mb-2">Our Values</h2>
          </Col>
          {values.map((value, index) => {
            const IconComponent = value.Icon
            return (
              <Col lg={3} md={6} className="mb-4 about-values" key={index}>
                <Card className="h-100 text-center">
                  <Card.Body>
                    <div className="mb-3 about-values-icon">
                      <IconComponent size={48} strokeWidth={1.5} />
                    </div>
                    <Card.Title className="text-white">{value.title}</Card.Title>
                    <Card.Text className="gray-2">{value.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            )
          })}
        </Row>

        {/* Why Choose Us */}
        <Row className="mb-5 section-fade-in">
          <Col lg={12} className="mb-4">
            <h2 className="display-5 fw-bold text-white mb-4">Why Choose Us</h2>
          </Col>
          <Col lg={12}>
            <div className="about-why-choose p-4 p-lg-5 rounded">
              <p className="mb-4 gray-2">
                We do things differently. No premium prices for mediocre service—we go all out for whatever you need. That means more than websites: we cover the full picture.
              </p>
              <p className="mb-4 gray-2">
                From connecting your POS system to wiring up networking in your brick-and-mortar store, we handle every facet of IT infrastructure. One partner, one place.
              </p>
              <p className="mb-0 gray-2">
                We always price fairly. You get serious support and peace of mind at a cost that works for your business—never overcharged, never left in the lurch.
              </p>
            </div>
          </Col>
        </Row>

        <div className="section-break" aria-hidden="true">
          <span className="section-break__diamond" />
        </div>

        {/* Expertise */}
        <Row className="mb-5 section-fade-in about-expertise">
          <Col lg={12} className="text-center mb-4">
            <h2 className="display-5 fw-bold text-white mb-2">Our Expertise</h2>
          </Col>
          <Col lg={6} className="mb-4 text-center">
            <h5>Frontend Development</h5>
            <ProgressBar now={95} className="mb-3" />
            <h5>Backend Development</h5>
            <ProgressBar now={90} className="mb-3" />
            <h5>Mobile Development</h5>
            <ProgressBar now={85} className="mb-3" />
          </Col>
          <Col lg={6} className="mb-4 text-center">
            <h5>UI/UX Design</h5>
            <ProgressBar now={88} className="mb-3" />
            <h5>Cloud Solutions</h5>
            <ProgressBar now={92} className="mb-3" />
            <h5>DevOps</h5>
            <ProgressBar now={87} className="mb-3" />
          </Col>
        </Row>

        <div className="section-break section-break--flip" aria-hidden="true">
          <span className="section-break__diamond" />
        </div>

        {/* CTA – match Home/Services */}
        <Row className="mb-0 section-fade-in">
          <Col lg={8} className="mx-auto text-center">
            <h2 className="display-5 fw-bold mb-3 text-white">Ready to Work With Us?</h2>
            <p className="lead gray-2 mb-4">
              Let's discuss how we can help bring your vision to life with our expertise and passion for technology.
            </p>
            <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
              <Button variant="primary" size="lg" as={Link as any} to="/contact">
                Start a Project
              </Button>
              <Button variant="outline-light" size="lg" as={Link as any} to="/services" className="cta-btn-secondary">
                See Our Services
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </Container>
  )
}

export default About 