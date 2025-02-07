import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Table, Alert } from "react-bootstrap";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { app } from "../Config/firebaseConfig"; 
import "./../Styles/Product.css";

const db = getFirestore(app);

const ProductManagement = () => {
    const [productName, setProductName] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [productCategory, setProductCategory] = useState("");
    const [productStock, setProductStock] = useState("");
    const [productSupplier, setProductSupplier] = useState("");
    const [products, setProducts] = useState([]);
    const [errorMessage, setErrorMessage] = useState(""); 
    const [updateProductId, setUpdateProductId] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                const productList = [];
                querySnapshot.forEach((doc) => {
                    productList.push({ id: doc.id, ...doc.data() });
                });
                setProducts(productList);
            } catch (err) {
                console.error("Error fetching products: ", err);
                setErrorMessage("Failed to load products. Please try again.");
            }
        };

        fetchProducts();
    }, []);

    const handleAddProduct = async (e) => {
        e.preventDefault();

        if (productName && productPrice && productCategory && productStock && productSupplier) {
            try {
                await addDoc(collection(db, "products"), {
                    name: productName,
                    price: parseFloat(productPrice),
                    category: productCategory,
                    stock: productStock ? parseInt(productStock) : 0,
                    supplier: productSupplier
                });

                setProductName("");
                setProductPrice("");
                setProductCategory("");
                setProductStock("");
                setProductSupplier("");

                const querySnapshot = await getDocs(collection(db, "products"));
                const productList = [];
                querySnapshot.forEach((doc) => {
                    productList.push({ id: doc.id, ...doc.data() });
                });
                setProducts(productList);
            } catch (err) {
                console.error("Error adding product: ", err);
                setErrorMessage("Failed to add product. Please try again.");
            }
        } else {
            setErrorMessage("Please provide all product details.");
        }
    };


    const handleUpdateProduct = async (e) => {
        e.preventDefault();

        if (updateProductId && productName && productPrice && productCategory && productStock) {
            try {
                const productRef = doc(db, "products", updateProductId);
                await updateDoc(productRef, {
                    name: productName,
                    price: parseFloat(productPrice),
                    category: productCategory,
                    stock: productStock ? parseInt(productStock) : 0,
                    supplier: productSupplier
                });

                setUpdateProductId(null);
                setProductName("");
                setProductPrice("");
                setProductCategory("");
                setProductStock("");
                setProductSupplier("");

                const querySnapshot = await getDocs(collection(db, "products"));
                const productList = [];
                querySnapshot.forEach((doc) => {
                    productList.push({ id: doc.id, ...doc.data() });
                });
                setProducts(productList);
            } catch (err) {
                console.error("Error updating product: ", err);
                setErrorMessage("Failed to update product. Please try again.");
            }
        } else {
            setErrorMessage("Please provide all product details to update.");
        }
    };


    const handleDeleteProduct = async (id) => {
        try {
            await deleteDoc(doc(db, "products", id));

            const querySnapshot = await getDocs(collection(db, "products"));
            const productList = [];
            querySnapshot.forEach((doc) => {
                productList.push({ id: doc.id, ...doc.data() });
            });
            setProducts(productList);
        } catch (err) {
            console.error("Error deleting product: ", err);
            setErrorMessage("Failed to delete product. Please try again.");
        }
    };

    return (
        <Container fluid className="p-4">
            <h2 className="text-center text-primary mb-4">Product Management</h2>

            {errorMessage && (
                <Alert variant="danger" className="text-center mb-4">{errorMessage}</Alert>
            )}

            <Row className="mb-4">
                <Col md={12}>
                    <Card className="shadow-lg border-primary">
                        <Card.Body>
                            <h5 className="text-center text-primary mb-4">
                                {updateProductId ? "Update Product" : "Add Product"}
                            </h5>
                            <Form onSubmit={updateProductId ? handleUpdateProduct : handleAddProduct}>
                                <Form.Group className="mb-3" controlId="formProductName">
                                    <Form.Label>Product Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter product name"
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                        className="border-primary"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formProductCategory">
                                    <Form.Label>Product Category</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter product category"
                                        value={productCategory}
                                        onChange={(e) => setProductCategory(e.target.value)}
                                        className="border-primary"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formProductPrice">
                                    <Form.Label>Product Price (LKR)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter product price"
                                        value={productPrice}
                                        onChange={(e) => setProductPrice(e.target.value)}
                                        className="border-primary"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formProductStock">
                                    <Form.Label>Stock Quantity</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter stock quantity"
                                        value={productStock}
                                        onChange={(e) => setProductStock(e.target.value)}
                                        className="border-primary"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formProductSupplier">
                                    <Form.Label>Supplier Name / Brand</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter supplier name or brand name"
                                        value={productSupplier}
                                        onChange={(e) => setProductSupplier(e.target.value)}
                                        className="border-primary"
                                    />
                                </Form.Group>



                                <Button variant="primary" type="submit" className="w-100">
                                    {updateProductId ? "Update Product" : "Add Product"}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={12}>
                    <Card className="shadow-lg border-primary">
                        <Card.Body>
                            <h5 className="text-center text-primary mb-4">Product List</h5>
                            <Table striped bordered hover responsive variant="light">
                                <thead className="table-primary">
                                    <tr>
                                        <th>Product Name</th>
                                        <th>Price (LKR)</th>
                                        <th>Category</th>
                                        <th>Stock</th>
                                        <th>Supplier</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center text-muted">
                                                No products available
                                            </td>
                                        </tr>
                                    ) : (
                                        products.map((product) => (
                                            <tr key={product.id}>
                                                <td>{product.name}</td>
                                                <td>{product.price} LKR</td>
                                                <td>{product.category}</td>
                                                <td>{product.stock}</td>
                                                <td>{product.supplier}</td>
                                                <td>
                                                    <Button
                                                        variant="warning"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => {
                                                            setUpdateProductId(product.id);
                                                            setProductName(product.name);
                                                            setProductPrice(product.price);
                                                            setProductCategory(product.category);
                                                            setProductStock(product.stock);
                                                            setProductSupplier(product.supplier);
                                                        }}
                                                    >
                                                        Update
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDeleteProduct(product.id)}
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

export default ProductManagement;
