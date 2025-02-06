import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button, Col, Container, Form, Modal, Row, Table } from 'react-bootstrap';

import api from '../utils/axiosConfig';
import { useAuth } from '../utils/authContext';
import { LoadingView, ErrorView } from '../components/LoadError';

const Watchlist = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const [alertMessage, setAlertMessage] = useState('');
    const [alertVariant, setAlertVariant] = useState('danger');

    const [filterSearch, setFilterSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedSort, setSelectedSort] = useState('A-Z');

    const [allGenres, setAllGenres] = useState([]);

    const searchTimeoutRef = useRef(null);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [tempStatus, setTempStatus] = useState('');
    const [tempRating, setTempRating] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const movieStatuses = ['Planning', 'Completed', 'Dropped'];
    const tvStatuses = ['Planning', 'Watching', 'Paused', 'Completed', 'Dropped'];

    const YEARS = Array.from({ length: 126 }, (_, i) => new Date().getFullYear() - i);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [authLoading, user, navigate]);

    useEffect(() => {
        api.get('/genres')
            .then((res) => setAllGenres(res.data.map((g) => g.name)))
            .catch((err) => console.error('Error fetching genres:', err));
    }, []);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setFilterSearch(val);

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        searchTimeoutRef.current = setTimeout(() => {
            setSearchTerm(val);
            setPage(1);
            setItems([]);
            setHasMore(true);
        }, 300);
    };

    useEffect(() => {
        if (!user) return;
        setItems([]);
        setPage(1);
        setHasMore(true);
        fetchData(true);
    }, [type, searchTerm, selectedGenre, selectedYear, selectedStatus, selectedSort, user]);

    const fetchData = async (reset = false) => {
        try {
            setLoading(true);
            setAlertMessage('');

            const currentPage = reset ? 1 : page;
            const limit = 20;

            const params = {
                search: searchTerm,
                genre: selectedGenre,
                year: selectedYear,
                status: selectedStatus,
                sort: selectedSort,
                page: currentPage,
                limit,
            };

            const { data } = await api.get(`/watchlist/${type}`, { params });

            if (reset) {
                setItems(data);
                setPage(2);
            } else {
                setItems((prev) => [...prev, ...data]);
                setPage(currentPage + 1);
            }

            setHasMore(data.length === limit);
        } catch (err) {
            console.error('Error fetching watchlist:', err);
            setAlertMessage('Failed to load watchlist data');
            setAlertVariant('danger');
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = () => {
        if (loading || !hasMore) return;
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            fetchData(false);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, hasMore]);

    const handleEditClick = (item) => {
        setEditingItem(item);
        setTempStatus(item.status);
        setTempRating(item.rating !== null ? item.rating : '');
        setShowEditModal(true);
    };

    const handleSaveChanges = async () => {
        if (!editingItem) return;
        try {
            await api.put(`/watchlist/${type.slice(0, -1)}/${encodeURIComponent(editingItem.titleName)}`, {
                status: tempStatus,
                rating: tempRating ? Number(tempRating) : null,
            });

            setShowEditModal(false);
            setAlertMessage('Watchlist item updated!');
            setAlertVariant('success');

            setItems([]);
            setPage(1);
            setHasMore(true);
            fetchData(true);
        } catch (err) {
            console.error('Error updating watchlist item:', err);
            setAlertMessage('Failed to update item');
            setAlertVariant('danger');
        }
    };

    const handleDelete = async () => {
        if (!editingItem) return;
        try {
            await api.delete(`/watchlist/${type.slice(0, -1)}/${encodeURIComponent(editingItem.titleName)}`);

            setShowDeleteModal(false);
            setShowEditModal(false);
            setAlertMessage('Removed from watchlist');
            setAlertVariant('success');

            setItems([]);
            setPage(1);
            setHasMore(true);
            fetchData(true);
        } catch (err) {
            console.error('Error removing watchlist item:', err);
            setAlertMessage('Failed to remove watchlist item');
            setAlertVariant('danger');
        }
    };

    const handleRowClick = (item) => {
        navigate(`/${type.slice(0, -1)}/${encodeURIComponent(item.titleName)}`);
    };

    if (authLoading) return <LoadingView />;

    const possibleStatuses = type === 'movies' ? movieStatuses : tvStatuses;

    return (
        <Container className="content-area mt-5 mb-5">
            <h1 className="text-cyan mb-4">{type === 'movies' ? 'My Movie Watchlist' : 'My TV Show Watchlist'}</h1>

            {alertMessage && (
                <div style={{position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, width: '300px'}}>
                    <Alert variant={alertVariant} dismissible onClose={() => setAlertMessage('')} className="mb-0">{alertMessage}</Alert>
                </div>
            )}

            <Row className="mb-4 g-2">
                <Col md={6} lg={4}>
                    <Form.Control type="search" placeholder="Search..." className="text-bar-dark" value={filterSearch} onChange={handleSearchChange}/>
                </Col>
                <Col md={6} lg={2}>
                    <Form.Select className="text-bar-dark" value={selectedGenre} onChange={(e) => {
                        setSelectedGenre(e.target.value);
                        setPage(1);
                        setItems([]);
                        setHasMore(true);
                    }}>
                        <option value="">All Genres</option>
                        {allGenres.map((g) => (
                            <option key={g} value={g}>
                                {g}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={6} lg={2}>
                    <Form.Select className="text-bar-dark" value={selectedYear} onChange={(e) => {
                        setSelectedYear(e.target.value);
                        setPage(1);
                        setItems([]);
                        setHasMore(true);
                    }}>
                        <option value="">All Years</option>
                        {YEARS.map((y) => (
                            <option key={y} value={String(y)}>
                                {y}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={6} lg={2}>
                    <Form.Select className="text-bar-dark" value={selectedStatus} onChange={(e) => {
                        setSelectedStatus(e.target.value);
                        setPage(1);
                        setItems([]);
                        setHasMore(true);
                    }}>
                        <option value="">All Statuses</option>
                        {possibleStatuses.map((st) => (
                            <option key={st} value={st}>
                                {st}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={6} lg={2}>
                    <Form.Select className="text-bar-dark" value={selectedSort} onChange={(e) => {
                        setSelectedSort(e.target.value);
                        setPage(1);
                        setItems([]);
                        setHasMore(true);
                    }}>
                        <option value="A-Z">Title: A-Z</option>
                        <option value="Z-A">Title: Z-A</option>
                        <option value="Rating">Rating</option>
                        <option value="Latest">Latest</option>
                    </Form.Select>
                </Col>
            </Row>

            <Table variant='dark' hover responsive>
                <thead>
                <tr>
                    <th style={{ width: '60px' }}></th>
                    <th>Title</th>
                    <th>My Rating</th>
                    <th>Status</th>
                    {type === 'movies' ? <th>Release Date</th> : <th>Start Date</th>}
                    <th style={{ width: '80px' }}>Action</th>
                </tr>
                </thead>
                <tbody>
                {items.map((item) => (
                    <tr key={item._id} onClick={() => handleRowClick(item)} style={{ cursor: 'pointer' }}>
                        <td><img src={`http://localhost:5000/${item.poster_url}`} alt={item.titleName} style={{ width: '50px', height: 'auto' }}/></td>
                        <td className='align-content-center'>{item.titleName}</td>
                        <td className='align-content-center'>{item.rating ?? '-'}</td>
                        <td className='align-content-center'>{item.status}</td>
                        <td className='align-content-center'>
                            {type === 'movies'
                                ? item.release_date
                                    ? new Date(item.release_date).toLocaleDateString()
                                    : '-'
                                : item.start_date
                                    ? new Date(item.start_date).toLocaleDateString()
                                    : '-'}
                        </td>
                        <td className='align-content-center'><Button variant="outline-cyan" size="sm" onClick={() => handleEditClick(item)}>Edit</Button></td>
                    </tr>
                ))}
                </tbody>
            </Table>

            {loading && <p className="text-center text-cyan">Loading...</p>}
            {!hasMore && !loading && (
                <p className="text-center text-gray">No more items</p>
            )}

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Watchlist Item</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editingItem && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Status</Form.Label>
                                <Form.Select className="text-bar-dark" value={tempStatus} onChange={(e) => setTempStatus(e.target.value)}>
                                    {possibleStatuses.map((st) => (
                                        <option key={st} value={st}>
                                            {st}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Rating (1-10)</Form.Label>
                                <Form.Control
                                    type="number"
                                    className="text-bar-dark"
                                    min="1"
                                    max="10"
                                    value={tempRating}
                                    onChange={(e) => setTempRating(e.target.value)}
                                />
                            </Form.Group>
                            <div className="d-flex justify-content-between">
                                <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                                    Remove
                                </Button>
                                <Button variant="outline-cyan" onClick={handleSaveChanges}>
                                    Save
                                </Button>
                            </div>
                        </>
                    )}
                </Modal.Body>
            </Modal>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Removal</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to remove "{editingItem?.titleName}" from your watchlist?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete}>Remove</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Watchlist;
