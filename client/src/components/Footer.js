import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="mt-auto secondary-bg w-100">
            <Container className="footer-area py-3">
                <Row className="align-items-center">
                    {/* Brand and Copyright */}
                    <Col xs={12} md={6}><p className="mb-0"><span className="site-name">Cinemite</span> 2024 &copy; All rights reserved.</p></Col>

                    {/* Links */}
                    <Col xs={12} md={6} className="text-md-end">
                        <Link to="/about" className="text-cyan me-3">About</Link>
                        <Link to="/contact" className="text-cyan">Contact</Link>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
