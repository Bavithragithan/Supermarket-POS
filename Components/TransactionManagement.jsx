import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Table, Alert } from "react-bootstrap";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { app } from "../Config/firebaseConfig"; 
import './../Styles/Transaction.css';

const db = getFirestore(app);

const TransactionPage = () => {
    const [products, setProducts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString());
    const [transactionItems, setTransactionItems] = useState([{ productID: "", quantity: 1 }]);
    const [discount, setDiscount] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [transactionId, setTransactionId] = useState(0); 

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

    const fetchTransactions = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "transactions"));
            const transactionList = [];
            querySnapshot.forEach((doc) => {
                transactionList.push({ id: doc.id, ...doc.data() });
            });
            setTransactions(transactionList);

            if (transactionList.length > 0) {
                setTransactionId(transactionList.length + 1);
            } else {
                setTransactionId(1);
            }
        } catch (err) {
            console.error("Error fetching transactions: ", err);
            setErrorMessage("Failed to load transactions. Please try again.");
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleAddProduct = () => {
        setTransactionItems([...transactionItems, { productID: "", quantity: 1 }]);
    };

    const handleRemoveProduct = (index) => {
        const updatedItems = transactionItems.filter((item, i) => i !== index);
        setTransactionItems(updatedItems);
    };

    const handleChange = (index, field, value) => {
        const updatedItems = [...transactionItems];
        updatedItems[index][field] = value;
        setTransactionItems(updatedItems);
    };

    const calculateTotalAmount = async () => {
        let amount = 0;

        for (let item of transactionItems) {
            const product = products.find((product) => product.id === item.productID);
            if (product) {
                amount += product.price * item.quantity;
            }
        }

        const finalAmount = amount - (amount * (discount / 100));
        setTotalAmount(finalAmount);
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();

        if (transactionItems.length > 0 && totalAmount > 0) {
            try {
                await addDoc(collection(db, "transactions"), {
                    transactionId,  
                    transactionDate: new Date(),
                    items: transactionItems,
                    discount,
                    totalAmount,
                });

                setTransactionId(transactionId + 1);

                setTransactionItems([{ productID: "", quantity: 1 }]);
                setDiscount(0);
                setTotalAmount(0);

                fetchTransactions();
            } catch (err) {
                console.error("Error adding transaction: ", err);
                setErrorMessage("Failed to add transaction. Please try again.");
            }
        } else {
            setErrorMessage("Please provide all transaction details.");
        }
    };

    const handleDeleteTransaction = async (transactionId) => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            try {
                const transactionRef = doc(db, "transactions", transactionId);
                await deleteDoc(transactionRef);

                fetchTransactions();
            } catch (err) {
                console.error("Error deleting transaction: ", err);
                setErrorMessage("Failed to delete transaction. Please try again.");
            }
        }
    };

    useEffect(() => {
        if (transactionItems.length > 0) {
            calculateTotalAmount();
        }
    }, [transactionItems, discount]);  

    return (
        <Container fluid className="p-4">
            <h2 className="text-center text-primary mb-4">Transaction Management</h2>

            {errorMessage && (
                <Alert variant="danger" className="text-center mb-4">{errorMessage}</Alert>
            )}

            <Row className="mb-4">
                <Col md={12}>
                    <Card className="shadow-lg border-primary">
                        <Card.Body>
                            <h5 className="text-center text-primary mb-4">Add New Transaction</h5>
                            <Form onSubmit={handleAddTransaction}>
                                <Form.Group className="mb-3" controlId="formTransactionDate">
                                    <Form.Label>Transaction Date & Time</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={new Date(transactionDate).toLocaleString()}
                                        disabled
                                        className="border-primary"
                                    />
                                </Form.Group>

                                {transactionItems.map((item, index) => (
                                    <Row key={index} className="mb-3">
                                        <Col md={5}>
                                            <Form.Label>Product</Form.Label>
                                            <Form.Control
                                                as="select"
                                                value={item.productID}
                                                onChange={(e) => handleChange(index, "productID", e.target.value)}
                                                className="border-primary"
                                            >
                                                <option value="">Select Product</option>
                                                {products.map((product) => (
                                                    <option key={product.id} value={product.id}>
                                                        {product.name} - {product.price} LKR
                                                    </option>
                                                ))}
                                            </Form.Control>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Label>Quantity</Form.Label>
                                            <Form.Control
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleChange(index, "quantity", e.target.value)}
                                                min="1"
                                                className="border-primary"
                                            />
                                        </Col>
                                        <Col md={2} className="align-self-end">
                                            <Button
                                                variant="danger"
                                                onClick={() => handleRemoveProduct(index)}
                                                className="w-100"
                                            >
                                                Remove
                                            </Button>
                                        </Col>
                                    </Row>
                                ))}

                                <Button variant="success" onClick={handleAddProduct} className="mb-3">
                                    Add Product
                                </Button>

                                <Form.Group className="mb-3" controlId="formDiscount">
                                    <Form.Label>Discount (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={discount}
                                        onChange={(e) => setDiscount(e.target.value)}
                                        min="0"
                                        max="100"
                                        className="border-primary"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formTotalAmount">
                                    <Form.Label>Total Amount (LKR)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={totalAmount}
                                        disabled
                                        className="border-primary"
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit" className="w-100">
                                    Add Transaction
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
                            <h5 className="text-center text-primary mb-4">Transaction List</h5>
                            <Table striped bordered hover responsive variant="light">
                                <thead className="table-primary">
                                    <tr>
                                        <th>Transaction ID</th>
                                        <th>Date & Time</th>
                                        <th>Items</th>
                                        <th>Total Amount</th>
                                        <th>Discount</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td>{transaction.transactionId}</td>
                                            <td>{new Date(transaction.transactionDate.seconds * 1000).toLocaleString()}</td>
                                            <td>
                                                {transaction.items.map((item, idx) => {
                                                    const product = products.find(p => p.id === item.productID);
                                                    return `${product ? product.name : "Unknown Product"} (x${item.quantity})${idx < transaction.items.length - 1 ? ', ' : ''}`;
                                                })}
                                            </td>
                                            <td>{transaction.totalAmount} LKR</td>
                                            <td>{transaction.discount}%</td>
                                            <td>
                                                <Button
                                                    variant="danger"
                                                    onClick={() => handleDeleteTransaction(transaction.id)}
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

export default TransactionPage;
