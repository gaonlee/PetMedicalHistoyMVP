// import React, { useEffect, useState, useCallback } from 'react';
// import axios from 'axios';
// import { Card, Form, FormControl, Button } from 'react-bootstrap';
// import { useNavigate } from 'react-router-dom';
// import '../styles/Button.css';
// import '../styles/ImageList.css';

// const apiUrl = process.env.REACT_APP_API_URL;

// function ImageList({ authToken }) {
//   const [images, setImages] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const navigate = useNavigate();

//   const fetchImages = useCallback(async () => {
//     console.log('Auth Token:', authToken);
//     try {
//       const response = await axios.get(`${apiUrl}/images`, {  
//         headers: {
//           'Authorization': `Bearer ${authToken}`
//         }
//       });
//       console.log('Fetched Images:', response.data);
//       setImages(response.data);
//     } catch (error) {
//       console.error('Error fetching images:', error);
//     }
//   }, [authToken]);

//   useEffect(() => {
//     fetchImages();
//   }, [fetchImages]);

//   const handleSearch = async (event) => {
//     event.preventDefault();
//     console.log(`Search query: ${searchQuery}`); 
//     if (!searchQuery.trim()) {
//       console.error('Search query is empty');
//       return;
//     }
//     try {
//       const response = await axios.get(`${apiUrl}/search`, {
//         params: { q: searchQuery },
//         headers: {
//           'Authorization': `Bearer ${authToken}`
//         }
//       });
//       console.log(response.data);
//       setImages(response.data);
//     } catch (error) {
//       console.error('Error searching images:', error);
//     }
//   };

//   const handleImageClick = (image) => {
//     if (image.file_id) {
//         console.log('Navigating to image with ID:', image.file_id);
//         navigate(`/images/${image.file_id}`);
//     } else {
//         console.error('File ID is missing for image:', image);
//     }
//   };

//   return (
//     <div className="image-list-container">
//       <Form onSubmit={handleSearch} className="form-inline search-form">
//         <FormControl
//           type="text"
//           placeholder="Search images"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//         <Button type="submit" variant="primary">검색</Button>
//       </Form>
//       <div className="image-list">
//         {images && images.length > 0 ? images.map((image, index) => (
//           <Card key={index} onClick={() => handleImageClick(image)} className="card">
//             {/* file_id가 존재하는 경우 file_id를 사용 */}
//             {image.file_id ? (
//               <>
//                 <Card.Img 
//                   variant="top" 
//                   src={`${apiUrl}/images/${image.file_id}`} 
//                   onError={(e) => {
//                     console.error(`Failed to load image with file_id: ${image.file_id}`, e);
//                   }} 
//                 />
//                 {console.log(`Requesting image with file_id: ${image.file_id}`)}
//               </>
//             ) : (
//               <>
//                 <Card.Img 
//                   variant="top" 
//                   src={`${apiUrl}/uploads/${image.filename}`} 
//                   onError={(e) => {
//                     console.error(`Failed to load image with filename: ${image.filename}`, e);
//                   }} 
//                 />
//                 {console.log(`Requesting image with filename: ${image.filename}`)}
//               </>
//             )}

//             <Card.Body className="card-body">
//               <Card.Title className="card-title">{image.title}</Card.Title>
//               <Card.Text className="card-text">{image.interpretation}</Card.Text>
//             </Card.Body>
//           </Card>
//         )) : (
//           <p>No images found</p>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ImageList;

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

    // 이미지를 가져오는 함수
    const fetchImage = useCallback(async (file_id) => {
        try {
            if (!file_id) {
                console.error('Invalid file_id:', file_id);
                return null;
            }

            const token = localStorage.getItem('token');  // 토큰 가져오기
            if (!token) {
                console.error('No token found');
                return null;
            }

            const response = await axios.get(`${apiUrl}/images/${file_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,  // 토큰 설정
                },
                responseType: 'blob'
            });
            return URL.createObjectURL(response.data); 
        } catch (error) {
            console.error('Error fetching image:', error);
            return null;
        }
    }, [apiUrl]);

    // 모든 이미지를 가져오는 함수
    const fetchImages = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');  // 토큰 가져오기
            if (!token) {
                console.error('No token found');
                return;
            }

            const response = await axios.get(`${apiUrl}/images`, {
                headers: {
                    Authorization: `Bearer ${token}`,  // 토큰 설정
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
            const token = localStorage.getItem('token');  // 토큰 가져오기
            if (!token) {
                console.error('No token found');
                return;
            }

            const response = await axios.get(`${apiUrl}/search?q=${searchTerm}`, {
                headers: {
                    Authorization: `Bearer ${token}`,  // 토큰 설정
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

            const token = localStorage.getItem('token');  // 토큰 가져오기
            if (!token) {
                console.error('No token found');
                return;
            }

            await axios.delete(`${apiUrl}/images/${file_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,  // 토큰 설정
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
                                <Card.Text>{image.interpretation || 'No description available'}</Card.Text>
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









