import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Table, Alert } from "react-bootstrap";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut } from "firebase/auth";
import { app } from "../Config/firebaseConfig";
import "./../Styles/user.css";

const db = getFirestore(app);
const auth = getAuth(app);

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [userId, setUserId] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "users"));
                const userList = [];
                querySnapshot.forEach((doc) => {
                    userList.push({ id: doc.id, ...doc.data() });
                });
                setUsers(userList);
            } catch (err) {
                console.error("Error fetching users: ", err);
                setErrorMessage("Failed to load users. Please try again.");
            }
        };

        fetchUsers();

        onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
            }
        });
    }, []);

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (email && password && name) {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                await updateProfile(user, { displayName: name });

                const docRef = await addDoc(collection(db, "users"), {
                    userId: user.uid,
                    name,
                    email,
                    role,
                });

                const newUser = {
                    id: docRef.id,
                    userId: user.uid,
                    name,
                    email,
                    role,
                };

                setUsers((prevUsers) => [...prevUsers, newUser]);

                setSuccessMessage("User added successfully!");
                setEmail("");
                setPassword("");
                setName("");
                setRole("user");
            } catch (err) {
                console.error("Error adding user: ", err);
                setErrorMessage("Failed to add user. Please try again.");
            }
        } else {
            setErrorMessage("Please fill in all the fields.");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                const userRef = doc(db, "users", userId);
                await deleteDoc(userRef);

                const user = users.find(user => user.userId === userId);
                if (user && user.email !== currentUser?.email) {
                    const userToDelete = await signInWithEmailAndPassword(auth, user.email, user.password);
                    await userToDelete.user.delete();
                }

                fetchUsers();
            } catch (err) {
                console.error("Error deleting user: ", err);
                setErrorMessage("Failed to delete user. Please try again.");
            }
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, { role: newRole });
            setSuccessMessage("User role updated successfully!");
            fetchUsers();
        } catch (err) {
            console.error("Error updating role: ", err);
            setErrorMessage("Failed to update user role. Please try again.");
        }
    };

    return (
        <Container fluid className="p-4">
            <h2 className="text-center text-primary mb-4">User Management</h2>

            {errorMessage && (
                <Alert variant="danger" className="text-center mb-4">{errorMessage}</Alert>
            )}

            {successMessage && (
                <Alert variant="success" className="text-center mb-4">{successMessage}</Alert>
            )}

            <Row className="mb-4">
                <Col md={12} sm={12}>
                    <Card className="shadow-lg border-primary">
                        <Card.Body>
                            <h5 className="text-center text-primary mb-4">Add New User</h5>
                            <Form onSubmit={handleAddUser}>
                                <Form.Group className="mb-3" controlId="formName">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="border-primary"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="border-primary"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="border-primary"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formRole">
                                    <Form.Label>Role</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="border-primary"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </Form.Control>
                                </Form.Group>

                                <Button variant="primary" type="submit" className="w-100">
                                    Add User
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={12} sm={12}>
                    <Card className="shadow-lg border-primary">
                        <Card.Body>
                            <h5 className="text-center text-primary mb-4">User List</h5>
                            <Table striped bordered hover responsive variant="light">
                                <thead className="table-primary">
                                    <tr>
                                        <th>User ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.userId}</td>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <Button
                                                    variant="info"
                                                    onClick={() => handleRoleChange(user.id, user.role === "user" ? "admin" : "user")}
                                                >
                                                    Change Role
                                                </Button>
                                            </td>
                                            <td>
                                                <Button
                                                    variant="danger"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default UserManagementPage;
