import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Button } from 'react-bootstrap';

const ImageDetailPage = () => {
  const { file_id } = useParams(); // URL에서 file_id를 가져옵니다.
  const [image, setImage] = useState(null);
  const [imageSrc, setImageSrc] = useState('');
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchImageDetail = async () => {
      try {
        const response = await axios.get(`${apiUrl}/images/${file_id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          responseType: 'blob'  // 이미지를 직접 불러오기 위해 필요
        });

        const imageData = URL.createObjectURL(response.data); // Blob을 객체 URL로 변환
        setImageSrc(imageData);
        
        // 이미지의 다른 데이터를 가져오기
        const imageDetailResponse = await axios.get(`${apiUrl}/images/${file_id}/details`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setImage(imageDetailResponse.data);
      } catch (error) {
        console.error('Error fetching image detail:', error);
      }
    };

    fetchImageDetail();
  }, [file_id, apiUrl]);

  const handleBackToList = () => {
    navigate('/list'); // 이미지 조회 페이지로 이동
  };

  const handleEdit = () => {
    navigate(`/images/${file_id}/edit`); // 수정 페이지로 이동
  };

  if (!image) return <p>Loading...</p>;

  return (
    <div className="container mt-5">
      <Card>
        <Card.Img variant="top" src={imageSrc} alt={image.title || 'Image'} />
        <Card.Body>
          <Card.Title>{image.title || 'Untitled'}</Card.Title>
          {/* 줄바꿈이 반영되도록 white-space 스타일 적용 */}
          <Card.Text style={{ whiteSpace: 'pre-line' }}>
            {image.interpretation || 'No description available'}
          </Card.Text>
          <div className="d-flex justify-content-end">
            {/* 버튼 크기 조정 및 스타일 수정 */}
            <Button variant="secondary" onClick={handleBackToList} className="mr-2">
              나가기
            </Button>
            <Button variant="primary" onClick={handleEdit}>
              수정하기
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ImageDetailPage;
