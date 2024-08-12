import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, Button } from 'react-bootstrap';

const ImageDetailPage = () => {  // 컴포넌트 이름을 ImageDetailPage로 수정
  const { file_id } = useParams(); // URL에서 file_id를 가져옵니다.
  const [image, setImage] = useState(null);
  const [imageSrc, setImageSrc] = useState('');

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

  if (!image) return <p>Loading...</p>;

  return (
    <div className="container mt-5">
      <Card>
        <Card.Img variant="top" src={imageSrc} alt={image.title || 'Image'} />
        <Card.Body>
          <Card.Title>{image.title || 'Untitled'}</Card.Title>
          <Card.Text>{image.interpretation || 'No description available'}</Card.Text>
          <Button variant="primary" href="/">Back to List</Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ImageDetailPage;
