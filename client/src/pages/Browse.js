import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';

import api from '../utils/axiosConfig';
import { useAuth } from '../utils/authContext';

const Browse = () => {
    const { type } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [filterSearch, setFilterSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSort, setSelectedSort] = useState('A-Z');

    const [titles, setTitles] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const [allGenres, setAllGenres] = useState([]);

    const searchTimeoutRef = useRef(null);

    const YEARS = Array.from({ length: 126 }, (_, i) => new Date().getFullYear() - i);

    useEffect(() => {
        api.get('/genres')
            .then(res => setAllGenres(res.data.map(g => g.name)))
            .catch(err => console.error('Error fetching genres:', err));
    }, []);

    useEffect(() => {
        fetchData(true);
    }, [type, searchTerm, selectedGenre, selectedYear, selectedSort]);

    const fetchData = async (reset = false) => {
        try {
            setLoading(true);
            const currentPage = reset ? 1 : page;
            const params = {
                search: searchTerm,
                genre: selectedGenre,
                year: selectedYear,
                sort: selectedSort,
                page: currentPage,
                limit: 20,
            };

            const response = await api.get(`/browse/${type}`, { params });
            const data = response.data;

            if (reset) {
                setTitles(data);
                setPage(2);
            } else {
                setTitles((prev) => [...prev, ...data]);
                setPage(currentPage + 1);
            }

            setHasMore(data.length === 20);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching browse data:', err);
            setLoading(false);
        }
    };

    const handleScroll = () => {
        if (loading || !hasMore) return;
        const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            fetchData(false);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, hasMore]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setFilterSearch(val);

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        searchTimeoutRef.current = setTimeout(() => {
            setSearchTerm(val);
        }, 300);
    };

    const goToDetailPage = (title) => {
        navigate(`/${type.slice(0, -1)}/${encodeURIComponent(title)}`);
    };

    return (
        <Container className="content-area mt-5 mb-5">
            <h1 className="text-cyan mb-4">Browse {type === 'movies' ? 'Movies' : 'TV Shows'}</h1>

            <Row className="mb-4">
                <Col md={6} lg={4}>
                    <Form.Control type="search" placeholder="Search..." className="text-bar-dark" value={filterSearch} onChange={handleSearchChange}/>
                </Col>

                <Col md={6} lg={2}>
                    <Form.Select className="text-bar-dark" value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
                        <option value="">All Genres</option>
                        {allGenres.map((g) => (
                            <option key={g} value={g}>
                                {g}
                            </option>
                        ))}
                    </Form.Select>
                </Col>

                <Col md={6} lg={2}>
                    <Form.Select className="text-bar-dark" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                        <option value="">All Years</option>
                        {YEARS.map((y) => (
                            <option key={y} value={String(y)}>
                                {y}
                            </option>
                        ))}
                    </Form.Select>
                </Col>

                <Col md={6} lg={2}>
                    <Form.Select className="text-bar-dark" value={selectedSort} onChange={(e) => setSelectedSort(e.target.value)}>
                        <option value="A-Z">Title: A-Z</option>
                        <option value="Z-A">Title: Z-A</option>
                        <option value="Rating">Rating</option>
                        <option value="Latest">Latest</option>
                    </Form.Select>
                </Col>

                <Col md={12} lg={2} className="text-end mt-3 mt-lg-0">
                    {user?.role === 'admin' && (
                        <Button variant="danger" onClick={() => navigate(type === 'movies' ? '/admin/add-title/movie' : '/admin/add-title/tvshow')}>
                            Add Title
                        </Button>
                    )}
                </Col>
            </Row>

            <Row>
                {titles.map((item) => (
                    <Col key={item._id} xs={6} sm={4} md={3} lg={2} className="mb-4">
                        <Card className="secondary-bg tertiary-border w-100" onClick={() => goToDetailPage(item.title)} style={{ cursor: 'pointer' }}>
                            <Card.Img className="poster-image" variant="top" src={`http://localhost:5000/${item.poster_url}`}/>
                            <Card.Body><Card.Title className="fs-6">{item.title}</Card.Title></Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {loading && <p className="text-center text-cyan">Loading...</p>}
            {!hasMore && !loading && (
                <p className="text-center text-gray">No more {type}</p>
            )}
        </Container>
    );
};

export default Browse;
