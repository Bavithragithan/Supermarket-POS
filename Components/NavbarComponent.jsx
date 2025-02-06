import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { signOut } from "firebase/auth";
import { auth } from "../Config/firebaseConfig";
import useAuth from "./../hooks/useAuth";

const NavbarComponent = () => {
    const navigate = useNavigate();
    const user = useAuth();
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/dashboard/login");
        } catch (error) {
            console.error("Error logging out: ", error);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <Navbar bg="light" expand="lg" className="shadow w-100">
            <Container fluid>
                <Navbar.Brand className="text-primary">Super Market POS</Navbar.Brand>
                <Navbar.Toggle aria-controls="navbar-nav" />
                <Navbar.Collapse id="navbar-nav">
                    <Nav className="me-auto">
                        <Link className="nav-link" to="/dashboard">Home</Link>
                        <Link className="nav-link" to="/dashboard/products">Products</Link>
                        <Link className="nav-link" to="/dashboard/transactions">Transactions</Link>
                        <Link className="nav-link" to="/dashboard/users">Users</Link>
                    </Nav>
                    <Nav className="align-items-center">
                        <span className="me-3 fw-bold">
                            {currentDateTime.toLocaleString()}
                        </span>
                        <Button variant="danger" onClick={handleLogout}>
                            Logout
                        </Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavbarComponent;
