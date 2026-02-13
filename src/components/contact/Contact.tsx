import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Form, Card, Alert, Accordion } from 'react-bootstrap'
import { MapPin, Mail, Phone, Clock, MessageCircle, Calendar, FileText, CheckCircle } from 'lucide-react'
import { useSubmitContactFormMutation } from '../../api/operations/ops'
import './contact.scss'

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [graphqlClient, setGraphqlClient] = useState<any>(null)
  const [clientReady, setClientReady] = useState(false)

  useEffect(() => {
    const fetchGraphqlClient = async () => {
      const graphqlClientModule = await import('../../api/clients/graphql-client.mjs')
      setGraphqlClient(graphqlClientModule.default)
      setClientReady(true)
    }
    fetchGraphqlClient()
  }, [])

  // Use a placeholder client for hook initialization (hooks must always be called)
  const placeholderClient = graphqlClient || ({ request: async () => ({}) } as any)
  const { mutateAsync } = useSubmitContactFormMutation(placeholderClient)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clientReady || !graphqlClient) {
      setError('GraphQL client not initialized. Please refresh the page.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSubmitted(false)

    try {
      const result = await mutateAsync({
        input: formData
      })

      if (result.submitContactForm?.success) {
        setSubmitted(true)
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          subject: '',
          message: ''
        })
      } else {
        setError('Failed to send message. Please try again.')
      }
    } catch (err) {
      console.error('Error submitting contact form:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    { Icon: MapPin, title: 'Address', content: '2414 Scott Street, Hollywood FL 33020' },
    { Icon: Mail, title: 'Email', content: 'reach@byteverseinnov.com', clickable: true },
    { Icon: Phone, title: 'Phone', content: '+1 (954) 261-3838', clickable: true },
    { Icon: Clock, title: 'Business Hours', content: 'Monday - Friday: 9:00 AM - 6:00 PM EST' },
  ]

  const services = [
    'Web Development',
    'Mobile App Development',
    'Cloud Solutions',
    'UI/UX Design',
    'Consulting',
    'Maintenance & Support'
  ]

  return (
    <Container fluid className="py-0">
      {/* Hero – same pattern as Home/Services/About */}
      <Row className="mb-0">
        <Col className="d-flex flex-row align-items-center justify-content-center py-5 px-3 px-md-4 px-lg-5">
          <div className="d-flex flex-column text-center contact-hero">
            <h1 className="display-4 fw-bold mb-4 text-white">Get In Touch</h1>
            <p className="lead mb-0 gray-2 fs-6">
              Ready to start your next project? We'd love to hear from you.
              Let's discuss how we can help bring your ideas to life.
            </p>
          </div>
        </Col>
      </Row>

      <div className="section-break" aria-hidden="true">
        <span className="section-break__diamond" />
      </div>

      <div className="py-5 px-3 px-md-4 px-lg-5">
        <Row>
          {/* Contact Form */}
          <Col lg={8} className="mb-5">
            <Card className="contact-form-card">
              <Card.Header>
                <h3 className="mb-0">Send us a Message</h3>
              </Card.Header>
              <Card.Body className="p-4">
                {submitted && (
                  <Alert variant="success" className="mb-4">
                    Thank you for your message! We'll get back to you within 24 hours.
                  </Alert>
                )}

                {error && (
                  <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6} className="mb-3 gray-2">
                      <Form.Group>
                        <Form.Label>Full Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Enter your full name"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3 gray-2">
                      <Form.Group>
                        <Form.Label>Email Address *</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="Enter your email"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6} className="mb-3 gray-2">
                      <Form.Group>
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Enter your phone number"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3 gray-2">
                      <Form.Group>
                        <Form.Label>Company</Form.Label>
                        <Form.Control
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="Enter your company name"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12} className="mb-3 gray-2">
                      <Form.Group>
                        <Form.Label>Subject *</Form.Label>
                        <Form.Select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select a subject</option>
                          <option value="Web Development">Web Development</option>
                          <option value="Mobile App Development">Mobile App Development</option>
                          <option value="Cloud Solutions">Cloud Solutions</option>
                          <option value="UI/UX Design">UI/UX Design</option>
                          <option value="Consulting">Consulting</option>
                          <option value="Maintenance & Support">Maintenance & Support</option>
                          <option value="General Inquiry">General Inquiry</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12} className="mb-3 gray-2">
                      <Form.Group>
                        <Form.Label>Message *</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          placeholder="Tell us about your project or inquiry..."
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <button type="submit" className="btn btn-primary btn-lg w-100" disabled={isSubmitting || !clientReady}>
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Contact Information */}
          <Col lg={4} className="mb-5">
            <div className="sticky-top" style={{ top: '2rem' }}>
              {contactInfo.map((info, index) => {
                const IconComponent = info.Icon
                const isPhone = info.title === 'Phone'

                return (
                  <Card key={index} className="mb-3 contact-info-card">
                    <Card.Body className="rounded">
                      <div className="d-flex align-items-start">
                        <div className="me-3 contact-info-icon">
                          <IconComponent size={22} strokeWidth={1.5} />
                        </div>
                        <div>
                          <h6 className="mb-1 text-white">{info.title}</h6>
                          {info?.clickable ? <a href={`${isPhone ? 'tel' : 'mailto'}:${info.content}`}><p className="mb-0 gray-2">{info.content}</p></a> : <p className="mb-0 gray-2">{info.content}</p>}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                )
              })}
              <Card className="contact-services-card">
                <Card.Header>
                  <h5 className="mb-0">Services We Offer</h5>
                </Card.Header>
                <Card.Body>
                  <ul className="list-unstyled mb-0">
                    {services.map((service, index) => (
                      <li key={index} className="mb-2 text-white d-flex align-items-center">
                        <CheckCircle size={18} className="text-primary me-2 flex-shrink-0" strokeWidth={2} />
                        {service}
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>

        {/* Additional Contact Methods – coming soon */}
        <Row className="mt-5 contact-methods section-fade-in">
          <Col lg={4} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body className="p-4">
                <div className="mb-3 contact-methods-icon">
                  <MessageCircle size={48} strokeWidth={1.5} />
                </div>
                <h5 className="text-white fw-bold">Live Chat</h5>
                <p className="gray-2">Chat with us in real-time during business hours</p>
                <p className="small text-white-50 mb-2">This will be available soon.</p>
                <button type="button" className="btn btn-outline-light contact-methods-btn" disabled>Start Chat</button>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body className="p-4">
                <div className="mb-3 contact-methods-icon">
                  <Calendar size={48} strokeWidth={1.5} />
                </div>
                <h5 className="text-white fw-bold">Schedule a Call</h5>
                <p className="gray-2">Book a consultation call at your convenience</p>
                <p className="small text-white-50 mb-2">This will be available soon.</p>
                <button type="button" className="btn btn-outline-light contact-methods-btn" disabled>Book Now</button>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body className="p-4">
                <div className="mb-3 contact-methods-icon">
                  <FileText size={48} strokeWidth={1.5} />
                </div>
                <h5 className="text-white fw-bold">Request Quote</h5>
                <p className="gray-2">Get a detailed quote for your project</p>
                <p className="small text-white-50 mb-2">This will be available soon.</p>
                <button type="button" className="btn btn-outline-light contact-methods-btn" disabled>Get Quote</button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="section-break section-break--flip" aria-hidden="true">
          <span className="section-break__diamond" />
        </div>

        {/* FAQ */}
        <Row className="mt-5 section-fade-in">
          <Col lg={8} className="mx-auto">
            <h2 className="display-5 fw-bold text-center mb-4 text-white">Frequently Asked Questions</h2>
            <Accordion defaultActiveKey="0" className="contact-faq">
              <Accordion.Item eventKey="0">
                <Accordion.Header>What is your typical project timeline?</Accordion.Header>
                <Accordion.Body>
                  Project timelines vary depending on complexity and scope. A simple website might take 2-4 weeks, while a complex web application could take 3-6 months. We'll provide a detailed timeline during our initial consultation.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>Do you provide ongoing support after project completion?</Accordion.Header>
                <Accordion.Body>
                  Yes, we offer various maintenance and support packages to ensure your application continues to run smoothly after launch. This includes bug fixes, security updates, and performance monitoring.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="2">
                <Accordion.Header>What technologies do you specialize in?</Accordion.Header>
                <Accordion.Body>
                  We work with modern technologies including React, Node.js, Python, AWS, and more. Our team stays current with the latest trends and best practices to deliver optimal solutions.
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Col>
        </Row>
      </div>
    </Container>
  )
}

export default Contact 