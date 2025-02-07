import React from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { Container, Row, Col, Card, Table } from "react-bootstrap";
import './../Styles/SalesAnalysis.css';

Chart.register(...registerables);

const SalesAnalysis = () => {
  const barChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Monthly Sales (in USD)",
        data: [5000, 7000, 8000, 6000, 9000, 11000],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  const doughnutChartData = {
    labels: ["Bread", "Anchor", "Milk", "Snacks"],
    datasets: [
      {
        data: [40, 25, 20, 15],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  return (
    <Container fluid className="px-0 mt-4">
      <h3 className="text-primary text-center mb-4">Sales Analysis Dashboard</h3>

      <Row className="mb-4">
        <Col xs={12} sm={6} md={4} className="mb-3">
          <Card className="text-white bg-primary mb-3">
            <Card.Body>
              <Card.Title>Total Sales</Card.Title>
              <Card.Text>45,000.00</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4} className="mb-3">
          <Card className="text-white bg-success mb-3">
            <Card.Body>
              <Card.Title>Top Product</Card.Title>
              <Card.Text>Apple</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4} className="mb-3">
          <Card className="text-white bg-danger mb-3">
            <Card.Body>
              <Card.Title>Lowest Month</Card.Title>
              <Card.Text>January</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xs={12} sm={6} md={6} lg={6} className="mb-4">
          <h5 className="text-center mb-3">Monthly Sales Overview</h5>
          <div className="shadow p-3 bg-white rounded">
            <Bar data={barChartData} options={{ responsive: true }} />
          </div>
        </Col>
        <Col xs={12} sm={6} md={6} lg={6} className="mb-4">
          <h5 className="text-center mb-3">Product Sales Distribution</h5>
          <div className="shadow p-3 bg-white rounded">
            <Doughnut data={doughnutChartData} options={{ responsive: true }} />
          </div>
        </Col>
      </Row>

      <h5 className="text-center mb-3">Sales Data by Month</h5>
      <div className="shadow p-4 bg-white rounded table-responsive">
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Month</th>
              <th>Sales (in LKR)</th>
              <th>Growth (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>January</td>
              <td>5,000</td>
              <td>10%</td>
            </tr>
            <tr>
              <td>February</td>
              <td>7,000</td>
              <td>40%</td>
            </tr>
            <tr>
              <td>March</td>
              <td>8,000</td>
              <td>14%</td>
            </tr>
            <tr>
              <td>April</td>
              <td>6,000</td>
              <td>-25%</td>
            </tr>
            <tr>
              <td>May</td>
              <td>9,000</td>
              <td>50%</td>
            </tr>
            <tr>
              <td>June</td>
              <td>11,000</td>
              <td>22%</td>
            </tr>
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default SalesAnalysis;
