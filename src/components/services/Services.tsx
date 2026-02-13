import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Badge, ListGroup, Spinner, Alert, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useListAllServicesQuery } from '../../api/operations/ops'
import './services.scss'

const Services: React.FC = () => {
  const [graphqlClient, setGraphqlClient] = useState<any>(null)

  useEffect(() => {
    const fetchGraphqlClient = async () => {
      const graphqlClientModule = await import('../../api/clients/graphql-client.mjs')
      setGraphqlClient(graphqlClientModule.default)
    }
    fetchGraphqlClient()
  }, [])
  const { data, isLoading, isError, error } = useListAllServicesQuery(graphqlClient)

  return (
    <Container fluid className="py-0">
      {/* Hero – same padding and pattern as Home */}
      <Row className="mb-0">
        <Col className="d-flex flex-row align-items-center justify-content-center py-5 px-3 px-md-4 px-lg-5">
          <div className="d-flex flex-column text-center services-hero">
            <h1 className="display-4 fw-bold mb-4 text-white">Our Services</h1>
            <p className="lead mb-0 gray-2 fs-6">
              Comprehensive technology solutions tailored to your business needs.
              From concept to deployment, we're here to bring your ideas to life.
            </p>
          </div>
        </Col>
      </Row>

      <div className="section-break" aria-hidden="true">
        <span className="section-break__diamond" />
      </div>

      {/* Main content – same padding as Home */}
      <div className="py-5 px-3 px-md-4 px-lg-5">
        {/* Loading State */}
        {isLoading && (
          <Row className="justify-content-center">
            <Col className="text-center">
              <Spinner animation="border" role="status" variant="light">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3 text-white">Loading services...</p>
            </Col>
          </Row>
        )}

        {/* Error State */}
        {isError && (
          <Row className="justify-content-center">
            <Col md={8}>
              <Alert variant="danger">
                <Alert.Heading>Error Loading Services</Alert.Heading>
                <p>{error instanceof Error ? error.message : 'Failed to load services. Please try again later.'}</p>
              </Alert>
            </Col>
          </Row>
        )}

        {/* Services Grid */}
        {data?.listAllServices && data.listAllServices.length > 0 && (
          <Row className="section-fade-in">
            {data.listAllServices
              .filter(service => service.showOnMainSite !== false)
              .map((service) => (
                <Col lg={4} md={6} className="mb-4 card-stagger" key={service.id}>
                  <Card className="h-100 text-white service-card">
                    <Card.Header>
                      <div className="d-flex justify-content-between align-items-center">
                        <Card.Title className="mb-0">{service.name}</Card.Title>
                        {service.category && (
                          <Badge bg="primary" className="opacity-75">{service.category}</Badge>
                        )}
                      </div>
                    </Card.Header>
                    <Card.Body className="d-flex flex-column">
                      <Card.Text className="mb-3 gray-2">{service.description}</Card.Text>

                      <ListGroup variant="flush" className="mb-3">
                        {service.servicePillar && (
                          <ListGroup.Item className="border-0 px-0">
                            <i className="bi bi-layers-fill me-2" />
                            <strong>Pillar:</strong> {service.servicePillar}
                          </ListGroup.Item>
                        )}
                        {service.estimatedDuration && (
                          <ListGroup.Item className="border-0 px-0">
                            <i className="bi bi-clock-fill me-2" />
                            <strong>Duration:</strong> {service.estimatedDuration}
                          </ListGroup.Item>
                        )}
                        {service.pricingModel && (
                          <ListGroup.Item className="border-0 px-0">
                            <i className="bi bi-currency-dollar me-2" />
                            <strong>Pricing:</strong> {service.pricingModel}
                          </ListGroup.Item>
                        )}
                        {service.targetClient && service.targetClient.length > 0 && (
                          <ListGroup.Item className="border-0 px-0">
                            <i className="bi bi-people-fill me-2" />
                            <strong>Target:</strong> {service.targetClient.join(', ')}
                          </ListGroup.Item>
                        )}
                      </ListGroup>

                      <div className="mt-auto">
                        {service.price && (
                          <h5 className="text-white mb-3">${service.price}</h5>
                        )}
                        <Button variant="primary" as={Link as any} to="/contact" className="w-100">
                          Get Started
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
          </Row>
        )}

        {/* No Services State */}
        {data?.listAllServices && data.listAllServices.length === 0 && !isLoading && (
          <Row className="justify-content-center">
            <Col md={8} className="text-center">
              <Alert variant="info">
                <Alert.Heading>No Services Available</Alert.Heading>
                <p>No services are currently available. Please check back later.</p>
              </Alert>
            </Col>
          </Row>
        )}

        <div className="section-break section-break--flip" aria-hidden="true">
          <span className="section-break__diamond" />
        </div>

        {/* CTA – match Home */}
        <Row className="mb-0 section-fade-in">
          <Col lg={8} className="mx-auto text-center">
            <h2 className="display-5 fw-bold mb-3 text-white">Ready to Get Started?</h2>
            <p className="lead gray-2 mb-4">
              Let's discuss your project requirements and find the perfect solution for your business.
            </p>
            <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
              <Button variant="primary" size="lg" as={Link as any} to="/contact">
                Schedule a Consultation
              </Button>
              <Button variant="outline-light" size="lg" as={Link as any} to="/about" className="cta-btn-secondary">
                Learn About Us
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </Container>
  )
}

export default Services 