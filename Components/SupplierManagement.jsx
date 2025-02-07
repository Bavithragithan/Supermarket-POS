import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Table, Alert } from "react-bootstrap";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { app } from "../Config/firebaseConfig";

const db = getFirestore(app);

const SupplierManagement = () => {
    const [supplierName, setSupplierName] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [address, setAddress] = useState("");
    const [suppliers, setSuppliers] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [updateSupplierId, setUpdateSupplierId] = useState(null);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "suppliers"));
                const supplierList = [];
                querySnapshot.forEach((doc) => {
                    supplierList.push({ id: doc.id, ...doc.data() });
                });
                setSuppliers(supplierList);
            } catch (err) {
                console.error("Error fetching suppliers: ", err);
                setErrorMessage("Failed to load suppliers. Please try again.");
            }
        };

        fetchSuppliers();
    }, []);

    const handleAddSupplier = async (e) => {
        e.preventDefault();

        if (supplierName && contactNumber && address) {
            try {
                await addDoc(collection(db, "suppliers"), {
                    name: supplierName,
                    contactNumber,
                    address
                });

                setSupplierName("");
                setContactNumber("");
                setAddress("");

                const querySnapshot = await getDocs(collection(db, "suppliers"));
                const supplierList = [];
                querySnapshot.forEach((doc) => {
                    supplierList.push({ id: doc.id, ...doc.data() });
                });
                setSuppliers(supplierList);
            } catch (err) {
                console.error("Error adding supplier: ", err);
                setErrorMessage("Failed to add supplier. Please try again.");
            }
        } else {
            setErrorMessage("Please provide the supplier name, contact number, and address.");
        }
    };

    const handleDeleteSupplier = async (id) => {
        try {
            await deleteDoc(doc(db, "suppliers", id));

            const querySnapshot = await getDocs(collection(db, "suppliers"));
            const supplierList = [];
            querySnapshot.forEach((doc) => {
                supplierList.push({ id: doc.id, ...doc.data() });
            });
            setSuppliers(supplierList);
        } catch (err) {
            console.error("Error deleting supplier: ", err);
            setErrorMessage("Failed to delete supplier. Please try again.");
        }
    };

    return (
        <Container fluid className="p-4">
            <h2 className="text-center text-primary mb-4">Supplier Management</h2>

            {errorMessage && (
                <Alert variant="danger" className="text-center mb-4">{errorMessage}</Alert>
            )}

            <Row className="mb-4">
                <Col md={12}>
                    <Card className="shadow-lg border-primary">
                        <Card.Body>
                            <h5 className="text-center text-primary mb-4">Add Supplier</h5>
                            <Form onSubmit={handleAddSupplier}>
                                <Form.Group className="mb-3" controlId="formSupplierName">
                                    <Form.Label>Supplier Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter supplier name"
                                        value={supplierName}
                                        onChange={(e) => setSupplierName(e.target.value)}
                                        className="border-primary"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formContactNumber">
                                    <Form.Label>Contact Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter contact number"
                                        value={contactNumber}
                                        onChange={(e) => setContactNumber(e.target.value)}
                                        className="border-primary"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formAddress">
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="border-primary"
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit" className="w-100">
                                    Add Supplier
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={12}>
                    <Card className="shadow-lg border-primary table-responsive">
                        <Card.Body>
                            <h5 className="text-center text-primary mb-4">Supplier List</h5>
                            <Table striped bordered hover responsive variant="light">
                                <thead className="table-primary">
                                    <tr>
                                        <th>Supplier Name</th>
                                        <th>Contact Number</th>
                                        <th>Address</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {suppliers.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center text-muted">
                                                No suppliers available
                                            </td>
                                        </tr>
                                    ) : (
                                        suppliers.map((supplier) => (
                                            <tr key={supplier.id}>
                                                <td>{supplier.name}</td>
                                                <td>{supplier.contactNumber}</td>
                                                <td>{supplier.address}</td>
                                                <td>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDeleteSupplier(supplier.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default SupplierManagement;
