import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { registrationValidationSchema } from '../utils/formValidation';

const Registration = () => {
    const [registrationError, setRegistrationError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            setRegistrationError('');
            const { confirmPassword, ...submitData } = values;

            const response = await api.post('/auth/registration', submitData);

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            navigate('/');
        } catch (error) {
            setRegistrationError(
                error.response?.data?.message || 'Registration failed. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container content-area mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="registration-section">
                        <h1 className="text-cyan text-center mb-4">Sign Up</h1>

                        {registrationError && (<div className="alert alert-danger" role="alert">{registrationError}</div>)}

                        <Formik
                            initialValues={{username: '', email: '', password: '', confirmPassword: ''}}
                            validationSchema={registrationValidationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ isSubmitting, errors, touched }) => (
                                <Form className="registration-form">
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label">Username</label>
                                        <Field type="text" name="username" className={`form-control text-bar-dark ${touched.username && errors.username ? 'is-invalid' : ''}`} placeholder="Choose a username"/>
                                        <ErrorMessage name="username" component="div" className="invalid-feedback"/>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <Field type="email" name="email" className={`form-control text-bar-dark ${touched.email && errors.email ? 'is-invalid' : ''}`} placeholder="Enter your email"/>
                                        <ErrorMessage name="email" component="div" className="invalid-feedback"/>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">Password</label>
                                        <Field type="password" name="password" className={`form-control text-bar-dark ${touched.password && errors.password ? 'is-invalid' : ''}`} placeholder="Create a password"/>
                                        <ErrorMessage name="password" component="div" className="invalid-feedback"/>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                                        <Field type="password" name="confirmPassword" className={`form-control text-bar-dark ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}`} placeholder="Confirm your password"/>
                                        <ErrorMessage name="confirmPassword" component="div" className="invalid-feedback"/>
                                    </div>

                                    <div className="d-grid gap-2">
                                        <button type="submit" className="btn btn-outline-cyan" disabled={isSubmitting}>
                                            {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>

                        <div className="login-link text-center mt-4">
                            <p>Already have an account? <Link className="text-cyan" to="/login">Log In</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Registration;