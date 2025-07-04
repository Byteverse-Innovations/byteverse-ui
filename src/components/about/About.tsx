import React from 'react'
import { Container, Row, Col, Card, ProgressBar } from 'react-bootstrap'

const About: React.FC = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      bio: '10+ years in software development and business strategy.',
      image: 'https://via.placeholder.com/150'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'CTO',
      bio: 'Expert in cloud architecture and scalable systems.',
      image: 'https://via.placeholder.com/150'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Lead Designer',
      bio: 'Passionate about creating intuitive user experiences.',
      image: 'https://via.placeholder.com/150'
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'Senior Developer',
      bio: 'Full-stack developer with expertise in modern frameworks.',
      image: 'https://via.placeholder.com/150'
    }
  ]

  const stats = [
    { label: 'Projects Completed', value: 150, suffix: '+' },
    { label: 'Happy Clients', value: 80, suffix: '+' },
    { label: 'Team Members', value: 12, suffix: '' },
    { label: 'Years Experience', value: 8, suffix: '+' }
  ]

  const values = [
    {
      title: 'Innovation',
      description: 'We constantly explore new technologies and methodologies to deliver cutting-edge solutions.',
      icon: '🚀'
    },
    {
      title: 'Quality',
      description: 'Every line of code and every design decision is made with quality and excellence in mind.',
      icon: '⭐'
    },
    {
      title: 'Collaboration',
      description: 'We believe in the power of teamwork and close collaboration with our clients.',
      icon: '🤝'
    },
    {
      title: 'Integrity',
      description: 'Honest communication and transparent processes are the foundation of our relationships.',
      icon: '💎'
    }
  ]

  return (
    <Container fluid className="py-5">
      {/* Hero Section */}
      <Row className="mb-5">
        <Col lg={12} className="text-center">
          <h1 className="display-4 fw-bold mb-4">About Byteverse</h1>
          <p className="lead mb-4">
            We're a passionate team of developers, designers, and strategists dedicated to
            transforming businesses through innovative technology solutions.
          </p>
        </Col>
      </Row>

      {/* Story Section */}
      <Row className="mb-5">
        <Col lg={6} className="mb-4">
          <h2 className="mb-4">Our Story</h2>
          <p className="mb-3">
            Founded in 2016, Byteverse began with a simple mission: to help businesses
            leverage technology to achieve their goals. What started as a small team of
            passionate developers has grown into a full-service technology company.
          </p>
          <p className="mb-3">
            Over the years, we've worked with startups, enterprises, and everything in between.
            Each project has taught us something new and helped us refine our approach to
            delivering exceptional results.
          </p>
          <p>
            Today, we're proud to be trusted technology partners for businesses across
            various industries, helping them navigate the digital landscape and achieve
            sustainable growth.
          </p>
        </Col>
        <Col lg={6} className="mb-4">
          <div className="bg-light p-4 rounded h-100">
            <h3 className="mb-4">Our Mission</h3>
            <p className="mb-3">
              To empower businesses with innovative technology solutions that drive growth,
              efficiency, and competitive advantage in the digital age.
            </p>
            <h3 className="mb-4">Our Vision</h3>
            <p>
              To be the leading technology partner for businesses seeking to transform
              their digital presence and achieve sustainable success through innovative solutions.
            </p>
          </div>
        </Col>
      </Row>

      {/* Stats Section */}
      <Row className="mb-5">
        <Col lg={12}>
          <div className="bg-primary text-white p-5 rounded">
            <Row>
              {stats.map((stat, index) => (
                <Col lg={3} md={6} className="text-center mb-4" key={index}>
                  <h2 className="display-4 fw-bold mb-2">
                    {stat.value}{stat.suffix}
                  </h2>
                  <p className="lead">{stat.label}</p>
                </Col>
              ))}
            </Row>
          </div>
        </Col>
      </Row>

      {/* Values Section */}
      <Row className="mb-5">
        <Col lg={12} className="text-center mb-4">
          <h2 className="mb-4">Our Values</h2>
        </Col>
        {values.map((value, index) => (
          <Col lg={3} md={6} className="mb-4" key={index}>
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body>
                <div className="mb-3">
                  <span style={{ fontSize: '3rem' }}>{value.icon}</span>
                </div>
                <Card.Title>{value.title}</Card.Title>
                <Card.Text>{value.description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Team Section */}
      <Row className="mb-5">
        <Col lg={12} className="text-center mb-4">
          <h2 className="mb-4">Meet Our Team</h2>
          <p className="lead">
            The talented individuals who make Byteverse exceptional
          </p>
        </Col>
        {teamMembers.map((member) => (
          <Col lg={3} md={6} className="mb-4" key={member.id}>
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body>
                <img
                  src={member.image}
                  alt={member.name}
                  className="rounded-circle mb-3"
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
                <Card.Title>{member.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{member.role}</Card.Subtitle>
                <Card.Text>{member.bio}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Skills Section */}
      <Row className="mb-5">
        <Col lg={12} className="text-center mb-4">
          <h2 className="mb-4">Our Expertise</h2>
        </Col>
        <Col lg={6} className="mb-4">
          <h5>Frontend Development</h5>
          <ProgressBar now={95} className="mb-3" />
          <h5>Backend Development</h5>
          <ProgressBar now={90} className="mb-3" />
          <h5>Mobile Development</h5>
          <ProgressBar now={85} className="mb-3" />
        </Col>
        <Col lg={6} className="mb-4">
          <h5>UI/UX Design</h5>
          <ProgressBar now={88} className="mb-3" />
          <h5>Cloud Solutions</h5>
          <ProgressBar now={92} className="mb-3" />
          <h5>DevOps</h5>
          <ProgressBar now={87} className="mb-3" />
        </Col>
      </Row>

      {/* Call to Action */}
      <Row>
        <Col lg={8} className="mx-auto text-center">
          <div className="bg-light p-5 rounded">
            <h2 className="mb-4">Ready to Work With Us?</h2>
            <p className="lead mb-4">
              Let's discuss how we can help bring your vision to life with our expertise and passion for technology.
            </p>
            <button className="btn btn-primary btn-lg me-3">
              Start a Project
            </button>
            <button className="btn btn-outline-secondary btn-lg">
              View Our Work
            </button>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default About 