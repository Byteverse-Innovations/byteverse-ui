import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import Navigation from './components/common/navigation/navigation'
import Footer from './components/common/footer/Footer'
import Home from './components/home/Home'
import Services from './components/services/Services'
import About from './components/about/About'
import Contact from './components/contact/Contact'
import Login from './components/auth/Login'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './components/admin/AdminDashboard'
import AdminProjects from './components/admin/AdminProjects'
import AdminClients from './components/admin/AdminClients'
import AdminQuotes from './components/admin/AdminQuotes'
import AdminContacts from './components/admin/AdminContacts'
import AdminServices from './components/admin/AdminServices'
import QuotePortal from './components/quote/QuotePortal'

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
            <Route path="/login" element={<Login />} />
            <Route path="/quote/:token" element={<QuotePortal />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="clients" element={<AdminClients />} />
              <Route path="quotes" element={<AdminQuotes />} />
              <Route path="contacts" element={<AdminContacts />} />
              <Route path="services" element={<AdminServices />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
