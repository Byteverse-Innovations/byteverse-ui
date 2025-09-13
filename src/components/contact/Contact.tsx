import React, { useState } from 'react'
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap'

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData)
    setSubmitted(true)
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      subject: '',
      message: ''
    })
  }

  const contactInfo = [
    {
      icon: '📍',
      title: 'Address',
      content: '123 Tech Street, Innovation District, San Francisco, CA 94105'
    },
    {
      icon: '📧',
      title: 'Email',
      content: 'hello@byteverse.com'
    },
    {
      icon: '📞',
      title: 'Phone',
      content: '+1 (555) 123-4567'
    },
    {
      icon: '🕒',
      title: 'Business Hours',
      content: 'Monday - Friday: 9:00 AM - 6:00 PM PST'
    }
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
    <Container fluid className="py-5">
      {/* Header Section */}
      <Row className="mb-5">
        <Col lg={12} className="text-center">
          <h1 className="display-4 fw-bold mb-4">Get In Touch</h1>
          <p className="lead mb-4">
            Ready to start your next project? We'd love to hear from you.
            Let's discuss how we can help bring your ideas to life.
          </p>
        </Col>
      </Row>

      <Row>
        {/* Contact Form */}
        <Col lg={8} className="mb-5">
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0">Send us a Message</h3>
            </Card.Header>
            <Card.Body className="p-4">
              {submitted && (
                <Alert variant="success" className="mb-4">
                  Thank you for your message! We'll get back to you within 24 hours.
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
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
                  <Col md={6} className="mb-3">
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
                  <Col md={6} className="mb-3">
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
                  <Col md={6} className="mb-3">
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
                  <Col md={12} className="mb-3">
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
                  <Col md={12} className="mb-3">
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

                <Button variant="primary" type="submit" size="lg" className="w-100">
                  Send Message
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Contact Information */}
        <Col lg={4} className="mb-5">
          <div className="sticky-top" style={{ top: '2rem' }}>
            {/* Contact Info Cards */}
            {contactInfo.map((info, index) => (
              <Card key={index} className="mb-3 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-start">
                    <div className="me-3">
                      <span style={{ fontSize: '1.5rem' }}>{info.icon}</span>
                    </div>
                    <div>
                      <h6 className="mb-1">{info.title}</h6>
                      <p className="mb-0 text-muted">{info.content}</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}

            {/* Services Offered */}
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-secondary text-white">
                <h5 className="mb-0">Services We Offer</h5>
              </Card.Header>
              <Card.Body>
                <ul className="list-unstyled mb-0">
                  {services.map((service, index) => (
                    <li key={index} className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      {service}
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Additional Contact Methods */}
      <Row className="mt-5">
        <Col lg={12}>
          <div className="bg-light p-5 rounded">
            <Row>
              <Col lg={4} className="text-center mb-4">
                <div className="mb-3">
                  <span style={{ fontSize: '3rem' }}>💬</span>
                </div>
                <h5>Live Chat</h5>
                <p className="text-muted">Chat with us in real-time during business hours</p>
                <Button variant="outline-primary">Start Chat</Button>
              </Col>
              <Col lg={4} className="text-center mb-4">
                <div className="mb-3">
                  <span style={{ fontSize: '3rem' }}>📅</span>
                </div>
                <h5>Schedule a Call</h5>
                <p className="text-muted">Book a consultation call at your convenience</p>
                <Button variant="outline-primary">Book Now</Button>
              </Col>
              <Col lg={4} className="text-center mb-4">
                <div className="mb-3">
                  <span style={{ fontSize: '3rem' }}>📋</span>
                </div>
                <h5>Request Quote</h5>
                <p className="text-muted">Get a detailed quote for your project</p>
                <Button variant="outline-primary">Get Quote</Button>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      {/* FAQ Section */}
      <Row className="mt-5">
        <Col lg={8} className="mx-auto">
          <h2 className="text-center mb-4">Frequently Asked Questions</h2>
          <div className="accordion" id="faqAccordion">
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                  What is your typical project timeline?
                </button>
              </h2>
              <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  Project timelines vary depending on complexity and scope. A simple website might take 2-4 weeks, while a complex web application could take 3-6 months. We'll provide a detailed timeline during our initial consultation.
                </div>
              </div>
            </div>
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                  Do you provide ongoing support after project completion?
                </button>
              </h2>
              <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  Yes, we offer various maintenance and support packages to ensure your application continues to run smoothly after launch. This includes bug fixes, security updates, and performance monitoring.
                </div>
              </div>
            </div>
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                  What technologies do you specialize in?
                </button>
              </h2>
              <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  We work with modern technologies including React, Node.js, Python, AWS, and more. Our team stays current with the latest trends and best practices to deliver optimal solutions.
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default Contact 