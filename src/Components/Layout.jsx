// src/Components/Layout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom'; // Import Outlet
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <>
      <Navbar />
      <main>
        {/* Child routes will be rendered here */}
        <Outlet /> 
      </main>
      <Footer />
    </>
  );
};

export default Layout;