import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Container, Dropdown, Form, FormControl, InputGroup, Modal } from 'react-bootstrap';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';

import api from '../utils/axiosConfig';
import { useAuth } from '../utils/authContext';
import { ErrorView, LoadingView } from "../components/LoadError";
import { titleValidationSchema } from '../utils/formValidation';

const AdminTitle = () => {
    const { type, title: titleParam } = useParams();
    const isEditMode = Boolean(titleParam);
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== 'admin') {
                navigate('/');
            }
        }
    }, [user, loading, navigate]);

    const [initialValues, setInitialValues] = useState({
        titleName: '',
        description: '',
        releaseOrStartDate: '',
        durationOrFinish: '',
        poster: null,
        genres: []
    });

    const [allGenres, setAllGenres] = useState([]);

    const [formLoading, setFormLoading] = useState(isEditMode);
    const [error, setError] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertVariant, setAlertVariant] = useState('success');

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const fileInputRef = useRef(null);

    const showAlert = (message, variant = 'success') => {
        setAlertMessage(message);
        setAlertVariant(variant);
    };

    const handleGenreToggle = (genreName, values, setFieldValue) => {
        if (values.genres.includes(genreName)) {
            setFieldValue('genres', values.genres.filter((g) => g !== genreName));
        } else {
            setFieldValue('genres', [...values.genres, genreName]);
        }
    };

    useEffect(() => {
        api.get('/genres')
            .then(res => setAllGenres(res.data))
            .catch(err => console.error('Error fetching genres:', err));
    }, []);

    useEffect(() => {
        const fetchTitleData = async () => {
            try {
                if (isEditMode) {
                    setFormLoading(true);
                    setError('');

                    const res = await api.get(`/admin/title/${type}/${encodeURIComponent(titleParam)}`);
                    const data = res.data;

                    let associatedGenres = [];
                    try {
                        const genreRes = await api.get(`/genres/${type}/${encodeURIComponent(titleParam)}`);
                        associatedGenres = genreRes.data;
                    } catch (genreErr) {
                        console.error('Error fetching associated genres:', genreErr);
                    }

                    const dateValue = data.release_date
                        ? new Date(data.release_date).toISOString().substr(0, 10)
                        : data.start_date
                            ? new Date(data.start_date).toISOString().substr(0, 10)
                            : '';

                    const finishOrDuration = type === 'movie'
                        ? data.duration_minutes ? String(data.duration_minutes) : ''
                        : data.finish_date
                            ? new Date(data.finish_date).toISOString().substr(0, 10)
                            : '';

                    setInitialValues({
                        titleName: data.title,
                        description: data.description || '',
                        releaseOrStartDate: dateValue,
                        durationOrFinish: finishOrDuration,
                        poster: null,
                        genres: associatedGenres || []
                    });
                    setFormLoading(false);
                }
            } catch (err) {
                console.error('Error fetching title data', err);
                setError('Failed to load title data');
                setFormLoading(false);
            }
        };
        fetchTitleData();
    }, [isEditMode, type, titleParam]);

    const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
        try {
            const formData = new FormData();
            formData.append('titleName', values.titleName);
            formData.append('description', values.description);
            formData.append('releaseOrStartDate', values.releaseOrStartDate);
            formData.append('durationOrFinish', values.durationOrFinish);
            if (values.poster) {
                formData.append('poster', values.poster);
            }

            formData.append('genres', JSON.stringify(values.genres));

            let res;
            if (isEditMode) {
                res = await api.put(`/admin/title/${type}/${encodeURIComponent(titleParam)}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                res = await api.post(`/admin/title/${type}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }

            showAlert(isEditMode ? 'Title updated successfully!' : 'Title added successfully!', 'success');

            setTimeout(() => {
                navigate(`/${type}/${encodeURIComponent(res.data.title)}`);
            }, 1500);
        } catch (err) {
            console.error('Error submitting title', err);
            const msg = err.response?.data?.message;
            if (msg === 'Title name is already in use.') {
                setFieldError('titleName', msg);
            } else {
                showAlert('Failed to submit title', 'danger');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/admin/title/${type}/${encodeURIComponent(titleParam)}`);
            showAlert('Title deleted successfully!', 'success');
            setTimeout(() => {
                navigate(`/browse/${type === 'movie' ? 'movies' : 'tvshows'}`);
            }, 1500);
        } catch (err) {
            console.error('Error deleting title', err);
            showAlert('Failed to delete title', 'danger');
        }
    };

    if (formLoading) return <LoadingView />;
    if (error) return <ErrorView message={error} />;

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <Container className="my-5">
            <h1 className="text-cyan mb-4">{isEditMode ? 'Edit Title' : 'Add New Title'}</h1>

            {alertMessage && (
                <div style={{position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, width: '300px'}}>
                    <Alert variant={alertVariant} dismissible onClose={() => setAlertMessage('')} className="mb-0">{alertMessage}</Alert>
                </div>
            )}

            <Formik enableReinitialize initialValues={initialValues} validationSchema={titleValidationSchema(type)} onSubmit={handleSubmit}>
                {({ isSubmitting, setFieldValue, values }) => (
                    <FormikForm>
                        <h3 className="text-cyan">Title name</h3>
                        <Form.Group className="mb-3" controlId="titleName">
                            <Form.Label>Set the title name</Form.Label>
                            <Field type="text" name="titleName" className="form-control text-bar-dark" placeholder="Enter title name"/>
                            <ErrorMessage name="titleName" component="div" className="invalid-feedback"/>
                        </Form.Group>

                        <h3 className="text-cyan">Description</h3>
                        <Form.Group className="mb-3" controlId="description">
                            <Form.Label>Set the description</Form.Label>
                            <Field as="textarea" name="description" className="form-control text-bar-dark" rows={3}/>
                            <ErrorMessage name="description" component="div" className="invalid-feedback"/>
                        </Form.Group>

                        <h3 className="text-cyan">Poster</h3>
                        <Form.Group className="mb-3" controlId="poster">
                            <Form.Label>Upload poster</Form.Label>
                            <InputGroup>
                                <FormControl type="text" className="text-bar-dark" readOnly placeholder="No file chosen..." value={values.poster ? values.poster.name : ''}/>
                                <Button variant="outline-cyan" className="rounded-end" onClick={() => fileInputRef.current.click()}>Choose File</Button>
                            </InputGroup>
                            <Form.Control type="file" accept=".png, .jpg, .jpeg" style={{display: 'none'}} ref={fileInputRef}
                                          onChange={(e) => {
                                              if (e.target.files && e.target.files[0]) {
                                                  setFieldValue('poster', e.target.files[0]);
                                              }
                                          }}
                            />
                        </Form.Group>

                        <h3 className="text-cyan">Genres</h3>
                        <p className='mb-2'>Select Genres</p>
                        <Dropdown className="mb-3">
                            <Dropdown.Toggle className='w-100' variant="outline-cyan">
                                {values.genres.length ? values.genres.join(', ') : 'No genres chosen...'}
                            </Dropdown.Toggle>

                            <Dropdown.Menu className='w-100' style={{maxHeight: '200px', overflowY: 'auto'}}>
                                {allGenres.map((g) => {
                                    const isSelected = values.genres.includes(g.name);
                                    return (
                                        <Dropdown.Item key={g._id} as="div" onClick={() => handleGenreToggle(g.name, values, setFieldValue)}>
                                            <Form.Check type="checkbox" label={g.name} checked={isSelected} onChange={() => null}/>
                                        </Dropdown.Item>
                                    );
                                })}
                            </Dropdown.Menu>
                        </Dropdown>

                        <h3 className="text-cyan">{type === 'movie' ? 'Release Date' : 'Start Date'}</h3>
                        <Form.Group className="mb-3" controlId="releaseOrStartDate">
                            <Form.Label>{type === 'movie' ? 'Set the release date' : 'Set the start date'}</Form.Label>
                            <Field type="date" name="releaseOrStartDate" className="form-control text-bar-dark"/>
                            <ErrorMessage name="releaseOrStartDate" component="div" className="invalid-feedback"/>
                        </Form.Group>

                        <h3 className="text-cyan">{type === 'movie' ? 'Duration' : 'Finish Date'}</h3>
                        <Form.Group className="mb-3" controlId="durationOrFinish">
                            <Form.Label>{type === 'movie' ? 'Set the duration (in minutes)' : 'Set the finish date'}</Form.Label>
                            <Field type={type === 'movie' ? 'number' : 'date'} name="durationOrFinish" className="form-control text-bar-dark"/>
                            <ErrorMessage name="durationOrFinish" component="div" className="invalid-feedback"/>
                        </Form.Group>

                        <Button variant="outline-cyan" type="submit" disabled={isSubmitting} className="me-2">{isEditMode ? 'Update' : 'Add Title'}</Button>
                        <Button variant="secondary" onClick={handleCancel} className="me-2">Cancel</Button>
                        {isEditMode && (
                            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete</Button>)}
                    </FormikForm>
                )}
            </Formik>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body><p>Are you sure you want to delete this title? This action cannot be undone.</p></Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-cyan" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete}>Yes, Delete</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminTitle;
