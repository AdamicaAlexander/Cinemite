import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Container, Form, InputGroup, Modal } from 'react-bootstrap';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';

import api from '../utils/axiosConfig';
import { useAuth } from '../utils/authContext';
import { changePasswordValidationSchema } from '../utils/formValidation';
import { LoadingView } from '../components/LoadError';

const Settings = () => {
    const { user, loading, logout, updateUser } = useAuth();
    const navigate = useNavigate();

    const initialValues = {
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    };

    const [description, setDescription] = useState('');
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('');
    const fileInputRef = useRef(null);
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    const [showClearPictureModal, setShowClearPictureModal] = useState(false);
    const [showClearMoviesModal, setShowClearMoviesModal] = useState(false);
    const [showClearTVModal, setShowClearTVModal] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

    const [alertMessage, setAlertMessage] = useState('');
    const [alertVariant, setAlertVariant] = useState('success');

    const showAlert = (message, variant = 'success') => {
        setAlertMessage(message);
        setAlertVariant(variant);
    };

    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate('/login');
            }
        }
    }, [loading, user, navigate]);

    useEffect(() => {
        if (user) {
            setDescription(user.description || '');
        }
    }, [user]);

    if (loading) return <LoadingView />;
    if (!user) return null;

    const handleUpdateDescription = async () => {
        try {
            const { data } = await api.put('/users/description', { description });
            updateUser(data.user);
            showAlert('Description updated successfully!', 'success');
        } catch (error) {
            console.error(error);
            showAlert('Failed to update description. Please try again.', 'danger');
        }
    };

    const handleChooseFileClick = () => fileInputRef.current?.click();

    const handleProfilePicChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
        if (!allowedTypes.includes(file.type)) {
            showAlert('Only PNG or JPG files are allowed.', 'danger');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            showAlert('File size exceeds 5MB limit.', 'danger');
            return;
        }

        setProfilePictureFile(file);
        setSelectedFileName(file.name);
    };

    const handleProfilePictureUpload = async () => {
        try {
            if (!profilePictureFile) {
                showAlert('No valid file selected.', 'warning');
                return;
            }

            const formData = new FormData();
            formData.append('profilePicture', profilePictureFile);

            const { data } = await api.post('/users/profile-picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            updateUser(data.user);
            showAlert('Profile picture uploaded!', 'success');

            setProfilePictureFile(null);
            setSelectedFileName('');
        } catch (err) {
            console.error(err);
            showAlert('Failed to upload profile picture.', 'danger');
        }
    };

    const handleClearProfilePicture = async () => {
        try {
            const { data } = await api.delete('/users/profile-picture');
            updateUser(data.user);
            showAlert('Profile picture cleared!', 'success');

            setShowClearPictureModal(false);
        } catch (err) {
            console.error(err);
            showAlert('Failed to clear profile picture.', 'danger');
        }
    };

    const handleChangePassword = async (values, { setSubmitting, resetForm }) => {
        const { oldPassword, newPassword } = values;
        try {
            await api.put('/users/password', {
                oldPassword,
                newPassword,
            });
            showAlert('Password changed successfully!', 'success');
            resetForm();
        } catch (err) {
            console.error(err);
            showAlert('Failed to change password. Please check your old password.', 'danger');
        }
        setSubmitting(false);
    };

    const handleClearMovieList = async () => {
        try {
            await api.delete('/watchlist/movies');
            showAlert('Movie watchlist cleared!', 'success');
            setShowClearMoviesModal(false);
        } catch (err) {
            console.error(err);
            showAlert('Failed to clear movie watchlist.', 'danger');
        }
    };

    const handleClearTVShowList = async () => {
        try {
            await api.delete('/watchlist/tvshows');
            showAlert('TV show watchlist cleared!', 'success');
            setShowClearTVModal(false);
        } catch (err) {
            console.error(err);
            showAlert('Failed to clear TV show watchlist.', 'danger');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await api.delete('/users/account');
            showAlert('Your account has been deleted.', 'success');
            logout();
            navigate('/');
        } catch (err) {
            console.error(err);
            showAlert('Failed to delete account.', 'danger');
        }
    };

    return (
        <Container className="content-area mt-5 mb-5">
            <h1 className="text-cyan mb-4">Settings</h1>

            {alertMessage && (
                <div style={{position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, width: '300px'}}>
                    <Alert variant={alertVariant} dismissible onClose={() => setAlertMessage('')} className="mb-0">{alertMessage}</Alert>
                </div>
            )}

            {/* 1. Description */}
            <section className="mb-5">
                <h3 className="text-cyan">Description</h3>
                <Form.Group controlId="userDescription" className="mb-2">
                    <Form.Label>Edit your description</Form.Label>
                    <Form.Control as="textarea" rows={3} className="text-bar-dark" value={description} onChange={(e) => setDescription(e.target.value)}/>
                </Form.Group>
                <Button variant="outline-cyan" onClick={handleUpdateDescription}>Update description</Button>
            </section>

            {/* 2. Profile Picture */}
            <section className="mb-5">
                <h3 className="text-cyan">Profile Picture</h3>
                <div className="mb-3">
                    <Form.Group controlId="profilePicUpload">
                        <Form.Label>Upload a new profile picture</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" readOnly placeholder="No file chosen..." value={selectedFileName} className="text-bar-dark"/>
                            <Button variant="outline-cyan" className="rounded-end" onClick={handleChooseFileClick}>Choose File</Button>
                            <Form.Control type="file" accept=".png, .jpg, .jpeg" style={{ display: 'none' }} ref={fileInputRef} onChange={handleProfilePicChange}/>
                        </InputGroup>
                    </Form.Group>
                    <Button variant="outline-cyan" className="mt-2" onClick={handleProfilePictureUpload}>Upload Profile Picture</Button>
                </div>
                <Button variant="danger" onClick={() => setShowClearPictureModal(true)}>Clear Profile Picture</Button>
            </section>

            {/* 3. Change Password */}
            <section className="mb-5">
                <h3 className="text-cyan">Change Password</h3>

                <Formik initialValues={initialValues} validationSchema={changePasswordValidationSchema} onSubmit={handleChangePassword}>
                    {({ isSubmitting, errors, touched }) => (
                        <FormikForm>
                            <Form.Group controlId="oldPassword" className="mb-3">
                                <Form.Label>Old password</Form.Label>
                                <Field type="password" name="oldPassword" className={`form-control text-bar-dark ${touched.oldPassword && errors.oldPassword ? 'is-invalid' : ''}`} placeholder="Enter your old password"/>
                                <ErrorMessage name="oldPassword" component="div" className="invalid-feedback"/>
                            </Form.Group>

                            <Form.Group controlId="newPassword" className="mb-3">
                                <Form.Label>New password</Form.Label>
                                <Field type="password" name="newPassword" className={`form-control text-bar-dark ${touched.newPassword && errors.newPassword ? 'is-invalid' : ''}`} placeholder="Create new password"/>
                                <ErrorMessage name="newPassword" component="div" className="invalid-feedback"/>
                            </Form.Group>

                            <Form.Group controlId="confirmNewPassword" className="mb-3">
                                <Form.Label>Confirm new password</Form.Label>
                                <Field type="password" name="confirmNewPassword" className={`form-control text-bar-dark ${touched.confirmNewPassword && errors.confirmNewPassword ? 'is-invalid' : ''}`} placeholder="Confirm your new password"/>
                                <ErrorMessage name="confirmNewPassword" component="div" className="invalid-feedback"/>
                            </Form.Group>

                            <Button variant="outline-cyan" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Changing...' : 'Change password'}</Button>
                        </FormikForm>
                    )}
                </Formik>
            </section>

            {/* 4. Clear Lists */}
            <section className="mb-5">
                <h3 className="text-cyan">Clear Lists</h3>
                <p>You can clear all movies or TV shows from your watchlists. This action cannot be undone.</p>
                <div className="d-flex gap-3 flex-wrap">
                    <Button variant="danger" onClick={() => setShowClearMoviesModal(true)}>Clear Movie List</Button>
                    <Button variant="danger" onClick={() => setShowClearTVModal(true)}>Clear TV Show List</Button>
                </div>
            </section>

            {/* 5. Delete Account */}
            <section className="mb-5">
                <h3 className="text-cyan">Delete Account</h3>
                <p>Deleting your account permanently removes all your data and watchlists. This action cannot be undone.</p>
                <Button variant="danger" onClick={() => setShowDeleteAccountModal(true)}>Delete Account</Button>
            </section>

            {/* Clear Profile Picture Confirm */}
            <Modal show={showClearPictureModal} onHide={() => setShowClearPictureModal(false)} centered>
            <Modal.Header closeButton>
                    <Modal.Title>Confirm Clearing Profile Picture</Modal.Title>
                </Modal.Header>
                <Modal.Body><p>Are you sure you want to remove your profile picture?</p></Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-cyan" onClick={() => setShowClearPictureModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleClearProfilePicture}>Yes, remove it</Button>
                </Modal.Footer>
            </Modal>

            {/* Clear Movies Confirm */}
            <Modal show={showClearMoviesModal} onHide={() => setShowClearMoviesModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Clear Movie Watchlist</Modal.Title>
                </Modal.Header>
                <Modal.Body><p>Are you sure you want to clear all movies from your watchlist?</p></Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-cyan" onClick={() => setShowClearMoviesModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleClearMovieList}>Yes, clear it</Button>
                </Modal.Footer>
            </Modal>

            {/* Clear TV Shows Confirm */}
            <Modal show={showClearTVModal} onHide={() => setShowClearTVModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Clear TV Show Watchlist</Modal.Title>
                </Modal.Header>
                <Modal.Body><p>Are you sure you want to clear all TV shows from your watchlist?</p></Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-cyan" onClick={() => setShowClearTVModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleClearTVShowList}>Yes, clear it</Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Account Confirm */}
            <Modal show={showDeleteAccountModal} onHide={() => setShowDeleteAccountModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Account</Modal.Title>
                </Modal.Header>
                <Modal.Body><p>This action cannot be undone. Are you sure you want to delete your account?</p></Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-cyan" onClick={() => setShowDeleteAccountModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDeleteAccount}>Yes, delete my account</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Settings;
