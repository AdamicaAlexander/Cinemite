import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Col, Container, Image, Row } from 'react-bootstrap';

import api from '../utils/axiosConfig';
import { LoadingView, ErrorView } from '../components/LoadError';

const Profile = () => {
    const { username } = useParams();
    const [userInfo, setUserInfo] = useState(null);
    const [movieStats, setMovieStats] = useState(null);
    const [tvShowStats, setTvShowStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!username) return;

        api.get(`/profiles/${username}`)
            .then(response => {
                const { user, movieStats, tvShowStats } = response.data;
                setUserInfo(user);
                setMovieStats(movieStats);
                setTvShowStats(tvShowStats);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to load profile');
                console.error(err);
                setLoading(false);
            });
    }, [username]);

    if (loading) return <LoadingView />;
    if (error) return <ErrorView message={error} />;

    const getProfilePictureSrc = (picUrl) => {
        if (picUrl.startsWith('uploads/')) {
            return `http://localhost:5000/${picUrl}`;
        }
        return picUrl;
    };

    return (
        <Container className="content-area mt-5">
            {/* Profile Picture & Username */}
            <Row className="align-items-center mb-4">
                <Col xs={12} md={2} className="text-center text-md-start mb-3 mb-md-0">
                    <Image src={getProfilePictureSrc(userInfo.profilePictureUrl)} roundedCircle fluid alt="Profile"/>
                </Col>
                <Col xs={12} md={10}><h1 className="text-cyan">{userInfo.username}</h1></Col>
            </Row>

            <Row className="gx-4 gy-4 align-items-stretch">
                {/* Description */}
                <Col md={6} className="d-flex">
                    <Card className="secondary-bg tertiary-border flex-fill">
                        <Card.Body>
                            <Card.Title>About Me</Card.Title>
                            <Card.Text>{userInfo.description}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Movies stats / TV stats */}
                <Col md={6} className="d-flex flex-column">
                    {/* Movies stats */}
                    <Row className="flex-fill mb-4">
                        <Col xs={6} className="d-flex">
                            <Card className="secondary-bg tertiary-border flex-fill">
                                <Card.Body>
                                    <Card.Title>Movies in Watchlist</Card.Title>
                                    <Card.Text className="fs-4">{movieStats.total ?? 0}</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={6} className="d-flex">
                            <Card className="secondary-bg tertiary-border flex-fill">
                                <Card.Body>
                                    <Card.Title>Avg Movie Rating</Card.Title>
                                    <Card.Text className="fs-4">
                                        {movieStats.avgRating ? movieStats.avgRating.toFixed(1) : '-'}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* TV show stats */}
                    <Row className="flex-fill">
                        <Col xs={6} className="d-flex">
                            <Card className="secondary-bg tertiary-border flex-fill">
                                <Card.Body>
                                    <Card.Title>TV Shows in Watchlist</Card.Title>
                                    <Card.Text className="fs-4">{tvShowStats.total ?? 0}</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={6} className="d-flex">
                            <Card className="secondary-bg tertiary-border flex-fill">
                                <Card.Body>
                                    <Card.Title className="text-cyan">Avg TV Rating</Card.Title>
                                    <Card.Text className="fs-4">
                                        {tvShowStats.avgRating ? tvShowStats.avgRating.toFixed(1) : '-'}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};

export default Profile;
