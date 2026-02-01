import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Badge, ListGroup, Spinner, Alert } from 'react-bootstrap'
import { useListAllServicesQuery } from '../../api/operations/ops'

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
    <Container fluid className="py-5 bg-deep-cove">
      {/* Header Section */}
      <Row className="mb-5">
        <Col lg={12} className="text-center">
          <h1 className="display-4 fw-bold mb-4 text-white">Our Services</h1>
          <p className="lead mb-4 gray-2">
            Comprehensive technology solutions tailored to your business needs.
            From concept to deployment, we're here to bring your ideas to life.
          </p>
        </Col>
      </Row>

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
        <Row>
          {data.listAllServices
            .filter(service => service.showOnMainSite !== false)
            .map((service) => (
              <Col lg={4} md={6} className="mb-4" key={service.id}>
                <Card className="h-100 border-0 bg-white">
                  <Card.Header className="bg-primary text-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <Card.Title className="mb-0">{service.name}</Card.Title>
                      {service.category && (
                        <Badge bg="light" text="dark">{service.category}</Badge>
                      )}
                    </div>
                  </Card.Header>
                  <Card.Body className="d-flex flex-column bg-deep-cove text-white">
                    <Card.Text className="mb-3">{service.description}</Card.Text>

                    {/* Service Details */}
                    <ListGroup variant="flush" className="mb-3">
                      {service.servicePillar && (
                        <ListGroup.Item className="border-0 px-0 bg-deep-cove text-white">
                          <i className="bi bi-layers-fill text-primary me-2"></i>
                          <strong>Pillar:</strong> {service.servicePillar}
                        </ListGroup.Item>
                      )}
                      {service.estimatedDuration && (
                        <ListGroup.Item className="border-0 px-0 bg-deep-cove text-white">
                          <i className="bi bi-clock-fill text-warning me-2"></i>
                          <strong>Duration:</strong> {service.estimatedDuration}
                        </ListGroup.Item>
                      )}
                      {service.pricingModel && (
                        <ListGroup.Item className="border-0 px-0 bg-deep-cove text-white">
                          <i className="bi bi-currency-dollar text-success me-2"></i>
                          <strong>Pricing:</strong> {service.pricingModel}
                        </ListGroup.Item>
                      )}
                      {service.targetClient && service.targetClient.length > 0 && (
                        <ListGroup.Item className="border-0 px-0 bg-deep-cove text-white">
                          <i className="bi bi-people-fill text-info me-2"></i>
                          <strong>Target:</strong> {service.targetClient.join(', ')}
                        </ListGroup.Item>
                      )}
                    </ListGroup>

                    <div className="mt-auto">
                      {service.price && (
                        <h5 className="text-white mb-3">${service.price}</h5>
                      )}
                      <button className="btn btn-outline-primary w-100 bg-primary text-white">
                        Get Started
                      </button>
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

      {/* Call to Action */}
      <Row className="mt-5 bg-deep-cove">
        <Col lg={8} className="mx-auto text-center bg-deep-cove">
          <div className="bg-deep-cove p-5 rounded text-white">
            <h2 className="mb-4">Ready to Get Started?</h2>
            <p className="lead mb-4">
              Let's discuss your project requirements and find the perfect solution for your business.
            </p>
            <div className="d-flex flex-column gap-2 align-items-center">
              <button className="btn btn-primary btn-lg">
                Schedule a Consultation
              </button>
              <button className="btn btn-outline-secondary btn-lg disabled">
                Download Brochure
              </button>
            </div>

          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default Services 