import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Table, Button, Form, Modal, Image, Dropdown } from 'react-bootstrap';
import Header from './Header';
import '../styles/Button.css';
import '../styles/AdminPage.css';

const apiUrl = process.env.REACT_APP_API_URL;

function AdminPage({ authToken }) {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newInterpretation, setNewInterpretation] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageToShow, setImageToShow] = useState('');
  const [users, setUsers] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(`${apiUrl}/admin/images_with_users`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const sortedImages = response.data.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
        setImages(sortedImages);
        setFilteredImages(sortedImages);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${apiUrl}/admin/users`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchImages();
    fetchUsers();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [authToken]);

  const handleOpenModal = (image) => {
    setSelectedImage(image);
    setNewTitle(image.title || '');
    setNewInterpretation(image.interpretation || '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
    setNewTitle('');
    setNewInterpretation('');
  };

  const handleSaveInterpretation = async () => {
    if (selectedImage) {
      try {
        const response = await axios.put(`${apiUrl}/admin/images/${selectedImage._id}`, {
          title: newTitle,
          interpretation: newInterpretation,
          isNew: false
        }, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const updatedImage = response.data;
        setImages(images.map(image => image._id === updatedImage._id ? updatedImage : image));
        setFilteredImages(filteredImages.map(image => image._id === updatedImage._id ? updatedImage : image));
        handleCloseModal();
      } catch (error) {
        console.error('Error updating interpretation:', error);
      }
    }
  };

  const handleImageClick = (file_id) => {
    axios.get(`${apiUrl}/images/${file_id}`, {
        headers: {
            'Authorization': `Bearer ${authToken}`
        },
        responseType: 'blob'
    })
    .then(response => {
        const url = URL.createObjectURL(new Blob([response.data]));
        setImageToShow(url);
        setShowImageModal(true);
    })
    .catch(error => {
        console.error('Error fetching image:', error);
    });
  };


  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setImageToShow('');
  };

  const filterByUser = (email) => {
    const userImages = images.filter(image => image.user_email === email)
      .sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
    setFilteredImages(userImages);
    setDropdownOpen(false);
  };

  const showAllImages = () => {
    const sortedImages = [...images].sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
    setFilteredImages(sortedImages);
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <>
      <Header />
      <div className="content">
        <div className="dropdown-container" ref={dropdownRef}>
          <Dropdown show={dropdownOpen} onToggle={toggleDropdown}>
            <Dropdown.Toggle variant="primary" id="dropdown-basic" className="custom-dropdown-toggle" onClick={toggleDropdown}>
              Select User
            </Dropdown.Toggle>

            <Dropdown.Menu className="custom-dropdown-menu">
              <Dropdown.Item onClick={showAllImages}>Show All Images</Dropdown.Item>
              {users.map(user => (
                <Dropdown.Item key={user._id} onClick={() => filterByUser(user.email)}>
                  {user.email}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <Table striped bordered hover className="image-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Image</th>
              <th>Upload Time</th>
              <th>Interpretation</th>
              <th>User Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredImages.map((image, index) => (
              <tr key={index} className={image.isNew ? 'new-image' : ''}>
                <td>{image._id}</td>
                <td>{image.title || "No Title"}</td>
                <td>
                  <div className="image-container">
                    <Image
                      src={`${apiUrl}/images/${image.file_id}`}
                      thumbnail
                      onClick={() => handleImageClick(image.file_id)}
                      style={{ cursor: 'pointer' }}
                    />
                    {image.isNew && <span className="new-badge">NEW</span>}
                  </div>
                </td>
                <td>{new Date(image.uploadTime).toLocaleString()}</td>
                <td>{image.interpretation}</td>
                <td>{image.user_email}</td> {/* user_email로 변경 */}
                <td><Button variant="secondary" onClick={() => handleOpenModal(image)}>Edit</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Image Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formTitle">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="formInterpretation" className="mt-3">
                <Form.Label>Interpretation</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={newInterpretation}
                  onChange={(e) => setNewInterpretation(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
            <Button variant="primary" onClick={handleSaveInterpretation}>Save changes</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showImageModal} onHide={handleCloseImageModal}>
          <Modal.Header closeButton>
            <Modal.Title>Image</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Image src={imageToShow} fluid />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseImageModal}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}

export default AdminPage;
