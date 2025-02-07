import React from "react";
import { Routes, Route } from "react-router-dom";
import NavbarComponent from "./NavbarComponent";
import ProductManagement from "./ProductManagement";
import TransactionManagement from "./TransactionManagement";
import SalesAnalysis from "./SalesAnalysis";
import UsersManagement from "./UserManagement";
import Login from "./Login";
import Footer from "./Footer";
import ProductCategoryManagement from "./CategoryManagement";
import SupplierManagement from "./SupplierManagement";

const Dashboard = () => {
  return (
    <div style={{ width: '100vw' }}>
      <NavbarComponent />

      <div style={{ width: "100%", padding: "0", margin: "0" }}>
        <Routes>
          <Route path="/" element={<SalesAnalysis />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="category" element={<ProductCategoryManagement/>} />
          <Route path="supplier" element={<SupplierManagement />} />
          <Route path="transactions" element={<TransactionManagement />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="login" element={<Login />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
