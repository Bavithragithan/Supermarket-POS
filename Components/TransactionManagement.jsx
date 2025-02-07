import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Table, Alert } from "react-bootstrap";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { app } from "../Config/firebaseConfig";
import jsPDF from 'jspdf';
import './../Styles/Transaction.css';

const db = getFirestore(app);

const TransactionPage = () => {
    const [products, setProducts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [users, setUsers] = useState([]);
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString());
    const [transactionItems, setTransactionItems] = useState([{ productID: "", quantity: 1 }]);
    const [discount, setDiscount] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [transactionId, setTransactionId] = useState(0);
    const [selectedUser, setSelectedUser] = useState("");

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

        fetchProducts();
        fetchUsers();
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

        if (transactionItems.length > 0 && totalAmount > 0 && selectedUser) {
            try {
                await addDoc(collection(db, "transactions"), {
                    transactionId,
                    transactionDate: new Date(),
                    items: transactionItems,
                    discount,
                    totalAmount,
                    userId: selectedUser,  // Save selected user
                });

                setTransactionId(transactionId + 1);

                setTransactionItems([{ productID: "", quantity: 1 }]);
                setDiscount(0);
                setTotalAmount(0);
                setSelectedUser("");  // Clear selected user after transaction is added

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

    const generateReceipt = () => {
        const doc = new jsPDF();
        const transaction = {
            date: new Date(transactionDate).toLocaleString(),
            items: transactionItems.map(item => {
                const product = products.find(p => p.id === item.productID);
                return { name: product ? product.name : "Unknown", quantity: item.quantity, price: product ? product.price : 0, total: item.quantity * (product ? product.price : 0) };
            }),
            discount,
            totalAmount
        };

        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("Supermarket POS", 105, 15, { align: "center" });

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Date & Time: ${transaction.date}`, 10, 30);

        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.rect(10, 40, 190, 100);

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Product Details", 105, 50, { align: "center" });


        let y = 60;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        transaction.items.forEach(item => {
            doc.text(`${item.name} (x${item.quantity})`, 15, y);
            doc.text(`${item.price} .00 * ${item.quantity}`, 130, y, { align: "right" });
            doc.text(`${item.total} .00`, 170, y, { align: "right" });
            y += 10;
        });

        y += 10;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`Discount: ${transaction.discount}%`, 15, y);
        doc.text(`Total Amount: ${transaction.totalAmount} LKR`, 15, y + 10);

        y += 20;
        doc.setFontSize(12);
        doc.setFont("helvetica", "italic");
        doc.text("Thank you for shopping with us!", 105, y, { align: "center" });

        doc.setLineWidth(0.5);
        doc.line(10, y + 10, 200, y + 10);

        const formattedDate = new Date(transactionDate)
            .toISOString()
            .replace(/T/, '_')
            .replace(/:/g, '-')
            .split('.')[0];

        doc.save(`receipt_${formattedDate}.pdf`);

    };

    const generateReceiptForTransaction = (transaction) => {
        const doc = new jsPDF();
        const transactionDetails = {
            date: new Date(transaction.transactionDate?.seconds * 1000).toLocaleString(),  // Convert Firestore timestamp to readable date
            items: transaction.items.map(item => {
                const product = products.find(p => p.id === item.productID);
                return { name: product ? product.name : "Unknown", quantity: item.quantity, price: product ? product.price : 0, total: item.quantity * (product ? product.price : 0) };
            }),
            discount: transaction.discount,
            totalAmount: transaction.totalAmount
        };

        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("Supermarket POS", 105, 15, { align: "center" });

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Date & Time: ${transactionDetails.date}`, 10, 30);

        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.rect(10, 40, 190, 100);

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Product Details", 105, 50, { align: "center" });

        let y = 60;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        transactionDetails.items.forEach(item => {
            doc.text(`${item.name} (x${item.quantity})`, 15, y);
            doc.text(`${item.price} .00 * ${item.quantity}`, 130, y, { align: "right" });
            doc.text(`${item.total} .00`, 170, y, { align: "right" });
            y += 10;
        });

        y += 10;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`Discount: ${transactionDetails.discount}%`, 15, y);
        doc.text(`Total Amount: ${transactionDetails.totalAmount} LKR`, 15, y + 10);

        y += 20;
        doc.setFontSize(12);
        doc.setFont("helvetica", "italic");
        doc.text("Thank you for shopping with us!", 105, y, { align: "center" });

        doc.setLineWidth(0.5);
        doc.line(10, y + 10, 200, y + 10);

        const formattedDate = new Date(transaction.transactionDate?.seconds * 1000)
            .toISOString()
            .replace(/T/, '_')
            .replace(/:/g, '-')
            .split('.')[0];

        doc.save(`receipt_${formattedDate}.pdf`);
    };




    const getUserName = (userId) => {
        const user = users.find(user => user.id === userId);
        return user ? user.name : "Unknown User";
    };

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

                                {/* Add User Selection */}
                                <Form.Group className="mb-3" controlId="formUser">
                                    <Form.Label>User</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={selectedUser}
                                        onChange={(e) => setSelectedUser(e.target.value)}
                                        className="border-primary"
                                    >
                                        <option value="">Select User</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </Form.Control>
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

                                        <Col md={2}>
                                            <Button
                                                variant="danger"
                                                onClick={() => handleRemoveProduct(index)}
                                                className="mt-3"
                                            >
                                                Remove
                                            </Button>
                                        </Col>
                                    </Row>
                                ))}

                                <Button
                                    variant="primary"
                                    onClick={handleAddProduct}
                                    className="mb-4"
                                >
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

                                <h5>Total Amount: {totalAmount} LKR</h5>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-100 mt-3"
                                >
                                    Add Transaction
                                </Button>


                                <Button
                                    variant="success"
                                    onClick={generateReceipt}
                                    className="w-100 mt-3"
                                >
                                    Generate Receipt
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <h5 className="text-center text-primary mb-4">Previous Transactions</h5>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Date</th>
                        <th>Products</th>
                        <th>Discount</th>
                        <th>Total Amount</th>
                        <th>Receipt</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {(transactions || []).map((transaction) => (
                        <tr key={transaction.id}>
                            <td>{transaction.transactionId}</td>
                            <td>{getUserName(transaction.userId) || "Unknown User"}</td>
                            <td>
                                {transaction.transactionDate?.seconds
                                    ? new Date(transaction.transactionDate.seconds * 1000).toLocaleString()
                                    : "N/A"}
                            </td>
                            <td>
                                {transaction.items.map((item, idx) => {
                                    const product = products.find(p => p.id === item.productID);
                                    return `${product ? product.name : "Unknown Product"} (x${item.quantity})${idx < transaction.items.length - 1 ? ', ' : ''}`;
                                })}
                            </td>
                            <td>{transaction.discount}%</td>
                            <td>{transaction.totalAmount} LKR</td>
                            <td>
                                <Button
                                    variant="info"
                                    onClick={() => generateReceiptForTransaction(transaction)}
                                >
                                    Download Receipt
                                </Button>
                            </td>
                            <td>
                                <Button variant="danger" onClick={() => handleDeleteTransaction(transaction.id)}>
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>


            </Table>


        </Container>
    );
};

export default TransactionPage;
