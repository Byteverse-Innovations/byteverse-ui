import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import Navigation from './components/common/navigation/navigation'
import Footer from './components/common/footer/Footer'
import Home from './components/home/Home'
import Services from './components/services/Services'
import About from './components/about/About'
import Contact from './components/contact/Contact'

const App = () => {
  return (
    <Router>
      <div className="App p-2 p-md-3 p-lg-3 w-100">
        <header className="px-3 px-md-4 px-lg-5 pt-2 pt-md-3">
          <Navigation />
        </header>
        <main className="px-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
