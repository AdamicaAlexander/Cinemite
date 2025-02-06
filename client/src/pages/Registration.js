import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';

import api from '../utils/axiosConfig';
import { registrationValidationSchema } from '../utils/formValidation';

const Registration = () => {
    const navigate = useNavigate();

    const [alertMessage, setAlertMessage] = useState('');
    const [alertVariant, setAlertVariant] = useState('success');

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const { confirmPassword, ...submitData } = values;

            const response = await api.post('/auth/registration', submitData);

            setAlertMessage('Registration successful!');
            setAlertVariant('success');

            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (error) {
            setAlertMessage(
                error.response?.data?.message || 'Registration failed. Please try again.'
            );
            setAlertVariant('danger');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container className="content-area mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <div className="entry-section">
                        <h1 className="text-cyan text-center mb-4">Sign Up</h1>

                        {alertMessage && (
                            <div style={{position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, width: '300px'}}>
                                <Alert variant={alertVariant} dismissible onClose={() => setAlertMessage('')} className="mb-0">{alertMessage}</Alert>
                            </div>
                        )}

                        <Formik
                            initialValues={{username: '', email: '', password: '', confirmPassword: ''}}
                            validationSchema={registrationValidationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ isSubmitting, errors, touched }) => (
                                <FormikForm className="registration-form">
                                    <Form.Group className="mb-3" controlId="username">
                                        <Form.Label>Username</Form.Label>
                                        <Field type="text" name="username" className={`form-control text-bar-dark ${touched.username && errors.username ? 'is-invalid' : ''}`} placeholder="Choose a username"/>
                                        <ErrorMessage name="username" component="div" className="invalid-feedback"/>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="email">
                                        <Form.Label>Email</Form.Label>
                                        <Field type="email" name="email" className={`form-control text-bar-dark ${touched.email && errors.email ? 'is-invalid' : ''}`} placeholder="Enter your email"/>
                                        <ErrorMessage name="email" component="div" className="invalid-feedback"/>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="password">
                                        <Form.Label>Password</Form.Label>
                                        <Field type="password" name="password" className={`form-control text-bar-dark ${touched.password && errors.password ? 'is-invalid' : ''}`} placeholder="Create a password"/>
                                        <ErrorMessage name="password" component="div" className="invalid-feedback"/>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="confirmPassword">
                                        <Form.Label>Confirm Password</Form.Label>
                                        <Field type="password" name="confirmPassword" className={`form-control text-bar-dark ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}`} placeholder="Confirm your password"/>
                                        <ErrorMessage name="confirmPassword" component="div" className="invalid-feedback"/>
                                    </Form.Group>

                                    <div className="d-grid gap-2">
                                        <Button type="submit" variant="outline-cyan" disabled={isSubmitting}>{isSubmitting ? 'Signing Up...' : 'Sign Up'}</Button>
                                    </div>
                                </FormikForm>
                            )}
                        </Formik>

                        <div className="login-link text-center mt-4">
                            <p>Already have an account? <Link className="text-cyan" to="/login">Log In</Link></p>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default Registration;
