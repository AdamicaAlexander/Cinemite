import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';

import api from '../utils/axiosConfig';
import { useAuth } from '../utils/authContext';
import { loginValidationSchema } from '../utils/formValidation';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [alertMessage, setAlertMessage] = useState('');
    const [alertVariant, setAlertVariant] = useState('success');

    const initialValues = {
        loginField: '',
        password: '',
        rememberMe: false,
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const response = await api.post('/auth/login', {
                loginField: values.loginField,
                password: values.password,
            });

            setAlertMessage('Login successful!');
            setAlertVariant('success');

            login(response.data.user, response.data.token, values.rememberMe);

            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (error) {
            setAlertMessage(
                error.response?.data?.message || 'Login failed. Please try again.'
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
                        <h1 className="text-cyan text-center mb-4">Log In</h1>

                        {alertMessage && (
                            <div style={{position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, width: '300px'}}>
                                <Alert variant={alertVariant} dismissible onClose={() => setAlertMessage('')} className="mb-0">{alertMessage}</Alert>
                            </div>
                        )}

                        <Formik initialValues={initialValues} validationSchema={loginValidationSchema} onSubmit={handleSubmit}>
                            {({ isSubmitting, errors, touched }) => (
                                <FormikForm className="login-form">
                                    <Form.Group controlId="loginField" className="mb-3">
                                        <Form.Label>Username or Email</Form.Label>
                                        <Field type="text" name="loginField" className={`form-control text-bar-dark ${touched.loginField && errors.loginField ? 'is-invalid' : ''}`} placeholder="Enter your username or email"/>
                                        <ErrorMessage name="loginField" component="div" className="invalid-feedback"/>
                                    </Form.Group>

                                    <Form.Group controlId="password" className="mb-3">
                                        <Form.Label>Password</Form.Label>
                                        <Field type="password" name="password" className={`form-control text-bar-dark ${touched.password && errors.password ? 'is-invalid' : ''}`} placeholder="Enter your password"/>
                                        <ErrorMessage name="password" component="div" className="invalid-feedback"/>
                                    </Form.Group>

                                    <Form.Group controlId="rememberMe" className="mb-3">
                                        <Field type="checkbox" name="rememberMe" className="form-check-input"/>
                                        <Form.Label className="text-gray ms-2">Remember me</Form.Label>
                                    </Form.Group>

                                    <div className="d-grid gap-2">
                                        <Button type="submit" variant="outline-cyan" disabled={isSubmitting}>{isSubmitting ? 'Logging In...' : 'Log In'}</Button>
                                    </div>
                                </FormikForm>
                            )}
                        </Formik>

                        <div className="signup-link text-center mt-4">
                            <p>Don't have an account? <Link className="text-cyan" to="/registration">Sign Up</Link></p>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default Login;
