import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import Navigation from './components/common/navigation/navigation'
import Footer from './components/common/footer/Footer'
import Home from './components/home/Home'
import Services from './components/services/Services'
import About from './components/about/About'
import Contact from './components/contact/Contact'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Card } from 'react-bootstrap'

const App = () => {
  return (
    <Router>
      <div className="App p-3 p-md-4 p-lg-5">
        <Card className='bg-deep-cove w-100' style={{ border: 'none' }}>
          <Card.Header className="px-3 px-md-4 px-lg-5 pt-2 pt-md-3">
            <Navigation />
          </Card.Header>
          <Card.Body className="px-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </Card.Body>
          <Card.Footer style={{ padding: 0, borderTop: '1px solid rgba(75, 75, 77, 0.5)' }}>
            <Footer />
          </Card.Footer>
        </Card>
      </div>
    </Router>
  )
}

export default App