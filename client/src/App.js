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
import Registration from './pages/Registration';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Title from './pages/Title';
import Browse from './pages/Browse';
import AdminTitle from "./pages/AdminTitle";
import Watchlist from "./pages/Watchlist";

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
                            <Route path="/profile/:username" element={<Profile />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/:type/:title" element={<Title />} />
                            <Route path="/browse/:type" element={<Browse />} />
                            <Route path="/admin/add-title/:type" element={<AdminTitle />} />
                            <Route path="/admin/edit/:type/:title" element={<AdminTitle />} />
                            <Route path="/watchlist/:type" element={<Watchlist />} />
                        </Routes>
                    </main>

                    <Footer/>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
