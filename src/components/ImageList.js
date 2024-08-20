import React, { useEffect, useState, useCallback } from 'react';
import { Card, Form, FormControl, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ImageList = () => {
    const [images, setImages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [imageSrcs, setImageSrcs] = useState({}); 
    const navigate = useNavigate();

    const apiUrl = process.env.REACT_APP_API_URL;

    const fetchImage = useCallback(async (file_id) => {
        try {
            if (!file_id) {
                console.error('Invalid file_id:', file_id);
                return null;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return null;
            }

            const response = await axios.get(`${apiUrl}/images/${file_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                responseType: 'blob'
            });
            return URL.createObjectURL(response.data); 
        } catch (error) {
            console.error('Error fetching image:', error);
            return null;
        }
    }, [apiUrl]);

    const fetchImages = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            const response = await axios.get(`${apiUrl}/images`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setImages(response.data);

            response.data.forEach(async (image) => {
                if (image.file_id) {  
                    const src = await fetchImage(image.file_id); 
                    setImageSrcs(prev => ({ ...prev, [image.file_id]: src }));
                } else {
                    console.error('Invalid file_id:', image.file_id);
                }
            });

        } catch (error) {
            console.error('Error fetching images:', error);
        }
    }, [apiUrl, fetchImage]);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const handleSearch = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            const response = await axios.get(`${apiUrl}/search?q=${searchTerm}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setImages(response.data);

            response.data.forEach(async (image) => {
                if (image.file_id) {  
                    const src = await fetchImage(image.file_id);
                    setImageSrcs(prev => ({ ...prev, [image.file_id]: src }));
                } else {
                    console.error('Invalid file_id:', image.file_id);
                }
            });

        } catch (error) {
            console.error('Error searching images:', error);
        }
    };

    const deleteImage = async (file_id) => {
        try {
            if (!file_id || file_id === 'undefined') {
                console.error('Invalid file_id:', file_id);
                alert('Cannot delete image with invalid file_id');
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            await axios.delete(`${apiUrl}/images/${file_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setImages(images.filter(image => image.file_id !== file_id));
            setImageSrcs(prev => {
                const newSrcs = { ...prev };
                delete newSrcs[file_id];
                return newSrcs;
            });
            alert('Image deleted successfully');
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Failed to delete image');
        }
    };

    const handleViewDetails = (file_id) => {
        navigate(`/images/${file_id}`);
    };

    return (
        <div className="container mt-5">
            <Form inline="true" className="mb-3">
                <FormControl
                    type="text"
                    placeholder="Search images"
                    className="mr-sm-2"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-success" onClick={handleSearch}>검색</Button>
            </Form>
            <div className="row">
                {images.map((image) => (
                    <div className="col-md-4" key={image._id}>
                        <Card className="mb-4">
                            <Card.Img 
                                variant="top" 
                                src={imageSrcs[image.file_id] || '/path/to/placeholder.png'} 
                                alt={image.title || 'Image'} 
                            />
                            <Card.Body>
                                <Card.Title>{image.title || 'Untitled'}</Card.Title>
                                {/* 줄바꿈을 반영하기 위해 white-space: pre-line 적용 */}
                                <Card.Text style={{ whiteSpace: 'pre-line' }}>
                                    {image.interpretation || 'No description available'}
                                </Card.Text>
                                <Button 
                                    variant="primary" 
                                    onClick={() => handleViewDetails(image.file_id)} 
                                >
                                    상세보기
                                </Button>
                                <Button variant="danger" onClick={() => deleteImage(image.file_id)}>삭제</Button>
                            </Card.Body>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageList;
