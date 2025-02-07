import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../Config/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigate('/dashboard');
      })
      .catch((err) => {
        let errorMessage = 'Login Failed: ' + err.message;

        if (err.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email format';
        } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          errorMessage = 'Incorrect email or password';
        }

        setError(errorMessage);
        setShowModal(true);
      });
  };

  const closeModal = () => setShowModal(false);

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{ backgroundColor: 'white', paddingLeft: '525px' }}
    >
      <div
        className="card shadow-lg p-4 w-100"
        style={{ maxWidth: '450px', borderRadius: '15px', backgroundColor: '#ffffff' }}
      >
        <h2 className="text-center mb-3 text-primary">Super Market POS</h2>
        <h3 className="text-center mb-4 text-primary">Login</h3>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control form-control-lg border-primary"
              id="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ color: 'black' }}
            />
          </div>

          <div className="mb-4">
            <input
              type="password"
              className="form-control form-control-lg border-primary"
              id="password"
              value={password}
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ color: 'black' }}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-100 mb-3">Login</button>
        </form>

        <label>Here I used firebase for authentication and store data</label>
        <label>Use: email as "skbavi1801@gmail.com" and password as "user@123"</label>
      </div>

      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Login Failed</Modal.Title>
        </Modal.Header>
        <Modal.Body>Invalid Email or Password</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Login;
