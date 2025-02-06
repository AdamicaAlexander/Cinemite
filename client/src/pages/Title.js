import React, { useEffect, useState  } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Col, Container, Image, Row } from 'react-bootstrap';

import api from '../utils/axiosConfig';
import { useAuth } from '../utils/authContext';
import { LoadingView, ErrorView } from '../components/LoadError';

const Title = () => {
    const { type, title } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const isAdmin = user?.role === 'admin';

    const [titleData, setTitleData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [watchlistStatus, setWatchlistStatus] = useState('');

    useEffect(() => {
        fetchTitleData();
    }, [type, title, user]);

    const fetchTitleData = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await api.get(`/title/${type}/${encodeURIComponent(title)}`);
            let data = res.data;

            try {
                const genreRes = await api.get(`/genres/${type}/${encodeURIComponent(title)}`);
                data.genres = genreRes.data;
            } catch (genreErr) {
                console.error('Error fetching genres:', genreErr);
                data.genres = [];
            }

            setTitleData(data);

            if (user) {
                const wlRes = await api.get(`/watchlist/${type}/${encodeURIComponent(title)}`);
                setWatchlistStatus(wlRes.data.status);
            }
        } catch (err) {
            console.error('Error fetching title data:', err);
            setError(err.response?.data?.message || 'Failed to load title');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToWatchlist = async () => {
        if (!user) {
            return navigate('/login');
        }

        try {
            const res = await api.post(`/watchlist/${type}/${encodeURIComponent(title)}`);
            if (res.data.status) {
                setWatchlistStatus('Planning');
            }
        } catch (err) {
            console.error('Error adding to watchlist:', err);
        }
    };

    if (loading) return <LoadingView />;
    if (error) return <ErrorView message={error} />;
    if (!titleData) return <ErrorView message="Title not found." />;

    const {
        description,
        poster_url,
        rating,
        genres,
        release_date,
        duration_minutes,
        start_date,
        finish_date,
    } = titleData;

    return (
        <Container className="my-5">
            <Row>
                <Col md={3}>
                    <Image style={{ width: '100%', height: 'auto' }} src={`http://localhost:5000/${poster_url}`} fluid alt={title}/>
                </Col>

                <Col className="d-flex flex-column justify-content-end">
                    <h1 className="text-cyan">{titleData.title}</h1>
                    <p>{description}</p>
                </Col>
            </Row>

            <Row>
                <Col md={3}>
                    <div className="mt-3">
                        {watchlistStatus ? (<Button variant="outline-cyan">{watchlistStatus}</Button>
                        ) : (<Button variant="outline-cyan" onClick={handleAddToWatchlist}>Add to Watchlist</Button>)}
                    </div>
                </Col>
            </Row>

            <Row className="mt-5">
                <Col md={3} className="mb-3">
                    <Card className="secondary-bg tertiary-border text-center">
                        <Card.Body>
                        <Card.Title>Rating</Card.Title>
                            <Card.Text className="fs-5">{rating ? rating.toFixed(1) : '-'}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3} className="mb-3">
                    <Card className="secondary-bg tertiary-border text-center">
                        <Card.Body>
                            <Card.Title>Genres</Card.Title>
                            <Card.Text className="fs-5">{genres && genres.length > 0 ? genres.join(', ') : '-'}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3} className="mb-3">
                    <Card className="secondary-bg tertiary-border text-center">
                        <Card.Body>
                            <Card.Title>{type === 'movie' ? 'Release Date' : 'Start Date'}</Card.Title>
                            <Card.Text className="fs-5">
                                {type === 'movie'
                                    ? (release_date ? new Date(release_date).toLocaleDateString() : '-')
                                    : (start_date ? new Date(start_date).toLocaleDateString() : '-')}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3} className="mb-3">
                    <Card className="secondary-bg tertiary-border text-center">
                        <Card.Body>
                            <Card.Title>{type === 'movie' ? 'Duration' : 'Finish Date'}</Card.Title>
                            <Card.Text className="fs-5">
                                {type === 'movie'
                                    ? (duration_minutes ? `${duration_minutes} min` : '-')
                                    : (finish_date ? new Date(finish_date).toLocaleDateString() : '-')}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {isAdmin && (
                <div className="d-flex justify-content-end mt-4">
                    <Button variant="danger" onClick={() => navigate(`/admin/edit/${type}/${title}`)}>Edit Title</Button>
                </div>
            )}
        </Container>
    );
};

export default Title;
