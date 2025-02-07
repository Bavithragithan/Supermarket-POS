import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Table, Alert } from "react-bootstrap";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { app } from "../Config/firebaseConfig"; 
import "./../Styles/Product.css";

const db = getFirestore(app);

const ProductCategoryManagement = () => {
    const [categoryName, setCategoryName] = useState("");
    const [categories, setCategories] = useState([]);
    const [errorMessage, setErrorMessage] = useState(""); 
    const [updateCategoryId, setUpdateCategoryId] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "categories"));
                const categoryList = [];
                querySnapshot.forEach((doc) => {
                    categoryList.push({ id: doc.id, ...doc.data() });
                });
                setCategories(categoryList);
            } catch (err) {
                console.error("Error fetching categories: ", err);
                setErrorMessage("Failed to load categories. Please try again.");
            }
        };

        fetchCategories();
    }, []);

    const handleAddCategory = async (e) => {
        e.preventDefault();

        if (categoryName) {
            try {
                await addDoc(collection(db, "categories"), {
                    name: categoryName
                });

                setCategoryName("");

                const querySnapshot = await getDocs(collection(db, "categories"));
                const categoryList = [];
                querySnapshot.forEach((doc) => {
                    categoryList.push({ id: doc.id, ...doc.data() });
                });
                setCategories(categoryList);
            } catch (err) {
                console.error("Error adding category: ", err);
                setErrorMessage("Failed to add category. Please try again.");
            }
        } else {
            setErrorMessage("Please provide a category name.");
        }
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();

        if (updateCategoryId && categoryName) {
            try {
                const categoryRef = doc(db, "categories", updateCategoryId);
                await updateDoc(categoryRef, {
                    name: categoryName
                });

                setUpdateCategoryId(null);
                setCategoryName("");

                const querySnapshot = await getDocs(collection(db, "categories"));
                const categoryList = [];
                querySnapshot.forEach((doc) => {
                    categoryList.push({ id: doc.id, ...doc.data() });
                });
                setCategories(categoryList);
            } catch (err) {
                console.error("Error updating category: ", err);
                setErrorMessage("Failed to update category. Please try again.");
            }
        } else {
            setErrorMessage("Please provide a category name to update.");
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            await deleteDoc(doc(db, "categories", id));

            const querySnapshot = await getDocs(collection(db, "categories"));
            const categoryList = [];
            querySnapshot.forEach((doc) => {
                categoryList.push({ id: doc.id, ...doc.data() });
            });
            setCategories(categoryList);
        } catch (err) {
            console.error("Error deleting category: ", err);
            setErrorMessage("Failed to delete category. Please try again.");
        }
    };

    return (
        <Container fluid className="p-4">
            <h2 className="text-center text-primary mb-4">Product Category Management</h2>

            {errorMessage && (
                <Alert variant="danger" className="text-center mb-4">{errorMessage}</Alert>
            )}

            <Row className="mb-4">
                <Col md={12}>
                    <Card className="shadow-lg border-primary">
                        <Card.Body>
                            <h5 className="text-center text-primary mb-4">
                                {updateCategoryId ? "Update Category" : "Add Category"}
                            </h5>
                            <Form onSubmit={updateCategoryId ? handleUpdateCategory : handleAddCategory}>
                                <Form.Group className="mb-3" controlId="formCategoryName">
                                    <Form.Label>Category Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter category name"
                                        value={categoryName}
                                        onChange={(e) => setCategoryName(e.target.value)}
                                        className="border-primary"
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit" className="w-100">
                                    {updateCategoryId ? "Update Category" : "Add Category"}
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
                            <h5 className="text-center text-primary mb-4">Category List</h5>
                            <Table striped bordered hover responsive variant="light">
                                <thead className="table-primary">
                                    <tr>
                                        <th>Category Name</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.length === 0 ? (
                                        <tr>
                                            <td colSpan="2" className="text-center text-muted">
                                                No categories available
                                            </td>
                                        </tr>
                                    ) : (
                                        categories.map((category) => (
                                            <tr key={category.id}>
                                                <td>{category.name}</td>
                                                <td>
                                                    <Button
                                                        variant="warning"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => {
                                                            setUpdateCategoryId(category.id);
                                                            setCategoryName(category.name);
                                                        }}
                                                    >
                                                        Update
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDeleteCategory(category.id)}
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

export default ProductCategoryManagement;
