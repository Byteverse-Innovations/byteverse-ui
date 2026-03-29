import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Badge, ListGroup, Spinner, Alert, Accordion } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useListAllServicesQuery } from '../../api/operations/ops'
import { groupBy } from 'lodash'
import './services.scss'

const Services: React.FC = () => {
  const [graphqlClient, setGraphqlClient] = useState<any>(null)
  const [categorizedServices, setCategorizedServices] = useState<{ [key: string]: any[]} | null>(null)
  const { data, isLoading, isError, error } = useListAllServicesQuery(graphqlClient)

  useEffect(() => {
    const fetchGraphqlClient = async () => {
      const graphqlClientModule = await import('../../api/clients/graphql-client.mjs')
      setGraphqlClient(graphqlClientModule.default)
    }
    fetchGraphqlClient()
  }, [])

  useEffect(() => {
    if (data?.listAllServices.length) {
      setCategorizedServices(groupBy(data.listAllServices, 'category'))
    }
  }, [data])

  return (
    <Container fluid className="py-0 site-page">
      {/* Hero */}
      <Row className="mb-0">
        <Col className="d-flex flex-row align-items-center justify-content-center page-hero-wrap px-3 px-md-4 px-lg-5">
          <div className="d-flex flex-column text-center page-hero">
            <h1 className="page-hero__title text-white">Our Services</h1>
            <p className="page-hero__lead mb-0 gray-2">
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
      <div className="page-main px-3 px-md-4 px-lg-5">
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
        {!!categorizedServices && categorizedServices !== null && (
          <div className="fade-in">
            <div className="page-section-intro text-center mx-auto mb-4">
              <p className="page-section-kicker mb-0">What we offer</p>
              <h2 className="page-section-heading text-white">
                Browse services by category
              </h2>
              <p className="page-section-lead gray-2 mb-0">
                Each category groups related capabilities—from discovery and build to ongoing support. Open a
                section to see offerings, timelines, and how we price engagements. When you&apos;re ready,
                reach out and we&apos;ll shape a plan around your goals.
              </p>
            </div>
            <Accordion>
              {Object.entries(categorizedServices).map(([category, services], currIndex) => (
                <Accordion.Item eventKey={`service-${currIndex}`} key={`service-cat-${currIndex}`}>
                  <Accordion.Header>{category}</Accordion.Header>
                  <Accordion.Body>
                    <Row className="g-4">
                      {services.map((prop, i) => (
                        <Col lg={4} md={6} sm={12} key={prop.id} className="d-flex">
                          <Card className="h-100 w-100 service-card service-card--catalog text-white shadow-sm">
                            <Card.Header>
                              <div className="d-flex justify-content-between align-items-center">
                                <Card.Title className="mb-0 text-white">{prop.name}</Card.Title>
                                {prop.category && (
                                  <Badge bg="primary" className="opacity-75">{prop.category}</Badge>
                                )}
                              </div>
                            </Card.Header>
                            <Card.Body className="d-flex flex-column">
                              <Card.Text className="mb-3 gray-2">{prop.description}</Card.Text>

                              <ListGroup variant="flush" className="mb-3">
                                {prop.servicePillar && (
                                  <ListGroup.Item className="border-0 px-0 bg-transparent text-white">
                                    <i className="bi bi-layers-fill me-2" />
                                    <strong>Pillar:</strong> {prop.servicePillar}
                                  </ListGroup.Item>
                                )}
                                {prop.estimatedDuration && (
                                  <ListGroup.Item className="border-0 px-0 bg-transparent text-white">
                                    <i className="bi bi-clock-fill me-2" />
                                    <strong>Duration:</strong> {prop.estimatedDuration}
                                  </ListGroup.Item>
                                )}
                                {prop.pricingModel && (
                                  <ListGroup.Item className="border-0 px-0 bg-transparent text-white">
                                    <i className="bi bi-currency-dollar me-2" />
                                    <strong>Pricing:</strong> {prop.pricingModel}
                                  </ListGroup.Item>
                                )}
                                {prop.targetClient && prop.targetClient.length > 0 && (
                                  <ListGroup.Item className="border-0 px-0 bg-transparent text-white">
                                    <i className="bi bi-people-fill me-2" />
                                    <strong>Target:</strong> {prop.targetClient.join(', ')}
                                  </ListGroup.Item>
                                )}
                              </ListGroup>

                              <div className="mt-auto">
                                {prop.price !== undefined && prop.price !== null && (
                                  <h5 className="text-white mb-3">{String(prop.price)}</h5>
                                )}
                                <Link className="btn btn-primary w-100" to="/contact">
                                  Get Started
                                </Link>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
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

        {/* CTA — same scale as catalog intro */}
        <Row className="mb-0 section-fade-in page-cta-row">
          <Col lg={8} className="mx-auto text-center">
            <h2 className="page-section-heading text-white">Ready to Get Started?</h2>
            <p className="page-section-lead gray-2 mb-3">
              Let's discuss your project requirements and find the perfect solution for your business.
            </p>
            <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
              <Link className="btn btn-primary btn-lg" to="/contact">
                Schedule a Consultation
              </Link>
              <Link className="btn btn-outline-light btn-lg cta-btn-secondary" to="/about">
                Learn About Us
              </Link>
            </div>
          </Col>
        </Row>
      </div>
    </Container>
  )
}

export default Services 