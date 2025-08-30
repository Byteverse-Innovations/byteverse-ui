import React from 'react'
import { Container, Row, Col, Card, Badge, ListGroup } from 'react-bootstrap'

const Services: React.FC = () => {
  const services = [
    {
      id: 1,
      title: 'Web Development',
      description: 'Custom web applications built with modern technologies and best practices.',
      features: ['React/Next.js Development', 'Node.js Backend', 'Database Design', 'API Integration', 'Performance Optimization'],
      price: 'Starting at $5,000',
      badge: 'Popular'
    },
    {
      id: 2,
      title: 'Mobile App Development',
      description: 'Native and cross-platform mobile applications for iOS and Android.',
      features: ['React Native', 'Flutter Development', 'Native iOS/Android', 'App Store Deployment', 'Push Notifications'],
      price: 'Starting at $8,000',
      badge: 'Featured'
    },
    {
      id: 3,
      title: 'Cloud Solutions',
      description: 'Scalable cloud infrastructure and DevOps services.',
      features: ['AWS/Azure Setup', 'CI/CD Pipelines', 'Container Orchestration', 'Monitoring & Logging', 'Security Implementation'],
      price: 'Starting at $3,000',
      badge: 'New'
    },
    {
      id: 4,
      title: 'UI/UX Design',
      description: 'User-centered design solutions that enhance user experience.',
      features: ['Wireframing & Prototyping', 'User Research', 'Visual Design', 'Usability Testing', 'Design Systems'],
      price: 'Starting at $2,500',
      badge: 'Design'
    },
    {
      id: 5,
      title: 'Consulting',
      description: 'Strategic technology consulting to help your business grow.',
      features: ['Technology Assessment', 'Architecture Planning', 'Team Training', 'Code Reviews', 'Performance Audits'],
      price: '$150/hour',
      badge: 'Expert'
    },
    {
      id: 6,
      title: 'Maintenance & Support',
      description: 'Ongoing maintenance and support for your applications.',
      features: ['Bug Fixes', 'Security Updates', 'Performance Monitoring', '24/7 Support', 'Regular Backups'],
      price: 'Starting at $500/month',
      badge: 'Support'
    }
  ]

  return (
    <Container fluid className="py-5 bg-deep-cove text-white">
      {/* Header Section */}
      <Row className="mb-5">
        <Col lg={12} className="text-center">
          <h1 className="display-4 fw-bold mb-4">Our Services</h1>
          <p className="lead mb-4">
            Comprehensive technology solutions tailored to your business needs.
            From concept to deployment, we're here to bring your ideas to life.
          </p>
        </Col>
      </Row>

      {/* Services Grid */}
      <Row>
        {services.map((service) => (
          <Col lg={4} md={6} className="mb-4" key={service.id}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Header className="bg-primary text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <Card.Title className="mb-0">{service.title}</Card.Title>
                  <Badge bg="light" text="dark">{service.badge}</Badge>
                </div>
              </Card.Header>
              <Card.Body className="d-flex flex-column bg-deep-cove text-white">
                <Card.Text className="mb-3">{service.description}</Card.Text>
                <ListGroup variant="flush" className="mb-3">
                  {service.features.map((feature, index) => (
                    <ListGroup.Item key={index} className="border-0 px-0">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      {feature}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <div className="mt-auto">
                  <h5 className="text-primary mb-3">{service.price}</h5>
                  <button className="btn btn-outline-primary w-100">
                    Get Started
                  </button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Call to Action */}
      <Row className="mt-5 bg-deep-cove">
        <Col lg={8} className="mx-auto text-center bg-deep-cove">
          <div className="bg-deep-cove p-5 rounded text-white">
            <h2 className="mb-4">Ready to Get Started?</h2>
            <p className="lead mb-4">
              Let's discuss your project requirements and find the perfect solution for your business.
            </p>
            <button className="btn btn-primary btn-lg me-3">
              Schedule a Consultation
            </button>
            <button className="btn btn-outline-secondary btn-lg">
              Download Brochure
            </button>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default Services 