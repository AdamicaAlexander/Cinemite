import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './utils/authContext';

// Import components
import Header from './components/Header';
import Footer from './components/Footer';

// Import pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Registration from "./pages/Registration";

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <div className="App d-flex flex-column min-vh-100 dark-theme">
                    <Header/>

                    <main className="flex-grow-1">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/registration" element={<Registration />} />
                        </Routes>
                    </main>

                    <Footer/>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;