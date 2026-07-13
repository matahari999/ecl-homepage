import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingButtons from './components/FloatingButtons';
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Contact from './pages/Contact';
import Testimonials from './pages/Testimonials';
import Blog from './pages/Blog';
import Quote from './pages/Quote';

function App() {
  return (
    <HelmetProvider>
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/postpaid-mutual-aid" element={<ServiceDetail category="postpaid-mutual-aid" />} />
            <Route path="/services/nursing-hospital" element={<ServiceDetail category="nursing-hospital" />} />
            <Route path="/services/home-care" element={<ServiceDetail category="home-care" />} />
            <Route path="/services/*" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/quote" element={<Quote />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <FloatingButtons />
      </div>
    </Router>
    </HelmetProvider>
  );
}

export default App;
