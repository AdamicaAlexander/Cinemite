import React from 'react';
import { Navbar, Nav, NavDropdown, Container, Form, FormControl, InputGroup, Button } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../utils/authContext';

const Header = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
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
                                <InputGroup>
                                    <FormControl type="search" placeholder="Search..." className="text-bar-dark" aria-label="Search"/>
                                    <Button className="btn-outline-cyan" type="submit">Search</Button>
                                </InputGroup>
                            </Form>

                            {/* Links */}
                            <Nav className="mx-auto">
                                <Nav.Link as={NavLink} to="/movies" className="btn-style">Movie List</Nav.Link>
                                <Nav.Link as={NavLink} to="/shows" className="btn-style">TV Show List</Nav.Link>

                                {/* Browse Dropdown */}
                                <NavDropdown title="Browse" id="browse-dropdown" className="btn-style">
                                    <NavDropdown.Item as={Link} to="/movies">Movies</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/top-movies">Top 100</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/trending-movies">Trending</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item as={Link} to="/shows">TV Shows</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/top-shows">Top 100</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/trending-shows">Trending</NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                        </div>

                        {/* Profile Dropdown */}
                        <Nav className="ms-auto">
                            <NavDropdown title={<img src="/assets/profile-icon.png" alt="Profile" width="30" height="30"/>} id="profile-dropdown" align="end">
                                {user ? (
                                    <>
                                        <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/notifications">Notifications</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/settings">Settings</NavDropdown.Item>
                                        <NavDropdown.Divider />
                                        <NavDropdown.Item onClick={handleLogout}>
                                            Log Out
                                        </NavDropdown.Item>
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
