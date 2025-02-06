import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';

const Home = () => {
    return (
        <Container className="content-area mt-5">
            {/* Featured Section */}
            <section className="featured">
                <h2 className="text-cyan">Featured</h2>
                <Row>
                    <Col md={6}>
                        <Card className="featured-item border-0">
                            <Card.Img src="/assets/featured1.jpg" className="featured-img img-fluid" alt="Featured Content 1"/>
                            <Card.Body className="featured-text">
                                <Card.Title>Interstellar</Card.Title>
                                <Card.Text className="text-white">When Earth becomes uninhabitable, an ex-NASA pilot, Joseph Cooper, pilots a spacecraft to find a new home for humanity.</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={6}>
                        <Card className="featured-item border-0">
                            <Card.Img src="/assets/featured2.jpg" className="featured-img img-fluid" alt="Featured Content 2"/>
                            <Card.Body className="featured-text">
                                <Card.Title>Rick and Morty</Card.Title>
                                <Card.Text className="text-white">The domestic life of a mad scientist and his anxious grandson, combined with their wild inter-dimensional adventures.</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </section>

            {/* Watchlist Section */}
            <section className="watchlist mt-5">
                <h2 className="text-cyan">From Your Watchlist</h2>
                <p>Shows you're watching and upcoming movies (coming soon).</p>
            </section>

            {/* Activity Section */}
            <section className="activity mt-5 mb-5">
                <h2 className="text-cyan">Your Latest Activity</h2>
                <p>Recent activity (coming soon).</p>
            </section>
        </Container>
    );
};

export default Home;
