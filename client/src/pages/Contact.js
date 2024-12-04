import React from 'react';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { contactValidationSchema } from '../utils/formValidation';

const Contact = () => {
    // Initial form values
    const initialValues = {
        name: '',
        email: '',
        subject: '',
        message: ''
    };

    // Handle form submission
    const handleSubmit = (values, { setSubmitting, resetForm }) => {
        console.log('Form submitted:', values);
        setTimeout(() => {
            alert('Message sent successfully!');
            setSubmitting(false);
            resetForm();
        }, 400);
    };

    return (
        <Container className="content-area mt-5 mb-5">
            <section className="contact-section">
                <h1 className="text-cyan mb-4">Contact Us</h1>

                <Formik initialValues={initialValues} validationSchema={contactValidationSchema} onSubmit={handleSubmit}>
                    {({ isSubmitting, errors, touched }) => (
                        <FormikForm>
                            <Row>
                                {/* Contact Form */}
                                <Col md={6}>
                                    <div className="contact-form">
                                        <Form.Group className="mb-3" controlId="name">
                                            <Form.Label>Full Name</Form.Label>
                                            <Field type="text" name="name" className={`form-control text-bar-dark ${touched.name && errors.name ? 'is-invalid' : ''}`} placeholder="Enter your full name"/>
                                            <ErrorMessage name="name" component="div" className="invalid-feedback"/>
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="email">
                                            <Form.Label>Email Address</Form.Label>
                                            <Field type="email" name="email" className={`form-control text-bar-dark ${touched.email && errors.email ? 'is-invalid' : ''}`} placeholder="Enter your email"/>
                                            <ErrorMessage name="email" component="div" className="invalid-feedback"/>
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="subject">
                                            <Form.Label>Subject</Form.Label>
                                            <Field as={Form.Select} name="subject" className={`text-bar-dark ${touched.subject && errors.subject ? 'is-invalid' : ''}`}>
                                                <option value="">Select a subject</option>
                                                <option value="support">Technical Support</option>
                                                <option value="feedback">Website Feedback</option>
                                                <option value="partnership">Partnership Inquiry</option>
                                                <option value="other">Other</option>
                                            </Field>
                                            <ErrorMessage name="subject" component="div" className="invalid-feedback text-danger"/>
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="message">
                                            <Form.Label>Your Message</Form.Label>
                                            <Field name="message" as="textarea" rows={5} className={`form-control text-bar-dark ${touched.message && errors.message ? 'is-invalid' : ''}`} placeholder="Write your message here"/>
                                            <ErrorMessage name="message" component="div" className="invalid-feedback text-danger"/>
                                        </Form.Group>

                                        <Button variant="outline-cyan" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send Message'}</Button>
                                    </div>
                                </Col>

                                {/* Contact Information (unchanged) */}
                                <Col md={6}>
                                    <div className="contact-info">
                                        <h3 className="text-cyan mb-4">Get in Touch</h3>

                                        <div className="mb-4">
                                            <h4 className="text-cyan">Contact Information</h4>
                                            <p>
                                                <strong>Email:</strong> support@cinemite.com<br />
                                                <strong>Phone:</strong> +421 123 456 789<br />
                                                <strong>Address:</strong> Vysokoškolákov 3836, 010 08 Žilina-Vlčince
                                            </p>
                                        </div>

                                        <div className="support-hours mt-4">
                                            <h4 className="text-cyan">Support Hours</h4>
                                            <p>
                                                Monday - Friday: 9:00 - 18:00<br />
                                                Saturday: 10:00 - 16:00<br />
                                                Sunday: Closed
                                            </p>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </FormikForm>
                    )}
                </Formik>
            </section>
        </Container>
    );
};

export default Contact;