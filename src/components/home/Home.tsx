import React from 'react'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { Code2, Settings, Cloud, Lock, Check } from 'lucide-react'
import './home.scss'
import { Link } from 'react-router-dom'

const Home: React.FC = () => {
  return (
    <Container fluid className="py-0">
      {/* Header / Hero - same pattern as Contact header */}
      <Row className="mb-0">
        <Col className="d-flex flex-row align-items-center justify-content-center py-5 px-3 px-md-4 px-lg-5">
          <div className="d-flex flex-column">
            <h1 className="display-4 fw-bold mb-4 text-white hero-text">Your Small Business IT Heroes</h1>
            <p className="lead mb-4 gray-2 fs-6 hero-subtitle">
              We turn your wildest tech dreams into reality. No jargon, no BS—just awesome solutions that actually work.
            </p>
            <div className="hero-button">
              <Button variant="primary" size="lg" as={Link as any} to="/about">
                See What We've Built
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <div className="section-break" aria-hidden="true">
        <span className="section-break__diamond" />
      </div>

      {/* Main content: one wrapper with consistent padding (Contact-style) */}
      <div className="home-sections py-5 px-3 px-md-4 px-lg-5">
        {/* Features Section */}
        <Row className="mb-5 section-fade-in">
          <Col lg={12}>
            <h2 className="display-5 fw-bold text-start text-white mb-4">What We're Awesome At</h2>
          </Col>
          <Col lg={3} className="mb-4 card-stagger">
            <Card className="h-100 text-white service-card">
              <Card.Body className="text-center">
                <div className="mb-3 card-icon">
                  <Code2 size={48} strokeWidth={1.5} />
                </div>
                <Card.Title>Custom Development</Card.Title>
                <Card.Text className="gray-2">
                  Got an idea? We'll build it. From web apps to mobile apps, we code solutions that make your life easier and your business better.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} className="mb-4 card-stagger">
            <Card className="h-100 text-white service-card">
              <Card.Body className="text-center">
                <div className="mb-3 card-icon">
                  <Settings size={48} strokeWidth={1.5} />
                </div>
                <Card.Title>IT Infrastructure</Card.Title>
                <Card.Text className="gray-2">
                  Networks, computers, printers—you name it. We'll set it up, fix it when it breaks, and keep everything running smoothly so you can focus on your business.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} className="mb-4 card-stagger">
            <Card className="h-100 text-white service-card">
              <Card.Body className="text-center">
                <div className="mb-3 card-icon">
                  <Cloud size={48} strokeWidth={1.5} />
                </div>
                <Card.Title>Cloud Solutions</Card.Title>
                <Card.Text className="gray-2">
                  Move to the cloud and never look back. We'll get you set up on AWS, Azure, or wherever works best. Scale up, scale down—we've got you covered.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} className="mb-4 card-stagger">
            <Card className="h-100 text-white service-card">
              <Card.Body className="text-center">
                <div className="mb-3 card-icon">
                  <Lock size={48} strokeWidth={1.5} />
                </div>
                <Card.Title>Cybersecurity</Card.Title>
                <Card.Text className="gray-2">
                  Keep the bad guys out. We'll lock down your systems, train your team, and make sure your data stays safe. Sleep better at night knowing you're protected.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="section-break section-break--flip" aria-hidden="true">
          <span className="section-break__diamond" />
        </div>

        {/* About Preview Section */}
        <Row className="mb-5 section-fade-in">
          <Col lg={6} className="mx-auto text-start text-white">
            <h2 className="display-5 fw-bold mb-4 text-white">We Get It. Tech Can Be Overwhelming.</h2>
            <p className="lead gray-2 fs-6">
              That's why we're here. We've been doing this for years, and we've seen it all. Whether you need a simple website,
              a complex app, or someone to fix your printer at 3am (okay, maybe not 3am, but close), we've got your back.
              No tech-speak, no runaround—just real solutions that work.
            </p>
          </Col>
          <Col lg={6} className="d-none d-lg-block text-white why-byteverse">
            <h2 className="mb-3 text-uppercase">Why Byteverse?</h2>
            <ul className="lead">
              <li><Check size={20} strokeWidth={2.5} className="why-byteverse-check me-2" /> We speak human, not robot</li>
              <li><Check size={20} strokeWidth={2.5} className="why-byteverse-check me-2" /> Fast, friendly, and actually helpful</li>
              <li><Check size={20} strokeWidth={2.5} className="why-byteverse-check me-2" /> We've helped tons of businesses succeed</li>
              <li><Check size={20} strokeWidth={2.5} className="why-byteverse-check me-2" /> We care about your success as much as you do</li>
            </ul>
          </Col>
        </Row>

        <div className="section-break" aria-hidden="true">
          <span className="section-break__diamond" />
        </div>

        {/* How We Work Section */}
        <Row className="mb-5 section-fade-in">
          <Col lg={12} className="text-center mb-4">
            <h2 className="display-5 fw-bold text-white mb-3">How We Work</h2>
            <p className="lead gray-2 mb-5">Simple process, awesome results</p>
          </Col>
          <Col md={3} className="mb-4 mb-md-0 how-we-work-item">
            <div className="step-number">1</div>
            <h5 className="text-white mb-3">Tell Us What You Need</h5>
            <p className="gray-2">
              Share your idea, problem, or dream. We'll listen and ask the right questions to understand what you're really after.
            </p>
          </Col>
          <Col md={3} className="mb-4 mb-md-0 how-we-work-item">
            <div className="step-number">2</div>
            <h5 className="text-white mb-3">We Plan It Out</h5>
            <p className="gray-2">
              We'll create a roadmap that makes sense. No surprises, no hidden costs—just a clear plan to get you where you want to go.
            </p>
          </Col>
          <Col md={3} className="mb-4 mb-md-0 how-we-work-item">
            <div className="step-number">3</div>
            <h5 className="text-white mb-3">We Build It</h5>
            <p className="gray-2">
              Time to make it happen. We'll keep you in the loop every step of the way, so you always know what's going on.
            </p>
          </Col>
          <Col md={3} className="mb-4 mb-md-0 how-we-work-item">
            <div className="step-number">4</div>
            <h5 className="text-white mb-3">You Launch & Grow</h5>
            <p className="gray-2">
              Launch day! We'll be there to help, and we'll stick around to make sure everything keeps running smoothly.
            </p>
          </Col>
        </Row>

        <div className="section-break section-break--flip" aria-hidden="true">
          <span className="section-break__diamond" />
        </div>

        {/* Final CTA Section */}
        <Row className="mb-0 section-fade-in">
          <Col lg={8} className="mx-auto text-center">
            <h2 className="display-5 fw-bold mb-3 text-white">Ready to Level Up Your Business?</h2>
            <p className="lead gray-2 mb-4">
              Let's chat about how we can help you crush your goals. No pressure, just a friendly conversation about your tech needs.
            </p>
            <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
              <Button variant="primary" size="lg" as={Link as any} to="/contact">
                Get Started Today
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

export default Home
