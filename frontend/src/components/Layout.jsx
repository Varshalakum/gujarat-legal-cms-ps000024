import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export const Layout = () => {
  return (
    <div className="app-shell-layout">
      <Navbar />
      <div className="app-workspace-body">
        <Sidebar />
        <main className="app-content-stage">
          <Outlet />
        </main>
      </div>
      <footer className="app-bottom-footer">
        <p>
          &copy; {new Date().getFullYear()} Legal Department, Government of Gujarat.
          All rights reserved. Official Portal for Government Litigation &amp; Advocate Fee Disbursement.
        </p>
      </footer>
    </div>
  );
};

export default Layout;
