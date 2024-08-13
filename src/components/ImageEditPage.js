import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';

const ImageEditPage = () => {
  const { file_id } = useParams();
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchImageDetail = async () => {
      try {
        const response = await axios.get(`${apiUrl}/images/${file_id}/details`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setImage(response.data);
        setTitle(response.data.title || '');
        setInterpretation(response.data.interpretation || '');
      } catch (error) {
        console.error('Error fetching image details:', error);
      }
    };

    fetchImageDetail();
  }, [file_id, apiUrl]);

  const handleSave = async () => {
    try {
      await axios.put(`${apiUrl}/images/${file_id}`, {
        title,
        interpretation,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      navigate(`/images/${file_id}`); // 수정 후 상세 조회 페이지로 이동
    } catch (error) {
      console.error('Error saving image details:', error);
    }
  };

  const handleBackToDetail = () => {
    navigate(`/images/${file_id}`); // 상세 조회 페이지로 이동
  };

  if (!image) return <p>Loading...</p>;

  return (
    <div className="container mt-5">
      <h2>Edit Image</h2>
      <Form>
        <Form.Group controlId="formTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
        </Form.Group>
        <Form.Group controlId="formInterpretation" className="mt-3">
          <Form.Label>Interpretation</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={5} 
            value={interpretation} 
            onChange={(e) => setInterpretation(e.target.value)} 
          />
        </Form.Group>
        <div className="d-flex justify-content-end">
          <Button variant="secondary" onClick={handleBackToDetail} className="mr-2 mt-3">
            뒤로가기
          </Button>
          <Button variant="primary" onClick={handleSave} className="mt-3">
            수정완료
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ImageEditPage;
