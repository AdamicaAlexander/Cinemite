import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { loginValidationSchema } from '../utils/formValidation';
import { useAuth } from '../utils/authContext';

const Login = () => {
    const [loginError, setLoginError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            setLoginError('');
            const response = await api.post('/auth/login', values);
            login(response.data.user, response.data.token);
            navigate('/');
        } catch (error) {
            setLoginError(
                error.response?.data?.message || 'Login failed. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container content-area mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="login-section">
                        <h1 className="text-cyan text-center mb-4">Log In</h1>

                        {loginError && (<div className="alert alert-danger" role="alert">{loginError}</div>)}

                        <Formik initialValues={{username: '', password: ''}} validationSchema={loginValidationSchema} onSubmit={handleSubmit}>
                            {({ isSubmitting, errors, touched }) => (
                                <Form className="login-form">
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label">Username or Email</label>
                                        <Field type="text" name="username" className={`form-control text-bar-dark ${touched.username && errors.username ? 'is-invalid' : ''}`} placeholder="Enter your username or email"/>
                                        <ErrorMessage name="username" component="div" className="invalid-feedback"/>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">Password</label>
                                        <Field type="password" name="password" className={`form-control text-bar-dark ${touched.password && errors.password ? 'is-invalid' : ''}`} placeholder="Enter your password"/>
                                        <ErrorMessage name="password" component="div" className="invalid-feedback"/>
                                    </div>

                                    <div className="mb-3 form-check">
                                        <input type="checkbox" className="form-check-input" id="rememberMe"/>
                                        <label className="form-check-label text-gray" htmlFor="rememberMe">Remember me</label>
                                    </div>

                                    <div className="d-grid gap-2">
                                        <button type="submit" className="btn btn-outline-cyan" disabled={isSubmitting}>
                                            {isSubmitting ? 'Logging In...' : 'Log In'}
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>

                        <div className="signup-link text-center mt-4">
                            <p>Don't have an account? <Link className="text-cyan" to="/registration">Sign Up</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;