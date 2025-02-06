import React from 'react';
import { Accordion, Card, Col, Container, Row } from 'react-bootstrap';

const About = () => {
    return (
        <Container className="content-area mt-5 mb-5">
            {/* About Section */}
            <section>
                <h1 className="text-cyan mb-3">About <span className="site-name fs-1">Cinemite</span></h1>

                <Row>
                    <Col md={8}>
                        <p className="lead"><span className="site-name">Cinemite</span> is your ultimate destination for movie and TV show enthusiasts. We're passionate about connecting people with the cinema they love.</p>

                        <h3 className="text-cyan mt-4">Our Mission</h3>
                        <p>We aim to create a comprehensive platform where users can discover, track, and explore the world of cinema and television. Our goal is to make tracking your cinema easier than ever.</p>

                        <h3 className="text-cyan mt-4">What We Offer</h3>
                        <ul>
                            <li>Extensive movie and TV show database</li>
                            <li>Personalized watchlists</li>
                            <li>Trending and top-rated content recommendations</li>
                            <li>User activity tracking</li>
                        </ul>
                    </Col>

                    <Col md={4}>
                        <Card className="secondary-bg tertiary-border">
                            <Card.Body>
                                <Card.Title className="text-cyan">Quick Facts</Card.Title>
                                <ul className="list-unstyled text-gray">
                                    <li><strong>Founded:</strong> 2024</li>
                                    <li><strong>Content Database:</strong> 10,000+ Titles</li>
                                    <li><strong>Active Users:</strong> Growing Community</li>
                                </ul>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </section>

            {/* FAQ Section */}
            <section className="faq-section mt-5">
                <h2 className="text-cyan">Frequently Asked Questions</h2>

                <Accordion className="mt-3" id="faqAccordion">
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>How do I create an account?</Accordion.Header>
                        <Accordion.Body>Creating an account is easy! Click on the profile icon and select 'Log In' which takes you to the login page where you can find 'Sign up'. Fill in your details and you'll be ready to start tracking your favorite movies and TV shows.</Accordion.Body>
                    </Accordion.Item>

                    <Accordion.Item eventKey="1">
                        <Accordion.Header>Is my data safe?</Accordion.Header>
                        <Accordion.Body>We take data privacy seriously. All user data is encrypted, and we never sell personal information to third parties.</Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </section>
        </Container>
    );
};

export default About;
