import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Col, Container, Form, Nav, Navbar, NavDropdown, Row } from 'react-bootstrap';

import api from '../utils/axiosConfig';
import { useAuth } from '../utils/authContext';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
    };

    const getProfilePictureSrc = () => {
        if (!user) {
            return '/assets/profile-icon.png';
        }
        if (user.profilePictureUrl.startsWith('uploads/')) {
            return `http://localhost:5000/${user.profilePictureUrl}`;
        }
        return '/assets/profile-icon.png';
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState({ movies: [], tvshows: [] });
    const [showResults, setShowResults] = useState(false);
    const searchTimeoutRef = useRef(null);

    const panelRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        window.addEventListener('mousedown', handleClickOutside);
        return () => window.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (!searchTerm) {
            setSearchResults({ movies: [], tvshows: [] });
            return;
        }
        searchTimeoutRef.current = setTimeout(() => {
            handleSearch(searchTerm);
        }, 300);
        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [searchTerm]);

    const handleSearch = async (term) => {
        try {
            if (!term) {
                setSearchResults({ movies: [], tvshows: [] });
                return;
            }
            const res = await api.get(`/browse?term=${encodeURIComponent(term)}`);
            setSearchResults(res.data);
            setShowResults(true);
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const handleResultClick = (type, title) => {
        navigate(`/${type}/${encodeURIComponent(title)}`);
        setShowResults(false);
        setSearchTerm('');
    };

    return (
        <header>
            <Navbar variant="dark" expand="lg" className="secondary-bg">
                <Container>
                    {/* Logo */}
                    <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
                        <img src="/assets/logo.png" alt="Cinemite" width="50" height="50" />
                        <span className="site-name ms-2">Cinemite</span>
                    </Navbar.Brand>

                    {/* Navbar Toggle */}
                    <Navbar.Toggle aria-controls="main-navbar" />

                    <Navbar.Collapse id="main-navbar">
                        {/* Search and Links */}
                        <div className="d-flex w-100 justify-content-between align-items-center">
                            {/* Search Bar */}
                            <Form className="d-flex mx-auto">
                                <Form.Control type="search" placeholder="Search movies or TV shows..." className="text-bar-dark" aria-label="Search" style={{ width: '28ch' }} value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => {
                                        if (searchResults.movies.length || searchResults.tvshows.length) {
                                            setShowResults(true);
                                        }
                                    }}
                                />

                                {/* Results Panel */}
                                {showResults && (searchResults.movies.length > 0 || searchResults.tvshows.length > 0) && (
                                    <div className='search-results' ref={panelRef}>
                                        <Row>
                                            {/* Left Column: Movies */}
                                            <Col md={6} lg={6}>
                                                <h6 className="text-cyan">Movies</h6>
                                                {searchResults.movies.length === 0 && <p className="text-gray">No matches</p>}
                                                {searchResults.movies.map((movie) => (
                                                    <div key={movie._id} className="d-flex align-items-center mb-2" style={{ cursor: 'pointer' }} onClick={() => handleResultClick('movie', movie.title)}>
                                                        <img src={`http://localhost:5000/${movie.poster_url}`} alt={movie.title} style={{ width: '40px', height: 'auto', marginRight: '8px' }}/>
                                                        <span className="text-white">{movie.title}</span>
                                                    </div>
                                                ))}
                                            </Col>

                                            {/* Right Column: TV Shows */}
                                            <Col md={6} lg={6}>
                                                <h6 className="text-cyan">TV Shows</h6>
                                                {searchResults.tvshows.length === 0 && <p className="text-gray">No matches</p>}
                                                {searchResults.tvshows.map((tv) => (
                                                    <div key={tv._id} className="d-flex align-items-center mb-2" style={{ cursor: 'pointer' }} onClick={() => handleResultClick('tvshow', tv.title)}>
                                                        <img src={`http://localhost:5000/${tv.poster_url}`} alt={tv.title} style={{ width: '40px', height: 'auto', marginRight: '8px' }}/>
                                                        <span className="text-white">{tv.title}</span>
                                                    </div>
                                                ))}
                                            </Col>
                                        </Row>
                                    </div>
                                )}
                            </Form>

                            {/* Links */}
                            <Nav className="mx-auto">
                                <Nav.Link as={NavLink} to="/watchlist/movies" className="btn-style">Movie List</Nav.Link>
                                <Nav.Link as={NavLink} to="/watchlist/tvshows" className="btn-style">TV Show List</Nav.Link>

                                {/* Browse Dropdown */}
                                <NavDropdown title="Browse" id="browse-dropdown" className="btn-style">
                                    <NavDropdown.Item as={Link} to="/browse/movies">Movies</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item as={Link} to="/browse/tvshows">TV Shows</NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                        </div>

                        {/* Profile Dropdown */}
                        <Nav className="ms-auto">
                            <NavDropdown title={<img src={getProfilePictureSrc()} alt="Profile" width="30" height="30"/>} id="profile-dropdown" align="end">
                                {user ? (
                                    <>
                                        <NavDropdown.Item as={Link} to={`/profile/${user.username}`}>Profile</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/settings">Settings</NavDropdown.Item>
                                        <NavDropdown.Divider />
                                        <NavDropdown.Item onClick={handleLogout}>Log Out</NavDropdown.Item>
                                    </>
                                ) : (
                                    <NavDropdown.Item as={Link} to="/login">Log In</NavDropdown.Item>
                                )}
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
};

export default Header;
